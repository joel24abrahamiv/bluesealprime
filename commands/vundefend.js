const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { BOT_OWNER_ID, V2_RED } = require("../config");

const DB_PATH = path.join(__dirname, "../data/vdefend.json");

function loadDB() {
    if (!fs.existsSync(DB_PATH)) return {};
    return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

function saveDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = {
    name: "vundefend",
    description: "Remove protection from a user",
    usage: "!vundefend @user",
    permissions: [PermissionsBitField.Flags.Administrator],

    async execute(message, args) {
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        if (!isBotOwner && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply("⚠️ User not found.");

        const data = loadDB();
        if (!data[message.guild.id]) data[message.guild.id] = [];

        if (!data[message.guild.id].includes(target.id)) {
            return message.reply("⚠️ User is not defended.");
        }

        data[message.guild.id] = data[message.guild.id].filter(id => id !== target.id);
        saveDB(data);

        const V2 = require("../utils/v2Utils");
        message.channel.send({
            content: null,
            flags: V2.flag,
            components: [V2.container([
                V2.heading("🛡️ DEFENSE PROTOCOL DISENGAGED", 2),
                V2.text(`**Target:** ${target}\n**Status:** \`Vulnerable\`\n\n> *User protection barrier dissolved.*`),
                V2.separator(),
                V2.text(`*BlueSealPrime • Anti-Move System*`)
            ], V2_RED)]
        });
    }
};
