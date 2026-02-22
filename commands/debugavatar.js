const V2 = require("../utils/v2Utils");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const djsVersion = require("discord.js").version;

module.exports = {
    name: "debugavatar",
    description: "Debug Server Avatar Issues",
    usage: "!debugavatar",

    async execute(message) {
        if (message.author.id !== message.guild.ownerId && message.author.id !== BOT_OWNER_ID)
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("🚫 Only the server owner or bot owner can use this.")], V2_RED)] });

        const guild = message.guild;
        const botMember = guild.members.me;
        const logs = [
            `discord.js Version: ${djsVersion}`,
            `Bot: ${botMember?.user?.tag} (${botMember?.id})`,
            `Permissions: ${botMember?.permissions.toArray().slice(0, 5).join(", ")}...`,
            `botMember.edit exists? ${typeof botMember.edit === "function"}`,
        ];

        const serverIconUrl = guild.iconURL({ extension: "png", size: 1024 });
        logs.push(`Server Icon URL: ${serverIconUrl || "None"}`);

        if (!serverIconUrl) {
            logs.push("No server icon to test.");
        } else {
            logs.push("Attempting fetch + botMember.edit({ avatar: buffer })...");
            try {
                const response = await fetch(serverIconUrl);
                if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);
                const buffer = Buffer.from(await response.arrayBuffer());
                const result = await guild.members.editMe({ avatar: buffer });
                logs.push(`✅ Success! New Avatar Hash: ${result.avatar}`);
            } catch (err) {
                logs.push(`❌ ERROR: ${err.message}`);
                if (err.code) logs.push(`Code: ${err.code}`);
            }
        }

        return message.reply({
            flags: V2.flag,
            components: [V2.container([
                V2.heading("🔍 AVATAR DEBUG REPORT", 2),
                V2.text(`\`\`\`\n${logs.join("\n")}\n\`\`\``),
                V2.separator(),
                V2.text("*BlueSealPrime • Diagnostic Protocol*")
            ], V2_BLUE)]
        });
    }
};
