const { PermissionsBitField, EmbedBuilder } = require("discord.js");
const { BOT_OWNER_ID, EMBED_COLOR, ERROR_COLOR, SUCCESS_COLOR } = require("../config");

module.exports = {
  name: "unban",
  description: "Unban a user using mention, ID, or username",
  permissions: [PermissionsBitField.Flags.BanMembers],

  async execute(message, args) {
    const V2 = require("../utils/v2Utils");

    if (!args.length) {
      return message.reply({
        content: null,
        flags: V2.flag,
        components: [V2.container([V2.heading("⚠️ MISSING USER", 3), V2.text("Usage: `!unban <userID | username> [reason]`")], "#0099ff")]
      });
    }

    let input = args[0];
    const reason = args.slice(1).join(" ") || "No reason provided";

    // ───── HANDLE MENTION ─────
    const mentionMatch = input.match(/^<@!?(\d{17,20})>$/);
    if (mentionMatch) {
      input = mentionMatch[1];
    }

    try {
      const bans = await message.guild.bans.fetch();

      if (!bans.size) {
        return message.reply({ components: [V2.container([V2.text("ℹ️ No users are currently banned.")], "#0099ff")] });
      }

      let targetBan = null;

      // ───── CASE 1: INPUT IS USER ID ─────
      if (/^\d{17,20}$/.test(input)) {
        targetBan = bans.get(input);
        if (!targetBan) {
          return message.reply({ components: [V2.container([V2.text("❌ **User ID not found in ban list.**")], "#0099ff")] });
        }
      }
      // ───── CASE 2: INPUT IS USERNAME ─────
      else {
        const matches = bans.filter(ban => {
          const username = ban.user.username.toLowerCase();
          const tag = ban.user.tag?.toLowerCase();
          const search = input.toLowerCase();
          return username === search || tag === search;
        });

        if (matches.size === 0) return message.reply({ components: [V2.container([V2.text("❌ **No banned user found with that name.**")], "#0099ff")] });
        if (matches.size > 1) return message.reply({ components: [V2.container([V2.text("⚠️ **Multiple matches found.** Use ID instead.")], require("../config").WARN_COLOR)] });

        targetBan = matches.first();
      }

      // ───── UNBAN USER ─────
      await message.guild.members.unban(targetBan.user.id, reason);

      // ───── PREMIUM V2 EMBED ─────
      const container = V2.container([
        V2.section([
          V2.heading("🔓 ACCESS RESTORED", 2),
          V2.text(`**Status:** \`UNBANNED\`\n**Target:** ${targetBan.user.tag}\n**ID:** \`${targetBan.user.id}\``)
        ], "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"), // Unlock Icon
        V2.separator(),
        V2.heading("📝 DETAILS", 3),
        V2.text(`> **Reason:** ${reason}\n> **Authorized By:** ${message.author}\n> **Time:** <t:${Math.floor(Date.now() / 1000)}:f>`),
        V2.separator(),
        V2.text("*BlueSealPrime • Security Systems*")
      ], require("../config").SUCCESS_COLOR);

      await message.channel.send({ content: null, flags: V2.flag, components: [container] });

    } catch (err) {
      console.error(err);
      message.reply({ components: [V2.container([V2.text("❌ **Failed to unban.** Check permissions.")], require("../config").ERROR_COLOR)] });
    }
  }
};
