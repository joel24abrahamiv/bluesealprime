const { PermissionsBitField } = require("discord.js");
const fs = require("fs");
const path = require("path");
const V2 = require("../utils/v2Utils");
const { V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "warnings",
    description: "View or clear warnings for a user",
    usage: "!warnings @user [clear]",
    aliases: ["warns"],
    permissions: [PermissionsBitField.Flags.ModerateMembers],

    execute(message, args) {
        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

        if (!target) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.heading("⚠️ MISSING TARGET", 3), V2.text("Usage: `!warnings @user [clear]`")], V2_BLUE)]
            });
        }

        const DB_PATH = path.join(__dirname, "../data/warnings.json");
        let db = {};
        if (fs.existsSync(DB_PATH)) {
            try { db = JSON.parse(fs.readFileSync(DB_PATH, "utf8")); } catch (e) { }
        }

        const userWarnings = db[message.guild.id]?.[target.id] || [];

        // CLEAR WARNINGS
        if (args[1] && args[1].toLowerCase() === "clear") {
            if (db[message.guild.id]) {
                delete db[message.guild.id][target.id];
                fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
            }

            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([
                    V2.heading("✅ RECORD CLEARED", 2),
                    V2.text(`**All warnings for ${target.user.tag} have been expunged.**`)
                ], V2_BLUE)]
            });
        }

        // VIEW WARNINGS
        if (userWarnings.length === 0) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([
                    V2.heading("✅ CLEAN RECORD", 2),
                    V2.text(`User **${target.user.tag}** has no recorded infractions.`)
                ], V2_BLUE)]
            });
        }

        const history = userWarnings.map((w, i) => {
            const date = new Date(w.timestamp).toLocaleDateString();
            const moderator = message.guild.members.cache.get(w.moderator)?.user.tag || "Unknown";
            return `**${i + 1}.** \`${date}\` • **Mod:** ${moderator}\n> **Reason:** ${w.reason}`;
        }).join("\n\n");

        const container = V2.container([
            V2.section(
                [
                    V2.heading("📜 INFRACTION HISTORY", 2),
                    V2.text(`**Subject:** ${target.user.tag}\n**Total Warnings:** ${userWarnings.length}`)
                ],
                target.user.displayAvatarURL({ forceStatic: true, extension: 'png' })
            ),
            V2.separator(),
            V2.text(history.length > 2000 ? history.substring(0, 2000) + "... (truncated)" : history),
            V2.separator(),
            V2.text(`*BlueSealPrime Justice System*`)
        ], V2_BLUE);

        message.channel.send({
            content: null,
            flags: V2.flag,
            components: [container]
        });
    }
};
