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
            status: true           // Overall feature toggle
        };

        if (!data[guild.id]) data[guild.id] = defaults;
        let settings = { ...defaults, ...data[guild.id] };

        const renderMenu = () => {
            const s = settings;

            const row1 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("id_status").setLabel(s.status ? "Dome: ACTIVE" : "Dome: OFFLINE").setStyle(s.status ? ButtonStyle.Success : ButtonStyle.Danger),
                new ButtonBuilder().setCustomId("id_role").setLabel("Role Strike").setStyle(s.roleStrike ? ButtonStyle.Primary : ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId("id_member").setLabel("Member Strike").setStyle(s.memberStrike ? ButtonStyle.Primary : ButtonStyle.Secondary)
            );

            const row2 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("id_lock").setLabel("Channel Lockdown").setStyle(s.channelLock ? ButtonStyle.Primary : ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId("id_close").setLabel("Save & Exit").setStyle(ButtonStyle.Success)
            );

            const container = V2.container([
                V2.section([
                    V2.heading("🏛️ Iron Dome Manager", 1),
                    V2.text(`**System Status:** ${s.status ? "🟢 OPERATIONAL" : "🔴 DEACTIVATED"}\n\n` +
                        `**🛡️ Role Strike:** ${s.roleStrike ? "ENABLED" : "DISABLED"}\n` +
                        `> Removes dangerous permissions from roles during detected breaches.\n\n` +
                        `**🛡️ Member Strike:** ${s.memberStrike ? "ENABLED" : "DISABLED"}\n` +
                        `> Instantly neutralizes accounts triggering nuke patterns.\n\n` +
                        `**🛡️ Channel Lockdown:** ${s.channelLock ? "ENABLED" : "DISABLED"}\n` +
                        `> Denies @everyone access to all sectors upon alert.`)
                ]),
                V2.separator(),
                V2.text("> **Note:** The Master Architect is immune to all automated lockdowns."),
                row1,
                row2
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
            if (id === "id_role") settings.roleStrike = !settings.roleStrike;
            if (id === "id_member") settings.memberStrike = !settings.memberStrike;
            if (id === "id_lock") settings.channelLock = !settings.channelLock;

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
