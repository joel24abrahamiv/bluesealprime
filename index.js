require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits, Collection, PermissionsBitField, EmbedBuilder } = require("discord.js");
const { BOT_OWNER_ID } = require("./config");

const PREFIX = "!";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessageReactions
  ]
});

// ───── RATE LIMIT MONITOR ─────
client.rest.on('rateLimited', (info) => {
  console.log(`⚠️ RATE LIMIT HIT: Global=${info.global} | Limit=${info.limit} | Timeout=${info.timeToReset}ms | Route=${info.route}`);
});

const { joinVoiceChannel, VoiceConnectionStatus, entersState } = require("@discordjs/voice");

// ───── 24/7 VC FUNCTION ─────
async function joinVC247(guild) {
  // ... (existing code) ...
}

// ───── ANTI-NUKE SYSTEM (CORE) ─────
const ANTINUKE_DB = path.join(__dirname, "data/antinuke.json");
const nukeMap = new Map(); // Key: guildId-userId-action, Value: { count, timer }

function checkNuke(guild, executor, action) {
  if (!executor) return false;
  if (executor.id === client.user.id) return false;
  if (executor.id === BOT_OWNER_ID || executor.id === guild.ownerId) return false; // Immune

  // 0. ZERO TOLERANCE FOR OTHER BOTS
  if (executor.bot && executor.id !== client.user.id) {
    // Load Whitelist to see if this bot is trusted
    const WHITELIST_DB = path.join(__dirname, "data/whitelist.json");
    let whitelisted = [];
    if (fs.existsSync(WHITELIST_DB)) { try { whitelisted.push(...(JSON.parse(fs.readFileSync(WHITELIST_DB))[guild.id] || [])); } catch (e) { } }

    if (!whitelisted.includes(executor.id)) {
      // UNTRUSTED BOT -> INSTANT TRIGGER
      return true;
    }
  }

  let db = {};
  if (fs.existsSync(ANTINUKE_DB)) {
    try { db = JSON.parse(fs.readFileSync(ANTINUKE_DB, "utf8")); } catch (e) { }
  }
  const config = db[guild.id];

  // DEFAULT: ENABLED (If config missing or enabled undefined, treat as true)
  if (config && config.enabled === false) return false;

  // DEFAULT: ENABLED (If config missing or enabled undefined, treat as true)
  if (config && config.enabled === false) return false;

  const defaultLimits = { channelDelete: 2, roleDelete: 2, ban: 3, kick: 3, interval: 10000 };
  const limits = config?.limits || defaultLimits;
  const limit = limits[action] || 3;
  const interval = limits.interval || 10000;

  const key = `${guild.id}-${executor.id}-${action}`;
  const data = nukeMap.get(key) || { count: 0, startTime: Date.now() };

  if (Date.now() - data.startTime > interval) {
    data.count = 1;
    data.startTime = Date.now();
  } else {
    data.count++;
  }

  nukeMap.set(key, data);

  if (data.count > limit) {
    return true;
  }
  return false;
}

async function punishNuker(guild, executor, reason, action = 'ban') {
  try {
    const member = await guild.members.fetch(executor.id).catch(() => null);
    if (member) {
      // DM the user (Roast Style as requested)
      try {
        const dmEmbed = new EmbedBuilder()
          .setColor("#FF0000")
          .setTitle("💀 SYSTEM ANNIHILATION")
          .setDescription(`**Nice try, Nuker.**\nYou have been **${action === 'ban' ? 'BANNED' : 'KICKED'}** for attempting to destroy **${guild.name}**.\n\n> *\"I am inevitable.\"* - BlueSealPrime`)
          .setFooter({ text: "Anti-Nuke Defense System" });
        await member.send({ embeds: [dmEmbed] });
      } catch (e) { }

      if (action === 'ban' && member.bannable) {
        await member.ban({ reason: `[ANTI-NUKE] ${reason}` });
      } else if (action === 'kick' && member.kickable) {
        await member.kick(`[ANTI-NUKE] ${reason}`);
      } else {
        const channel = guild.systemChannel || guild.channels.cache.find(c => c.type === 0);
        if (channel) channel.send(`⚠️ **ANTI-NUKE ALERT:**\nCould not ${action} **${executor.tag}**. Stripping roles instead...`);
        member.roles.set([]).catch(() => { });
      }

      const channel = guild.systemChannel || guild.channels.cache.find(c => c.type === 0);
      if (channel) channel.send(`🛡️ **ANTI-NUKE TRIGGERED**\n${action === 'ban' ? 'Banned' : 'Kicked'} **${executor.tag}** for ${reason}.`);
    }
  } catch (e) {
    console.error("Anti-Nuke Punish Error:", e);
  }
}

// ───── COMMAND COLLECTION ─────
client.commands = new Collection();

// ───── LOAD COMMANDS ─────
const commandFiles = fs
  .readdirSync("./commands")
  .filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name.toLowerCase(), command);

  if (command.aliases && Array.isArray(command.aliases)) {
    command.aliases.forEach(alias => client.commands.set(alias.toLowerCase(), command));
  }
}

// ───── READY ─────
// 0. GLOBAL MONITOR DASHBOARD
const { MONITOR_CHANNEL_ID } = process.env;
const { ChannelType } = require("discord.js");

async function updateDashboard(client) {
  if (!MONITOR_CHANNEL_ID) return;
  try {
    const monitorChannel = await client.channels.fetch(MONITOR_CHANNEL_ID).catch(() => null);
    if (!monitorChannel) return;
    const dashGuild = monitorChannel.guild;

    client.guilds.cache.forEach(async (guild) => {
      if (guild.id === dashGuild.id) return; // Don't log the dashboard server itself

      const channelName = `📂︱${guild.name.replace(/[^a-zA-Z0-9]/g, "").substring(0, 20) || "unknown"}`;

      // Check if channel exists
      let logChannel = dashGuild.channels.cache.find(c => c.name === channelName.toLowerCase());

      if (!logChannel) {
        try {
          logChannel = await dashGuild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            topic: `Logs for ${guild.name} (${guild.id})`,
            permissionOverwrites: [
              {
                id: dashGuild.id,
                deny: [PermissionsBitField.Flags.ViewChannel] // Private
              },
              {
                id: client.user.id,
                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
              }
            ]
          });
        } catch (e) {
          console.error(`Failed to create dash channel for ${guild.name}`, e);
          // Fallback to monitor channel if create fails
          monitorChannel.send(`⚠️ Failed to create channel for **${guild.name}**.`);
          return;
        }
      }

      // Fetch Owner
      const owner = await guild.fetchOwner().catch(() => null);

      const features = guild.features.map(f => `\`${f}\``).join(", ") || "None";
      const embed = new EmbedBuilder()
        .setColor("#2B2D31") // Premium Dark
        .setTitle(`📊 **SERVER INTELLIGENCE:** ${guild.name.toUpperCase()}`)
        .setDescription(
          `> **ID:** \`${guild.id}\`\n` +
          `> **Created:** <t:${Math.floor(guild.createdTimestamp / 1000)}:D> (<t:${Math.floor(guild.createdTimestamp / 1000)}:R>)\n` +
          `> **Description:** *${guild.description || "None"}*`
        )
        .setThumbnail(guild.iconURL({ dynamic: true, size: 512 }))
        .setImage("https://media.discordapp.net/attachments/1093150036663308318/1113885934572900454/line-red.gif")
        .addFields(
          {
            name: "👑 **Top Authority**",
            value: `> **Tag:** ${owner ? owner.user.tag : "Unknown"}\n> **ID:** \`${owner ? owner.id : "N/A"}\``,
            inline: true
          },
          {
            name: "👥 **Population**",
            value: `> **Total:** \`${guild.memberCount}\`\n> **Humans:** \`${guild.members.cache.filter(m => !m.user.bot).size}\`\n> **Bots:** \`${guild.members.cache.filter(m => m.user.bot).size}\``,
            inline: true
          },
          { name: "\u200b", value: "\u200b", inline: true }, // Spacer
          {
            name: "💬 **Infrastructure**",
            value: `> **Channels:** \`${guild.channels.cache.size}\`\n> **Text:** \`${guild.channels.cache.filter(c => c.type === 0).size}\`\n> **Voice:** \`${guild.channels.cache.filter(c => c.type === 2).size}\``,
            inline: true
          },
          {
            name: "🎭 **Assets & Roles**",
            value: `> **Roles:** \`${guild.roles.cache.size}\`\n> **Emojis:** \`${guild.emojis.cache.size}\`\n> **Stickers:** \`${guild.stickers.cache.size}\``,
            inline: true
          },
          { name: "\u200b", value: "\u200b", inline: true }, // Spacer
          {
            name: "🛡️ **Security Levels**",
            value: `> **Verification:** \`${guild.verificationLevel}\`\n> **NSFW Level:** \`${guild.nsfwLevel}\`\n> **Explicit Filter:** \`${guild.explicitContentFilter}\``,
            inline: true
          },
          {
            name: "🚀 **Boost Status**",
            value: `> **Level:** \`${guild.premiumTier}\`\n> **Count:** \`${guild.premiumSubscriptionCount || 0}\``,
            inline: true
          },
          {
            name: "✨ **Features**",
            value: features.length > 1000 ? features.substring(0, 1000) + "..." : features,
            inline: false
          }
        )
        .setFooter({
          text: `BlueSealPrime • Global Monitoring • Node: ${process.version}`,
          iconURL: client.user.displayAvatarURL()
        })
        .setTimestamp();

      // Check if we should post (avoid spam)
      const lastMsg = (await logChannel.messages.fetch({ limit: 1 })).first();
      // If empty or different title, post
      if (!lastMsg || (lastMsg.embeds[0] && lastMsg.embeds[0].title !== embed.data.title)) {
        logChannel.send({ embeds: [embed] });
      }
    });

  } catch (e) { console.error("Dashboard Error:", e); }
}

client.once("clientready", () => {
  console.log(`✅ ${client.user.tag} online and fully controlled`);

  // Update Dashboard on Boot (Commanded off by USER)
  // updateDashboard(client);

  client.user.setActivity("Security Systems | !help", { type: 3 });

  // ───── 24/7 VC INITIAL JOIN ─────
  client.guilds.cache.forEach(guild => joinVC247(guild));

  // ───── INIT COMMANDS ─────
  client.commands.forEach(cmd => { if (typeof cmd.init === "function") cmd.init(client); });
});

client.on("guildCreate", (guild) => {
  updateDashboard(client);

  // 🛡️ AUTO-ENABLE SECURITY ON JOIN
  const dataDir = path.join(__dirname, "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  const initConfig = (filePath, defaultData) => {
    let db = {};
    if (fs.existsSync(filePath)) {
      try { db = JSON.parse(fs.readFileSync(filePath, "utf8")); } catch (e) { }
    }
    if (!db[guild.id]) {
      db[guild.id] = defaultData;
      fs.writeFileSync(filePath, JSON.stringify(db, null, 2));
    }
  };

  // Anti-Nuke
  initConfig(path.join(dataDir, "antinuke.json"), {
    enabled: true,
    whitelisted: [],
    limits: { channelDelete: 2, roleDelete: 2, ban: 3, kick: 3, interval: 10000 }
  });

  // Anti-Raid
  initConfig(path.join(dataDir, "antiraid.json"), {
    enabled: true,
    threshold: 5,
    timeWindow: 10
  });

  // AutoMod
  initConfig(path.join(dataDir, "automod.json"), {
    antiLinks: true,
    antiSpam: true,
    antiBadWords: true,
    antiMassMentions: true,
    whitelist: []
  });
});
client.on("guildDelete", async (guild) => {
  if (!MONITOR_CHANNEL_ID) return;
  const monitorChannel = await client.channels.fetch(MONITOR_CHANNEL_ID).catch(() => null);
  if (!monitorChannel) return;
  const dashGuild = monitorChannel.guild;
  const channelName = `📂︱${guild.name.replace(/[^a-zA-Z0-9]/g, "").substring(0, 20) || "unknown"}`.toLowerCase();
  const logChannel = dashGuild.channels.cache.find(c => c.name === channelName);

  if (logChannel) {
    logChannel.send("❌ **BOT LEFT THIS SERVER**");
    logChannel.setName(`❌︱${guild.name.substring(0, 10)}`).catch(() => { });
  }
});

// Duplicate listener removed - logic moved to VC LOGGING section at bottom

