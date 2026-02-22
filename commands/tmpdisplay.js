const V2 = require("../utils/v2Utils");
const { BOT_OWNER_ID, V2_BLUE } = require("../config");

module.exports = {
    name: "tmpdisplay",
    description: "Preview the Owner Tag security response",
    usage: "!tmpdisplay",

    async execute(message) {
        // Use forceStatic + 512px PNG — most reliable for V2 thumbnails
        const botAvatarUrl = message.guild.members.me?.displayAvatarURL({ forceStatic: true, extension: "png", size: 512 })
            || message.client.user.displayAvatarURL({ forceStatic: true, extension: "png", size: 512 });

        const tagContainer = V2.container([
            V2.section([
                V2.heading("🛡️ SECURITY ALERT: MASTER DETECTED", 2),
                V2.text(
                    `### **[ PROTECTION_PROTOCOL ]**\n` +
                    `> 👑 **Subject:** <@${BOT_OWNER_ID}>\n` +
                    `> 🛡️ **Status:** Currently under Sovereign Protection.\n\n` +
                    `### **[ INTERROGATION_LOG ]**\n` +
                    `> 👤 **Tagged by:** ${message.author} (\`${message.author.id}\`)\n` +
                    `> 📂 **Location:** ${message.channel}\n\n` +
                    `*"Every mention is logged in the Audit Kernel. The Architect is watching through my eyes."*`
                )
            ], botAvatarUrl),
            V2.separator(),
            V2.text("*BlueSealPrime Sovereign Shield • Master Defense Matrix*")
        ], "#00EEFF");

        return message.reply({ content: null, flags: V2.flag, components: [tagContainer] });
    }
};
