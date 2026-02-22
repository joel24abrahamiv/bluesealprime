const V2 = require("../utils/v2Utils");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE } = require("../config");

module.exports = {
  name: "help",
  description: "Shows premium interactive help with a spacious blue theme using CV2",
  aliases: ["h"],

  async execute(message, args, source) {
    const fromMention = source === "mention";
    const totalCommands = message.client.commands.size;
    const clientUser = message.client.user;

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

    // Simple Guide Content
    const guideContent = [
      V2.heading("🛡️ BLUESEALPRIME GUIDE", 3),
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
          V2.text("> 🔹 **!lock [reason]**\n> *Restrict all message flow in the current sector.*\n> 🔹 **!unlock**\n> *Restore standard communication permissions.*\n> 🔹 **!purge <amount>** `[clear]`\n> *Bulk sanitize up to 100 recent transmissions.*\n> 🔹 **!slowmode <time>**\n> *Set channel message cooldown.*\n> 🔹 **!stick <msg>** `[sticky, stickymsg]`\n> *📌 Pin a message to the bottom of the chat.*\n> 🔹 **!locksound**\n> *Disable soundboard usage for everyone.*\n> 🔹 **!unlocksound**\n> *Enable soundboard usage for everyone.*\n> 🔹 **!lockvc** / **!unlockvc**\n> *Lock or unlock current voice channel access.*"),
          V2.heading("🛠️ [ CHANNEL_MANAGEMENT_PROTOCOLS ]", 3),
          V2.text("> 🔹 **!createch <name> [text|voice]**\n> *Initialize a brand new transmission sector.*\n> 🔹 **!deletech** `[removech]`\n> *Decommission the current active channel.*\n> 🔹 **!deletevc** `[delvc]`\n> *Decommission the current voice channel.*\n> 🔹 **!renamech <name>**\n> *Modify the sector identifier.*\n> 🔹 **!renamevc <name>**\n> *Modify the voice sector identifier.*\n> 🔹 **!chperm <user|role> <allow|deny> <view|send>**\n> *Reconfigure sector access permissions.*")
        ]
      },
      {
        label: "Role Dynamics",
        value: "roles",
        emoji: "🔹",
        description: "Initialize Role Management Interface",
        content: [
          V2.heading("💎 ROLE DYNAMICS [ BETA ]", 2),
          V2.heading("📊 [ ANALYTICS_STREAM ]", 3),
          V2.text("> 🔹 **!roleinfo <role>** `[rinfo, role]`\n> *Retrieve detailed data metrics for a specific role.*"),
          V2.heading("🔄 [ DELEGATION_STREAM ]", 3),
          V2.text("> 🔹 **!addrole <user> <role>**\n> *Assign a specific server identity to a member.*\n> 🔹 **!removerole <user> <role>**\n> *Strip a member of a specific role identity.*\n> 🔹 **!temprole <user> <role> <time>**\n> *Grant time-limited role access (e.g., 1d, 1w).*\n> 🔹 **!autorole <role>**\n> *Configure automatic role assignment on join.*\n> 🔹 **!roleperm <role> <add|remove> <perm>** `[rperm]`\n> *Modify specific permissions for a role.*"),
          V2.heading("⚙️ [ REGISTRY_MODIFICATION ]", 3),
          V2.text("> 🔹 **!createrole <name> [hex]**\n> *Initialize a brand new role with custom parameters.*\n> 🔹 **!deleterole <role>**\n> *Decommission an existing role from the registry.*\n> 🔹 **!rolecopy <role>**\n> *Duplicate an existing role structure.*"),
          V2.heading("🎭 [ REACTION_ROLES ]", 3),
          V2.text("> 🔹 **!reactionrole create <#channel> <title>** `[rr]`\n> *Create a self-assign reaction role panel.*\n> 🔹 **!reactionrole add <msgID> <emoji> <role>**\n> *Add a role to an existing panel.*")
        ]
      },
      {
        label: "General Utility",
        value: "utils",
        emoji: "💠",
        description: "Initialize General Purpose Utilities",
        content: [
          V2.heading("📡 GENERAL UTILITY [ GAMMA ]", 2),
          V2.heading("📢 [ BROADCAST_LINK ]", 3),
          V2.text("> 🔹 **!say <content>**\n> *Bot transmission through standard or embed format.*\n> 🔹 **!announce <content>**\n> *Official system broadcast for high-importance updates.*"),
          V2.heading("💾 [ DATA_INGESTION_LINK ]", 3),
          V2.text("> 🔹 **!botinfo** `[bi, binfo]`\n> *Comprehensive bot dashboard & system status.*\n> 🔹 **!ping** `[p, latency]`\n> *Check API and host connection latency.*\n> 🔹 **!serverinfo**\n> *Fetch comprehensive guild analytics pathing.*\n> 🔹 **!userinfo [@user]**\n> *Detailed security scan of a member profile.*\n> 🔹 **!avatar [@user]**\n> *Retrieve high-definition visualization of a user profile.*\n> 🔹 **!banner [@user]**\n> *Retrieve high-definition visualization of a user banner.*\n> 🔹 **!poll <Question> | <Opt1> | <Opt2>** `[createpoll]`\n> *Create an interactive poll.*\n> 🔹 **!suggest <idea>** `[suggestion, idea]`\n> *Submit a suggestion to the server.*")
        ]
      },
      {
        label: "Security Systems",
        value: "security",
        emoji: "🛡️",
        description: "Initialize Security & System Configs",
        content: [
          V2.heading("🔐 SECURITY SYSTEMS [ DELTA ]", 2),
          V2.heading("⚙️ [ AUTOMATION_SETUP_UNIT ]", 3),
          V2.text("> 🔹 **!ticketsetup**\n> *Initialize the secure support ticketing interface.*\n> 🔹 **!log <type> <channel>** `[logs, logging, logset]`\n> *Configure the multi-stream event logging system.*\n> 🔹 **!automod <link|spam>** `[am, protection]`\n> *Toggle Anti-Link or Anti-Spam protection.*\n> 🔹 **!welcome <channel>**\n> *Configure the premium entry greeting interface.*\n> 🔹 **!left <channel>** `[lv, leave]`\n> *Configure the premium departure notification system.*\n> 🔹 **!setupverify @role #channel**\n> *Initialize verification panel.*"),
          V2.heading("🛡️ [ HIGH_LEVEL_DEFENSE ]", 3),
          V2.text("> 🔹 **!whitelist <user>** `[wl, wllist]`\n> *Authorize trusted personnel (Bypass Limits).*\n> 🔹 **!blacklist <user>** `[bl]`\n> *Permanently revoke access to bot systems.*\n> 🔹 **!antiraid**\n> *Emergency server lockdown protocol.*")
        ]
      },
      {
        label: "Developer Info",
        value: "devinfo",
        emoji: "👑",
        description: "View Bot Credits & Developer Data",
        content: [
          V2.heading("🛡️ BLUESEALPRIME: THE ARCHITECTS", 2),
          V2.heading("[ CORE_DEVELOPER ]", 3),
          V2.text(`> 👤 **Lead Developer:** <@${BOT_OWNER_ID}>\n> 🛠️ **System:** Node.js / Discord.js v14\n> 🧩 **Architecture:** BlueSeal Sovereign v2.1`),
          V2.heading("[ THE_ARCHITECT_GUIDE ]", 3),
          V2.text(`> 🧠 **Architect's Guide:** <@1327564898460242015>\n> *"The visionary who taught me the foundations of BlueSealPrime. Respect to the mentor."*`),
          V2.heading("[ OPERATIONAL_STRENGTH ]", 3),
          V2.text(`> 🚀 **Environment:** Quantum-Ready Cloud Node\n> 🛡️ **Anti-Nuke:** Military-Grade Interrogation Protocols\n> ⚡ **Heartbeat:** ${message.client.ws.ping}ms`)
        ]
      },
      {
        label: "Voice Management",
        value: "voice",
        emoji: "🔊",
        description: "Control voice channels and members",
        content: [
          V2.heading("🔊 VOICE OPERATIONS", 2),
          V2.heading("🎤 [ VOICE_CONTROL_UNIT ]", 3),
          V2.text("> 🔹 **!vmute <@user>**\n> *Server mute user in Voice Channel.*\n> 🔹 **!vunmute <@user>**\n> *Server unmute user in Voice Channel.*\n> 🔹 **!vmuteall**\n> *Mute everyone in your Voice Channel.*\n> 🔹 **!vunmuteall**\n> *Unmute everyone in your Voice Channel.*\n> 🔹 **!muv <@user> [channel]**\n> *Move user to Void or specified channel.*\n> 🔹 **!muvu <@user>**\n> *Un-Void/Restore user to original VC.*\n> 🔹 **!vmoveall <#channel>** `[moveall, massmove]`\n> *Mass move everyone in current VC to another.*\n> 🔹 **!vdefend <@user>**\n> *Protect user from being moved or disconnected.*\n> 🔹 **!vundefend <@user>**\n> *Remove movement protection.*")
        ]
      },
      {
        label: "Quarantine Management",
        value: "quarantine",
        emoji: "☣️",
        description: "Isolation and containment systems",
        content: [
          V2.heading("☣️ QUARANTINE PROTOCOLS", 2),
          V2.heading("🛡️ [ ISOLATION_UNIT ]", 3),
          V2.text("> 🔹 **!qr <@user> [reason]** `[quarantine]`\n> *Isolate user in Quarantine Zone. Revoke permissions.*\n> 🔹 **!uq <@user>** `[unquarantine]`\n> *Release user from quarantine.*"),
          V2.heading("🛡️ [ BASIC_MODERATION ]", 3),
          V2.text("> 🔹 **!warn <@user>**\n> *Issue official warning.*\n> 🔹 **!mute <@user>**\n> *Timeout/Silence user.*")
        ]
      },
      {
        label: "Logging Module",
        value: "logging",
        emoji: "📝",
        description: "Configure Server Logging Channels",
        content: [
          V2.heading("📝 LOGGING SYSTEMS [ EPSILON ]", 2),
          V2.heading("⚙️ [ SYSTEM_LOGS ]", 3),
          V2.text("> 🔹 **!log mod <#channel>**\n> *Moderation Actions.*\n> 🔹 **!log message <#channel>**\n> *Deleted/Edited Messages.*\n> 🔹 **!log member <#channel>**\n> *Joins/Leaves.*\n> 🔹 **!log voice <#channel>**\n> *Voice Activity.*\n> 🔹 **!log role <#channel>**\n> *Role Updates.*\n> 🔹 **!log server <#channel>**\n> *Server Changes.*"),
          V2.heading("🛡️ [ SECURITY_LOGS ]", 3),
          V2.text("> 🔹 **!log antinuke <#channel>**\n> *Anti-Nuke Triggers.*\n> 🔹 **!log automod <#channel>**\n> *Auto-Mod Violations.*\n> 🔹 **!log whitelist <#channel>**\n> *Whitelist Changes.*\n> 🔹 **!log admin <#channel>**\n> *Admin Command Usage.*"),
          V2.heading("📂 [ DATA_LOGS ]", 3),
          V2.text("> 🔹 **!log file <#channel>**\n> *File Uploads.*\n> 🔹 **!log ticket <#channel>**\n> *Ticket Transcripts.*\n> 🔹 **!log invite <#channel>**\n> *Invite Tracking.*")
        ]
      },
      {
        label: "Administrator Controls",
        value: "admin",
        emoji: "⚡",
        description: "Absolute Power & Sovereign Management (Admin Only)",
        content: [
          V2.heading("⚡ ABSOLUTE POWER CONTROLS [ OMEGA ]", 2),
          V2.heading("👥 [ MASS_POPULATION_CONTROL ]", 3),
          V2.text("> 🔹 **System Locked:** *Mass operations are hidden for security.*\n> 🔹 **!serverlock**\n> *Lock the ENTIRE server.*\n> 🔹 **!serverunlock**\n> *Unlock the ENTIRE server.*"),
          V2.heading("👑 [ SOVEREIGN_MANAGEMENT ]", 3),
          V2.text("> 🔹 **!addowner <@user>**\n> *Appoint a local Extra Owner (Acting Owner).*\n> 🔹 **!delowner <@user>**\n> *Revoke sovereign authority from an individual.*\n> 🔹 **!listowners** `[authority]`\n> *View the server's authority hierarchy registry.*"),
          V2.heading("🎭 [ SYSTEM_IDENTITY ]", 3),
          V2.text("> 🔹 **!mimic [on|off]**\n> *Adopts the server's name & identity (Server Icon/Banner).*\n> 🔹 **!setguildavatar <url>**\n> *Modify the server's official icon.*\n> 🔹 **!setguildbanner <url>**\n> *Modify the server's official banner.*")
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
        new ButtonBuilder()
          .setCustomId("help_home")
          .setLabel("Home")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(pageIndex === 0),
        new ButtonBuilder()
          .setCustomId("help_prev")
          .setLabel("Previous")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(pageIndex === 0),
        new ButtonBuilder()
          .setCustomId("help_stop")
          .setLabel("Stop")
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId("help_next")
          .setLabel("Next")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(pageIndex === categories.length - 1)
      );

      const menuRow = new ActionRowBuilder().addComponents(selectMenu);
      return V2.container([
        // Common Header for ALL pages
        V2.section(
          [
            V2.text(`**BlueSeal | Armed**`),
            V2.heading("🛡️ BLUESEALPRIME INFORMATION PANEL", 2)
          ],
          V2.botAvatar(message)
        ),
        V2.text(`\`\`\`yml\nTime: ${new Date().toLocaleTimeString()}\nExecuted by: @${message.author.username}\n\`\`\``),
        V2.separator(),

        // Category specific content
        ...categories[pageIndex].content,

        V2.separator(),
        menuRow,
        buttons
      ], V2_BLUE); // Blue theme
    };

    const initialMessage = await message.reply({
      content: null,
      flags: V2.flag,
      components: [createV2Container(currentPage)]
    });

    const collector = initialMessage.createMessageComponentCollector({
      filter: (i) => i.user.id === message.author.id,
      time: 300000 // 5 minutes
    });

    collector.on("collect", async (interaction) => {
      if (interaction.customId === "help_select") {
        currentPage = categories.findIndex(c => c.value === interaction.values[0]);
      } else if (interaction.customId === "help_home") {
        currentPage = 0;
      } else if (interaction.customId === "help_prev") {
        currentPage--;
      } else if (interaction.customId === "help_next") {
        currentPage++;
      } else if (interaction.customId === "help_stop") {
        return collector.stop("user_stopped");
      }

      await interaction.update({
        components: [createV2Container(currentPage)]
      });
    });

    collector.on("end", async (collected, reason) => {
      if (reason === "user_stopped") {
        await initialMessage.delete().catch(() => { });
      } else {
        // Just leave it as is but disabled? Or delete?
        // Let's try to disable if possible, though V2 disabling is a bit different.
        // For now, let's keep it simple.
      }
    });
  }
};