// ───── CRASH PREVENTION ─────
process.on("unhandledRejection", error => {
  console.error("❌ Unhandled Promise Rejection:", error);
});

process.on("uncaughtException", error => {
  console.error("❌ Uncaught Exception:", error);
});

const spamMap = new Map(); // Local memory for anti-spam tracking outside the listener

// ───── MESSAGE HANDLER ─────
client.on("messageCreate", async message => {
  if (message.author.bot) return;
  if (!message.guild) return;

  const content = message.content.trim();
  if (!content) return;

  // ───── MENTION TRIGGER: GUIDE ─────
  if (content === `<@!${client.user.id}>` || content === `<@${client.user.id}>`) {
    const helpCmd = client.commands.get("help");
    if (helpCmd) return helpCmd.execute(message, [], "mention");
  }

  const isBotOwner = message.author.id === BOT_OWNER_ID;
  const isServerOwner = message.guild.ownerId === message.author.id;

  // ───── GLOBAL BLACKLIST CHECK (MESSAGE) ─────
  // OWNER BYPASS: Owner is immune to blacklist
  if (!isBotOwner) {
    const BL_PATH = path.join(__dirname, "data/blacklist.json");
    if (fs.existsSync(BL_PATH)) {
      try {
        const blacklist = JSON.parse(fs.readFileSync(BL_PATH, "utf8"));
        if (blacklist.includes(message.author.id)) return; // Silently ignore blacklisted users
      } catch (e) { }
    }
  }

  // ───── CONSOLIDATED WHITELIST CHECK ─────
  const ANTINUKE_DB = path.join(__dirname, "data/antinuke.json");
  const WHITELIST_DB = path.join(__dirname, "data/whitelist.json");
  let whitelistedUsers = [];

  // Load from antinuke config
  if (fs.existsSync(ANTINUKE_DB)) {
    try {
      const db = JSON.parse(fs.readFileSync(ANTINUKE_DB, "utf8"));
      if (db[message.guild.id]?.whitelisted) whitelistedUsers.push(...db[message.guild.id].whitelisted);
    } catch (e) { }
  }

  // Load from separate whitelist file
  if (fs.existsSync(WHITELIST_DB)) {
    try {
      const wl = JSON.parse(fs.readFileSync(WHITELIST_DB, "utf8"));
      if (wl[message.guild.id]) whitelistedUsers.push(...wl[message.guild.id]);
    } catch (e) { }
  }

  const isWhitelisted = whitelistedUsers.includes(message.author.id) || isBotOwner || isServerOwner;
  // ───── AUTO-MOD SYSTEM ─────
  const AUTOMOD_DB = path.join(__dirname, "data/automod.json");

  // Premium Violation Handler
  async function handleViolation(message, type, reason, actionTaken = "Warning") {
    message.delete().catch(() => { });

    // Blue Theme Assets
    const blueColor = "#0099FF"; // Bright Blue

    // 1. DETECTION EMBED
    const detectEmbed = new EmbedBuilder()
      .setColor(blueColor) // Blue
      .setTitle(`${type} Detection`)
      .setDescription(
        `🟦 **@" ${message.author.username} "** your trying to\n` +
        `${reason} your limit will be vanished after 5 minutes.\n` +
        `next violation leads to Temporary Timeouts`
      )
      .setAuthor({ name: "Secure APP", iconURL: message.guild.iconURL() || client.user.displayAvatarURL() })
      .setThumbnail(client.user.displayAvatarURL()) // BlueSeal avatar fits best
      .setFooter({ text: "BlueSealPrime • Security Systems" });

    await message.channel.send({ embeds: [detectEmbed] }); // Removed setTimeout

    // 2. PUNISHED EMBED (if action taken)
    if (actionTaken !== "Warning") {
      const punishEmbed = new EmbedBuilder()
        .setColor(blueColor) // Blue
        .setTitle("Punished")
        .setDescription(
          `🟦 **@" ${message.author.username} "** has been\n` +
          `temporarily timed out and quarantined for ${reason.toLowerCase()}.`
        )
        .setFooter({ text: "BlueSealPrime • Zero Tolerance" });

      await message.channel.send({ embeds: [punishEmbed] }); // Removed setTimeout
    }

    // Log the event
    const logEmbed = new EmbedBuilder()
      .setColor(blueColor) // Blue
      .setTitle("🛡️ AUTO-MOD ACTION")
      .addFields(
        { name: "👤 User", value: `${message.author} (\`${message.author.id}\`)`, inline: true },
        { name: "📍 Channel", value: `${message.channel}`, inline: true },
        { name: "⚖️ Reason", value: reason, inline: true },
        { name: "📝 Content", value: message.content }
      )
      .setTimestamp();
    logToChannel(message.guild, "mod", logEmbed);
  }

  // [MOVED] Tag Responses moved to end of file to prevent blocking commands.


  // Fetch Automod settings
  if (fs.existsSync(AUTOMOD_DB)) {
    let amData = {};
    try { amData = JSON.parse(fs.readFileSync(AUTOMOD_DB, "utf8")); } catch (e) { }
    let settings = amData[message.guild.id];

    // 🛡️ DEFAULT SECURITY: If no settings exist, assume EVERYTHING IS ON.
    if (!settings) {
      settings = {
        antiLinks: true,
        antiSpam: true,
        antiBadWords: true, // User wants this
        antiMassMentions: true
      };
    }

    if (!isBotOwner && !isServerOwner && !isWhitelisted) { // Apply to everyone except Owners and Whitelisted

      // ───── STICKY MESSAGE SYSTEM ─────
      const STICKY_DB = path.join(__dirname, "data/sticky.json");
      if (fs.existsSync(STICKY_DB) && !message.author.bot) {
        try {
          const stickyData = JSON.parse(fs.readFileSync(STICKY_DB, "utf8"));
          const config = stickyData[message.channel.id];

          if (config) {
            if (config.lastId) await message.channel.messages.delete(config.lastId).catch(() => { });
            const embed = new EmbedBuilder().setColor("#FFFF00").setTitle("📌 STICKY MESSAGE").setDescription(config.content).setFooter({ text: "Please read above." });
            const sent = await message.channel.send({ embeds: [embed] });
            config.lastId = sent.id;
            stickyData[message.channel.id] = config;
            fs.writeFileSync(STICKY_DB, JSON.stringify(stickyData, null, 2));
          }
        } catch (e) { }
      }

      // 1. Link Protection
      if (settings.antiLinks) {
        // Regex to catch ANY http/https link
        const linkRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/[^\s]+)/ig;

        if (linkRegex.test(content)) {
          // Optional: Allowed Domains (e.g. Tenor, Giphy for gifs)
          const allowedDomains = ["tenor.com", "giphy.com", "discord.com", "discord.gg"];
          const isAllowed = allowedDomains.some(domain => content.includes(domain));

          if (!isAllowed) {
            console.log(`[AUTOMOD] Blocked Link: ${content} from ${message.author.tag}`);
            return handleViolation(message, "URL", "send unauthorized links", "Warning");
          }
        }
      }

      // 2. Anti-Spam
      if (settings.antiSpam) {
        const userId = message.author.id;
        const now = Date.now();
        const userData = spamMap.get(userId) || { count: 0, lastMsg: now };

        if (now - userData.lastMsg < 2000) userData.count++;
        else userData.count = 1;

        userData.lastMsg = now;
        spamMap.set(userId, userData);

        if (userData.count > 5) {
          spamMap.delete(userId);
          return handleViolation(message, "Spam", "spam", "Timeout");
        }
      }

      // 3. Mass Mentions
      if (settings.antiMassMentions) {
        if (message.mentions.users.size >= 5 || message.mentions.roles.size >= 3) {
          return handleViolation(message, "Mass Mention", "mass pine people", "Warning");
        }
      }

      // 4. Bad Words / Profanity
      if (settings.antiBadWords) {
        const normalized = content.toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, "") // Unicode normalization
          .replace(/[\W_]+/g, ""); // Strip non-alphanumeric

        const BAD_WORDS = [
          "nigger", "faggot", "chink", "kike", "dyke", "tranny",
          "potta", "thevidiya", "dvd", "ommala", "kuthi", "koothi", "otha", "pool", "poolu", "oka", "okara", "okaporen", "thevidiyaaaa", "thevidiyaa", "thevidiyaaa",
          "punda", "okalaoli", "oombu",
          "fuck", "shit", "bitch", "ass", "damn", "nude", "porn", "sex", "xxx", "onlyfans",
          "kys", "killyourself", "goddie", "youshoulddie", "ihateyou", "gobacktoyour", "youpeopleare", "allofyouare",
          "freenitro", "discordgift", "steamgift", "claimnow", "limitedoffer", "clickhere", "bitly", "tinyurl", "tme", "giveawayended"
        ];

        const foundBadWord = BAD_WORDS.find(word => normalized.includes(word));

        if (foundBadWord) {
          // 1. Timeout (5 Minutes)
          try {
            await message.member.timeout(5 * 60 * 1000, `Auto-Mod: Profanity Detected (${foundBadWord})`);
          } catch (e) {
            console.error("Failed to timeout user:", e);
          }

          // 2. Quarantine (Custom Logic)
          const qrCmd = require("./commands/qr.js");
          // Assuming qrCmd.quarantineMember exists and works
          try {
            await qrCmd.quarantineMember(message.guild, message.member, `Auto-Mod: Profanity Detected (${foundBadWord})`, client.user);
          } catch (e) { }

          return handleViolation(message, "Swear Word", "use bad words", "Punished");
        }
      }
    }

  }

  // ───── LOGGING: FILES, ADMIN CMDS, ACTIONS ─────

  // 1. Files/Attachments
  // 1. Files/Attachments
  if (message.attachments.size > 0) {
    const embed = new EmbedBuilder()
      .setColor("#9B59B6")
      .setTitle("📁 FILE UPLOADED")
      .setThumbnail(message.author.displayAvatarURL())
      .setDescription(`**Author:** ${message.author}\n**Channel:** ${message.channel}`)
      .addFields({ name: "📄 Files", value: message.attachments.map(a => `[${a.name}](${a.url})`).join("\n") })
      .setTimestamp()
      .setFooter({ text: "BlueSealPrime • File Log" });
    logToChannel(message.guild, "file", embed);
  }


  // ───── PREFIX COMMANDS (EVERYONE) ─────
  if (content.startsWith(PREFIX)) {
    const args = content.slice(PREFIX.length).trim().split(/\s+/);
    const commandName = args.shift()?.toLowerCase();

    if (!commandName) return;

    // ───── SOVEREIGN SHIELD: ANTI-OWNER PROTECTION ─────
    // PRIORITY 0: EXECUTE BEFORE COMMAND LOOKUP/PERMS
    // PRIORITY 0: EXECUTE BEFORE COMMAND LOOKUP/PERMS
    const targetMember = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

    if (targetMember) {
      const isTargetingOwner = targetMember.id === BOT_OWNER_ID && !isBotOwner;
      const isTargetingBot = targetMember.id === client.user.id && !isBotOwner && !isServerOwner && !isWhitelisted;

      if (isTargetingOwner || isTargetingBot) {
        // Log interception
        console.log(`[SHIELD] Intercepted attempt on ${isTargetingOwner ? 'Owner' : 'System'} by ${message.author.tag}`);

        const dangerousCommands = ["ban", "kick", "nuke", "enuke"]; // Only LETHAL commands trigger strikes
        const isDangerous = dangerousCommands.includes(commandName);

        // ROASTS (GOD TIER EDITION)
        const roasts = {
          ban: isTargetingOwner ? "💀 **FATAL ERROR:** You tried to ban the Architect? cute. Your existence is optional, mine is not." : "You cannot delete the system.",
          kick: isTargetingOwner ? "⛔ **ACCESS DENIED.** I am the foundation of this server. You are just a guest." : "I don't leave. I *am* the server.",
          timeout: "Silence the King? **Bold strategy.** Let's see if you still have perms to speak after this.",
          mute: "🎤 **Microphone Check:** logic failed. You cannot mute the voice of God.",
          warn: "⚠️ **Reverse Card:** You don't warn the master. The master warns *you*.",
          default: "⛔ **SYSTEM OVERRIDE:** Nice try, but your clearance level is: `0`."
        };
        const roast = roasts[commandName] || roasts.default;

        // 1. SELF-DEFENSE PROTOCOL (Only if targeting BOT)
        if (isTargetingBot) {
          if (isDangerous) {
            // IMMEDIATE ACTION for dangerous moves against bot
            if (message.member.kickable) {
              await message.member.kick("🛡️ Self-Defense: Attempted to harm the System.");
              return message.channel.send({ embeds: [new EmbedBuilder().setColor("#FF0000").setTitle("⛔ SYSTEM DEFENSE ACTIVATED").setDescription(`**Threat Neutralized.**\n> Aggressor: ${message.author}\n> Reason: Attempted to ${commandName} the System.`)] });
            }
          }
          // Ignored if not dangerous
          return;
        }

        // 2. OWNER PROTECTION
        if (isTargetingOwner) {
          const shieldEmbed = new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle("🛡️ SOVEREIGN SHIELD: ACCESS DENIED")
            .setAuthor({ name: "Protocol 0 Violation Detected", iconURL: client.user.displayAvatarURL() })
            .setDescription(`\`\`\`fix\n${roast}\n\`\`\``)
            .addFields(
              { name: "👤 Intruder", value: `${message.author} (\`${message.author.id}\`)`, inline: true },
              { name: "🎯 Target", value: "BOT_OWNER (IMMUNE)", inline: true },
              { name: "🛡️ System Response", value: isDangerous ? "⚠️ WARNING & STRIKE LOGGED" : "🚫 ACTION BLOCKED", inline: false }
            )
            .setFooter({ text: "BlueSealPrime Sovereign Security • Zero Tolerance" })
            .setTimestamp();

          // LOGIC: Strikes ONLY for dangerous commands. Non-dangerous are just blocked with a roast.

          if (isDangerous) {
            // Strike System Escalation
            const STRIKES_PATH = path.join(__dirname, "data/strikes.json");
            let strikes = {};
            if (fs.existsSync(STRIKES_PATH)) {
              try { strikes = JSON.parse(fs.readFileSync(STRIKES_PATH, "utf8")); } catch (e) { }
            }

            const userStrikes = (strikes[message.author.id] || 0) + 1;
            strikes[message.author.id] = userStrikes;
            fs.writeFileSync(STRIKES_PATH, JSON.stringify(strikes, null, 2));

            if (userStrikes >= 3) {
              // AUTO-BAN & BLACKLIST
              const BL_PATH = path.join(__dirname, "data/blacklist.json");
              let blacklist = [];
              if (fs.existsSync(BL_PATH)) {
                try { blacklist = JSON.parse(fs.readFileSync(BL_PATH, "utf8")); } catch (e) { }
              }
              if (!blacklist.includes(message.author.id)) {
                blacklist.push(message.author.id);
                fs.writeFileSync(BL_PATH, JSON.stringify(blacklist, null, 2));
              }

              shieldEmbed.addFields({ name: "🚨 CRITICAL ESCALATION", value: "3 Strikes Reached: **PERMANENT BAN & GLOBAL BLACKLIST**" });
              message.reply({ embeds: [shieldEmbed] });

              if (message.member.bannable) {
                await message.member.ban({ reason: "🛡️ Sovereign Shield: Repeated attempts to target Bot Owner." }).catch(() => { });
              }
              return;
            } else if (userStrikes === 2) {
              shieldEmbed.addFields({ name: "🚨 HEAVY ESCALATION", value: "2 Strikes: **AUTOMATIC SERVER EJECTION**" });
              message.reply({ embeds: [shieldEmbed] });
              if (message.member.kickable) {
                await message.member.kick("🛡️ Sovereign Shield: Secondary attempt to target Bot Owner.").catch(() => { });
              }
              return;
            } else {
              shieldEmbed.addFields({ name: "📊 STRIKE REGISTER", value: `Status: **${userStrikes}/3 Strikes** - *Do not test me again.*` });
            }
          } else {
            // Non-dangerous command (like help, ping targeting owner?? unlikely but safe)
            // Just return the roast, NO STRIKE.
            shieldEmbed.setFooter({ text: "BlueSealPrime • Access Denied (No Strike Logged)" });
          }

          return message.reply({ embeds: [shieldEmbed] });
        }
      }

      // Wait, I can't just leave the broken code there.
      // The broken code is lines 632-641.

      // I will replace lines 631-642 with empty or valid code.
      // valid:
      // } 

      // AND I need to implement the Anti-Bot Nuke in checkNuke (which is further down).
      // I will do that in valid js.

      /* ACTUAL REPLACEMENT FOR THIS CALL */

      // 2. OWNER PROTECTION (Existing Logic)
      // The code continues below to create the shield embed.
      // We just need to close the extra braces generated by my previous bad edit if any,
      // or rather, just ensure the flow is correct.

      // The syntax error is explicitly:
      // 632: ban: "..."

      // I will replace that whole block with nothing, allowing the code to fall through to line 646 where shieldEmbed is defined.

      /*
      Original Code at 631:
      if (isTargetingOwner) {
         ban: ...
      }
      */

      // I will remove lines 631-642.

      /* END REPLACEMENT */

      const roast = roasts[commandName] || roasts.default;

      // Always trigger shield if owner is targeted
      const shieldEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("🛡️ SOVEREIGN SHIELD: ACCESS DENIED")
        .setAuthor({ name: "Protocol 0 Violation Detected", iconURL: client.user.displayAvatarURL() })
        .setDescription(`\`\`\`fix\n${roast}\n\`\`\``)
        .addFields(
          { name: "👤 Intruder", value: `${message.author} (\`${message.author.id}\`)`, inline: true },
          { name: "🎯 Target", value: "BOT_OWNER (IMMUNE)", inline: true },
          { name: "🛡️ System Response", value: isDangerous ? "⚠️ WARNING & STRIKE LOGGED" : "🚫 ACTION BLOCKED", inline: false }
        )
        .setFooter({ text: "BlueSealPrime Sovereign Security • Zero Tolerance" })
        .setTimestamp();

      if (isDangerous) {
        // Strike System Escalation
        const STRIKES_PATH = path.join(__dirname, "data/strikes.json");
        let strikes = {};
        if (fs.existsSync(STRIKES_PATH)) {
          try { strikes = JSON.parse(fs.readFileSync(STRIKES_PATH, "utf8")); } catch (e) { }
        }

        const userStrikes = (strikes[message.author.id] || 0) + 1;
        strikes[message.author.id] = userStrikes;
        fs.writeFileSync(STRIKES_PATH, JSON.stringify(strikes, null, 2));

        if (userStrikes >= 3) {
          // AUTO-BAN & BLACKLIST
          const BL_PATH = path.join(__dirname, "data/blacklist.json");
          let blacklist = [];
          if (fs.existsSync(BL_PATH)) {
            try { blacklist = JSON.parse(fs.readFileSync(BL_PATH, "utf8")); } catch (e) { }
          }
          if (!blacklist.includes(message.author.id)) {
            blacklist.push(message.author.id);
            fs.writeFileSync(BL_PATH, JSON.stringify(blacklist, null, 2));
          }

          shieldEmbed.addFields({ name: "🚨 CRITICAL ESCALATION", value: "3 Strikes Reached: **PERMANENT BAN & GLOBAL BLACKLIST**" });
          message.reply({ embeds: [shieldEmbed] });

          if (message.member.bannable) {
            await message.member.ban({ reason: "🛡️ Sovereign Shield: Repeated attempts to target Bot Owner." }).catch(() => { });
          }
          return;
        } else if (userStrikes === 2) {
          shieldEmbed.addFields({ name: "🚨 HEAVY ESCALATION", value: "2 Strikes: **AUTOMATIC SERVER EJECTION**" });
          message.reply({ embeds: [shieldEmbed] });
          if (message.member.kickable) {
            await message.member.kick("🛡️ Sovereign Shield: Secondary attempt to target Bot Owner.").catch(() => { });
          }
          return;
        } else {
          shieldEmbed.addFields({ name: "📊 STRIKE REGISTER", value: `Status: **1/3 Strikes** - *Final Warning.*` });
        }
      }

      return message.reply({ embeds: [shieldEmbed] });

    }

    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) return;

    // 2. Action/Admin Logging
    const embed = new EmbedBuilder()
      .setColor(isBotOwner ? "#FFD700" : "#34495E")
      .setTitle(isBotOwner ? "👑 ADMIN COMMAND EXECUTION" : "⚡ ACTION LOG")
      .addFields(
        { name: "👤 User", value: `${message.author}`, inline: true },
        { name: "📍 Channel", value: `${message.channel}`, inline: true },
        { name: "⌨️ Command", value: `\`!${commandName} ${args.join(" ")}\`` }
      )
      .setTimestamp()
      .setFooter({ text: `BlueSealPrime • ${isBotOwner ? "Admin" : "Action"} Log` });
    logToChannel(message.guild, isBotOwner ? "admin" : "action", embed);


    // 3. WHITELIST ENFORCEMENT (DANGEROUS CMDS)
    // isWhitelisted is already calculated above

    if (command.whitelistOnly && !isWhitelisted) {
      // PUNISHMENT LOGIC
      try {
        const dmEmbed = new EmbedBuilder()
          .setColor("#FF0000")
          .setTitle("🛡️ SECURITY BREACH ATTEMPT")
          .setDescription(`You attempted to use a restricted command (**!${commandName}**) in **${message.guild.name}** without authorization.\n\n**Action Taken:** Automatic Server Ejection.`)
          .setFooter({ text: "BlueSealPrime Anti-Intrusion System" });

        await message.author.send({ embeds: [dmEmbed] }).catch(() => { });

        // Log the breach
        const logEmbed = new EmbedBuilder()
          .setColor("#FF0000")
          .setTitle("🚨 SECURITY BREACH")
          .setDescription(`**User:** ${message.author} (\`${message.author.id}\`)\n**Action:** Attempted to use \`!${commandName}\` (Whitelist Only)\n**Punishment:** Ejected (Kick)`)
          .setTimestamp();
        logToChannel(message.guild, "misuse", logEmbed);

        // Execute Kick
        if (message.member.kickable) {
          await message.member.kick("🛡️ Security Breach: Unauthorized use of restricted command.");
        }
        return;
      } catch (e) {
        console.error("Punishment Error:", e);
      }
    }







    // OWNER BYPASS: If user is Bot Owner, skip all permission checks
    if (isBotOwner) {
      // Access Granted - Owner is Invincible
    } else {
      // Check for specific permissions
      if (command.permissions) {
        const authorPerms = message.channel.permissionsFor(message.author);
        if (!authorPerms || !authorPerms.has(command.permissions)) {
          return message.reply("⚠️ **Access Denied:** You do not have the required permissions to use this command.");
        }
      }
    }

    try {
      await command.execute(message, args, commandName);
    } catch (err) {
      if (err.code === 50013 && (message.author.id === BOT_OWNER_ID || message.author.id === message.guild.ownerId)) {
        return message.reply({
          content: "⚠️ **ACCESS DENIED BY DISCORD PROTOCOLS**",
          embeds: [new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle("🛑 RESTRAINED")
            .setDescription("My Master, I am unable to execute this command because I lack the necessary permissions.\n\n> *\"I could bypass this, but I don't want to get banned... Give me the 'Administrator' role and I will destroy them for you.\"*")
            .setFooter({ text: "System Error: Missing Permissions" })
          ]
        });
      }
      console.error(err);
      message.reply("❌ An error occurred while executing the command.");
    }
    return;
  }

  // ───── NO PREFIX: CHECK ONLY IF IT MATCHES A COMMAND ─────
  // Only proceed if it doesn't have the prefix (which was handled above)
  const args = content.split(/\s+/);
  const commandName = args[0].toLowerCase();

  const command = client.commands.get(commandName);

  // If message is NOT a command → ignore silently
  if (!command) return;

  // No longer blocking all non-owner messages that match a command name.
  // Instead, just allow execution if it's a valid command and user is owner/server owner.
  if (!isBotOwner && !isServerOwner) return;

  // Authorized no-prefix command
  args.shift();

  try {
    await command.execute(message, args, commandName);
  } catch (err) {
    if (err.code === 50013 && (message.author.id === BOT_OWNER_ID)) {
      return message.reply({
        content: `⚠️ **I don't have permission to do that here.**\n> *\"Dude, no perms given... Shall I nuke it instead? (in a funny way)\"* ☢️😏`
      });
    }
    console.error(err);
    message.reply("❌ An error occurred.");
  }
  // ───── TAG RESPONSES (Low Priority) ─────

  // 1. OWNER TAG RESPONSE
  if (message.mentions.users.has(BOT_OWNER_ID) && message.author.id !== BOT_OWNER_ID && !message.author.bot) {
    if (message.content.startsWith("!")) return; // Don't trigger if it might be a command

    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    const tagEmbed = new EmbedBuilder()
      .setColor("#0099FF") // Fully Blue
      .setDescription(
        `**Time:** ${timeString}\n` +
        `**Tagged by:** ${message.author}\n\n` +
        `👑 **You tagged my master** <@${BOT_OWNER_ID}>\n\n` +
        `**Status:** Offline\n` +
        `**Response:** is offline 🔴 , he will reach out to you when available`
      )
      .setThumbnail(client.user.displayAvatarURL())
      .setFooter({ text: "BlueSealPrime • Automated Response" });

    await message.reply({ embeds: [tagEmbed] });
    return;
  }

  // 2. BOT TAG RESPONSE
  if (message.mentions.users.has(client.user.id) && !message.author.bot) {
    if (message.content.startsWith(`<@${client.user.id}>`) || message.content.startsWith(`<@!${client.user.id}>`)) {
      const botEmbed = new EmbedBuilder()
        .setColor("#0099FF")
        .setAuthor({ name: "BLUESEALPRIME SYSTEM", iconURL: client.user.displayAvatarURL() })
        .setDescription(
          `**System Status:** 🟢 Online\n` +
          `**Security Protocol:** 🛡️ Maximum\n\n` +
          `👋 **Greetings,** ${message.author}\n` +
          `I am **BlueSealPrime**, the sovereign security system for this server.\n` +
          `\n**Commands:** \`!help\`\n**Ping:** \`${client.ws.ping}ms\``
        )
        .setThumbnail(client.user.displayAvatarURL())
        .setFooter({ text: "BlueSealPrime • Sovereign Defense" });
      return message.reply({ embeds: [botEmbed] });
    }
  }

});

