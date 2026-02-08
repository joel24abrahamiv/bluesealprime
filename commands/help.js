const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ComponentType } = require("discord.js");
const { EMBED_COLOR } = require("../config");

module.exports = {
  name: "help",
  description: "Shows premium interactive help with a spacious blue theme",
  aliases: ["h"],

  async execute(message) {
    const totalCommands = message.client.commands.size;
    const clientUser = message.client.user;

    // Command Categories Data
    const categories = [
      {
        label: "Home Page",
        value: "home",
        emoji: "🟦",
        description: "Return to the main dashboard",
        embed: new EmbedBuilder()
          .setColor(EMBED_COLOR)
          .setAuthor({ name: "BLUE SEAL PRIME • SECURITY TERMINAL", iconURL: clientUser.displayAvatarURL() })
          .setDescription(
            `\`\`\`fix\n` +
            `[ SYSTEM INITIALIZATION ]\n` +
            `> v2.0.0 Global Protocol Loaded\n` +
            `> Security Layers: ACTIVE\n` +
            `> Anti-Nuke Status: PROTECTED\n` +
            `\`\`\`\n\n\n` +
            `# 🟦 **BLUE SEAL PRIME NextGen**\n\n` +
            `> **Advanced Antinuke • Automods • Security • Systems**\n\n\n` +
            `🔹 **STATUS DIAGNOSTICS**\n` +
            `\`\`\`yaml\n` +
            `Commands: ${totalCommands}+\n` +
            `Runtime: Discord.js @Latest\n` +
            `\`\`\`\n` +
            `> **Maintenance:** <@${require("../config").BOT_OWNER_ID}>\n\n` +
            `🔹 **OPERATIONAL GUIDE**\n` +
            `> 💠 *Select a category from the dropdown menu to access specific command modules.*\n\n\n` +
            `> 💠 *Navigate through features using the interaction navigation buttons below.*\n\n\n` +
            `> 💠 *The session will automatically hibernate after 5 minutes of inactivity.*\n\n\n` +
            `✨ **PREMIUM INFRASTRUCTURE**\n` +
            `🛡️ *Custom-built Antinuke & Security layers.*\n\n` +
            `🛡️ *Intelligent Auto-Mod with quarantine capabilities.*\n\n` +
            `🛡️ *Full scale server management: Roles, Tickets, and Logs.*\n\n\n` +
            `**Maintenance Contact:** <@${require("../config").BOT_OWNER_ID}>`
          )
          .setThumbnail(clientUser.displayAvatarURL({ dynamic: true, size: 512 }))
          .setImage("https://media.discordapp.net/attachments/1336968940801986603/1337083074092433438/standard_1.gif")
          .setFooter({ text: `BLUE SEAL PRIME • GLOBAL SECURITY PROTOCOLS • Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL() })
          .setTimestamp()
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
            `### 👤 **[ USER_CONTROL_PROTOCOLS ]**\n\n` +
            `> 🔹 **!ban <user> [reason]**\n` +
            `> *Permanently remove a threat from the server.*\n\n\n` +
            `> 🔹 **!kick <user> [reason]**\n` +
            `> *Eject a user from the guild immediately.*\n\n\n` +
            `> 🔹 **!timeout <user> <time> [reason]**\n` +
            `> *Apply a temporary communication restriction.*\n\n\n` +
            `> 🔹 **!unban <userID>**\n` +
            `> *Restore access for a previously banned identifier.*\n\n\n` +
            `### 📺 **[ CHANNEL_INTEGRITY_PROTOCOLS ]**\n\n` +
            `> 🔹 **!lock [reason]**\n` +
            `> *Restrict all message flow in the current sector.*\n\n\n` +
            `> 🔹 **!unlock**\n` +
            `> *Restore standard communication permissions.*\n\n\n` +
            `> 🔹 **!purge <amount>**\n` +
            `> *Bulk sanitize up to 100 recent transmissions.*\n\n\n` +
            `> 🔹 **!stick <msg>**\n` +
            `> *📌 Pin a message to the bottom of the chat.*`
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
            `### 📊 **[ ANALYTICS_STREAM ]**\n\n` +
            `> 🔹 **!roleinfo <role>**\n` +
            `> *Retrieve detailed data metrics for a specific role.*\n\n\n` +
            `### 🔄 **[ DELEGATION_STREAM ]**\n\n` +
            `> 🔹 **!addrole <user> <role>**\n` +
            `> *Assign a specific server identity to a member.*\n\n\n` +
            `> 🔹 **!removerole <user> <role>**\n` +
            `> *Strip a member of a specific role identity.*\n\n\n` +
            `> 🔹 **!temprole <user> <role> <time>**\n` +
            `> *Grant time-limited role access (e.g., 1d, 1w).*\n\n\n` +
            `### ⚙️ **[ REGISTRY_MODIFICATION ]**\n\n` +
            `> 🔹 **!createrole <name> [hex]**\n` +
            `> *Initialize a brand new role with custom parameters.*\n\n\n` +
            `> 🔹 **!deleterole <role>**\n` +
            `> *Decommission an existing role from the registry.*\n\n\n` +
            `### 🎭 **[ REACTION_ROLES ]**\n\n` +
            `> 🔹 **!reactionrole create <#channel> <title>**\n` +
            `> *Create a self-assign reaction role panel.*\n\n\n` +
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
            `### 📢 **[ BROADCAST_LINK ]**\n\n` +
            `> 🔹 **!say <content>**\n` +
            `> *Bot transmission through standard or embed format.*\n\n\n` +
            `> 🔹 **!announce <content>**\n` +
            `> *Official system broadcast for high-importance updates.*\n\n\n` +
            `### 💾 **[ DATA_INGESTION_LINK ]**\n\n` +
            `> 🔹 **!ping**\n` +
            `> *Check API and host connection latency.*\n\n\n` +
            `> 🔹 **!serverinfo**\n` +
            `> *Fetch comprehensive guild analytics pathing.*\n\n\n` +
            `> 🔹 **!userinfo [@user]**\n` +
            `> *Detailed security scan of a member profile.*\n\n\n` +
            `> 🔹 **!avatar [@user]**\n` +
            `> *Retrieve high-definition visualization of a user profile.*\n\n\n` +
            `> 🔹 **!poll <Question> | <Opt1> | <Opt2>**\n` +
            `> *Create an interactive poll.*\n\n\n` +
            `> 🔹 **!suggest <idea>**\n` +
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
            `### ⚙️ **[ AUTOMATION_SETUP_UNIT ]**\n\n` +
            `> 🔹 **!ticketsetup**\n` +
            `> *Initialize the secure support ticketing interface.*\n\n\n` +
            `> 🔹 **!log <type> <channel>**\n` +
            `> *Configure the multi-stream event logging system.*\n\n\n` +
            `> 🔹 **!automod <link|spam>**\n` +
            `> *Toggle Anti-Link or Anti-Spam protection.*\n\n\n` +
            `> 🔹 **!welcome <channel>**\n` +
            `> *Configure the premium entry greeting interface.*\n\n\n` +
            `> 🔹 **!left <channel>**\n` +
            `> *Configure the premium departure notification system.*\n\n\n` +
            `> 🔹 **!setupverify @role #channel**\n` +
            `> *Initialize verification panel.*`

          )
          .setThumbnail(clientUser.displayAvatarURL())
          .setFooter({ text: "PROTOCOL STATUS: AUTHORIZED • SECURE_PRIME_READY" })
      }
    ];

    // Add Admin-Only Category (Anti-Raid)
    const isBotOwner = message.author.id === require("../config").BOT_OWNER_ID;
    const isAdmin = message.member.permissions.has(require("discord.js").PermissionsBitField.Flags.Administrator);

    if (isBotOwner || isAdmin) {
      categories.push({
        label: "🚨 Anti-Raid [ADMIN]",
        value: "antiraid",
        emoji: "🚨",
        description: "Advanced Raid Protection (Admin Only)",
        embed: new EmbedBuilder()
          .setColor("#FF0000")
          .setAuthor({ name: "🚨 ANTI-RAID PROTECTION [ CLASSIFIED ]", iconURL: clientUser.displayAvatarURL() })
          .setDescription(
            `### 🛡️ **[ RAID_DEFENSE_PROTOCOL ]**\n\n` +
            `> 🔹 **!antinuke on**\n` +
            `> *Activate automatic anti-nuke protection.*\n\n\n` +
            `> 🔹 **!antinuke status**\n` +
            `> *View current protection configuration.*\n\n\n` +
            `⚠️ **CLASSIFIED SECURITY PROTOCOL**\n` +
            `> *Actions: Bans for mass deletions. Kicks+DM for channel deletion.*\n\n` +
            `> *Administrators and whitelist retain access.*`

          )
          .setThumbnail(clientUser.displayAvatarURL())
          .setFooter({ text: "⚠️ ADMINISTRATOR ACCESS REQUIRED • CLASSIFIED" })
      });

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
            `### 🎤 **[ VOICE_CONTROL_UNIT ]**\n\n` +
            `> 🔹 **!vmute <@user>** • *Server mute user*\n` +
            `> 🔹 **!vunmute <@user>** • *Server unmute user*\n` +
            `> 🔹 **!vmuteall** • *Mute everyone in VC*\n` +
            `> 🔹 **!vunmuteall** • *Unmute everyone in VC*\n` +
            `> 🔹 **!muv <@user> [channel]** • *Move user to Void/Channel*\n` +
            `> 🔹 **!muvu <@user>** • *Un-Void/Restore user to original VC*\n` +
            `> 🔹 **!vmoveall <#channel>** • *Mass move everyone in current VC*\n` +
            `> 🔹 **!vdefend <@user>** • *Protect user from move/disconnect*\n` +
            `> 🔹 **!vundefend <@user>** • *Remove movement protection*\n`
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
            `### 🛡️ **[ ISOLATION_UNIT ]**\n\n` +
            `> 🔹 **!qr <@user> [reason]**\n` +
            `> *Isolate user in Quarantine Zone. Revoke permissions.*\n\n` +
            `> 🔹 **!uq <@user>**\n` +
            `> *Release user from quarantine.*\n\n` +
            `### 🛡️ **[ BASIC_MODERATION ]**\n\n` +
            `> 🔹 **!warn <@user>** • *Issue official warning*\n` +
            `> 🔹 **!mute <@user>** • *Timeout/Silence user*\n` +
            `> 🔹 **!clear <amount>** • *Purge messages*`
          )
          .setFooter({ text: "BlueSealPrime • Containment" })
      });
      categories.push({
        label: "Logging Module",
        value: "logging",
        emoji: "📝",
        description: "Configure Server Logging Channels",
        embed: new EmbedBuilder()
          .setColor("#2E8B57") // Sea Green
          .setAuthor({ name: "📝 LOGGING SYSTEMS [ EPSILON ]", iconURL: clientUser.displayAvatarURL() })
          .setDescription(
            `### ⚙️ **[ SYSTEM_LOGS ]**\n\n` +
            `> 🔹 **!log mod <#channel>** • *Moderation Actions*\n` +
            `> 🔹 **!log message <#channel>** • *Deleted/Edited Msgs*\n` +
            `> 🔹 **!log member <#channel>** • *Joins/Leaves*\n` +
            `> 🔹 **!log voice <#channel>** • *Voice Activity*\n` +
            `> 🔹 **!log role <#channel>** • *Role Updates*\n` +
            `> 🔹 **!log server <#channel>** • *Server Changes*\n\n` +
            `### 🛡️ **[ SECURITY_LOGS ]**\n\n` +
            `> 🔹 **!log antinuke <#channel>** • *Anti-Nuke Triggers*\n` +
            `> 🔹 **!log automod <#channel>** • *Auto-Mod Violations*\n` +
            `> 🔹 **!log whitelist <#channel>** • *Whitelist Changes*\n` +
            `> 🔹 **!log admin <#channel>** • *Admin Command Usage*\n\n` +
            `### 📂 **[ DATA_LOGS ]**\n\n` +
            `> 🔹 **!log file <#channel>** • *File Uploads*\n` +
            `> 🔹 **!log ticket <#channel>** • *Ticket Transcripts*\n` +
            `> 🔹 **!log invite <#channel>** • *Invite Tracking*`
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
            `### 👥 **[ MASS_POPULATION_CONTROL ]**\n\n` +
            `> 🔹 **!massrole <add|remove> <@role>**\n` +
            `> *Apply or revoke a role for ALL guild members.*\n\n\n` +
            `> 🔹 **!massrole <add|remove> <@role>**\n` +
            `> *Apply or revoke a role for ALL guild members.*\n\n\n` +
            `### 📊 **[ STATISTICS_INFRASTRUCTURE ]**\n\n` +
            `> 🔹 **!serverstats <setup|delete>**\n` +
            `> *Initialize real-time membership counter channels.*`

          )
          .setThumbnail(clientUser.displayAvatarURL())
          .setFooter({ text: "⚠️ RESTRICTED ACCESS • AUTHORIZED PERSONNEL ONLY" })
      });
    }

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
