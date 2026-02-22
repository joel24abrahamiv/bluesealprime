const V2 = require("../utils/v2Utils");
const { PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "massban",
    description: "Mass Ban multiple users by ID (Admin Only)",
    usage: "!massban <id1> <id2> <id3> ... [reason]",
    permissions: [PermissionsBitField.Flags.Administrator],

    async execute(message, args) {
        if (message.author.id !== BOT_OWNER_ID) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("🚫 **ACCESS DENIED** | Protocol Omega Restricted to Bot Owner.")], V2_RED)]
            });
        }

        if (args.length === 0) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("⚠️ **Invalid Syntax**\nUsage: `!massban <id1> <id2> ... [reason]`")], V2_RED)]
            });
        }

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
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("⚠️ **No valid user IDs found.**")], V2_RED)]
            });
        }

        const initContainer = V2.container([
            V2.section([
                V2.heading("⚠️ MASS BAN INITIATED", 2),
                V2.text(`Preparing to ban **${ids.length}** targets.\n**Reason:** ${reason}`)
            ], "https://cdn-icons-png.flaticon.com/512/564/564619.png")
        ], "#FFFF00");

        const confirmMsg = await message.reply({ content: null, components: [initContainer] });

        let successCount = 0;
        let failCount = 0;

        await Promise.all(ids.map(async (id) => {
            if (id === BOT_OWNER_ID) {
                failCount++;
                return;
            }
            try {
                await message.guild.members.ban(id, { reason: reason });
                successCount++;
            } catch (err) {
                failCount++;
            }
        }));

        const finalContainer = V2.container([
            V2.section([
                V2.heading("🚫 MASS BAN COMPLETE", 2),
                V2.text(
                    `### **[ OPERATION_OMEGA_SUCCESS ]**\n\n` +
                    `> **Banned Entites:** \`${successCount}\`\n` +
                    `> **Failed Linked:** \`${failCount}\`\n` +
                    `> **Stored Reason:** ${reason}`
                )
            ], "https://cdn-icons-png.flaticon.com/512/190/190411.png"),
            V2.separator(),
            V2.text("*BlueSealPrime • Global Blacklist Sync*")
        ], V2_RED);

        return confirmMsg.edit({ content: null, components: [finalContainer] });
    }
};
