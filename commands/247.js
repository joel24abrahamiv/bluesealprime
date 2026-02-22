const V2 = require("../utils/v2Utils");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "../data/247.json");

module.exports = {
    name: "247",
    aliases: ["vcstay", "alwayson"],
    description: "Toggle 24/7 VC mode for the current voice channel",
    usage: "!247 | !247 off",

    async execute(message, args) {
        if (message.author.id !== BOT_OWNER_ID) {
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("🚫 **Access Denied:** Only the **Bot Owner** can manage 24/7 settings.")], V2_RED)] });
        }

        let db = {};
        if (fs.existsSync(DB_PATH)) { try { db = JSON.parse(fs.readFileSync(DB_PATH, "utf8")); } catch (e) { } }

        if (args[0]?.toLowerCase() === "off") {
            if (!db[message.guild.id]) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("ℹ️ **24/7 mode is already disabled.**")], V2_BLUE)] });
            delete db[message.guild.id];
            fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
            const conn = require("@discordjs/voice").getVoiceConnection(message.guild.id);
            if (conn) conn.destroy();
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("✅ **24/7 Mode Disabled.** The bot will no longer stay in voice channels.")], V2_BLUE)] });
        }

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ **Please join a voice channel first!**")], V2_RED)] });

        db[message.guild.id] = voiceChannel.id;
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

        try {
            const { joinVoiceChannel } = require("@discordjs/voice");
            joinVoiceChannel({ channelId: voiceChannel.id, guildId: message.guild.id, adapterCreator: message.guild.voiceAdapterCreator, selfDeaf: false, selfMute: true });
        } catch (e) { console.error("24/7 Join Error:", e); }

        return message.reply({
            flags: V2.flag,
            components: [V2.container([
                V2.section([
                    V2.heading("🔊 24/7 VC ENABLED", 2),
                    V2.text(`The bot will now stay in **${voiceChannel.name}** permanently.\n\n> *Persistence active. Auto-reconnection enabled.*`)
                ], V2.botAvatar(message)),
                V2.separator(),
                V2.text("*Use `!247 off` to disable.*")
            ], V2_BLUE)]
        });
    }
};
