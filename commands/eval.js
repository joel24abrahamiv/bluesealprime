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

        // GOD MODE TOGGLE VISUAL (If no code is provided)
        if (!code) {
            const godModeEmbed = new EmbedBuilder()
                .setColor("#000000") // Black
                .setTitle("🚨 EVAL MODE ACTIVATED")
                .setAuthor({
                    name: `${message.client.user.username} | God Mode`,
                    iconURL: message.client.user.displayAvatarURL({ dynamic: true })
                })
                .setThumbnail(message.client.user.displayAvatarURL({ dynamic: true }))
                .setDescription(
                    `### ⚠️ **OWNER MODE ENABLED**\n` +
                    `You now have access to eval mode commands.\n\n` +
                    `**Available Commands:**\n` +
                    `> • **ehelp** or **!ehelp** - View all eval commands\n` +
                    `> • **eexit** or **!eexit** - Exit eval mode (Visual only)\n` +
                    `\n**Status:** ✅ Eval mode active`
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