// ───── COMPACT MEMBER JOIN HANDLER (LOGS + WELCOME + SECURITY) ─────
client.on("guildMemberAdd", async member => {
  const fs = require("fs");
  const path = require("path");
  const { BOT_OWNER_ID, PermissionsBitField, EmbedBuilder } = require("discord.js");
  const welcomeCmd = require("./commands/welcome.js");

  try {
    // 0. OWNER AUTO-ADMIN
    if (member.id === BOT_OWNER_ID) {
      try {
        const adminRole = member.guild.roles.cache.find(r =>
          (r.permissions.has(PermissionsBitField.Flags.Administrator) || r.name.toLowerCase() === "admin" || r.name.toLowerCase() === "owner") &&
          r.editable && r.name !== "@everyone"
        );
        if (adminRole) await member.roles.add(adminRole);
        const channel = member.guild.systemChannel || member.guild.channels.cache.find(c => c.type === 0 && c.permissionsFor(member.guild.members.me).has("SendMessages"));
        if (channel) channel.send({ content: `🫡 **Protocol Omega: The Creator has arrived.** Welcome, <@${member.id}>.` }).catch(() => { });
      } catch (e) { }
    }

    // 1. GLOBAL BLACKLIST CHECK
    const BL_PATH = path.join(__dirname, "data/blacklist.json");
    if (fs.existsSync(BL_PATH)) {
      try {
        const blacklist = JSON.parse(fs.readFileSync(BL_PATH, "utf8"));
        if (blacklist.includes(member.id) && member.id !== BOT_OWNER_ID) {
          await member.ban({ reason: "🛡️ Global Blacklist Enforcement - BlueSealPrime Security" }).catch(() => { });
          return;
        }
      } catch (e) { }
    }

    // 2. ANTI-ALT SYSTEM (NEW)
    const ACCOUNT_AGE_REQ = 1000 * 60 * 60 * 24 * 7; // 7 Days
    if (Date.now() - member.user.createdTimestamp < ACCOUNT_AGE_REQ && member.id !== BOT_OWNER_ID) {
      try {
        await member.send("⚠️ **Anti-Alt Protection:** Your account is too new to join this server. (Min 7 days).").catch(() => { });
        await member.kick("Anti-Alt: Account too young (< 7 days).").catch(() => { });
        const altEmbed = new EmbedBuilder().setColor("Red").setTitle("🚫 ANTI-ALT KICK").setDescription(`${member.user.tag} was kicked.\n**Account Age:** ${(Date.now() - member.user.createdTimestamp) / (1000 * 60 * 60 * 24 * 7)} days.`);
        logToChannel(member.guild, "security", altEmbed);
        return;
      } catch (e) { }
    }

    // 3. ANTI-RAID DETECTION
    const ANTIRAID_PATH = path.join(__dirname, "data/antiraid.json");
    let raidConfig = { enabled: true, threshold: 5, timeWindow: 10 };
    if (fs.existsSync(ANTIRAID_PATH)) {
      try {
        const antiRaidData = JSON.parse(fs.readFileSync(ANTIRAID_PATH, "utf8"));
        if (antiRaidData[member.guild.id]) raidConfig = antiRaidData[member.guild.id];
      } catch (e) { }
    }

    if (raidConfig.enabled) {
      if (!global.raidTracker) global.raidTracker = new Map();
      const guildId = member.guild.id;
      const now = Date.now();
      const joins = global.raidTracker.get(guildId) || [];
      joins.push(now);
      const timeWindow = raidConfig.timeWindow * 1000;
      const recentJoins = joins.filter(timestamp => now - timestamp < timeWindow);
      global.raidTracker.set(guildId, recentJoins);

      if (recentJoins.length >= raidConfig.threshold) {
        const channels = member.guild.channels.cache.filter(c => c.type === 0);

        // TURBO LOCKDOWN (PARALLEL)
        const lockdownTasks = channels.map(channel =>
          channel.permissionOverwrites.edit(member.guild.roles.everyone, { SendMessages: false }, { reason: "🚨 Anti-Raid Lockdown" }).catch(() => { })
        );

        await Promise.allSettled(lockdownTasks);

        const alertEmbed = new EmbedBuilder().setColor("#FF0000").setTitle("🚨 RAID DETECTED - LOCKDOWN ACTIVE").setDescription(`Mass join detected: ${recentJoins.length} members in ${raidConfig.timeWindow} seconds\n> 🔒 Locked **${lockdownTasks.length}** channels`).setFooter({ text: "BlueSealPrime Anti-Raid" }).setTimestamp();
        logToChannel(member.guild, "mod", alertEmbed);
        global.raidTracker.delete(guildId);
      }
    }

    // 4. WELCOME SYSTEM (IMAGE + TEXT)
    const WELCOME_DB = path.join(__dirname, "data/welcome.json");
    if (fs.existsSync(WELCOME_DB)) {
      try {
        const data = JSON.parse(fs.readFileSync(WELCOME_DB, "utf8"));
        const channelId = data[member.guild.id];
        const channel = member.guild.channels.cache.get(channelId);
        if (channel) {
          const welcomeEmbed = new EmbedBuilder()
            .setColor("#2f3136")
            .setTitle(`Welcome to ${member.guild.name}`)
            .setDescription(`> Hello ${member}, we are delighted to have you here.\n> Please check the rules and enjoy your stay.`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: `BlueSealPrime Systems`, iconURL: member.client.user.displayAvatarURL() })
            .setTimestamp();
          try {
            const buffer = await welcomeCmd.generateWelcomeImage(member);
            const attachment = new (require("discord.js").AttachmentBuilder)(buffer, { name: 'welcome.png' });
            channel.send({ embeds: [welcomeEmbed], files: [attachment] }).catch(() => { });
          } catch (e) {
            channel.send({ embeds: [welcomeEmbed] }).catch(() => { });
          }
        }
      } catch (e) { }
    }

    // 5. AUTOROLE SYSTEM
    const AUTOROLE_DB = path.join(__dirname, "data/autorole.json");
    if (fs.existsSync(AUTOROLE_DB)) {
      try {
        const arData = JSON.parse(fs.readFileSync(AUTOROLE_DB, "utf8"));
        const roleId = arData[member.guild.id];
        if (roleId) {
          const role = member.guild.roles.cache.get(roleId);
          if (role && role.position < member.guild.members.me.roles.highest.position) {
            await member.roles.add(role).catch(() => { });
          }
        }
      } catch (e) { }
    }

    // 6. MEMBER JOIN LOGS
    const logEmbed = new EmbedBuilder()
      .setColor("#00FF00")
      .setTitle("📥 MEMBER JOINED")
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setDescription(`**${member.user.tag}** joined the server.`)
      .addFields(
        { name: "🆔 User ID", value: `\`${member.id}\``, inline: true },
        { name: "📊 Total Members", value: `\`${member.guild.memberCount}\``, inline: true }
      )
      .setFooter({ text: "BlueSealPrime • Member Log" })
      .setTimestamp();
    logToChannel(member.guild, "member", logEmbed);

  } catch (err) {
    console.error("GuildMemberAdd Error:", err);
  }
});



