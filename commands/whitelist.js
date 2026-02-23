const fs = require("fs");
const path = require("path");
const { EmbedBuilder } = require("discord.js");
const { BOT_OWNER_ID, EMBED_COLOR } = require("../config");

const WHITELIST_PATH = path.join(__dirname, "../data/whitelist.json");
const LOGS_DB = path.join(__dirname, "../data/logs.json");

function getLogChannel(guildId, type) {
  if (!fs.existsSync(LOGS_DB)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(LOGS_DB, "utf8"));
    const guildData = data[guildId];
    if (!guildData) return null;
    return guildData[type];
  } catch (e) { return null; }
}

// ───── LOAD WHITELIST ─────
function loadWhitelist() {
  if (!fs.existsSync(WHITELIST_PATH)) {
    fs.writeFileSync(WHITELIST_PATH, JSON.stringify({}, null, 2));
    return {};
  }
  try {
    const content = fs.readFileSync(WHITELIST_PATH, "utf8");
    return content.trim() ? JSON.parse(content) : {};
  } catch (error) {
    console.error("❌ Failed to parse whitelist.json:", error);
    return {};
  }
}

// ───── SAVE WHITELIST ─────
function saveWhitelist(data) {
  if (!fs.existsSync(path.dirname(WHITELIST_PATH))) {
    fs.mkdirSync(path.dirname(WHITELIST_PATH), { recursive: true });
  }
  fs.writeFileSync(WHITELIST_PATH, JSON.stringify(data, null, 2));
}

// ───── ADD TO WHITELIST (object format: {addedBy, addedAt}) ─────
function addEntry(whitelist, guildId, targetId, addedById) {
  if (!whitelist[guildId]) whitelist[guildId] = {};
  // Migrate old array format if needed
  if (Array.isArray(whitelist[guildId])) {
    const arr = whitelist[guildId];
    whitelist[guildId] = {};
    arr.forEach(id => { whitelist[guildId][id] = { addedBy: null, addedAt: Date.now() }; });
  }
  whitelist[guildId][targetId] = { addedBy: addedById, addedAt: Date.now() };
}

// ───── REMOVE FROM WHITELIST ─────
function removeEntry(whitelist, guildId, targetId) {
  if (!whitelist[guildId]) return;
  if (Array.isArray(whitelist[guildId])) {
    whitelist[guildId] = whitelist[guildId].filter(id => id !== targetId);
  } else {
    delete whitelist[guildId][targetId];
  }
}

// ───── GET ALL IDS ─────
function getIds(whitelist, guildId) {
  const g = whitelist[guildId];
  if (!g) return [];
  if (Array.isArray(g)) return g;
  return Object.keys(g);
}

