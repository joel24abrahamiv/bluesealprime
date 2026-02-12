const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const fs = require("fs");
const path = require("path");

const CONFIG_PATH = path.join(__dirname, "../data/tempvc_config.json");

module.exports = {
    name: "setupvtc",
    aliases: ["svtc"],
    description: "Sets up the Join-to-Create temporary VC system",
    usage: "!setupvtc (While in the Join VC)",
    permissions: [PermissionsBitField.Flags.Administrator],

    async execute(message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply("🚫 **Access Denied:** Administrator permissions required.");
        }

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            return message.reply("⚠️ **Please join the 'Join to Create' voice channel first!**");
        }

        let config = {};
        if (fs.existsSync(CONFIG_PATH)) {
            try { config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8")); } catch (e) { }
        }

        config[message.guild.id] = {
            generatorId: voiceChannel.id,
            controlChannelId: message.channel.id
        };

        fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));

        const embed = new EmbedBuilder()
            .setColor("#00FF00")
            .setTitle("⚙️ TEMP VC SYSTEM INITIALIZED")
            .setDescription(
                `### ✅ Configuration Complete\n` +
                `> **Generator VC:** ${voiceChannel.name} (\`${voiceChannel.id}\`)\n` +
                `> **Control Channel:** ${message.channel} (\`${message.channel.id}\`)\n\n` +
                `Whenever a member joins the generator VC, a new temporary channel will be created and control buttons will be sent here.`
            )
            .setFooter({ text: "BlueSealPrime • Temp VC System" })
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }
};
