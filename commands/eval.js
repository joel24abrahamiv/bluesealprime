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
        if (!code) return message.reply("⚠️ No code provided.");

        try {
            let evaled = eval(code);

            if (evaled instanceof Promise) evaled = await evaled;

            let output = typeof evaled !== "string" ? inspect(evaled, { depth: 0 }) : evaled;

            // Handle sensitive data
            output = output.replace(new RegExp(message.client.token, "gi"), "[TOKEN]");

            if (output.length > 2000) output = output.slice(0, 1900) + "...";

            message.channel.send(`\`\`\`js\n${output}\n\`\`\``);
        } catch (err) {
            message.channel.send(`\`\`\`js\n${err}\n\`\`\``);
        }
    },
};
