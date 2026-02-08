const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { EMBED_COLOR, ERROR_COLOR, SUCCESS_COLOR } = require("../config");

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

            const embed = new EmbedBuilder()
                .setColor(SUCCESS_COLOR)
                .setAuthor({ name: "⚡ AUTOROLE ACTIVATED", iconURL: message.client.user.displayAvatarURL() })
                .setDescription(`**Automatic Onboarding Stream Synchronized.**\nNew members will now be granted the **${role.name}** role upon entry.`)
                .setFooter({ text: "BlueSealPrime • Priority Onboarding" })
                .setTimestamp();

            return message.channel.send({ embeds: [embed] });
        }

        if (sub === "off" || sub === "disable") {
            if (!data[message.guild.id]) {
                return message.reply("⚠️ Autorole is already disabled for this sector.");
            }

            delete data[message.guild.id];
            fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

            return message.reply({ embeds: [new EmbedBuilder().setColor(SUCCESS_COLOR).setDescription("🛑 **Autorole Deactivated.** Automation has been cut.")] });
        }

        if (sub === "status" || !sub) {
            const roleId = data[message.guild.id];
            const role = roleId ? message.guild.roles.cache.get(roleId) : null;

            const embed = new EmbedBuilder()
                .setColor(EMBED_COLOR)
                .setAuthor({ name: "📊 AUTOROLE TELEMETRY", iconURL: message.client.user.displayAvatarURL() })
                .setDescription(role ? `> **Status:** \`ACTIVE\`\n> **Target Role:** ${role} (\`${role.id}\`)` : `> **Status:** \`INACTIVE\`\n> **Target Role:** \`None Set\``)
                .addFields({ name: "💡 Usage", value: "`.autorole set @role` • Assign role on join\n`.autorole off` • Cut automation" })
                .setFooter({ text: "BlueSealPrime • System Diagnostics" });

            return message.channel.send({ embeds: [embed] });
        }
    }
};
