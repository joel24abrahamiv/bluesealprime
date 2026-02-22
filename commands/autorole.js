const { EmbedBuilder, PermissionsBitField, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { EMBED_COLOR, ERROR_COLOR, SUCCESS_COLOR, BOT_OWNER_ID } = require("../config");
const V2 = require("../utils/v2Utils");

module.exports = {
    name: "autorole",
    description: "Automated role assignment for new members",
    usage: "!autorole <set @role | off | status>",
    permissions: [PermissionsBitField.Flags.Administrator],

    async execute(message, args) {
        const DB_PATH = path.join(__dirname, "../data/autorole.json");

        // Ensure data directory exists
        if (!fs.existsSync(path.join(__dirname, "../data"))) {
            fs.mkdirSync(path.join(__dirname, "../data"));
        }

        let data = {};
        if (fs.existsSync(DB_PATH)) {
            try {
                data = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
            } catch (e) {
                console.error("Error reading autorole DB:", e);
            }
        }

        const sub = args[0]?.toLowerCase();

        if (sub === "set") {
            const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
            if (!role) {
                return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("⚠️ **Missing Role.** Usage: `!autorole set @role`")] });
            }

            if (role.position >= message.guild.members.me.roles.highest.position) {
                return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("🚫 **Hierarchy Error:** I cannot assign a role higher than my own.")] });
            }

            data[message.guild.id] = role.id;
            fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

            const container = V2.container([
                V2.section([
                    V2.text(`**Autorole Activated**`),
                    V2.text(`Automatic onboarding sequence synchronized.`)
                ], message.guild.iconURL({ dynamic: true, size: 512 })),
                V2.separator(),
                V2.text(`\u200b`),
                V2.text(`New members will be granted the **${role.name}** role upon entry.`),
                V2.text(`\u200b`),
                V2.text(`Architect: <@${BOT_OWNER_ID}>`),
                V2.separator()
            ], "#00EEFF");

            return message.channel.send({ content: null, components: [container], flags: V2.flag });
        }

        if (sub === "off" || sub === "disable") {
            if (!data[message.guild.id]) {
                return message.reply("⚠️ Autorole is already disabled for this sector.");
            }

            delete data[message.guild.id];
            fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

            const container = V2.container([
                V2.text(`\u200b`),
                V2.text(`**Autorole Deactivated**`),
                V2.text(`Automation has been terminated for this sector.`),
                V2.text(`\u200b`)
            ], "#FF4500");

            return message.reply({ content: null, components: [container], flags: V2.flag });
        }

        if (sub === "status" || !sub) {
            const roleId = data[message.guild.id];
            const role = roleId ? message.guild.roles.cache.get(roleId) : null;

            const container = V2.container([
                V2.section([
                    V2.text(`**Autorole Status**`),
                    V2.text(`System Telemetry Logged`)
                ], message.guild.iconURL({ dynamic: true, size: 512 })),
                V2.separator(),
                V2.text(`\u200b`),
                V2.text(`**Status:** ${role ? "Active" : "Inactive"}`),
                V2.text(`**Target:** ${role ? `${role.name} (${role.id})` : "None Set"}`),
                V2.text(`\u200b`),
                V2.text(`**Protocol Usage:**`),
                V2.text(`!autorole set @role`),
                V2.text(`!autorole off`),
                V2.text(`\u200b`),
                V2.text(`Architect: <@${BOT_OWNER_ID}>`),
                V2.separator()
            ], "#00EEFF");

            return message.channel.send({ content: null, components: [container], flags: V2.flag });
        }
    }
};
