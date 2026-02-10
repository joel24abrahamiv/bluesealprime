const { EmbedBuilder } = require("discord.js");
const { BOT_OWNER_ID } = require("../config");
const { inspect } = require("util");

module.exports = {
    name: "eval",
    description: "Execute JavaScript code (Bot Owner only).",
    aliases: ["ev", "e"],
    async execute(message, args) {
        if (message.author.id !== BOT_OWNER_ID) return;

        const code = args.join(" ");

        // GOD MODE TOGGLE (If no code is provided)
        if (!code) {
            // Toggle Logic
            global.GOD_MODE = !global.GOD_MODE;
            const status = global.GOD_MODE ? "ENABLED" : "DISABLED";
            const color = global.GOD_MODE ? "#00FF00" : "#FF0000";

            const godModeEmbed = new EmbedBuilder()
                .setColor(color)
                .setTitle(`🚨 GOD MODE ${status}`)
                .setAuthor({
                    name: `${message.client.user.username} | System Override`,
                    iconURL: message.client.user.displayAvatarURL({ dynamic: true })
                })
                .setThumbnail(message.client.user.displayAvatarURL({ dynamic: true }))
                .setDescription(
                    `### ⚠️ **ROOT ACCESS ${status}**\n` +
                    `System Level Controls have been **${status}**.\n\n` +
                    `**Unlocked Protocols:**\n` +
                    `> • **!elog** - Universal Logging Config\n` +
                    `> • **!ehelp** - Full God Mode Command List\n` +
                    `\n**Current Status:** ${global.GOD_MODE ? "✅ Active" : "⛔ Inactive"}`
                )
                .setFooter({ text: "System Override • root@blueseal" })
                .setTimestamp();

            return message.reply({ embeds: [godModeEmbed] });
        }

        // ACTUAL EVAL EXECUTION
        try {
            let evaled = eval(code);
            if (evaled instanceof Promise) evaled = await evaled;
            let output = typeof evaled !== "string" ? inspect(evaled, { depth: 0 }) : evaled;
            output = output.replace(new RegExp(message.client.token, "gi"), "[TOKEN]");
            if (output.length > 2000) output = output.slice(0, 1900) + "...";
            message.channel.send(`\`\`\`js\n${output}\n\`\`\``);
        } catch (err) {
            message.channel.send(`\`\`\`js\n${err}\n\`\`\``);
        }
    },
};
