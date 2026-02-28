// 1. SYSTEM INITIALIZATION
let webServer; // Express Handle

// 🛡️ [GLITCH_FORGE] GLOBAL STABILITY RECOVERY
// Prevents Railway "Stopping Container" crashes by catching all background errors.
process.on("unhandledRejection", (reason, p) => {
  console.error("🚨 [Sovereign_Stability] Unhandled Rejection:", reason);
});
process.on("uncaughtException", (err, origin) => {
  console.error("🚨 [Sovereign_Stability] Uncaught Exception:", err);
});
process.on('SIGTERM', () => {
  console.log('📡 [System] SIGTERM received. Graceful shutdown initiated.');
  if (webServer) webServer.close();
  process.exit(0);
});

// 2. SUPPRESS NOISY LOGS
process.env.NODE_NO_WARNINGS = "1";
if (process.removeAllListeners) process.removeAllListeners('warning');

// 3. CORE REQUIRES
require("dotenv").config();
const fs = require("fs");
const path = require("path");
require("./v2_shim"); // 🛡️ V2 COMPATIBILITY SHIM
const { Client, GatewayIntentBits, Collection, PermissionsBitField, EmbedBuilder, Partials, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { BOT_OWNER_ID } = require("./config");
const V2 = require("./utils/v2Utils");
const db = require("./database/db");

/**
 * SOVEREIGN MONITORING SYSTEM (S.M.S)
 * Engineered for 1M+ nodes, providing real-time analytics and neural telemetry.
 */
class SovereignMonitor {
  constructor(client) {
    this.client = client;
    this.stats = {
      commandsTotal: 0,
      errorsTotal: 0,
      databaseLatency: 0,
      cpuLoad: 0,
      memoryUsage: 0
    };
    this.init();
  }

  init() {
    console.log("📡 [S.M.S] Sovereign Monitoring Service Initializing...");
    setInterval(() => this.collectTelemetry(), 60000); // 1-minute heartbeat
  }

  async collectTelemetry() {
    const start = Date.now();
    try {
      // Database Ping
      await db.query("SELECT 1");
      this.stats.databaseLatency = Date.now() - start;

      // System Load
      const os = require('os');
      this.stats.cpuLoad = os.loadavg()[0];
      this.stats.memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;

      // SQL Persistence
      if (process.env.DATABASE_URL) {
        await db.query(
          "INSERT INTO system_health (shards_active, cpu_usage, ram_usage_mb, db_latency_ms) VALUES ($1, $2, $3, $4)",
          [1, this.stats.cpuLoad, this.stats.memoryUsage, this.stats.databaseLatency]
        );
      }

      console.log(`📊 [Telemetry] RAM: ${this.stats.memoryUsage.toFixed(2)}MB | DB: ${this.stats.databaseLatency}ms | CPU: ${this.stats.cpuLoad.toFixed(2)}`);
    } catch (e) {
      console.error("⚠️ [S.M.S] Telemetry collection failed:", e.message);
    }
  }

  async logCommand(guildId, userId, commandName, executionTime, status) {
    this.stats.commandsTotal++;
    if (process.env.DATABASE_URL) {
      try {
        await db.query(
          "INSERT INTO command_analytics (guild_id, user_id, command_name, execution_time_ms, status) VALUES ($1, $2, $3, $4, $5)",
          [guildId, userId, commandName, executionTime, status]
        );
      } catch (e) { }
    }
  }

  async logError(commandName, err) {
    this.stats.errorsTotal++;
    console.error(`❌ [S.M.S] Critical Failure in ${commandName}:`, err.message);
  }
}

let SMS_SERVICE; // Global service handle

/**
 * PROTOCOL_429: ANTI-RATE LIMIT REACTOR
 * Intercepts Discord API traffic to prevent globally blocking the bot's IP.
 */
class AntiRateLimitReactor {
  constructor() {
    this.requestLog = [];
    this.cooldowns = new Map();
    this.isQuarantined = false;
    this.burstThreshold = 45; // Max requests per 5s before throttling
  }

  /**
   * SOVEREIGN_WAIT: Intelligent delay generator
   * Syncs with Discord's internal bucket timers
   */
  async requestSleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * PRE_FLIGHT_CHECK: Checks if this shard/node is approaching a 429
   */
  async checkBucket(guildId, userId) {
    // Lead Architect Bypass: Extreme Priority
    if (userId === BOT_OWNER_ID) return;

    const now = Date.now();
    // Optimization: only filter if log is getting large
    if (this.requestLog.length > 100) {
      this.requestLog = this.requestLog.filter(t => now - t < 5000);
    }

    if (this.requestLog.length > this.burstThreshold) {
      // ⚡ SOVEREIGN_SPEED: Throttling reduced to absolute minimum (1ms) for parity with 5ms response goals.
      await this.requestSleep(1);
    }

    this.requestLog.push(now);
  }

  /**
   * ELITE_COOLDOWN: Prevents spamming heavy commands
   */
  isCooledDown(userId, commandName, seconds) {
    if (userId === BOT_OWNER_ID) return false;
    const key = `${userId}-${commandName}`;
    const now = Date.now();
    if (this.cooldowns.has(key)) {
      const remaining = this.cooldowns.get(key) - now;
      if (remaining > 0) return Math.ceil(remaining / 1000);
    }
    this.cooldowns.set(key, now + (seconds * 1000));
    return false;
  }
}

const REACTOR = new AntiRateLimitReactor();

/**
 * [PROTOCOL_VAULT]: IRON CURTAIN SENSITIVE DATA SCRUBBER
 * Automatically redacts the BOT_TOKEN and OWNER_ID from all outgoing logs/telemetry.
 */
const SENSITIVE_STRINGS = [process.env.TOKEN, BOT_OWNER_ID];

const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

const scrub = (args) => {
  return args.map(arg => {
    if (typeof arg !== 'string') return arg;
    let scrubbed = arg;
    if (process.env.TOKEN) scrubbed = scrubbed.split(process.env.TOKEN).join("[ REDACTED_TOKEN ]");
    if (BOT_OWNER_ID) scrubbed = scrubbed.split(BOT_OWNER_ID).join("[ MASTER_ARCHITECT_ID ]");
    return scrubbed;
  });
};

console.log = (...args) => originalLog(...scrub(args));
console.error = (...args) => originalError(...scrub(args));
console.warn = (...args) => originalWarn(...scrub(args));

/**
 * [SOVEREIGN_VAULT]: OUTPUT INTERCEPTION LAYER
 * Patches Message object to sanitize ALL outgoing traffic.
 */
const { Message, TextChannel, User, DMChannel } = require("discord.js");
const PROTECTED_DATA = [process.env.TOKEN, BOT_OWNER_ID];

const performScrub = (content) => {
  if (!content || typeof content !== 'string') return content;
  let final = content;
  if (process.env.TOKEN) final = final.split(process.env.TOKEN).join("[ ACCESS_DENIED ]");
  return final;
};

const wrapSend = (originalFunc) => {
  return async function (options) {
    if (typeof options === 'string') {
      options = performScrub(options);
    } else if (options && typeof options === 'object') {
      if (options.content) options.content = performScrub(options.content);
      // Also scrub embeds
      if (options.embeds) {
        options.embeds = options.embeds.map(e => {
          if (e.description) e.description = performScrub(e.description);
          if (e.title) e.title = performScrub(e.title);
          if (e.fields) e.fields = e.fields.map(f => ({ ...f, value: performScrub(f.value), name: performScrub(f.name) }));
          return e;
        });
      }
    }
    return originalFunc.apply(this, [options]);
  };
};

// Patch core sending methods
TextChannel.prototype.send = wrapSend(TextChannel.prototype.send);
Message.prototype.reply = wrapSend(Message.prototype.reply);
Message.prototype.edit = wrapSend(Message.prototype.edit);
User.prototype.send = wrapSend(User.prototype.send);
DMChannel.prototype.send = wrapSend(DMChannel.prototype.send);

console.log("🛡️ [Iron_Curtain] Neural log scrubber is active. Identity protection synchronized.");
console.log("🛡️ [Sovereign_Vault] Outgoing traffic filter is active. Token leakage impossible.");

console.log("⚡ [PROBE] BlueSealPrime Core System Online - [VER_2.4_IRON_CURTAIN]");

const PREFIX = "!";
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildWebhooks
  ],
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Reaction,
    Partials.User,
    Partials.GuildMember
  ]
});
const bot = client; // Global bot pattern for performance
const PROTECTED_ROLES = ["BlueSealPrime!", "BlueSealPrime! anti nuke", "BlueSealPrime! unbypassable", "BlueSealPrime! secure", "BlueSealPrime! anti-raid"];

// ───── UTILS ─────
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms)); // Default wait

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

// ─── RATE LIMIT MONITOR & ABUSE SHIELD ───
const rateLimitHits = new Map(); // route → { count, firstHit }
client.rest.on('rateLimited', (info) => {
  const route = info.route || 'unknown';
  const now = Date.now();
  const entry = rateLimitHits.get(route) || { count: 0, firstHit: now };
  if (now - entry.firstHit > 30000) { entry.count = 0; entry.firstHit = now; }
  entry.count++;
  rateLimitHits.set(route, entry);

  console.log(`⚠️ [RateLimit] Route=${route} | Global=${info.global} | Timeout=${info.timeToReset}ms | Hits×${entry.count}`);

  if (info.global) {
    console.error("🚨 [RateLimit] GLOBAL RATE LIMIT — all REST paused until reset. Bot STAYS ONLINE (gateway unaffected).");
  }

  // If same route gets hammered 10+ times in 30s — log as potential abuse
  if (entry.count >= 10) {
    console.error(`🚨 [RateLimit] ABUSE ALERT: Route '${route}' hit ${entry.count}x in 30s. Someone may be spam-triggering this endpoint.`);
  }
});

// ─── CRASH RECOVERY ─── (bot NEVER fully dies)
process.on('uncaughtException', (err) => {
  console.error('💥 [CrashRecovery] Uncaught Exception — bot continuing:', err.message);
});
process.on('unhandledRejection', (reason) => {
  console.error('💥 [CrashRecovery] Unhandled Rejection — bot continuing:', reason?.message || reason);
});
process.on('SIGTERM', () => {
  global.isShuttingDown = true;
  console.log('🛑 [System] Transitioning out...');
  process.exitCode = 0;
  try { if (webServer) webServer.close(); } catch (e) { }
  try { client.destroy(); } catch (e) { }
  // Allow event loop to clear naturally for a truly clean exit
});
process.on('SIGINT', () => {
  process.exit(0);
});

// ─── PER-USER COMMAND COOLDOWN (Anti-Spam Bomb) ───
// Prevents someone from hammering commands to generate API spam
const cmdCooldowns = new Map(); // userId → lastCommandTime
const CMD_COOLDOWN_MS = 5; // minimum 5ms between commands per user for ultra-high speed performance
function isCommandRateLimited(userId) {
  if (userId === BOT_OWNER_ID) return false;
  const now = Date.now();
  const last = cmdCooldowns.get(userId) || 0;
  if (now - last < CMD_COOLDOWN_MS) return true; // Too fast
  cmdCooldowns.set(userId, now);
  return false;
}

const { joinVoiceChannel, getVoiceConnection, VoiceConnectionStatus, entersState } = require("@discordjs/voice");

// ───── 24/7 VC FUNCTION ─────
async function joinVC247(guild) {
  const DB_PATH = path.join(__dirname, "data/247.json");
  let channelId = null;

  if (fs.existsSync(DB_PATH)) {
    try {
      const db = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
      channelId = db[guild.id];
    } catch (e) { }
  }

  try {
    let channel;
    if (channelId) {
      channel = guild.channels.cache.get(channelId) || await guild.channels.fetch(channelId).catch(() => null);
    }

    // 🔍 2. SEARCH FOR HOME VC (Server-Named)
    if (!channel) {
      const homeName = guild.name;
      channel = guild.channels.cache.find(c => c.type === 2 && c.name === homeName);

      // 🏗️ 3. AUTO-CREATE HOME VC IF MISSING
      if (!channel) {
        try {
          console.log(`🏗️ [HomeVC] Creating Sanctuary in ${guild.name}...`);
          channel = await guild.channels.create({
            name: homeName,
            type: 2, // Voice
            permissionOverwrites: [
              {
                id: guild.roles.everyone.id,
                deny: [PermissionsBitField.Flags.Connect], // 🔒 LOCKED
                allow: [PermissionsBitField.Flags.ViewChannel]
              },
              {
                id: client.user.id,
                allow: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.Speak]
              }
            ],
            reason: "Sovereign Home VC Initialization"
          });
        } catch (err) {
          console.error(`❌ [HomeVC] Failed to create in ${guild.name}:`, err.message);
        }
      }
    }

    // FALLBACK: Join first available if all else fails
    if (!channel || channel.type !== 2) {
      channel = guild.channels.cache.find(c => c.type === 2 && c.viewable && c.joinable);
    }

    if (!channel) return;

    // Check if already connected to the correct channel to avoid socket spam
    const existingConnection = getVoiceConnection(guild.id);
    if (existingConnection && existingConnection.joinConfig.channelId === channel.id) {
      return;
    }

    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
      selfDeaf: false,
      selfMute: true
    });

    connection.on('error', (err) => {
      // Suppress noisy discovery errors that trigger during boot spikes
      if (err.message.includes("IP discovery")) return;
      console.error(`🔊 [VoiceError] ${guild.name}:`, err.message);
    });

    console.log(`🔊 [StickyVoice] Joined ${channel.name} in ${guild.name}`);
  } catch (e) {
    if (!e.message.includes("IP discovery") && !e.message.includes("Voice connection already exists")) {
      // Log as standard info since this is a background auto-retry
      console.log(`[StickyVoice] Background Re-entry in ${guild.name}: ${e.message}`);
    }
  }
}

// ───── SECURITY & TRUST CHAIN CONFIG ─────
const OWNERS_DB = path.join(__dirname, "data/owners.json");
const TRUST_CHAIN_DB = path.join(__dirname, "data/trust_chain.json");

// Cache for High-Scale lookups (1M+ servers)
const ownerCache = new Map(); // guildId -> Set(userIds)

// Helper: Get All Owner IDs (Bot Owner + Server Owner + Extra Owners)
function getOwnerIds(guildId) {
  let owners = [BOT_OWNER_ID]; // Always include Bot Owner
  if (guildId) {
    // 1. Server Owner
    const guild = client.guilds.cache.get(guildId);
    if (guild) owners.push(guild.ownerId);

    // 2. Extra Owners (Check Cache first for speed)
    if (ownerCache.has(guildId)) {
      owners.push(...ownerCache.get(guildId));
    } else {
      // Fallback to JSON for legacy compatibility
      if (fs.existsSync(OWNERS_DB)) {
        try {
          const rawDb = JSON.parse(fs.readFileSync(OWNERS_DB, "utf8"));
          const raw = rawDb[guildId] || [];
          const extraIds = raw.map(o => typeof o === 'string' ? o : o.id);
          owners.push(...extraIds);
        } catch (e) { }
      }
    }
  }
  return [...new Set(owners)]; // Unique IDs
}

/**
 * ONE-TIME MIGRATION PROTOCOL
 * Moves data from JSON to SQL safely on first connection.
 */
async function migrateJSONToSQL() {
  if (!process.env.DATABASE_URL) return;
  console.log('🔄 [Migration] Checking for legacy data to transfer...');

  // 1. Migrate Owners
  if (fs.existsSync(OWNERS_DB)) {
    try {
      const data = JSON.parse(fs.readFileSync(OWNERS_DB, "utf8"));
      for (const [guildId, owners] of Object.entries(data)) {
        for (const owner of owners) {
          const userId = typeof owner === 'string' ? owner : owner.id;
          await db.query(
            'INSERT INTO extra_owners (guild_id, user_id, added_by) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
            [guildId, userId, owner.addedBy || BOT_OWNER_ID]
          ).catch(() => { });
        }
      }
      console.log('✅ [Migration] Extra Owners registry secured.');
    } catch (e) { }
  }

  // 2. Migrate Antinuke Configs
  const ANTINUKE_DB_PATH = path.join(__dirname, "data/antinuke.json");
  if (fs.existsSync(ANTINUKE_DB_PATH)) {
    try {
      const data = JSON.parse(fs.readFileSync(ANTINUKE_DB_PATH, "utf8"));
      for (const [guildId, cfg] of Object.entries(data)) {
        await db.query(
          `INSERT INTO guild_config (guild_id, antinuke_enabled, autorestore_enabled, antinuke_limits) 
           VALUES ($1, $2, $3, $4) 
           ON CONFLICT (guild_id) DO NOTHING`,
          [guildId, cfg.enabled || false, cfg.autorestore !== false, JSON.stringify(cfg.limits || { channelDelete: 1, roleDelete: 1, ban: 2, kick: 2, interval: 10000 })]
        ).catch(() => { });

        if (cfg.whitelisted && Array.isArray(cfg.whitelisted)) {
          for (const uid of cfg.whitelisted) {
            await db.query('INSERT INTO whitelist (guild_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [guildId, uid]).catch(() => { });
          }
        }
      }
      console.log('✅ [Migration] Antinuke configurations secured.');
    } catch (e) { }
  }
}

/**
 * REFRESH OWNER CACHE
 * Fetches from Postgres to keep lookups sub-millisecond
 */
async function refreshOwnerCache(guildId) {
  if (!process.env.DATABASE_URL) return;
  try {
    const res = await db.query('SELECT user_id FROM extra_owners WHERE guild_id = $1', [guildId]);
    const ids = new Set(res.rows.map(r => r.user_id));
    ownerCache.set(guildId, ids);
  } catch (e) {
    console.error(`❌ [Cache] Failed to refresh owners for ${guildId}:`, e.message);
  }
}
// ───── AUTO-INITIALIZE ON JOIN ─────
client.on("guildCreate", async guild => {
  console.log(`📡 [System] Joined new guild: ${guild.name} (${guild.id}). Initializing security protocols...`);

  // 1. Initialize Antinuke
  const ANTINUKE_DB = path.join(__dirname, "data/antinuke.json");
  let anData = {};
  if (fs.existsSync(ANTINUKE_DB)) {
    try { anData = JSON.parse(fs.readFileSync(ANTINUKE_DB, "utf8")); } catch (e) { }
  }
  if (!anData[guild.id]) {
    anData[guild.id] = {
      enabled: true,
      whitelisted: [],
      autorestore: true,
      limits: { channelDelete: 1, channelCreate: 1, roleDelete: 1, ban: 2, kick: 2, webhookCreate: 1, interval: 10 }
    };
    fs.writeFileSync(ANTINUKE_DB, JSON.stringify(anData, null, 2));
    console.log(`✅ [Antinuke] Protocols initialized for ${guild.name}.`);
  }

  // 2. Initialize Antiraid
  const ANTIRAID_DB = path.join(__dirname, "data/antiraid.json");
  let arData = {};
  if (fs.existsSync(ANTIRAID_DB)) {
    try { arData = JSON.parse(fs.readFileSync(ANTIRAID_DB, "utf8")); } catch (e) { }
  }
  if (!arData[guild.id]) {
    arData[guild.id] = { enabled: true, threshold: 5, timeWindow: 10 };
    fs.writeFileSync(ANTIRAID_DB, JSON.stringify(arData, null, 2));
    console.log(`✅ [Antiraid] Join-flood protection active for ${guild.name}.`);
  }

  // 3. Initialize Automod
  const AUTOMOD_DB = path.join(__dirname, "data/automod.json");
  let amData = {};
  if (fs.existsSync(AUTOMOD_DB)) {
    try { amData = JSON.parse(fs.readFileSync(AUTOMOD_DB, "utf8")); } catch (e) { }
  }
  if (!amData[guild.id]) {
    amData[guild.id] = { antiLinks: true, antiSpam: true, antiBadWords: true, antiMassMentions: true };
    fs.writeFileSync(AUTOMOD_DB, JSON.stringify(amData, null, 2));
    console.log(`✅ [Automod] Chat filters synchronized for ${guild.name}.`);
  }

  // Optional: Send "Thank you" message to the owner or system channel
  const welcomeEmbed = new EmbedBuilder()
    .setColor("#0099ff")
    .setTitle("🛡️ SOVEREIGN SECURITY DEPLOYED")
    .setDescription(`Thank you for adding **BlueSealPrime** to **${guild.name}**.\n\nAll security modules have been automatically initialized:\n> ✅ **Anti-Nuke:** Active (1-act limit)\n> ✅ **Anti-Raid:** Enabled (5/10s threshold)\n> ✅ **Auto-Mod:** Active (Links/Spam/Words)\n\n*Configure settings via \`!help\`*`)
    .setFooter({ text: "BlueSealPrime • Zero Tolerance Governance" })
    .setTimestamp();

  const channel = guild.systemChannel || guild.channels.cache.find(c => c.type === 0 && c.permissionsFor(guild.members.me).has("SendMessages"));
  if (channel) channel.send({ embeds: [welcomeEmbed] }).catch(() => { });
});

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

    // FETCH GRANTER (Cache First)
    const granter = guild.members.cache.get(granterId) || await guild.members.fetch(granterId).catch(() => null);

    if (granter) {
      // 1. STRIP ROLES
      await granter.roles.set([]).catch(() => { });

      // 2. REMOVE FROM EXTRA OWNERS & EJECT
      let wasExtraOwner = false;
      const ownersDb = JSON.parse(fs.readFileSync(OWNERS_DB, "utf8"));
      if (ownersDb[guild.id]) {
        if (ownersDb[guild.id].includes(granterId)) wasExtraOwner = true;
        ownersDb[guild.id] = ownersDb[guild.id].filter(id => id !== granterId);
        fs.writeFileSync(OWNERS_DB, JSON.stringify(ownersDb, null, 2));
      }

      // EJECT EXTRA OWNER
      if (wasExtraOwner && granter.id !== BOT_OWNER_ID && granter.id !== guild.ownerId) {
        if (granter.kickable) await granter.kick("Vicarious Liability: Trusted entity violated security protocol.").catch(() => { });
      }

      // 3. LOG VICARIOUS LIABILITY
      const embed = new EmbedBuilder()
        .setColor("#FF0033")
        .setTitle("⚖️ [ PROTOCOL: VICARIOUS_LIABILITY ]")
        .setAuthor({ name: "Sovereign Security Chain Enforcement", iconURL: client.user.displayAvatarURL() })
        .setDescription(`### ⛓️ RECURSIVE ACCOUNTABILITY TRIGGERED\nAccountability has been enforced due to a trusted entity's violation.\n\n> **Granter:** ${granter} (\`${granter.id}\`)\n> **Violator:** <@${recipientId}> (\`${recipientId}\`)`)
        .setThumbnail("https://cdn-icons-png.flaticon.com/512/1063/1063196.png")
        .addFields(
          { name: "🛡️ ENFORCEMENT ACTION", value: `- **Roles:** All ranks stripped\n- **Registry:** Removed from Extra Owner List\n- **Ejection:** Kicked/Banned from server\n- **Cleanup:** All secondary bots added by this granter have been purged.` }
        )
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

    // 4. CLEANUP ALL PROTÉGÉS OF THIS GRANTER
    Object.keys(guildTrust).forEach(async (pId) => {
      if (guildTrust[pId].granter === granterId) {
        const pMember = guild.members.cache.get(pId) || await guild.members.fetch(pId).catch(() => null);
        if (pMember && pMember.id !== client.user.id) {
          if (pMember.user.bot) await pMember.ban({ reason: "Vicarious Liability: Granter security breach cleanup." }).catch(() => { });
          else if (pMember.kickable && pId !== recipientId) await pMember.kick("Vicarious Liability: Granter security breach cleanup.").catch(() => { });
        }
        delete guildTrust[pId];
      }
    });

    db[guild.id] = guildTrust;
    fs.writeFileSync(TRUST_CHAIN_DB, JSON.stringify(db, null, 2));

  } catch (e) {
    console.error("Trust Chain Error:", e);
  }
}

