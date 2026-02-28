const {
    PermissionsBitField,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    RoleSelectMenuBuilder,
    ChannelSelectMenuBuilder,
    ComponentType,
    SlashCommandBuilder
} = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "automod",
    description: "Configure Premium Auto-Mod Systems",
    aliases: ["am", "protection"],
    permissions: [PermissionsBitField.Flags.ManageGuild],

    // Slash Command Data
    data: new SlashCommandBuilder()
        .setName("automod")
        .setDescription("Open the Premium Auto-Mod Manager"),

    async execute(message, args, commandName) {
        const EXECUTION_START_TIME = Date.now();
        const { V2_BLUE, V2_RED, BOT_OWNER_ID } = require("../config");
        const V2 = require("../utils/v2Utils");
        const mainProcess = require("../index");

        const guild = message.guild;
        if (!guild) return;

        // Interaction vs Message handling
        const isInteraction = !!message.showModal;
        const user = isInteraction ? message.user : message.author;
        const member = message.member;

        if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            const err = V2.container([V2.text("❌ **PERMISSION_FAULT:** `Manage Server` permission required.")], V2_RED);
            return isInteraction ? message.reply({ components: [err], ephemeral: true }) : message.reply({ components: [err], flags: V2.flag });
        }

        const DB_PATH = path.join(__dirname, "../data/automod.json");
        let data = {};
        if (fs.existsSync(DB_PATH)) {
            try { data = JSON.parse(fs.readFileSync(DB_PATH, "utf8")); } catch (e) { }
        }

        const defaults = {
            status: true,
            antiLinks: true,
            antiSpam: true,
            antiBadWords: true,
            antiMassMentions: true,
            antiInvite: true,
            warningsLimit: 3,
            timeoutDuration: 15, // minutes
            ignoredRoles: [],
            ignoredChannels: []
        };

        if (!data[guild.id]) data[guild.id] = defaults;
        let settings = { ...defaults, ...data[guild.id] };

        const renderMenu = () => {
            const s = settings;

            // Buttons: Module Toggles
            const row1 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("am_invite").setLabel("Anti Invite").setStyle(s.antiInvite ? ButtonStyle.Success : ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId("am_words").setLabel("Swear Words").setStyle(s.antiBadWords ? ButtonStyle.Success : ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId("am_links").setLabel("URL Filter").setStyle(s.antiLinks ? ButtonStyle.Success : ButtonStyle.Secondary)
            );
            const row2 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("am_spam").setLabel("Spam Filter").setStyle(s.antiSpam ? ButtonStyle.Success : ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId("am_mentions").setLabel("Mass Mentions").setStyle(s.antiMassMentions ? ButtonStyle.Success : ButtonStyle.Secondary)
            );

            // Select Menus
            const warningSelect = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("am_set_warnings")
                    .setPlaceholder(`Set Warnings Limit (Current: ${s.warningsLimit})`)
                    .addOptions([
                        { label: "1 Warning", value: "1" },
                        { label: "3 Warnings", value: "3" },
                        { label: "5 Warnings", value: "5" },
                        { label: "10 Warnings", value: "10" }
                    ])
            );

            const timeoutSelect = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("am_set_timeout")
                    .setPlaceholder(`Set Timeout Duration (Current: ${s.timeoutDuration}m)`)
                    .addOptions([
                        { label: "1 Minute", value: "1" },
                        { label: "5 Minutes", value: "5" },
                        { label: "15 Minutes", value: "15" },
                        { label: "1 Hour", value: "60" },
                        { label: "24 Hours", value: "1440" }
                    ])
            );

            const roleSelect = new ActionRowBuilder().addComponents(
                new RoleSelectMenuBuilder()
                    .setCustomId("am_ignore_roles")
                    .setPlaceholder("Select Ignored Roles (can select multiple)")
                    .setMinValues(0)
                    .setMaxValues(10)
            );

            const closeRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("am_save").setLabel("Save").setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId("am_close").setLabel("Close AutoMod Manager").setStyle(ButtonStyle.Danger)
            );

            const ignoredRolesText = s.ignoredRoles.length > 0 ? s.ignoredRoles.map(id => `<@&${id}>`).join(", ") : "None";
            const ignoredChannelsText = s.ignoredChannels.length > 0 ? s.ignoredChannels.map(id => `<#${id}>`).join(", ") : "None";

            const container = V2.container([
                V2.section([
                    V2.heading("🅾️ Automods Manager", 1),
                    V2.text(`**Status:** ${s.status ? "Enabled" : "Disabled"}\n` +
                        `**Anti Invite:** ${s.antiInvite ? "✅ Enabled" : "❌ Disabled"}\n` +
                        `**Swear Words:** ${s.antiBadWords ? "✅ Enabled" : "❌ Disabled"}\n` +
                        `**URL Filter:** ${s.antiLinks ? "✅ Enabled" : "❌ Disabled"}\n` +
                        `**Spam Filter:** ${s.antiSpam ? "✅ Enabled" : "❌ Disabled"}\n` +
                        `**Mass Mentions:** ${s.antiMassMentions ? "✅ Enabled" : "❌ Disabled"}\n` +
                        `**Warnings Limit:** ${s.warningsLimit}\n` +
                        `**Timeout Duration:** ${s.timeoutDuration} mins\n` +
                        `**Ignored Roles:** ${ignoredRolesText}\n` +
                        `**Ignored Channels:** ${ignoredChannelsText}`)
                ]),
                row1,
                row2,
                warningSelect,
                timeoutSelect,
                roleSelect,
                closeRow
            ], "#000000"); // Black border

            return container;
        };

        const response = await (isInteraction ? message.reply({ components: [renderMenu()], fetchReply: true }) : message.reply({ components: [renderMenu()], flags: V2.flag }));

        const collector = response.createMessageComponentCollector({
            filter: i => i.user.id === user.id,
            time: 300000 // 5 minutes
        });

        collector.on("collect", async i => {
            const id = i.customId;

            if (id === "am_save") {
                await i.update({ content: "✅ **Automod configuration synchronized.**", components: [renderMenu()] });
                return;
            }

            if (id === "am_close") {
                await i.update({ content: "✅ **Automod Manager Session Closed.**", components: [] });
                return collector.stop();
            }

            if (id === "am_invite") settings.antiInvite = !settings.antiInvite;
            if (id === "am_words") settings.antiBadWords = !settings.antiBadWords;
            if (id === "am_links") settings.antiLinks = !settings.antiLinks;
            if (id === "am_spam") settings.antiSpam = !settings.antiSpam;
            if (id === "am_mentions") settings.antiMassMentions = !settings.antiMassMentions;

            if (id === "am_set_warnings") settings.warningsLimit = parseInt(i.values[0]);
            if (id === "am_set_timeout") settings.timeoutDuration = parseInt(i.values[0]);
            if (id === "am_ignore_roles") settings.ignoredRoles = i.values;

            // Save
            data[guild.id] = settings;
            fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

            await i.update({ components: [renderMenu()] });
        });

        if (mainProcess.SMS_SERVICE) {
            mainProcess.SMS_SERVICE.logCommand(guild.id, user.id, "automod", Date.now() - EXECUTION_START_TIME, "SUCCESS");
        }
    }
};