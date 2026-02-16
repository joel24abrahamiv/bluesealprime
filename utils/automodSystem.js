const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { BOT_OWNER_ID } = require("../config");

// ───── IN-MEMORY CACHE ─────
const spamMap = new Map(); // Key: userId, Value: { count, lastMsg, timer }
const MENTIONS_LIMIT = 5;

// ───── BAD WORDS LIST ─────
const ORIGINAL_BAD_WORDS = [
    "nigger", "faggot", "chink", "kike", "dyke", "tranny",
    "potta", "thevidiya", "dvd", "ommala", "kuthi", "koothi", "otha", "pool", "poolu", "oka", "okara", "okaporen", "thevidiyaaaa", "thevidiyaa", "thevidiyaaa",
    "punda", "okalaoli", "oombu",
    "fuck", "shit", "bitch", "ass", "damn", "nude", "porn", "sex", "xxx", "onlyfans",
    "kys", "killyourself", "goddie", "youshoulddie", "ihateyou", "gobacktoyour", "youpeopleare", "allofyouare", "suck"
];

// ───── SCAM LINKS ─────
const SCAM_KEYWORDS = [
    "freenitro", "discordgift", "steamgift", "claimnow", "limitedoffer", "clickhere", "bitly", "tinyurl", "t.me", "giveawayended", "gift.com"
];

async function checkAutomod(message, client) {
    if (!message.guild || message.author.bot) return;

    // 1. BYPASS CHECKS
    // Note: Discord prevents bots from timing out the Server Owner. We can only delete their messages.
    if (message.author.id === BOT_OWNER_ID) return;

    // Load Whitelist
    const WHITELIST_DB = path.join(__dirname, "../data/whitelist.json");
    let whitelist = [];
    if (fs.existsSync(WHITELIST_DB)) {
        try {
            const wlData = JSON.parse(fs.readFileSync(WHITELIST_DB, "utf8"));
            whitelist = wlData[message.guild.id] || [];
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
    const normalized = content.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
        .replace(/[0oO]/g, "o")
        .replace(/[1iI!lL|]/g, "i")
        .replace(/[3eE]/g, "e")
        .replace(/[4aA@]/g, "a")
        .replace(/[5sS$]/g, "s")
        .replace(/[7tT]/g, "t")
        .replace(/[8bB]/g, "b")
        .replace(/[\W_]+/g, "");

    // ───── 2. ANTI-LINKS ─────
    if (settings.antiLinks) {
        const linkRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/[^\s]+)/ig;
        if (linkRegex.test(content)) {
            const allowedDomains = ["tenor.com", "giphy.com", "discord.com", "discord.gg", "youtube.com", "spotify.com"];
            const isAllowed = allowedDomains.some(domain => content.includes(domain));

            if (!isAllowed) {
                return handleViolation(message, "URL", "sending unauthorized links", "Warning");
            }
        }
    }

    // ───── 3. ANTI-BAD WORDS / SCAMS ─────
    if (settings.antiBadWords) {
        let foundWord = ORIGINAL_BAD_WORDS.find(word => normalized.includes(word));
        let foundScam = SCAM_KEYWORDS.find(word => normalized.includes(word));

        if (foundWord || foundScam) {
            const reason = foundScam ? `Scam Link Detected (${foundScam})` : `Profanity Detected (${foundWord})`;

            // Timeout logic
            try {
                if (message.member.moderatable) {
                    await message.member.timeout(5 * 60 * 1000, `Auto-Mod: ${reason}`);
                }
            } catch (e) { }

            return handleViolation(message, foundScam ? "Scam" : "Profanity", reason, "Timeout");
        }
    }

    // ───── 4. ANTI-MASS MENTIONS ─────
    if (settings.antiMassMentions) {
        if (message.mentions.users.size >= MENTIONS_LIMIT || message.mentions.roles.size >= 3) {
            return handleViolation(message, "Mass Mention", "mass pinging users", "Warning");
        }
    }

    // ───── 5. ANTI-SPAM ─────
    if (settings.antiSpam) {
        const userId = message.author.id;
        const now = Date.now();
        const userData = spamMap.get(userId) || { count: 0, lastMsg: now };

        if (now - userData.lastMsg < 2000) {
            userData.count++;
            userData.lastMsg = now;
        } else {
            userData.count = 1;
            userData.lastMsg = now;
        }

        spamMap.set(userId, userData);

        if (userData.count >= 5) {
            spamMap.delete(userId); // Reset to prevent infinite loop
            try {
                if (message.member.moderatable) {
                    await message.member.timeout(60 * 1000, "Auto-Mod: Spamming");
                }
            } catch (e) { }
            return handleViolation(message, "Spam", "spamming messages", "Timeout");
        }
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