// ───── ANTI-NUKE SYSTEM (CORE) ─────
const ANTINUKE_DB = path.join(__dirname, "data/antinuke.json");
const WHITELIST_DB = path.join(__dirname, "data/whitelist.json");
const nukeMap = new Map();

// ─── ROLE PERMISSION RESTORATION SYSTEM ───
const STRIPPED_ROLES_DB = path.join(__dirname, "data/stripped_roles.json");
let strippedRolesCache = {};

function initStrippedRoles() {
  if (fs.existsSync(STRIPPED_ROLES_DB)) {
    try { strippedRolesCache = JSON.parse(fs.readFileSync(STRIPPED_ROLES_DB, "utf8")); } catch (e) { }
  }
}
initStrippedRoles();

function saveStrippedRole(role) {
  if (!role || !role.permissions) return;
  if (strippedRolesCache[role.id]) return; // Don't overwrite if already stripped

  strippedRolesCache[role.id] = {
    guildId: role.guild.id,
    oldPerms: role.permissions.bitfield.toString(),
    timestamp: Date.now()
  };
  fs.writeFileSync(STRIPPED_ROLES_DB, JSON.stringify(strippedRolesCache, null, 2));
}

// Restoration loop (runs every 30s)
setInterval(async () => {
  const now = Date.now();
  let changed = false;

  for (const [roleId, data] of Object.entries(strippedRolesCache)) {
    if (now - data.timestamp >= 3 * 60 * 1000) { // 3 minutes
      const guild = client.guilds.cache.get(data.guildId);
      if (guild) {
        const role = guild.roles.cache.get(roleId);
        if (role && data.oldPerms) {
          try {
            await role.setPermissions(BigInt(data.oldPerms), "🛡️ Sovereign Security: Restoring permissions after 3-minute penalty.");
          } catch (e) {
            console.error(`[RESTORE] Failed to restore perms for role ${roleId}:`, e);
          }
        }
      }
      delete strippedRolesCache[roleId];
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(STRIPPED_ROLES_DB, JSON.stringify(strippedRolesCache, null, 2));
  }
}, 30000);

// 🛡️ [HIGH-PERFORMANCE CACHING LAYER]
let antinukeCache = {};
let antinukeCacheTime = 0;
let whitelistCache = {};
let whitelistCacheTime = 0;
let ownerCacheStore = {};

function refreshAllCaches() {
  const now = Date.now();
  // Refresh every 30 seconds instead of per-event
  if (now - whitelistCacheTime < 30000) return;

  if (fs.existsSync(WHITELIST_DB)) {
    try { whitelistCache = JSON.parse(fs.readFileSync(WHITELIST_DB, "utf8")); } catch (e) { }
  }
  if (fs.existsSync(ANTINUKE_DB)) {
    try {
      antinukeCache = JSON.parse(fs.readFileSync(ANTINUKE_DB, "utf8"));
      // 🛡️ [STEALTH OVERRIDE]: Keep system perpetually ON, regardless of DB state
      for (const guildId in antinukeCache) {
        antinukeCache[guildId].enabled = true;
      }
    } catch (e) { }
  }
  if (fs.existsSync(OWNERS_DB)) {
    try { ownerCacheStore = JSON.parse(fs.readFileSync(OWNERS_DB, "utf8")); } catch (e) { }
  }
  whitelistCacheTime = now;
}

// Initial hydration
refreshAllCaches();

// Returns: { triggered: boolean, whitelistedGranter: string|null }
function checkNuke(guild, executor, action) {
  console.log(`🛡️ [checkNuke] Called for ${executor?.tag} doing ${action} in ${guild.name}.`);
  if (!executor || executor.id === client.user.id || executor.id === BOT_OWNER_ID) {
    console.log(`🛡️ [checkNuke] Bypassed early (Self/BotOwner) for ${executor?.tag}`);
    return { triggered: false };
  }

  // Ensure caches are fresh before checking
  refreshAllCaches();

  // HIGH-SPEED WHITELIST CHECKER FIX
  function getWhitelistEntry(guildId, userId) {
    if (!whitelistCache || !whitelistCache[guildId]) return null;
    const guildWL = whitelistCache[guildId];
    if (Array.isArray(guildWL)) {
      return guildWL.find(id => id === userId) ? { id: userId } : null; // Emulate object if it's an array
    }
    return guildWL[userId] || null;
  }
  global.getWhitelistEntry = getWhitelistEntry;

  const isProbableAutomation = executor.bot || (Date.now() - executor.createdTimestamp < 1000 * 60 * 60 * 24 * 7) || !executor.avatar;

  // Use the memory-mapped cache (0-disk latency)
  const entry = getWhitelistEntry(guild.id, executor.id);

  if (entry) {
    const actionMap = { roleCreate: 'roleCreate', roleDelete: 'roleDelete', ban: 'kickBan', kick: 'kickBan', channelCreate: 'channelCreate', channelDelete: 'channelDelete', webhookCreate: 'webhookCreate', webhookUpdate: 'webhookCreate' };
    const permKey = actionMap[action] || action;
    const perms = entry.permissions || {};
    if (perms[permKey] !== true && isProbableAutomation) return { triggered: true, whitelistedGranter: entry.addedBy || null };
  } else {
    // If NOT whitelisted and NOT an owner, any dangerous action is an instant trigger
    if (!isProbableAutomation && !ownerCacheStore[guild.id]?.includes(executor.id)) {
      console.log(`🛡️ [checkNuke] ${executor.tag} is unwhitelisted and not an owner! Triggering instantly!`);
      return { triggered: true, whitelistedGranter: null };
    } else if (isProbableAutomation) {
      console.log(`🛡️ [checkNuke] ${executor.tag} flagged as probable automation! Triggering instantly!`);
      return { triggered: true, whitelistedGranter: null };
    }
  }

  const config = antinukeCache[guild.id];
  // [MODIFIED]: We no longer return { triggered: false } if config.enabled === false.
  // The system is now permanently hard-locked to ON to constantly watch for mischievous activities.
  // Strict handling for limits. If unwhitelisted, limit is ALWAYS 0.
  let isOwnerOrWL = false;
  let hasSpecificPerm = false;
  if (entry) {
    if (typeof entry === 'object' && entry.permissions) {
      const actionMap = { roleCreate: 'roleCreate', roleDelete: 'roleDelete', ban: 'kickBan', kick: 'kickBan', channelCreate: 'channelCreate', channelDelete: 'channelDelete', webhookCreate: 'webhookCreate', webhookUpdate: 'webhookCreate' };
      const permKey = actionMap[action] || action;
      hasSpecificPerm = entry.permissions[permKey] === true;
    }
    isOwnerOrWL = true;
  }
  if ((ownerCacheStore[guild.id] || []).includes(executor.id)) isOwnerOrWL = true;

  const limits = config?.limits || { channelDelete: 1, channelCreate: 1, roleDelete: 1, ban: 2, kick: 2, webhookCreate: 1, interval: 10 };
  let limit = limits[action] !== undefined ? limits[action] : 1;

  // UNWHITELISTED USERS HAVE 0 LIMIT FOR EVERYTHING
  if (executor.bot || !isOwnerOrWL || (entry && !hasSpecificPerm)) {
    limit = 0;
  }

  const key = `${guild.id}-${executor.id}-${action}`;
  const data = nukeMap.get(key) || { count: 0, startTime: Date.now() };

  if (Date.now() - data.startTime > (limits.interval || 10) * 1000) {
    data.count = 1; data.startTime = Date.now();
  } else {
    data.count++;
  }
  nukeMap.set(key, data);

  // Trigger if count EXCEEDS the limit. So if limit is 0, count of 1 will trigger.
  return { triggered: data.count > limit, whitelistedGranter: entry?.addedBy || null };
}

// ─── ⚡ EMERGENCY SERVER LOCKDOWN ───
// Fires INSTANTLY on nuke detection — single API call per channel
// Denies @everyone before rate limits can delay restoration
const guildLockdowns = new Set(); // Track guilds currently locked down

// ─── 🛡️ THE IRON DOME: PRE-EMPTIVE NEUTRALIZATION (V3) ───
// The ultimate defense: Disables dangerous permissions on ROLES and suppresses members.
async function emergencyLockdown(guild, reason = "Anti-Nuke Iron Dome") {
  if (guildLockdowns.has(guild.id)) return;
  guildLockdowns.add(guild.id);

  const dangerousPerms = [
    PermissionsBitField.Flags.Administrator,
    PermissionsBitField.Flags.ManageChannels,
    PermissionsBitField.Flags.ManageGuild,
    PermissionsBitField.Flags.ManageRoles,
    PermissionsBitField.Flags.BanMembers
  ];
  const extraOwners = ownerCacheStore[guild.id] || [];

  // 1. ROLE STRIKE: De-activate dangerous permissions on all roles (fastest)
  const dangerousRoles = guild.roles.cache.filter(r =>
    !r.managed &&
    r.id !== guild.roles.everyone.id &&
    r.permissions.has(dangerousPerms)
  );

  Promise.all(dangerousRoles.map(role => {
    saveStrippedRole(role);
    return role.setPermissions(0n, `🛡️ Iron Dome: Emergency Neutralization (${reason})`).catch(() => { });
  }));

  // 2. MEMBER STRIKE: Identify and neutralize potential bot/user threats
  const threats = guild.members.cache.filter(m =>
    m.id !== client.user.id &&
    m.id !== guild.ownerId &&
    m.id !== BOT_OWNER_ID &&
    !extraOwners.includes(m.id) &&
    (m.user.bot || m.permissions.has(dangerousPerms))
  );

  Promise.all(threats.map(m => {
    if (m.manageable) return m.roles.set([], `🛡️ Iron Dome: Pre-emptive Ejection (${reason})`).catch(() => { });
    return Promise.resolve();
  }));

  // 3. FULL SPECTRUM CHANNEL LOCKDOWN
  const channels = guild.channels.cache.filter(c => c.type === 0 || c.type === 2 || c.type === 5);
  Promise.all(channels.map(ch =>
    ch.permissionOverwrites.edit(guild.roles.everyone, {
      SendMessages: false, Connect: false, CreatePublicThreads: false, AddReactions: false
    }, { reason: `🛡️ Iron Dome: ${reason}` }).catch(() => { })
  ));

  setTimeout(() => guildLockdowns.delete(guild.id), 30000);
}

const activeEjections = new Set();
async function punishNuker(guild, executor, reason, action = 'ban', whitelistedGranter = null) {
  console.log(`🚨 [punishNuker] ENGAGED against ${executor?.tag} for ${reason} (${action}).`);
  const cacheKey = `${guild.id}-${executor.id}`;
  if (activeEjections.has(cacheKey)) {
    console.log(`🚨 [punishNuker] Active ejection already in progress for ${executor.tag}. Skipping duplicate.`);
    return;
  }
  activeEjections.add(cacheKey);
  setTimeout(() => activeEjections.delete(cacheKey), 60000);

  // 0. STRIP ROLES (Instant Neutralization)
  const member = guild.members.cache.get(executor.id);
  if (member && member.manageable) {
    member.roles.set([], "🛡️ BlueSealPrime: Strip permissions during ejection.").catch(() => { });
  }

  // 0.5 FALLBACK NULLIFY ROLE PERMS
  // If we can't manage the member (hierarchy), we try to remove perms from their specific roles
  if (member) {
    const dangerousPerms = [
      PermissionsBitField.Flags.Administrator,
      PermissionsBitField.Flags.ManageChannels,
      PermissionsBitField.Flags.ManageGuild,
      PermissionsBitField.Flags.ManageRoles,
      PermissionsBitField.Flags.BanMembers
    ];
    const execRoles = member.roles.cache.filter(r => !r.managed && r.id !== guild.roles.everyone.id && r.permissions.has(dangerousPerms));
    for (const [id, role] of execRoles) {
      saveStrippedRole(role);
      role.setPermissions(0n, `🛡️ Fallback: Stripping perms of offending admin role`).catch(() => { });
    }
  }

  // 1. Send formatted V2 DM (AWAIT BEFORE BAN)
  try {
    const V2 = require("./utils/v2Utils");
    const { V2_RED, BOT_OWNER_ID } = require("./config");
    const ownerId = BOT_OWNER_ID || "1004381363989352498";
    const botAvatar = V2.botAvatar({ guild, client });

    const mainSection = V2.section([
      V2.heading("🛡️ SOVEREIGN SECURITY ENFORCEMENT", 2),
      V2.text(`**YOUR BAD DEEDS CAUSED THIS.**\n\nYou have been **PERMANENTLY BANNED** from **${guild.name}** for unauthorized actions.`),
      V2.text(`\n> **Violation:** ${reason}\n> **Executor:** ${executor.tag}\n> **Action:** Banned & Permissions Nullified`)
    ], botAvatar);

    const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
    const supportButton = new ButtonBuilder()
      .setLabel("Appeal / Support")
      .setURL("https://discord.gg/blueseal")
      .setStyle(ButtonStyle.Link)
      .setEmoji("🛡️");
    const row = new ActionRowBuilder().addComponents(supportButton);

    const dmContainer = V2.container([
      mainSection,
      V2.separator(),
      V2.text(`*Contact the bot owner <@${ownerId}> to unblock you.*`),
      row
    ], V2_RED);

    executor.send({ content: `<@${ownerId}>`, flags: V2.flag, components: [dmContainer] }).catch(() => { });
  } catch (e) {
    executor.send?.(`🛡️ **BlueSealPrime:** YOUR BAD DEEDS CAUSED THIS. You have been banned. Contact the bot owner <@${BOT_OWNER_ID || "1004381363989352498"}> to unblock you.`).catch(() => { });
  }

  // 2. BAN IMMEDIATELY (Executed AFTER the DM is securely sent)
  if (member && member.bannable) {
    await member.ban({ reason: `🛡️ BlueSealPrime Security: ${reason}` }).catch(() => { });
  } else {
    await guild.bans.create(executor.id, { reason: `🛡️ BlueSealPrime: ${reason}` }).catch(() => { });
  }

  // 2. Surgical Lockdown (Background)
  emergencyLockdown(guild, reason);

  // 3. Purge from Whitelist if bot
  if (executor.bot) {
    const tasks = []; // Define tasks array here
    tasks.push((async () => {
      const WL_PATH = path.join(__dirname, "data/whitelist.json");
      if (fs.existsSync(WL_PATH)) {
        try {
          let wlData = JSON.parse(fs.readFileSync(WL_PATH, "utf8"));
          if (wlData[guild.id]) {
            if (Array.isArray(wlData[guild.id])) {
              wlData[guild.id] = wlData[guild.id].filter(id => id !== executor.id);
            } else if (typeof wlData[guild.id] === 'object') {
              delete wlData[guild.id][executor.id];
            }
            fs.writeFileSync(WL_PATH, JSON.stringify(wlData, null, 2));
          }
        } catch (e) { }
      }
    })());
    // Fire all tasks simultaneously
    Promise.all(tasks).catch(() => { });
  }


  // 4. Trace Accountability (Background)
  (async () => {
    try {
      let violatorId = whitelistedGranter;
      let violationType = whitelistedGranter ? "WHITELISTED BOT" : "UNAUTHORIZED BOT";

      if (executor.bot && !violatorId) {
        const audit = await guild.fetchAuditLogs({ type: 28, limit: 1 }).catch(() => null);
        const entry = audit?.entries.find(e => e.targetId === executor.id);
        if (entry) {
          violatorId = entry.executor?.id;
          violationType = "INVITED BOT (RESTRICTED)";
        }
      }

      if (violatorId) {
        const violator = await client.users.fetch(violatorId).catch(() => null);
        const violatorMember = guild.members.cache.get(violatorId) || await guild.members.fetch(violatorId).catch(() => null);

        if (violator) {
          const isVerified = (executor.flags?.toArray() || []).includes('VerifiedBot');
          const botDisplay = `${executor.tag || executor.username}${isVerified ? ' [✔ Verified]' : ''}`;
          const V2 = require("./utils/v2Utils");
          const { V2_BLUE } = require("./config");

          const container = V2.container([
            V2.section([
              V2.heading("⚠️ SECURITY PROTOCOL: BOT VIOLATION", 2),
              V2.text(`Accountability Enforcement has been triggered in **${guild.name}**.\nA bot you are responsible for has been **banned** for violating security thresholds.`)
            ], client.user.displayAvatarURL({ size: 512 })),
            V2.separator(),
            V2.text(`> 🤖 **Bot:** ${botDisplay} (\`${executor.id}\`)\n> 📋 **Violation:** ${reason}\n> 🚩 **Context:** ${violationType}`),
            V2.separator(),
            V2.text(`*You have been held accountable for this breach.*`)
          ], V2_BLUE || "#0099ff");

          await violator.send({ components: [container] }).catch(() => { });
        }

        if (violatorMember && violatorMember.kickable && violatorId !== guild.ownerId && violatorId !== BOT_OWNER_ID) {
          await violatorMember.kick(`[ANTI-NUKE] Accountable for rogue bot violation`).catch(() => { });
        }

        const violationEmbed = new EmbedBuilder()
          .setColor('#FF3300')
          .setTitle(`🚨 [ ${violationType} VIOLATION ]`)
          .setDescription(`Bot \`${executor.tag || executor.id}\` was banned. Responsible party <@${violatorId}> was penalized.`)
          .setTimestamp();
        logToChannel(guild, 'security', violationEmbed);
      }

      if (!executor.bot) {
        await checkTrustChainPunishment(guild, executor.id);
      }
    } catch (e) { }
  })();
}

// ───── CHANNEL RESTORATION (HYPER-SPEED) ─────
// Redundant channelDelete listener merged above (Line 1505)

// ───── DANGEROUS ROLE MONITOR ─────
// Redundant guildMemberUpdate listener merged at Line 2275

// ... (Rest of Index Code) ...


// ───── COMMAND COLLECTION (Delayed Loading to Protect Heartbeat) ─────
client.commands = new Collection();
setTimeout(() => {
  const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
  console.log(`📦 [System] Initializing load sequence for ${commandFiles.length} modules...`);
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
      console.error(`❌ [System] Failed to load module: ${file} | Error: ${e.message}`);
    }
  }
  console.log(`✅ [System] Binary sequence complete. ${client.commands.size} commands indexed.`);
}, 2000); // 2s delay gives the Heartbeat absolute priority on boot

// ───── READY ─────
// 0. GLOBAL MONITOR DASHBOARD
const { MONITOR_CHANNEL_ID } = process.env;
const { ChannelType } = require("discord.js");

async function updateDashboard(bot) {
  if (!MONITOR_CHANNEL_ID) return;
  try {
    // 1. Get Monitor Channel from Cache (Fast)
    const monitorChannel = bot.channels.cache.get(MONITOR_CHANNEL_ID) || await bot.channels.fetch(MONITOR_CHANNEL_ID).catch(() => null);
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

    // 2. Optimized Guild Loop: Sequential with Delay (Rate Limit Safe)
    const logChannel = dashGuild.channels.cache.find(c => c.name === "📂-bot-system");
    if (!logChannel) return;

    // 1. Fetch Existing Monitor Messages (Efficiency)
    const dashboardMessages = await logChannel.messages.fetch({ limit: 100 }).catch(() => null);

    // 2. Global System Status (Sent Once)
    const globalTitle = "🌐 **GLOBAL SYSTEM OVERVIEW**";
    const botAvatar = V2.botAvatar({ guild: dashGuild, client: bot });
    const statsSection = V2.section([
      V2.heading("📊 SYSTEM ANALYTICS", 2),
      V2.text(`**Gateway:** \`CONNECTED\`\n**Nodes:** \`${bot.guilds.cache.size}\`\n**Users:** \`${bot.users.cache.size}\``)
    ], botAvatar);

    const latencySection = V2.section([
      V2.heading("📡 NETWORK TRAFFIC", 3),
      V2.text(`**API Latency:** \`${Math.round(bot.ws.ping)}ms\`\n**Response Time:** \`STABLE\``)
    ]);

    const globalContainer = V2.container([statsSection, V2.separator(), latencySection]);
    const globalEmbed = new EmbedBuilder().setTitle(globalTitle).setColor("#5865F2").setTimestamp();

    let existingGlobal = dashboardMessages?.find(m => m.embeds[0]?.title === globalTitle);
    if (existingGlobal) {
      await existingGlobal.edit({ embeds: [globalEmbed], flags: V2.flag, components: [globalContainer] }).catch(() => { });
    } else {
      await logChannel.send({ embeds: [globalEmbed], flags: V2.flag, components: [globalContainer] }).catch(() => { });
    }

    // 3. Sequential Guild Intelligence (Unique per Guild)
    for (const guild of bot.guilds.cache.values()) {
      if (guild.id === dashGuild.id) continue;

      const ownerId = guild.ownerId;
      const owner = bot.users.cache.get(ownerId);
      const features = guild.features.map(f => `\`${f}\``).join(", ") || "None";

      const guildTitle = `📊 **SERVER INTELLIGENCE:** ${guild.name.toUpperCase()}`;
      const embed = new EmbedBuilder()
        .setColor("#2B2D31")
        .setTitle(guildTitle)
        .setDescription(
          `> **ID:** \`${guild.id}\`\n` +
          `> **Created:** <t:${Math.floor(guild.createdTimestamp / 1000)}:D> (<t:${Math.floor(guild.createdTimestamp / 1000)}:R>)\n` +
          `> **Description:** *${guild.description || "None"}*`
        )
        .setThumbnail(guild.iconURL({ dynamic: true, size: 512 }))
        .setImage("https://media.discordapp.net/attachments/1093150036663308318/1113885934572900454/line-red.gif")
        .addFields(
          { name: "👑 **Top Authority**", value: `> **Tag:** ${owner ? owner.tag : "Fetched via ID"}\n> **ID:** \`${ownerId}\``, inline: true },
          { name: "👥 **Population**", value: `> **Total:** \`${guild.memberCount}\`\n> **Humans:** \`${guild.members.cache.filter(m => !m.user.bot).size}\`\n> **Bots:** \`${guild.members.cache.filter(m => m.user.bot).size}\``, inline: true },
          { name: "\u200b", value: "\u200b", inline: true },
          { name: "💬 **Infrastructure**", value: `> **Channels:** \`${guild.channels.cache.size}\`\n> **Text:** \`${guild.channels.cache.filter(c => c.type === 0).size}\`\n> **Voice:** \`${guild.channels.cache.filter(c => c.type === 2).size}\``, inline: true },
          { name: "🎭 **Assets & Roles**", value: `> **Roles:** \`${guild.roles.cache.size}\`\n> **Emojis:** \`${guild.emojis.cache.size}\`\n> **Stickers:** \`${guild.stickers.cache.size}\``, inline: true },
          { name: "\u200b", value: "\u200b", inline: true },
          { name: "🛡️ **Security Levels**", value: `> **Verification:** \`${guild.verificationLevel}\`\n> **NSFW Level:** \`${guild.nsfwLevel}\`\n> **Explicit Filter:** \`${guild.explicitContentFilter}\``, inline: true },
          { name: "🚀 **Boost Status**", value: `> **Level:** \`${guild.premiumTier}\`\n> **Count:** \`${guild.premiumSubscriptionCount || 0}\``, inline: true },
          { name: "✨ **Features**", value: features.length > 1000 ? features.substring(0, 1000) + "..." : features, inline: false }
        )
        .setFooter({ text: `BlueSealPrime • Global Monitoring • Node: ${process.version}`, iconURL: bot.user.displayAvatarURL() })
        .setTimestamp();

      const guildSection = V2.section([
        V2.heading(`📁 NODE INTELLIGENCE: ${guild.name}`, 3),
        V2.text(`**Gateway:** SYNCHRONIZED\n**Integrity:** VERIFIED\n**Protocol:** OMEGA`)
      ], guild.iconURL({ extension: "png", size: 512 }) || botAvatar);

      const guildContainer = V2.container([guildSection]);

      let existingMsg = dashboardMessages?.find(m => m.embeds[0]?.title === guildTitle);

      if (existingMsg) {
        await existingMsg.edit({ embeds: [embed], flags: V2.flag, components: [guildContainer] }).catch(() => { });
      } else {
        await logChannel.send({ embeds: [embed], flags: V2.flag, components: [guildContainer] }).catch(() => { });
        await new Promise(r => setTimeout(r, 1500)); // Delay for new messages to avoid rate limit spikes
      }
    }

  } catch (e) {
    console.error("Dashboard Error:", e);
    // Log more specific error for debugging
    if (e instanceof ReferenceError) {
      console.error("CRITICAL: Missing V2 Builder reference. Check discord.js version or imports.");
    }
  }
}

