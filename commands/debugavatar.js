const { EmbedBuilder } = require("discord.js");
const djsVersion = require("discord.js").version;

module.exports = {
    name: "debugavatar",
    description: "Debug Server Avatar Issues",
    usage: "!debugavatar",
    permissions: [],

    async execute(message, args) {
        if (message.author.id !== message.guild.ownerId && message.author.id !== require("../config").BOT_OWNER_ID) {
            return message.reply("Only server owner (or bot owner) can use this debug command.");
        }

        const guild = message.guild;
        const botMember = guild.members.me;

        let logs = [];
        logs.push(`discord.js Version: ${djsVersion}`);
        logs.push(`Bot Member: ${botMember?.user?.tag} (${botMember?.id})`);
        logs.push(`Permissions: ${botMember?.permissions.toArray().join(", ")}`);

        // Check if setAvatar exists on botMember
        logs.push(`botMember.setAvatar exists? ${typeof botMember.setAvatar === 'function'}`);
        logs.push(`botMember.edit exists? ${typeof botMember.edit === 'function'}`);

        const serverIconUrl = guild.iconURL({ extension: 'png', size: 1024 });
        logs.push(`Server Icon URL: ${serverIconUrl || "None"}`);

        if (!serverIconUrl) {
            logs.push("No server icon to set.");
        } else {
            logs.push("Attempting fetch(url) then botMember.edit({ avatar: buffer })...");
            try {
                // Fetch the image as a buffer first
                const response = await fetch(serverIconUrl);
                if (!response.ok) throw new Error(`Failed to fetch icon: ${response.statusText}`);
                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                // Use editMe specifically for self-updates to ensure correct endpoint usage
                const result = await guild.members.editMe({ avatar: buffer });
                logs.push(`Success! New Avatar Hash: ${result.avatar}`);
            } catch (err) {
                logs.push(`ERROR: ${err.message}`);
                logs.push(`Code: ${err.code}`);
                if (err.rawError) logs.push(`Raw: ${JSON.stringify(err.rawError)}`);
            }
        }

        const embed = new EmbedBuilder()
            .setTitle("Debug Avatar")
            .setDescription("```\n" + logs.join("\n") + "\n```")
            .setColor("Yellow");

        message.reply({ embeds: [embed] });
    }
};
