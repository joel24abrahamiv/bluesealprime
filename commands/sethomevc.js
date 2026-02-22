const V2 = require("../utils/v2Utils");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "../data/247.json");

module.exports = {
    name: "sethomevc",
    aliases: ["shvc"],
    description: "Sets the home voice channel for the bot (Bot Owner Only)",
    usage: "!sethomevc | !sethomevc off",

    async execute(message, args) {
        if (message.author.id !== BOT_OWNER_ID)
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("🚫 **Access Denied:** Only the **Bot Owner** can manage Home VC settings.")], V2_RED)] });

        let db = {};
        if (fs.existsSync(DB_PATH)) { try { db = JSON.parse(fs.readFileSync(DB_PATH, "utf8")); } catch (e) { } }

        if (args[0]?.toLowerCase() === "off") {
            if (!db[message.guild.id]) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("ℹ️ **Home VC is already disabled.**")], V2_BLUE)] });
            delete db[message.guild.id];
            fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
            const conn = require("@discordjs/voice").getVoiceConnection(message.guild.id);
            if (conn) conn.destroy();
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("✅ **Home VC Disabled.** The bot will no longer persist in this channel.")], V2_BLUE)] });
        }

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ **Please join a voice channel first!**")], V2_RED)] });

        db[message.guild.id] = voiceChannel.id;
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

        try {
            const { joinVoiceChannel } = require("@discordjs/voice");
            joinVoiceChannel({ channelId: voiceChannel.id, guildId: message.guild.id, adapterCreator: message.guild.voiceAdapterCreator, selfDeaf: false, selfMute: true });
        } catch (e) { console.error("Home VC Join Error:", e); }

        return message.reply({
            flags: V2.flag,
            components: [V2.container([
                V2.section([
                    V2.heading("🏠 HOME VC SET", 2),
                    V2.text(`The bot will now permanently reside in **${voiceChannel.name}**.\n\n> *Persistence active. Auto-reconnection enforced.*\n> Use \`!sethomevc off\` to disable.`)
                ], V2.botAvatar(message))
            ], V2_BLUE)]
        });
    }
};