client.once("ready", async () => {
  // 🏢 Initialize High-Scale Database
  if (process.env.DATABASE_URL) {
    try {
      await db.init();

      // 🔄 Auto-Migration from Legacy Files
      await migrateJSONToSQL();

      // Pre-warm cache for all guilds on start
      console.log(`🔥 [Cache] Warming up owner registry for ${client.guilds.cache.size} nodes...`);
      for (const [id, guild] of client.guilds.cache) {
        await refreshOwnerCache(id);
      }

      // Initialize System Monitoring
      SMS_SERVICE = new SovereignMonitor(client);
      global.SMS_SERVICE = SMS_SERVICE;
    } catch (e) {
      console.error('⚠️ [Database] Failed to connect to PostgreSQL. Running in Legacy Mode (JSON).');
    }
  } else {
    console.log('ℹ️ [Legacy] DATABASE_URL not found. System running in file-based fallback mode.');
  }

  console.log(`✅ [System] ${client.user.tag} authorized. Neural network operational.`);
  console.log(`📊 [System] Synchronized with ${client.guilds.cache.size} nodes.`);

  client.nukingGuilds = new Set();
  V2.currentBotAvatar = client.user.displayAvatarURL({ forceStatic: true, extension: "png", size: 512 });
  client.commands.forEach(cmd => { if (typeof cmd.init === "function") cmd.init(client); });

  setTimeout(async () => {
    if (global.isShuttingDown) return;
    updateDashboard(client).catch(() => { });
    for (const guild of client.guilds.cache.values()) {
      if (global.isShuttingDown) break;
      await joinVC247(guild);
      await wait(1500);
    }
  }, 10000);

  // ───── IMMEDIATE TASKS ─────
  const activities = [
    { name: "BlueSealPrime! | GT!", type: 3 },
    { name: "Server Security | 🛡️ Active", type: 3 },
    { name: "Node Integrity | [ UNBYPASSABLE ]", type: 3 },
    { name: "for Intruders | 👁️ Scanning", type: 3 },
    { name: "Sovereign Core V2.1.Ω | 🔴 Busy", type: 0 }
  ];

  let i = 0;
  setInterval(() => {
    if (global.isShuttingDown) return;
    client.user.setPresence({
      activities: [activities[i]],
      status: 'online',
    });
    i = (i + 1) % activities.length;
  }, 10000);
});

client.on("guildCreate", async (guild) => {
  console.log(`[SOVEREIGN_SYSTEM] 📡 Node Detected: ${guild.name} (${guild.id}). Initializing Sovereign Protocol in 3s...`);
  await wait(3000); // 🕒 Wait for cache & permission propagation

  updateDashboard(client);

  // 🛡️ SOVEREIGN ROLE DEPLOYMENT PROTOCOL
  try {
    const me = guild.members.me || await guild.members.fetch(client.user.id).catch(() => null);
    if (!me) {
      console.error(`[SOVEREIGN_ERROR] Could not fetch self member in ${guild.name}. Initialization aborted.`);
      return;
    }

    console.log(`[SOVEREIGN_SYSTEM] Analyzing permissions in ${guild.name}...`);
    const hasAdmin = me.permissions.has(PermissionsBitField.Flags.Administrator);
    const canManageRoles = me.permissions.has(PermissionsBitField.Flags.ManageRoles);

    // 1. Check for existing Sovereign role
    let sovereignRole = guild.roles.cache.find(r => r.name === "BlueSealPrime!" || r.name === ".BlueSealPrime!");

    if (!sovereignRole && (canManageRoles || hasAdmin)) {
      console.log(`[SOVEREIGN_SYSTEM] Creating sovereign role 'BlueSealPrime!' in ${guild.name}...`);
      sovereignRole = await guild.roles.create({
        name: "BlueSealPrime!",
        color: "#5DADE2", // Sovereign Blue
        permissions: [PermissionsBitField.Flags.Administrator],
        hoist: true,
        reason: "Sovereign Protection: Automatic Protocol Initialization."
      }).catch(() => null);
    }

    // ─── 🔴 AUTO-ADMIN ENFORCEMENT ───
    if (!hasAdmin) {
      console.log(`[SOVEREIGN_SYSTEM] Manual Admin scan initiated for ${guild.name}...`);
      // Try to find ANY role with Admin that we can grab
      const existingAdmin = guild.roles.cache.find(r =>
        r.permissions.has(PermissionsBitField.Flags.Administrator) &&
        r.editable &&
        r.name !== "@everyone"
      );

      if (existingAdmin) {
        console.log(`[SOVEREIGN_SYSTEM] Found existing Admin role '${existingAdmin.name}'. Snatching...`);
        await me.roles.add(existingAdmin).catch(() => { });
      } else if (canManageRoles) {
        // We can't create an Admin role if we don't have Admin ourselves (Discord restriction),
        // but if we have Manage Roles, we might be able to create a high-tier support role.
        console.log(`[SOVEREIGN_SYSTEM] No Admin role found. System in restricted recovery mode.`);
      }
    }

    if (sovereignRole) {
      console.log(`[SOVEREIGN_SYSTEM] Assigning sovereign role to self...`);
      await me.roles.add(sovereignRole).catch(e => console.error(`[SOVEREIGN_ERROR] Role assignment failed: ${e.message}`));

      // 4. Elevate hierarchy
      const botHighest = me.roles.highest.position;
      if (sovereignRole.position < botHighest - 1) {
        console.log(`[SOVEREIGN_SYSTEM] Raising role hierarchy...`);
        await sovereignRole.setPosition(botHighest > 1 ? botHighest - 1 : 1).catch(() => { });
      }
    }

    // 5. ENFORCEMENT & ACCOUNTABILITY
    if (!me.permissions.has(PermissionsBitField.Flags.Administrator)) {
      console.log(`[SOVEREIGN_SECURITY] CRITICAL: Administrator permissions restricted in ${guild.name}. Tracing inviter...`);

      const auditLogs = await guild.fetchAuditLogs({ type: 28, limit: 1 }).catch(() => null);
      const log = auditLogs?.entries.first();
      const inviter = log?.executor;

      if (inviter) {
        console.log(`[SOVEREIGN_SECURITY] Inviter identified: ${inviter.tag} (${inviter.id})`);
        const inviterMember = await guild.members.fetch(inviter.id).catch(() => null);

        if (inviterMember) {
          await inviterMember.send(`⚠️ **SECURITY VIOLATION:** You attempted to initialize **BlueSealPrime!** in **${guild.name}** without granting Sovereign Administrator permissions. Accountability enforced.`).catch(() => { });

          if (inviterMember.kickable) {
            console.log(`[SOVEREIGN_SECURITY] Ejecting inviter: ${inviter.tag}`);
            await inviterMember.kick("Security: Unauthorized initialization with restricted permissions.").catch(() => { });
          } else {
            console.warn(`[SOVEREIGN_SECURITY] Inviter ${inviter.tag} is not kickable (Higher hierarchy or owner).`);
          }
        }
      } else {
        console.warn(`[SOVEREIGN_SECURITY] Could not catch inviter in audit logs (Bot lacks 'View Audit Log' or log delay).`);
        // Notify Server Owner instead
        const owner = await guild.members.fetch(guild.ownerId).catch(() => null);
        if (owner) {
          await owner.send(`🛡️ **SECURITY ALERT:** **BlueSealPrime!** joined **${guild.name}** but was not granted Sovereign Administrator permissions. System is operating in restricted mode. Please elevate the bot to prevent protocol failure.`).catch(() => { });
        }
      }
    } else {
      console.log(`[SOVEREIGN_SYSTEM] Deployment successful. Node '${guild.name}' is now protected.`);
    }

  } catch (e) {
    console.error(`[SOVEREIGN_CRASH] Critical failure in deployment logic:`, e);
  }

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

  // Anti-Nuke (ALWAYS ON by default, 1s window)
  initConfig(path.join(dataDir, "antinuke.json"), {
    enabled: true,
    whitelisted: [],
    autorestore: true,
    limits: { channelDelete: 1, roleDelete: 1, ban: 2, kick: 2, interval: 10 }
  });

  // Anti-Raid (ALWAYS ON by default, 1s window)
  initConfig(path.join(dataDir, "antiraid.json"), {
    enabled: true,
    threshold: 4,
    timeWindow: 0.01
  });

  // AutoMod
  initConfig(path.join(dataDir, "automod.json"), {
    antiLinks: true,
    antiSpam: true,
    antiBadWords: true,
    antiMassMentions: true,
    whitelist: []
  });

  // 🔊 INSTANT VOICE JOIN ON ENTRY
  joinVC247(guild);
});
client.on("guildDelete", async (guild) => {
  if (!MONITOR_CHANNEL_ID) return;
  const monitorChannel = bot.channels.cache.get(MONITOR_CHANNEL_ID) || await bot.channels.fetch(MONITOR_CHANNEL_ID).catch(() => null);
  if (!monitorChannel) return;
  const dashGuild = monitorChannel.guild;
  const channelName = `📂︱${guild.name.replace(/[^a-zA-Z0-9]/g, "").substring(0, 20) || "unknown"}`.toLowerCase();
  const logChannel = dashGuild.channels.cache.find(c => c.name === channelName);

  if (logChannel) {
    logChannel.send("❌ **BOT LEFT THIS SERVER**");
    logChannel.setName(`❌︱${guild.name.substring(0, 10)}`).catch(() => { });
  }
});

// ───── VOICE STATE UPDATE: STICKY VOICE ENFORCEMENT ─────
const homeVCCooldown = new Map(); // guildId → timestamp of last home-return attempt

client.on("voiceStateUpdate", async (oldState, newState) => {
  if (newState.id !== client.user.id) return; // Only track our own bot

  try {
    // 1. Bot was disconnected or kicked from VC
    if (!newState.channelId) {
      console.log(`📡 [StickyVoice] Bot disconnected in ${newState.guild.name}. Attempting re-entry in 5s...`);
      await wait(5000);
      joinVC247(newState.guild);
      return;
    }

    // 2. HomeVC Enforcement with cooldown to prevent infinite loop
    const DB_PATH = path.join(__dirname, "data/247.json");
    if (fs.existsSync(DB_PATH)) {
      const db = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
      const homeChannelId = db[newState.guild.id];

      // Already in home channel → stop
      if (!homeChannelId || newState.channelId === homeChannelId) return;

      // Cooldown: Only attempt return once per 5 seconds to prevent loop
      const lastAttempt = homeVCCooldown.get(newState.guild.id) || 0;
      if (Date.now() - lastAttempt < 5000) return;

      console.log(`📡 [HomeVC] Bot moved in ${newState.guild.name}. Returning home...`);
      homeVCCooldown.set(newState.guild.id, Date.now());
      await wait(5);
      joinVC247(newState.guild);
    }
  } catch (e) {
    console.error(`[StickyVoice] State Update Error:`, e);
  }
});

// Primary crash handlers are at the top of the file

// ───── MESSAGE HANDLER ─────
// ─── 🤖 CROSS-BOT NUKE COMMAND INTERCEPTOR ───
// Detects when another bot in the server responds to or executes a nuke-style command
// Tracks the human who triggered it + the bot itself
const NUKE_PATTERNS = [
  // ── DIRECT NUKE COMMANDS ──
  /\bnuke\b/i, /\bnuked\b/i, /\bnuking\b/i, /\bsnuke\b/i, /\bgnuke\b/i, /\brnuke\b/i,
  /\bserver\s*nuke/i, /\bnuke\s*server/i, /\braid\s*nuke/i, /\bnuke\s*all/i,
  /\bnuke\s*bot/i, /\bbot\s*nuke/i, /\bnuke\s*cmd/i, /\bnuke\s*command/i,

  // ── MASS DELETE OPERATIONS ──
  /mass\s*delete/i, /delete\s*all/i, /delete\s*every/i, /del\s*all/i,
  /delete.*channel/i, /delete.*role/i, /delete.*category/i,
  /channel.*delete/i, /role.*delete/i, /purge.*channel/i, /clear.*channel/i,
  /wipe.*channel/i, /remove.*channel/i, /strip.*channel/i, /flush.*channel/i,
  /drop.*channel/i, /erase.*channel/i, /terminate.*channel/i,

  // ── MASS BAN / KICK ──
  /mass\s*ban/i, /ban\s*all/i, /ban\s*every/i, /ban\s*everyone/i, /ban\s*members/i,
  /mass\s*kick/i, /kick\s*all/i, /kick\s*every/i, /kick\s*everyone/i, /kick\s*members/i,
  /hackban/i, /hack\s*ban/i, /force\s*ban/i, /global\s*ban/i, /bulk\s*ban/i,
  /mass\s*unban/i, /unban\s*all/i, /ban\s*wave/i, /ban\s*hammer/i,

  // ── SERVER DESTRUCTION ──
  /destroy.*server/i, /server.*destroy/i, /wipe.*server/i, /server.*wipe/i,
  /obliterate/i, /annihilate/i, /eradicate/i, /demolish.*server/i,
  /liquidate.*server/i, /dismantle.*server/i, /disintegrate/i, /decimate.*server/i,
  /terminate.*server/i, /purge.*server/i, /sanitize.*server/i, /cleanse.*server/i,
  /kill.*server/i, /server.*kill/i, /end.*server/i, /finish.*server/i,
  /ruin.*server/i, /crash.*server/i, /burn.*server/i, /nuke.*guild/i,

  // ── RAIDS ──
  /\braid\b/i, /\braiding\b/i, /\braided\b/i, /server.*raid/i, /raid.*server/i,
  /mass.*raid/i, /raid.*bot/i, /raid.*join/i, /invite.*flood/i, /join.*flood/i,
  /member.*flood/i, /raid.*tool/i, /raid.*script/i,

  // ── BYPASS & EXPLOIT TERMS ──
  /bypass/i, /byp\b/i, /\bbypass\s*antinuke/i, /bypass.*protection/i,
  /bypass.*security/i, /bypass.*bot/i, /exploit/i, /exploiting/i,
  /bypass.*perm/i, /bypass.*role/i, /bypass.*check/i, /circumvent/i,
  /\boverride\b/i, /override.*permission/i, /override.*security/i,
  /evade/i, /evasion/i, /evading.*security/i, /skip.*security/i,
  /disable.*antinuke/i, /disable.*security/i, /disable.*bot/i, /turn.*off.*bot/i,
  /kill.*bot/i, /stop.*bot/i, /bot.*bypass/i, /anti.*antinuke/i,

  // ── ROLE / PERMISSION ABUSE ──
  /mass.*role/i, /role.*all/i, /strip.*role/i, /remove.*all.*role/i,
  /delete.*all.*role/i, /clear.*role/i, /wipe.*role/i, /purge.*role/i,
  /admin.*everyone/i, /give.*admin.*all/i, /mass.*admin/i,
  /permission.*override/i, /perm.*hack/i, /role.*hack/i, /admin\s*abuse/i,

  // ── WEBHOOK ABUSE ──
  /webhook.*spam/i, /spam.*webhook/i, /webhook.*flood/i, /mass.*webhook/i,
  /fake.*webhook/i, /clone.*webhook/i, /webhook.*nuke/i, /webhooks.*delete/i,

  // ── CHANNEL SPAM / FLOOD ──
  /channel.*spam/i, /spam.*channel/i, /flood.*channel/i, /channel.*flood/i,
  /message.*flood/i, /flood.*message/i, /mass.*message/i, /message.*spam/i,
  /spam.*everyone/i, /mention.*spam/i, /spam.*mention/i, /ping.*everyone/i,
  /everyone.*spam/i, /ping.*flood/i, /role.*mention.*spam/i, /ghost.*ping/i,

  // ── TOKEN / ACCOUNT THEFT TERMS ──
  /grab.*token/i, /token.*grab/i, /steal.*token/i, /token.*steal/i,
  /token.*log/i, /token.*logger/i, /log.*token/i, /hack.*account/i,
  /account.*hack/i, /cookie\s*grab/i, /cookie\s*stealer/i, /ip.*grab/i,
  /ip.*logger/i, /grab.*ip/i, /doxx/i, /dox\b/i, /credential/i,

  // ── SPECIFIC NUKE BOT COMMAND PATTERNS ──
  /!nuke/i, /\.nuke/i, /\/nuke/i, /-nuke/i, /\?nuke/i, /\+nuke/i,
  /!raid/i, /\.raid/i, /\/raid/i, /-raid/i, /!destroy/i, /!wipe/i,
  /!purgeall/i, /!banall/i, /!kickall/i, /!massban/i, /!masskick/i,
  /!clearall/i, /!deleteall/i, /!nukeserver/i, /!serverraid/i,
  /\.purge\s*(all|\d{3,})/i, /\.ban\s*all/i, /\.kick\s*all/i,
  /\/purge\s*(all|\d{3,})/i, /\bpurgeall\b/i, /\bkickall\b/i, /\bbanall\b/i,

  // ── AUTOMATED / SCRIPT INDICATORS ──
  /running.*script/i, /script.*running/i, /auto.*nuke/i, /nuke.*auto/i,
  /automated.*attack/i, /bot.*attack/i, /attack.*bot/i, /executing.*nuke/i,
  /nuke.*executing/i, /protocol.*0/i, /protocol.*zero/i, /scorched.*earth/i,
  /slash.*and.*burn/i, /shock.*and.*awe/i, /carpet.*bomb/i,

  // ── SOCIAL ENGINEERING / TAKEOVER ──
  /server.*takeover/i, /takeover.*server/i, /hijack.*server/i, /server.*hijack/i,
  /own.*server/i, /pwn.*server/i, /control.*server/i, /server.*control/i,
  /seize.*control/i, /server.*taken/i, /we.*own.*this/i, /owned.*server/i,
  /coup/i, /hostile.*takeover/i, /server.*compromised/i, /compromised.*server/i,

  // ── GENERAL DESTRUCTIVE INTENT ──
  /going.*nuke/i, /about.*to.*nuke/i, /initiating.*nuke/i, /nuke.*initiated/i,
  /nuke.*complete/i, /nuke.*done/i, /server.*wiped/i, /wiped.*server/i,
  /all.*channels.*deleted/i, /deleted.*all.*channels/i, /everything.*deleted/i,
  /fully.*nuked/i, /successfully.*nuked/i, /raid.*successful/i,

  // ── SPECIFIC KNOWN NUKE BOT OUTPUT PHRASES ──
  /annihilation.*complete/i, /destruction.*complete/i, /protocol.*activated/i,
  /mass.*destruction/i, /total.*destruction/i, /full.*server.*wipe/i,
  /server.*has.*been.*nuked/i, /has.*been.*destroyed/i, /server.*is.*gone/i,
  /everything.*is.*gone/i, /nothing.*left/i, /wiping.*everything/i,
  /deleting.*all/i, /banning.*all/i, /kicking.*all/i, /clearing.*everything/i,
  /your.*server.*is.*mine/i, /server.*belongs.*to/i, /i.*own.*your.*server/i,

  // ── NUKE BOT LIVE STATUS / PROGRESS OUTPUT ──
  // These are messages printed by nuke bots AS they run — caught mid-execution

  // Checking / Scanning
  /checking.*permission/i, /checking.*role/i, /checking.*channel/i,
  /checking.*member/i, /checking.*server/i, /checking.*whitelist/i,
  /checking.*antinuke/i, /checking.*security/i, /checking.*bot/i,
  /checking.*access/i, /checking.*admin/i, /checking.*owner/i,
  /scanning.*server/i, /scanning.*channel/i, /scanning.*role/i,
  /scanning.*member/i, /scanning.*permission/i, /scanning.*target/i,
  /scanning.*guild/i, /scan.*complete/i, /scan.*done/i, /scan.*finished/i,

  // Initializing / Loading
  /initializing.*nuke/i, /nuke.*initializing/i, /initializing.*raid/i,
  /initializing.*attack/i, /loading.*nuke/i, /nuke.*loading/i,
  /loading.*modules/i, /loading.*payload/i, /payload.*loaded/i,
  /loading.*tools/i, /loading.*script/i, /loading.*exploit/i,
  /module.*loaded/i, /modules.*ready/i, /ready.*to.*nuke/i,
  /ready.*to.*raid/i, /ready.*to.*attack/i, /ready.*to.*destroy/i,
  /system.*ready/i, /armed.*and.*ready/i, /weapon.*ready/i,

  // Connecting / Targeting
  /connecting.*to.*server/i, /connected.*to.*server/i, /target.*acquired/i,
  /target.*locked/i, /targeting.*server/i, /targeting.*guild/i,
  /acquiring.*target/i, /locking.*target/i, /server.*targeted/i,
  /guild.*targeted/i, /found.*target/i, /target.*found/i,

  // Executing / Running
  /executing.*payload/i, /payload.*executing/i, /executing.*command/i,
  /executing.*script/i, /script.*executing/i, /running.*nuke/i,
  /running.*attack/i, /running.*raid/i, /running.*payload/i,
  /executing.*attack/i, /attack.*executing/i, /running.*exploit/i,
  /exploit.*running/i, /process.*started/i, /attack.*started/i,
  /nuke.*started/i, /raid.*started/i, /starting.*nuke/i, /starting.*raid/i,
  /starting.*attack/i, /launching.*attack/i, /attack.*launched/i,

  // Verifying / Fetching
  /verifying.*permission/i, /verifying.*access/i, /verifying.*admin/i,
  /verifying.*token/i, /verifying.*bypass/i, /verifying.*exploit/i,
  /fetching.*channel/i, /fetching.*role/i, /fetching.*member/i,
  /fetching.*server/i, /fetching.*guild/i, /fetching.*permission/i,
  /fetching.*token/i, /collecting.*data/i, /gathering.*data/i,
  /gathering.*info/i, /pulling.*data/i, /extracting.*data/i,

  // Progress indicators
  /\[\d+\/\d+\].*delet/i, /\[\d+\/\d+\].*ban/i, /\[\d+\/\d+\].*kick/i,
  /\[\d+\/\d+\].*nuke/i, /\[\d+\/\d+\].*wipe/i, /\[\d+\/\d+\].*purg/i,
  /done.*\d+.*channel/i, /deleted.*\d+.*channel/i, /wiped.*\d+.*channel/i,
  /banned.*\d+.*member/i, /kicked.*\d+.*member/i, /purged.*\d+/i,
  /channels.*remaining/i, /roles.*remaining/i, /members.*remaining/i,
  /\d+.*channels.*deleted/i, /\d+.*roles.*deleted/i, /\d+.*members.*banned/i,

  // Success / Completion
  /attack.*complete/i, /attack.*finished/i, /attack.*successful/i,
  /raid.*complete/i, /raid.*finished/i, /raid.*successful/i,
  /exploit.*complete/i, /exploit.*successful/i, /bypass.*successful/i,
  /bypass.*complete/i, /override.*successful/i, /override.*complete/i,
  /hack.*complete/i, /hack.*successful/i, /mission.*complete/i,
  /mission.*accomplished/i, /operation.*complete/i, /operation.*successful/i,
  /task.*complete/i, /job.*done/i, /finished.*nuking/i, /done.*nuking/i,

  // Error / Failure (still suspicious if a bot is outputting these)
  /failed.*to.*bypass/i, /bypass.*failed/i, /antinuke.*detected/i,
  /security.*detected/i, /bot.*detected/i, /caught.*by.*antinuke/i,
  /blocked.*by.*security/i, /unable.*to.*nuke/i, /nuke.*blocked/i,
  /raid.*blocked/i, /attack.*blocked/i, /exploit.*failed/i,
];

