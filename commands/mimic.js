const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { EMBED_COLOR, ERROR_COLOR } = require("../config");

module.exports = {
    name: "mimic",
    description: "Adopt the server's identity (Nickname + Avatar)",
    usage: "!mimic",
    permissions: [PermissionsBitField.Flags.ManageNicknames], // Minimum required

    async execute(message, args) {
        // Permission Check: Owner or Admin only (or Bot Owner)
        if (message.author.id !== message.guild.ownerId && !message.member.permissions.has(PermissionsBitField.Flags.Administrator) && message.author.id !== require("../config").BOT_OWNER_ID) {
            return message.reply("🚫 **Access Denied:** Only Administrators can change my identity.");
        }

        const guild = message.guild;
        const botMember = guild.members.me;

        // Reset Subcommand
        if (args[0]?.toLowerCase() === "reset") {
            try {
                await botMember.setNickname(null); // Reset nickname to default
                await guild.members.editMe({ avatar: null, banner: null }); // Reset server-specific avatar/banner
                return message.reply("🔄 **IDENTITY RESET:** My server-specific identity has been cleared.");
            } catch (err) {
                return message.reply("❌ **Reset Failed:** " + (err.message || "Unknown error"));
            }
        }

        // 1. Change Nickname (Instant, Server-Specific)
        if (botMember.nickname !== guild.name) {
            try {
                await botMember.setNickname(guild.name);
            } catch (err) {
                return message.reply(`❌ **Failed to Change Name:** I lack permission to change my nickname (Check Role Hierarchy).`);
            }
        }

        // 2. Change Avatar (Server-Specific)
        let avatarStatus = "Skipped (Matches Current)";
        const serverIconUrl = guild.iconURL({ extension: 'png', size: 1024 });

        // Check if we need to update the server avatar
        // Note: botMember.avatar is the hash of the server-specific avatar, or null if using global
        // We can't easily compare hashes if one is URL and other is hash, but can check if they are "visually" different?
        // Simpler approach: Just try to set it if exist. API handles no-op efficiently normally, but let's be safe.
        // Actually, just setting it is fine for this command.

        if (serverIconUrl) {
            try {
                // Fetch the image as a buffer first
                const response = await fetch(serverIconUrl);
                if (!response.ok) throw new Error(`Failed to fetch icon: ${response.statusText}`);
                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                // Use editMe specifically for self-updates
                await guild.members.editMe({ avatar: buffer });
                avatarStatus = "Updated (Server Only)";
            } catch (err) {
                if (err.code === 50035 || err.status === 429) {
                    avatarStatus = "Failed (Rate Limited - Try again later)";
                } else if (err.code === 50013) {
                    avatarStatus = "Failed (Missing Permissions)";
                } else {
                    avatarStatus = `Failed (${err.message})`;
                }
            }
        } else {
            // Reset if server has no icon
            try {
                await guild.members.editMe({ avatar: null, banner: null });
                avatarStatus = "Reset (Server Only)";
            } catch (e) { }
        }

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLOR)
            .setTitle("🎭 IDENTITY THEFT COMPLETE")
            .setDescription(`I have successfully mimicked **${guild.name}**.`)
            .addFields(
                { name: "🏷️ Name (Nickname)", value: `Changed to **${guild.name}**`, inline: true },
                { name: "🖼️ Avatar (Server Profile)", value: avatarStatus, inline: true }
            )
            .setThumbnail(guild.iconURL({ dynamic: true }) || message.client.user.displayAvatarURL())
            .setFooter({ text: "BlueSealPrime • Chameleon Protocol" });

        message.reply({ embeds: [embed] });
    }
};
