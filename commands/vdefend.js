const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { BOT_OWNER_ID, SUCCESS_COLOR, V2_BLUE } = require("../config");

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

        const V2 = require("../utils/v2Utils");
        message.channel.send({
            content: null,
            flags: V2.flag,
            components: [V2.container([
                V2.heading("🛡️ DEFENSE PROTOCOL ACTIVE", 2),
                V2.text(`**Target:** ${target}\n**Status:** \`Protected\`\n\n> *User protection barrier engaged.*`),
                V2.separator(),
                V2.text(`*BlueSealPrime • Anti-Move System*`)
            ], V2_BLUE)]
        });
    }
};