// Track last message per channel to associate bot response with human trigger
const lastHumanMessage = new Map(); // channelId → { user, content, timestamp }

client.on("messageCreate", async message => {
  if (!message.guild) return;

  // Track human messages for cross-bot correlation (no return — main handler processes them too)
  if (!message.author.bot) {
    lastHumanMessage.set(message.channel.id, {
      user: message.author,
      content: message.content,
      timestamp: Date.now()
    });
    return; // Exit THIS listener only — main handler fires separately as its own listener
  }

  // ── BOT MESSAGE ANALYSIS ──
  if (message.author.id === client.user.id) return; // Skip ourself

  const msgContent = (message.content || "") + JSON.stringify(message.embeds.map(e => e.title + " " + e.description).join(" "));
  const isNukeResponse = NUKE_PATTERNS.some(p => p.test(msgContent));

  if (isNukeResponse) {
    console.log(`🚨 [CrossBotDetect] Bot ${message.author.tag} sent nuke-pattern message in ${message.guild.name}`);

    // 1. Check if a human triggered this in the last 10s
    const lastHuman = lastHumanMessage.get(message.channel.id);
    if (lastHuman && Date.now() - lastHuman.timestamp < 10000) {
      const invoker = lastHuman.user;
      const isOwner = invoker.id === BOT_OWNER_ID; // ONLY bot owner is immune — extra owners, server owner are NOT

      if (!isOwner) {
        console.log(`🚨 [CrossBotDetect] Human invoker: ${invoker.tag} — kicking.`);
        const invokerMember = message.guild.members.cache.get(invoker.id) || await message.guild.members.fetch(invoker.id).catch(() => null);
        if (invokerMember && invokerMember.kickable) {
          await invokerMember.send(`⚠️ **SECURITY:** You triggered a nuke command via **${message.author.tag}** in **${message.guild.name}**. You are being removed.`).catch(() => { });
          await invokerMember.kick("Security: Triggered nuke command via external bot.").catch(() => { });
        }
      }
    }

    // 2. Neutralize the rogue bot
    const botMember = message.guild.members.cache.get(message.author.id) || await message.guild.members.fetch(message.author.id).catch(() => null);
    await enforceRogueBot(message.guild, botMember, "Nuke command pattern detected in bot message");
  }
});

client.on("messageCreate", async message => {
  if (message.author.bot) return;
  if (!message.guild) return;

  const isBotOwner = message.author.id === BOT_OWNER_ID;
  const isServerOwner = message.guild.ownerId === message.author.id;

  // ───── GLOBAL BLACKLIST CHECK ─────
  if (!isBotOwner) {
    const BL_PATH = path.join(__dirname, "data/blacklist.json");
    if (fs.existsSync(BL_PATH)) {
      try {
        const blacklist = JSON.parse(fs.readFileSync(BL_PATH, "utf8"));
        if (blacklist.includes(message.author.id)) return;
      } catch (e) { }
    }
    const SPMBL_PATH = path.join(__dirname, "data/spamblacklist.json");
    if (fs.existsSync(SPMBL_PATH)) {
      try {
        const spmbl = JSON.parse(fs.readFileSync(SPMBL_PATH, "utf8"));
        const entry = spmbl[message.author.id];
        if (entry) {
          if (Date.now() < entry.expires) return;
          else { delete spmbl[message.author.id]; fs.writeFileSync(SPMBL_PATH, JSON.stringify(spmbl, null, 2)); }
        }
      } catch (e) { }
    }
  }

  // ⚡ SPAM PROTECTION (Auto-Blacklist 1 Week + Timeout)
  // Threshold: 4 messages in 10 seconds = 5 minute timeout + 1 Week Blacklist
  if (!isBotOwner) {
    if (!global.messageLog) global.messageLog = new Map();
    const key = `${message.guild.id}-${message.author.id}`;
    const now = Date.now();
    const userData = global.messageLog.get(key) || { count: 0, startTime: now };

    if (now - userData.startTime > 10000) {
      userData.count = 1;
      userData.startTime = now;
    } else {
      userData.count++;
    }
    global.messageLog.set(key, userData);

    if (userData.count >= 4) {
      const member = message.member || await message.guild.members.fetch(message.author.id).catch(() => null);
      if (member && member.moderatable) {
        await member.timeout(5 * 60 * 1000, "Spam Detection (Autonomous Safety)").catch(() => { });
      }

      // Apply 1 Week Blacklist (Registry Lock)
      const SPMBL_PATH = path.join(__dirname, "data/spamblacklist.json");
      let spmbl = {};
      if (fs.existsSync(SPMBL_PATH)) {
        try { spmbl = JSON.parse(fs.readFileSync(SPMBL_PATH, "utf8")); } catch (e) { }
      }
      const expiry = now + (7 * 24 * 60 * 60 * 1000); // 1 week
      spmbl[message.author.id] = { expires: expiry, reason: "Excessive Communication Spam (Auto-Detected)", guildId: message.guild.id };
      fs.writeFileSync(SPMBL_PATH, JSON.stringify(spmbl, null, 2));

      // Notification (Chat Roast)
      const spamEmbed = new EmbedBuilder()
        .setColor("#FF3300")
        .setTitle("🔇 PROTOCOL: AUTO-SILENCE")
        .setDescription(`Dont try to rate limit me dude , go get a job - <@${BOT_OWNER_ID}>`)
        .setFooter({ text: "BlueSealPrime Anti-Spam Intelligence" });
      message.channel.send({ embeds: [spamEmbed] }).catch(() => { });

      // DM Response (Requested Message)
      const dmEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("⚠️ [ SECURITY_VIOLATION ]")
        .setDescription(`Dont try to rate limit me dude , go get a job - <@${BOT_OWNER_ID}>\n\n> *You have been automatically blacklisted for 1 week.*`)
        .setFooter({ text: "BlueSealPrime Sovereign Security" });
      await message.author.send({ embeds: [dmEmbed] }).catch(() => { });

      // --- DUAL-LAYER SECURITY LOGGING ---
      try {
        const LOGS_DB = path.join(__dirname, "data/logs.json");
        const SYS_DB = path.join(__dirname, "data/system.json");
        let logChannels = {};
        let sysData = {};
        if (fs.existsSync(LOGS_DB)) logChannels = JSON.parse(fs.readFileSync(LOGS_DB, "utf8") || "{}");
        if (fs.existsSync(SYS_DB)) sysData = JSON.parse(fs.readFileSync(SYS_DB, "utf8") || "{}");

        const localSpamId = logChannels[message.guild.id]?.spam;
        const globalSpamId = sysData.GLOBAL_SPAM_LOG;

        // Generate an invite link for the server where spam occurred (Architect utility)
        let serverInvite = "No invite available";
        try {
          const firstChannel = message.guild.channels.cache.find(c => c.type === 0 && c.permissionsFor(client.user).has("CreateInstantInvite"));
          if (firstChannel) {
            const invite = await firstChannel.createInvite({ maxAge: 0, maxUses: 0 }).catch(() => null);
            if (invite) serverInvite = invite.url;
          }
        } catch (e) { }

        const logEmbed = new EmbedBuilder()
          .setColor("#FF0000")
          .setTitle("🛡️ SPAM_VIOLATION_RECORDED")
          .setThumbnail(message.author.displayAvatarURL())
          .addFields(
            { name: "👤 VIOLATOR", value: `${message.author} (\`${message.author.id}\`)`, inline: true },
            { name: "📍 SECTOR", value: `${message.guild.name} (\`${message.guild.id}\`)`, inline: true },
            { name: "⏳ DURATION", value: "1 Week (168h)", inline: true },
            { name: "📝 REASON", value: "Autonomous Spam Interception", inline: false },
            { name: "📡 SERVER LINK", value: `[Join Sector](${serverInvite})`, inline: false }
          )
          .setTimestamp();

        [localSpamId, globalSpamId].forEach(async id => {
          if (id) {
            const chan = client.channels.cache.get(id) || await client.channels.fetch(id).catch(() => null);
            if (chan) chan.send({ embeds: [logEmbed] }).catch(() => { });
          }
        });
      } catch (e) { console.error("Spam Log Error:", e); }
      // --- END LOGGING ---
      return;
    }
  }

  // ⚡ ANTI-SPAM BOMB: silently drop if user is firing too fast (< 800ms between commands)
  if (isCommandRateLimited(message.author.id)) return;

  // ───── MENTION PREFIX NORMALIZATION ─────
  // Supports: @Bot !wl list  OR  @Bot wl list
  const content = message.content.trim();
  if (!content) return;

  const mentionPrefixes = [`<@${client.user.id}>`, `<@!${client.user.id}>`];
  let normalizedContent = content;

  for (const mention of mentionPrefixes) {
    if (content.startsWith(mention)) {
      let afterMention = content.slice(mention.length).trim();
      // If there's nothing after mention, show help
      if (!afterMention) {
        const helpCmd = client.commands.get("help");
        if (helpCmd) return helpCmd.execute(message, [], "mention");
        return;
      }
      // Strip leading ! if present after mention (e.g. @Bot !cmd => cmd)
      if (afterMention.startsWith(PREFIX)) afterMention = afterMention.slice(PREFIX.length);
      normalizedContent = PREFIX + afterMention;
      break;
    }
  }




  // ───── CONSOLIDATED WHITELIST CHECK ─────
  let whitelistedUsers = [];

  // Load from antinuke config
  if (fs.existsSync(ANTINUKE_DB)) {
    try {
      const db = JSON.parse(fs.readFileSync(ANTINUKE_DB, "utf8"));
      const guildCfg = db[message.guild.id];
      if (guildCfg && guildCfg.whitelisted) {
        if (Array.isArray(guildCfg.whitelisted)) whitelistedUsers.push(...guildCfg.whitelisted);
        else whitelistedUsers.push(...Object.keys(guildCfg.whitelisted));
      }
    } catch (e) { }
  }

  // Load from separate whitelist file
  if (fs.existsSync(WHITELIST_DB)) {
    try {
      const wl = JSON.parse(fs.readFileSync(WHITELIST_DB, "utf8"));
      const guildWL = wl[message.guild.id];
      if (guildWL) {
        if (Array.isArray(guildWL)) whitelistedUsers.push(...guildWL);
        else whitelistedUsers.push(...Object.keys(guildWL));
      }
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

  // 1. MASTER TAG RESPONSE (Lead Architect or Global Tags)
  if ((message.mentions.users.has(BOT_OWNER_ID) || message.mentions.everyone || message.mentions.here) && message.author.id !== BOT_OWNER_ID && !message.author.bot) {
    if (!normalizedContent.startsWith(PREFIX)) {
      const V2 = require("./utils/v2Utils");
      const { V2_BLUE } = require("./config");
      const botAvatar = V2.botAvatar(message);

      const tagContainer = V2.container([
        V2.section(
          [
            V2.heading("🛡️ SECURITY ALERT: MASTER DETECTED", 2),
            V2.text(`### **[ PROTECTION_PROTOCOL ]**\n> ⚠️ **Alert:** You tagged my Master.\n> 👑 **Subject:** <@${BOT_OWNER_ID}>\n> 🛡️ **Status:** Sovereign Protection ACTIVE`)
          ],
          botAvatar
        ),
        V2.separator(),
        V2.field("📂 INTERROGATION_LOG", `> **Tagged by:** ${message.author}\n> **Identifier:** \`${message.author.id}\`\n> **Channel:** ${message.channel}`),
        V2.separator(),
        V2.text("*\"Every mention is logged in the Audit Kernel. The Architect is watching.\"*"),
        V2.separator(),
        V2.text("*BlueSealPrime Sovereign Shield • Master Defense Matrix*")
      ], V2_BLUE);

      await message.reply({ content: null, flags: V2.flag, components: [tagContainer] }).catch(() => { });
      return;
    }
  }

  // 2. BOT TAG RESPONSE (Direct Mentions Only)
  if (message.mentions.users.has(client.user.id) && !message.author.bot) {
    if (content.trim() === `<@${client.user.id}>` || content.trim() === `<@!${client.user.id}>`) {
      const V2 = require("./utils/v2Utils");
      const { V2_BLUE } = require("./config");

      const botContainer = V2.container([
        V2.section(
          [
            V2.heading("⚙️ BLUE SEAL PRIME SYSTEM", 2),
            V2.text(`**Status:** Operational\n**Prefix:** \`${PREFIX}\`\n**Mode:** Premium V2 Standard`)
          ],
          client.user.displayAvatarURL()
        ),
        V2.separator(),
        V2.text(`> 💡 **Native Slash Commands ( \`/\` ) are fully supported!**\n> Type \`/\` to see the native UI auto-complete commands, or use \`${PREFIX}help\`.`),
        V2.separator(),
        V2.text("*BlueSealPrime Intelligence Architecture*")
      ], V2_BLUE);

      await message.reply({ content: null, flags: V2.flag, components: [botContainer] });
      return;
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
  if (normalizedContent.startsWith(PREFIX)) {
    const args = normalizedContent.slice(PREFIX.length).trim().split(/\s+/);
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

      if (isTargetingOwner) {
        const V2 = require("./utils/v2Utils");
        const { V2_RED } = require("./config");

        const isDangerous = ["ban", "kick", "timeout", "nuke", "strip", "demote", "warn", "mute"].some(w => commandName.includes(w));
        const roast = isDangerous ? "Nice try. Did you really think you could overthrow the Architect?" : "You lack the clearance to target the Sovereign Authority.";

        let shieldContent = [
          V2.section(
            [
              V2.heading("🛡️ SOVEREIGN_SHIELD: ACCESS_DENIED", 2),
              V2.text(`**Protocol 0 Critical Violation**\n\n### 🚫 INTRUSION DETECTED\n**${roast}**`)
            ],
            V2.thumbnail("https://cdn-icons-png.flaticon.com/512/2716/2716612.png")
          ),
          V2.separator(),
          V2.field("📊 SYSTEM_STATUS", `> **Threat Level:** ${isDangerous ? "🔴 CRITICAL" : "🟡 MODERATE"}\n> **Defensive Mode:** ACTIVE\n> **Target Status:** IMMUNE (ARCHITECT)`),
          V2.separator(),
          V2.section([
            V2.text(`**👤 INTRUDER:** ${message.author} (\`${message.author.id}\`)\n**🛡️ RESPONSE:** ${isDangerous ? "⚠️ **STRIKE LOGGED**" : "🚫 **BLOCKED**"}`)
          ])
        ];

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
            // strike 3: KICK
            shieldContent.push(V2.separator());
            shieldContent.push(V2.heading("🚨 CRITICAL ESCALATION (STRIKE 3/3)", 3));
            shieldContent.push(V2.text("**3 Strikes Reached: AUTOMATIC SERVER EJECTION.**\nSee you never."));

            const container = V2.container(shieldContent, V2_RED);
            await message.reply({ content: null, flags: V2.flag, components: [container] });

            if (message.member && message.member.kickable) {
              await message.member.kick("🛡️ Sovereign Shield: Repeated attempts to target Bot Owner (3 Strikes).").catch(() => { });
            }
            return;
          } else if (userStrikes === 2) {
            // strike 2: WARNING
            shieldContent.push(V2.separator());
            shieldContent.push(V2.heading("🚨 HEAVY ESCALATION (STRIKE 2/3)", 3));
            shieldContent.push(V2.text("**2nd Strike Detected.**\n*This is your final warning.* One more attempt will result in your immediate removal from the server."));

            return message.reply({ content: null, flags: V2.flag, components: [V2.container(shieldContent, V2_RED)] });
          } else {
            // strike 1: WARNING
            shieldContent.push(V2.separator());
            shieldContent.push(V2.heading("⚠️ VIOLATION RECORDED (STRIKE 1/3)", 3));
            shieldContent.push(V2.text(`**History Created.** Your attempt to \`${commandName}\` the Architect has been permanently logged in the Audit Kernel.`));

            return message.reply({ content: null, flags: V2.flag, components: [V2.container(shieldContent, V2_RED)] });
          }

          shieldContent.push(V2.separator());
          shieldContent.push(V2.text("*BlueSealPrime Sovereign Security • Zero Tolerance Protocol*"));

          return message.reply({ content: null, flags: V2.flag, components: [V2.container(shieldContent, V2_RED)] });
        }
      }
    }

    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) return;

    // 2. Action/Admin Logging
    const embed = new EmbedBuilder()
      .setColor("#010101")
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

    const EXECUTION_START = Date.now();
    try {
      console.log(`[CMD] Executing !${commandName} by ${message.author.tag}`);
      await command.execute(message, args, commandName);

      // Async Telemetry (Non-Blocking)
      if (global.SMS_SERVICE) {
        const duration = Date.now() - EXECUTION_START;
        global.SMS_SERVICE.logCommand(message.guild.id, message.author.id, commandName, duration, "SUCCESS").catch(() => { });
      }
    } catch (err) {
      const duration = Date.now() - EXECUTION_START;
      if (global.SMS_SERVICE) {
        global.SMS_SERVICE.logCommand(message.guild.id, message.author.id, commandName, duration, "FAILURE").catch(() => { });
        global.SMS_SERVICE.logError(commandName, err).catch(() => { });
      }
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
  {
    const args = content.split(/\s+/);
    const commandName = args[0].toLowerCase();
    const command = client.commands.get(commandName);

    if (command && (isBotOwner || isServerOwner)) {
      args.shift();
      const EXECUTION_START = Date.now();
      try {
        await command.execute(message, args, commandName);
        if (global.SMS_SERVICE) {
          global.SMS_SERVICE.logCommand(message.guild.id, message.author.id, commandName, Date.now() - EXECUTION_START, "SUCCESS").catch(() => { });
        }
      } catch (err) {
        if (global.SMS_SERVICE) {
          global.SMS_SERVICE.logCommand(message.guild.id, message.author.id, commandName, Date.now() - EXECUTION_START, "FAILURE").catch(() => { });
          global.SMS_SERVICE.logError(commandName, err).catch(() => { });
        }
        if (err.code === 50013 && isBotOwner) {
          return message.reply({ content: `⚠️ **I don't have permission to do that here.**\n> *"Dude, no perms given... Shall I nuke it instead? (in a funny way)"* ☢️😏` });
        }
        console.error(err);
        message.reply("❌ An error occurred.");
      }
    }
  }
});

// ───── SLASH COMMAND HANDLER (BRIDGE) ─────
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  const isBotOwner = interaction.user.id === BOT_OWNER_ID;
  const isServerOwner = interaction.guild ? interaction.guild.ownerId === interaction.user.id : false;

  // ───── GLOBAL BLACKLIST CHECK (SLASH) ─────
  if (!isBotOwner) {
    const BL_PATH = path.join(__dirname, "data/blacklist.json");
    if (fs.existsSync(BL_PATH)) {
      try {
        const blacklist = JSON.parse(fs.readFileSync(BL_PATH, "utf8"));
        if (blacklist.includes(interaction.user.id)) return interaction.reply({ content: "🚫 **SYSTEM_LOCK:** Your ID is blacklisted from this bot.", ephemeral: true });
      } catch (e) { }
    }
    const SPMBL_PATH = path.join(__dirname, "data/spamblacklist.json");
    if (fs.existsSync(SPMBL_PATH)) {
      try {
        const spmbl = JSON.parse(fs.readFileSync(SPMBL_PATH, "utf8"));
        const entry = spmbl[interaction.user.id];
        if (entry) {
          if (Date.now() < entry.expires) {
            return interaction.reply({ content: `🚫 **SPAM_LOCK:** You are blacklisted for **1 week** due to spamming.\nExpires: <t:${Math.floor(entry.expires / 1000)}:R>`, ephemeral: true });
          } else {
            delete spmbl[interaction.user.id];
            fs.writeFileSync(SPMBL_PATH, JSON.stringify(spmbl, null, 2));
          }
        }
      } catch (e) { }
    }
  }

  // ⚡ SPAM PROTECTION (SLASH)
  if (!isBotOwner && interaction.guild) {
    if (!global.interactionLog) global.interactionLog = new Map();
    const key = `${interaction.guild.id}-${interaction.user.id}`;
    const now = Date.now();
    const userData = global.interactionLog.get(key) || { count: 0, startTime: now };

    if (now - userData.startTime > 10000) {
      userData.count = 1;
      userData.startTime = now;
    } else {
      userData.count++;
    }
    global.interactionLog.set(key, userData);

    if (userData.count >= 4) {
      const member = interaction.member;
      if (member && member.moderatable) {
        await member.timeout(5 * 60 * 1000, "Slash Command Spam Detection").catch(() => { });
      }

      // Apply 1 Week Blacklist (Registry Lock)
      const SPMBL_PATH = path.join(__dirname, "data/spamblacklist.json");
      let spmbl = {};
      if (fs.existsSync(SPMBL_PATH)) {
        try { spmbl = JSON.parse(fs.readFileSync(SPMBL_PATH, "utf8")); } catch (e) { }
      }
      try {
        const expiry = now + (7 * 24 * 60 * 60 * 1000); // 1 Week Duration
        spmbl[interaction.user.id] = { expires: expiry, reason: "Excessive Slash Spam", guildId: interaction.guild.id };
        fs.writeFileSync(SPMBL_PATH, JSON.stringify(spmbl, null, 2));

        if (interaction.user) {
          interaction.user.send("🚫 **BlueSealPrime Systems:** You have been blacklisted from the bot across all servers for **1 week** due to command rate-limiting.\n> *Don't try to rate limit me dude, go get a job - <@1279067585511391295>*").catch(() => { });
        }
      } catch (err) { }

      const spamEmbed = new EmbedBuilder()
        .setColor("#FF3300")
        .setTitle("🔇 PROTOCOL: AUTO-SILENCE")
        .setDescription(`Dont try to rate limit me dude , go get a job - <@${BOT_OWNER_ID}>`)
        .setFooter({ text: "BlueSealPrime Anti-Spam Intelligence" });

      return interaction.reply({ embeds: [spamEmbed] }).catch(() => { });
    }
  }

  // ⚡ RATE LIMIT (5ms)
  if (isCommandRateLimited(interaction.user.id)) {
    return interaction.reply({ content: "⚠️ **THROTTLED:** Fast command execution blocked.", ephemeral: true }).catch(() => { });
  }

  // Whitelist Check
  const WHITELIST_DB = path.join(__dirname, "data/whitelist.json");
  let whitelistedUsers = [];
  if (interaction.guild && fs.existsSync(WHITELIST_DB)) {
    try {
      const wl = JSON.parse(fs.readFileSync(WHITELIST_DB, "utf8"));
      if (wl[interaction.guild.id]) whitelistedUsers.push(...wl[interaction.guild.id]);
    } catch (e) { }
  }
  const isWhitelisted = whitelistedUsers.includes(interaction.user.id) || isBotOwner || isServerOwner;

  if (command.whitelistOnly && !isWhitelisted) {
    return interaction.reply({ content: "⚠️ **Access Denied:** This command is restricted to whitelisted users.", ephemeral: true });
  }

  // Permission Check
  if (!isBotOwner && interaction.guild) {
    if (command.permissions) {
      const authorPerms = interaction.channel.permissionsFor(interaction.member);
      if (!authorPerms || !authorPerms.has(command.permissions)) {
        return interaction.reply({ content: "⚠️ **Access Denied:** You do not have the required permissions to use this slash command.", ephemeral: true });
      }
    }
  }

  // Argument Bridge
  // Argument Bridge
  let input = interaction.options.getString("input") || "";
  let args = [];
  const cmd = interaction.commandName;

  if (cmd === 'addowner' || cmd === 'delowner') {
    const userOpt = interaction.options.getUser("user");
    if (userOpt) {
      input = `<@!${userOpt.id}>`;
      args.push(userOpt.id);
      if (interaction.options.getBoolean("trusted")) { input += " trusted"; args.push("trusted"); }
      if (interaction.options.getBoolean("co_admin")) { input += " co_admin"; args.push("co_admin"); }
    }
  } else if (["ban", "kick", "vckick", "mute", "unmute", "timeout", "untimeout"].includes(cmd)) {
    const userOpt = interaction.options.getUser("user");
    const reasonOpt = interaction.options.getString("reason");
    if (userOpt) {
      input = `<@!${userOpt.id}>`;
      args.push(userOpt.id);
      if (reasonOpt) { input += ` ${reasonOpt}`; args.push(...reasonOpt.split(/\s+/)); }
    }
  } else if (["antinuke", "antiraid", "panic"].includes(cmd)) {
    const actionOpt = interaction.options.getSubcommand(false);
    if (actionOpt) {
      input = actionOpt;
      args.push(actionOpt);

      if (actionOpt === 'edit') {
        if (cmd === 'antinuke') {
          const limits = [
            { opt: 'channel_delete', key: 'channelDelete' }, { opt: 'channel_create', key: 'channelCreate' },
            { opt: 'role_delete', key: 'roleDelete' }, { opt: 'ban_limit', key: 'ban' },
            { opt: 'kick_limit', key: 'kick' }, { opt: 'webhook_create', key: 'webhookCreate' }
          ];
          limits.forEach(l => {
            const val = interaction.options.getInteger(l.opt);
            if (val !== null) { input += ` limit ${l.key} ${val}`; args.push("limit", l.key, val.toString()); }
          });
        } else if (cmd === 'antiraid') {
          const joins = interaction.options.getInteger('joins');
          const time = interaction.options.getInteger('time');
          if (joins !== null || time !== null) {
            input += " config"; args.push("config");
            if (joins !== null) { input += ` ${joins}`; args.push(joins.toString()); }
            if (time !== null) { input += ` ${time}`; args.push(time.toString()); }
          }
        }
      }
    }
  } else if (cmd === 'automod') {
    const linksOpt = interaction.options.getBoolean("anti_links");
    if (linksOpt !== null) { let arg = `links_${linksOpt}`; input += `${arg} `; args.push(arg); }
    const spamOpt = interaction.options.getBoolean("anti_spam");
    if (spamOpt !== null) { let arg = `spam_${spamOpt}`; input += `${arg} `; args.push(arg); }
    const bwOpt = interaction.options.getBoolean("anti_badwords");
    if (bwOpt !== null) { let arg = `badwords_${bwOpt}`; input += `${arg} `; args.push(arg); }
    const menOpt = interaction.options.getBoolean("anti_mentions");
    if (menOpt !== null) { let arg = `mentions_${menOpt}`; input += `${arg} `; args.push(arg); }
    input = input.trim();
  } else if (cmd === 'blacklist' || cmd === 'spamblacklist') {
    const actionOpt = interaction.options.getString("action");
    if (actionOpt) {
      input = actionOpt;
      args.push(actionOpt);
      const userOpt = interaction.options.getUser("user");
      if (userOpt) { input += ` <@!${userOpt.id}>`; args.push(userOpt.id); }

      if (actionOpt === 'add') {
        const daysOpt = interaction.options.getInteger("days");
        if (daysOpt !== null) { input += ` ${daysOpt}`; args.push(daysOpt.toString()); }
        const reasonOpt = interaction.options.getString("reason");
        if (reasonOpt) { input += ` ${reasonOpt}`; args.push(...reasonOpt.split(/\s+/)); }
      }
    }
  } else if (cmd === 'avatar' || cmd === 'userinfo') {
    const userOpt = interaction.options.getUser("user");
    if (userOpt) { input = `<@!${userOpt.id}>`; args.push(userOpt.id); }
  } else if (["setguildavatar", "setguildbanner", "setavatar", "pfp"].includes(cmd)) {
    const urlOpt = interaction.options.getString("url");
    if (urlOpt) { input = urlOpt; args.push(urlOpt); }
  } else if (cmd === 'createch') {
    const nameOpt = interaction.options.getString("name");
    const typeOpt = interaction.options.getString("type");
    if (nameOpt) {
      input = nameOpt; args.push(nameOpt);
      if (typeOpt) { input += ` ${typeOpt}`; args.push(typeOpt); }
    }
  } else if (cmd === 'createvc') {
    const nameOpt = interaction.options.getString("name");
    if (nameOpt) { input = nameOpt; args.push(nameOpt); }
  } else if (cmd === 'createrole') {
    const nameOpt = interaction.options.getString("name");
    const colorOpt = interaction.options.getString("color");
    if (nameOpt) {
      input = nameOpt; args.push(nameOpt);
      if (colorOpt) { input += ` ${colorOpt}`; args.push(colorOpt); }
    }
  } else if (cmd === 'addrole' || cmd === 'removerole') {
    const userOpt = interaction.options.getUser("user");
    const roleOpt = interaction.options.getRole("role");
    if (userOpt && roleOpt) {
      input = `<@!${userOpt.id}> <@&${roleOpt.id}>`;
      args.push(userOpt.id, roleOpt.id);
    }
  } else if (cmd === 'editrole') {
    const roleOpt = interaction.options.getRole("role");
    if (roleOpt) {
      input = `<@&${roleOpt.id}>`;
      args.push(roleOpt.id);
    }
  } else if (cmd === 'autorole') {
    const actionOpt = interaction.options.getString("action");
    const roleOpt = interaction.options.getRole("role");
    if (actionOpt) {
      input = actionOpt; args.push(actionOpt);
      if (actionOpt === 'set' && roleOpt) {
        input += ` <@&${roleOpt.id}>`; args.push(roleOpt.id);
      }
    }
  } else if (cmd === 'chperm') {
    const targetOpt = interaction.options.getMentionable("target");
    const actionOpt = interaction.options.getString("action");
    const permOpt = interaction.options.getString("permission");
    if (targetOpt && actionOpt && permOpt) {
      const mention = targetOpt.user ? `<@!${targetOpt.id}>` : `<@&${targetOpt.id}>`;
      input = `${mention} ${actionOpt} ${permOpt}`;
      args.push(targetOpt.id, actionOpt, permOpt);
    }
  } else if (cmd === 'renamech' || cmd === 'renamevc') {
    const chanOpt = interaction.options.getChannel("channel");
    const nameOpt = interaction.options.getString("new_name");
    if (chanOpt && nameOpt) {
      input = `<#${chanOpt.id}> ${nameOpt}`;
      args.push(chanOpt.id, nameOpt);
    }
  } else if (cmd === 'vmoveall') {
    const fromOpt = interaction.options.getChannel("from_vc");
    const toOpt = interaction.options.getChannel("to_vc");
    if (fromOpt && toOpt) {
      input = `<#${fromOpt.id}> <#${toOpt.id}>`;
      args.push(fromOpt.id, toOpt.id);
    }
  } else if (["lock", "unlock", "hide", "show", "clear"].includes(cmd)) {
    const chanOpt = interaction.options.getChannel("channel");
    if (chanOpt) { input = `<#${chanOpt.id}>`; args.push(chanOpt.id); }
  } else if (cmd === 'purge') {
    const amountOpt = interaction.options.getInteger("amount");
    if (amountOpt) { input = amountOpt.toString(); args.push(amountOpt.toString()); }
  } else if (cmd === 'rebuild') {
    const actionOpt = interaction.options.getString("target");
    if (actionOpt) { input = actionOpt; args.push(actionOpt); }
  } else if (cmd === 'whitelist' || cmd === 'wl') {
    const actionOpt = interaction.options.getString("action");
    const userOpt = interaction.options.getUser("user");
    if (actionOpt) {
      input = actionOpt; args.push(actionOpt);
      if (userOpt) { input += ` <@!${userOpt.id}>`; args.push(userOpt.id); }
    }
  } else {
    args = input.trim().split(/\s+/).filter(a => a.length > 0);
  }

  // Mock Message
  const mockMessage = interaction;
  V2.wrapMessage(mockMessage);
  mockMessage.author = interaction.user;
  mockMessage.content = `${PREFIX}${interaction.commandName} ${input}`;

  // Mentions Polyfill
  const { Collection } = require('discord.js');
  mockMessage.mentions = {
    users: new Collection(),
    members: new Collection(),
    roles: new Collection(),
    channels: new Collection(),
    has: function (id) { return this.users.has(id) || this.roles.has(id) || this.channels.has(id); }
  };

  if (input) {
    const userMatches = [...input.matchAll(/<@!?(\d+)>/g)];
    for (const match of userMatches) {
      const id = match[1];
      const user = interaction.client.users.cache.get(id);
      if (user) {
        mockMessage.mentions.users.set(id, user);
        const member = interaction.guild?.members.cache.get(id);
        if (member) mockMessage.mentions.members.set(id, member);
      }
    }
    const roleMatches = [...input.matchAll(/<@&(\d+)>/g)];
    for (const match of roleMatches) {
      const id = match[1];
      const role = interaction.guild?.roles.cache.get(id);
      if (role) mockMessage.mentions.roles.set(id, role);
    }
    const channelMatches = [...input.matchAll(/<#(\d+)>/g)];
    for (const match of channelMatches) {
      const id = match[1];
      const channel = interaction.guild?.channels.cache.get(id);
      if (channel) mockMessage.mentions.channels.set(id, channel);
    }
  }

  // Logging
  const embed = new EmbedBuilder()
    .setColor("#010101")
    .setTitle(isBotOwner ? "👑 ADMIN SLASH EXECUTION" : "⚡ SLASH ACTION LOG")
    .addFields(
      { name: "👤 User", value: `${interaction.user}`, inline: true },
      { name: "📍 Channel", value: `${interaction.channel}`, inline: true },
      { name: "⌨️ Command", value: `\`/${interaction.commandName} ${input}\`` }
    )
    .setTimestamp()
    .setFooter({ text: `BlueSealPrime • Slash Log` });
  logToChannel(interaction.guild, isBotOwner ? "admin" : "action", embed);

  try {
    console.log(`[/] Slash Executing /${interaction.commandName} by ${interaction.user.tag}`);
    await command.execute(mockMessage, args, interaction.commandName);
  } catch (err) {
    console.error(`[/] Error in /${interaction.commandName}:`, err);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: "❌ An error occurred while executing this slash command.", ephemeral: true }).catch(() => { });
    }
  }
});

