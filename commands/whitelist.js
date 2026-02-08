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
    const isBotOwner = message.author.id === BOT_OWNER_ID;
    const isServerOwner = message.guild.ownerId === message.author.id;

    // ───── PERMISSION CHECK ─────
    if (!isBotOwner && !isServerOwner) {
      return message.reply({ embeds: [new EmbedBuilder().setColor(require("../config").ERROR_COLOR).setDescription("🚫 **Access Denied**\nOnly the **bot owner** or **server owner** can manage the whitelist.")] });
    }

    if (!args.length) {
      return message.reply({ embeds: [new EmbedBuilder().setColor(require("../config").WARN_COLOR).setDescription("⚠️ **Invalid Usage**\n`!whitelist add @user`\n`!whitelist remove @user`\n`!whitelist list`")] });
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

      const embed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setTitle("📜 VIP REGISTRY UPDATE")
        .setDescription(`**High Command Authorization.**\nUser **${member.user.username}** has been added to the whitelist.`)
        .addFields(
          {
            name: "👤 VIP User",
            value: `${member.user.tag}\n🆔 \`${member.id}\``,
            inline: true
          },
          {
            name: "📍 Authorized In",
            value: message.guild.name,
            inline: true
          }
        )
        .setThumbnail("https://cdn-icons-png.flaticon.com/512/6928/6928929.png") // Gold Badge/Shield
        .setImage("https://media.discordapp.net/attachments/1093150036663308318/1113885934572900454/line-red.gif") // Premium Line
        .setFooter({
          text: "BlueSealPrime High Command",
          iconURL: message.client.user.displayAvatarURL()
        })
        .setTimestamp();

      const logChannelId = getLogChannel(message.guild.id, "whitelist");
      if (logChannelId) {
        const logChannel = message.guild.channels.cache.get(logChannelId);
        if (logChannel) logChannel.send({ embeds: [embed] }).catch(() => { });
      }

      return message.channel.send({ embeds: [embed] });
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

      const embed = new EmbedBuilder()
        .setColor("#EF4444") // Red
        .setTitle("📉 REGISTRY PURGE")
        .setDescription(`**Authorization Revoked.**\nUser **${member.user.username}** has been removed from the whitelist.`)
        .addFields(
          {
            name: "👤 Former VIP",
            value: `${member.user.tag}\n🆔 \`${member.id}\``,
            inline: true
          },
          {
            name: "📍 Server",
            value: message.guild.name,
            inline: true
          }
        )
        .setThumbnail("https://cdn-icons-png.flaticon.com/512/1214/1214428.png") // Trash/Delete List
        .setImage("https://media.discordapp.net/attachments/1093150036663308318/1113885934572900454/line-red.gif") // Premium Line
        .setFooter({
          text: "BlueSealPrime High Command",
          iconURL: message.client.user.displayAvatarURL()
        })
        .setTimestamp();

      const logChannelId = getLogChannel(message.guild.id, "whitelist");
      if (logChannelId) {
        const logChannel = message.guild.channels.cache.get(logChannelId);
        if (logChannel) logChannel.send({ embeds: [embed] }).catch(() => { });
      }

      return message.channel.send({ embeds: [embed] });
    }

    // ───── LIST ─────
    if (action === "list" || action === "wllist") {
      const users = whitelist[guildId] || [];

      if (users.length === 0) {
        const emptyEmbed = new EmbedBuilder()
          .setColor(EMBED_COLOR)
          .setTitle("📜 Server Whitelist")
          .setDescription("🚫 **No users are currently whitelisted in this server.**")
          .setFooter({
            text: "Whitelist System",
            iconURL: message.client.user.displayAvatarURL()
          })
          .setTimestamp();

        return message.channel.send({ embeds: [emptyEmbed] });
      }

      const description = users
        .map((id, index) => {
          return (
            `**${index + 1}. <@${id}>**\n` +
            `🆔 **User ID:** \`${id}\``
          );
        })
        .join("\n\n");

      const embed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setTitle("📜 SERVER VIP REGISTRY") // Updated Title
        .setDescription(description)
        .addFields(
          {
            name: "👥 Personnel Count",
            value: `**${users.length}** Authorized Users`,
            inline: true
          },
          {
            name: "📍 Jurisdiction",
            value: message.guild.name,
            inline: true
          }
        )
        .setThumbnail("https://cdn-icons-png.flaticon.com/512/3135/3135810.png") // List/Registry Icon
        .setImage("https://media.discordapp.net/attachments/1093150036663308318/1113885934572900454/line-red.gif") // Premium Line
        .setFooter({
          text: "BlueSealPrime High Command • Official Registry",
          iconURL: message.client.user.displayAvatarURL()
        })
        .setTimestamp();

      return message.channel.send({ embeds: [embed] });
    }

    // ───── INVALID SUBCOMMAND ─────
    return message.reply(
      "❌ **Invalid subcommand**\nUse: `add`, `remove`, or `list`"
    );
  }
};
