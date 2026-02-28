const {
    PermissionsBitField,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    ComponentType,
    SlashCommandBuilder
} = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
    name: "irondome",
    description: "🏛️ Configure automated server security (Iron Dome)",
    aliases: ["id", "dome"],
    permissions: [PermissionsBitField.Flags.Administrator],

    // Slash Command Data
    data: new SlashCommandBuilder()
        .setName("irondome")
        .setDescription("Open the Iron Dome Security Manager"),

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

        // ACCESS CONTROL: Server Owner or Bot Owner only
        if (user.id !== guild.ownerId && user.id !== BOT_OWNER_ID) {
            const err = V2.container([V2.text("❌ **IDENTITY_FAULT:** Only the Server Owner or Architect can modify the Iron Dome.")], V2_RED);
            return isInteraction ? message.reply({ components: [err], ephemeral: true }) : message.reply({ components: [err], flags: V2.flag });
        }

        const DB_PATH = path.join(__dirname, "../data/irondome.json");
        let data = {};
        if (fs.existsSync(DB_PATH)) {
            try { data = JSON.parse(fs.readFileSync(DB_PATH, "utf8")); } catch (e) { }
        }

        const defaults = {
            roleStrike: true,      // Strip perms from dangerous roles
            memberStrike: true,    // Ban/Strip nukers
            channelLock: true,     // Lock channels to everyone
            status: true,          // Overall feature toggle
            triggerLimit: 1        // Actions before dome activates
        };

        if (!data[guild.id]) data[guild.id] = defaults;
        let settings = { ...defaults, ...data[guild.id] };

        const renderMenu = () => {
            const s = settings;

            // Feature Toggle Select
            const featureSelect = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("id_features")
                    .setPlaceholder("Toggle Security Features")
                    .setMinValues(0)
                    .setMaxValues(3)
                    .addOptions([
                        {
                            label: "Role Strike",
                            value: "role",
                            description: "Strip perms from dangerous roles",
                            emoji: "🛡️",
                            default: s.roleStrike
                        },
                        {
                            label: "Member Strike",
                            value: "member",
                            description: "Neutralize malicious actors",
                            emoji: "👤",
                            default: s.memberStrike
                        },
                        {
                            label: "Channel Lockdown",
                            value: "lock",
                            description: "Lock channels to @everyone",
                            emoji: "🔒",
                            default: s.channelLock
                        }
                    ])
            );

            // Trigger Limit Select
            const limitSelect = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("id_limit")
                    .setPlaceholder(`Set Trigger Limit (Current: ${s.triggerLimit})`)
                    .addOptions([
                        { label: "1 Action (Instant)", value: "1", description: "Activate on first detection", emoji: "⚡" },
                        { label: "3 Actions", value: "3", description: "Activate after 3 detections", emoji: "🟠" },
                        { label: "5 Actions", value: "5", description: "Activate after 5 detections", emoji: "🔴" },
                        { label: "10 Actions", value: "10", description: "Activate after 10 detections", emoji: "🚫" }
                    ])
            );

            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("id_status").setLabel(s.status ? "Dome: ACTIVE" : "Dome: OFFLINE").setStyle(s.status ? ButtonStyle.Success : ButtonStyle.Danger),
                new ButtonBuilder().setCustomId("id_close").setLabel("Save & Exit").setStyle(ButtonStyle.Success)
            );

            const container = V2.container([
                V2.section([
                    V2.heading("🏛️ Iron Dome Manager", 1),
                    V2.text(`**System Status:** ${s.status ? "🟢 OPERATIONAL" : "🔴 DEACTIVATED"}\n` +
                        `**Trigger Limit:** \`${s.triggerLimit}\` actions\n\n` +
                        `**🛡️ Role Strike:** ${s.roleStrike ? "ENABLED" : "DISABLED"}\n` +
                        `**🛡️ Member Strike:** ${s.memberStrike ? "ENABLED" : "DISABLED"}\n` +
                        `**🛡️ Channel Lockdown:** ${s.channelLock ? "ENABLED" : "DISABLED"}`)
                ]),
                V2.separator(),
                V2.text("> **Note:** The Master Architect is immune to all automated lockdowns."),
                featureSelect,
                limitSelect,
                buttons
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

            if (id === "id_close") {
                await i.update({ content: "✅ **Iron Dome configuration synchronized.**", components: [] });
                return collector.stop();
            }

            if (id === "id_status") settings.status = !settings.status;

            if (id === "id_features") {
                settings.roleStrike = i.values.includes("role");
                settings.memberStrike = i.values.includes("member");
                settings.channelLock = i.values.includes("lock");
            }

            if (id === "id_limit") {
                settings.triggerLimit = parseInt(i.values[0]);
            }

            // Save
            data[guild.id] = settings;
            fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

            await i.update({ components: [renderMenu()] });
        });

        if (mainProcess.SMS_SERVICE) {
            mainProcess.SMS_SERVICE.logCommand(guild.id, user.id, "irondome", Date.now() - EXECUTION_START_TIME, "SUCCESS");
        }
    }
};
