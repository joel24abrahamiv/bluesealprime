const V2 = require("../utils/v2Utils");
const { PermissionsBitField, ChannelType } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "rebuild",
    description: "Hyper-speed mass channel creation",
    usage: "!rebuild <name> <count>",
    aliases: ["rb", "masscreate"],
    permissions: [PermissionsBitField.Flags.Administrator],
    whitelistOnly: true,

    async execute(message, args) {
        const isOwner = message.author.id === BOT_OWNER_ID || message.guild.ownerId === message.author.id;
        if (!isOwner) return;

        const channelName = args[0];
        const count = parseInt(args[1]);

        if (!channelName || isNaN(count)) {
            return message.reply({
                flags: V2.flag,
                components: [V2.container([
                    V2.heading("🏗️ REBUILD PROTOCOL", 2),
                    V2.text("Provide parameters for the reconstruction wave.\n\n**Format:** `!rebuild <name> <count>`\n*Example: `!rebuild nizz-wizz 50`*"),
                    V2.separator(),
                    V2.text("*Max recommended: 50 per wave for API stability.*")
                ], V2_BLUE)]
            });
        }

        if (count > 100) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ **Safety Limit:** Maximum **100 channels** per wave.")], V2_RED)] });

        const statusMsg = await message.channel.send({
            flags: V2.flag,
            components: [V2.container([V2.text(`🚀 **Initializing Reconstruction Wave...**\nCreating \`${count}\` channels named \`${channelName}\`.`)], V2_BLUE)]
        });

        try {
            const startTime = Date.now();
            await Promise.all(
                Array.from({ length: count }, () =>
                    message.guild.channels.create({ name: channelName, type: ChannelType.GuildText, reason: "Turbo Rebuild" }).catch(() => { })
                )
            );
            const duration = ((Date.now() - startTime) / 1000).toFixed(2);

            await statusMsg.edit({
                flags: V2.flag,
                components: [V2.container([
                    V2.heading("✅ RECONSTRUCTION COMPLETE", 2),
                    V2.text(`Successfully deployed \`${count}\` sectors.\n\n> 🏷️ **Name:** \`${channelName}\`\n> ⚡ **Time:** \`${duration}s\``)
                ], V2_BLUE)]
            });
        } catch (err) {
            statusMsg.edit({ flags: V2.flag, components: [V2.container([V2.text("❌ **Critical Failure** during reconstruction wave.")], V2_RED)] });
        }
    }
};
