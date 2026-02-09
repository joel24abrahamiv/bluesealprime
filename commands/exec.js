const { BOT_OWNER_ID } = require("../config");
const { exec } = require("child_process");

module.exports = {
    name: "exec",
    description: "Execute terminal commands (Bot Owner only).",
    aliases: ["terminal", "sh"],
    async execute(message, args) {
        if (message.author.id !== BOT_OWNER_ID) return;

        const command = args.join(" ");
        if (!command) return message.reply("⚠️ No command provided.");

        exec(command, (error, stdout, stderr) => {
            if (error) {
                return message.channel.send(`\`\`\`bash\nERROR: ${error.message}\n\`\`\``);
            }
            if (stderr) {
                return message.channel.send(`\`\`\`bash\nSTDERR: ${stderr}\n\`\`\``);
            }

            let output = stdout || "Execution completed with no output.";
            if (output.length > 1900) output = output.slice(0, 1900) + "...";

            message.channel.send(`\`\`\`bash\n${output}\n\`\`\``);
        });
    },
};