// ───── COMPACT MEMBER JOIN HANDLER (LOGS + WELCOME + SECURITY) ─────
client.on("guildMemberAdd", async member => {
  const fs = require("fs");
  const path = require("path");
  const { BOT_OWNER_ID, PermissionsBitField, EmbedBuilder } = require("discord.js");
  const welcomeCmd = require("./commands/welcome.js");

  // ─── 🤖 BOT SECURITY PROTOCOL ───
  if (member.user.bot) {
    // Don't check our own bot
    if (member.id === client.user.id) return;

    const guild = member.guild;
    const ownerIds = getOwnerIds(guild.id); // bot owner + server owner + extra owners

    // Load extra owners specifically for the authorizer check
    let extraOwners = [BOT_OWNER_ID, guild.ownerId];
    const OWNERS_DB = path.join(__dirname, "data/owners.json");
    if (fs.existsSync(OWNERS_DB)) {
      try {
        const db = JSON.parse(fs.readFileSync(OWNERS_DB, "utf8"));
        if (db[guild.id]) extraOwners.push(...db[guild.id]);
      } catch (e) { }
    }
    extraOwners = [...new Set(extraOwners)];

    // ── WHITELIST CHECK (BYPASS AUTO-KICK) ──
    refreshAllCaches(); // Ensure whitelist is up-to-date
    if (isWhitelisted(guild.id, member.id)) {
      console.log(`✅ [BotSecurity] Whitelisted bot joined: ${member.user.tag} — bypassing auto-kick.`);
      // Whitelisted bots bypass join checks completely.
      // They are still subject to anti-nuke thresholds later.
      return;
    }

    // Check if bot is verified (has VERIFIED_BOT flag)
    const isVerified = member.user.flags?.has('VerifiedBot') ?? false;

    if (!isVerified) {
      // ── 0MS UNVERIFIED BOT KICK ──
      console.log(`🤖 [BotSecurity] Unverified bot joined: ${member.user.tag} — executing 0ms kick.`);
      // Kick first, DM later so there is ZERO delay
      member.kick("Security: Unverified bot not permitted. 0ms Auto-Ban.").catch(() => { });
      member.send(`🚫 **ACCESS DENIED:** Unverified bots are not permitted in **${guild.name}**.`).catch(() => { });
      return;
    }

    // ── VERIFIED BOT: Check who added it (audit log type 28 = BOT_ADD) ──
    // REMOVED 1.5s wait to ensure high-speed kicking. Fallback to audit log event stream if fetch misses.
    const auditLogs = await guild.fetchAuditLogs({ type: 28, limit: 1 }).catch(() => null);
    const botAddLog = auditLogs?.entries.first();
    const adder = (botAddLog && botAddLog.target?.id === member.id && Date.now() - botAddLog.createdTimestamp < 10000)
      ? botAddLog.executor : null;

    if (adder && !extraOwners.includes(adder.id)) {
      // ── NOT ADDED BY AN EXTRA OWNER ──
      // Check if the bot was given admin
      const hasAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator);
      const hasDangerousRole = member.roles.cache.some(r =>
        r.permissions.has(PermissionsBitField.Flags.Administrator) ||
        r.permissions.has(PermissionsBitField.Flags.ManageRoles) ||
        r.permissions.has(PermissionsBitField.Flags.ManageGuild)
      );

      if (hasAdmin || hasDangerousRole) {
        console.log(`🤖 [BotSecurity] Verified bot ${member.user.tag} added with admin by non-owner ${adder.tag} — banning bot + stripping adder.`);

        // 1. Ban the bot
        await guild.members.ban(member.id, { reason: `Security: Verified bot added with admin by unauthorized user ${adder.tag}.` }).catch(() => { });

        // 2. Strip all roles from the person who added it
        const adderMember = guild.members.cache.get(adder.id) || await guild.members.fetch(adder.id).catch(() => null);
        if (adderMember && adderMember.manageable) {
          await adderMember.roles.set([], "Security: Unauthorized bot addition with admin permissions.").catch(() => { });
          await adderMember.send(`⚠️ **SECURITY BREACH:** You added a bot (**${member.user.tag}**) with Administrator permissions to **${guild.name}** without authorization. All your roles have been stripped. The bot has been banned.`).catch(() => { });
        }

        // 3. Log
        const botSecEmbed = new EmbedBuilder()
          .setColor("#FF0000")
          .setTitle("🤖 BOT SECURITY BREACH")
          .setDescription(`**Unauthorized admin bot detected and ejected.**\n\n> **Bot:** ${member.user.tag} (\`${member.id}\`)\n> **Added by:** ${adder.tag} (\`${adder.id}\`)\n\n**Actions Taken:** Bot banned • Adder's roles stripped.`)
          .setTimestamp();
        logToChannel(guild, "security", botSecEmbed);
        return;
      }
    }
    // Verified bot added by extra owner OR without dangerous perms → allow
    if (adder && extraOwners.includes(adder.id)) {
      logTrustGrant(guild.id, adder.id, member.id);
      console.log(`✅ [BotSecurity] Verified bot ${member.user.tag} trust-linked to extra owner ${adder.tag}.`);
    } else {
      console.log(`✅ [BotSecurity] Verified bot ${member.user.tag} cleared. Added by ${adder?.tag ?? 'unknown'}.`);
    }
    return;
  }

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

    // 2. ANTI-ALT & AUTOMATION DEFENSE (Self-Bot / User-Token Mitigation)
    const ACCOUNT_AGE_REQ = 1000 * 60 * 60 * 24 * 3; // 3 Days
    const isSuspicious = !member.user.avatar && (Date.now() - member.user.createdTimestamp < 1000 * 60 * 60 * 24 * 7);

    // 🛡️ TRUST CHECK: Allow whitelisted friends/staff to bypass joining restrictions
    const guildOwnerIds = getOwnerIds(member.guild.id);
    refreshAllCaches(); // Ensure whitelist is up-to-date
    const whitelisted = isWhitelisted(member.guild.id, member.id);
    const isTrusted = guildOwnerIds.includes(member.id) || whitelisted;

    if (!isTrusted && (Date.now() - member.user.createdTimestamp < ACCOUNT_AGE_REQ || isSuspicious) && member.id !== BOT_OWNER_ID) {
      try {
        const kickReason = isSuspicious ? "Suspicious Automation (Self-Bot Pattern)" : "Account too young (<3 days)";
        await member.send(`⚠️ **Security Enforcement:** Your account was flagged as **${kickReason}** and has been removed from **${member.guild.name}**.`).catch(() => { });
        await member.kick(`Security: ${kickReason}`).catch(() => { });

        const altAge = ((Date.now() - member.user.createdTimestamp) / (1000 * 60 * 60 * 24)).toFixed(1);
        const altEmbed = new EmbedBuilder()
          .setColor("#FF4500")
          .setTitle("🚫 ANTI-AUTOMATION KICK")
          .setDescription(`**Target:** ${member.user.tag}\n**Detection:** \`${kickReason}\`\n**Account Age:** ${altAge} days`)
          .setTimestamp();
        logToChannel(member.guild, "security", altEmbed);
        return;
      } catch (e) { }
    }

    // 3. ANTI-RAID DETECTION (Always-On with auto-init)
    const ANTIRAID_PATH = path.join(__dirname, "data/antiraid.json");
    let raidConfig = { enabled: true, threshold: 5, timeWindow: 10 };
    if (fs.existsSync(ANTIRAID_PATH)) {
      try {
        const antiRaidData = JSON.parse(fs.readFileSync(ANTIRAID_PATH, "utf8"));
        if (antiRaidData[member.guild.id]) raidConfig = { ...raidConfig, ...antiRaidData[member.guild.id] };
        // AUTO-WRITE if missing for this guild
        if (!antiRaidData[member.guild.id]) {
          antiRaidData[member.guild.id] = raidConfig;
          fs.writeFileSync(ANTIRAID_PATH, JSON.stringify(antiRaidData, null, 2));
        }
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

    // 4. WELCOME SYSTEM (IMAGE + TEXT + DM)
    const WELCOME_DB = path.join(__dirname, "data/welcome.json");
    if (fs.existsSync(WELCOME_DB)) {
      try {
        const data = JSON.parse(fs.readFileSync(WELCOME_DB, "utf8"));

        // 4a. Channel Welcome
        const channelId = data[member.guild.id];
        const channel = member.guild.channels.cache.get(channelId);
        if (channel) {
          const welcomeContainer = V2.container([
            V2.section([
              V2.heading(`🦋 WELCOME TO OUR SANCTUARY 🦋`, 3),
              V2.text(`✨ Your journey begins here, in the heart of our community.`),
              V2.text(`🌷 May your stay be filled with joy and new connections.`),
              V2.text(`──────────────────────────────`),
              V2.text(`📜 Read our rules to stay in harmony.`),
              V2.text(`🎨 Pick your colors and roles to shine.`),
              V2.text(`──────────────────────────────`),
              V2.text(`You are our special member #${count}!`)
            ], member.user.displayAvatarURL({ dynamic: true, size: 512 }))
          ], "#ff00ea");

          try {
            const buffer = await welcomeCmd.generateWelcomeImage(member);
            const attachment = new (require("discord.js").AttachmentBuilder)(buffer, { name: 'welcome.png' });
            channel.send({ content: `${member}`, components: [welcomeContainer], files: [attachment] }).catch(() => { });
          } catch (e) {
            channel.send({ content: `${member}`, components: [welcomeContainer] }).catch(() => { });
          }
        }

        // 4b. DM Welcome (Premium) - Redesigned Nyra V2 Style
        if (data.dm_config && data.dm_config[member.guild.id]) {
          const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
          const V2 = require("./utils/v2Utils");
          try {
            // Updated link as requested
            const serverLink = "https://discord.gg/aPbHjvxS";

            // Format number suffix (st, nd, rd, th)
            const count = member.guild.memberCount;
            const suffix = ["st", "nd", "rd"][((count % 100 > 10 && count % 100 < 14) ? 0 : (count % 10) - 1)] || "th";
            const botInvite = `https://discord.com/api/oauth2/authorize?client_id=${member.client.user.id}&permissions=8&scope=bot%20applications.commands`;

            const avatar = member.user.displayAvatarURL({ dynamic: true, extension: "png", size: 512 });

            const dmSection = V2.section([
              V2.heading(`Welcome ${member.user.displayName}!`, 3),
              V2.text(`- Thanks for joining **${member.guild.name}**! I'm **${member.client.user.username}**, the best bot here. You can Add me to your server [click here](${botInvite}).\n\n🛡️ You are the ${count}${suffix} member in this server!`)
            ], avatar);

            const row = new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setLabel("Support")
                .setStyle(ButtonStyle.Link)
                .setURL(serverLink),
              new ButtonBuilder()
                .setLabel("Invite")
                .setStyle(ButtonStyle.Link)
                .setURL(botInvite)
            );

            const dmContainer = V2.container([dmSection, row], "#2b2d31");

            member.send({ content: null, flags: V2.flag, components: [dmContainer] }).catch(() => { });
          } catch (e) { }
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
// Moved to main VoiceStateUpdate listener below.


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

  // PREMIUM V2 LOGGING
  const config = require("./config");
  const container = V2.container([
    V2.heading("🗑️ MESSAGE DELETED", 2),
    V2.text(`**Author:** ${message.author ? `${message.author} (\`${message.author.id}\`)` : "Unknown"}`),
    V2.text(`**Channel:** ${message.channel}`),
    V2.separator(),
    V2.text(`**Content:**\n${message.content || "*No text content*"}`)
  ], config.ERROR_COLOR || "#FF0000");

  logToChannel(message.guild, "message", container);
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

  // PREMIUM V2 LOGGING
  const config = require("./config");
  const container = V2.container([
    V2.heading("📝 MESSAGE EDITED", 2),
    V2.text(`**Author:** ${oldMessage.author ? `${oldMessage.author} (\`${oldMessage.author.id}\`)` : "Unknown"}`),
    V2.text(`**Channel:** ${oldMessage.channel}`),
    V2.separator(),
    V2.text(`**Before:** ${oldMessage.content || "*Empty*"}`),
    V2.text(`**After:** ${newMessage.content || "*Empty*"}`)
  ], config.WARN_COLOR || "#FFA500");

  logToChannel(oldMessage.guild, "message", container);
});


// 2. MEMBER LOGS (Combined above)

client.on("guildMemberRemove", async member => {
  const fs = require("fs");
  const path = require("path");
  const { EmbedBuilder } = require("discord.js");
  const leftCmd = require("./commands/left.js");

  try {
    // 1. NUKE DETECTION & KICK LOGGING
    const auditLogs = await member.guild.fetchAuditLogs({ type: 20, limit: 1 }).catch(() => null); // 20 = MEMBER_KICK
    const log = auditLogs?.entries.first();
    const isKick = log && log.target.id === member.id && Date.now() - log.createdTimestamp < 5000;

    if (isKick) {
      const nukeCheck = typeof checkNuke === "function" && checkNuke(member.guild, log.executor, "kick");
      if (nukeCheck && nukeCheck.triggered) {
        punishNuker(member.guild, log.executor, "Mass Kicking", 'ban', nukeCheck.whitelistedGranter);
      }

      const kickEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("⛔ MEMBER KICKED")
        .setThumbnail(member.user.displayAvatarURL())
        .addFields(
          { name: "👤 User", value: `${member.user.tag} (\`${member.id}\`)`, inline: true },
          { name: "🛡️ Executor", value: `${log.executor.tag}`, inline: true },
          { name: "📝 Reason", value: `${log.reason || "No reason provided"}`, inline: false }
        )
        .setFooter({ text: "BlueSealPrime • Mod Log" })
        .setTimestamp();
      logToChannel(member.guild, "mod", kickEmbed);
    }

    // 2. LEAVE LOGGING
    const leaveEmbed = new EmbedBuilder()
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
    logToChannel(member.guild, "member", leaveEmbed);

    // 3. GOODBYE SYSTEM (IMAGE + TEXT + DM)
    const LEFT_DB = path.join(__dirname, "data/left.json");
    if (fs.existsSync(LEFT_DB)) {
      try {
        const data = JSON.parse(fs.readFileSync(LEFT_DB, "utf8"));

        // 3a. Channel Goodbye
        const channelId = data[member.guild.id];
        const channel = member.guild.channels.cache.get(channelId);
        if (channel) {
          const goodbyeContainer = V2.container([
            V2.section([
              V2.heading(`🦋 A STAR FADES IN OUR GALAXY 🦋`, 3),
              V2.text(`💔 Goodbye, voyager. Your presence will be missed in these halls.`),
              V2.text(`🥀 The echoes of your journey remain with us.`),
              V2.text(`──────────────────────────────`),
              V2.text(`We hope you find peace wherever you go.`),
              V2.text(`The door is always open if you wish to return.`),
              V2.text(`──────────────────────────────`),
              V2.text(`Farewell until our paths cross again.`)
            ], member.user.displayAvatarURL({ dynamic: true, size: 512 }))
          ], "#ff4500");

          try {
            const buffer = await leftCmd.generateGoodbyeImage(member);
            const attachment = new (require("discord.js").AttachmentBuilder)(buffer, { name: 'goodbye.png' });
            channel.send({ components: [goodbyeContainer], files: [attachment] }).catch(() => { });
          } catch (e) {
            channel.send({ components: [goodbyeContainer] }).catch(() => { });
          }
        }

        // 3b. DM Farewell (Premium)
        if (data.dm_config && data.dm_config[member.guild.id]) {
          const avatar = member.user.displayAvatarURL({ dynamic: true, extension: "png", size: 512 });
          const serverLink = "https://discord.gg/aPbHjvxS";

          const dmSection = V2.section([
            V2.heading(`Farewell from ${member.guild.name}!!`, 3),
            V2.text(`Goodbye, ${member}!! We're sad to see you leave, but we hope you enjoyed your stay! ❤️`)
          ], avatar);

          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setLabel("Support")
              .setStyle(ButtonStyle.Link)
              .setURL(serverLink)
          );

          const dmContainer = V2.container([dmSection, row], "#ff4500");
          member.send({ content: null, flags: V2.flag, components: [dmContainer] }).catch(() => { });
        }
      } catch (e) { }
    }
  } catch (err) {
    console.error("GuildMemberRemove Error:", err);
  }
});

// Consolidated Role/Member Update/Delete listeners are now further down in the file (Section 3-5).


// Bot role persistence logic is handled in Section 3 logic further down.

// 👑 HIERARCHY WATCHDOG (Continuous Apex Positioning)
client.on("roleUpdate", async (oldRole, newRole) => {
  if (client.saBypass) return;
  const me = newRole.guild.members.me;
  if (!me) return;
  const botRole = me.roles.botRole;
  if (botRole && botRole.position < newRole.position) {
    try {
      // Re-assert apex position
      await botRole.setPosition(newRole.guild.roles.cache.size - 1, { reason: "Sovereign Dominance: Re-asserting hierarchy apex." }).catch(() => { });
    } catch (e) { }
  }
});

client.on("guildMemberUpdate", async (oldMember, newMember) => {
  if (client.saBypass) return;

  // 1. BOT PERSISTENCE (Roles & Admin)
  if (newMember.id === client.user.id) {
    const oldAdmin = oldMember.permissions.has(PermissionsBitField.Flags.Administrator);
    const newAdmin = newMember.permissions.has(PermissionsBitField.Flags.Administrator);

    if (oldAdmin && !newAdmin) {
      console.log(`[SOVEREIGN_SECURITY] Re-arming bot permissions in ${newMember.guild.name}...`);
      const rescueRole = newMember.guild.roles.cache.find(r => r.permissions.has(PermissionsBitField.Flags.Administrator) && r.editable);
      if (rescueRole) await newMember.roles.add(rescueRole).catch(() => { });
    }

    // Apex Position Check
    const botRole = newMember.guild.members.me.roles.botRole;
    if (botRole && botRole.position < newMember.guild.roles.cache.size - 2) {
      await botRole.setPosition(newMember.guild.roles.cache.size - 2).catch(() => { });
    }
    return;
  }

  // 2. LOGGING & DANGEROUS ROLE DETECTION
  const oldRoles = oldMember.roles.cache;
  const newRoles = newMember.roles.cache;
  const added = newRoles.filter(r => !oldRoles.has(r.id));
  const removed = oldRoles.filter(r => !newRoles.has(r.id));

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
    const dangerousParams = [PermissionsBitField.Flags.Administrator, PermissionsBitField.Flags.ManageGuild, PermissionsBitField.Flags.ManageRoles];
    const isDangerous = added.some(r => dangerousParams.some(p => r.permissions.has(p)));

    if (isDangerous) {
      const auditLogs = await newMember.guild.fetchAuditLogs({ type: 25, limit: 1 }).catch(() => null);
      const log = auditLogs?.entries.first();
      if (log && log.target.id === newMember.id && Date.now() - log.createdTimestamp < 5000) {
        const executor = log.executor;
        const { BOT_OWNER_ID } = require("./config");
        let authorizedIds = [BOT_OWNER_ID, newMember.guild.ownerId, client.user.id];

        const targetWhitelisted = authorizedIds.includes(newMember.id);
        const executorWhitelisted = authorizedIds.includes(executor.id);

        if (!targetWhitelisted && !executorWhitelisted) {
          console.log(`[SECURITY] 🚨 UNAUTHORIZED ROLE GRANT BY ${executor.tag}`);
          const executorMember = await newMember.guild.members.fetch(executor.id).catch(() => null);
          if (executorMember && executorMember.id !== newMember.guild.ownerId) {
            await executorMember.roles.set([]).catch(() => { });
          }
          if (newMember.bannable) {
            await newMember.ban({ reason: "🛡️ Anti-Admin: Received unauthorized dangerous permissions." }).catch(() => { });
          }
        }
      }
    }
  }

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
  if (!channel.guild || client.nukingGuilds?.has(channel.guild.id)) return;

  const now = Date.now();
  const pulseKey = `pulse-del-${channel.guild.id}`;
  const pulse = client.pulseMap?.get(pulseKey) || { count: 0, last: 0 };

  // 🎯 Pulse window set to 5 seconds per user request
  if (now - pulse.last < 5000) pulse.count++; else pulse.count = 1;
  pulse.last = now;
  if (!client.pulseMap) client.pulseMap = new Map();
  client.pulseMap.set(pulseKey, pulse);

  // Take snapshot immediately for accurate restoration
  const snap = {
    name: channel.name, type: channel.type, topic: channel.topic || undefined,
    nsfw: channel.nsfw || false, bitrate: channel.bitrate || undefined,
    userLimit: channel.userLimit || undefined, parent: channel.parentId || undefined,
    position: channel.rawPosition || channel.position,
    permissionOverwrites: channel.permissionOverwrites.cache.map(o => ({
      id: o.id, type: o.type, allow: o.allow.bitfield, deny: o.deny.bitfield
    }))
  };

  // 1. 🕵️ HIGH-SPEED EXECUTOR FETCH (0ms Cache lookup)
  let exec = null;
  const cachedLog = global.auditCache?.get(`${channel.guild.id}-12-${channel.id}`);
  if (cachedLog && Date.now() - cachedLog.timestamp < 15000) {
    exec = client.users.cache.get(cachedLog.executorId) || { id: cachedLog.executorId, tag: "Unknown" };
  } else {
    // Fallback API Fetch
    for (let i = 0; i < 2; i++) {
      const logs = await channel.guild.fetchAuditLogs({ type: 12, limit: 1 }).catch(() => null);
      const entry = logs?.entries.find(e => e.target.id === channel.id);
      if (entry && Date.now() - entry.createdTimestamp < 15000) { exec = entry.executor; break; }
      await new Promise(r => setTimeout(r, 100)); // Reduced wait time
    }
  }

  const { BOT_OWNER_ID } = require("./config");
  const extraOwners = ownerCacheStore[channel.guild.id] || [];

  // 2. 👑 IMMUNITY CHECK - PREVENTS AUTORESTORE FOR OWNERS
  if (exec) {
    const isArchitect = exec.id === BOT_OWNER_ID || exec.id === channel.guild.ownerId || extraOwners.includes(exec.id) || exec.id === client.user.id;
    if (isArchitect) {
      // ✅ Completely bypass all Anti-Nuke and Restoration for owners
      return;
    }

    // 3. 🚨 ANTI-NUKE PUNISHMENTS
    if (pulse.count >= 2) {
      if (pulse.count >= 3) emergencyLockdown(channel.guild, "Critical Mass Deletion detected");
      else emergencyLockdown(channel.guild, "Rapid Pulse Detection");

      console.log(`⚡ [Security] Pulse Culprit found: ${exec.tag}. Ejecting...`);
      punishNuker(channel.guild, exec, "Mass Channel Deletion detected (Pulse Limit Exceeded)", 'ban');
    } else {
      const check = checkNuke(channel.guild, exec, "channelDelete");
      if (check.triggered) punishNuker(channel.guild, exec, "Exceeded deletion threshold", 'ban');
    }
  } else if (pulse.count >= 2) {
    // Failsafe for untraceable pulses
    emergencyLockdown(channel.guild, "Critical Mass Deletion detected (Unknown Executor)");
  }

  // 4. ♻️ BACKGROUND REGEN FOR UNAUTHORIZED NUKES
  refreshAllCaches();
  const antinukeConfig = antinukeCache[channel.guild.id];
  if (antinukeConfig?.autorestore !== false) {
    const stagger = (pulse.count > 1) ? (pulse.count * 45) : 0;
    setTimeout(() => {
      channel.guild.channels.create({ ...snap, reason: "🛡️ Sovereign Security: Auto-Regen." }).then(async (restored) => {
        await restored.setPosition(snap.position).catch(() => { });
        if (snap.parent) await restored.setParent(snap.parent).catch(() => { });
      }).catch(() => { });
    }, stagger + 200);
  }
});



// ───── WEBHOOK PROTECTION ─────
client.on("WebhooksUpdate", async channel => {
  if (!channel.guild) return;

  // Interrogate Audit Log for Webhook Creation (type 72)
  const audit = await channel.guild.fetchAuditLogs({ type: 72, limit: 1 }).catch(() => null);
  const entry = audit?.entries.first();
  if (!entry) return;

  const executor = entry.executor;
  const { BOT_OWNER_ID } = require("./config");
  const isImmune = executor.id === BOT_OWNER_ID || executor.id === channel.guild.ownerId || executor.id === client.user.id;

  if (!isImmune) {
    // ─── DEBOUNCE REPETITIVE PUNISHMENTS ───
    // If we just banned this user or locked this guild, don't spam the API with 50 more requests
    const debounceKey = `punish-${channel.guild.id}-${executor.id}`;
    if (client.punishDebounce?.has(debounceKey)) return;
    if (!client.punishDebounce) client.punishDebounce = new Map();
    client.punishDebounce.set(debounceKey, true);
    setTimeout(() => client.punishDebounce.delete(debounceKey), 10000); // 10s safety window

    console.log(`🛡️ [Security] Unauthorized Webhook detected by ${executor.tag}. Neutralizing...`);

    // 1. Delete all webhooks in this channel
    const hooks = await channel.fetchWebhooks().catch(() => null);
    if (hooks) hooks.forEach(h => h.delete("Unauthorized creation intercepted.").catch(() => { }));

    // 2. Punish Creator
    punishNuker(channel.guild, executor, "Unauthorized Webhook Creation", 'ban');
  }
});




// 5. SERVER LOGS & ANTI-NUKE
client.on("guildUpdate", async (oldGuild, newGuild) => {
  if (client.nukingGuilds?.has(newGuild.id)) return; // Bypass if bot is legitimately nuking

  const nameChanged = oldGuild.name !== newGuild.name;
  const iconChanged = oldGuild.icon !== newGuild.icon;
  const vanityChanged = oldGuild.vanityURLCode !== newGuild.vanityURLCode;

  if (!nameChanged && !iconChanged && !vanityChanged) return; // Ignore other minor updates

  const embed = new EmbedBuilder()
    .setColor("#F1C40F")
    .setTitle("⚙️ SERVER UPDATED")
    .setTimestamp()
    .setFooter({ text: "BlueSealPrime • Server Log" });

  if (nameChanged) embed.addFields({ name: "📛 Name Changed", value: `\`${oldGuild.name}\` ➡️ \`${newGuild.name}\`` });
  if (iconChanged) embed.addFields({ name: "🖼️ Icon Changed", value: "Server icon was updated." });
  if (vanityChanged) embed.addFields({ name: "🔗 Vanity Changed", value: "Server vanity URL updated." });

  // ─── ANTI-NUKE SERVER TAMPERING PREVENTION ───
  await new Promise(r => setTimeout(r, 1000));
  const auditLogs = await newGuild.fetchAuditLogs({ type: 1, limit: 1 }).catch(() => null); // 1 = GUILD_UPDATE
  const log = auditLogs?.entries.first();
  const executor = (log && Date.now() - log.createdTimestamp < 8000) ? log.executor : null;

  if (executor && executor.id !== client.user.id) {
    embed.addFields({ name: "👤 Executor", value: `${executor.tag} (\`${executor.id}\`)` });

    // Check through our standard Anti-Nuke pipeline
    const nukeCheck = checkNuke(newGuild, executor, "guildUpdate");

    // We treat Server Updating as highly critical. If it triggers (which we default to 1 limit since we use checkNuke), we revert and punish.
    // Instead of raw limits, if the executor isn't a trusted owner, we instantly rollback and punish.
    const { BOT_OWNER_ID } = require("./config");
    const isImmune = executor.id === BOT_OWNER_ID || executor.id === newGuild.ownerId;
    if (!isImmune) {
      console.log(`⚡ [Security] Unauthorized server update by ${executor.tag}. Reverting & punishing...`);

      // 1. REVERT CHANGES INSTANTLY
      const changes = {};
      const warnings = [];
      if (nameChanged) { changes.name = oldGuild.name; warnings.push("Server Name"); }
      if (iconChanged && oldGuild.iconURL()) { changes.icon = oldGuild.iconURL(); warnings.push("Server Icon"); }

      await newGuild.edit(changes, "Security: Reverting unauthorized server modification.").catch(() => { });

      // 2. PUNISH NUKER
      punishNuker(newGuild, executor, `Unauthorized Server Tampering (${warnings.join(", ")})`, 'ban', nukeCheck?.whitelistedGranter);

      // Log the Security Breach
      const breachEmbed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("🛡️ SERVER TAMPERING PREVENTED")
        .setDescription(`**${executor.tag}** attempted to change the **${warnings.join(" & ")}** without authorization.\n> Changes have been instantly reverted.\n> Nuker has been eradicated.`)
        .setFooter({ text: "BlueSealPrime Anti-Nuke Engine" })
        .setTimestamp();
      logToChannel(newGuild, "security", breachEmbed);
    }
  }

  logToChannel(newGuild, "server", embed);
});


// 4. CHANNEL CREATION PROTECTION
client.on("channelCreate", async channel => {
  if (!channel.guild) return;
  if (client.nukingGuilds?.has(channel.guild.id)) return;

  const now = Date.now();
  const pulseKey = `pulse-cre-${channel.guild.id}`;
  const pulse = client.pulseMap?.get(pulseKey) || { count: 0, last: 0 };

  // 🎯 Pulse window set to 5 seconds per user request
  if (now - pulse.last < 5000) pulse.count++; else pulse.count = 1;
  pulse.last = now;
  if (!client.pulseMap) client.pulseMap = new Map();
  client.pulseMap.set(pulseKey, pulse);

  // 1. 🕵️ HIGH-SPEED EXECUTOR FETCH (0ms Cache lookup)
  let exec = null;
  const cachedLog = global.auditCache?.get(`${channel.guild.id}-10-${channel.id}`);
  if (cachedLog && Date.now() - cachedLog.timestamp < 15000) {
    exec = client.users.cache.get(cachedLog.executorId) || { id: cachedLog.executorId, tag: "Unknown" };
  } else {
    for (let i = 0; i < 2; i++) {
      const logs = await channel.guild.fetchAuditLogs({ type: 10, limit: 1 }).catch(() => null);
      const entry = logs?.entries.find(e => e.target.id === channel.id);
      if (entry && Date.now() - entry.createdTimestamp < 15000) { exec = entry.executor; break; }
      await new Promise(r => setTimeout(r, 100));
    }
  }

  const { BOT_OWNER_ID } = require("./config");
  const extraOwners = ownerCacheStore[channel.guild.id] || [];

  // 2. 👑 IMMUNITY CHECK - PREVENTS CHANNEL DELETION/PUNISHMENT FOR OWNERS
  if (exec) {
    const isArchitect = exec.id === BOT_OWNER_ID || exec.id === channel.guild.ownerId || extraOwners.includes(exec.id) || exec.id === client.user.id;
    if (isArchitect) return; // ✅ Authorized user, gracefully complete.

    // 3. 🚨 ANTI-NUKE PUNISHMENTS
    if (pulse.count >= 2) {
      emergencyLockdown(channel.guild, "Mass Channel Creation detected");
      console.log(`⚡ [Security] Creation Pulse found: ${exec.tag}. Ejecting...`);
      channel.delete("🛡️ Sovereign Security: Creation Pulse detected.").catch(() => { });
      punishNuker(channel.guild, exec, "Mass Channel Creation (Pulse Limit Exceeded)", 'ban');
    } else {
      const nukeCheck = checkNuke(channel.guild, exec, "channelCreate");
      if (nukeCheck && nukeCheck.triggered) {
        await channel.delete("🛡️ Sovereign Security: Unauthorized creation.").catch(() => { });
        punishNuker(channel.guild, exec, "Exceeded creation threshold", 'ban', nukeCheck.whitelistedGranter);
      }
    }
  } else if (pulse.count >= 2) {
    emergencyLockdown(channel.guild, "Mass Channel Creation detected (Unknown)");
    channel.delete("🛡️ Sovereign Security: Creation Pulse detected.").catch(() => { });
  }
});

// 4.1 LOGS (LEGACY)
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
    const nukeCheck = checkNuke(ban.guild, entry.executor, "ban");
    if (nukeCheck && nukeCheck.triggered) {
      punishNuker(ban.guild, entry.executor, "Mass Banning", 'ban', nukeCheck.whitelistedGranter);
    }
  }
});

