const V2 = require("../utils/v2Utils");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

module.exports = {
  name: "help",
  description: "Shows premium interactive help with a spacious blue theme using CV2",
  aliases: ["h"],

  async execute(message, args, commandName) {
    const EXECUTION_START_TIME = Date.now();
    const mainProcess = require("../index");

    if (!message || !message.guild) return;

    try {
      const fromMention = commandName === "mention";
      const totalCommands = message.client.commands.size;

      // Home Page Content
      const homeContent = [
        V2.heading("BlueSealPrime", 3),
        V2.text("*Welcome to BlueSealPrime NextGen. Antinuke. Automods. Security Systems!*"),
        V2.text(`🔵 **Total Commands:** ${totalCommands}+`),
        V2.text("🛡️ **Changelog:** 2.1.0 #BlueSealPrime"),
        V2.text("🈯 **FrameWork:** Discord.js @Latest"),
        V2.text(`🛠️ **Developed And Maintained by** <@${BOT_OWNER_ID}>`),
        V2.heading("🔑 COMMAND ACCESS PROTOCOLS", 3),
        V2.text(
          "> **Global Access:** `!` or `/` (e.g., `!help` or `/help`)\n" +
          "> **Sovereign Access:** `No Prefix` (Owners only)\n" +
          "> *Server Owners & Bot Owners can execute commands without any prefix.*"
        ),
        V2.heading("🔵 How To Use BlueSealPrime !!", 3),
        V2.text("> Click On The Drop Down Selection Menu For Instant Access Of Available Commands Based On Their Categories\n> To Know More About Features Navigate Using Next. Previous Buttons\n> Click Stop Close and Exit Help Menu !!"),
        V2.heading("🔵 Features of BlueSealPrime !!", 3),
        V2.text("> **Advanced Antinuke And Unbypassable Security Systems**\n> **Automods With Intelligent Quarantine Systems Making The Server More Secure**\n> **Server Maintenance Covering everything For your server AutoMods Antinuke Role Management.**\n> **NextGen Server Moderations by BlueSealPrime For your server**")
      ];

      const guideContent = [
        V2.heading("🛡️ BLUESEAL_PRIME GUIDE", 3),
        V2.text("The ultimate solution for discord server security. Protect your community with advanced Anti-Nuke systems, automated moderation filters, and comprehensive management tools."),
        V2.text(`**Developed by <@${BOT_OWNER_ID}> to ensure your server remains safe and organized.**`),
        V2.text("**Select a module below to view details:**\n· 🛡️ **Anti Nuke & Security**\n· 🔨 **AutoMods & Filters**\n· 🔊 **Temp Voice Channels**\n· 🎭 **Role Management**\n· 🎙️ **Voice Management**\n· 🎫 **Ticket System**\n· 🛡️ **General Info** (Ping, User, Stats)\n· 👑 **Developer Info** (Credits)")
      ];

      const categories = [
        {
          label: "BlueSealPrime Home",
          value: "home",
          emoji: "🏠",
          description: "Return to Home Page",
          content: fromMention ? guideContent : homeContent
        },
        {
          label: "Moderation Module",
          value: "moderation",
          emoji: "🔵",
          description: "Initialize Moderation Command Set",
          content: [
            V2.heading("🛡️ MODERATION SET [ ALPHA ]", 2),
            V2.heading("👤 [ USER_CONTROL_PROTOCOLS ]", 3),
            V2.text("> 🔹 **!ban <user> [reason]**\n> *Permanently remove a threat from the server.*\n> 🔹 **!kick <user> [reason]**\n> *Eject a user from the guild immediately.*\n> 🔹 **!timeout <user> <time> [reason]**\n> *Apply a temporary communication restriction.*\n> 🔹 **!unban <userID>**\n> *Restore access for a previously banned identifier.*\n> 🔹 **!warn <user> [reason]**\n> *Issue an official violation warning.*\n> 🔹 **!warnings <user> [clear]**\n> *View or expunge user infraction history.*"),
            V2.heading("📺 [ CHANNEL_INTEGRITY_PROTOCOLS ]", 3),
            V2.text("> 🔹 **!lock [reason]**\n> *Restrict all message flow in the current sector.*\n> 🔹 **!unlock**\n> *Restore standard communication permissions.*\n> 🔹 **!purge <amount>** `[clear]`\n> *Bulk sanitize up to 100 recent transmissions.*\n> 🔹 **!slowmode <time>**\n> *Set channel message cooldown.*\n> 🔹 **!stick <msg>**\n> *📌 Pin a message to the bottom of the chat.*\n> 🔹 **!lockvc** / **!unlockvc**\n> *Lock or unlock voice channel access.*")
          ]
        },
        {
          label: "Security Systems",
          value: "security",
          emoji: "🛡️",
          description: "Initialize Security & System Configs",
          content: [
            V2.heading("🛡️ SECURITY SYSTEMS [ DELTA ]", 2),
            V2.heading("⚙️ [ AUTOMATION_SETUP_UNIT ]", 3),
            V2.text("> 🔹 **!ticketsetup**\n> *Initialize the secure support ticketing interface.*\n> 🔹 **!log <type> <channel>**\n> *Configure the multi-stream event logging system.*\n> 🔹 **!automod <link|spam>**\n> *Toggle Anti-Link or Anti-Spam protection.*\n> 🔹 **!welcome <channel>**\n> *Configure the premium entry greeting interface.*\n> 🔹 **!setupverify @role #channel**\n> *Initialize verification panel.*"),
            V2.heading("🛡️ [ CLEARANCE_PROTOCOLS ]", 3),
            V2.text("> 🔹 **!blacklist <user>** `[bl]`\n> *Permanently revoke access to bot systems.*\n> 🔹 **!spmbl list|remove** `[sbl]`\n> *Manage the automated spam containment registry.*")
          ]
        },
        {
          label: "Administrator Controls",
          value: "admin",
          emoji: "⚡",
          description: "Absolute Power & Sovereign Management",
          content: [
            V2.heading("⚡ ABSOLUTE POWER CONTROLS [ OMEGA ]", 2),
            V2.heading("🛡️ [ DEFENSE_COMMAND_CENTER ]", 3),
            V2.text("> 🔹 **!antinuke <on|off|status|wl>**\n> *Configure Sovereign Shield anti-destruction protocols.*\n> 🔹 **!irondome**\n> *Configure automated server security and lockdowns.*\n> 🔹 **!sealauthority <on|off|status>** `[sa]`\n> *Initialize or dissolve the 5-tier security matrix.*\n> 🔹 **!antiraid <on|off|config|unlock>**\n> *Manage high-speed join-flood countermeasures.*\n> 🔹 **!whitelist <user>** `[wl]`\n> *Grant immunity to security protocols.*"),
            V2.heading("👑 [ SOVEREIGN_MANAGEMENT ]", 3),
            V2.text("> 🔹 **!addowner <@user>**\n> *Appoint a local Extra Owner (Acting Owner).*\n> 🔹 **!delowner <@user>**\n> *Revoke sovereign authority.*\n> 🔹 **!serverlock / !serverunlock**\n> *Freeze or restore all server communication.*"),
            V2.heading("🎭 [ SYSTEM_IDENTITY ]", 3),
            V2.text("> 🔹 **!mimic [on|off]**\n> *Adopts the server's name & identity.*\n> 🔹 **!setguildavatar / !setguildbanner**\n> *Modify server visual descriptors.*")
          ]
        },
        {
          label: "Voice Operations",
          value: "voice",
          emoji: "🔊",
          description: "Voice Control & Movement",
          content: [
            V2.heading("🔊 VOICE OPERATIONS [ EPSILON ]", 2),
            V2.heading("🎤 [ CHANNEL_CONTROL ]", 3),
            V2.text("> 🔹 **!vmute / !vunmute <@user>**\n> *Server-side voice restriction control.*\n> 🔹 **!vmuteall / !vunmuteall**\n> *Mass voice channel governance.*\n> 🔹 **!muv <@user> [channel]**\n> *Relocate user to specified channel or the Void.*\n> 🔹 **!muvu <@user>**\n> *Restore user from the Void to their original VC.*\n> 🔹 **!vdefend <@user>**\n> *Protect user from unauthorized disconnects/moves.*")
          ]
        },
        {
          label: "Logging Module",
          value: "logging",
          emoji: "📝",
          description: "Audit & Stream Configurations",
          content: [
            V2.heading("📝 AUDIT LOGGING SYSTEMS", 2),
            V2.text("> **!log mod <#channel>** - *Mod Actions*\n> **!log message <#channel>** - *Deletions/Edits*\n> **!log member <#channel>** - *Joins/Leaves*\n> **!log voice <#channel>** - *VC Activity*\n> **!log security <#channel>** - *Anti-Nuke Triggers*\n> **!log file <#channel>** - *File Uploads*")
          ]
        },
        {
          label: "Developer Info",
          value: "devinfo",
          emoji: "👑",
          description: "Bot Meta Data & Credits",
          content: [
            V2.heading("🛡️ BLUESEAL_PRIME: THE ARCHITECTS", 2),
            V2.heading("[ CORE_DEVELOPER ]", 3),
            V2.text(`👤 **Lead Developer:** **@GT!**\n🛠️ **System:** Node.js / Discord.js v14\n🧩 **Architecture:** BlueSeal Sovereign v2.1`),
            V2.heading("[ THE_ARCHITECT_GUIDE ]", 3),
            V2.text(`🧠 **Architect's Guide:** <@1327564898460242015>\n*"The visionary who taught me the foundations of BlueSealPrime. Respect to the mentor."*`),
            V2.heading("[ OPERATIONAL_STRENGTH ]", 3),
            V2.text(`🚀 **Environment:** Quantum-Ready Cloud Node\n🛡️ **Anti-Nuke:** Military-Grade Interrogation Protocols\n⚡ **Heartbeat:** ${message.client.ws.ping}ms`)
          ]
        }
      ];

      let currentPage = 0;

      const createV2Container = (pageIndex) => {
        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId("help_select")
          .setPlaceholder("💠 INITIALIZE COMMAND MODULE")
          .addOptions(categories.map((cat, index) => ({
            label: cat.label,
            value: cat.value,
            emoji: cat.emoji,
            description: cat.description,
            default: index === pageIndex
          })));

        const buttons = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("help_home").setLabel("Home").setStyle(ButtonStyle.Secondary).setDisabled(pageIndex === 0),
          new ButtonBuilder().setCustomId("help_prev").setLabel("Previous").setStyle(ButtonStyle.Secondary).setDisabled(pageIndex === 0),
          new ButtonBuilder().setCustomId("help_stop").setLabel("Stop").setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId("help_next").setLabel("Next").setStyle(ButtonStyle.Secondary).setDisabled(pageIndex === categories.length - 1)
        );

        return V2.container([
          V2.section([V2.text(`**BlueSeal | Armed**`), V2.heading("🛡️ BLUESEALPRIME INFORMATION PANEL", 2)], V2.botAvatar(message)),
          V2.text(`\`\`\`yml\nTime: ${new Date().toLocaleTimeString()}\nExecuted by: @${message.author.username}\n\`\`\``),
          V2.separator(),
          ...categories[pageIndex].content,
          V2.separator(),
          new ActionRowBuilder().addComponents(selectMenu),
          buttons
        ], V2_BLUE);
      };

      const initialMessage = await message.reply({ components: [createV2Container(currentPage)], flags: V2.flag });

      // Auto-delete after 30 seconds
      setTimeout(async () => {
        try {
          await initialMessage.edit({
            components: [V2.container([V2.text("🏁 **Help Menu Closed.**\n*If you want to open it again, run the command once more.*")], "#000000")]
          });
          setTimeout(() => initialMessage.delete().catch(() => { }), 5000);
        } catch (e) { }
      }, 30000);

      const collector = initialMessage.createMessageComponentCollector({
        filter: (i) => i.user.id === message.author.id,
        time: 300000
      });

      collector.on("collect", async (interaction) => {
        if (interaction.customId === "help_select") currentPage = categories.findIndex(c => c.value === interaction.values[0]);
        else if (interaction.customId === "help_home") currentPage = 0;
        else if (interaction.customId === "help_prev") currentPage--;
        else if (interaction.customId === "help_next") currentPage++;
        else if (interaction.customId === "help_stop") return collector.stop("user_stopped");
        await interaction.update({ components: [createV2Container(currentPage)], flags: V2.flag });
      });

      collector.on("end", async (collected, reason) => {
        if (reason === "user_stopped") {
          await initialMessage.edit({
            components: [V2.container([V2.text("🏁 **Help Menu Closed.**\n*If you want to open it again, run the command once more.*")], "#000000")]
          }).catch(() => { });
          setTimeout(() => initialMessage.delete().catch(() => { }), 3000);
        }
      });

      if (global.SMS_SERVICE) {
        global.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "help", Date.now() - EXECUTION_START_TIME, "SUCCESS").catch(() => { });
      }
    } catch (err) {
      console.error(err);
    }
  }
};