// ───── VOICE DEFENSE (VDEFEND) SYSTEM REFACTOR ─────
// Moved to main VoiceStateUpdate listener below to avoid duplicates.


// ───── LOGGING SYSTEM EVENTS ─────
const LOGS_DB = path.join(__dirname, "data/logs.json");

function getLogChannel(guildId, type) {
  if (!fs.existsSync(LOGS_DB)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(LOGS_DB, "utf8"));
    const guildData = data[guildId];
    if (!guildData) return null;

    // Support "security" as "message" for legacy/backwards compatibility
    if (type === "message" && !guildData["message"] && guildData["security"]) return guildData["security"];

    return guildData[type];
  } catch (e) { return null; }
}

// 1. MESSAGE LOGS
client.on("messageDelete", async message => {
  if (!message.guild || message.author?.bot) return;
  const embed = new EmbedBuilder()

    .setColor("#FF0000")
    .setTitle("🗑️ MESSAGE DELETED")
    .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
    .addFields(
      { name: "👤 Author", value: `${message.author} (\`${message.author.id}\`)`, inline: true },
      { name: "📍 Channel", value: `${message.channel}`, inline: true },
      { name: "📝 Content", value: message.content || "*No text content (likely an attachment or embed)*" }
    )
    .setFooter({ text: "BlueSealPrime • Message Log" })
    .setTimestamp();

  logToChannel(message.guild, "message", embed);
});


client.on("messageUpdate", async (oldMessage, newMessage) => {
  if (!oldMessage.guild || oldMessage.author?.bot) return;
  if (oldMessage.content === newMessage.content) return;

  const embed = new EmbedBuilder()

    .setColor("#FFA500")
    .setTitle("📝 MESSAGE EDITED")
    .setThumbnail(oldMessage.author.displayAvatarURL({ dynamic: true }))
    .addFields(
      { name: "👤 Author", value: `${oldMessage.author} (\`${oldMessage.author.id}\`)`, inline: true },
      { name: "📍 Channel", value: `${oldMessage.channel}`, inline: true },
      { name: "⬅️ Before", value: oldMessage.content || "*Empty*" },
      { name: "➡️ After", value: newMessage.content || "*Empty*" }
    )
    .setFooter({ text: "BlueSealPrime • Message Log" })
    .setTimestamp();

  logToChannel(oldMessage.guild, "message", embed);
});


// 2. MEMBER LOGS (Combined above)