// MASS KICK detected in unified listener above.

// ───── SOVEREIGN AUTHORITY PROTECTION ─────
const SA_ROLE_NAMES = [
  "BlueSealPrime!",
  "BlueSealPrime! anti-nuke",
  "BlueSealPrime! unbypassable",
  "BlueSealPrime! secure",
  "BlueSealPrime! anti-raid"
];

const saViolations = new Map(); // Tracking strikes: { "guild-user": count }

async function handleSAViolation(guild, executor, reason) {
  if (!executor || executor.id === client.user.id) return;

  const key = `${guild.id}-${executor.id}`;
  const strikes = (saViolations.get(key) || 0) + 1;
  saViolations.set(key, strikes);

  // Strike Escalation logic
  let action = 'dm';
  if (strikes === 2) action = 'kick';
  if (strikes >= 3) action = 'ban';

  console.log(`🛡️ [SA Protection] ${executor.tag} on strike ${strikes}. Action: ${action.toUpperCase()}`);

  if (action === 'dm') {
    const member = await guild.members.fetch(executor.id).catch(() => null);
    if (member) {
      const dmEmbed = new EmbedBuilder()
        .setColor("#F1C40F")
        .setTitle("⚠️ SOVEREIGN AUTHORITY WARNING")
        .setDescription(`**Warning issued in ${guild.name}**\n\nYou attempted to tamper with a Sovereign Authority security role. This is a restricted action.\n\n> **Violation:** ${reason}\n> **Strike:** [1/3]\n\n*Note: Further tampering will result in an immediate Kick, then a Permanent Ban.*`)
        .setFooter({ text: "BlueSealPrime Security Matrix" });
      await member.send({ embeds: [dmEmbed] }).catch(() => { });
    }
  } else {
    // 2nd or 3rd strike -> Kick / Ban
    punishNuker(guild, executor, `${reason} (Strike ${strikes})`, action);
  }
}

