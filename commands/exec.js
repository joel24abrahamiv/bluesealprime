const V2 = require("../utils/v2Utils");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const { exec } = require("child_process");

module.exports = {
    name: "exec",
    description: "Execute terminal commands (Bot Owner only).",
    aliases: ["terminal", "sh"],
    async execute(message, args) {
        if (message.author.id !== BOT_OWNER_ID) return;

        const command = args.join(" ");
        if (!command) return message.reply({
            content: null,
            flags: V2.flag,
            components: [V2.container([V2.text("⚠️ **Fault:** No command string provided for execution.")], V2_RED)]
        });

        const statusContainer = V2.container([V2.text(`🔄 **Synchronizing Terminal...**\n> Command: \`${command}\``)], V2_BLUE);
        const statusMsg = await message.reply({ content: null, flags: V2.flag, components: [statusContainer] });

        exec(command, (error, stdout, stderr) => {
            let output = "";
            let color = V2_BLUE;

            if (error) {
                output = `### **[ TERMINAL_ERROR ]**\n\`\`\`bash\n${error.message}\n\`\`\``;
                color = V2_RED;
            } else if (stderr) {
                output = `### **[ TERMINAL_STDERR ]**\n\`\`\`bash\n${stderr}\n\`\`\``;
                color = V2_RED;
            } else {
                let res = stdout || "Execution completed with no output.";
                if (res.length > 1800) res = res.slice(0, 1800) + "\n[Output Truncated]";
                output = `### **[ TERMINAL_STDOUT ]**\n\`\`\`bash\n${res}\n\`\`\``;
            }

            const finalContainer = V2.container([
                V2.section([
                    V2.heading("💻 KERNEL TERMINAL", 2),
                    V2.text(output)
                ], "https://cdn-icons-png.flaticon.com/512/906/906334.png"),
                V2.separator(),
                V2.text(`*BlueSealPrime • Root Access • ${new Date().toLocaleTimeString()}*`)
            ], color);

            statusMsg.edit({ content: null, components: [finalContainer] }).catch(() => {
                message.channel.send({ content: null, components: [finalContainer] });
            });
        });
    },
};
