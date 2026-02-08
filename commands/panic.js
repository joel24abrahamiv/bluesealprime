const { EmbedBuilder, PermissionsBitField, ChannelType } = require("discord.js");
const { BOT_OWNER_ID } = require("../config");

module.exports = {
    name: "panic",
    description: "🚨 LOCKDOWN SERVER (Administrator Only)",
    aliases: ["lockdown", "emergency"],
    permissions: [PermissionsBitField.Flags.Administrator],
    whitelistOnly: true,

    async execute(message, args) {
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;

        if (!isBotOwner && !isServerOwner && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply("🚫 **Authorized Personnel Only.**");
        }

        const mode = args[0]?.toLowerCase();

        if (mode === "on" || mode === "start") {
            const processingMsg = await message.reply("🚨 **INITIATING LOCKDOWN...** Processing channels...");

            const guild = message.guild;
            const channels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText);

            let lockedCount = 0;
            // Loop through text channels and deny SendMessages for Everyone
            for (const [id, channel] of channels) {
                try {
                    await channel.permissionOverwrites.edit(guild.roles.everyone, {
                        SendMessages: false,
                        AddReactions: false
                    });
                    lockedCount++;
                    // Optional: Send message in each channel? Might be spammy.
                } catch (e) {
                    console.error(`Failed to lock ${channel.name}:`, e);
                }
            }

            // Optional: Set Verification Level to High
            try {
                await guild.setVerificationLevel(3); // High
            } catch (e) { }

            const embed = new EmbedBuilder()
                .setColor("#FF0000")
                .setTitle("🚨 SERVER LOCKDOWN ACTIVE")
                .setDescription(`**PANIC MODE ENGAGED**\n\n🔒 **${lockedCount} Channels Locked.**\n🛡️ **Verification Level:** HIGH\n\n*Please wait for updates from administration.*`)
                .setThumbnail("https://media.discordapp.net/attachments/1093150036663308318/1113885934572900454/line-red.gif")
                .setFooter({ text: "BlueSealPrime • Emergency Protocol" });

            await processingMsg.delete();
            return message.channel.send({ embeds: [embed] });
        }

        if (mode === "off" || mode === "end") {
            const processingMsg = await message.reply("🟢 **LIFTING LOCKDOWN...** Restoring channels...");

            const guild = message.guild;
            const channels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText);

            let unlockedCount = 0;
            for (const [id, channel] of channels) {
                try {
                    await channel.permissionOverwrites.edit(guild.roles.everyone, {
                        SendMessages: null, // Reset to neutral (inherits or default)
                        AddReactions: null
                    });
                    unlockedCount++;
                } catch (e) { }
            }

            // Restore Verification Level? (Maybe manual or set to None/Low)

            const embed = new EmbedBuilder()
                .setColor("#00FF00")
                .setTitle("✅ LOCKDOWN LIFTED")
                .setDescription(`**PANIC MODE DISENGAGED**\n\n🔓 **${unlockedCount} Channels Restored.**\n\n*Thank you for your patience.*`)
                .setFooter({ text: "BlueSealPrime • System Normalized" });

            await processingMsg.delete();
            return message.channel.send({ embeds: [embed] });
        }

        return message.reply("Usage: `!panic on` (Lockdown) or `!panic off` (Lift)");
    }
};
