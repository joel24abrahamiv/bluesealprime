const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { BOT_OWNER_ID } = require("../config");

// ───── IN-MEMORY CACHE ─────
const spamMap = new Map(); // Key: userId, Value: { count, lastMsg, timer }
const MENTIONS_LIMIT = 3; // Lowered from 5 to 3

// ───── BAD WORDS LIST ─────
const ORIGINAL_BAD_WORDS = [
    "nigger", "faggot", "chink", "kike", "dyke", "tranny",
    "punda", "thevidiya", "ommala", "otha", "poolu", "koothi", "thevidiyaaaa",
    "fuck", "shit", "bitch", "ass", "damn", "nude", "porn", "sex", "xxx", "onlyfans",
    "kys", "killyourself", "goddie", "youshoulddie", "ihateyou",
    "discord.gg", "whore", "slut", "cunt", "rape", "pedo"
];

// ───── SCAM LINKS ─────
const SCAM_KEYWORDS = [
    "freenitro", "discordgift", "steamgift", "claimnow", "clickhere", "bitly", "tinyurl",
    "nitrogift", "freegift", "airdrop", "getfree", "getnitro", "t.me/", "paypal.me", "grabify"
];

async function checkAutomod(message, client) {
    if (!message.guild || message.author.bot) return;

    // 1. BYPASS CHECKS (OWNERS ONLY)
    const { BOT_OWNER_ID } = require("../config");
    const isBotOwner = message.author.id === BOT_OWNER_ID;
    const isServerOwner = message.author.id === message.guild.ownerId;

    // Check Extra Owners
    const OWNERS_DB = path.join(__dirname, "../data/owners.json");
    let extraOwners = [];
    if (fs.existsSync(OWNERS_DB)) {
        try {
            const db = JSON.parse(fs.readFileSync(OWNERS_DB, "utf8"));
            if (db[message.guild.id]) extraOwners = db[message.guild.id].map(o => typeof o === 'string' ? o : o.id);
        } catch (e) { }
    }
    const isOwner = isBotOwner || isServerOwner || extraOwners.includes(message.author.id);
    if (isOwner) return; // Absolute Immunity

    // Load Whitelist (both Global & Anti-Nuke)
    const WHITELIST_DB = path.join(__dirname, "../data/whitelist.json");
    const ANTINUKE_DB = path.join(__dirname, "../data/antinuke.json");
    let whitelist = [];
    if (fs.existsSync(WHITELIST_DB)) {
        try {
            const wlData = JSON.parse(fs.readFileSync(WHITELIST_DB, "utf8"));
            whitelist.push(...(wlData[message.guild.id] || []));
        } catch (e) { }
    }
    if (fs.existsSync(ANTINUKE_DB)) {
        try {
            const anData = JSON.parse(fs.readFileSync(ANTINUKE_DB, "utf8"));
            whitelist.push(...(anData[message.guild.id]?.whitelisted || []));
        } catch (e) { }
    }
    if (whitelist.includes(message.author.id)) return;

    // Load Config
    const AUTOMOD_DB = path.join(__dirname, "../data/automod.json");
    let settings = { antiLinks: true, antiSpam: true, antiBadWords: true, antiMassMentions: true };
    if (fs.existsSync(AUTOMOD_DB)) {
        try {
            const db = JSON.parse(fs.readFileSync(AUTOMOD_DB, "utf8"));
            if (db[message.guild.id]) settings = { ...settings, ...db[message.guild.id] };
        } catch (e) { }
    }

    const content = message.content.trim();

    // ───── HYPER-NORMALIZATION ─────
    // 1. Decruft recurring chars (e.g. f u u u c k -> fuck)
    const cleanContent = content.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/(.)\1+/g, "$1"); // Reduce repeats (ooo -> o)

    // 2. Leet speak to standard
    const normalized = cleanContent
        .replace(/[0oO]/g, "o")
        .replace(/[1iI!lL|]/g, "i")
        .replace(/[3eE]/g, "e")
        .replace(/[4aA@]/g, "a")
        .replace(/[5sS$]/g, "s")
        .replace(/[7tT]/g, "t")
        .replace(/[8bB]/g, "b")
        .replace(/[\W_]+/g, ""); // Keep alphanumeric

    // ───── 2. ANTI-LINKS ─────
    if (settings.antiLinks) {
        const linkRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/ig;
        if (linkRegex.test(content)) {
            const allowedDomains = ["tenor.com", "giphy.com", "discord.com", "discord.gg", "youtube.com", "spotify.com"];
            const isAllowed = allowedDomains.some(domain => content.includes(domain));
            if (!isAllowed) return handleViolation(message, "URL", "unauthorized links", "Warning");
        }
    }

    // ───── 3. ANTI-BAD WORDS / SCAMS ─────
    if (settings.antiBadWords) {
        // Double Check: Exact matches + Normalized matches
        const wordsInContent = content.toLowerCase().split(/\s+/);
        let foundWord = ORIGINAL_BAD_WORDS.find(word => normalized.includes(word) || wordsInContent.includes(word));
        let foundScam = SCAM_KEYWORDS.find(word => normalized.includes(word));

        if (foundWord || foundScam) {
            const reason = foundScam ? `Scam Link (${foundScam})` : `Profanity (${foundWord})`;
            return punishViolation(message, foundScam ? "Scam" : "Profanity", reason);
        }
    }

    // ───── 4. ANTI-MASS MENTIONS ─────
    if (settings.antiMassMentions) {
        if (message.mentions.users.size >= MENTIONS_LIMIT || message.mentions.roles.size >= 3) {
            return punishViolation(message, "Mass Mention", "mass pinging");
        }
    }

    // ───── 5. ANTI-SPAM ─────
    if (settings.antiSpam) {
        const userId = message.author.id;
        const now = Date.now();
        const userData = spamMap.get(userId) || { count: 0, lastMsg: now, firstMsg: now };

        // Tuned: 4 messages in 3 seconds triggers punishment
        if (now - userData.lastMsg < 3000) {
            userData.count++;
            userData.lastMsg = now;
        } else {
            userData.count = 1;
            userData.lastMsg = now;
            userData.firstMsg = now;
        }
        spamMap.set(userId, userData);

        if (userData.count >= 4) { // Lowered from 5 to 4
            spamMap.delete(userId);
            return punishViolation(message, "Spam", "message flooding");
        }
    }
}