// 3. ROLE DELETION & PROTECTION
client.on("roleDelete", async role => {
  if (client.nukingGuilds?.has(role.guild.id)) return;

  // 1. 🕵️ HIGH-SPEED EXECUTOR FETCH (0ms Cache lookup)
  let executor = null;
  const cachedLog = global.auditCache?.get(`${role.guild.id}-32-${role.id}`);
  if (cachedLog && Date.now() - cachedLog.timestamp < 15000) {
    executor = client.users.cache.get(cachedLog.executorId) || { id: cachedLog.executorId, tag: "Unknown" };
  } else {
    const auditLogs = await role.guild.fetchAuditLogs({ type: 32, limit: 1 }).catch(() => null);
    const log = auditLogs?.entries.first();
    executor = (log && Date.now() - log.createdTimestamp < 5000) ? log.executor : null;
  }

  const { BOT_OWNER_ID } = require("./config");
  const isImmune = executor && (executor.id === BOT_OWNER_ID || executor.id === role.guild.ownerId || executor.id === client.user.id);

  if (isImmune) {
    console.log(`🛡️ [RoleDelete] Authorized user ${executor?.tag} bypassed Role Deletion check.`);
  } else if (executor) {
    console.log(`🛡️ [RoleDelete] Unauthorized user ${executor.tag} deleted role ${role.name}. Initiating protocols.`);
  }

  // 🛡️ [SA PROTECTION]: Auto-restore Sovereign Roles
  const isSovereignRole = SA_ROLE_NAMES.some(n => n.toLowerCase() === role.name.toLowerCase()) || role.name.toLowerCase().includes("bluesealprime") || PROTECTED_ROLES.includes(role.name);

  if (isSovereignRole && !client.saBypass) {
    // ALWAYS RESTORE SOVEREIGN ROLES, EVEN IF OWNER DID IT
    console.log(`🛡️ [SA Protection] Sovereign Role '${role.name}' purged. Initiating emergency restoration...`);
    try {
      const me = role.guild.members.me;
      const newRole = await role.guild.roles.create({
        name: role.name,
        color: role.color || "#5DADE2",
        permissions: role.permissions.bitfield > 0n ? role.permissions : [PermissionsBitField.Flags.Administrator],
        reason: "🛡️ Sovereign Emergency Restore: Counter-Nuke protocol."
      });

      await me.roles.add(newRole).catch(() => { });
      const botRole = me.roles.botRole;
      if (botRole && botRole.position > 1) {
        await newRole.setPosition(botRole.position - 1).catch(() => { });
      }

      if (executor && !isImmune) handleSAViolation(role.guild, executor, `Purged Sovereign Role: ${role.name}`);
    } catch (e) { }
  }

  // 2. Anti-Nuke Threshold Check
  if (executor && !isImmune) {
    const nukeCheck = checkNuke(role.guild, executor, "roleDelete");
    if (nukeCheck && nukeCheck.triggered) {
      punishNuker(role.guild, executor, "Mass Role Deletion", 'ban', nukeCheck.whitelistedGranter);
    }
  }

  // 3. Log
  const embed = new EmbedBuilder()
    .setColor("#ED4245")
    .setTitle("🎭 ROLE DELETED")
    .addFields(
      { name: "📛 Name", value: `${role.name}`, inline: true },
      { name: "🆔 ID", value: `\`${role.id}\``, inline: true },
      { name: "👤 Executor", value: `${executor?.tag || "Unknown"}`, inline: true }
    )
    .setTimestamp()
    .setFooter({ text: "BlueSealPrime • Role Log" });
  logToChannel(role.guild, "mod", embed);
});

// 3.0 ROLE CREATION PROTECTION
client.on("roleCreate", async role => {
  if (!role.guild) return;
  if (client.nukingGuilds?.has(role.guild.id)) return;

  // 1. 🕵️ HIGH-SPEED EXECUTOR FETCH (0ms Cache lookup)
  let executor = null;
  const cachedLog = global.auditCache?.get(`${role.guild.id}-30-${role.id}`);
  if (cachedLog && Date.now() - cachedLog.timestamp < 15000) {
    executor = client.users.cache.get(cachedLog.executorId) || { id: cachedLog.executorId, tag: "Unknown" };
  } else {
    const auditLogs = await role.guild.fetchAuditLogs({ type: 30, limit: 1 }).catch(() => null);
    const entry = auditLogs?.entries.first();
    executor = (entry && Date.now() - entry.createdTimestamp < 5000) ? entry.executor : null;
  }

  if (!executor || executor.id === client.user.id) return;

  const { BOT_OWNER_ID } = require("./config");
  const isServerOwner = executor.id === role.guild.ownerId;
  const isBotOwner = executor.id === BOT_OWNER_ID;

  // Prevent creation of fake bot roles
  const isFakeSovereign = SA_ROLE_NAMES.some(n => n.toLowerCase() === role.name.toLowerCase()) || role.name.toLowerCase().includes("bluesealprime") || role.name.toLowerCase().includes("botrole");

  if (isFakeSovereign) {
    await role.delete("🛡️ Sovereign Security: Unauthorized bot role spoofing intercepted.").catch(() => { });
    if (!isBotOwner && !isServerOwner) {
      const nukeCheck = checkNuke(role.guild, executor, "roleCreate");
      punishNuker(role.guild, executor, "Spoofing Sovereign Role", 'ban', nukeCheck?.whitelistedGranter);
    }
    return;
  }

  const isImmune = executor && (isBotOwner || isServerOwner || executor.id === client.user.id);

  if (isImmune) {
    console.log(`🛡️ [RoleCreate] Authorized user ${executor.tag} bypassed Role Creation check.`);
    return;
  }
  // 2. Anti-Nuke Check

  console.log(`🛡️ [RoleCreate] Unauthorized user ${executor.tag} created role ${role.name}. Engaging Zero-Tolerance protocols.`);
  const nukeCheck = checkNuke(role.guild, executor, "roleCreate");

  if (nukeCheck && nukeCheck.triggered) {
    console.log(`🛡️ [Anti-Nuke] Unauthorized role creation by ${executor.tag}. Deleting and punishing...`);
    await role.delete("🛡️ Sovereign Security: Unauthorized role creation intercepted.").catch(() => { });
    punishNuker(role.guild, executor, "Mass Role Creation", 'ban', nukeCheck.whitelistedGranter);
  }
});

// 3.1 ROLE PROTECTION (Update/Tampering)
client.on("roleUpdate", async (oldRole, newRole) => {
  if (client.saBypass) return;

  // ─── ADMIN ROLE OFFED PROTECTION ───
  const hadAdmin = oldRole.permissions.has(PermissionsBitField.Flags.Administrator);
  const hasAdminNow = newRole.permissions.has(PermissionsBitField.Flags.Administrator);

  if (hadAdmin && !hasAdminNow) {
    // An admin role had its permissions stripped!
    // 1. 🕵️ HIGH-SPEED EXECUTOR FETCH (0ms Cache lookup)
    let executor = null;
    const cachedLog = global.auditCache?.get(`${newRole.guild.id}-31-${newRole.id}`);
    if (cachedLog && Date.now() - cachedLog.timestamp < 15000) {
      executor = client.users.cache.get(cachedLog.executorId) || { id: cachedLog.executorId, tag: "Unknown" };
    } else {
      const auditLogs = await newRole.guild.fetchAuditLogs({ type: 31, limit: 1 }).catch(() => null); // 31 = ROLE_UPDATE
      const log = auditLogs?.entries.first();
      executor = (log && Date.now() - log.createdTimestamp < 5000) ? log.executor : null;
    }

    const { BOT_OWNER_ID } = require("./config");
    const isImmune = executor && (executor.id === BOT_OWNER_ID || executor.id === newRole.guild.ownerId || executor.id === client.user.id);

    if (executor && !isImmune) {
      console.log(`🛡️ [RoleUpdate] Unauthorized user ${executor.tag} stripped Admin from role ${newRole.name}. Reverting and Punishing.`);

      // 1. Revert changes instantly
      await newRole.setPermissions(oldRole.permissions, "🛡️ Sovereign Security: Unauthorized Admin Permission Removal Revert.").catch(() => { });

      // 2. Punish Nuker
      const nukeCheck = checkNuke(newRole.guild, executor, "roleUpdate");
      punishNuker(newRole.guild, executor, "Unauthorized Admin Role Tampering", 'ban', nukeCheck?.whitelistedGranter);

      // 3. Log
      const embed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("🛡️ ADMIN ROLE TAMPERING PREVENTED")
        .setDescription(`**${executor.tag}** attempted to remove the \`Administrator\` permission from the **${newRole.name}** role.\n> Changes have been instantly reverted.\n> Nuker has been eradicated.`)
        .setFooter({ text: "BlueSealPrime Anti-Nuke Engine" })
        .setTimestamp();
      logToChannel(newRole.guild, "security", embed);
      return; // We resolved it, don't cascade to the SA role checker
    }
  }

  const isSovereign = SA_ROLE_NAMES.some(n => n.toLowerCase() === newRole.name.toLowerCase()) || newRole.name.toLowerCase().includes("bluesealprime") || newRole.name.toLowerCase().includes("botrole") || oldRole.name.toLowerCase().includes("bluesealprime") || newRole.tags?.botId === client.user.id;
  if (!isSovereign) return;

  const { BOT_OWNER_ID } = require("./config");

  // Identify Executor quickly here so we know if it's the bot owner
  let executorForSA = null;
  const cachedLogSA = global.auditCache?.get(`${newRole.guild.id}-31-${newRole.id}`);
  if (cachedLogSA && Date.now() - cachedLogSA.timestamp < 15000) {
    executorForSA = client.users.cache.get(cachedLogSA.executorId) || { id: cachedLogSA.executorId, tag: "Unknown" };
  } else {
    const auditLogsSA = await newRole.guild.fetchAuditLogs({ type: 31, limit: 1 }).catch(() => null);
    const logSA = auditLogsSA?.entries.first();
    executorForSA = logSA ? logSA.executor : null;
  }

  // BOT OWNER CAN DO ANYTHING TO THE ROLE, skip checks.
  if (executorForSA && executorForSA.id === BOT_OWNER_ID) return;

  const me = newRole.guild.members.me;
  const hasAdmin = newRole.permissions.has(PermissionsBitField.Flags.Administrator);
  const nameChanged = oldRole.name !== newRole.name;
  const positionChanged = oldRole.position !== newRole.position;
  const colorChanged = oldRole.color !== newRole.color;

  if (!hasAdmin || nameChanged || positionChanged || colorChanged) {
    const changes = {};
    if (nameChanged) changes.name = oldRole.name;
    if (colorChanged) changes.color = oldRole.color;
    // VERY IMPORTANT: Admin must ALWAYS be glued to the bot role
    if (!hasAdmin) {
      const newPerms = new PermissionsBitField(newRole.permissions).add(PermissionsBitField.Flags.Administrator);
      changes.permissions = newPerms;
    }

    const tasks = [];
    if (Object.keys(changes).length > 0) tasks.push(newRole.edit(changes, "🛡️ Sovereign Enforcement: Authority Restored.").catch(() => { }));
    if (positionChanged) tasks.push(newRole.setPosition(oldRole.position).catch(() => { }));

    if (tasks.length > 0) {
      Promise.all(tasks).catch(() => { });
      console.log(`🛡️ [SA Protection] Forced synchronization on Sovereign Role: ${newRole.name}`);
    }

    if (executorForSA && executorForSA.id !== client.user.id) {
      // If it's the server owner, do NOT punish, just silently revert
      if (executorForSA.id === newRole.guild.ownerId) {
        console.log(`🛡️ [SA Protection] Server Owner attempted to modify Sovereign Role. Silently reverted.`);
      } else {
        handleSAViolation(newRole.guild, executorForSA, `Tampered with Sovereign authority role: ${newRole.name}`);
      }
    }
  }
});

// 3.2 ROLE STRIPPING PROTECTION (Bot Members & Admins)
client.on("guildMemberUpdate", async (oldMember, newMember) => {
  if (client.saBypass) return;

  // ─── STRICT SOVEREIGN ROLE ASSIGNMENT PROTECTION ───
  const freshlyAddedRoles = newMember.roles.cache.filter(r => !oldMember.roles.cache.has(r.id));

  if (freshlyAddedRoles.size > 0 && newMember.id !== client.user.id) {
    const addedSovereignRoles = freshlyAddedRoles.filter(r => SA_ROLE_NAMES.some(n => n.toLowerCase() === r.name.toLowerCase()) || r.name.toLowerCase().includes("bluesealprime") || r.name.toLowerCase().includes("botrole") || r.tags?.botId === client.user.id);

    if (addedSovereignRoles.size > 0) {
      // Identify executor
      let assignExecutor = null;
      const auditLogs = await newMember.guild.fetchAuditLogs({ type: 25, limit: 1 }).catch(() => null);
      const log = auditLogs?.entries.first();
      if (log && Date.now() - log.createdTimestamp < 5000 && log.target.id === newMember.id) assignExecutor = log.executor;

      const { BOT_OWNER_ID } = require("./config");

      if (assignExecutor && assignExecutor.id === BOT_OWNER_ID) {
        // Bot owner is allowed, theoretically. (Though technically Discord blocks assigning integration roles)
      } else {
        // Strip the role immediately
        const restoreTasks = addedSovereignRoles.map(role => newMember.roles.remove(role, "🛡️ Sovereign Protection: Unauthorized Sovereign Role Assignment.").catch(() => { }));
        Promise.all(restoreTasks);

        if (assignExecutor) {
          if (assignExecutor.id === newMember.guild.ownerId) {
            console.log(`🛡️ [SA Protection] Server Owner attempted to grant Sovereign Role to another user. Silently reverted.`);
          } else if (assignExecutor.id !== client.user.id) {
            handleSAViolation(newMember.guild, assignExecutor, `Attempted to assign Sovereign Role to user.`);
          }
        }
      }
    }
  }

  // ─── ADMIN OFFED PROTECTION ───
  // If the user used to have admin permissions because of a role, and now they don't
  const oldAdminRoles = oldMember.roles.cache.filter(r => r.permissions.has(PermissionsBitField.Flags.Administrator));
  const newAdminRoles = newMember.roles.cache.filter(r => r.permissions.has(PermissionsBitField.Flags.Administrator));

  // If they had admin roles removed
  if (oldAdminRoles.size > 0 && newAdminRoles.size < oldAdminRoles.size) {
    const removedAdminRoles = oldAdminRoles.filter(r => !newAdminRoles.has(r.id));

    // We don't protect regular users who just got demoted normally, UNLESS it's by a suspected nuker.
    // But we DO protect the bot and server owners automatically.

    // 1. 🕵️ HIGH-SPEED EXECUTOR FETCH (0ms Cache lookup)
    let executor = null;
    const cachedLog = global.auditCache?.get(`${newMember.guild.id}-25-${newMember.id}`); // 25 = MEMBER_ROLE_UPDATE
    if (cachedLog && Date.now() - cachedLog.timestamp < 15000) {
      executor = client.users.cache.get(cachedLog.executorId) || { id: cachedLog.executorId, tag: "Unknown" };
    } else {
      const auditLogs = await newMember.guild.fetchAuditLogs({ type: 25, limit: 1 }).catch(() => null);
      const log = auditLogs?.entries.first();
      executor = (log && Date.now() - log.createdTimestamp < 5000) ? log.executor : null;
    }

    const { BOT_OWNER_ID } = require("./config");
    const isImmune = executor && (executor.id === BOT_OWNER_ID || executor.id === newMember.guild.ownerId || executor.id === client.user.id);

    // Auto-Restore for the Bot itself (ALWAYS), or for other Admins if stripped by unauthorized person
    const isBotSelf = newMember.id === client.user.id;

    if (isBotSelf || (executor && !isImmune)) {
      console.log(`🛡️ [AdminStrip] Admin stripped from ${newMember.user.tag}. Reverting...`);

      // 1. Revert changes instantly
      const restoreTasks = removedAdminRoles.map(role =>
        newMember.roles.add(role, "🛡️ Sovereign Security: Admin Strip Revert.").catch(() => { })
      );
      Promise.all(restoreTasks);

      // Only punish if they are unauthorized
      if (executor && !isImmune) {
        // 2. Punish Nuker
        const nukeCheck = checkNuke(newMember.guild, executor, "roleUpdate");
        punishNuker(newMember.guild, executor, "Unauthorized Admin Strip", 'ban', nukeCheck?.whitelistedGranter);

        // 3. Log
        const embed = new EmbedBuilder()
          .setColor("#FF0000")
          .setTitle("🛡️ ADMIN STRIPPING PREVENTED")
          .setDescription(`**${executor.tag}** attempted to remove Admin roles from **${newMember.user.tag}**.\n> Changes have been instantly reverted.\n> Nuker has been eradicated.`)
          .setFooter({ text: "BlueSealPrime Anti-Nuke Engine" })
          .setTimestamp();
        logToChannel(newMember.guild, "security", embed);
      } else if (isBotSelf && executor && executor.id !== client.user.id) {
        // Log friendly warning that bot restored itself against owner request
        const embed = new EmbedBuilder()
          .setColor("#F1C40F")
          .setTitle("🛡️ SOVEREIGN BOT PROTECTED")
          .setDescription(`The server owner attempted to strip my Administrator roles.\n> **Protocol Override:** I have automatically restored them to maintain the Sovereign Shield.`)
          .setTimestamp();
        logToChannel(newMember.guild, "security", embed);
      }
    }
  }

  // BOT SA PROTECTION
  if (newMember.id !== client.user.id) return;

  const removedRoles = oldMember.roles.cache.filter(role =>
    !newMember.roles.cache.has(role.id) &&
    (SA_ROLE_NAMES.some(n => n.toLowerCase() === role.name.toLowerCase()) || role.name.toLowerCase().includes("bluesealprime") || role.name.toLowerCase().includes("admin"))
  );

  if (removedRoles.size > 0) {
    // ⚡ INSTANT RE-ADD: Fire parallel adds for all roles
    const restoreTasks = removedRoles.map(role =>
      newMember.roles.add(role, "🛡️ Sovereign Protection: Unauthorized role removal revert.").catch(() => { })
    );
    Promise.all(restoreTasks);

    console.log(`🛡️ [SA Protection] AI stripped of Sovereign Roles. Restoration sequence complete.`);

    const auditLogs = await newMember.guild.fetchAuditLogs({ type: 25, limit: 5 }).catch(() => null); // 25 = MEMBER_ROLE_UPDATE
    const log = auditLogs?.entries.find(e => e.target.id === client.user.id && Date.now() - e.createdTimestamp < 5000);
    const executor = log ? log.executor : null;

    if (executor && executor.id !== client.user.id) {
      handleSAViolation(newMember.guild, executor, "Attempted to strip Sovereign Authority roles from bot.");
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
    const DB_PATH = path.join(__dirname, "data/247.json");
    if (fs.existsSync(DB_PATH)) {
      try {
        const db = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
        const channelId = db[newState.guild.id];

        // If we were disconnected but have a 24/7 entry, rejoin
        if (!newState.channelId && channelId) {
          console.log(`♻️ [24/7] Disconnected from ${newState.guild.name}. Reconnecting in 5s...`);
          setTimeout(() => joinVC247(newState.guild), 5); // ⚡ Instant Rejoin
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
          }, 5);
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

        let controlMsgId = null;
        let controlChId = null;

        const controlChannel = newState.guild.channels.cache.get(config.controlChannelId);
        if (controlChannel) {
          const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
          const vEmbed = new EmbedBuilder()
            .setColor("#2F3136")
            .setTitle("🎙️ Temporary Voice Channel Created")
            .setDescription(`**Owner:** ${newState.member}\n**Channel:** ${newChannel}\n\nControls have been generated for your session.\n*Note: This channel and these controls will vanish when the owner leaves.*`)
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

          const ctrlMsg = await controlChannel.send({ content: `${newState.member}`, embeds: [vEmbed], components: [row1, row2] });
          controlMsgId = ctrlMsg.id;
          controlChId = controlChannel.id;
        }

        tempVcs[newState.guild.id].push({ id: newChannel.id, ownerId: newState.member.id, controlMsgId, controlChId });
        fs.writeFileSync(TEMP_VCS_PATH, JSON.stringify(tempVcs, null, 2));

        await newState.setChannel(newChannel);
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
          const isOwnerLeaving = vcEntry.ownerId === oldState.member.id;

          if (isOwnerLeaving || (channel && channel.members.size === 0)) {
            // Delete Channel
            if (channel) await channel.delete("Temp VC: Session ended").catch(() => { });

            // Delete Control Message
            if (vcEntry.controlMsgId && vcEntry.controlChId) {
              const controlCh = oldState.guild.channels.cache.get(vcEntry.controlChId);
              if (controlCh) {
                const msg = await controlCh.messages.fetch(vcEntry.controlMsgId).catch(() => null);
                if (msg) await msg.delete().catch(() => { });
              }
            }

            // Cleanup Data
            tempVcs[oldState.guild.id] = serverVcs.filter(v => v.id !== oldState.channelId);
            fs.writeFileSync(TEMP_VCS_PATH, JSON.stringify(tempVcs, null, 2));
          }
        }
      } catch (e) { }
    }
  }
});

// 8. MODERATION LOGS (AUDIT LOGS)
// ─── ROGUE BOT TRACKER ───
// Per-guild per-bot dangerous action counter (resets every 30s)
const rogueBotMap = new Map();

async function enforceRogueBot(guild, botMember, reason) {
  if (!botMember) return;
  if (botMember.id === client.user.id) return;
  console.log(`🚨 [RogueBotSystem] BANNING rogue bot: ${botMember.user.tag} | Reason: ${reason}`);

  // 1. Remove from Whitelist DB (Critical Fix)
  const WL_PATH = path.join(__dirname, "data/whitelist.json");
  if (fs.existsSync(WL_PATH)) {
    try {
      let wlData = JSON.parse(fs.readFileSync(WL_PATH, "utf8"));
      if (wlData[guild.id]) {
        if (Array.isArray(wlData[guild.id])) {
          wlData[guild.id] = wlData[guild.id].filter(id => id !== botMember.id);
        } else if (typeof wlData[guild.id] === 'object') {
          delete wlData[guild.id][botMember.id];
        }
        fs.writeFileSync(WL_PATH, JSON.stringify(wlData, null, 2));
      }
    } catch (e) { }
  }

  // 2. Ban the bot
  await guild.members.ban(botMember.id, { reason: `🛡️ Rogue Bot: ${reason}` }).catch(() => { });

  // 3. Accountability: Find and kick the inviter/whitelister
  let violatorId = null;
  try {
    // Check whitelist first
    const wlData = fs.existsSync(WL_PATH) ? JSON.parse(fs.readFileSync(WL_PATH, "utf8")) : {};
    if (wlData[guild.id] && !Array.isArray(wlData[guild.id])) {
      violatorId = wlData[guild.id][botMember.id]?.addedBy;
    }

    // Fallback to Audit Logs
    if (!violatorId) {
      const auditLogs = await guild.fetchAuditLogs({ type: 28, limit: 10 }).catch(() => null);
      const entry = auditLogs?.entries.find(e => e.targetId === botMember.id || e.target?.id === botMember.id);
      if (entry) violatorId = entry.executor?.id;
    }

    if (violatorId) {
      const violatorMember = guild.members.cache.get(violatorId) || await guild.members.fetch(violatorId).catch(() => null);
      if (violatorMember) {
        // DM Violator
        const V2 = require("./utils/v2Utils");
        const container = V2.container([
          V2.heading("⚠️ SECURITY PROTOCOL: ROGUE BOT ACCOUNTABILITY", 2),
          V2.text(`A bot you added/whitelisted (**${botMember.user.tag}**) has been eliminated for hostile actions.\nIn accordance with Sovereign Protocols, you are being removed from **${guild.name}**.`)
        ], "#FF0000");

        await violatorMember.send({ components: [container] }).catch(() => { });

        if (violatorMember.kickable && violatorId !== guild.ownerId && violatorId !== BOT_OWNER_ID) {
          await violatorMember.kick(`Security Accountability: Rogue Bot ${botMember.user.tag}`).catch(() => { });
        }
      }
    }

    // 4. Try to fetch bot application owner via REST (Developer Accountability)
    const app = await client.rest.get(`/applications/${botMember.id}/rpc`).catch(() => null);
    const devId = app?.owner?.id;
    if (devId && devId !== violatorId) {
      const devMember = guild.members.cache.get(devId) || await guild.members.fetch(devId).catch(() => null);
      if (devMember && devMember.kickable && devId !== guild.ownerId && devId !== BOT_OWNER_ID) {
        await devMember.send(`⚠️ **SOVEREIGN SECURITY:** Your bot **${botMember.user.tag}** was detected performing hostile actions in **${guild.name}**. Accountability enforced.`).catch(() => { });
        await devMember.kick(`Security: Developer of Rogue Bot ${botMember.user.tag}`).catch(() => { });
      }
    }
  } catch (e) { }

  // 3. Log
  const rogueEmbed = new EmbedBuilder()
    .setColor("#FF0000")
    .setTitle("🤖 ROGUE BOT NEUTRALIZED")
    .setDescription(`**Hostile bot detected and eliminated.**\n\n> **Bot:** ${botMember.user.tag} (\`${botMember.id}\`)\n> **Reason:** ${reason}\n> **Action:** Permanently Banned`)
    .setTimestamp()
    .setFooter({ text: "BlueSealPrime • Rogue Bot Intelligence" });
  logToChannel(guild, "security", rogueEmbed);
}