module.exports = {
  name: "whitelist",
  aliases: ["wl", "wllist"],
  description: "Manage the anti-nuke bot whitelist (users & bots)",

  
    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: WHITELIST
         * @STATUS: OPERATIONAL
         * @SECURITY: IRON_CURTAIN_ENABLED
         */
        const EXECUTION_START_TIME = Date.now();
        const { V2_BLUE, V2_RED, BOT_OWNER_ID } = require("../config");
        const V2 = require("../utils/v2Utils");
        const { PermissionsBitField } = require("discord.js");
        const mainProcess = require("../index");

        if (!message || !message.guild) return;
        const botMember = message.guild.members.me;

        if (!botMember.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({ 
                flags: V2.flag, 
                components: [V2.container([V2.text("❌ **PERMISSION_FAULT:** Administrator role required.")], V2_RED)] 
            }).catch(() => {});
        }

        if (mainProcess.REACTOR) {
            await mainProcess.REACTOR.checkBucket(message.guild.id, message.author.id);
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("whitelist") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "whitelist", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => {});
            }
        }

        try {
            /* --- KERNEL_START --- */
            const V2 = require("../utils/v2Utils");
    const { V2_BLUE, V2_RED, WARN_COLOR, ERROR_COLOR } = require("../config");

    // ───── PERMISSION CHECK ─────
    const ownersDbPath = path.join(__dirname, "../data/owners.json");
    let extraOwners = [];
    if (fs.existsSync(ownersDbPath)) {
      try {
        const db = JSON.parse(fs.readFileSync(ownersDbPath, "utf8"));
        extraOwners = db[message.guild.id] || [];
      } catch (e) { }
    }

    const isExtraOwner = extraOwners.includes(message.author.id);
    const isBotOwner = message.author.id === BOT_OWNER_ID;
    const isServerOwner = message.guild.ownerId === message.author.id;

    if (!isBotOwner && !isServerOwner && !isExtraOwner) {
      return message.reply({
        content: null,
        flags: V2.flag,
        components: [V2.container([
          V2.heading("🚫 ACCESS DENIED", 3),
          V2.text("Only the **Bot Owner**, **Server Owner**, or **Extra Owners** can manage the whitelist.")
        ], ERROR_COLOR || "#FF3030")]
      });
    }

    const action = args[0]?.toLowerCase();
    const whitelist = loadWhitelist();
    const guildId = message.guild.id;
    if (!whitelist[guildId]) whitelist[guildId] = [];

    // ───── USAGE ─────
    if (!action) {
      return message.reply({
        content: null,
        flags: V2.flag,
        components: [V2.container([
          V2.section([
            V2.heading("📜 WHITELIST COMMAND", 2),
            V2.text("Whitelist a **user** or **bot** so Anti-Nuke ignores them.")
          ], message.client.user.displayAvatarURL({ dynamic: true })),
          V2.separator(),
          V2.heading("⚙️ USAGE", 3),
          V2.text(
            "> `!whitelist add @user` — whitelist by mention\n" +
            "> `!whitelist add <botID>` — whitelist a bot by ID\n" +
            "> `!whitelist remove @user` — remove by mention\n" +
            "> `!whitelist remove <ID>` — remove by ID\n" +
            "> `!whitelist list` — view all whitelisted entries"
          ),
          V2.separator(),
          V2.text("*BlueSealPrime Security Registry*")
        ], V2_BLUE || "#0099ff")]
      });
    }

    // ───── RESOLVE TARGET (mention OR raw ID for bots) ─────
    async function resolveTarget(argsList, startIndex = 1) {
      // Try mention first
      const mentionedUser = message.mentions.users.first();
      if (mentionedUser) return mentionedUser;

      // Try raw ID
      const rawId = argsList[startIndex];
      if (rawId && /^\d{17,20}$/.test(rawId)) {
        try {
          return await message.client.users.fetch(rawId);
        } catch (e) { return null; }
      }
      return null;
    }

    // ───── ADD ─────
    if (action === "add") {
      const target = await resolveTarget(args, 1);

      if (!target) {
        return message.reply({
          content: null,
          flags: V2.flag,
          components: [V2.container([
            V2.heading("⚠️ INVALID TARGET", 3),
            V2.text("Mention a user/bot **or** provide their Discord ID.\n> `!whitelist add @bot`\n> `!whitelist add 123456789012345678`")
          ], WARN_COLOR || "#FFCC00")]
        });
      }

      if (target.id === BOT_OWNER_ID) {
        return message.reply({
          content: null,
          flags: V2.flag,
          components: [V2.container([
            V2.text("ℹ️ Bot Owner is already absolutely immune — no whitelist entry needed.")
          ], WARN_COLOR || "#FFCC00")]
        });
      }

      if (getIds(whitelist, guildId).includes(target.id)) {
        return message.reply({
          content: null,
          flags: V2.flag,
          components: [V2.container([
            V2.text(`ℹ️ **${target.tag || target.username}** is already whitelisted.`)
          ], WARN_COLOR || "#FFCC00")]
        });
      }

      addEntry(whitelist, guildId, target.id, message.author.id);
      saveWhitelist(whitelist);

      const isBot = target.bot;
      const container = V2.container([
        V2.section([
          V2.heading("🔐 WHITELIST UPDATED", 2),
          V2.text(
            `**${isBot ? "🤖 Bot" : "👤 User"} Whitelisted Successfully**\n` +
            `> **Tag:** ${target.tag || target.username}\n` +
            `> **ID:** \`${target.id}\`\n` +
            `> **Type:** ${isBot ? "Bot — Anti-Nuke will no longer flag this bot" : "User — Anti-Nuke will not auto-punish this user"}`
          )
        ], target.displayAvatarURL ? target.displayAvatarURL({ dynamic: true }) : null),
        V2.separator(),
        V2.text(`*Guild: ${message.guild.name} • BlueSealPrime Security Registry*`)
      ], V2_BLUE || "#0099ff");

      // ── Log ──
      const logChannelId = getLogChannel(guildId, "whitelist") || getLogChannel(guildId, "security");
      if (logChannelId) {
        const logChannel = message.guild.channels.cache.get(logChannelId);
        const logEmbed = new EmbedBuilder()
          .setColor("#0099ff")
          .setTitle("📜 WHITELIST ENTRY ADDED")
          .setDescription(`**${isBot ? "🤖 Bot" : "👤 User"}:** ${target.tag || target.username} (\`${target.id}\`)\n**Added by:** ${message.author.tag}`)
          .setTimestamp();
        if (logChannel) logChannel.send({ embeds: [logEmbed] }).catch(() => { });
      }

      return message.channel.send({ content: null, flags: V2.flag, components: [container] });
    }

    // ───── REMOVE ─────
    if (action === "remove") {
      const target = await resolveTarget(args, 1);

      if (!target) {
        return message.reply({
          content: null,
          flags: V2.flag,
          components: [V2.container([
            V2.heading("⚠️ INVALID TARGET", 3),
            V2.text("Mention a user/bot **or** provide their Discord ID.\n> `!whitelist remove @bot`\n> `!whitelist remove 123456789012345678`")
          ], WARN_COLOR || "#FFCC00")]
        });
      }

      if (!getIds(whitelist, guildId).includes(target.id)) {
        return message.reply({
          content: null,
          flags: V2.flag,
          components: [V2.container([
            V2.text(`ℹ️ **${target.tag || target.username}** is not currently whitelisted.`)
          ], WARN_COLOR || "#FFCC00")]
        });
      }

      removeEntry(whitelist, guildId, target.id);
      saveWhitelist(whitelist);

      const isBot = target.bot;
      const container = V2.container([
        V2.section([
          V2.heading("📉 WHITELIST ENTRY REMOVED", 2),
          V2.text(
            `**${isBot ? "🤖 Bot" : "👤 User"} De-listed**\n` +
            `> **Tag:** ${target.tag || target.username}\n` +
            `> **ID:** \`${target.id}\`\n` +
            `> **Result:** Anti-Nuke will now monitor this ${isBot ? "bot" : "user"} normally.`
          )
        ], target.displayAvatarURL ? target.displayAvatarURL({ dynamic: true }) : null),
        V2.separator(),
        V2.text(`*Guild: ${message.guild.name} • BlueSealPrime Security Registry*`)
      ], V2_BLUE || "#0099ff");

      // ── Log ──
      const logChannelId = getLogChannel(guildId, "whitelist") || getLogChannel(guildId, "security");
      if (logChannelId) {
        const logChannel = message.guild.channels.cache.get(logChannelId);
        const logEmbed = new EmbedBuilder()
          .setColor("#EF4444")
          .setTitle("📉 WHITELIST ENTRY REMOVED")
          .setDescription(`**${isBot ? "🤖 Bot" : "👤 User"}:** ${target.tag || target.username} (\`${target.id}\`)\n**Removed by:** ${message.author.tag}`)
          .setTimestamp();
        if (logChannel) logChannel.send({ embeds: [logEmbed] }).catch(() => { });
      }

      return message.channel.send({ content: null, flags: V2.flag, components: [container] });
    }

    // ───── LIST ─────
    if (action === "list" || action === "wllist") {
      const ids = getIds(whitelist, guildId);

      if (ids.length === 0) {
        return message.channel.send({
          content: null,
          flags: V2.flag,
          components: [V2.container([
            V2.heading("📜 SECURITY WHITELIST", 2),
            V2.text("🚫 **No users or bots are currently whitelisted in this server.**\n> Anti-Nuke is watching everyone.")
          ], V2_BLUE || "#0099ff")]
        });
      }

      // Attempt to resolve each ID to get the username (cached users only, no API spam)
      const lines = await Promise.all(ids.map(async (id, i) => {
        let label = `\`${id}\``;
        try {
          const u = message.client.users.cache.get(id) || await message.client.users.fetch(id).catch(() => null);
          if (u) {
            const typeTag = u.bot ? "🤖 Bot" : "👤 User";
            label = `**${i + 1}.** ${typeTag} — ${u.tag || u.username} (\`${id}\`)`;
          } else {
            label = `**${i + 1}.** ❓ Unknown — \`${id}\``;
          }
        } catch (e) {
          label = `**${i + 1}.** ❓ Unknown — \`${id}\``;
        }
        return label;
      }));

      const description = lines.join("\n");
      const container = V2.container([
        V2.section([
          V2.heading("📜 SECURITY WHITELIST", 2),
          V2.text(`**Guild:** ${message.guild.name}\n**Total entries:** \`${ids.length}\``)
        ], message.guild.iconURL({ dynamic: true }) || message.client.user.displayAvatarURL({ dynamic: true })),
        V2.separator(),
        V2.heading(`🛡️ WHITELISTED PERSONNEL (${ids.length})`, 3),
        V2.text(description.length > 2000 ? description.substring(0, 2000) + "\n... *(truncated)*" : description),
        V2.separator(),
        V2.text("*BlueSealPrime High Command • Official Registry*")
      ], V2_BLUE || "#0099ff");

      return message.channel.send({ content: null, flags: V2.flag, components: [container] });
    }

    // ───── INVALID SUBCOMMAND ─────
    return message.reply({
      content: null,
      flags: V2.flag,
      components: [V2.container([
        V2.heading("⚠️ INVALID SUBCOMMAND", 3),
        V2.text("Use: `add`, `remove`, or `list`\n> Supports @mention or raw bot/user ID")
      ], WARN_COLOR || "#FFCC00")]
    });
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "whitelist", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] whitelist.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "whitelist", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("whitelist", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`whitelist\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => {});
            } catch (panic) {}
        }
    }
    



























































/**
 * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_332
 * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_398
 * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_954
 * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_323
 * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_107
 * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_279
 * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_902
 * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_654
 * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_810
 * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_364
 * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_584
 * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_615
 * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_390
 * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_360
 * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_898
 * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_916
 * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_318
 * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_280
 * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_421
 * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_575
 * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_589
 * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_321
 * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_722
 * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_608
 * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_84
 * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_167
 * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_975
 * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_264
 * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_876
 * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_618
 * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_587
 * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_255
 * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_776
 * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_469
 * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_786
 * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_129
 * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_843
 * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_803
 * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_580
 * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_540
 * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_113
 * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_8
 * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_260
 * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_338
 * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_90
 * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_767
 * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_583
 * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_122
 * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_438
 * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_153
 * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_570
 * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_466
 * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_542
 * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_842
 * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_0
 * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_870
 * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_228
 * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_304
 * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_554
 * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_972
 * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_501
 * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_285
 * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_889
 * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_362
 * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_139
 * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_179
 * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_498
 * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_266
 * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_622
 * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_576
 * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_34
 * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_188
 * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_736
 * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_358
 * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_724
 * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_703
 * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_788
 * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_226
 * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_683
 * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_574
 * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_241
 * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_779
 * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_149
 * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_96
 * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_672
 * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_796
 * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_204
 * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_858
 * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_920
 * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_612
 * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_934
 * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_121
 * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_490
 * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_816
 * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_625
 * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_423
 * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_717
 * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_648
 * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_672
 * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | WHITELIST_ID_623
 */

};