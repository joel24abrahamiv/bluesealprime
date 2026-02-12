const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const { BOT_OWNER_ID, EMBED_COLOR, ERROR_COLOR, SUCCESS_COLOR } = require("../config");

module.exports = {
  name: "unban",
  description: "Unban a user using mention, ID, or username",
  permissions: [PermissionsBitField.Flags.BanMembers],

  async execute(message, args) {
    // ───── BASIC CHECKS ─────
    // Permission check handled by index.js now

    if (!args.length) {
      return message.reply({ embeds: [new EmbedBuilder().setColor(require("../config").WARN_COLOR).setDescription("⚠️ **Missing User.** Usage: `!unban <userID | username> [reason]`")] });
    }

    let input = args[0];
    const reason = args.slice(1).join(" ") || "No reason provided";

    // ───── HANDLE MENTION ─────
    const mentionMatch = input.match(/^<@!?(\d{17,20})>$/);
    if (mentionMatch) {
      input = mentionMatch[1]; // Extract ID from mention
    }

    try {
      const bans = await message.guild.bans.fetch();

      if (!bans.size) {
        return message.reply("ℹ️ There are no banned users in this server.");
      }

      let targetBan = null;

      // ───── CASE 1: INPUT IS USER ID ─────
      if (/^\d{17,20}$/.test(input)) {
        targetBan = bans.get(input);

        if (!targetBan) {
          return message.reply(
            "❌ **That user ID is not banned in this server.**"
          );
        }
      }

      // ───── CASE 2: INPUT IS USERNAME / TAG ─────
      else {
        const matches = bans.filter(ban => {
          const username = ban.user.username.toLowerCase();
          const tag = ban.user.tag?.toLowerCase();
          const search = input.toLowerCase();

          return username === search || tag === search;
        });

        if (matches.size === 0) {
          return message.reply(
            "❌ **No banned user found with that username.**"
          );
        }

        if (matches.size > 1) {
          return message.reply(
            "⚠️ **Multiple banned users match that name.**\n" +
            "Please unban using the **user ID** to avoid mistakes."
          );
        }

        targetBan = matches.first();
      }

      // ───── UNBAN USER ─────
      await message.guild.members.unban(
        targetBan.user.id,
        reason
      );

      // ───── PREMIUM EMBED ─────
      const unbanEmbed = new EmbedBuilder()
        .setColor(require("../config").SUCCESS_COLOR) // Use Green for Success
        .setTitle("🔓 ACCESS RESTORED")
        .setDescription(
          `**The ban hammer has been lifted.**\nUser access to **${message.guild.name}** has been restored.`
        )
        .setThumbnail("https://cdn-icons-png.flaticon.com/512/3135/3135715.png") // Open Lock Icon
        .addFields(
          {
            name: "👤 User Identity",
            value: `**${targetBan.user.tag}**\n\`${targetBan.user.id}\``,
            inline: true
          },
          {
            name: "🛡️ Authorized By",
            value: `${message.author}\n\`${message.author.id}\``,
            inline: true
          },
          {
            name: "📝 Justification",
            value: `\`${reason}\``,
            inline: false
          }
        )
        .setImage("https://media.discordapp.net/attachments/1093150036663308318/1113885934572900454/line-red.gif") // Premium Line
        .setFooter({
          text: `BlueSealPrime Security Systems • ${new Date().toLocaleTimeString()}`,
          iconURL: message.client.user.displayAvatarURL()
        });

      await message.channel.send({ embeds: [unbanEmbed] });

    } catch (err) {
      console.error(err);
      message.reply(
        "❌ **Failed to unban the user.** Please check permissions or input."
      );
    }
  }
};
