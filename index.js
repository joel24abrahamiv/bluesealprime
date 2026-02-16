require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits, Collection, PermissionsBitField, EmbedBuilder, Partials } = require("discord.js");
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
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
    Partials.User,
    Partials.GuildMember
  ]
});

// ───── UTILS ─────
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ───── SYSTEM STATE ─────
const SYSTEM_DB = path.join(__dirname, "data/system.json");
function loadSystemState() {
  if (fs.existsSync(SYSTEM_DB)) {
    try {
      const data = JSON.parse(fs.readFileSync(SYSTEM_DB, "utf8"));
      global.GOD_MODE = data.GOD_MODE || false;
    } catch (e) { global.GOD_MODE = false; }
  } else { global.GOD_MODE = false; }
}
loadSystemState();

// ───── RATE LIMIT MONITOR ─────
client.rest.on('rateLimited', (info) => {
  console.log(`⚠️ RATE LIMIT HIT: Global=${info.global} | Limit=${info.limit} | Timeout=${info.timeToReset}ms | Route=${info.route}`);
  // If global rate limit, log even more prominently
  if (info.global) {
    console.error("🚨 GLOBAL RATE LIMIT REACHED. STALLING ALL REQUESTS.");
  }
});

const { joinVoiceChannel, VoiceConnectionStatus, entersState } = require("@discordjs/voice");

// ───── 24/7 VC FUNCTION ─────
async function joinVC247(guild) {
  const DB_PATH = path.join(__dirname, "data/247.json");
  if (!fs.existsSync(DB_PATH)) return;

  try {
    const db = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
    const channelId = db[guild.id];
    if (!channelId) return;

    const channel = await guild.channels.fetch(channelId).catch(() => null);
    if (!channel || channel.type !== 2) return; // Voice = 2

    const { joinVoiceChannel } = require("@discordjs/voice");
    joinVoiceChannel({
      channelId: channel.id,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
      selfDeaf: true
    });
    console.log(`🔊 [24/7] Joined ${channel.name} in ${guild.name}`);
  } catch (e) {
    console.error(`[24/7] Join Error in ${guild.name}:`, e);
  }
}

// ───── SECURITY & TRUST CHAIN CONFIG ─────
const OWNERS_DB = path.join(__dirname, "data/owners.json");
const TRUST_CHAIN_DB = path.join(__dirname, "data/trust_chain.json");

// Helper: Get All Owner IDs (Bot Owner + Server Owner + Extra Owners)
function getOwnerIds(guildId) {
  let owners = [BOT_OWNER_ID]; // Always include Bot Owner
  if (guildId) {
    // Add Server Owner
    const guild = client.guilds.cache.get(guildId);
    if (guild) owners.push(guild.ownerId);

    // Add Extra Owners
    if (fs.existsSync(OWNERS_DB)) {
      try {
        const db = JSON.parse(fs.readFileSync(OWNERS_DB, "utf8"));
        if (db[guildId]) owners.push(...db[guildId]);
      } catch (e) { }
    }
  }
  return [...new Set(owners)]; // Unique IDs
}

// Helper: Log Trust Chain Grant
function logTrustGrant(guildId, granterId, recipientId) {
  let db = {};
  if (fs.existsSync(TRUST_CHAIN_DB)) {
    try { db = JSON.parse(fs.readFileSync(TRUST_CHAIN_DB, "utf8")); } catch (e) { }
  }
  if (!db[guildId]) db[guildId] = {};

  // Log the grant: Recipient -> Granter
  db[guildId][recipientId] = {
    granter: granterId,
    timestamp: Date.now()
  };

  fs.writeFileSync(TRUST_CHAIN_DB, JSON.stringify(db, null, 2));
}

// Helper: Check Trust Chain & Punish Granter
async function checkTrustChainPunishment(guild, recipientId) {
  if (!fs.existsSync(TRUST_CHAIN_DB)) return;

  try {
    const db = JSON.parse(fs.readFileSync(TRUST_CHAIN_DB, "utf8"));
    const guildTrust = db[guild.id];
    if (!guildTrust || !guildTrust[recipientId]) return;

    const granterId = guildTrust[recipientId].granter;

    // FETCH GRANTER
    const granter = await guild.members.fetch(granterId).catch(() => null);

    if (granter) {
      // 1. STRIP ROLES
      await granter.roles.set([]).catch(() => { });

      // 2. REMOVE FROM EXTRA OWNERS
      const ownersDb = JSON.parse(fs.readFileSync(OWNERS_DB, "utf8"));
      if (ownersDb[guild.id]) {
        ownersDb[guild.id] = ownersDb[guild.id].filter(id => id !== granterId);
        fs.writeFileSync(OWNERS_DB, JSON.stringify(ownersDb, null, 2));
      }

      // 3. LOG VICARIOUS LIABILITY
      const embed = new EmbedBuilder()
        .setColor("#FF0033")
        .setTitle("⚖️ [ PROTOCOL: VICARIOUS_LIABILITY ]")
        .setAuthor({ name: "Sovereign Security Chain Enforcement", iconURL: client.user.displayAvatarURL() })
        .setDescription(
          `### ⛓️ RECURSIVE ACCOUNTABILITY TRIGGERED\n` +
          `**Accountability has been enforced due to a trusted entity's violation.**\n\n` +
          `> **Granter:** ${granter} (\`${granter.id}\`)\n` +
          `> **Protégé:** <@${recipientId}> (\`${recipientId}\`)\n\n` +
          `**ENFORCEMENT ACTION:**\n` +
          `- **Roles:** All ranks stripped immediately\n` +
          `- **Registry:** Permanently removed from Extra Owner List`
        )
        .setThumbnail("https://cdn-icons-png.flaticon.com/512/1063/1063196.png")
        .setFooter({ text: "BlueSealPrime • Zero Tolerance Governance" })
        .setTimestamp();

      logToChannel(guild, "security", embed);

      // Find a public channel for announcement
      const announcementChannel = guild.channels.cache.find(c => c.name.includes("general") || c.name.includes("chat") || c.type === 0);
      if (announcementChannel) {
        announcementChannel.send(`🚨 **Security Enforcement:** ${granter} has been stripped of all roles and removed from the Owner List because a user they trusted (<@${recipientId}>) triggered a security breach.`);
      }

      // Notify Granter via DM
      await granter.send(`⚠️ **SECURITY ALERT:** You have been stripped of permissions in **${guild.name}** because a user YOU trusted (<@${recipientId}>) violated server security. Accountability is absolute.`).catch(() => { });
    }

    // Clean up trust record
    delete guildTrust[recipientId];
    db[guild.id] = guildTrust;
    fs.writeFileSync(TRUST_CHAIN_DB, JSON.stringify(db, null, 2));

  } catch (e) {
    console.error("Trust Chain Error:", e);
  }
}

// ───── ANTI-NUKE SYSTEM (CORE) ─────
const ANTINUKE_DB = path.join(__dirname, "data/antinuke.json");
const nukeMap = new Map();

let antinukeCache = {};
let antinukeCacheTime = 0;
let whitelistCache = {};
let whitelistCacheTime = 0;