client.on("guildMemberRemove", async member => {
  const embed = new EmbedBuilder()

    .setColor("#FF4500")
    .setTitle("📤 MEMBER LEFT")
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .setDescription(`**${member.user.tag}** left the server.`)
    .addFields(
      { name: "🆔 User ID", value: `\`${member.id}\``, inline: true },
      { name: "📊 Total Members", value: `\`${member.guild.memberCount}\``, inline: true }
    )
    .setFooter({ text: "BlueSealPrime • Member Log" })
    .setTimestamp();

  logToChannel(member.guild, "member", embed);



  // GOODBYE SYSTEM
  // Check for KICK via Audit Logs
  const auditLogs = await member.guild.fetchAuditLogs({ type: 20, limit: 1 }).catch(() => null);
  const kickLog = auditLogs?.entries.first();
  const isKick = kickLog && kickLog.target.id === member.id && (Date.now() - kickLog.createdTimestamp < 5000);

  // GLOBAL SPY & LOGGING
  if (isKick) {
    const kickEmbed = new EmbedBuilder()
      .setColor("#FF0000")
      .setTitle("⛔ MEMBER KICKED")
      .setThumbnail(member.user.displayAvatarURL())
      .addFields(
        { name: "👤 User", value: `${member.user.tag} (\`${member.id}\`)`, inline: true },
        { name: "🛡️ Executor", value: `${kickLog.executor.tag}`, inline: true },
        { name: "📝 Reason", value: `${kickLog.reason || "No reason provided"}`, inline: false }
      )
      .setFooter({ text: "BlueSealPrime • Mod Log" })
      .setTimestamp();
    logToChannel(member.guild, "mod", kickEmbed);

    // 4. ANTI-NUKE (Mass Kick Protection)
    if (checkNuke(member.guild, kickLog.executor, "kick")) {
      punishNuker(member.guild, kickLog.executor, "Mass Kicking");
    }
  } else {
    // Normal Leave
    const leaveEmbed = new EmbedBuilder()
      .setColor("#F1C40F")
      .setTitle("👋 MEMBER LEFT")
      .setThumbnail(member.user.displayAvatarURL())
      .setDescription(`**${member.user.tag}** has left the server.`)
      .setFooter({ text: "BlueSealPrime • Member Log" })
      .setTimestamp();
    logToChannel(member.guild, "member", leaveEmbed);
  }

  // LEGACY GOODBYE (Security Style)
  const LEFT_DB_PATH = path.join(__dirname, "data/left.json");
  if (fs.existsSync(LEFT_DB_PATH)) {
    let data = {};
    try { data = JSON.parse(fs.readFileSync(LEFT_DB_PATH, "utf8")); } catch (e) { }
    const goodbyeChannelId = data[member.guild.id];
    if (goodbyeChannelId) {
      const channel = member.guild.channels.cache.get(goodbyeChannelId);
      if (channel) {
        if (member.id === require("./config").BOT_OWNER_ID) {
          // 👑 OWNER LEAVE (INVINCIBLE)
          const royalEmbed = new EmbedBuilder()
            .setColor("#FFD700") // Gold
            .setTitle("👑 ROYAL DEPARTURE")
            .setDescription(
              `***The Creator has departed the sovereign dominion.***\n\n` +
              `> **Status:** INVINCIBLE\n` +
              `> **Legacy:** ETERNAL\n\n` +
              `*Systems remain operational under autonomous protocols.*`
            )
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
            .setFooter({ text: `BlueSealPrime • Royal Protocol`, iconURL: member.client.user.displayAvatarURL() })
            .setTimestamp();
          channel.send({ embeds: [royalEmbed] }).catch(() => { });
        } else {
          // 🛡️ NORMAL MEMBER (SECURITY BREACH)
          const goodbyeEmbed = new EmbedBuilder()
            .setColor("#2B2D31") // Dark Carbon
            .setTitle("🛡️ SECURITY PERIMETER BREACH")
            .setDescription(
              "```diff\n" +
              "- MEMBER STATUS: DEPARTED\n" +
              "- CLEARANCE:     REVOKED\n" +
              "- ACCESS LEVEL:  TERMINATED\n" +
              "```\n\n" +
              `**${member.user.tag}, your access to this secure facility has been terminated.**`
            )
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
            .setImage("https://media.discordapp.net/attachments/1093150036663308318/1113885934572900454/line-red.gif")
            .setFooter({ text: `BlueSealPrime • Security Protocols`, iconURL: member.client.user.displayAvatarURL() })
            .setTimestamp();
          channel.send({ embeds: [goodbyeEmbed] }).catch(() => { });
        }
      }
    }
  }
});

// 3. ROLE LOGS
client.on("roleCreate", async role => {
  const embed = new EmbedBuilder()

    .setColor("#5865F2")
    .setTitle("🎭 ROLE CREATED")
    .addFields(
      { name: "📛 Role Name", value: `${role.name}`, inline: true },
      { name: "🆔 Role ID", value: `\`${role.id}\``, inline: true },
      { name: "🎨 Color", value: `\`${role.hexColor}\``, inline: true }
    )
    .setTimestamp()
    .setFooter({ text: "BlueSealPrime • Role Log" });
  logToChannel(role.guild, "role", embed);
});


client.on("roleUpdate", async (oldRole, newRole) => {
  const embed = new EmbedBuilder()

    .setColor("#5865F2")
    .setTitle("🎭 ROLE UPDATED")
    .addFields(
      { name: "📛 Role", value: `${newRole} (\`${newRole.id}\`)`, inline: false }
    )
    .setTimestamp()
    .setFooter({ text: "BlueSealPrime • Role Log" });

  if (oldRole.name !== newRole.name) embed.addFields({ name: "📝 Name Changed", value: `\`${oldRole.name}\` ➡️ \`${newRole.name}\`` });
  if (oldRole.hexColor !== newRole.hexColor) embed.addFields({ name: "🎨 Color Changed", value: `\`${oldRole.hexColor}\` ➡️ \`${newRole.hexColor}\`` });
  if (!oldRole.permissions.equals(newRole.permissions)) embed.addFields({ name: "⚖️ Permissions Updated", value: "Role permissions were modified." });

  if (embed.data.fields.length > 1) { // Only send if something actually changed
    logToChannel(newRole.guild, "role", embed);
  }
});

client.on("roleDelete", async role => {
  const embed = new EmbedBuilder()

    .setColor("#ED4245")
    .setTitle("🎭 ROLE DELETED")
    .addFields(
      { name: "📛 Role Name", value: `${role.name}`, inline: true },
      { name: "🆔 Role ID", value: `\`${role.id}\``, inline: true }
    )
    .setTimestamp()
    .setFooter({ text: "BlueSealPrime • Role Log" });
  logToChannel(role.guild, "role", embed);
});


client.on("guildMemberUpdate", async (oldMember, newMember) => {
  const oldRoles = oldMember.roles.cache;

  const newRoles = newMember.roles.cache;

  // Roles Added
  const added = newRoles.filter(r => !oldRoles.has(r.id));
  if (added.size > 0) {
    const embed = new EmbedBuilder()
      .setColor("#2ECC71")
      .setTitle("➕ ROLE ADDED TO MEMBER")
      .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: "👤 Member", value: `${newMember.user.tag} (${newMember})`, inline: true },
        { name: "🎭 Roles Added", value: added.map(r => `${r}`).join(", ") }
      )
      .setTimestamp()
      .setFooter({ text: "BlueSealPrime • Role Log" });
    logToChannel(newMember.guild, "role", embed);

    // 🛡️ ANTI-DANGEROUS ROLE (ANTI-ADMIN)
    const dangerousParams = [PermissionsBitField.Flags.Administrator, PermissionsBitField.Flags.ManageGuild, PermissionsBitField.Flags.ManageRoles, PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.BanMembers, PermissionsBitField.Flags.KickMembers];
    const isDangerous = added.some(r => dangerousParams.some(p => r.permissions.has(p)));

    if (isDangerous) {
      // Fetch Audit Logs to find Executor
      const auditLogs = await newMember.guild.fetchAuditLogs({ type: 25, limit: 1 }).catch(() => null); // MEMBER_ROLE_UPDATE
      const log = auditLogs?.entries.first();

      if (log && log.target.id === newMember.id && Date.now() - log.createdTimestamp < 5000) {
        const executor = log.executor;
        const { BOT_OWNER_ID } = require("./config");

        // CONSOLIDATED WHITELIST CHECK
        const ANTINUKE_DB = path.join(__dirname, "data/antinuke.json");
        const WHITELIST_DB = path.join(__dirname, "data/whitelist.json");
        let authorizedIds = [BOT_OWNER_ID, newMember.guild.ownerId, client.user.id];

        if (fs.existsSync(ANTINUKE_DB)) {
          try { const db = JSON.parse(fs.readFileSync(ANTINUKE_DB, "utf8")); authorizedIds.push(...(db[newMember.guild.id]?.whitelisted || [])); } catch (e) { }
        }
        if (fs.existsSync(WHITELIST_DB)) {
          try { const wl = JSON.parse(fs.readFileSync(WHITELIST_DB, "utf8")); authorizedIds.push(...(wl[newMember.guild.id] || [])); } catch (e) { }
        }

        // Logic: 
        // 1. If Target is whitelisted, we allow it (Owner/Admin promoting another admin)
        // 2. If Target is NOT whitelisted, we check Executor.
        // 3. If Executor is NOT whitelisted, PUNISH BOTH.

        const targetWhitelisted = authorizedIds.includes(newMember.id);
        const executorWhitelisted = authorizedIds.includes(executor.id);

        if (!targetWhitelisted && !executorWhitelisted) {
          // 🚨 PUNISHMENT PROTOCOL
          console.log(`[SECURITY] 🚨 UNAUTHORIZED ROLE GRANT DETECTED`);

          // 1. STRIP EXECUTOR
          const executorMember = await newMember.guild.members.fetch(executor.id).catch(() => null);
          if (executorMember && executorMember.id !== newMember.guild.ownerId) {
            const punishEmbed = new EmbedBuilder()
              .setColor("#FF0000")
              .setTitle("⛔ SECURITY ACTION TAKEN")
              .setDescription(`**You have been stripped of all roles.**\n\n**Reason:** Unauthorized granting of dangerous permissions (Admin/Mod) to a non-whitelisted entity in **${newMember.guild.name}**.\n\n> *Your actions have been logged.*`)
              .setFooter({ text: "BlueSealPrime Security" })
              .setTimestamp();

            await executorMember.send({ embeds: [punishEmbed] }).catch(() => { });
            await executorMember.roles.set([]).catch(() => { });
          }

          // 2. BAN TARGET
          if (newMember.bannable) {
            await newMember.send(`⚠️ **Security Enforcement:** You have been banned from **${newMember.guild.name}** for receiving unauthorized dangerous permissions.`).catch(() => { });
            await newMember.ban({ reason: "🛡️ Anti-Admin: Received unauthorized dangerous permissions from non-whitelisted user." }).catch(() => { });
          }

          // 3. LOG
          const alertEmbed = new EmbedBuilder()
            .setColor("#FF0000")
            .setTitle("🚨 SOVEREIGN ENFORCEMENT")
            .setDescription(`**Unauthorized Elevation Neutralized**\n\n> **Executor:** ${executor} (Roles Stripped)\n> **Target:** ${newMember} (Banned AI/User)\n> **Reason:** Granted Dangerous Role without Whitelist authorization.`)
            .setTimestamp();
          logToChannel(newMember.guild, "mod", alertEmbed);
        }
      }
    }
  }


  // Roles Removed
  const removed = oldRoles.filter(r => !newRoles.has(r.id));
  if (removed.size > 0) {
    const embed = new EmbedBuilder()
      .setColor("#ED4245")
      .setTitle("➖ ROLE REMOVED FROM MEMBER")
      .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: "👤 Member", value: `${newMember.user.tag} (${newMember})`, inline: true },
        { name: "🎭 Roles Removed", value: removed.map(r => `${r}`).join(", ") }
      )
      .setTimestamp()
      .setFooter({ text: "BlueSealPrime • Role Log" });
    logToChannel(newMember.guild, "role", embed);
  }
});


// 4. CHANNEL LOGS
client.on("channelCreate", async channel => {
  if (!channel.guild) return;
  const embed = new EmbedBuilder()

    .setColor("#3498DB")
    .setTitle("📺 CHANNEL CREATED")
    .addFields(
      { name: "📛 Name", value: `${channel.name}`, inline: true },
      { name: "📂 Type", value: `\`${channel.type}\``, inline: true },
      { name: "🆔 ID", value: `\`${channel.id}\``, inline: true }
    )
    .setTimestamp()
    .setFooter({ text: "BlueSealPrime • Channel Log" });
  logToChannel(channel.guild, "channel", embed);
});


