const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { BOT_OWNER_ID, SUCCESS_COLOR, ERROR_COLOR } = require("../config");

const DB_PATH = path.join(__dirname, "../data/antinuke.json");

function loadDB() {
    if (!fs.existsSync(DB_PATH)) return {};
    return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

function saveDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = {
    name: "antinuke",
    description: "Configure Anti-Nuke Protection",
    usage: "!antinuke <on|off|config|status>",
    permissions: [PermissionsBitField.Flags.Administrator],

    async execute(message, args) {
        // Only Owner can manage Anti-Nuke to prevent rogue admins from disabling it
        if (message.author.id !== BOT_OWNER_ID && message.author.id !== message.guild.ownerId && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply("🚫 **Security Alert:** Only Administrators or Owners can manage Anti-Nuke.");
        }

        const sub = args[0]?.toLowerCase();
        let db = loadDB();

        // Initialize if not exists
        if (!db[message.guild.id]) {
            db[message.guild.id] = {
                enabled: false,
                whitelisted: [], // Array of User IDs
                autorestore: true, // Default to enabled
                limits: {
                    channelDelete: 2, // 2 deletions per...
                    roleDelete: 2,
                    ban: 3,
                    kick: 3,
                    interval: 10000 // 10 seconds
                }
            };
        }

        const config = db[message.guild.id];

        if (sub === "on") {
            config.enabled = true;
            saveDB(db);
            return message.reply({ embeds: [new EmbedBuilder().setColor(SUCCESS_COLOR).setDescription("🛡️ **Anti-Nuke System ACTIVE**\nMonitoring for mass deletions and bans.")] });
        }

        if (sub === "off") {
            config.enabled = false;
            saveDB(db);
            return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("⚠️ **Anti-Nuke System DISABLED**")] });
        }

        if (sub === "status") {
            const embed = new EmbedBuilder()
                .setColor(config.enabled ? SUCCESS_COLOR : ERROR_COLOR)
                .setTitle("🛡️ Anti-Nuke Status")
                .addFields(
                    { name: "State", value: config.enabled ? "✅ Active" : "❌ Disabled", inline: true },
                    { name: "Autorestore", value: config.autorestore ? "✅ Enabled" : "❌ Disabled", inline: true },
                    { name: "Limits (per 10s)", value: `Channels: **${config.limits.channelDelete}**\nRoles: **${config.limits.roleDelete}**\nBans: **${config.limits.ban}**`, inline: false },
                    { name: "Whitelisted", value: `${config.whitelisted.length} users` }
                );
            return message.channel.send({ embeds: [embed] });
        }

        if (sub === "autorestore") {
            const action = args[1]?.toLowerCase();
            if (action === "on") {
                config.autorestore = true;
                saveDB(db);
                return message.reply({ embeds: [new EmbedBuilder().setColor(SUCCESS_COLOR).setDescription("✅ **Anti-Nuke Autorestore ENABLED**\nDeleted channels will now be restored (unless by owners).")] });
            } else if (action === "off") {
                config.autorestore = false;
                saveDB(db);
                return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("⚠️ **Anti-Nuke Autorestore DISABLED**\nDeleted channels will no longer be restored.")] });
            } else {
                return message.reply("Usage: `!antinuke autorestore <on|off>`");
            }
        }

        if (sub === "whitelist") {
            const user = message.mentions.users.first() || message.client.users.cache.get(args[1]);
            if (!user) return message.reply("Usage: `!antinuke whitelist @user`");

            if (!config.whitelisted.includes(user.id)) {
                config.whitelisted.push(user.id);
                saveDB(db);
                return message.reply(`✅ Added **${user.tag}** to Anti-Nuke Whitelist.`);
            } else {
                return message.reply(`⚠️ **${user.tag}** is already whitelisted.`);
            }
        }

        if (sub === "unwhitelist") {
            const user = message.mentions.users.first() || message.client.users.cache.get(args[1]);
            if (!user) return message.reply("Usage: `!antinuke unwhitelist @user`");

            config.whitelisted = config.whitelisted.filter(id => id !== user.id);
            saveDB(db);
            return message.reply(`🗑️ Removed **${user.tag}** from Anti-Nuke Whitelist.`);
        }

        message.reply("Usage: `!antinuke <on|off|status|autorestore|whitelist|unwhitelist>`");
    }
};
