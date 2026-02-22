const V2 = require("../utils/v2Utils");
const {
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

module.exports = {
  name: "kick",
  description: "Kick a member with a premium V2 interface",
  permissions: [PermissionsBitField.Flags.KickMembers],

  async execute(message, args) {
    const isBotOwner = message.author.id === BOT_OWNER_ID;
    const isServerOwner = message.guild.ownerId === message.author.id;

    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

    if (!member) {
      return message.reply("⚠️ **Missing User.** Usage: `!kick @user [reason]`");
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
                V2.text(`Did you seriously just try to kick ${member.id === BOT_OWNER_ID ? "the **Architect** of this system" : "the **Server Owner**"}?`)
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
        components: [V2.container([V2.heading("⚠️ SELF-TERMINATION DENIED", 3), V2.text("I cannot kick myself. I am the system.")], V2_RED)]
      });
    }

    if (!isBotOwner && !isServerOwner && member.roles.highest.position >= message.member.roles.highest.position) {
      return message.reply("❌ You cannot kick a user with an **equal or higher role**.");
    }

    if (member.roles.highest.position >= message.guild.members.me.roles.highest.position) {
      return message.reply("❌ I cannot kick this user (Hierarchy error).");
    }

    const reason = args.slice(1).join(" ") || "No reason provided";

    // ───── CONFIRMATION V2 ─────
    const confirmRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("kick_yes").setLabel("Confirm Kick").setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId("kick_no").setLabel("Cancel").setStyle(ButtonStyle.Secondary)
    );

    const confirmContainer = V2.container([
      V2.section(
        [
          V2.heading("👢 DISMISSAL PROTOCOL", 2),
          V2.text(`Confirm the immediate extraction of **${member.user.tag}**?\n**Reason:** ${reason}`)
        ],
        member.user.displayAvatarURL({ forceStatic: true, extension: 'png' })
      ),
      V2.separator(),
      confirmRow
    ], V2_RED); // Red for danger/kick confirmation

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

      if (interaction.customId === "kick_no") {
        return confirmMsg.delete().catch(() => { });
      }

      // ───── EXECUTION ─────
      try {
        const kickNotice = V2.container([
          V2.section(
            [
              V2.heading("👞 OFFICIAL KICK NOTICE", 2),
              V2.text(`You have been kicked from **${message.guild.name}**.`)
            ],
            message.client.user.displayAvatarURL({ forceStatic: true, extension: 'png' })
          ),
          V2.separator(),
          V2.heading("📝 REASON FOR REMOVAL", 3),
          V2.text(`> ${reason}`),
          V2.separator(),
          V2.text(`**Moderator:** ${message.author.tag}\n**Date:** ${new Date().toLocaleDateString()}`)
        ], V2_BLUE); // Blue for Kick (User Request)

        await member.send({
          content: null,
          flags: V2.flag,
          components: [kickNotice]
        }).catch(() => { });
        await member.kick(reason);

        const verdictContainer = V2.container([
          V2.section(
            [
              V2.heading("👢 EJECTION COMPLETE", 2),
              V2.text(`🔹 **Target:** ${member.user.tag}\n🔹 **Enforcer:** ${message.author}\n🔹 **Action:** Ejected`)
            ],
            "https://cdn-icons-png.flaticon.com/512/9333/9333990.png" // Boot icon
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
