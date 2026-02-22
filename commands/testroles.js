const V2 = require("../utils/v2Utils");
const { BOT_OWNER_ID, V2_BLUE } = require("../config");

module.exports = {
    name: "testroles",
    description: "Initialize 5 temporary test roles",
    aliases: ["tr"],

    async execute(message, args) {
        if (message.author.id !== BOT_OWNER_ID) return;

        const roleNames = [
            "Cyber Sentry",
            "Neural Link",
            "Data Ghost",
            "Void Runner",
            "Core Shadow"
        ];

        try {
            const logs = [];
            for (const name of roleNames) {
                await message.guild.roles.create({
                    name: name,
                    reason: "Test role initialization"
                });
                logs.push(`✅ Created role: **${name}**`);
            }

            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([
                    V2.heading("🎭 TEST ROLES INITIALIZED", 2),
                    V2.text(logs.join("\n"))
                ], V2_BLUE)]
            });
        } catch (err) {
            console.error(err);
            return message.reply("❌ **ERROR:** Failed to create roles.");
        }
    }
};
