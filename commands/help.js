const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ComponentType } = require("discord.js");
const { EMBED_COLOR } = require("../config");

module.exports = {
  name: "help",
  description: "Shows premium interactive help with a spacious blue theme",
  aliases: ["h"],

  async execute(message, args, source) {
    const fromMention = source === "mention";
    const totalCommands = message.client.commands.size;
    const clientUser = message.client.user;
    const { BOT_OWNER_ID } = require("../config");

    // 1. RICH DASHBOARD (For !help command)
    const richHomeEmbed = new EmbedBuilder()
      .setColor("#0099FF") // Blue Theme
      .setTitle("🛡️ BlueSealPrime Information Panel")
      .setAuthor({ name: "BlueSeal | Armed", iconURL: clientUser.displayAvatarURL() })
      .setThumbnail(clientUser.displayAvatarURL({ dynamic: true, size: 512 }))
      .setDescription(
        `\`\`\`yml\n` +
        `Time: ${new Date().toLocaleTimeString()}\n` +
        `Executed by: @${message.author.username}\n` +
        `\`\`\`\n` +
        `## **BlueSealPrime**\n` +
        `*Welcome to BlueSealPrime NextGen. Antinuke. Automods. Security Systems!*\n\n` +
        `🔵 **Total Commands:** ${totalCommands}+\n` +
        `🛡️ **Changelog:** 2.0.0 #BlueSealPrime\n` +
        `🈯 **FrameWork:** Discord.js @Latest\n` +
        `🛠️ **Developed And Maintained by** <@${BOT_OWNER_ID}>\n\n` +

        `### 🔵 **How To Use BlueSealPrime !!**\n` +
        `> Click On The Drop Down Selection Menu For Instant Access Of Available Commands Based On Their Categories\n` +
        `> To Know More About Features Navigate Using Next. Previous Buttons\n` +
        `> Click Stop Close and Exit Help Menu !!\n\n` +

        `### 🔵 **Features of BlueSealPrime !!**\n` +
        `> **Advanced Antinuke And Unbypassable Security Systems**\n` +
        `> **Automods With Intelligent Quarantine Systems Making The Server More Secure**\n` +
        `> **Server Maintenance Covering everything For your server AutoMods Antinuke Role Management.**\n` +
        `> **NextGen Server Moderations by BlueSealPrime For your server**`
      )
      .setFooter({ text: "Select a category from the dropdown to get started!", iconURL: message.author.displayAvatarURL() })
      .setTimestamp();

    // 2. SIMPLE GUIDE (For @Bot Mention)
    const simpleGuideEmbed = new EmbedBuilder()
      .setColor("#0099FF") // Blue Theme
      .setTitle("🛡️ BlueSealPrime Guide")
      .setAuthor({ name: "BlueSealPrime", iconURL: clientUser.displayAvatarURL() })
      .setThumbnail(clientUser.displayAvatarURL({ dynamic: true, size: 512 }))
      .setDescription(
        `### **🛡️ BlueSealPrime**\n` +
        `The ultimate solution for discord server security. Protect your community with advanced Anti-Nuke systems, automated moderation filters, and comprehensive management tools.\n\n` +
        `**Developed by <@${BOT_OWNER_ID}> to ensure your server remains safe and organized.**\n\n` +
        `**Select a module below to view details:**\n` +
        `· 🛡️ **Anti Nuke & Security**\n` +
        `· 🔨 **AutoMods & Filters**\n` +
        `· 🔊 **Temp Voice Channels**\n` +
        `· 🎭 **Role Management**\n` +
        `· 🎙️ **Voice Management**\n` +
        `· 🎫 **Ticket System**\n` +
        `· 🛡️ **General Info** (Ping, User, Stats)\n` +
        `· 👑 **Developer Info** (Credits)`
      )
      .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();

    // Command Categories Data
    const categories = [
      {
        label: "BlueSealPrime Home",
        value: "home",
        emoji: "🏠",
        description: "Return to Home Page",
        embed: fromMention ? simpleGuideEmbed : richHomeEmbed
      },
      {
        label: "Moderation Module",
        value: "moderation",
        emoji: "🔵",
        description: "Initialize Moderation Command Set",
        embed: new EmbedBuilder()
          .setColor(EMBED_COLOR)
          .setAuthor({ name: "🛡️ MODERATION SET [ ALPHA ]", iconURL: clientUser.displayAvatarURL() })
          .setDescription(
            `### 👤 **[ USER_CONTROL_PROTOCOLS ]**\n` +
            `> 🔹 **!ban <user> [reason]**\n` +
            `> *Permanently remove a threat from the server.*\n` +
            `> 🔹 **!kick <user> [reason]**\n` +
            `> *Eject a user from the guild immediately.*\n` +
            `> 🔹 **!timeout <user> <time> [reason]**\n` +
            `> *Apply a temporary communication restriction.*\n` +
            `> 🔹 **!unban <userID>**\n` +
            `> *Restore access for a previously banned identifier.*\n` +
            `> 🔹 **!warn <user> [reason]**\n` +
            `> *Issue an official violation warning.*\n\n` +

            `### 📺 **[ CHANNEL_INTEGRITY_PROTOCOLS ]**\n` +
            `> 🔹 **!lock [reason]**\n` +
            `> *Restrict all message flow in the current sector.*\n` +
            `> 🔹 **!unlock**\n` +
            `> *Restore standard communication permissions.*\n` +
            `> 🔹 **!purge <amount>** \`[clear]\`\n` +
            `> *Bulk sanitize up to 100 recent transmissions.*\n` +
            `> 🔹 **!slowmode <time>**\n` +
            `> *Set channel message cooldown.*\n` +
            `> 🔹 **!stick <msg>** \`[sticky, stickymsg]\`\n` +
            `> *📌 Pin a message to the bottom of the chat.*\n` +
            `> 🔹 **!locksound**\n` +
            `> *Disable soundboard usage for everyone.*\n` +
            `> 🔹 **!unlocksound**\n` +
            `> *Enable soundboard usage for everyone.*\n` +
            `> 🔹 **!lockvc** / **!unlockvc**\n` +
            `> *Lock or unlock current voice channel access.*\n\n` +

            `### 🛠️ **[ CHANNEL_MANAGEMENT_PROTOCOLS ]**\n` +
            `> 🔹 **!createch <name> [text|voice]**\n` +
            `> *Initialize a brand new transmission sector.*\n` +
            `> 🔹 **!deletech** \`[removech]\`\n` +
            `> *Decommission the current active channel.*\n` +
            `> 🔹 **!deletevc** \`[delvc]\`\n` +
            `> *Decommission the current voice channel.*\n` +
            `> 🔹 **!renamech <name>**\n` +
            `> *Modify the sector identifier.*\n` +
            `> 🔹 **!renamevc <name>**\n` +
            `> *Modify the voice sector identifier.*\n` +
            `> 🔹 **!chperm <user|role> <allow|deny> <view|send>**\n` +
            `> *Reconfigure sector access permissions.*`
          )
          .setThumbnail(clientUser.displayAvatarURL())
          .setFooter({ text: "PROTOCOL STATUS: AUTHORIZED • MODULE_BETA_INIT" })
      },
      {
        label: "Role Dynamics",
        value: "roles",
        emoji: "🔹",
        description: "Initialize Role Management Interface",
        embed: new EmbedBuilder()
          .setColor(EMBED_COLOR)
          .setAuthor({ name: "💎 ROLE DYNAMICS [ BETA ]", iconURL: clientUser.displayAvatarURL() })
          .setDescription(
            `### 📊 **[ ANALYTICS_STREAM ]**\n` +
            `> 🔹 **!roleinfo <role>** \`[rinfo, role]\`\n` +
            `> *Retrieve detailed data metrics for a specific role.*\n\n` +

            `### 🔄 **[ DELEGATION_STREAM ]**\n` +
            `> 🔹 **!addrole <user> <role>**\n` +
            `> *Assign a specific server identity to a member.*\n` +
            `> 🔹 **!removerole <user> <role>**\n` +
            `> *Strip a member of a specific role identity.*\n` +
            `> 🔹 **!temprole <user> <role> <time>**\n` +
            `> *Grant time-limited role access (e.g., 1d, 1w).*\n` +
            `> 🔹 **!autorole <role>**\n` +
            `> *Configure automatic role assignment on join.*\n` +
            `> 🔹 **!roleperm <role> <add|remove> <perm>** \`[rperm]\`\n` +
            `> *Modify specific permissions for a role.*\n\n` +

            `### ⚙️ **[ REGISTRY_MODIFICATION ]**\n` +
            `> 🔹 **!createrole <name> [hex]**\n` +
            `> *Initialize a brand new role with custom parameters.*\n` +
            `> 🔹 **!deleterole <role>**\n` +
            `> *Decommission an existing role from the registry.*\n` +
            `> 🔹 **!rolecopy <role>**\n` +
            `> *Duplicate an existing role structure.*\n\n` +

            `### 🎭 **[ REACTION_ROLES ]**\n` +
            `> 🔹 **!reactionrole create <#channel> <title>** \`[rr]\`\n` +
            `> *Create a self-assign reaction role panel.*\n` +
            `> 🔹 **!reactionrole add <msgID> <emoji> <role>**\n` +
            `> *Add a role to an existing panel.*`
          )
          .setThumbnail(clientUser.displayAvatarURL())
          .setFooter({ text: "PROTOCOL STATUS: AUTHORIZED • MODULE_GAMMA_INIT" })
      },
      {
        label: "General Utility",
        value: "utils",
        emoji: "💠",
        description: "Initialize General Purpose Utilities",
        embed: new EmbedBuilder()
          .setColor(EMBED_COLOR)
          .setAuthor({ name: "📡 GENERAL UTILITY [ GAMMA ]", iconURL: clientUser.displayAvatarURL() })
          .setDescription(
            `### 📢 **[ BROADCAST_LINK ]**\n` +
            `> 🔹 **!say <content>**\n` +
            `> *Bot transmission through standard or embed format.*\n` +
            `> 🔹 **!announce <content>**\n` +
            `> *Official system broadcast for high-importance updates.*\n\n` +

            `### 💾 **[ DATA_INGESTION_LINK ]**\n` +
            `> 🔹 **!ping** \`[p, latency]\`\n` +
            `> *Check API and host connection latency.*\n` +
            `> 🔹 **!serverinfo**\n` +
            `> *Fetch comprehensive guild analytics pathing.*\n` +
            `> 🔹 **!userinfo [@user]**\n` +
            `> *Detailed security scan of a member profile.*\n` +
            `> 🔹 **!avatar [@user]**\n` +
            `> *Retrieve high-definition visualization of a user profile.*\n` +
            `> 🔹 **!poll <Question> | <Opt1> | <Opt2>** \`[createpoll]\`\n` +
            `> *Create an interactive poll.*\n` +
            `> 🔹 **!suggest <idea>** \`[suggestion, idea]\`\n` +
            `> *Submit a suggestion to the server.*`
          )
          .setThumbnail(clientUser.displayAvatarURL())
          .setFooter({ text: "PROTOCOL STATUS: AUTHORIZED • MODULE_DELTA_INIT" })
      },
      {
        label: "Security Systems",
        value: "security",
        emoji: "🛡️",
        description: "Initialize Security & System Configs",
        embed: new EmbedBuilder()
          .setColor(EMBED_COLOR)
          .setAuthor({ name: "🔐 SECURITY SYSTEMS [ DELTA ]", iconURL: clientUser.displayAvatarURL() })
          .setDescription(
            `### ⚙️ **[ AUTOMATION_SETUP_UNIT ]**\n` +
            `> 🔹 **!ticketsetup**\n` +
            `> *Initialize the secure support ticketing interface.*\n` +
            `> 🔹 **!log <type> <channel>** \`[logs, logging, logset]\`\n` +
            `> *Configure the multi-stream event logging system.*\n` +
            `> 🔹 **!automod <link|spam>** \`[am, protection]\`\n` +
            `> *Toggle Anti-Link or Anti-Spam protection.*\n` +
            `> 🔹 **!welcome <channel>**\n` +
            `> *Configure the premium entry greeting interface.*\n` +
            `> 🔹 **!left <channel>** \`[lv, leave]\`\n` +
            `> *Configure the premium departure notification system.*\n` +
            `> 🔹 **!setupverify @role #channel**\n` +
            `> *Initialize verification panel.*\n\n` +

            `### 🛡️ **[ HIGH_LEVEL_DEFENSE ]**\n` +
            `> 🔹 **!whitelist <user>** \`[wl, wllist]\`\n` +
            `> *Authorize trusted personnel (Bypass Limits).*\n` +
            `> 🔹 **!blacklist <user>** \`[bl]\`\n` +
            `> *Permanently revoke access to bot systems.*\n` +
            `> 🔹 **!antiraid**\n` +
            `> *Emergency server lockdown protocol.*`
          )
          .setThumbnail(clientUser.displayAvatarURL())
          .setFooter({ text: "PROTOCOL STATUS: AUTHORIZED • SECURE_PRIME_READY" })
      },
      {
        label: "Developer Info",
        value: "devinfo",
        emoji: "👑",
        description: "View Bot Credits & Developer Data",
        embed: new EmbedBuilder()
          .setColor("#00EEFF") // Cyan
          .setTitle("🛡️ BLUESEALPRIME: THE ARCHITECTS")
          .setThumbnail(clientUser.displayAvatarURL())
          .setDescription(
            `### **[ CORE_DEVELOPER ]**\n` +
            `> 👤 **Lead Developer:** <@${require("../config").BOT_OWNER_ID}>\n` +
            `> 🛠️ **System:** Node.js / Discord.js v14\n` +
            `> 🧩 **Architecture:** BlueSeal Sovereign v2.1\n\n` +
            `### **[ THE_ARCHITECT_GUIDE ]**\n` +
            `> 🧠 **Architect's Guide:** <@1327564898460242015>\n` +
            `> *"The visionary who taught me the foundations of BlueSealPrime. Respect to the mentor."*\n\n` +
            `### **[ OPERATIONAL_STRENGTH ]**\n` +
            `> 🚀 **Environment:** Quantum-Ready Cloud Node\n` +
            `> 🛡️ **Anti-Nuke:** Military-Grade Interrogation Protocols\n` +
            `> ⚡ **Heartbeat:** ${message.client.ws.ping}ms\n`
          )
          .setImage("https://media.discordapp.net/attachments/1093150036663308318/1113885934572900454/line-red.gif")
          .setFooter({ text: "BlueSealPrime • Priority Alpha • Infinite Support", iconURL: clientUser.displayAvatarURL() })
          .setTimestamp()
      }
    ];

    // VOICE MANAGEMENT
    categories.push({
      label: "Voice Management",
      value: "voice",
      emoji: "🔊",
      description: "Control voice channels and members",
      embed: new EmbedBuilder()
        .setColor("#0099FF") // Blue
        .setAuthor({ name: "🔊 VOICE OPERATIONS", iconURL: clientUser.displayAvatarURL() })
        .setDescription(
          `### 🎤 **[ VOICE_CONTROL_UNIT ]**\n` +
          `> 🔹 **!vmute <@user>**\n` +
          `> *Server mute user in Voice Channel.*\n` +
          `> 🔹 **!vunmute <@user>**\n` +
          `> *Server unmute user in Voice Channel.*\n` +
          `> 🔹 **!vmuteall**\n` +
          `> *Mute everyone in your Voice Channel.*\n` +
          `> 🔹 **!vunmuteall**\n` +
          `> *Unmute everyone in your Voice Channel.*\n` +
          `> 🔹 **!muv <@user> [channel]**\n` +
          `> *Move user to Void or specified channel.*\n` +
          `> 🔹 **!muvu <@user>**\n` +
          `> *Un-Void/Restore user to original VC.*\n` +
          `> 🔹 **!vmoveall <#channel>** \`[moveall, massmove]\`\n` +
          `> *Mass move everyone in current VC to another.*\n` +
          `> 🔹 **!vdefend <@user>**\n` +
          `> *Protect user from being moved or disconnected.*\n` +
          `> 🔹 **!vundefend <@user>**\n` +
          `> *Remove movement protection.*\n` +
          `> • **eval** - Execute kernel logic\n` +
          `> • **sethomevc** - Maintain Home VC (Permanent stay)\n` +
          `> • **estop** / **eexit** - Terminate process`
        )
        .setFooter({ text: "BlueSealPrime • Voice Systems" })
    });

    // QUARANTINE MANAGEMENT (Admin)
    categories.push({
      label: "Quarantine Management",
      value: "quarantine",
      emoji: "☣️",
      description: "Isolation and containment systems",
      embed: new EmbedBuilder()
        .setColor("#FF4500") // Orange Red
        .setAuthor({ name: "☣️ QUARANTINE PROTOCOLS", iconURL: clientUser.displayAvatarURL() })
        .setDescription(
          `### 🛡️ **[ ISOLATION_UNIT ]**\n` +
          `> 🔹 **!qr <@user> [reason]** \`[quarantine]\`\n` +
          `> *Isolate user in Quarantine Zone. Revoke permissions.*\n` +
          `> 🔹 **!uq <@user>** \`[unquarantine]\`\n` +
          `> *Release user from quarantine.*\n\n` +
          `### 🛡️ **[ BASIC_MODERATION ]**\n` +
          `> 🔹 **!warn <@user>**\n` +
          `> *Issue official warning.*\n` +
          `> 🔹 **!mute <@user>**\n` +
          `> *Timeout/Silence user.*`
        )
        .setFooter({ text: "BlueSealPrime • Containment" })
    });

    // LOGGING (Redundant with Security but kept for depth if needed, strictly logging focused)
    categories.push({
      label: "Logging Module",
      value: "logging",
      emoji: "📝",
      description: "Configure Server Logging Channels",
      embed: new EmbedBuilder()
        .setColor("#2E8B57") // Sea Green
        .setAuthor({ name: "📝 LOGGING SYSTEMS [ EPSILON ]", iconURL: clientUser.displayAvatarURL() })
        .setDescription(
          `### ⚙️ **[ SYSTEM_LOGS ]**\n` +
          `> 🔹 **!log mod <#channel>**\n` +
          `> *Moderation Actions.*\n` +
          `> 🔹 **!log message <#channel>**\n` +
          `> *Deleted/Edited Messages.*\n` +
          `> 🔹 **!log member <#channel>**\n` +
          `> *Joins/Leaves.*\n` +
          `> 🔹 **!log voice <#channel>**\n` +
          `> *Voice Activity.*\n` +
          `> 🔹 **!log role <#channel>**\n` +
          `> *Role Updates.*\n` +
          `> 🔹 **!log server <#channel>**\n` +
          `> *Server Changes.*\n\n` +
          `### 🛡️ **[ SECURITY_LOGS ]**\n` +
          `> 🔹 **!log antinuke <#channel>**\n` +
          `> *Anti-Nuke Triggers.*\n` +
          `> 🔹 **!log automod <#channel>**\n` +
          `> *Auto-Mod Violations.*\n` +
          `> 🔹 **!log whitelist <#channel>**\n` +
          `> *Whitelist Changes.*\n` +
          `> 🔹 **!log admin <#channel>**\n` +
          `> *Admin Command Usage.*\n\n` +
          `### 📂 **[ DATA_LOGS ]**\n` +
          `> 🔹 **!log file <#channel>**\n` +
          `> *File Uploads.*\n` +
          `> 🔹 **!log ticket <#channel>**\n` +
          `> *Ticket Transcripts.*\n` +
          `> 🔹 **!log invite <#channel>**\n` +
          `> *Invite Tracking.*`
        )
        .setFooter({ text: "BlueSealPrime • Comprehensive Logging" })
    });

    categories.push({
      label: "Administrator Controls",
      value: "admin",
      emoji: "⚡",
      description: "Absolute Power & Server Control (Admin Only)",
      embed: new EmbedBuilder()
        .setColor("#FFD700") // Gold
        .setAuthor({ name: "⚡ ABSOLUTE POWER CONTROLS [ OMEGA ]", iconURL: clientUser.displayAvatarURL() })
        .setDescription(
          `### 👥 **[ MASS_POPULATION_CONTROL ]**\n` +
          `> 🔹 **System Locked:** *Mass operations are hidden for security.*\n` +
          `> 🔹 **!serverlock**\n` +
          `> *Lock the ENTIRE server.*\n` +
          `> 🔹 **!serverunlock**\n` +
          `> *Unlock the ENTIRE server.*`
        )
        .setThumbnail(clientUser.displayAvatarURL())
        .setFooter({ text: "⚠️ RESTRICTED ACCESS • AUTHORIZED PERSONNEL ONLY" })
    });

    let currentPage = 0;

    const createComponents = (pageIndex) => {
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
          .setCustomId("help_prev")
          .setLabel("⬅️ Back")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(pageIndex === 0),
        new ButtonBuilder()
          .setCustomId("help_stop")
          .setLabel("⏹️ Exit")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId("help_next")
          .setLabel("Next ➡️")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(pageIndex === categories.length - 1)
      );

      const menuRow = new ActionRowBuilder().addComponents(selectMenu);
      return [menuRow, buttons];
    };

    const initialMessage = await message.reply({
      embeds: [categories[currentPage].embed],
      components: createComponents(currentPage)
    });

    const collector = initialMessage.createMessageComponentCollector({
      filter: (i) => i.user.id === message.author.id,
      time: 300000 // 5 minutes
    });

    collector.on("collect", async (interaction) => {
      if (interaction.customId === "help_select") {
        currentPage = categories.findIndex(c => c.value === interaction.values[0]);
      } else if (interaction.customId === "help_prev") {
        currentPage--;
      } else if (interaction.customId === "help_next") {
        currentPage++;
      } else if (interaction.customId === "help_stop") {
        return collector.stop("user_stopped");
      }

      await interaction.update({
        embeds: [categories[currentPage].embed],
        components: createComponents(currentPage)
      });
    });

    collector.on("end", async (collected, reason) => {
      if (reason === "user_stopped") {
        await initialMessage.delete().catch(() => { });
      } else {
        const disabledComponents = createComponents(currentPage).map(row => {
          row.components.forEach(c => c.setDisabled(true));
          return row;
        });
        await initialMessage.edit({ components: disabledComponents }).catch(() => { });
      }
    });
  }
};