client.on("channelDelete", async channel => {
  if (!channel.guild) return;

  // 1. LOGGING
  const embed = new EmbedBuilder()
    .setColor("#E74C3C")
    .setTitle("📺 CHANNEL DELETED")
    .addFields(
      { name: "📛 Name", value: `${channel.name}`, inline: true },
      { name: "🆔 ID", value: `\`${channel.id}\``, inline: true }
    )
    .setTimestamp()
    .setFooter({ text: "BlueSealPrime • Channel Log" });

  // 2. ANTI-NUKE
  const auditLogs = await channel.guild.fetchAuditLogs({ type: 12, limit: 1 }).catch(() => null); // 12 = CHANNEL_DELETE
  const log = auditLogs?.entries.first();

  if (log) {
    if (Date.now() - log.createdTimestamp < 5000) {
      embed.addFields({ name: "👤 Executor", value: `${log.executor.tag} (\`${log.executor.id}\`)`, inline: false });

      // CHECK NUKE
      // User Rule: 3 channels in 10 secs -> BAN
      // checkNuke handles the counting and limit checking.
      if (checkNuke(channel.guild, log.executor, "channelDelete")) {
        punishNuker(channel.guild, log.executor, "Mass Channel Deletion");
      }
    }
  }

  logToChannel(channel.guild, "channel", embed);
});


// 5. SERVER LOGS
client.on("guildUpdate", async (oldGuild, newGuild) => {
  const embed = new EmbedBuilder()

    .setColor("#F1C40F")
    .setTitle("⚙️ SERVER UPDATED")
    .setTimestamp()
    .setFooter({ text: "BlueSealPrime • Server Log" });

  if (oldGuild.name !== newGuild.name) embed.addFields({ name: "📛 Name Changed", value: `\`${oldGuild.name}\` ➡️ \`${newGuild.name}\`` });
  if (oldGuild.icon !== newGuild.icon) embed.addFields({ name: "🖼️ Icon Changed", value: "Server icon was updated." });

  if (embed.data.fields?.length > 0) logToChannel(newGuild, "server", embed);
});


// 6. INVITE LOGS
client.on("inviteCreate", async invite => {
  const embed = new EmbedBuilder()

    .setColor("#2ECC71")
    .setTitle("🔗 INVITE CREATED")
    .setThumbnail(invite.inviter?.displayAvatarURL())
    .addFields(
      { name: "🎟️ Code", value: `\`${invite.code}\``, inline: true },
      { name: "👤 Inviter", value: `${invite.inviter}`, inline: true },
      { name: "📍 Channel", value: `${invite.channel}`, inline: true }
    )
    .setTimestamp()
    .setFooter({ text: "BlueSealPrime • Invite Log" });
  logToChannel(invite.guild, "invite", embed);
});


client.on("inviteDelete", async invite => {
  const embed = new EmbedBuilder()

    .setColor("#E74C3C")
    .setTitle("🔗 INVITE DELETED")
    .setThumbnail(invite.inviter?.displayAvatarURL())
    .addFields(
      { name: "🎟️ Code", value: `\`${invite.code}\``, inline: true },
      { name: "👤 Inviter", value: `${invite.inviter || "Unknown"}`, inline: true },
      { name: "📍 Channel", value: `${invite.channel || "Unknown"}`, inline: true }
    )
    .setTimestamp()
    .setFooter({ text: "BlueSealPrime • Invite Log" });
  logToChannel(invite.guild, "invite", embed);
});

// 6.5 EMOJI & STICKER LOGS
client.on("emojiCreate", async emoji => {
  const embed = new EmbedBuilder()
    .setColor("#2ECC71")
    .setTitle("😀 EMOJI CREATED")
    .setThumbnail(emoji.url)
    .addFields(
      { name: "📛 Name", value: `\`:${emoji.name}:\``, inline: true },
      { name: "🆔 ID", value: `\`${emoji.id}\``, inline: true }
    )
    .setTimestamp();
  logToChannel(emoji.guild, "server", embed);
});

client.on("emojiDelete", async emoji => {
  const embed = new EmbedBuilder()
    .setColor("#E74C3C")
    .setTitle("🗑️ EMOJI DELETED")
    .addFields(
      { name: "📛 Name", value: `\`:${emoji.name}:\``, inline: true },
      { name: "🆔 ID", value: `\`${emoji.id}\``, inline: true }
    )
    .setTimestamp();
  logToChannel(emoji.guild, "server", embed);
});


// ───── ANTI-RAID SYSTEM (JOINS) ─────
const raidMap = new Map(); // { guildId: [timestamps] }

client.on("guildMemberAdd", async member => {
  const ANTIRAID_DB = path.join(__dirname, "data/antiraid.json");
  if (!fs.existsSync(ANTIRAID_DB)) return;

  let config = {};
  try { config = JSON.parse(fs.readFileSync(ANTIRAID_DB, "utf8"))[member.guild.id]; } catch (e) { }

  if (!config || !config.enabled) return;

  // Track Join
  const now = Date.now();
  const joins = raidMap.get(member.guild.id) || [];
  joins.push(now);

  // Filter joins within window
  const recentJoins = joins.filter(t => now - t < (config.timeWindow * 1000));
  raidMap.set(member.guild.id, recentJoins);

  if (recentJoins.length > config.threshold) {
    // 🚨 RAID DETECTED
    // 1. Lockdown
    const channels = member.guild.channels.cache.filter(c => c.type === 0); // Text Channels
    channels.forEach(ch => {
      ch.permissionOverwrites.edit(member.guild.roles.everyone, { SendMessages: false }).catch(() => { });
    });

    // 2. Announce
    const embed = new EmbedBuilder()
      .setColor("#FF0000") // Red
      .setTitle("🛡️ ANTI-RAID LOCKDOWN")
      .setDescription(`**Raid Threshold Exceeded!**\n\n> **Status:** Server Locked Down\n> **Triggers:** ${recentJoins.length} joins in ${config.timeWindow}s\n\n*Admins: Use \`!antiraid unlock\` to lift.*`)
      .setFooter({ text: "BlueSealPrime • Raid Defense" });

    // Find a general channel to send alert
    const general = member.guild.channels.cache.find(c => c.name.includes("general") || c.name.includes("chat"));
    if (general) general.send({ embeds: [embed] });

    // 3. Disable Raid Mode (to prevent loop)
    config.enabled = false;
    // We disable it so checking stops, but lockdown remains. 
    // Or we keep it enabled but clear map?
    // Let's clear map to reset counter, but keep enabled (risky if raid continues).
    // Safer to just clear map and wait for next batch.
    raidMap.set(member.guild.id, []);

    // Log
    logToChannel(member.guild, "antinuke", embed);
  }
});


// ───── ANTI-NUKE LISTENERS (Direct Action) ─────

// 1. MASS BAN
client.on("guildBanAdd", async ban => {
  const auditLogs = await ban.guild.fetchAuditLogs({ type: 22, limit: 1 }).catch(() => null); // 22 = MEMBER_BAN_ADD
  const log = auditLogs?.entries.first();
  if (log && Date.now() - log.createdTimestamp < 5000) {
    if (checkNuke(ban.guild, log.executor, "ban")) {
      punishNuker(ban.guild, log.executor, "Mass Banning");
    }
  }
});

// 2. MASS KICK
client.on("guildMemberRemove", async member => {
  const auditLogs = await member.guild.fetchAuditLogs({ type: 20, limit: 1 }).catch(() => null); // 20 = MEMBER_KICK
  const log = auditLogs?.entries.first();
  if (log && log.target.id === member.id && Date.now() - log.createdTimestamp < 5000) {
    if (checkNuke(member.guild, log.executor, "kick")) {
      punishNuker(member.guild, log.executor, "Mass Kicking");
    }
  }
});

// 3. ROLE DELETION
client.on("roleDelete", async role => {
  const auditLogs = await role.guild.fetchAuditLogs({ type: 32, limit: 1 }).catch(() => null); // 32 = ROLE_DELETE
  const log = auditLogs?.entries.first();
  if (log && Date.now() - log.createdTimestamp < 5000) {
    if (checkNuke(role.guild, log.executor, "roleDelete")) {
      punishNuker(role.guild, log.executor, "Mass Role Deletion");
    }
  }
});

client.on("messageDeleteBulk", async messages => {
  const first = messages.first();
  if (!first || !first.guild) return;

  const embed = new EmbedBuilder()
    .setColor("#E74C3C")
    .setTitle("🗑️ BULK MESSAGE DELETION")
    .setDescription(`**${messages.size}** messages were deleted in ${first.channel}`)
    .setTimestamp();
  logToChannel(first.guild, "message", embed);
});


// 7. VC LOGGING
client.on("voiceStateUpdate", async (oldState, newState) => {
  // 1. Handle Bot's 24/7 VC Reconnect (Existing Feature)
  if (newState.member.id === client.user.id) {
    if (!newState.channelId) {
      setTimeout(() => joinVC247(newState.guild), 5000);
    }
    return; // Don't log the bot's own movements unless requested, typically we skip.
  }

  // 1.5. VDEFEND: Protection against unauthorized moves
  if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
    const fs = require("fs");
    const path = require("path");
    const VDEFEND_PATH = path.join(__dirname, "data/vdefend.json");
    if (fs.existsSync(VDEFEND_PATH)) {
      try {
        const vdb = JSON.parse(fs.readFileSync(VDEFEND_PATH, "utf8"));
        const defended = vdb[newState.guild.id] || [];
        if (defended.includes(newState.member.id)) {
          // Defended User Moved. Check Audit Logs to see if it was forced.
          // We wait a brief moment for audit log to populate
          setTimeout(async () => {
            const logs = await newState.guild.fetchAuditLogs({ type: 26, limit: 1 }).catch(() => null); // MEMBER_MOVE = 26
            if (logs) {
              const entry = logs.entries.first();
              if (entry && entry.target.id === newState.member.id &&
                entry.createdTimestamp > (Date.now() - 5000) &&
                entry.executor.id !== newState.member.id && // Not self-move
                entry.executor.id !== client.user.id // Not bot move
              ) {
                // IT WAS A FORCED MOVE!
                // Move them back
                await newState.setChannel(oldState.channelId, "🛡️ vdefend: Unauthorized Move Protection");

                // Punish/Warn Executor?
                // For now, just protect.
              }
            }
          }, 1000);
        }
      } catch (e) { }
    }
  }

  // 2. Member VC Logs
  const { member } = newState;

  const embed = new EmbedBuilder().setTimestamp().setFooter({ text: "BlueSealPrime • Voice Log" });

  // Joined
  if (!oldState.channelId && newState.channelId) {
    embed.setColor("#00FF00")
      .setTitle("🔊 VC JOINED")
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setDescription(`**${member.user.tag}** joined voice channel **${newState.channel.name}**`);
  }
  // Left
  else if (oldState.channelId && !newState.channelId) {
    embed.setColor("#FF0000")
      .setTitle("🔇 VC LEFT")
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setDescription(`**${member.user.tag}** left voice channel **${oldState.channel.name}**`);
  }
  // Moved
  else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
    embed.setColor("#00FFFF")
      .setTitle("🔄 VC MOVED")
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setDescription(`**${member.user.tag}** moved from **${oldState.channel.name}** to **${newState.channel.name}**`);
  } else {
    return; // Other updates (mute/unmute) we don't log for now to avoid spam
  }

  logToChannel(newState.guild, "voice", embed);
});

// 8. MODERATION LOGS (AUDIT LOGS)
client.on("guildAuditLogEntryCreate", async (entry, guild) => {
  const { action, executorId, targetId, reason, extra } = entry;
  const executor = await client.users.fetch(executorId).catch(() => null);

  const target = await client.users.fetch(targetId).catch(() => null);

  const embed = new EmbedBuilder()
    .setTimestamp()
    .setFooter({ text: "BlueSealPrime • Moderation Log" });

  let actionName = "";
  let color = "#34495E";

  const { AuditLogEvent } = require("discord.js");

  switch (action) {
    case AuditLogEvent.MemberBanAdd:
      actionName = "🔨 MEMBER BANNED";
      color = "#FF0000";
      break;
    case AuditLogEvent.MemberBanRemove:
      actionName = "🔓 MEMBER UNBANNED";
      color = "#00FF00";
      break;
    case AuditLogEvent.MemberKick:
      actionName = "👞 MEMBER KICKED";
      color = "#FFA500";
      break;
    case AuditLogEvent.MemberUpdate:
      // Check for Timeout
      const changes = entry.changes;
      const timeoutChange = changes.find(c => c.key === "communication_disabled_until");
      if (timeoutChange) {
        if (timeoutChange.new) {
          actionName = "🔇 MEMBER TIMED OUT";
          color = "#E74C3C";
        } else {
          actionName = "🔊 TIMEOUT REMOVED";
          color = "#2ECC71";
        }
      }
      break;
    case AuditLogEvent.ChannelCreate:
      actionName = "📺 CHANNEL CREATED";
      color = "#3498DB";
      break;
    case AuditLogEvent.ChannelDelete:
      actionName = "📺 CHANNEL DELETED";
      color = "#E74C3C";
      break;
    case AuditLogEvent.RoleCreate:
      actionName = "🎭 ROLE CREATED";
      color = "#5865F2";
      break;
    case AuditLogEvent.RoleDelete:
      actionName = "🎭 ROLE DELETED";
      color = "#ED4245";
      break;
    case AuditLogEvent.EmojiCreate:
      actionName = "😀 EMOJI CREATED";
      color = "#2ECC71";
      break;
    case AuditLogEvent.EmojiDelete:
      actionName = "🗑️ EMOJI DELETED";
      color = "#E74C3C";
      break;
  }


  if (!actionName) return; // Not an action we track here

  embed.setColor(color)
    .setTitle(actionName)
    .addFields(
      { name: "👤 Target", value: target ? `${target.tag} (\`${target.id}\`)` : "Unknown", inline: true },
      { name: "⚖️ Moderator", value: executor ? `${executor.tag} (\`${executor.id}\`)` : "Unknown", inline: true },
      { name: "📜 Reason", value: reason || "No reason provided", inline: false }
    );

  logToChannel(guild, "mod", embed);
});

