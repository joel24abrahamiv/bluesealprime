const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "../data/247.json");

module.exports = {
    name: "sethomevc",
    aliases: ["shvc"],
    description: "Sets the home voice channel for the bot (Bot Owner Only)",
    usage: "!sethomevc | !sethomevc off",
    permissions: [],

    async execute(message, args) {
        const { BOT_OWNER_ID } = require("../config");
        const isBotOwner = message.author.id === BOT_OWNER_ID;

        if (!isBotOwner) {
            return message.reply("🚫 **Access Denied:** Only the **Bot Owner** can manage the Home VC settings.");
        }

        let db = {};
        if (fs.existsSync(DB_PATH)) {
            try { db = JSON.parse(fs.readFileSync(DB_PATH, "utf8")); } catch (e) { }
        }

        if (args[0]?.toLowerCase() === "off") {
            if (!db[message.guild.id]) return message.reply("ℹ️ **Home VC is already disabled.**");
            delete db[message.guild.id];
            fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

            const connection = require("@discordjs/voice").getVoiceConnection(message.guild.id);
            if (connection) connection.destroy();

            return message.reply("✅ **Home VC Disabled.** The bot will no longer stay in this channel permanently.");
        }

        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            return message.reply("⚠️ **Please join a voice channel first!**");
        }

        db[message.guild.id] = voiceChannel.id;
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

        try {
            const { joinVoiceChannel } = require("@discordjs/voice");
            joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator,
                selfDeaf: true
            });
        } catch (e) {
            console.error("Home VC Join Error:", e);
        }

        const embed = new EmbedBuilder()
            .setColor("#5865F2") // Blurple
            .setTitle("🏠 HOME VC SET")
            .setDescription(`The bot will now stay in **${voiceChannel.name}** indefinitely.\n\n> *Persistence active. Reconnection enforced.*`)
            .setFooter({ text: "BlueSealPrime • Core Systems" })
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }
};
