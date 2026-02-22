const V2 = require("../utils/v2Utils");
const {
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

module.exports = {
  name: "ban",
  description: "Ban a member with a premium V2 interface",
  permissions: [PermissionsBitField.Flags.BanMembers],

  async execute(message, args) {
    const isBotOwner = message.author.id === BOT_OWNER_ID;
    const isServerOwner = message.guild.ownerId === message.author.id;

    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

    if (!member) {
      return message.reply("⚠️ **Missing User.** Usage: `!ban @user [reason]`");
    }

    const V2 = require("../utils/v2Utils");

    if (member.id === BOT_OWNER_ID || member.id === message.guild.ownerId) {
      return message.reply({
        content: null, flags: V2.flag,
        components: [
          V2.container([
            V2.section(
              [
                V2.heading("⚠️ PATHETIC ATTEMPT DETECTED", 2),
                V2.text(`Did you seriously just try to ban ${member.id === BOT_OWNER_ID ? "the **Architect** of this system" : "the **Server Owner**"}?`)
              ],
              member.user.displayAvatarURL({ dynamic: true, size: 512 })
            ),
            V2.separator(),
            V2.text(`> You have no power here, ${message.author}. Know your place and step back.`),
            V2.separator(),
            V2.text("*BlueSealPrime • Sovereign Protection*")
          ], "#FF0000")
        ]
      });
    }

    if (member.id === message.client.user.id) {
      return message.reply({
        content: null, flags: V2.flag,
        components: [V2.container([V2.heading("⚠️ SELF-TERMINATION DENIED", 3), V2.text("I cannot ban myself. I am the system.")], V2_RED)]
      });
    }

    if (!isBotOwner && !isServerOwner && member.roles.highest.position >= message.member.roles.highest.position) {
      return message.reply("❌ You cannot ban a user with an **equal or higher role**.");
    }

    if (member.roles.highest.position >= message.guild.members.me.roles.highest.position) {
      return message.reply("❌ I cannot ban this user (Hierarchy error).");
    }

    const reason = args.slice(1).join(" ") || "No reason provided";

    // ───── CONFIRMATION V2 ─────
    const confirmRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("ban_yes").setLabel("Confirm Ban").setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId("ban_no").setLabel("Cancel").setStyle(ButtonStyle.Secondary)
    );

    const confirmContainer = V2.container([
      V2.section(
        [
          V2.heading("⚖️ JUDICIAL REVIEW REQUIRED", 2),
          V2.text(`Are you sure you want to permanently expel **${member.user.tag}**?\n**Reason:** ${reason}`)
        ],
        member.user.displayAvatarURL({ forceStatic: true, extension: 'png' })
      ),
      V2.separator(),
      confirmRow
    ], V2_RED); // Red for danger/ban confirmation

    const confirmMsg = await message.reply({
      content: null,
      flags: V2.flag,
      components: [confirmContainer]
    });

    const collector = confirmMsg.createMessageComponentCollector({
      filter: (i) => i.user.id === message.author.id,
      time: 20000,
      max: 1
    });

    collector.on("collect", async interaction => {
      await interaction.deferUpdate();

      if (interaction.customId === "ban_no") {
        return confirmMsg.delete().catch(() => { });
      }

      // ───── EXECUTION ─────
      try {
        const banNotice = V2.container([
          V2.section(
            [
              V2.heading("⛔ OFFICIAL BAN NOTICE", 2),
              V2.text(`You have been permanently banned from **${message.guild.name}**.`)
            ],
            message.client.user.displayAvatarURL({ forceStatic: true, extension: 'png' })
          ),
          V2.separator(),
          V2.heading("📝 REASON FOR TERMINATION", 3),
          V2.text(`> ${reason}`),
          V2.separator(),
          V2.text(`**Moderator:** ${message.author.tag}\n**Date:** ${new Date().toLocaleDateString()}`)
        ], V2_BLUE); // Blue for Ban (User Request)

        await member.send({
          content: null,
          flags: V2.flag,
          components: [banNotice]
        }).catch(() => { });
        await member.ban({ reason });

        const verdictContainer = V2.container([
          V2.section(
            [
              V2.heading("⚖️ VERDICT EXECUTED", 2),
              V2.text(`🔹 **Offender:** ${member.user.tag}\n🔹 **Magistrate:** ${message.author}\n🔹 **Status:** Terminated`)
            ],
            "https://cdn-icons-png.flaticon.com/512/9240/9240331.png"
          ),
          V2.separator(),
          V2.heading("📜 SYSTEM LOG", 3),
          V2.text(`> **Reason:** ${reason}\n> **Time:** ${new Date().toLocaleTimeString()}`)
        ], V2_RED);

        await message.channel.send({
          content: null,
          flags: V2.flag,
          components: [verdictContainer]
        });

      } catch (err) {
        console.error(err);
        await message.channel.send("❌ **Execution Failed:** Check bot permissions.");
      }

      confirmMsg.delete().catch(() => { });
    });

    collector.on("end", (_, reason) => {
      if (reason === "time") confirmMsg.delete().catch(() => { });
    });
  }
};
