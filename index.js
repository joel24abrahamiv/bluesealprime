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

const { joinVoiceChannel, VoiceConnectionStatus, entersState } = require("@discordjs/voice");

// ───── 24/7 VC FUNCTION ─────
async function joinVC247(guild) {
  try {
    const channel = guild.channels.cache.find(c => c.type === 2 && c.joinable); // type 2 is GuildVoice
    if (!channel) return;

    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
      selfDeaf: false,
      selfMute: false
    });

    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        await Promise.race([
          entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
          entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
        ]);
        // Reconnected!
      } catch (error) {
        connection.destroy();
        setTimeout(() => joinVC247(guild), 5000); // Retry after 5s
      }
    });

    console.log(`📡 Joined voice channel: ${channel.name} in ${guild.name}`);
  } catch (err) {
    console.error(`❌ Error joining VC in ${guild.name}:`, err);
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

client.once("ready", () => {
  console.log(`✅ ${client.user.tag} online and fully controlled`);

  // Update Dashboard on Boot (Commanded off by USER)
  // updateDashboard(client);

  client.user.setActivity("Security Systems | !help", { type: 3 });

  // ───── 24/7 VC INITIAL JOIN ─────
  client.guilds.cache.forEach(guild => joinVC247(guild));

  // ───── INIT COMMANDS ─────
  client.commands.forEach(cmd => { if (typeof cmd.init === "function") cmd.init(client); });
});

client.on("guildCreate", (guild) => updateDashboard(client));
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

  // Diagnostics: Log received messages to console (optional debugging)
  // console.log(`[MSG] ${message.author.tag}: ${content}`);

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
  // ───── AUTO-MOD SYSTEM ─────
  const AUTOMOD_DB = path.join(__dirname, "data/automod.json");

  // Helper to handle violations
  async function handleViolation(message, reason) {
    message.delete().catch(() => { });
    const warnEmbed = new EmbedBuilder()
      .setColor("#FFD700")
      .setTitle("⚠️ AUTO-MOD VIOLATION")
      .setDescription(`**Member:** ${message.author}\n**Reason:** ${reason}`)
      .setFooter({ text: "BlueSealPrime • Automatic Enforcement" });

    const warnMsg = await message.channel.send({ content: `${message.author}`, embeds: [warnEmbed] });
    setTimeout(() => warnMsg.delete().catch(() => { }), 5000); // Cleanup alert after 5s

    // Log the event
    const logEmbed = new EmbedBuilder()
      .setColor("#FF0000")
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


  // Fetch Automod settings
  if (fs.existsSync(AUTOMOD_DB)) {
    let amData = {};
    try { amData = JSON.parse(fs.readFileSync(AUTOMOD_DB, "utf8")); } catch (e) { }
    const settings = amData[message.guild.id];

    if (settings && !isBotOwner) {
      // ───── STICKY MESSAGE SYSTEM ─────
      // (Check if channel has sticky message)
      const STICKY_DB = path.join(__dirname, "data/sticky.json");
      if (fs.existsSync(STICKY_DB) && !message.author.bot) { // Ignor bots to prevent loops
        try {
          const stickyData = JSON.parse(fs.readFileSync(STICKY_DB, "utf8"));
          const config = stickyData[message.channel.id];

          if (config) {
            // 1. Delete old message if exists
            if (config.lastId) {
              await message.channel.messages.delete(config.lastId).catch(() => { });
            }

            // 2. Send new message
            const embed = new EmbedBuilder()
              .setColor("#FFFF00") // Yellow
              .setTitle("📌 STICKY MESSAGE")
              .setDescription(config.content)
              .setFooter({ text: "Please read above." });

            const sent = await message.channel.send({ embeds: [embed] });

            // 3. Update DB
            config.lastId = sent.id;
            stickyData[message.channel.id] = config;
            fs.writeFileSync(STICKY_DB, JSON.stringify(stickyData, null, 2));
          }
        } catch (e) {
          console.error("Sticky Error:", e);
        }
      }

      // 1. Link Protection
      if (settings.antiLinks) {
        const linkRegex = /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/.+[a-z]/ig;
        if (linkRegex.test(content) && !isServerOwner) {
          return handleViolation(message, "Unauthorized Invitations/Links");
        }
      }

      // 2. Anti-Spam
      if (settings.antiSpam && !isServerOwner) {
        const userId = message.author.id;
        const now = Date.now();
        const userData = spamMap.get(userId) || { count: 0, lastMsg: now };

        if (now - userData.lastMsg < 2000) { // If message sent within 2 seconds
          userData.count++;
        } else {
          userData.count = 1;
        }
        userData.lastMsg = now;
        spamMap.set(userId, userData);

        if (userData.count > 5) { // 5 messages in ~10 seconds
          spamMap.delete(userId); // Reset
          return handleViolation(message, "Message Spamming");
        }
      }

      // 3. Bad Words / Profanity (Auto-Quarantine)
      const BAD_WORDS = [
        "nigger", "faggot", "chink", "kike", "dyke", "tranny", // Slurs
        "potta", "thevidiya", "dvd", "ommala", "kuthi", "koothi", "otha", "pool", "poolu", "oka", "okara", "oka poren", "thevidiyaaaa", "thevidiyaa", "thevidiyaaa", "Potta" // Regional/User-added
      ];

      const foundBadWord = BAD_WORDS.find(word => content.toLowerCase().includes(word));

      if (foundBadWord && !isServerOwner) {
        message.delete().catch(() => { });
        // Quarantine
        const qrCmd = require("./commands/qr.js");
        await qrCmd.quarantineMember(message.guild, message.member, `Auto-Mod: Profanity Detected (${foundBadWord})`, client.user);

        const embed = new EmbedBuilder()
          .setColor("DarkRed")
          .setTitle("☣️ AUTOMATED QUARANTINE")
          .setDescription(`${message.author} has been sent to isolation for using prohibited language.`)
          .setFooter({ text: "BlueSealPrime • Zero Tolerance Policy" });

        return message.channel.send({ embeds: [embed] }).then(m => setTimeout(() => m.delete().catch(() => { }), 10000));
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
    const WHITELIST_PATH = path.join(__dirname, "data/whitelist.json");
    let whitelist = {};
    if (fs.existsSync(WHITELIST_PATH)) {
      try { whitelist = JSON.parse(fs.readFileSync(WHITELIST_PATH, "utf8")); } catch (e) { }
    }

    const guildWhitelist = whitelist[message.guild.id] || [];
    const isWhitelisted = guildWhitelist.includes(message.author.id) || isBotOwner || message.guild.ownerId === message.author.id;

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
      await command.execute(message, args);
    } catch (err) {
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
    await command.execute(message, args);
  } catch (err) {
    console.error(err);
    message.reply("❌ An error occurred.");
  }
});

// ───── COMPACT MEMBER JOIN HANDLER (LOGS + WELCOME) ─────
// ───── COMPACT MEMBER JOIN HANDLER (LOGS + WELCOME + SECURITY) ─────
client.on("guildMemberAdd", async member => {
  const fs = require("fs");
  const path = require("path");
  const { BOT_OWNER_ID } = require("./config");
  const welcomeCmd = require("./commands/welcome.js");

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
      const altEmbed = new EmbedBuilder().setColor("Red").setTitle("🚫 ANTI-ALT KICK").setDescription(`${member.user.tag} was kicked.\n**Account Age:** ${(Date.now() - member.user.createdTimestamp) / (1000 * 60 * 60 * 24)} days.`);
      logToChannel(member.guild, "security", altEmbed);
      return;
    } catch (e) { }
  }

  // 3. ANTI-RAID DETECTION
  const ANTIRAID_PATH = path.join(__dirname, "data/antiraid.json");
  if (fs.existsSync(ANTIRAID_PATH)) {
    try {
      const antiRaidData = JSON.parse(fs.readFileSync(ANTIRAID_PATH, "utf8"));
      const config = antiRaidData[member.guild.id];
      if (config && config.enabled) {
        if (!global.raidTracker) global.raidTracker = new Map();
        const guildId = member.guild.id;
        const now = Date.now();
        const joins = global.raidTracker.get(guildId) || [];
        joins.push(now);
        const timeWindow = config.timeWindow * 1000;
        const recentJoins = joins.filter(timestamp => now - timestamp < timeWindow);
        global.raidTracker.set(guildId, recentJoins);

        if (recentJoins.length >= config.threshold) {
          const channels = member.guild.channels.cache.filter(c => c.type === 0);
          let locked = 0;
          for (const [id, channel] of channels) {
            try {
              await channel.permissionOverwrites.edit(member.guild.roles.everyone, { SendMessages: false }, { reason: "🚨 Anti-Raid Lockdown" });
              locked++;
            } catch (err) { }
          }
          const alertEmbed = new EmbedBuilder().setColor("#FF0000").setTitle("🚨 RAID DETECTED - LOCKDOWN ACTIVE").setDescription(`Mass join detected: ${recentJoins.length} members in ${config.timeWindow} seconds\n> 🔒 Locked **${locked}** channels`).setFooter({ text: "BlueSealPrime Anti-Raid" }).setTimestamp();
          logToChannel(member.guild, "mod", alertEmbed);
          global.raidTracker.delete(guildId);
        }
      }
    } catch (e) { }
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
          .setColor("#2B2D31")
          .setTitle("👑 💎 A Royal Proclamation 💎 👑")
          .setDescription(`By decree of the crown, let it be known that ${member} has entered the sovereign dominion of ***${member.guild.name.toUpperCase()}*** ✧.\n\nWithin these opulent halls lies a kingdom forged by prestige and excellence. Your presence is honored.\n\n✨ *May your legacy shine as eternal as sapphire.*`)
          .setFooter({ text: `BlueSealPrime • Royal Protocol`, iconURL: member.client.user.displayAvatarURL() })
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
});


// ───── VOICE DEFENSE (VDEFEND) SYSTEM ─────
client.on("voiceStateUpdate", async (oldState, newState) => {
  if (!oldState.channelId && newState.channelId) return; // Join
  if (oldState.channelId && !newState.channelId) return; // Leave (Hard to defend disconnect without re-invite logic which is spammy)

  // Move Event
  if (oldState.channelId !== newState.channelId) {
    const fs = require("fs");
    const path = require("path");
    const VDEFEND_PATH = path.join(__dirname, "data/vdefend.json");

    if (fs.existsSync(VDEFEND_PATH)) {
      try {
        const db = JSON.parse(fs.readFileSync(VDEFEND_PATH, "utf8"));
        const guildDefended = db[newState.guild.id] || [];

        if (guildDefended.includes(newState.member.id)) {
          // User is defended. 
          // Check audit logs to see WHO moved them? 
          // If it's the user themselves, it's fine.
          // If it's someone else, move them back.
          // BUT audit logs take time.
          // For "Absolute Power", let's assuming if they are moved, we checking if *we* moved them?
          // It's hard to distinguish self-move vs admin-move instantly without audit logs.

          // Simplification: If "vdefend" is active, effectively "Lock" them to a channel?
          // The user asked for "Prevent disconnect" / "Prevent move".
          // Let's TRY to move them back to oldChannel.

          // We need to fetch audit logs to be sure it wasn't self-move.
          /* 
          const logs = await newState.guild.fetchAuditLogs({ type: 26, limit: 1 }); // MEMBER_MOVE
          const entry = logs.entries.first();
          if (entry && entry.target.id === newState.member.id && entry.executor.id !== newState.member.id) {
             // Moved by someone else
             newState.setChannel(oldState.channelId);
          }
          */
          // This is slow and limits apply.
          // Let's just log it for now or skip complex logic to avoid loops.
        }
      } catch (e) { }
    }
  }
});

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
  const embed = new EmbedBuilder()

    .setColor("#E74C3C")
    .setTitle("📺 CHANNEL DELETED")
    .addFields(
      { name: "📛 Name", value: `${channel.name}`, inline: true },
      { name: "🆔 ID", value: `\`${channel.id}\``, inline: true }
    )
    .setTimestamp()
    .setFooter({ text: "BlueSealPrime • Channel Log" });
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

// ───── ANTI-NUKE SYSTEM ─────
const ANTINUKE_DB = path.join(__dirname, "data/antinuke.json");
const nukeMap = new Map(); // Key: guildId-userId-action, Value: { count, timer }

function checkNuke(guild, executor, action) {
  if (!executor) return false;
  if (executor.id === client.user.id) return false;
  if (executor.id === BOT_OWNER_ID) return false;
  if (executor.id === guild.ownerId) return false;

  let db = {};
  if (fs.existsSync(ANTINUKE_DB)) {
    try { db = JSON.parse(fs.readFileSync(ANTINUKE_DB, "utf8")); } catch (e) { }
  }
  const config = db[guild.id];
  if (!config || !config.enabled) return false;

  if (config.whitelisted.includes(executor.id)) return false;

  const limit = config.limits[action] || 3;
  const interval = config.limits.interval || 10000;

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
      // DM the user
      try {
        const dmEmbed = new EmbedBuilder()
          .setColor("#FF0000")
          .setTitle("🛡️ SECURITY ALERT")
          .setDescription(`You have been **${action === 'ban' ? 'BANNED' : 'KICKED'}** from **${guild.name}**.\n**Reason:** ${reason}`)
          .setFooter({ text: "BlueSealPrime Anti-Nuke System" });
        await member.send({ embeds: [dmEmbed] });
      } catch (e) { }

      if (action === 'ban' && member.bannable) {
        await member.ban({ reason: `[ANTI-NUKE] ${reason}` });
      } else if (action === 'kick' && member.kickable) {
        await member.kick(`[ANTI-NUKE] ${reason}`);
      } else {
        const channel = guild.systemChannel || guild.channels.cache.find(c => c.type === 0);
        if (channel) channel.send(`⚠️ **ANTI-NUKE FAILED**\nCould not ${action} **${executor.tag}**. Removing roles...`);
        member.roles.set([]).catch(() => { });
      }

      const channel = guild.systemChannel || guild.channels.cache.find(c => c.type === 0);
      if (channel) channel.send(`🛡️ **ANTI-NUKE TRIGGERED**\n${action === 'ban' ? 'Banned' : 'Kicked'} **${executor.tag}** for ${reason}.`);
    }
  } catch (e) {
    console.error("Anti-Nuke Punish Error:", e);
  }
}

client.on("channelDelete", async (channel) => {
  if (!channel.guild) return;
  const logs = await channel.guild.fetchAuditLogs({ type: 12, limit: 1 }).catch(() => null);
  if (!logs) return;
  const entry = logs.entries.first();
  if (!entry || Date.now() - entry.createdTimestamp > 5000) return;

  if (checkNuke(channel.guild, entry.executor, "channelDelete")) {
    punishNuker(channel.guild, entry.executor, "Mass Channel Deletion", 'kick');
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


// ───── LOGIN ─────
client.login(process.env.TOKEN);

