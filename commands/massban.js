const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, ERROR_COLOR, SUCCESS_COLOR } = require("../config");

module.exports = {
    name: "massban",
    description: "Mass Ban multiple users by ID (Admin Only)",
    usage: "!massban <id1> <id2> <id3> ... [reason]",
    permissions: [PermissionsBitField.Flags.Administrator],

    async execute(message, args) {
        // Owner/Admin Check
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;

        if (!isBotOwner && !isServerOwner && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("🚫 **ACCESS DENIED** | Protocol Omega Authorization Required.")] });
        }

        if (args.length === 0) {
            return message.reply("⚠️ **Invalid Syntax**\nUsage: `!massban <id1> <id2> ... [reason]`");
        }

        // Separate IDs strings from Reason string
        // Assuming IDs are numeric strings of length 17-19. 
        // Anything else is considered part of the reason.
        const ids = [];
        const reasonParts = [];

        for (const arg of args) {
            if (/^\d{17,19}$/.test(arg)) {
                ids.push(arg);
            } else {
                reasonParts.push(arg);
            }
        }

        const reason = reasonParts.join(" ") || "Mass Ban Operation - Security Protocol";

        if (ids.length === 0) {
            return message.reply("⚠️ **No valid user IDs found.**");
        }

        // Confirmation Message
        const confirmMsg = await message.reply({
            embeds: [new EmbedBuilder()
                .setColor("#FFFF00")
                .setTitle("⚠️ MASS BAN INITIATED")
                .setDescription(`preparing to ban **${ids.length}** targets.\nReason: ${reason}`)
                .setFooter({ text: "Processing..." })
            ]
        });

        let successCount = 0;
        let failCount = 0;

        const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        for (const id of ids) {
            // Safety: Never ban the Bot Owner
            if (id === BOT_OWNER_ID) {
                failCount++;
                continue;
            }

            try {
                await message.guild.members.ban(id, { reason: reason });
                successCount++;
                await wait(400); // 🛡️ Anti-Rate Limit Stagger
            } catch (err) {
                console.error(`Failed to ban ${id}:`, err);
                failCount++;
            }
        }

        const finalEmbed = new EmbedBuilder()
            .setColor(SUCCESS_COLOR)
            .setTitle("🚫 MASS BAN COMPLETE")
            .setDescription(
                `**Targets Eliminated**\n` +
                `> Banned: \`${successCount}\`\n` +
                `> Failed: \`${failCount}\`\n` +
                `> Reason: ${reason}`
            )
            .setTimestamp();

        return confirmMsg.edit({ embeds: [finalEmbed] });
    }
};