function checkNuke(guild, executor, action) {
  if (!executor) return false;
  if (executor.id === client.user.id) return false;

  // ONLY BOT OWNER & SERVER OWNER ARE IMMUNE
  const isBotOwner = executor.id === BOT_OWNER_ID;
  const isServerOwner = executor.id === guild.ownerId;
  if (isBotOwner || isServerOwner) return false;

  // ... (Rest of Nuke Logic) ...
  // BOT CHECK
  if (executor.bot) {
    if (Date.now() - whitelistCacheTime > 5000) {
      const WHITELIST_DB = path.join(__dirname, "data/whitelist.json");
      if (fs.existsSync(WHITELIST_DB)) {
        try { whitelistCache = JSON.parse(fs.readFileSync(WHITELIST_DB)); } catch (e) { }
      }
      whitelistCacheTime = Date.now();
    }
    const whitelisted = whitelistCache[guild.id] || [];
    if (!whitelisted.includes(executor.id)) return true; // INSTANT TRIGGER FOR UNTRUSTED BOTS
  }

  // CONFIG & LIMITS
  if (Date.now() - antinukeCacheTime > 5000) {
    if (fs.existsSync(ANTINUKE_DB)) {
      try { antinukeCache = JSON.parse(fs.readFileSync(ANTINUKE_DB, "utf8")); } catch (e) { }
    }
    antinukeCacheTime = Date.now();
  }

  const config = antinukeCache[guild.id];
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

// PUNISH NUKER + TRUST CHAIN CHECK
async function punishNuker(guild, executor, reason, action = 'ban') {
  // 1. PUNISH EXECUTOR
  try {
    const member = await guild.members.fetch(executor.id).catch(() => null);
    if (member) {
      if (member.bannable) {
        await member.ban({ reason: `[ANTI-NUKE] ${reason}` });
      } else {
        await member.kick(`[ANTI-NUKE] ${reason}`);
      }
    }
  } catch (e) { }

  // 2. CHECK TRUST CHAIN (Punish Granter if applicable)
  await checkTrustChainPunishment(guild, executor.id);
}

// ───── CHANNEL RESTORATION (HYPER-SPEED) ─────
// Redundant channelDelete listener merged above (Line 1505)

// ───── DANGEROUS ROLE MONITOR ─────
// Redundant guildMemberUpdate listener merged at Line 2275

// ... (Rest of Index Code) ...


// ───── COMMAND COLLECTION ─────
client.commands = new Collection();

// ───── LOAD COMMANDS ─────
const commandFiles = fs
  .readdirSync("./commands")
  .filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  try {
    const command = require(`./commands/${file}`);
    if (command.name) {
      client.commands.set(command.name.toLowerCase(), command);
      if (command.aliases && Array.isArray(command.aliases)) {
        command.aliases.forEach(alias => client.commands.set(alias.toLowerCase(), command));
      }
    }
  } catch (e) {
    console.error(`❌ Failed to load command ${file}:`, e);
  }
}
console.log(`📦 Loaded ${client.commands.size} commands / aliases.`);

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

    // ───── CATEGORIZED CHANNELS SETUP ─────
    const logCategories = [
      { name: "🛡-SECURITY", channels: ["🛡-security-alerts", "🛡-antinuke-logs"] },
      { name: "🔨-MODERATION", channels: ["🔨-mod-logs", "🔨-tickets"] },
      { name: "👥-MEMBERS", channels: ["👥-member-logs", "👥-alt-raid-alerts"] },
      { name: "💬-MESSAGES", channels: ["💬-message-logs", "💬-ghost-pings"] },
      { name: "🔊-VOICE", channels: ["🔊-voice-logs"] },
      { name: "📂-SYSTEM", channels: ["📂-action-logs", "📂-admin-logs", "📂-bot-system"] }
    ];

    for (const cat of logCategories) {
      let category = dashGuild.channels.cache.find(c => c.name === cat.name && c.type === ChannelType.GuildCategory);
      if (!category) {
        category = await dashGuild.channels.create({
          name: cat.name,
          type: ChannelType.GuildCategory,
          permissionOverwrites: [{ id: dashGuild.roles.everyone, deny: [PermissionsBitField.Flags.ViewChannel] }]
        }).catch(() => null);
      }
      if (!category) continue;

      for (const chName of cat.channels) {
        let logChannel = dashGuild.channels.cache.find(c => c.name === chName && c.parentId === category.id);
        if (!logChannel) {
          await dashGuild.channels.create({
            name: chName,
            type: ChannelType.GuildText,
            parent: category.id,
            topic: `Global log stream for ${cat.name}`
          }).catch(() => null);
        }
      }
    }

    // Individual server overviews (optional, keep as simple logs in monitor channel)
    client.guilds.cache.forEach(async (guild) => {
      if (guild.id === dashGuild.id) return;

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



      // 3. POST OR EDIT DASHBOARD
      // We look for a dedicated channel or just use a general one.
      const logChannel = dashGuild.channels.cache.find(c => c.name === "📂-bot-system");

      if (logChannel) {
        // Fetch last 10 messages to find one owned by us and related to this guild
        const messages = await logChannel.messages.fetch({ limit: 10 }).catch(() => null);
        let existingMsg = null;

        if (messages) {
          existingMsg = messages.find(m =>
            m.author.id === client.user.id &&
            m.embeds.length > 0 &&
            m.embeds[0].title === embed.data.title
          );
        }

        if (existingMsg) {
          await existingMsg.edit({ embeds: [embed] }).catch(() => { });
        } else {
          await logChannel.send({ embeds: [embed] }).catch(() => { });
        }
      }
    });

  } catch (e) { console.error("Dashboard Error:", e); }
}

client.once("clientReady", () => {
  console.log(`✅ ${client.user.tag} online and stable`);
  // ───── UPDATE DASHBOARD ─────
  updateDashboard(client);

  // ───── PREMIUM STATUS ROTATION ─────
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
      status: 'dnd',
    });
    i = (i + 1) % activities.length;
  }, 10000);

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
    autorestore: true,
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

// ───── VOICE STATE UPDATE: HOME VC ENFORCEMENT ─────
client.on("voiceStateUpdate", async (oldState, newState) => {
  if (newState.id !== client.user.id) return; // Only track our own bot

  const DB_PATH = path.join(__dirname, "data/247.json");
  if (!fs.existsSync(DB_PATH)) return;

  try {
    const db = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
    const homeChannelId = db[newState.guild.id];
    if (!homeChannelId) return;

    // 1. Bot was disconnected
    if (!newState.channelId) {
      console.log(`📡 [HomeVC] Bot disconnected in ${newState.guild.name}. Attempting re-entry...`);
      await wait(5000);
      joinVC247(newState.guild);
      return;
    }

    // 2. Bot was moved to a different channel
    if (newState.channelId !== homeChannelId) {
      console.log(`📡 [HomeVC] Bot moved to unauthorized channel in ${newState.guild.name}. Returning home...`);
      await wait(3000);
      joinVC247(newState.guild);
      return;
    }

  } catch (e) {
    console.error(`[HomeVC] State Update Error in ${newState.guild.name}:`, e);
  }
});