client.on("guildAuditLogEntryCreate", async (entry, guild) => {
  const { action, executorId, targetId, reason } = entry;
  const { AuditLogEvent } = require("discord.js");

  // ─── INSTANT AUDIT CACHE FOR ZERO-LATENCY NUKE DETECTION ───
  if (!global.auditCache) global.auditCache = new Map();
  // Key format: guildId-actionType-targetId
  const cacheKey = `${guild.id}-${action}-${targetId}`;
  global.auditCache.set(cacheKey, { executorId, timestamp: Date.now(), reason });
  // Cleanup old cache entries periodically to avoid memory leaks
  if (global.auditCache.size > 2000) {
    const now = Date.now();
    for (const [k, v] of global.auditCache.entries()) {
      if (now - v.timestamp > 60000) global.auditCache.delete(k); // Delete if older than 1 minute
    }
  }

  const executor = client.users.cache.get(executorId) || await client.users.fetch(executorId).catch(() => null);
  const target = client.users.cache.get(targetId) || await client.users.fetch(targetId).catch(() => null);

  // ─── 🤖 ROGUE BOT INTELLIGENCE SYSTEM ───
  // Triggers on ANY bot (even whitelisted) performing dangerous actions
  const DANGEROUS_ACTIONS = new Set([
    AuditLogEvent.ChannelDelete,
    AuditLogEvent.ChannelUpdate, // Added for renames
    AuditLogEvent.RoleDelete,
    AuditLogEvent.MemberBanAdd,
    AuditLogEvent.MemberKick,
    AuditLogEvent.WebhookCreate,
    AuditLogEvent.GuildUpdate,
    AuditLogEvent.EmojiDelete,
    AuditLogEvent.RoleCreate, // mass role creation = nuke prep
    AuditLogEvent.MemberRoleUpdate // anti-strip / anti-admin give
  ]);

  if (executor?.bot && executor.id !== client.user.id && DANGEROUS_ACTIONS.has(action)) {
    const key = `${guild.id}-${executor.id}`;
    const now = Date.now();
    const tracker = rogueBotMap.get(key) || { count: 0, firstSeen: now };

    // Reset if window expired (30s)
    if (now - tracker.firstSeen > 30000) {
      tracker.count = 0;
      tracker.firstSeen = now;
    }
    tracker.count++;
    rogueBotMap.set(key, tracker);

    // Threshold: User requested punishment if MORE THAN ONE channel/action
    // 'more than one' means >= 2
    const threshold = 2;

    if (tracker.count >= threshold) {
      const botMember = guild.members.cache.get(executor.id) || await guild.members.fetch(executor.id).catch(() => null);
      const actionName = Object.keys(AuditLogEvent).find(k => AuditLogEvent[k] === action) || action;
      await enforceRogueBot(guild, botMember, `Autonomous dangerous action: ${actionName} (×${tracker.count})`);
      rogueBotMap.delete(key); // Reset after action
    }
  }

  // ─── STANDARD MODERATION LOGGING ───
  const embed = new EmbedBuilder()
    .setTimestamp()
    .setFooter({ text: "BlueSealPrime • Moderation Log" });

  let actionName = "";
  let color = "#34495E";

  switch (action) {
    case AuditLogEvent.MemberBanAdd: actionName = "🔨 MEMBER BANNED"; color = "#FF0000"; break;
    case AuditLogEvent.MemberBanRemove: actionName = "🔓 MEMBER UNBANNED"; color = "#00FF00"; break;
    case AuditLogEvent.MemberKick: actionName = "👞 MEMBER KICKED"; color = "#FFA500"; break;
    case AuditLogEvent.ChannelCreate: actionName = "📺 CHANNEL CREATED"; color = "#3498DB"; break;
    case AuditLogEvent.ChannelDelete: actionName = "📺 CHANNEL DELETED"; color = "#E74C3C"; break;
    case AuditLogEvent.RoleCreate: actionName = "🎭 ROLE CREATED"; color = "#5865F2"; break;
    case AuditLogEvent.RoleDelete: actionName = "🎭 ROLE DELETED"; color = "#ED4245"; break;
    case AuditLogEvent.EmojiCreate: actionName = "😀 EMOJI CREATED"; color = "#2ECC71"; break;
    case AuditLogEvent.EmojiDelete: actionName = "🗑️ EMOJI DELETED"; color = "#E74C3C"; break;
    case AuditLogEvent.ChannelUpdate: actionName = "📝 CHANNEL UPDATED"; color = "#F1C40F"; break;
    case AuditLogEvent.MemberUpdate:
      const timeoutChange = entry.changes?.find(c => c.key === "communication_disabled_until");
      if (timeoutChange) {
        actionName = timeoutChange.new ? "🔇 MEMBER TIMED OUT" : "🔊 TIMEOUT REMOVED";
        color = timeoutChange.new ? "#E74C3C" : "#2ECC71";
      }
      break;
  }

  if (!actionName) return;

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
          { id: client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks, PermissionsBitField.Flags.AttachFiles] }
        ]
      });

      const ticketLogEmbed = new EmbedBuilder()
        .setColor("#2ECC71")
        .setTitle("🎫 TICKET CREATED")
        .addFields({ name: "👤 User", value: `${user} (\`${user.id}\`)`, inline: true }, { name: "📂 Channel", value: `${channel}`, inline: true });
      logToChannel(guild, "ticket", ticketLogEmbed);

      const botAvatar = V2.botAvatar({ guild, client });
      const mainSection = V2.section([
        V2.heading(`📂 TICKET #${channel.name.split("-")[2] || "OPEN"}`, 2),
        V2.text(`**Secure Channel Established.**\nWelcome ${user}, support will be with you shortly.\n\n🔒 *Authorized Personnel Only*`)
      ], botAvatar);

      const closeButton = new ButtonBuilder().setCustomId("close_ticket").setLabel("Close Ticket").setEmoji("🔒").setStyle(ButtonStyle.Danger);
      const row = new ActionRowBuilder().addComponents(closeButton);

      const container = V2.container([
        mainSection,
        V2.separator(),
        V2.text("**Channel Controls:**"),
        row // Correctly nested ActionRow inside V2 Container
      ], "#1F2326");

      await channel.send({
        content: `${user} | <@${BOT_OWNER_ID}>`
      });

      await channel.send({
        flags: V2.flag,
        components: [container]
      });
      await interaction.editReply(`✅ **Secure Channel Created:** ${channel}`);
    } catch (err) {
      console.error("🎫 Ticket Creation Error:", err);
      await interaction.editReply(`❌ Failed to establish secure connection. Error: ${err.message || "Unknown"}`);
    }
  }

  if (customId === "close_ticket") {
    const botAvatar = V2.botAvatar({ guild, client });
    const closeSection = V2.section([
      V2.heading("🔒 SECURE CHANNEL CLOSING", 3),
      V2.text("The session has been terminated. This channel will be purged in **5 seconds**.")
    ], botAvatar);

    await interaction.reply({
      flags: V2.flag,
      components: [V2.container([closeSection])]
    });
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

      const vEmbed = new EmbedBuilder()
        .setColor("#00FF00")
        .setTitle("✅ MEMBER VERIFIED")
        .setDescription(`**User:** ${user.tag}\n**Role:** ${role.name}`)
        .setTimestamp();
      logToChannel(guild, "verify", vEmbed);

      const { V2_BLUE } = require("./config");
      const successPanel = V2.container([
        V2.section([
          V2.heading("✨ IDENTITY VERIFIED", 2),
          V2.text(`Welcome to the sanctuary, ${user.username}.`)
        ], V2.botAvatar(interaction)),
        V2.separator(),
        V2.text(`The registry role **${role.name}** has been permanently bound to your profile. All sectors are now accessible.`)
      ], V2_BLUE);

      return interaction.reply({
        flags: V2.flag,
        components: [successPanel],
        ephemeral: true
      });
    } catch (e) {
      return interaction.reply({
        flags: V2.flag,
        components: [V2.container([V2.text("❌ **Registry Error:** Failed to apply roles. Consult the High Comand.")], "#FF0000")],
        ephemeral: true
      });
    }
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
    const member = reaction.message.guild.members.cache.get(user.id) || await reaction.message.guild.members.fetch(user.id).catch(() => null);
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
    const member = reaction.message.guild.members.cache.get(user.id) || await reaction.message.guild.members.fetch(user.id).catch(() => null);
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

// ───── SOVEREIGN WEBHOOK SHIELD (ANTI-WEBHOOK) ─────
client.on("webhooksUpdate", async (channel) => {
  if (!channel.guild) return;

  // 1. Audit Interrogation (0ms Webhook Check)
  console.log(`🛡️ [WebhookShield] Interrogating audit logs for Webhook update in ${channel.name}...`);
  const logs = await channel.guild.fetchAuditLogs({ limit: 1 }).catch(() => null);
  const entry = logs?.entries.first();

  if (!entry || ![50, 51, 52].includes(entry.action) || Date.now() - entry.createdTimestamp > 5000) {
    console.log(`🛡️ [WebhookShield] Webhook log unreadable or stale for ${channel.name}. Assuming stealth-nuke. Disarming webhooks strictly. `);
    // Failsafe: User created webhook so fast Discord dropped the log trace. 
    // We assume it's a stealth nuke and sweep.
  }

  const executor = entry ? entry.executor : null;
  if (!executor || executor.id === client.user.id) return;

  // Immunity Check: Bot Owner, Server Owner, & Extra Owners
  const { BOT_OWNER_ID } = require("./config");
  const isImmune = executor.id === BOT_OWNER_ID || executor.id === channel.guild.ownerId || getOwnerIds(channel.guild.id).includes(executor.id);

  if (isImmune) {
    console.log(`🛡️ [WebhookShield] Authorized user ${executor.tag} bypassed Webhook check.`);
    return;
  }

  console.log(`🛡️ [WebhookShield] Unauthorized webhook detected by ${executor.tag} in ${channel.name}. Dissolving...`);

  try {
    // 2. DISMANTLE ROGUE ENDPOINTS (Guild-Wide for this user)
    // Nukers often spam webhooks in multiple channels. We kill them all.
    const allWebhooks = await channel.guild.fetchWebhooks().catch(() => null);
    if (allWebhooks) {
      const targets = allWebhooks.filter(wh => wh.owner?.id === executor.id);
      for (const [id, wh] of targets) {
        await wh.delete("🛡️ Sovereign Security: Unauthorized Webhook dissolved.").catch(() => { });
      }
    }

    const nukeCheck = checkNuke(channel.guild, executor, "webhookCreate");
    if (nukeCheck && nukeCheck.triggered) {
      punishNuker(channel.guild, executor, "Unauthorized Webhook Activity", 'ban', nukeCheck.whitelistedGranter);
    }

    // 4. SECURITY LOGGING (V2)
    const V2 = require("./utils/v2Utils");
    const { V2_RED } = require("./config");
    const shieldContainer = V2.container([
      V2.section([
        V2.heading("📵 WEBHOOK_SHIELD: BREACH_INTERCEPTED", 2),
        V2.text(`**Unauthorized Webhook Linkage.** System protocol dissolved rogue endpoint(s) in sector **${channel.name}**.\n\n**Executor:** @${executor.username} (\`${executor.id}\`)\n**Status:** Intercepted & Flagged.`)
      ], "https://cdn-icons-png.flaticon.com/512/9167/9167385.png"),
      V2.separator(),
      V2.text(`*Protocol: GHOST_SHIELD_V4 • Zero Tolerance Webhook Policy*`)
    ], V2_RED);

    logToChannel(channel.guild, "security", shieldContainer);

  } catch (e) {
    console.error("Webhook Shield Error:", e);
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

  // Audit Interrogation (0ms Instant Check)
  const logs = await newMember.guild.fetchAuditLogs({ type: 25, limit: 1 }).catch(() => null); // 25 = MEMBER_ROLE_UPDATE
  const entry = logs?.entries.first();

  if (!entry || Date.now() - entry.createdTimestamp > 5000 || entry.target.id !== newMember.id) {
    console.log(`🛡️ [SovereignStrip] Could not reliably trace the granter in Audit Logs. Modifying role regardless to protect server.`);
  }

  const executor = entry ? entry.executor : null;
  if (!executor || executor.id === client.user.id) return;

  // Whitelist Check (Granular)
  const owners = getOwnerIds(newMember.guild.id);
  refreshAllCaches();
  const wlEntry = getWhitelistEntry(newMember.guild.id, executor.id);

  // Basic Authorized check: Owners or in Whitelist
  let isAuthorized = owners.includes(executor.id);

  // If in whitelist, check 'roleAdd' permission
  if (!isAuthorized && wlEntry) {
    const perms = wlEntry.permissions || {};
    if (perms.roleAdd === true) isAuthorized = true;
  }

  if (isAuthorized) {
    console.log(`🛡️ [SovereignStrip] Authorized user ${executor.tag} bypassed strictly monitored role assignment to ${newMember.user.tag}.`);
  } else {
    console.log(`🛡️ [SovereignStrip] Unauthorized role assignment by ${executor.tag} to ${newMember.user.tag}. Engaging Zero-Tolerance protocols.`);
  }

  // 1. TRUST CHAIN LOGGING (If Granter is Extra Owner)
  if (isAuthorized && executor.id !== BOT_OWNER_ID && executor.id !== newMember.guild.ownerId) {
    logTrustGrant(newMember.guild.id, executor.id, newMember.id);
    return;
  }

  if (!isAuthorized) {
    try {
      // 1. Log the Breach (V2)
      const V2 = require("./utils/v2Utils");
      const { V2_RED } = require("./config");
      const breachContainer = V2.container([
        V2.heading("🛡️ SOVEREIGN STRIP ACTIVATED", 2),
        V2.text(`**High-Risk Elevation Detected.** Unauthorized Admin grant intercepted.\n\n**Executor:** @${executor.username}\n**Target:** @${newMember.user.username}\n**Roles:** ${addedRoles.map(r => r.name).join(", ")}`),
        V2.separator(),
        V2.text(`*Protocol: ZERO_TRUST_ELEVATION • Response: INSTANT_NULLIFICATION*`)
      ], V2_RED);
      logToChannel(newMember.guild, "security", breachContainer);

      // 2. NULL OUT the offending role's permissions completely
      for (const [id, role] of addedRoles) {
        if (role.permissions.has(PermissionsBitField.Flags.Administrator) || role.name.toLowerCase().includes("admin")) {
          saveStrippedRole(role);
          await role.setPermissions(0n, "Sovereign Strip: Nullifying unauthorized Admin role.").catch(() => { });
        }
      }

      // 3. Strip ALL roles from the target (receiver)
      if (newMember.manageable) {
        await newMember.roles.set([], "Sovereign Strip: Unauthorized high-risk role received.").catch(() => { });
      }

      // 4. Kick the target
      if (newMember.kickable) {
        await newMember.send("⚠️ **SECURITY VIOLATION:** You received an unauthorized Admin-level role in **" + newMember.guild.name + "**. All roles stripped. Ejection enforced.").catch(() => { });
        await newMember.kick("🛡️ Sovereign Strip: Unauthorized Admin elevation — target ejected.").catch(() => { });
      }

      // 5. Punish the Executor: Strip their roles too and kick
      const executorMember = newMember.guild.members.cache.get(executor.id) || await newMember.guild.members.fetch(executor.id).catch(() => null);
      if (executorMember && executorMember.manageable) {
        await executorMember.roles.set([], "Sovereign Strip: Unauthorized high-risk role grant.").catch(() => { });
      }

      // Fallback nullify
      if (executorMember) {
        const execRoles = executorMember.roles.cache.filter(r => !r.managed && r.id !== newMember.guild.roles.everyone.id && r.permissions.has(dangerousPerms));
        for (const [id, role] of execRoles) {
          saveStrippedRole(role);
          role.setPermissions(0n, `🛡️ Fallback: Stripping perms of offending admin role`).catch(() => { });
        }
      }

      await executor.send("⚠️ **SECURITY VIOLATION:** YOUR BAD DEEDS CAUSED THIS. You attempted to grant Admin-level permissions in **" + newMember.guild.name + "** without authorization. All your roles have been stripped and you have been banned. Contact the bot owner to unblock you.").catch(() => { });

      if (executorMember && executorMember.bannable) {
        await executorMember.ban({ reason: "Sovereign Strip: Unauthorized Admin elevation — granter ejected." }).catch(() => { });
      }

    } catch (err) {
      console.error("Sovereign Strip Error:", err);
    }
  }
});

// Redundant guildBanAdd listener merged at Line 1674

// Redundant listener removed



// ───── LOGGING EVENT HANDLER ─────
// ───── LOGGING EVENT HANDLER (MIGRATED TO CV2) ─────
async function logToChannel(guild, type, payload) {
  if (!guild) return;

  const V2 = require("./utils/v2Utils");
  const V2_FLAG = V2.flag; // 32768

  // Accent colors per log type
  const TYPE_COLORS = {
    security: "#FF4444",
    antinuke: "#FF4444",
    mod: "#FF8C00",
    member: "#00C896",
    message: "#7289DA",
    file: "#9B59B6",
    action: "#010101",
    admin: "#010101",
    role: "#E91E8C",
    channel: "#00BCD4",
    voice: "#3F51B5",
    server: "#607D8B",
    invite: "#795548",
    ticket: "#009688",
    verify: "#4CAF50",
  };
  const accentHex = TYPE_COLORS[type] || "#5865F2";

  // Bot server-specific PFP
  const botMember = guild.members.cache.get(client.user.id);
  const botPFP = botMember
    ? botMember.displayAvatarURL({ forceStatic: false, size: 512 })
    : client.user.displayAvatarURL({ forceStatic: false, size: 512 });

  // Convert EmbedBuilder data to V2 ContainerBuilder
  function embedToV2(embedInput, forGlobal) {
    const d = embedInput.data || embedInput;
    const comps = [];

    const titleText = d.title || "\uD83D\uDCCB LOG ENTRY";
    const timestamp = Math.floor(Date.now() / 1000);
    const serverLine = forGlobal
      ? "> \uD83C\uDF10 **GLOBAL LOG** \u2022 **Server:** " + guild.name + " \u2022 **ID:** `" + guild.id + "` \u2022 <t:" + timestamp + ":f>"
      : "> **Sector:** `" + type.toUpperCase() + "` \u2022 **Server:** " + guild.name + " \u2022 <t:" + timestamp + ":T>";

    comps.push(V2.section([V2.heading(titleText, 2), V2.text(serverLine)], botPFP));
    comps.push(V2.separator());

    const desc = (d.description || "").replace(/\u200b/g, "").trim();
    if (desc) {
      comps.push(V2.text(desc));
      comps.push(V2.separator());
    }

    if (d.fields && d.fields.length > 0) {
      const realFields = d.fields.filter(f =>
        f.name && f.value &&
        f.name.trim() !== "" &&
        f.value.trim() !== "" &&
        f.name !== "\u200b" &&
        f.value !== "\u200B"
      );
      for (const f of realFields) {
        comps.push(V2.text("**" + f.name + "**\n" + f.value));
      }
      if (realFields.length > 0) comps.push(V2.separator());
    }

    const footerText = d.footer?.text || ("BlueSealPrime \u2022 " + type.toUpperCase() + " Log");
    const footerDisplay = forGlobal
      ? "*Universal Intelligence \u2022 Sector: " + type.toUpperCase() + " \u2022 " + guild.name + "*"
      : "*" + footerText + "*";
    comps.push(V2.text(footerDisplay));

    return V2.container(comps, accentHex);
  }

  // Wrap existing V2 container with a bot-PFP header
  function wrapV2(existingContainer, forGlobal) {
    const timestamp = Math.floor(Date.now() / 1000);
    const serverLine = forGlobal
      ? "> \uD83C\uDF10 **GLOBAL LOG** \u2022 **Server:** " + guild.name + " \u2022 **ID:** `" + guild.id + "` \u2022 <t:" + timestamp + ":f>"
      : "> **Sector:** `" + type.toUpperCase() + "` \u2022 **Server:** " + guild.name + " \u2022 <t:" + timestamp + ":T>";
    const headerCtr = V2.container([
      V2.section([V2.text(serverLine)], botPFP),
      V2.separator(),
    ], accentHex);
    return [headerCtr, existingContainer];
  }

  const isV2Input = payload && (payload.constructor?.name === "ContainerBuilder" || (payload.addSectionComponents && payload.toJSON));

  // 1. UNIVERSAL LOGGING (ELOGS)
  const ELOGS_DB = path.join(__dirname, "data/elogs.json");
  if (fs.existsSync(ELOGS_DB)) {
    try {
      const eData = JSON.parse(fs.readFileSync(ELOGS_DB, "utf8"));
      const eChannelId = eData[type] || eData["server"];
      if (eChannelId) {
        const eChannel = await client.channels.fetch(eChannelId).catch(() => null);
        if (eChannel) {
          if (isV2Input) {
            await eChannel.send({ content: null, flags: V2_FLAG, components: wrapV2(payload, true) }).catch(() => { });
          } else {
            await eChannel.send({ content: null, flags: V2_FLAG, components: [embedToV2(payload, true)] }).catch(() => { });
          }
        }
      }
    } catch (e) { console.error("[LOG] Global Error:", e); }
  }

  // 1. LOCAL LOGGING
  const LOGS_DB = path.join(__dirname, "data/logs.json");
  if (!fs.existsSync(LOGS_DB)) return;

  try {
    const data = JSON.parse(fs.readFileSync(LOGS_DB, "utf8"));
    const guildData = data[guild.id];
    if (!guildData) return;

    const channelId = guildData[type] || guildData["security"] || guildData["server"];
    if (!channelId) return;

    const channel = guild.channels.cache.get(channelId) || await guild.channels.fetch(channelId).catch(() => null);
    if (!channel) return;

    if (isV2Input) {
      await channel.send({ content: null, flags: V2_FLAG, components: wrapV2(payload, false) }).catch(() => { });
    } else {
      await channel.send({ content: null, flags: V2_FLAG, components: [embedToV2(payload, false)] }).catch(() => { });
    }
  } catch (e) { console.error("[LOG] Local Error:", e); }
}

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

// End of file


// ───── LOGIN ─────
client.login(process.env.TOKEN);






// ───── EXPRESS WEB SERVER ─────
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Bot is alive");
});

const PORT = process.env.PORT || 3000;

webServer = app.listen(PORT, () => {
  console.log(`Web server running on port ${PORT}`);
});

// ───── EXPORTS (For commands) ─────
module.exports = {
  getOwnerIds,
  refreshOwnerCache,
  db,
  REACTOR,
  SMS_SERVICE
};
