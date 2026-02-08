const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { BOT_OWNER_ID, SUCCESS_COLOR } = require("../config");

const DB_PATH = path.join(__dirname, "../data/vdefend.json");

function loadDB() {
    if (!fs.existsSync(DB_PATH)) return {};
    return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

function saveDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = {
    name: "vdefend",
    description: "Protect a user from being moved/disconnected",
    usage: "!vdefend @user",
    permissions: [PermissionsBitField.Flags.Administrator], // High perm required

    async execute(message, args) {
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        if (!isBotOwner && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply("⚠️ User not found.");

        const data = loadDB();
        if (!data[message.guild.id]) data[message.guild.id] = [];

        if (data[message.guild.id].includes(target.id)) {
            return message.reply("⚠️ User is already defended.");
        }

        data[message.guild.id].push(target.id);
        saveDB(data);

        message.reply({
            embeds: [new EmbedBuilder()
                .setColor(SUCCESS_COLOR)
                .setDescription(`🛡️ **${target.user.tag}** is now protected (vdefend active).`)
            ]
        });
    }
};