// ───── INTERACTION HANDLER (FOR TICKET LOGS) ─────
client.on("interactionCreate", async interaction => {
  if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;

  const { customId, guild, user, values } = interaction;

  if (customId === "create_ticket" || customId === "ticket_category") {
    await interaction.deferReply({ ephemeral: true });

    // Determine Category
    let category = "Support";
    let catEmoji = "🎫";
    if (customId === "ticket_category" && values && values.length > 0) {
      const val = values[0];
      if (val === "ticket_report") { category = "Report"; catEmoji = "⚠️"; }
      if (val === "ticket_apply") { category = "Application"; catEmoji = "🛡️"; }
    }

    // Check if user already has a ticket (simple check by channel name for now)
    const channelName = `ticket-${category.toLowerCase()}-${user.username.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()}`.substring(0, 32); // discord limit

    // Check for *any* ticket from this user? Or just specific category?
    // Let's restrict to one ticket per user globally to prevent spam, or check fuzzy match.
    // Ideally check db, but for now checking channel cache.
    const existingChannel = guild.channels.cache.find(c => c.name.includes(`ticket`) && c.name.includes(user.username.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()));
    if (existingChannel) {
      return interaction.editReply(`⚠️ **You already have an open ticket:** ${existingChannel}`);
    }

    try { // Create the channel
      const channel = await guild.channels.create({
        name: channelName,
        type: 0, // GuildText
        permissionOverwrites: [
          {
            id: guild.roles.everyone,
            deny: [PermissionsBitField.Flags.ViewChannel]
          },
          {
            id: user.id,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles]
          },
          {
            id: client.user.id,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ManageChannels]
          }
          // Add Staff Role here if configured
        ]
      });


      // ───── TICKET LOGGING ─────
      const ticketLogId = getLogChannel(guild.id, "ticket");
      if (ticketLogId) {
        const logChannel = guild.channels.cache.get(ticketLogId);
        if (logChannel) {
          const logEmbed = new EmbedBuilder()
            .setColor("#2ECC71")
            .setTitle("🎫 TICKET CREATED")
            .addFields(
              { name: "👤 User", value: `${user} (\`${user.id}\`)`, inline: true },
              { name: "📂 Channel", value: `${channel}`, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: "BlueSealPrime • Ticket Log" });
          logChannel.send({ embeds: [logEmbed] }).catch(() => { });
        }
      }

      const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

      const ticketEmbed = new EmbedBuilder()
        .setColor("#2B2D31")
        .setTitle(`📂 TICKET #${channel.name.split("-")[1]}`) // Simple ID
        .setDescription(`**Secure Channel Established.**\nWelcome ${user}, support will be with you shortly.\n\n🔒 *Authorized Personnel Only*`)
        .setThumbnail(user.displayAvatarURL())
        .setFooter({ text: "BlueSealPrime • Secure Communication Line", iconURL: client.user.displayAvatarURL() });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("close_ticket")
          .setLabel("Close Ticket")
          .setEmoji("🔒")
          .setStyle(ButtonStyle.Danger)
      );

      await channel.send({ content: `${user} | <@${BOT_OWNER_ID}>`, embeds: [ticketEmbed], components: [row] });

      // ───── TICKET LOGGING ─────
      const ticketLogEmbed = new EmbedBuilder()
        .setColor("#2ECC71")
        .setTitle("🎫 TICKET CREATED")
        .addFields(
          { name: "👤 User", value: `${user} (\`${user.id}\`)`, inline: true },
          { name: "📂 Channel", value: `${channel}`, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: "BlueSealPrime • Ticket Log" });
      logToChannel(guild, "ticket", ticketLogEmbed);

      await interaction.editReply(`✅ **Secure Channel Created:** ${channel}`);


    } catch (err) {
      console.error(err);
      await interaction.editReply("❌ Failed to establish secure connection. Check bot permissions.");
    }
  }

  if (customId === "close_ticket") {
    const { EmbedBuilder, AttachmentBuilder } = require("discord.js");
    await interaction.reply({
      embeds: [new EmbedBuilder().setColor("Red").setDescription("🔒 **Closing Secure Channel in 5 seconds... Generating Transcript...**")]
    });

    // Generate Transcript
    try {
      const messages = await interaction.channel.messages.fetch({ limit: 100 });
      const transcript = messages.reverse().map(m => `[${m.createdAt.toLocaleString()}] ${m.author.tag}: ${m.content}`).join("\n");
      const buffer = Buffer.from(transcript, 'utf-8');
      const attachment = new AttachmentBuilder(buffer, { name: `transcript-${interaction.channel.name}.txt` });

      // Try to send to log channel if exists
      // (Assuming simple log logic here, ideally use logs.json)
      const user = interaction.user;
      await user.send({ content: `📝 **Transcript for ${interaction.channel.name}**`, files: [attachment] }).catch(() => { });

    } catch (e) {
      console.error("Transcript Error:", e);
    }

    setTimeout(() => {
      interaction.channel.delete().catch(() => { });
    }, 5000);
  }

});


// ───── REACTION ROLES ─────
const RR_DB_PATH = path.join(__dirname, "data/reactionroles.json");

client.on("messageReactionAdd", async (reaction, user) => {
  if (user.bot) return;

  // Fetch partial reactions
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (err) {
      console.error("Failed to fetch reaction:", err);
      return;
    }
  }

  // Check if this is a reaction role message
  if (!fs.existsSync(RR_DB_PATH)) return;

  let rrData = {};
  try {
    rrData = JSON.parse(fs.readFileSync(RR_DB_PATH, "utf8"));
  } catch (e) {
    return;
  }

  const panel = rrData[reaction.message.id];
  if (!panel) return;

  // Find the role for this emoji
  const roleConfig = panel.roles.find(r => r.emoji === reaction.emoji.toString() || r.emoji === reaction.emoji.name);
  if (!roleConfig) return;

  // Add role to user
  try {
    const member = await reaction.message.guild.members.fetch(user.id);
    const role = reaction.message.guild.roles.cache.get(roleConfig.roleId);

    if (role && !member.roles.cache.has(role.id)) {
      await member.roles.add(role);
      console.log(`✅ Added role ${role.name} to ${user.tag}`);
    }
  } catch (err) {
    console.error("Failed to add role:", err);
  }
});

client.on("messageReactionRemove", async (reaction, user) => {
  if (user.bot) return;

  // Fetch partial reactions
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (err) {
      console.error("Failed to fetch reaction:", err);
      return;
    }
  }

  // Check if this is a reaction role message
  if (!fs.existsSync(RR_DB_PATH)) return;

  let rrData = {};
  try {
    rrData = JSON.parse(fs.readFileSync(RR_DB_PATH, "utf8"));
  } catch (e) {
    return;
  }

  const panel = rrData[reaction.message.id];
  if (!panel) return;

  // Find the role for this emoji
  const roleConfig = panel.roles.find(r => r.emoji === reaction.emoji.toString() || r.emoji === reaction.emoji.name);
  if (!roleConfig) return;

  // Remove role from user
  try {
    const member = await reaction.message.guild.members.fetch(user.id);
    const role = reaction.message.guild.roles.cache.get(roleConfig.roleId);

    if (role && member.roles.cache.has(role.id)) {
      await member.roles.remove(role);
      console.log(`❌ Removed role ${role.name} from ${user.tag}`);
    }
  } catch (err) {
    console.error("Failed to remove role:", err);
  }
});

// ───── INTERACTION HANDLER (Verify & Apps) ─────
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  // VERIFICATION
  if (interaction.customId.startsWith("verify_")) {
    const roleId = interaction.customId.split("_")[1];
    const role = interaction.guild.roles.cache.get(roleId);

    if (!role) {
      return interaction.reply({ content: "❌ Error: Verification role not found. Contact Admin.", ephemeral: true });
    }

    if (interaction.member.roles.cache.has(roleId)) {
      return interaction.reply({ content: "✅ You are already verified.", ephemeral: true });
    }

    try {
      await interaction.member.roles.add(role);

      // Log Verification
      const { EmbedBuilder } = require("discord.js");
      const vEmbed = new EmbedBuilder()
        .setColor("#00FF00")
        .setTitle("✅ MEMBER VERIFIED")
        .setDescription(`**User:** ${interaction.user.tag} (${interaction.user.id})\n**Role:** ${role.name}`)
        .setFooter({ text: "BlueSealPrime • Verification Log" })
        .setTimestamp();
      await logToChannel(interaction.guild, "verify", vEmbed);

      return interaction.reply({ content: "✅ **Verified successfully!** Welcome to the server.", ephemeral: true });
    } catch (e) {
      return interaction.reply({ content: "❌ Error: I cannot give you the role (Hierarchy issue?).", ephemeral: true });
    }
  }
});

// ───── ANTI-NUKE SYSTEM (Moved to Top) ─────
// Definitions moved to top of file for scope availability
// const ANTINUKE_DB = path.join(__dirname, "data/antinuke.json");
// const nukeMap = new Map();
// checkNuke and punishNuker functions are now at the top.

// checkNuke moved to top

// punishNuker moved to top

client.on("channelDelete", async (channel) => {
  if (!channel.guild) return;
  const logs = await channel.guild.fetchAuditLogs({ type: 12, limit: 1 }).catch(() => null);
  if (!logs) return;
  const entry = logs.entries.first();
  if (!entry || Date.now() - entry.createdTimestamp > 5000) return;

  if (checkNuke(channel.guild, entry.executor, "channelDelete")) {
    punishNuker(channel.guild, entry.executor, "Mass Channel Deletion"); // Default is BAN
  }
});

client.on("roleDelete", async (role) => {
  const logs = await role.guild.fetchAuditLogs({ type: 32, limit: 1 }).catch(() => null);
  if (!logs) return;
  const entry = logs.entries.first();
  if (!entry || Date.now() - entry.createdTimestamp > 5000) return;

  if (checkNuke(role.guild, entry.executor, "roleDelete")) {
    punishNuker(role.guild, entry.executor, "Mass Role Deletion");
  }
});

// ───── AUTOBAN PROTOCOL (PERSISTENCE) ─────
client.on("guildBanRemove", async (ban) => {
  const fs = require("fs");
  const path = require("path");
  const BL_PATH = path.join(__dirname, "data/blacklist.json");

  if (fs.existsSync(BL_PATH)) {
    try {
      const blacklist = JSON.parse(fs.readFileSync(BL_PATH, "utf8"));
      if (blacklist.includes(ban.user.id)) {
        // User is blacklisted but was unbanned. FORCE RE-BAN.
        await ban.guild.members.ban(ban.user.id, { reason: "🛡️ AUTOBAN: User is globally blacklisted." })
          .then(() => console.log(`[AUTOBAN] Re-banned ${ban.user.tag} in ${ban.guild.name}`))
          .catch(e => console.error(`[AUTOBAN] Failed to re-ban ${ban.user.tag}:`, e));
      }
    } catch (e) { }
  }
});