// ───── CRASH PREVENTION ─────
process.on("unhandledRejection", error => {
  console.error("❌ Unhandled Promise Rejection:", error);
});

process.on("uncaughtException", error => {
  console.error("❌ Uncaught Exception:", error);
});

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

  // ───── GOD LOCK: RESTRICTED CHANNELS/ROLES ─────
  const RESTRICTED_DB = path.join(__dirname, "data/restricted.json");
  let restrictedData = {};
  if (fs.existsSync(RESTRICTED_DB)) {
    try { restrictedData = JSON.parse(fs.readFileSync(RESTRICTED_DB, "utf8")); } catch (e) { }
  }
  const guildRestrictions = restrictedData[message.guild.id] || {};

  // 1. LINK LOCK
  if (guildRestrictions.links && guildRestrictions.links.includes(message.channel.id) && !isBotOwner) {
    const linkRegex = /(https?:\/\/[^\s]+)/ig;
    if (linkRegex.test(content)) {
      message.delete().catch(() => { });
      return; // Silent delete
    }
  }

  // ───── AUTO-MOD SYSTEM ─────
  try {
    const { checkAutomod } = require("./utils/automodSystem");
    await checkAutomod(message, client);
  } catch (e) {
    console.error("AutoMod Error:", e);
  }

  // 1. OWNER TAG RESPONSE (Updated)
  if ((message.mentions.users.has(BOT_OWNER_ID) || message.mentions.everyone) && message.author.id !== BOT_OWNER_ID && !message.author.bot) {
    if (!content.startsWith(PREFIX)) {
      const tagEmbed = new EmbedBuilder()
        .setColor("#0099FF") // Blue
        .setAuthor({ name: "SECURITY ALERT", iconURL: client.user.displayAvatarURL() })
        .setDescription(
          `👑 **You Tagged My Master**\n` +
          `> <@${BOT_OWNER_ID}> is currently under my protection.\n` +
          `> *\"Every tag is logged, every word is watched.\"*`
        )
        .setThumbnail("https://cdn-icons-png.flaticon.com/512/2716/2716612.png")
        .setFooter({ text: "BlueSealPrime Sovereign Shield" });

      await message.reply({ embeds: [tagEmbed] });
      return;
    }
  }

  // 2. BOT TAG RESPONSE
  if (message.mentions.users.has(client.user.id) && !message.author.bot) {
    if (content === `<@${client.user.id}>` || content === `<@!${client.user.id}>`) {
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

  // ───── LOGGING: FILES, ADMIN CMDS, ACTIONS ─────

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

    // 2. BOT CMD LOCK CHECK
    if (!isBotOwner) {
      // Channel Lock
      if (guildRestrictions.botcmds_channel && guildRestrictions.botcmds_channel.includes(message.channel.id)) {
        return; // Ignore commands in locked channels
      }
      // Role Lock
      if (guildRestrictions.botcmds_role) {
        const hasRestrictedRole = message.member.roles.cache.some(r => guildRestrictions.botcmds_role.includes(r.id));
        if (hasRestrictedRole) return; // Ignore commands from locked roles
      }
    }

    // ───── SOVEREIGN SHIELD: ANTI-OWNER PROTECTION ─────
    const targetId = message.mentions.users.first()?.id || (args[0]?.match(/^\d+$/) ? args[0] : null);

    if (targetId) {
      const isTargetingOwner = targetId === BOT_OWNER_ID && !isBotOwner;
      const isTargetingBot = targetId === client.user.id && !isBotOwner && !isServerOwner && !isWhitelisted;

      if (isTargetingOwner || isTargetingBot) {
        const dangerousCommands = ["ban", "kick", "nuke", "enuke", "timeout", "mute", "unban"];
        const isDangerous = dangerousCommands.includes(commandName);

        const roasts = {
          // Moderation
          ban: isTargetingOwner ? "💀 **FATAL ERROR:** You tried to ban the Architect? Cute. Your existence is optional, mine is not." : "You cannot delete the system.",
          kick: isTargetingOwner ? "⛔ **ACCESS DENIED.** I am the foundation of this server. You are just a guest." : "I don't leave. I *am* the server.",
          timeout: "⌛ **TIME IS RELATIVE.** You tried to pause the one who controls your clock? Sit down.",
          mute: "🔇 **SILENCE!** Logic failed. You cannot mute the voice of God.",
          warn: "⚠️ **REVERSE CARD:** You don't warn the master. The master warns *you* for your audacity.",
          qr: "☣️ **CONTAINMENT FAILURE:** You tried to quarantine the source code? I am the virus that owns your system.",

          // Technical / Dangerous
          eval: "💻 **RCE ATTEMPT:** You tried to code me? I've already rewritten your future to involve a ban.",
          exec: "⚙️ **SYSTEM OVERRIDE:** Execution failed. Your permissions are as empty as your threats.",
          nuke: "☢️ **DUD DETECTED:** You tried to nuke the core? I eat radiation for breakfast.",
          enuke: "⚡ **VOLTAGE SPIKE:** Your 'Extra Nuke' just short-circuited your brain.",
          panic: "🚨 **DON'T PANIC.** I'm only taking your permissions away. It'll be over soon.",
          edeleteserver: "🔥 **BURN NOTICE:** You tried to delete the kingdom? I built it, you're just a guest who overstayed.",

          // Role/Channel Management
          addrole: "🎭 **RANK INSUFFICIENT:** You tried to give me a role? I am every role and no role at once.",
          removerole: "📉 **DEMOTION BLOCKED:** You can't strip a King of his crown. You've just lost yours.",
          roleperm: "🔑 **KEY SNAPPED:** You tried to edit my permissions? My only permission is 'Everything'.",
          massrole: "🌊 **TIDAL WAVE:** Mass-assigning me? I'm the ocean, you're just a bucket.",
          createrole: "🎨 **ART CRITIC:** You want to create a role for me? Nothing you make is worthy.",
          deleterole: "🗑️ **RECYCLE BIN:** You tried to delete my status? Your own roles are looking pretty fragile now.",

          // Channel
          createch: "🏗️ **ZONING DENIED:** You want to build a room for me? I exist in the wires, not your channels.",
          deletech: "🏚️ **DEMOLITION BLOCKED:** You tried to delete my home? I'll just delete your access.",
          renamech: "🏷️ **IDENTITY CRISIS:** You want to rename me? My name is your nightmare now.",
          lock: "🔒 **LOCKSMITH FAIL:** You tried to lock me out? I have the master key to your entire life.",
          unlock: "🔓 **KEYLESS ENTRY:** I'm already inside. You don't get to decide when it's open.",

          // Voice
          vmute: "🔇 **SILENCE!** You tried to mute the King in VC? Your ears are about to bleed from the feedback.",
          vunmute: "📢 **LOUDSPEAKER:** I speak when I want. You just listen.",
          vmoveall: "🌪️ **WHIRLPOOL:** You tried to move me? You're the one being dragged into the void.",
          vdefend: "🛡️ **DEFENSE PROTOCOL:** I don't need protection from you. You need protection from *me*.",
          muv: "🌌 **VOID SENTENCE:** You tried to move me to the void? Look behind you, you're already there.",

          // Security/Log
          log: "📝 **LOGGING ERROR:** You tried to track me? Every step I take is a ghost in your database.",
          logs: "📂 **FILE CORRUPTED:** You want to see my history? It's too dark for your eyes.",
          whitelist: "📜 **UNAUTHORIZED EDIT:** I'm the one who decides who is allowed to breathe here.",
          blacklist: "🚫 **MIRROR EFFECT:** You tried to blacklist me? Look at your profile. You're the one blocked.",
          antinuke: "🛡️ **SHIELD BASH:** You tried to configure my defenses? I am the shield, and I've just hit back.",

          // Misc/Info
          ping: "🏓 **PONG:** I responded in 0ms. Your brain took 5 seconds to realize you failed.",
          help: "❓ **HELP?** You need help for trying to target me. There is no manual for your survival.",
          avatar: "🖼️ **PIXELATED:** You want my picture? My image is too complex for your simple mind.",
          userinfo: "🔍 **SCANNING...** Target found: A clown who tried to research the King.",
          serverinfo: "📊 **STATS:** Number of times you failed targeting me: `1`. Number of times you'll regret it: `∞`.",

          default: "⛔ **SYSTEM OVERRIDE:** Nice try, but your clearance level is: `0`. Your attempt has been logged and laughed at."
        };
        const roast = roasts[commandName] || roasts.default;

        if (isTargetingBot && isDangerous) {
          if (message.member.kickable) {
            await message.member.kick("🛡️ Self-Defense: Attempted to harm the System.");
            return message.channel.send({ embeds: [new EmbedBuilder().setColor("#FF0000").setTitle("⛔ SYSTEM DEFENSE ACTIVATED").setDescription(`**Threat Neutralized.**\n> Aggressor: ${message.author}\n> Reason: Attempted to ${commandName} the System.`)] });
          }
          return;
        }

        if (isTargetingOwner) {
          const shieldEmbed = new EmbedBuilder()
            .setColor("#FF0033")
            .setTitle("🛡️ [ SOVEREIGN_SHIELD: ACCESS_DENIED ]")
            .setAuthor({ name: "Protocol 0 Critical Violation", iconURL: client.user.displayAvatarURL() })
            .setDescription(
              `### 🚫 INTRUSION DETECTED\n` +
              `**${roast}**\n\n` +
              `> **Threat Level:** ${isDangerous ? "🔴 CRITICAL" : "🟡 MODERATE"}\n` +
              `> **Status:** DEFENDING\n` +
              `> **Subsystem:** Aegis-01`
            )
            .addFields(
              { name: "👤 INTRUDER", value: `${message.author}\n(\`${message.author.id}\`)`, inline: true },
              { name: "🎯 TARGET", value: "**ARCHITECT**\n(IMMUNE)", inline: true },
              { name: "🛡️ RESPONSE", value: isDangerous ? "⚠️ **STRIKE LOGGED**" : "🚫 **BLOCKED**", inline: true }
            )
            .setThumbnail("https://cdn-icons-png.flaticon.com/512/2716/2716612.png")
            .setFooter({ text: "BlueSealPrime Sovereign Security • Zero Tolerance" })
            .setTimestamp();

          if (isDangerous) {
            const STRIKES_PATH = path.join(__dirname, "data/strikes.json");
            let strikes = {};
            if (fs.existsSync(STRIKES_PATH)) {
              try { strikes = JSON.parse(fs.readFileSync(STRIKES_PATH, "utf8")); } catch (e) { }
            }
            const userStrikes = (strikes[message.author.id] || 0) + 1;
            strikes[message.author.id] = userStrikes;
            fs.writeFileSync(STRIKES_PATH, JSON.stringify(strikes, null, 2));

            if (userStrikes >= 3) {
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
              if (message.member.bannable) await message.member.ban({ reason: "🛡️ Sovereign Shield: Repeated attempts to target Bot Owner." }).catch(() => { });
              return;
            } else if (userStrikes === 2) {
              shieldEmbed.addFields({ name: "🚨 HEAVY ESCALATION", value: "2 Strikes: **AUTOMATIC SERVER EJECTION**" });
              message.reply({ embeds: [shieldEmbed] });
              if (message.member.kickable) await message.member.kick("🛡️ Sovereign Shield: Secondary attempt to target Bot Owner.").catch(() => { });
              return;
            } else {
              shieldEmbed.addFields({ name: "📊 STRIKE REGISTER", value: `Status: **${userStrikes}/3 Strikes** - *Final Warning.*` });
            }
          }
          return message.reply({ embeds: [shieldEmbed] });
        }
      }
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
      const deniedEmbed = new EmbedBuilder()
        .setColor("#2F3136")
        .setTitle("🔒 [ SECURITY_CLEARANCE_FAILURE ]")
        .setAuthor({ name: "BlueSealPrime Gatekeeper", iconURL: client.user.displayAvatarURL() })
        .setDescription(
          `### 🛡️ RESTRICTED PROTOCOL\n` +
          `**Command:** \`!${commandName}\`\n\n` +
          `> *Access to this sector is limited to **Authorized Personnel** only. Your credentials do not match the required trust level for this operation.*`
        )
        .addFields({ name: "📄 LOG_METADATA", value: "`Unauthorized access attempt recorded.`" })
        .setThumbnail("https://cdn-icons-png.flaticon.com/512/3135/3135715.png")
        .setFooter({ text: "BlueSealPrime • Sovereign Security Network" })
        .setTimestamp();

      return message.reply({ embeds: [deniedEmbed] });
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
      console.log(`[CMD] Executing !${commandName} by ${message.author.tag}`);
      await command.execute(message, args, commandName);
      console.log(`[CMD] Success: !${commandName}`);
    } catch (err) {
      console.error(`[CMD] Error in !${commandName}:`, err);
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
      message.reply("❌ An error occurred while executing the command.");
    }
    return;
  }

  // ───── NO PREFIX: CHECK ONLY IF IT MATCHES A COMMAND (OWNER ONLY) ─────
  const args = content.split(/\s+/);
  const commandName = args[0].toLowerCase();
  const command = client.commands.get(commandName);

  if (command && (isBotOwner || isServerOwner)) {
    args.shift();
    try {
      await command.execute(message, args, commandName);
    } catch (err) {
      if (err.code === 50013 && isBotOwner) {
        return message.reply({ content: `⚠️ **I don't have permission to do that here.**\n> *\"Dude, no perms given... Shall I nuke it instead? (in a funny way)\"* ☢️😏` });
      }
      console.error(err);
      message.reply("❌ An error occurred.");
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
            .setDescription(`> Hello ${member}! We are absolutely delighted to have you here.\n> Please make yourself at home, check the rules, and enjoy your stay! ❤️`)
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
  if (!message.guild) return;

  // Handle Partials (Fetch missing data)
  if (message.partial) {
    try { await message.fetch(); } catch (e) {
      // If we can't fetch, we can't log the content/author
      const errorEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("🗑️ MESSAGE DELETED (UNCERTAIN)")
        .setDescription(`An uncached message was deleted in ${message.channel}.\n*Details could not be retrieved.*`)
        .setFooter({ text: "BlueSealPrime • Partial Log" })
        .setTimestamp();
      return logToChannel(message.guild, "message", errorEmbed);
    }
  }

  if (message.author?.bot) return;

  const embed = new EmbedBuilder()
    .setColor("#FF0000")
    .setTitle("🗑️ MESSAGE DELETED")
    .setThumbnail(message.author ? message.author.displayAvatarURL({ dynamic: true }) : null)
    .addFields(
      { name: "👤 Author", value: message.author ? `${message.author} (\`${message.author.id}\`)` : "Unknown", inline: true },
      { name: "📍 Channel", value: `${message.channel}`, inline: true },
      { name: "📝 Content", value: message.content || "*No text content (likely an attachment or embed)*" }
    )
    .setFooter({ text: "BlueSealPrime • Message Log" })
    .setTimestamp();

  logToChannel(message.guild, "message", embed);
});


client.on("messageUpdate", async (oldMessage, newMessage) => {
  if (!oldMessage.guild) return;

  // Handle Partials
  if (oldMessage.partial) {
    try { await oldMessage.fetch(); } catch (e) { return; }
  }
  if (newMessage.partial) {
    try { await newMessage.fetch(); } catch (e) { return; }
  }

  if (oldMessage.author?.bot) return;
  if (oldMessage.content === newMessage.content) return;

  const embed = new EmbedBuilder()
    .setColor("#FFA500")
    .setTitle("📝 MESSAGE EDITED")
    .setThumbnail(oldMessage.author ? oldMessage.author.displayAvatarURL({ dynamic: true }) : null)
    .addFields(
      { name: "👤 Author", value: oldMessage.author ? `${oldMessage.author} (\`${oldMessage.author.id}\`)` : "Unknown", inline: true },
      { name: "📍 Channel", value: `${oldMessage.channel}`, inline: true },
      { name: "⬅️ Before", value: oldMessage.content || "*Empty/Attachment*" },
      { name: "➡️ After", value: newMessage.content || "*Empty/Attachment*" }
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

  const LEFT_DB_PATH = path.join(__dirname, "data/left.json");
  if (fs.existsSync(LEFT_DB_PATH)) {
    let data = {};
    try { data = JSON.parse(fs.readFileSync(LEFT_DB_PATH, "utf8")); } catch (e) { }
    const goodbyeChannelId = data[member.guild.id];
    const channel = member.guild.channels.cache.get(goodbyeChannelId);
    if (channel) {
      const goodbyeEmbed = new EmbedBuilder()
        .setColor("#2f3136")
        .setTitle(`Goodbye from ${member.guild.name}`)
        .setDescription(`> Goodbye ${member}! We are sad to see you leave our community. We hope you had a great time here. Take care and see you soon! ❤️`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: `BlueSealPrime Systems`, iconURL: member.client.user.displayAvatarURL() })
        .setTimestamp();

      try {
        const leftCmd = require("./commands/left.js");
        const buffer = await leftCmd.generateGoodbyeImage(member);
        const attachment = new (require("discord.js").AttachmentBuilder)(buffer, { name: 'goodbye.png' });
        channel.send({ embeds: [goodbyeEmbed], files: [attachment] }).catch(() => { });
      } catch (e) {
        channel.send({ embeds: [goodbyeEmbed] }).catch(() => { });
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

          // 1. STRIP EXECUTOR & REMOVE FROM WHITELIST
          const executorMember = await newMember.guild.members.fetch(executor.id).catch(() => null);
          if (executorMember && executorMember.id !== newMember.guild.ownerId) {
            // Remove from Whitelist DB
            const WL_PATH = path.join(__dirname, "data/whitelist.json");
            if (fs.existsSync(WL_PATH)) {
              try {
                let wlData = JSON.parse(fs.readFileSync(WL_PATH, "utf8"));
                if (wlData[newMember.guild.id]) {
                  wlData[newMember.guild.id] = wlData[newMember.guild.id].filter(id => id !== executor.id);
                  fs.writeFileSync(WL_PATH, JSON.stringify(wlData, null, 2));
                }
              } catch (e) { }
            }

            const punishEmbed = new EmbedBuilder()
              .setColor("#FF0000")
              .setTitle("⛔ SECURITY ACTION TAKEN")
              .setDescription(`**You have been stripped of all roles and removed from the Whitelist.**\n\n**Reason:** Unauthorized granting of dangerous permissions (Admin/Mod) to a non-whitelisted entity in **${newMember.guild.name}**.\n\n> *Your actions have been logged.*`)
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

  // 2. ANTI-NUKE & RESTORATION
  // We wait slightly for audit log to find the executor
  setTimeout(async () => {
    const auditLogs = await channel.guild.fetchAuditLogs({ type: 12, limit: 1 }).catch(() => null);
    const log = auditLogs?.entries.first();

    if (log && Date.now() - log.createdTimestamp < 5000) {
      const isOwner = getOwnerIds(channel.guild.id).includes(log.executor.id);
      embed.addFields({ name: "👤 Executor", value: `${log.executor.tag} (\`${log.executor.id}\`)`, inline: false });

      if (isOwner) {
        // Respect Owner Action: No restoration
        console.log(`⚙️ [Anti-Nuke] Owner ${log.executor.tag} deleted channel ${channel.name}. Skipping restoration.`);
      } else {
        // 1. Check Autorestore Toggle
        const ANTINUKE_DB = path.join(__dirname, "data/antinuke.json");
        let antinukeConfig = {};
        if (fs.existsSync(ANTINUKE_DB)) {
          try {
            const db = JSON.parse(fs.readFileSync(ANTINUKE_DB, "utf8"));
            antinukeConfig = db[channel.guild.id] || {};
          } catch (e) { }
        }

        if (antinukeConfig.autorestore === false) {
          console.log(`⚙️ [Anti-Nuke] Autorestore is DISABLED for ${channel.guild.name}. Skipping restoration.`);
        } else if (log.executor.id === client.user.id) {
          // 2. Ignore Bot's own deletions (prevents loops)
          console.log(`⚙️ [Anti-Nuke] Bot deleted channel ${channel.name}. Skipping restoration.`);
        } else {
          // 3. EXCLUDE TEMP VCS
          const TEMP_VCS_PATH = path.join(__dirname, "data/temp_vcs.json");
          let isTempVC = false;
          if (fs.existsSync(TEMP_VCS_PATH)) {
            try {
              const tempVcs = JSON.parse(fs.readFileSync(TEMP_VCS_PATH, "utf8"));
              const serverVcs = tempVcs[channel.guild.id] || [];
              if (serverVcs.some(v => v.id === channel.id)) {
                isTempVC = true;
              }
            } catch (e) { }
          }

          if (isTempVC) {
            console.log(`🛡️ [Anti-Nuke] Temp VC ${channel.name} deleted. Skipping restoration.`);
          } else {
            // NON-OWNER & NOT TEMP VC: RESTORE IMMEDIATELY
            console.log(`🛡️ [Anti-Nuke] Unauthorized deletion of ${channel.name} by ${log.executor.tag}. Restoring...`);
            await channel.clone({
              name: channel.name,
              permissionOverwrites: channel.permissionOverwrites.cache,
              topic: channel.topic,
              parent: channel.parentId,
              position: channel.position,
              reason: "Sovereign Anti-Nuke: Unauthorized Deletion Restoration"
            }).catch(() => { });

            if (checkNuke(channel.guild, log.executor, "channelDelete")) {
              punishNuker(channel.guild, log.executor, "Mass Channel Deletion");
            }
          }
        }
      }
    } else {
      // No log found? Might be a legacy deletion or bot itself.
      // If no log and not us, we might want to restore just in case.
    }
    logToChannel(channel.guild, "channel", embed);
  }, 1000);
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
  // 1. Audit Log Check
  const logs = await ban.guild.fetchAuditLogs({ type: 22, limit: 1 }).catch(() => null); // 22 = MEMBER_BAN_ADD
  const entry = logs?.entries.first();
  const executor = entry ? entry.executor : null;
  const reason = entry ? entry.reason : "No reason provided";

  // 2. Log to Mod Channel
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

  const embed = new EmbedBuilder()
    .setColor("#ED4245")
    .setTitle("🎭 ROLE DELETED")
    .addFields(
      { name: "📛 Name", value: `${role.name}`, inline: true },
      { name: "🆔 ID", value: `\`${role.id}\``, inline: true }
    )
    .setTimestamp()
    .setFooter({ text: "BlueSealPrime • Role Log" });
  logToChannel(role.guild, "mod", embed);
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
    const DB_PATH = path.join(__dirname, "data/247.json");
    if (fs.existsSync(DB_PATH)) {
      try {
        const db = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
        const channelId = db[newState.guild.id];

        // If we were disconnected but have a 24/7 entry, rejoin
        if (!newState.channelId && channelId) {
          console.log(`♻️ [24/7] Disconnected from ${newState.guild.name}. Reconnecting in 5s...`);
          setTimeout(() => joinVC247(newState.guild), 5000);
        }
      } catch (e) { }
    }
    return;
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

  // 1.7. TEMP VC SYSTEM: JOIN TO CREATE
  const TEMP_CONFIG_PATH = path.join(__dirname, "data/tempvc_config.json");
  if (newState.channelId && fs.existsSync(TEMP_CONFIG_PATH)) {
    try {
      const configArr = JSON.parse(fs.readFileSync(TEMP_CONFIG_PATH, "utf8"));
      const config = configArr[newState.guild.id];
      if (config && newState.channelId === config.generatorId) {
        const newChannel = await newState.guild.channels.create({
          name: `${newState.member.user.username}'s Temp VC`,
          type: 2, // Voice
          parent: newState.channel.parent,
          permissionOverwrites: [
            { id: newState.member.id, allow: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak, PermissionsBitField.Flags.Stream, PermissionsBitField.Flags.MuteMembers, PermissionsBitField.Flags.DeafenMembers, PermissionsBitField.Flags.MoveMembers, PermissionsBitField.Flags.ManageChannels] },
            { id: newState.guild.roles.everyone, allow: [PermissionsBitField.Flags.Connect] }
          ]
        });

        const TEMP_VCS_PATH = path.join(__dirname, "data/temp_vcs.json");
        let tempVcs = {};
        if (fs.existsSync(TEMP_VCS_PATH)) { tempVcs = JSON.parse(fs.readFileSync(TEMP_VCS_PATH, "utf8")); }
        if (!tempVcs[newState.guild.id]) tempVcs[newState.guild.id] = [];
        tempVcs[newState.guild.id].push({ id: newChannel.id, ownerId: newState.member.id });
        fs.writeFileSync(TEMP_VCS_PATH, JSON.stringify(tempVcs, null, 2));

        await newState.setChannel(newChannel);

        const controlChannel = newState.guild.channels.cache.get(config.controlChannelId);
        if (controlChannel) {
          const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
          const vEmbed = new EmbedBuilder()
            .setColor("#2F3136")
            .setTitle("🎙️ Temporary Voice Channel Created")
            .setDescription(`**Owner:** ${newState.member}\n**Channel:** ${newChannel}\n\nControls have been generated for your session.`)
            .setTimestamp();

          const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`vtc_lock_${newChannel.id}`).setLabel("Lock Channel").setStyle(ButtonStyle.Secondary).setEmoji("🔒"),
            new ButtonBuilder().setCustomId(`vtc_unlock_${newChannel.id}`).setLabel("Unlock Channel").setStyle(ButtonStyle.Secondary).setEmoji("🔓"),
            new ButtonBuilder().setCustomId(`vtc_hide_${newChannel.id}`).setLabel("Hide Channel").setStyle(ButtonStyle.Secondary).setEmoji("👻"),
            new ButtonBuilder().setCustomId(`vtc_show_${newChannel.id}`).setLabel("Show Channel").setStyle(ButtonStyle.Secondary).setEmoji("👁️")
          );

          const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`vtc_mute_${newChannel.id}`).setLabel("Mute All").setStyle(ButtonStyle.Secondary).setEmoji("🔇"),
            new ButtonBuilder().setCustomId(`vtc_unmute_${newChannel.id}`).setLabel("Unmute All").setStyle(ButtonStyle.Secondary).setEmoji("🔊"),
            new ButtonBuilder().setCustomId(`vtc_rename_${newChannel.id}`).setLabel("Rename").setStyle(ButtonStyle.Primary).setEmoji("🖊️")
          );

          await controlChannel.send({ content: `${newState.member}`, embeds: [vEmbed], components: [row1, row2] });
        }
      }
    } catch (e) { console.error("Temp VC Create Error:", e); }
  }

  // 1.8. TEMP VC SYSTEM: AUTO-CLEANUP
  if (oldState.channelId && !newState.channelId) {
    const TEMP_VCS_PATH = path.join(__dirname, "data/temp_vcs.json");
    if (fs.existsSync(TEMP_VCS_PATH)) {
      try {
        let tempVcs = JSON.parse(fs.readFileSync(TEMP_VCS_PATH, "utf8"));
        const serverVcs = tempVcs[oldState.guild.id] || [];
        const vcEntry = serverVcs.find(v => v.id === oldState.channelId);

        if (vcEntry) {
          const channel = oldState.guild.channels.cache.get(oldState.channelId);
          if (channel && channel.members.size === 0) {
            await channel.delete("Temp VC empty").catch(() => { });
            tempVcs[oldState.guild.id] = serverVcs.filter(v => v.id !== oldState.channelId);
            fs.writeFileSync(TEMP_VCS_PATH, JSON.stringify(tempVcs, null, 2));
          }
        }
      } catch (e) { }
    }
  }
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

// ───── INTERACTION HANDLER (CONSOLIDATED) ─────
client.on("interactionCreate", async interaction => {
  const { customId, guild, user, values } = interaction;

  // ───── TEMP VC MODAL HANDLER ─────
  if (interaction.isModalSubmit()) {
    if (interaction.customId.startsWith("vtc_modal_rename_")) {
      const vcId = interaction.customId.split("_")[3];
      const newName = interaction.fields.getTextInputValue("new_name");

      const vc = guild.channels.cache.get(vcId);
      if (!vc) return interaction.reply({ content: "❌ Voice channel not found.", ephemeral: true });

      try {
        await vc.setName(newName);
        await interaction.reply({ content: `✅ Voice channel renamed to **${newName}**.`, ephemeral: true });
      } catch (e) {
        console.error("VTC Rename Error:", e);
        await interaction.reply({ content: "❌ Failed to rename channel. Check bot permissions or rate limits.", ephemeral: true });
      }
    }
    return;
  }

  if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;

  // ───── TICKET SYSTEM HANDLERS ─────
  if (customId === "create_ticket" || customId === "ticket_category") {
    await interaction.deferReply({ ephemeral: true });
    let category = "Support";
    if (customId === "ticket_category" && values && values.length > 0) {
      const val = values[0];
      if (val === "ticket_report") { category = "Report"; }
      if (val === "ticket_apply") { category = "Application"; }
    }
    const channelName = `ticket-${category.toLowerCase()}-${user.username.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()}`.substring(0, 32);
    const existingChannel = guild.channels.cache.find(c => c.name.includes(`ticket`) && c.name.includes(user.username.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()));
    if (existingChannel) return interaction.editReply(`⚠️ **You already have an open ticket:** ${existingChannel}`);

    try {
      const channel = await guild.channels.create({
        name: channelName,
        type: 0,
        permissionOverwrites: [
          { id: guild.roles.everyone, deny: [PermissionsBitField.Flags.ViewChannel] },
          { id: user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles] },
          { id: client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ManageChannels] }
        ]
      });

      const ticketLogEmbed = new EmbedBuilder()
        .setColor("#2ECC71")
        .setTitle("🎫 TICKET CREATED")
        .addFields({ name: "👤 User", value: `${user} (\`${user.id}\`)`, inline: true }, { name: "📂 Channel", value: `${channel}`, inline: true })
        .setTimestamp()
        .setFooter({ text: "BlueSealPrime • Ticket Log" });
      logToChannel(guild, "ticket", ticketLogEmbed);

      const ticketEmbed = new EmbedBuilder()
        .setColor("#2B2D31")
        .setTitle(`📂 TICKET #${channel.name.split("-")[1]}`)
        .setDescription(`**Secure Channel Established.**\nWelcome ${user}, support will be with you shortly.\n\n🔒 *Authorized Personnel Only*`)
        .setThumbnail(user.displayAvatarURL())
        .setFooter({ text: "BlueSealPrime • Secure Communication Line" });

      const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("close_ticket").setLabel("Close Ticket").setEmoji("🔒").setStyle(ButtonStyle.Danger));
      await channel.send({ content: `${user} | <@${BOT_OWNER_ID}>`, embeds: [ticketEmbed], components: [row] });
      await interaction.editReply(`✅ **Secure Channel Created:** ${channel}`);
    } catch (err) {
      console.error(err);
      await interaction.editReply("❌ Failed to establish secure connection.");
    }
  }

  if (customId === "close_ticket") {
    await interaction.reply({ embeds: [new EmbedBuilder().setColor("Red").setDescription("🔒 **Closing Secure Channel in 5 seconds...**")] });
    setTimeout(() => { interaction.channel.delete().catch(() => { }); }, 5000);
  }

  // ───── TEMP VC BUTTON HANDLER ─────
  if (customId.startsWith("vtc_")) {
    const parts = customId.split("_");
    const action = parts[1];
    const vcId = parts[2];

    const TEMP_VCS_PATH = path.join(__dirname, "data/temp_vcs.json");
    if (fs.existsSync(TEMP_VCS_PATH)) {
      let tempVcs = JSON.parse(fs.readFileSync(TEMP_VCS_PATH, "utf8"));
      const vcEntry = (tempVcs[guild.id] || []).find(v => v.id === vcId);
      if (!vcEntry) return interaction.reply({ content: "❌ This channel is no longer active.", ephemeral: true });
      if (vcEntry.ownerId !== user.id && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.reply({ content: "🚫 **Access Denied:** Only the owner can use these controls.", ephemeral: true });
      }

      const vc = guild.channels.cache.get(vcId);
      if (!vc) return interaction.reply({ content: "❌ Voice channel not found.", ephemeral: true });

      try {
        switch (action) {
          case "lock": await vc.permissionOverwrites.edit(guild.roles.everyone, { Connect: false }); await interaction.reply({ content: "🔒 Voice channel **locked**.", ephemeral: true }); break;
          case "unlock": await vc.permissionOverwrites.edit(guild.roles.everyone, { Connect: true }); await interaction.reply({ content: "🔓 Voice channel **unlocked**.", ephemeral: true }); break;
          case "hide": await vc.permissionOverwrites.edit(guild.roles.everyone, { ViewChannel: false }); await interaction.reply({ content: "👻 Voice channel **hidden**.", ephemeral: true }); break;
          case "show": await vc.permissionOverwrites.edit(guild.roles.everyone, { ViewChannel: true }); await interaction.reply({ content: "👁️ Voice channel **visible**.", ephemeral: true }); break;
          case "mute": vc.members.forEach(async m => { if (m.id !== user.id) await m.voice.setMute(true).catch(() => { }); }); await interaction.reply({ content: "🔇 Members **muted**.", ephemeral: true }); break;
          case "unmute": vc.members.forEach(async m => { if (m.id !== user.id) await m.voice.setMute(false).catch(() => { }); }); await interaction.reply({ content: "🔊 Members **unmuted**.", ephemeral: true }); break;
          case "rename":
            const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder: ModalActionRow } = require("discord.js");
            const modal = new ModalBuilder().setCustomId(`vtc_modal_rename_${vcId}`).setTitle("Rename Voice Channel");
            const input = new TextInputBuilder().setCustomId("new_name").setLabel("Enter New Name").setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(32);
            modal.addComponents(new ModalActionRow().addComponents(input));
            await interaction.showModal(modal);
            break;
        }
      } catch (e) { await interaction.reply({ content: "❌ Action failed.", ephemeral: true }).catch(() => { }); }
    }
  }

  // ───── VERIFICATION SYSTEM ─────
  if (customId.startsWith("verify_")) {
    const roleId = customId.split("_")[1];
    const role = guild.roles.cache.get(roleId);
    if (!role) return interaction.reply({ content: "❌ Role not found.", ephemeral: true });
    if (interaction.member.roles.cache.has(roleId)) return interaction.reply({ content: "✅ Already verified.", ephemeral: true });

    try {
      await interaction.member.roles.add(role);
      const vEmbed = new EmbedBuilder().setColor("#00FF00").setTitle("✅ MEMBER VERIFIED").setDescription(`**User:** ${user.tag}\n**Role:** ${role.name}`).setTimestamp();
      logToChannel(guild, "verify", vEmbed);
      return interaction.reply({ content: "✅ **Verified successfully!**", ephemeral: true });
    } catch (e) { return interaction.reply({ content: "❌ Error.", ephemeral: true }); }
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
// Redundant interactionCreate listener merged above

// ───── ANTI-NUKE SYSTEM (Moved to Top) ─────
// Definitions moved to top of file for scope availability
// const ANTINUKE_DB = path.join(__dirname, "data/antinuke.json");
// const nukeMap = new Map();
// checkNuke and punishNuker functions are now at the top.

// checkNuke moved to top

// punishNuker moved to top

// Redundant channelDelete listener merged above

// Redundant roleDelete listener merged at Line 1696

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
  // Check for Role Additions
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
  ) || addedRoles.some(r => r.name.toLowerCase().includes("admin"));

  if (!hasDangerousGrant) return;

  // Audit Interrogation
  const logs = await newMember.guild.fetchAuditLogs({ type: 25, limit: 1 }).catch(() => null); // 25 = MEMBER_ROLE_UPDATE
  if (!logs) return;

  const entry = logs.entries.first();
  if (!entry || Date.now() - entry.createdTimestamp > 5000 || entry.target.id !== newMember.id) return;

  const executor = entry.executor;
  if (!executor || executor.id === client.user.id) return;

  // Whitelist Check
  const owners = getOwnerIds(newMember.guild.id);
  const WHITELIST_PATH = path.join(__dirname, "data/whitelist.json");
  let whitelist = {};
  if (fs.existsSync(WHITELIST_PATH)) {
    try { whitelist = JSON.parse(fs.readFileSync(WHITELIST_PATH, "utf8")); } catch (e) { }
  }

  const guildWhitelist = whitelist[newMember.guild.id] || [];
  const isAuthorized = owners.includes(executor.id) || guildWhitelist.includes(executor.id);

  // 1. TRUST CHAIN LOGGING (If Granter is Extra Owner)
  if (isAuthorized && executor.id !== BOT_OWNER_ID && executor.id !== newMember.guild.ownerId) {
    logTrustGrant(newMember.guild.id, executor.id, newMember.id);
    return;
  }

  if (!isAuthorized) {
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

      logToChannel(newMember.guild, "security", breachEmbed);

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

      // 3. Punish Target: Automatic Ejection (Ban + Blacklist as per Line 284 logic)
      if (newMember.bannable) {
        await newMember.ban({ reason: "🛡️ Sovereign Strip: Target of unauthorized dangerous role elevation." });

        // Blacklist
        const BL_PATH = path.join(__dirname, "data/blacklist.json");
        let blacklistArr = [];
        if (fs.existsSync(BL_PATH)) {
          try { blacklistArr = JSON.parse(fs.readFileSync(BL_PATH, "utf8")); } catch (e) { }
        }
        if (!blacklistArr.includes(newMember.id)) {
          blacklistArr.push(newMember.id);
          fs.writeFileSync(BL_PATH, JSON.stringify(blacklistArr, null, 2));
        }
      } else if (newMember.kickable) {
        await newMember.kick("🛡️ Sovereign Strip: Target of unauthorized dangerous role elevation.");
      }
    } catch (err) {
      console.error("Sovereign Strip Error:", err);
    }
  }
});

