const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, ERROR_COLOR, SUCCESS_COLOR } = require("../config");
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "../data/quarantine.json");

function getSavedRoles(guildId, userId) {
    if (!fs.existsSync(DB_PATH)) return [];
    try {
        const data = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
        return (data[guildId] && data[guildId][userId]) ? data[guildId][userId] : [];
    } catch (e) { return []; }
}

module.exports = {
    name: "uq",
    description: "Unquarantine a user (Admin/Owner Only)",
    aliases: ["unquarantine"],
    usage: "!uq @user",
    permissions: [PermissionsBitField.Flags.ModerateMembers],

    async execute(message, args) {
        // 1. Permission Check
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;

        if (!isBotOwner && !isServerOwner && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("🚫 **ACCESS DENIED** | Authorized Personnel Only.")] });
        }

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply("⚠️ **User not found.** Usage: `!uq @user`");

        // Refresh Member
        try { await target.fetch(); } catch (e) { }

        const qrRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === "quarantined");
        if (!qrRole) return message.reply("⚠️ **Quarantine system not active** (Role not found).");

        if (qrRole.position >= message.guild.members.me.roles.highest.position) {
            return message.reply("❌ **Hierarchy Error:** The `Quarantined` role is higher than my role. I cannot manage it.");
        }

        if (!target.roles.cache.has(qrRole.id)) {
            return message.reply("⚠️ User is not quarantined.");
        }

        // 2. Remove Quarantine & Restore Roles
        try {
            await target.roles.remove(qrRole, `Unquarantined by ${message.author.tag}`);

            // Restore roles
            const savedRoleIds = getSavedRoles(message.guild.id, target.id);
            if (savedRoleIds && savedRoleIds.length > 0) {
                // Filter valid/editable roles
                const rolesToRestore = savedRoleIds.filter(id => {
                    const r = message.guild.roles.cache.get(id);
                    return r && r.editable && r.id !== message.guild.id; // Exclude @everyone
                });

                if (rolesToRestore.length > 0) {
                    await target.roles.add(rolesToRestore, "Quarantine: Restoring roles");
                }
            }

            const embed = new EmbedBuilder()
                .setColor(SUCCESS_COLOR)
                .setTitle("✅ SUBJECT RELEASED")
                .setDescription(`**${target.user.tag}** has been released from quarantine.\nPrevious roles restored.`)
                .setFooter({ text: "BlueSealPrime Security" })
                .setTimestamp();

            return message.channel.send({ embeds: [embed] });

        } catch (e) {
            console.error(e);
            return message.reply(`❌ **Failed to unquarantine:** ${e.message}`);
        }
    }
};
