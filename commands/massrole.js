const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, ERROR_COLOR, SUCCESS_COLOR } = require("../config");

module.exports = {
    name: "massrole",
    description: "Mass Add/Remove a role to ALL members (Admin Only)",
    usage: "!massrole <add|remove> <@role>",
    permissions: [PermissionsBitField.Flags.Administrator],

    async execute(message, args) {
        // 1. Permission Check
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;

        if (!isBotOwner && !isServerOwner && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("🚫 **ACCESS DENIED** | Level 5 Security Clearance Required.")] });
        }

        // 2. Argument Parsing
        const action = args[0]?.toLowerCase();
        const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);

        if (!["add", "remove"].includes(action) || !role) {
            return message.reply("⚠️ **Invalid Syntax**\nUsage: `!massrole <add|remove> <@role>`");
        }

        // 3. Hierarchy Check
        if (role.position >= message.guild.members.me.roles.highest.position) {
            return message.reply("⚠️ **Hierarchy Error**: I cannot manage a role that is higher than or equal to my highest role.");
        }

        // 4. Initial Feedback
        await message.reply({
            embeds: [new EmbedBuilder()
                .setColor("#FFFF00")
                .setTitle(`🔄 MASS ${action.toUpperCase()} INITIATED`)
                .setDescription(`Processing **${message.guild.memberCount}** members...\nTarget Role: ${role}\nThis may take a moment.`)
            ]
        });

        // 5. STAGGERED PROCESSING (Anti-Rate Limit)
        let successCount = 0;
        let failCount = 0;
        const members = (await message.guild.members.fetch()).filter(m => !m.user.bot);

        await Promise.all(Array.from(members.values()).map(async (member) => {
            try {
                if (action === "add" && !member.roles.cache.has(role.id)) {
                    await member.roles.add(role, "Mass Role Operation");
                    successCount++;
                } else if (action === "remove" && member.roles.cache.has(role.id)) {
                    await member.roles.remove(role, "Mass Role Operation");
                    successCount++;
                }
            } catch (err) {
                failCount++;
            }
        }));

        // 6. Final Report
        const embed = new EmbedBuilder()
            .setColor(SUCCESS_COLOR)
            .setTitle(`✅ MASS ${action.toUpperCase()} COMPLETE`)
            .setDescription(
                `**Operation Successful**\n` +
                `> Target Role: ${role}\n` +
                `> Processed: \`${successCount}\` members\n` +
                `> Failed: \`${failCount}\` (Hierarchy/Permissions)`
            )
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }
};
