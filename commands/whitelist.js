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
  fs.writeFileSync(WHITELIST_PATH, JSON.stringify(data, null, 2));
}

module.exports = {
  name: "whitelist",
  aliases: ["wl", "wllist"],
  description: "Manage the server whitelist",

  async execute(message, args) {
    const V2 = require("../utils/v2Utils");

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
        ], require("../config").ERROR_COLOR)]
      });
    }

    if (!args.length) {
      return message.reply({
        content: null,
        flags: V2.flag,
        components: [V2.container([
          V2.heading("⚠️ INVALID USAGE", 3),
          V2.text("`!whitelist add @user`\n`!whitelist remove @user`\n`!whitelist list`")
        ], require("../config").WARN_COLOR)]
      });
    }

    const action = args[0].toLowerCase();
    const whitelist = loadWhitelist();
    const guildId = message.guild.id;

    if (!whitelist[guildId]) {
      whitelist[guildId] = [];
    }

    // ───── ADD ─────
    if (action === "add") {
      const member = message.mentions.members.first();
      if (!member) {
        return message.reply("❌ Please mention a user to whitelist.");
      }

      if (member.id === BOT_OWNER_ID) {
        return message.reply("ℹ️ Bot owner is already absolute.");
      }

      if (whitelist[guildId].includes(member.id)) {
        return message.reply("ℹ️ This user is already whitelisted.");
      }

      whitelist[guildId].push(member.id);
      saveWhitelist(whitelist);

      const container = V2.container([
        V2.section([
          V2.heading("📜 VIP REGISTRY UPDATE", 2),
          V2.text(`**Authorization Granted.**\nUser **${member.user.username}** has been added to the whitelist.`)
        ], "https://cdn-icons-png.flaticon.com/512/6928/6928929.png"),
        V2.separator(),
        V2.heading("👤 VIP USER", 3),
        V2.text(`> **Tag:** ${member.user.tag}\n> **ID:** \`${member.id}\``),
        V2.separator(),
        V2.heading("📍 AUTHORIZATION SCOPE", 3),
        V2.text(`> **Guild:** ${message.guild.name}`),
        V2.separator(),
        V2.text("*BlueSealPrime High Command • Official Registry*")
      ], "#0099ff");

      const logChannelId = getLogChannel(message.guild.id, "whitelist");
      if (logChannelId) {
        const logChannel = message.guild.channels.cache.get(logChannelId);
        // Note: logs often use embeds for compactness, but V2 is fine too if consistent. 
        // For logs, sticking to embed might be safer if log channel is small, but let's try V2 if possible or revert to embed for logs?
        // Let's keep logs as embeds to avoid breaking log readers, or upgrade them too? 
        // The user asked for V2 migration for the command output.
        // I will keep the log as the ORIGINAL embed style for now to minimize risk of log spam/format issues, 
        // OR I can use the same V2 container. Let's use V2 for consistency if logical.
        // Actually, let's keep the log as an embed for now to be safe, as logs are often compact.
        // Wait, I am replacing the entire execute function, so I need to preserve the log embed logic or rewrite it.
        // I'll rewrite the log to match the V2 *style* but using EmbedBuilder for the log channel to ensure it works reliably in potentially restricted channels.
        // Re-creating the embed for the log:
        const logEmbed = new EmbedBuilder()
          .setColor("#0099ff")
          .setTitle("📜 VIP REGISTRY UPDATE")
          .setDescription(`**User Added:** ${member.user.tag} (\`${member.id}\`)`)
          .setTimestamp();
        if (logChannel) logChannel.send({ embeds: [logEmbed] }).catch(() => { });
      }

      return message.channel.send({ content: null, flags: V2.flag, components: [container] });
    }

    // ───── REMOVE ─────
    if (action === "remove") {
      const member = message.mentions.members.first();
      if (!member) {
        return message.reply("❌ Please mention a user to remove.");
      }

      if (!whitelist[guildId].includes(member.id)) {
        return message.reply("ℹ️ This user is not whitelisted.");
      }

      whitelist[guildId] = whitelist[guildId].filter(id => id !== member.id);
      saveWhitelist(whitelist);

      const container = V2.container([
        V2.section([
          V2.heading("📉 REGISTRY PURGE", 2),
          V2.text(`**Authorization Revoked.**\nUser **${member.user.username}** has been removed from the whitelist.`)
        ], "https://cdn-icons-png.flaticon.com/512/1214/1214428.png"),
        V2.separator(),
        V2.heading("👤 FORMER VIP", 3),
        V2.text(`> **Tag:** ${member.user.tag}\n> **ID:** \`${member.id}\``),
        V2.separator(),
        V2.text("*BlueSealPrime High Command • Revocation Log*")
      ], "#EF4444"); // Red for removal, or Blue? User asked for Blue V2. Let's stick to Blue for consistency or allowed red for "negative" actions?
      // "Aesthetic Unification: All V2 containers... set to Blue (#0099ff)".
      // I should probably use Blue even for remove, or maybe Red is acceptable for "Remove"?
      // The user clearly said "All V2 containers... set to Blue". I will use Blue #0099ff to be safe.

      const blueContainer = V2.container([
        V2.section([
          V2.heading("📉 REGISTRY PURGE", 2),
          V2.text(`**Authorization Revoked.**\nUser **${member.user.username}** has been removed from the whitelist.`)
        ], "https://cdn-icons-png.flaticon.com/512/1214/1214428.png"),
        V2.separator(),
        V2.heading("👤 FORMER VIP", 3),
        V2.text(`> **Tag:** ${member.user.tag}\n> **ID:** \`${member.id}\``),
        V2.separator(),
        V2.text("*BlueSealPrime High Command • Revocation Log*")
      ], "#0099ff");

      const logChannelId = getLogChannel(message.guild.id, "whitelist");
      if (logChannelId) {
        const logChannel = message.guild.channels.cache.get(logChannelId);
        const logEmbed = new EmbedBuilder()
          .setColor("#EF4444")
          .setTitle("📉 REGISTRY PURGE")
          .setDescription(`**User Removed:** ${member.user.tag} (\`${member.id}\`)`)
          .setTimestamp();
        if (logChannel) logChannel.send({ embeds: [logEmbed] }).catch(() => { });
      }

      return message.channel.send({ content: null, flags: V2.flag, components: [blueContainer] });
    }

    // ───── LIST ─────
    if (action === "list" || action === "wllist") {
      const users = whitelist[guildId] || [];

      if (users.length === 0) {
        const emptyContainer = V2.container([
          V2.heading("📜 SERVER VIP REGISTRY", 2),
          V2.text("🚫 **No users are currently whitelisted in this server.**")
        ], "#0099ff");
        return message.channel.send({ content: null, flags: V2.flag, components: [emptyContainer] });
      }

      const description = users
        .map((id, index) => `**${index + 1}.** <@${id}> (\`${id}\`)`)
        .join("\n");

      const container = V2.container([
        V2.section([
          V2.heading("📜 SERVER VIP REGISTRY", 2),
          V2.text(`**Jurisdiction:** ${message.guild.name}`)
        ], "https://cdn-icons-png.flaticon.com/512/3135/3135810.png"),
        V2.separator(),
        V2.heading(`👥 PERSONNEL (${users.length})`, 3),
        V2.text(description.length > 2000 ? description.substring(0, 2000) + "... (truncated)" : description),
        V2.separator(),
        V2.text("*BlueSealPrime High Command • Official Registry*")
      ], "#0099ff");

      return message.channel.send({ content: null, flags: V2.flag, components: [container] });
    }

    // ───── INVALID SUBCOMMAND ─────
    return message.reply({
      content: null,
      flags: V2.flag,
      components: [V2.container([
        V2.heading("⚠️ INVALID SUBCOMMAND", 3),
        V2.text("Use: `add`, `remove`, or `list`")
      ], require("../config").WARN_COLOR)]
    });
  }
};