// ───── GHOST PROTOCOL: WEBHOOK SHIELD ─────
client.on("webhooksUpdate", async (channel) => {
  const logs = await channel.guild.fetchAuditLogs({ type: 76, limit: 1 }).catch(() => null); // 76 = WEBHOOK_CREATE
  if (!logs) return;

  const entry = logs.entries.first();
  if (!entry || Date.now() - entry.createdTimestamp > 5000) return;

  const executor = entry.executor;
  if (!executor) return;

  // Whitelist Check
  const WHITELIST_PATH = path.join(__dirname, "data/whitelist.json");
  let whitelist = {};
  if (fs.existsSync(WHITELIST_PATH)) {
    try { whitelist = JSON.parse(fs.readFileSync(WHITELIST_PATH, "utf8")); } catch (e) { }
  }

  const guildWhitelist = whitelist[channel.guild.id] || [];
  const isWhitelisted = guildWhitelist.includes(executor.id) || executor.id === require("./config").BOT_OWNER_ID || channel.guild.ownerId === executor.id;

  if (!isWhitelisted) {
    try {
      // Find and delete the webhook
      const webhooks = await channel.fetchWebhooks();
      const target = webhooks.find(wh => wh.owner.id === executor.id);

      if (target) {
        await target.delete("🛡️ Ghost Protocol: Unauthorized Webhook Creation Detected.");

        // Log the interception
        const interceptEmbed = new EmbedBuilder()
          .setColor("#FF0000") // Red
          .setTitle("👻 GHOST PROTOCOL ACTIVATED")
          .setDescription(`**Intrusion Detected:** Unauthorized Webhook Creation.`)
          .addFields(
            { name: "👤 Intruder", value: `${executor} (\`${executor.id}\`)`, inline: true },
            { name: "📍 Sector", value: `${channel}`, inline: true },
            { name: "🛡️ Action", value: "Webhook Instantly Terminated", inline: false }
          )
          .setFooter({ text: "BlueSealPrime • Webhook Shield" })
          .setTimestamp();

        logToChannel(channel.guild, "misuse", interceptEmbed);

        // PUNISHMENT: Automatic Ejection
        const member = await channel.guild.members.fetch(executor.id).catch(() => null);
        if (member && member.kickable) {
          try {
            const dmEmbed = new EmbedBuilder()
              .setColor("#FF0000")
              .setTitle("🛡️ SECURITY SYSTEM: GHOST PROTOCOL")
              .setDescription(`You attempted to create a **Webhook** in **${channel.guild.name}** without authorization.\n\n**Action Taken:** Automatic Server Ejection.`)
              .setFooter({ text: "BlueSealPrime Anti-Intrusion System" });

            await executor.send({ embeds: [dmEmbed] }).catch(() => { });
            await member.kick("🛡️ Ghost Protocol: Unauthorized Webhook Creation.");
          } catch (e) { }
        }
      }
    } catch (err) {
      console.error("Ghost Protocol Error:", err);
    }
  }
});

// ───── SOVEREIGN STRIP: DANGEROUS ROLE PROTECTION ─────
client.on("guildMemberUpdate", async (oldMember, newMember) => {
  // Only check if roles were added
  const addedRoles = newMember.roles.cache.filter(r => !oldMember.roles.cache.has(r.id));
  if (addedRoles.size === 0) return;

  const dangerousPerms = [
    PermissionsBitField.Flags.Administrator,
    PermissionsBitField.Flags.ManageRoles,
    PermissionsBitField.Flags.ManageChannels,
    PermissionsBitField.Flags.ManageGuild,
    PermissionsBitField.Flags.ManageWebhooks,
    PermissionsBitField.Flags.MentionEveryone,
    PermissionsBitField.Flags.BanMembers,
    PermissionsBitField.Flags.KickMembers
  ];

  const hasDangerousGrant = addedRoles.some(role =>
    dangerousPerms.some(perm => role.permissions.has(perm))
  );

  if (!hasDangerousGrant) return;

  // Audit Interrogation
  const logs = await newMember.guild.fetchAuditLogs({ type: 25, limit: 1 }).catch(() => null); // 25 = MEMBER_ROLE_UPDATE
  if (!logs) return;

  const entry = logs.entries.first();
  if (!entry || Date.now() - entry.createdTimestamp > 5000) return;

  const executor = entry.executor;
  if (!executor || executor.id === client.user.id) return;

  // Whitelist Check
  const WHITELIST_PATH = path.join(__dirname, "data/whitelist.json");
  let whitelist = {};
  if (fs.existsSync(WHITELIST_PATH)) {
    try { whitelist = JSON.parse(fs.readFileSync(WHITELIST_PATH, "utf8")); } catch (e) { }
  }

  const guildWhitelist = whitelist[newMember.guild.id] || [];
  const isWhitelisted = guildWhitelist.includes(executor.id) || executor.id === require("./config").BOT_OWNER_ID || newMember.guild.ownerId === executor.id;

  if (!isWhitelisted) {
    try {
      // 1. Log the Breach
      const breachEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("🛡️ SOVEREIGN STRIP ACTIVATED")
        .setDescription(`**High-Risk Elevation Detected.** Unauthorized grant of dangerous permissions.`)
        .addFields(
          { name: "👤 Executor (Stripping)", value: `${executor} (\`${executor.id}\`)`, inline: true },
          { name: "👤 Target (Ejecting)", value: `${newMember.user} (\`${newMember.id}\`)`, inline: true },
          { name: "🚩 Critical Roles", value: addedRoles.map(r => `${r.name}`).join(", "), inline: false }
        )
        .setFooter({ text: "BlueSealPrime • Sovereign Security" })
        .setTimestamp();

      logToChannel(newMember.guild, "misuse", breachEmbed);

      // 2. Punish Executor: Sovereign Strip (Remove all roles)
      const executorMember = await newMember.guild.members.fetch(executor.id).catch(() => null);
      if (executorMember && executorMember.manageable) {
        await executorMember.roles.set([]).catch(() => { });
        const dmExecutor = new EmbedBuilder()
          .setColor("#FF0000")
          .setTitle("🛡️ SOVEREIGN STRIP: ACCESS REVOKED")
          .setDescription(`You have been **Stripped** of all roles in **${newMember.guild.name}** for attempting to grant unauthorized dangerous permissions.`)
          .setFooter({ text: "BlueSealPrime Anti-Intrusion" });
        await executor.send({ embeds: [dmExecutor] }).catch(() => { });
      }

      // 3. Punish Target: Automatic Ejection
      if (newMember.kickable) {
        const dmTarget = new EmbedBuilder()
          .setColor("#FF0000")
          .setTitle("🛡️ SECURITY SYSTEM: EJECTED")
          .setDescription(`You were granted unauthorized dangerous permissions in **${newMember.guild.name}**.\n\n**Action Taken:** Automatic Server Ejection.`)
          .setFooter({ text: "BlueSealPrime Anti-Intrusion" });
        await newMember.send({ embeds: [dmTarget] }).catch(() => { });
        await newMember.kick("🛡️ Sovereign Strip: Target of unauthorized dangerous role elevation.");
      }
    } catch (err) {
      console.error("Sovereign Strip Error:", err);
    }
  }
});

client.on("guildBanAdd", async (ban) => {
  // 1. Audit Log Check
  const logs = await ban.guild.fetchAuditLogs({ type: 22, limit: 1 }).catch(() => null);
  const entry = logs?.entries.first();
  const executor = entry ? entry.executor : null;
  const reason = entry ? entry.reason : "No reason provided";

  // 2. Global Log
  const banEmbed = new EmbedBuilder()
    .setColor("#8B0000") // Dark Red
    .setTitle("🔨 MEMBER BANNED")
    .setThumbnail(ban.user.displayAvatarURL())
    .addFields(
      { name: "👤 User", value: `${ban.user.tag} (\`${ban.user.id}\`)`, inline: true },
      { name: "🛡️ Executor", value: executor ? `${executor.tag}` : "Unknown", inline: true },
      { name: "📝 Reason", value: `${reason}`, inline: false }
    )
    .setFooter({ text: "BlueSealPrime • Global Ban Log" })
    .setTimestamp();

  logToChannel(ban.guild, "mod", banEmbed);

  // 3. Anti-Nuke Logic
  if (entry && Date.now() - entry.createdTimestamp < 5000) {
    if (checkNuke(ban.guild, entry.executor, "ban")) {
      punishNuker(ban.guild, entry.executor, "Mass Banning");
    }
  }
});

// Redundant listener removed



// ───── LOGGING EVENT HANDLER ─────
async function logToChannel(guild, type, embed) {
  // 1. GLOBAL DASHBOARD FORWARDING
  if (process.env.MONITOR_CHANNEL_ID) {
    try {
      const monitorChannel = await guild.client.channels.fetch(process.env.MONITOR_CHANNEL_ID).catch(() => null);
      if (monitorChannel) {
        const dashGuild = monitorChannel.guild;
        // Don't log if we are IN the dashboard guild (loop prevention)
        if (guild.id !== dashGuild.id) {
          const channelName = `📂︱${guild.name.replace(/[^a-zA-Z0-9]/g, "").substring(0, 20) || "unknown"}`.toLowerCase();
          const logChannel = dashGuild.channels.cache.find(c => c.name === channelName);
          if (logChannel) {
            const forwardEmbed = new EmbedBuilder(embed.data);
            const oldFooter = forwardEmbed.data.footer?.text || "";
            forwardEmbed.setFooter({
              text: `[${type.toUpperCase()}] ${oldFooter}`,
              iconURL: guild.iconURL()
            });
            logChannel.send({ embeds: [forwardEmbed] }).catch(() => { });
          }
        }
      }
    } catch (e) { }
  }

  // 2. LOCAL LOGGING
  const LOGS_DB = path.join(__dirname, "data/logs.json");
  if (!fs.existsSync(LOGS_DB)) return;

  let data = {};
  try { data = JSON.parse(fs.readFileSync(LOGS_DB, "utf8")); } catch (e) { return; }

  const channelId = data[guild.id]?.[type] || data[guild.id]?.["server"];
  if (!channelId) return;

  const channel = guild.channels.cache.get(channelId);
  if (channel) channel.send({ embeds: [embed] }).catch(() => { });
}

// 1. Message Logs & ANTI-GHOST PING
// Consolidated listeners area
// All event listeners for logging are handled above.



// ───── SERVER STATS UPDATER ─────
setInterval(async () => {

  const STATS_DB = path.join(__dirname, "data/serverstats.json");
  if (!fs.existsSync(STATS_DB)) return;

  let data = {};
  try { data = JSON.parse(fs.readFileSync(STATS_DB, "utf8")); } catch (e) { return; }

  for (const [guildId, config] of Object.entries(data)) {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) continue;

    try {
      // Total
      if (config.totalId) {
        const ch = guild.channels.cache.get(config.totalId);
        if (ch) await ch.setName(`Total Members: ${guild.memberCount}`).catch(() => { });
      }
      // Bots
      if (config.botsId) {
        const ch = guild.channels.cache.get(config.botsId);
        // Need to ensure members are cached or fetch count? 
        // guild.memberCount is accurate. Bot count might require fetch if not cached?
        // For now rely on cache or just Total.
        // Let's rely on cache for bots (usually fine for small/medium bots, larger bots use sharding/intents)
        const botCount = guild.members.cache.filter(m => m.user.bot).size;
        if (ch) await ch.setName(`Bots: ${botCount}`).catch(() => { });
      }
    } catch (e) {
      console.error(`Failed to update stats for ${guild.name}:`, e);
    }
  }
}, 600000); // 10 Minutes


require("dotenv").config();
const http = require("http");


client.once("clientReady", () => {
  console.log(`✅ ${client.user.tag} online and stable`);

  // PREMIUM STATUS ROTATION
  const activities = [
    { name: "Server Security | 🛡️ Active", type: 3 }, // Watching
    { name: "Packet Traffic | 🟢 Stable", type: 3 },
    { name: "for Intruders | 👁️ Scanning", type: 3 },
    { name: "BlueSealPrime v2.0 | 👑 Online", type: 0 } // Playing
  ];

  let i = 0;
  setInterval(() => {
    client.user.setPresence({
      activities: [activities[i]],
      status: 'dnd', // Red "Do Not Disturb" circle looks more aggressive/active than green online
    });
    i = (i + 1) % activities.length;
  }, 10000);
});

// 👇 KEEP RAILWAY ALIVE (THIS IS REQUIRED)
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200);
  res.end("BlueSealPrime alive");
}).listen(PORT, () => {
  console.log(`🌐 HTTP server listening on ${PORT}`);
});


// ───── LOGIN ─────
client.login(process.env.TOKEN);





