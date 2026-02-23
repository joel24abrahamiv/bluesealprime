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

  async execute(message, args) {
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
  }
};
