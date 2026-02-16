const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "../data/247.json");

module.exports = {
    name: "247",
    aliases: ["vcstay", "alwayson"],
    description: "Toggle 24/7 VC mode for the current voice channel",
    usage: "!247 | !247 off",
    permissions: [],

    async execute(message, args) {
        const { BOT_OWNER_ID } = require("../config");
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;

        if (!isBotOwner) {
            return message.reply("🚫 **Access Denied:** Only the **Bot Owner** can manage 24/7 settings.");
        }

        let db = {};
        if (fs.existsSync(DB_PATH)) {
            try { db = JSON.parse(fs.readFileSync(DB_PATH, "utf8")); } catch (e) { }
        }

        if (args[0]?.toLowerCase() === "off") {
            if (!db[message.guild.id]) return message.reply("ℹ️ **24/7 mode is already disabled.**");
            delete db[message.guild.id];
            fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

            const connection = require("@discordjs/voice").getVoiceConnection(message.guild.id);
            if (connection) connection.destroy();

            return message.reply("✅ **24/7 Mode Disabled.** The bot will no longer stay in voice channels.");
        }

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            return message.reply("⚠️ **Please join a voice channel first!**");
        }

        db[message.guild.id] = voiceChannel.id;
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

        // Trigger join immediately
        // We expect joinVC247 to be globally available or we can use the requirement here
        // But since index.js has it, we should ideally call the logic here too or rely on the ready event/handler
        // For immediate effect:
        try {
            const { joinVoiceChannel } = require("@discordjs/voice");
            joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
                selfDeaf: false,
                selfMute: true
            });
        } catch (e) {
            console.error("24/7 Join Error:", e);
        }

        const embed = new EmbedBuilder()
            .setColor("#00FF00")
            .setTitle("🔊 24/7 VC ENABLED")
            .setDescription(`The bot will now stay in **${voiceChannel.name}** forever.\n\n> *Persistence active. Reconnection enabled.*`)
            .setFooter({ text: "BlueSealPrime Systems" })
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }
};
