const CacheManager = require("./cacheManager");
const { BOT_OWNER_ID } = require("../config");
const { EmbedBuilder } = require("discord.js");

// ───── IN-MEMORY CACHE ─────
const spamMap = new Map(); // Key: userId, Value: { count, lastMsg, timer }
const MENTIONS_LIMIT = 3;

// ───── BAD WORDS LIST ─────
const ORIGINAL_BAD_WORDS = [
    "nigger", "faggot", "chink", "kike", "dyke", "tranny",
    "punda", "thevidiya", "ommala", "otha", "poolu", "koothi", "thevidiyaaaa",
    "fuck", "shit", "bitch", "ass", "damn", "nude", "porn", "sex", "xxx", "onlyfans",
    "kys", "killyourself", "goddie", "youshoulddie", "ihateyou",
    "whore", "slut", "cunt", "rape", "pedo"
];

const SCAM_KEYWORDS = [
    "freenitro", "discordgift", "steamgift", "claimnow", "clickhere", "bitly", "tinyurl",
    "nitrogift", "freegift", "airdrop", "getfree", "getnitro", "t.me/", "paypal.me", "grabify"
];

async function checkAutomod(message, client, isWhitelisted = false) {
    if (!message.guild || message.author.bot) return false;

    const isBotOwner = message.author.id === BOT_OWNER_ID;
    const isServerOwner = message.author.id === message.guild.ownerId;

    // Load Config from Cache (Sub-millisecond)
    const allSettings = CacheManager.get("automod.json");
    const defaults = {
        status: true,
        antiLinks: true,
        antiSpam: true,
        antiBadWords: true,
        antiMassMentions: true,
        antiInvite: true,
        warningsLimit: 3,
        timeoutDuration: 15,
        ignoredRoles: [],
        ignoredChannels: []
    };

    let settings = { ...defaults, ...(allSettings[message.guild.id] || {}) };
    if (!settings.status) return false;

    // Bypasses
    const member = message.member || await message.guild.members.fetch(message.author.id).catch(() => null);
    if (!member) return false;

    const isIgnoredRole = settings.ignoredRoles.some(id => member.roles.cache.has(id));
    const isIgnoredChannel = settings.ignoredChannels.includes(message.channel.id);

    // Core bypasses
    if (isBotOwner || isServerOwner || isWhitelisted || isIgnoredRole || isIgnoredChannel) return false;

    const content = message.content.trim();
    const cleanContent = content.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
        .replace(/(.)\1+/g, "$1");

    const normalized = cleanContent
        .replace(/[0oO]/g, "o")
        .replace(/[1iI!lL|]/g, "i")
        .replace(/[3eE]/g, "e")
        .replace(/[4aA@]/g, "a")
        .replace(/[5sS$]/g, "s")
        .replace(/[7tT]/g, "t")
        .replace(/[8bB]/g, "b")
        .replace(/[\W_]+/g, "");

    // 1. ANTI-INVITE
    if (settings.antiInvite) {
        const inviteRegex = /(discord\.gg\/|discord\.com\/invite\/|discordapp\.com\/invite\/)/ig;
        if (inviteRegex.test(content)) {
            return punishViolation(message, "Invite Link", "advertising unauthorized invites", settings);
        }
    }

    // 2. ANTI-LINKS
    if (settings.antiLinks) {
        const linkRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/ig;
        if (linkRegex.test(content)) {
            const allowedDomains = ["tenor.com", "giphy.com", "discord.com", "discord.gg", "youtube.com", "spotify.com"];
            const isAllowed = allowedDomains.some(domain => content.includes(domain));
            if (!isAllowed) return handleViolation(message, "URL", "unauthorized links", "Warning");
        }
    }

    // 3. ANTI-BAD WORDS
    if (settings.antiBadWords) {
        const wordsInContent = content.toLowerCase().split(/\s+/);
        let foundWord = ORIGINAL_BAD_WORDS.find(word => normalized.includes(word) || wordsInContent.includes(word));
        let foundScam = SCAM_KEYWORDS.find(word => normalized.includes(word));

        if (foundWord || foundScam) {
            const reason = foundScam ? `Scam Link (${foundScam})` : `Profanity (${foundWord})`;
            return punishViolation(message, foundScam ? "Scam" : "Profanity", reason, settings);
        }
    }

    // 4. ANTI-MASS MENTIONS
    if (settings.antiMassMentions) {
        if (message.mentions.users.size >= MENTIONS_LIMIT || message.mentions.roles.size >= 3) {
            return punishViolation(message, "Mass Mention", "mass pinging", settings);
        }
    }

    // 5. ANTI-SPAM
    if (settings.antiSpam) {
        const userId = message.author.id;
        const now = Date.now();
        const userData = spamMap.get(userId) || { count: 0, lastMsg: now, firstMsg: now };

        if (now - userData.lastMsg < 3000) {
            userData.count++;
            userData.lastMsg = now;
        } else {
            userData.count = 1;
            userData.lastMsg = now;
            userData.firstMsg = now;
        }
        spamMap.set(userId, userData);

        if (userData.count >= 4) {
            spamMap.delete(userId);
            return punishViolation(message, "Spam", "message flooding", settings);
        }
    }
}

async function punishViolation(message, type, reason, settings) {
    try {
        if (message.deletable) await message.delete().catch(() => { });

        // Warning system could be expanded here, for now we follow the 'timeout' or 'strip' logic
        if (message.member.moderatable) {
            const duration = (settings.timeoutDuration || 15) * 60 * 1000;
            await message.member.timeout(duration, `AutoMod: ${reason}`).catch(() => { });
            return handleViolation(message, type, reason, `${settings.timeoutDuration}m Timeout`);
        }

        return handleViolation(message, type, reason, "Warning");
    } catch (e) {
        console.error("Punishment Error:", e);
    }
}

async function handleViolation(message, type, reason, actionTaken) {
    try {
        const V2 = require("./v2Utils");
        const botPFP = message.client.user.displayAvatarURL({ size: 512 });

        const alertContainer = V2.container([
            V2.section([
                V2.heading(`⚠️ ${type} Detected`, 2),
                V2.text(`**${message.author.username}**, please stop.\n> **Reason:** ${reason}\n> **Action:** ${actionTaken}`)
            ], botPFP),
            V2.separator(),
            V2.text("*BlueSealPrime • Auto-Mod System*")
        ], "#0099FF");

        await message.channel.send({
            content: `${message.author}`,
            flags: V2.flag,
            components: [alertContainer]
        }).catch(() => { });

        // Logging logic exists in handleViolation if needed, keeping it simple
    } catch (e) {
        console.error("AutoMod Violation Error:", e);
    }
}

module.exports = { checkAutomod };

module.exports = { checkAutomod };
