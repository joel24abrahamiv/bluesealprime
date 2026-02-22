const V2 = require("../utils/v2Utils");
const { PermissionsBitField } = require("discord.js");
const { V2_BLUE, V2_RED } = require("../config");
const fs = require("fs");
const path = require("path");

const CONFIG_PATH = path.join(__dirname, "../data/tempvc_config.json");

module.exports = {
    name: "setupvtc",
    aliases: ["svtc"],
    description: "Sets up the Join-to-Create temporary VC system",
    usage: "!setupvtc (while in the Join VC)",
    permissions: [PermissionsBitField.Flags.Administrator],

    async execute(message) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("🚫 **Access Denied:** Administrator permissions required.")], V2_RED)] });

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel)
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ **Please join the 'Join to Create' voice channel first!**")], V2_RED)] });

        let config = {};
        if (fs.existsSync(CONFIG_PATH)) { try { config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8")); } catch (e) { } }

        config[message.guild.id] = { generatorId: voiceChannel.id, controlChannelId: message.channel.id };
        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));

        return message.reply({
            flags: V2.flag,
            components: [V2.container([
                V2.heading("⚙️ TEMP VC SYSTEM INITIALIZED", 2),
                V2.text(
                    `### ✅ Configuration Complete\n` +
                    `> **Generator VC:** ${voiceChannel.name} (\`${voiceChannel.id}\`)\n` +
                    `> **Control Channel:** ${message.channel} (\`${message.channel.id}\`)\n\n` +
                    `When a member joins the generator VC, a new temporary channel will be created and control buttons will appear here.`
                ),
                V2.separator(),
                V2.text("*BlueSealPrime • Temp VC System*")
            ], V2_BLUE)]
        });
    }
};
