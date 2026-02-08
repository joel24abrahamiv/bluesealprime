const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { ERROR_COLOR, SUCCESS_COLOR } = require("../config");

module.exports = {
    name: "rolecopy",
    description: "Copy permissions from one role to an existing role",
    usage: "!rolecopy <targetRole> <sourceRole>",
    permissions: [PermissionsBitField.Flags.ManageRoles],

    async execute(message, args) {
        if (args.length < 2) {
            return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("⚠️ **Missing Arguments.** Usage: `!rolecopy <targetRole> <sourceRole>`")] });
        }

        const targetRole = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
        const sourceRole = message.mentions.roles.filter(r => r.id !== targetRole?.id).first() || message.guild.roles.cache.get(args[1]);

        if (!targetRole || !sourceRole) {
            return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("❌ **Role Not Found.** Ensure both roles are valid mentions or IDs.")] });
        }

        // Hierarchy Checks
        if (targetRole.position >= message.guild.members.me.roles.highest.position) {
            return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("🚫 **Hierarchy Error:** I cannot modify a role higher than or equal to my own.")] });
        }

        if (sourceRole.position >= message.guild.members.me.roles.highest.position && message.author.id !== message.guild.ownerId && message.author.id !== require("../config").BOT_OWNER_ID) {
            return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("🚫 **Security Violation:** You cannot copy permissions from a role higher than the bot's position unless you are the Sovereign.")] });
        }

        try {
            await targetRole.setPermissions(sourceRole.permissions.bitfield, `Permissions inherited from ${sourceRole.name} by ${message.author.tag}`);

            const embed = new EmbedBuilder()
                .setColor(SUCCESS_COLOR)
                .setTitle("🧬 PERMISSION SYNCHRONIZATION COMPLETE")
                .setDescription(`**Permission matrix successfully replicated.**\nTarget role has inherited all protocols from the template.`)
                .addFields(
                    { name: "🎯 Target Role", value: `${targetRole} (\`${targetRole.id}\`)`, inline: true },
                    { name: "🧬 Source Role", value: `${sourceRole} (\`${sourceRole.id}\`)`, inline: true },
                    { name: "⚖️ Bits Transferred", value: `\`${sourceRole.permissions.bitfield.toString()}\``, inline: false }
                )
                .setImage("https://media.discordapp.net/attachments/1093150036663308318/1113885934572900454/line-red.gif")
                .setFooter({ text: "BlueSealPrime • Role Inheritance Manager" })
                .setTimestamp();

            return message.channel.send({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("❌ Failed to synchronize permissions. Check my role position.")] });
        }
    }
};