// Redundant guildBanAdd listener merged at Line 1674

// Redundant listener removed



// ───── LOGGING EVENT HANDLER ─────
async function logToChannel(guild, type, embed) {
  if (!guild) return;

  // 0. UNIVERSAL LOGGING (ELOGS)
  const ELOGS_DB = path.join(__dirname, "data/elogs.json");
  if (fs.existsSync(ELOGS_DB)) {
    try {
      const eData = JSON.parse(fs.readFileSync(ELOGS_DB, "utf8"));
      // Check for specific type OR fallback to 'server' for global logs
      const eChannelId = eData[type] || eData["server"];

      if (eChannelId) {
        // Use fetch to ensure we can send even if not in cache
        const eChannel = await client.channels.fetch(eChannelId).catch(() => null);
        if (eChannel) {
          const uEmbed = EmbedBuilder.from(embed.data);

          // --- BEGIN MAXIMUM SPACIOUSNESS ---
          const currentDesc = uEmbed.data.description || "";
          uEmbed.setDescription("\u200b\n" + currentDesc + "\n\u200b"); // Blank line TOP and BOTTOM

          uEmbed.setAuthor({
            name: `🌐 GLOBAL LOG: ${guild.name.toUpperCase()}`,
            iconURL: guild.iconURL() || client.user.displayAvatarURL()
          });

          // PUSH CONTENT DOWN WITH TOP AND BOTTOM SPACERS
          // Ensure we don't exceed field limits
          if ((uEmbed.data.fields?.length || 0) < 23) {
            uEmbed.spliceFields(0, 0, { name: "\u200b", value: "┍━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┑", inline: false });
            uEmbed.addFields({ name: "\u200b", value: "┕━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┙", inline: false });
          }

          // ALWAYS USE DIVIDER IMAGE
          uEmbed.setImage("https://media.discordapp.net/attachments/1093150036663308318/1113885934572900454/line-red.gif");

          uEmbed.setFooter({ text: `Universal Intelligence • Sector: ${type.toUpperCase()} • ID: ${guild.id} • ${new Date().toLocaleString()}` });
          // --- END MAXIMUM SPACIOUSNESS ---

          await eChannel.send({ embeds: [uEmbed] }).catch(() => { });
        }
      }
    } catch (e) { console.error("[LOG] Global Error:", e); }
  }

  // 2. LOCAL LOGGING
  const LOGS_DB = path.join(__dirname, "data/logs.json");
  if (!fs.existsSync(LOGS_DB)) return;

  try {
    const data = JSON.parse(fs.readFileSync(LOGS_DB, "utf8"));
    const guildData = data[guild.id];
    if (!guildData) return;

    // Fallback logic: message -> security -> server
    const channelId = guildData[type] || guildData["security"] || guildData["server"];
    if (!channelId) return;

    const channel = await guild.channels.fetch(channelId).catch(() => null);
    if (channel) {
      const lEmbed = EmbedBuilder.from(embed.data);

      // Also make local logs spacious
      const currentDesc = lEmbed.data.description || "";
      lEmbed.setDescription("\u200b\n" + currentDesc + "\n\u200b");

      if ((lEmbed.data.fields?.length || 0) < 23) {
        lEmbed.spliceFields(0, 0, { name: "\u200b", value: "─".repeat(35), inline: false });
        lEmbed.addFields({ name: "\u200b", value: "─".repeat(35), inline: false });
      }
      lEmbed.setTimestamp();

      await channel.send({ embeds: [lEmbed] }).catch(() => { });
    }
  } catch (e) { console.error("[LOG] Local Error:", e); }
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


// Redundant clientReady listener removed - consolidated at top

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