async function punishViolation(message, type, reason) {
    const { PermissionsBitField, EmbedBuilder } = require("discord.js");
    const isStaff = message.member.permissions.has(PermissionsBitField.Flags.ManageMessages) || message.member.permissions.has(PermissionsBitField.Flags.Administrator);

    try {
        if (message.deletable) await message.delete().catch(() => { });

        // AESTHETIC REQ: Use Blue #0099ff for all V2 containers
        const blue = "#0099ff";

        if (isStaff) {
            // 🚨 SOVEREIGN ENFORCEMENT: STRIP ROLES
            if (message.member.manageable) {
                await message.member.roles.set([], `Protocol: AutoMod Violation (${type})`).catch(() => { });

                // DM THE DOER (V2)
                const V2 = require("./v2Utils");
                await message.member.send({
                    content: null,
                    flags: V2.flag,
                    components: [V2.container([
                        V2.heading("🚨 SECURITY CLEARANCE REVOKED", 2),
                        V2.text(`**Protocol violation detected in ${message.guild.name}.**\nYour roles have been stripped due to unauthorized activity.`),
                        V2.separator(),
                        V2.heading("ℹ️ REASON", 3),
                        V2.text(`Module: **AutoMod (${type})**\nViolation: **${reason}**`),
                        V2.separator(),
                        V2.text(`*Accountability is absolute. The System does not forgive.*`)
                    ], "#FF0000")]
                }).catch(() => { });

                return handleViolation(message, type, `${reason} [STAFF_PUNISHED]`, "Roles Stripped");
            }
        }

        // Standard Timeout for non-staff
        if (message.member.moderatable) {
            await message.member.timeout(5 * 60 * 1000, `AutoMod: ${reason}`).catch(() => { });
            return handleViolation(message, type, reason, "5m Timeout");
        }

        return handleViolation(message, type, reason, "Warning");

    } catch (e) {
        console.error("Punishment Error:", e);
    }
}

async function handleViolation(message, type, reason, actionTaken) {
    try {
        if (message.deletable) await message.delete().catch(() => { });

        const blueColor = "#0099FF";

        // 1. USER ALERT
        const alertEmbed = new EmbedBuilder()
            .setColor(blueColor)
            .setTitle(`${type} Detected`)
            .setDescription(
                `🟦 **${message.author.username}**, please stop.\n` +
                `> Reason: **${reason}**\n` +
                `> Action: **${actionTaken}**`
            )
            .setFooter({ text: "BlueSealPrime • Auto-Mod" });

        const alertMsg = await message.channel.send({ content: `${message.author}`, embeds: [alertEmbed] });
        setTimeout(() => alertMsg.delete().catch(() => { }), 5);

        // 2. LOG
        const logEmbed = new EmbedBuilder()
            .setColor(blueColor)
            .setTitle("🛡️ AUTO-MOD INTERVENTION")
            .addFields(
                { name: "👤 User", value: `${message.author} (\`${message.author.id}\`)`, inline: true },
                { name: "📍 Channel", value: `${message.channel}`, inline: true },
                { name: "⚖️ Violation", value: reason, inline: true },
                { name: "🔨 Action", value: actionTaken, inline: true }
            )
            .setTimestamp();

        // Helper to find log channel (basic implementation if logToChannel not available here)
        // Ideally we pass the 'logToChannel' function or require it, but for now we look for '🛡-security-alerts'
        const logChannel = message.guild.channels.cache.find(c => c.name === "🛡-security-alerts" || c.name === "automod-logs");
        if (logChannel) logChannel.send({ embeds: [logEmbed] }).catch(() => { });

    } catch (e) {
        console.error("AutoMod Violation Error:", e);
    }
}

module.exports = { checkAutomod };
