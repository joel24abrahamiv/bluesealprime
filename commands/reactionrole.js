const fs = require("fs");
const path = require("path");
const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, SUCCESS_COLOR, ERROR_COLOR, EMBED_COLOR } = require("../config");

const DATA_DIR = path.join(__dirname, "../data");
const DB_PATH = path.join(DATA_DIR, "reactionroles.json");

// ───── DATA MANAGEMENT ─────
function loadReactionRoles() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify({}, null, 2));
        return {};
    }
    try {
        return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
    } catch {
        return {};
    }
}

function saveReactionRoles(data) {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = {
    name: "reactionrole",
    description: "Manage reaction role panels",
    usage: "!reactionrole <create|add|remove|list|delete>",
    permissions: [PermissionsBitField.Flags.ManageRoles],
    aliases: ["rr"],

    async execute(message, args) {
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;

        // Permission Check (Owner Bypass)
        if (!isBotOwner && !isServerOwner && !message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply({ embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("🚫 You need Manage Roles permission.")] });
        }

        const subCommand = args[0]?.toLowerCase();
        const data = loadReactionRoles();

        // ───── CREATE PANEL ─────
        if (subCommand === "create") {
            const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
            const title = args.slice(2).join(" ") || "Self-Assign Roles";

            if (!channel) {
                return message.reply("⚠️ **Please mention a channel.**\nUsage: `!reactionrole create #channel <title>`");
            }

            const embed = new EmbedBuilder()
                .setColor(EMBED_COLOR)
                .setTitle(`🎭 ${title}`)
                .setDescription(
                    "```diff\n" +
                    "+ ROLE ASSIGNMENT PANEL\n" +
                    "+ REACT TO CLAIM ROLES\n" +
                    "```\n\n\n" +
                    "**Click the reactions below to assign yourself roles.**\n\n" +
                    "> React to add a role\n\n" +
                    "> Remove reaction to remove the role\n\n\n" +
                    "*No roles configured yet. Use `!reactionrole add` to add roles.*"
                )
                .setFooter({ text: "BlueSealPrime • Reaction Roles", iconURL: message.client.user.displayAvatarURL() })
                .setTimestamp();

            const panelMessage = await channel.send({ embeds: [embed] });

            // Store in database
            data[panelMessage.id] = {
                guildId: message.guild.id,
                channelId: channel.id,
                roles: []
            };
            saveReactionRoles(data);

            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor(SUCCESS_COLOR)
                    .setTitle("✅ Reaction Role Panel Created")
                    .setDescription(
                        `**Panel created in ${channel}**\n\n` +
                        `> **Message ID:** \`${panelMessage.id}\`\n\n` +
                        `> Use \`!reactionrole add ${panelMessage.id} <emoji> <role>\` to add roles`
                    )
                    .setFooter({ text: "BlueSealPrime • Reaction Roles" })
                ]
            });
        }

        // ───── ADD ROLE ─────
        if (subCommand === "add") {
            const messageId = args[1];
            const emoji = args[2];
            const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[3]);

            if (!messageId || !emoji || !role) {
                return message.reply("⚠️ **Invalid syntax.**\nUsage: `!reactionrole add <messageID> <emoji> <@role>`");
            }

            if (!data[messageId]) {
                return message.reply("❌ **That message is not a reaction role panel.**");
            }

            // Check if emoji already exists
            if (data[messageId].roles.some(r => r.emoji === emoji)) {
                return message.reply("⚠️ **That emoji is already assigned to a role on this panel.**");
            }

            // Add role to panel
            data[messageId].roles.push({ emoji, roleId: role.id });
            saveReactionRoles(data);

            // Fetch and update the message
            try {
                const channel = message.guild.channels.cache.get(data[messageId].channelId);
                const panelMessage = await channel.messages.fetch(messageId);

                // Add reaction
                await panelMessage.react(emoji);

                // Update embed
                const currentEmbed = panelMessage.embeds[0];
                const roleList = data[messageId].roles.map(r => `${r.emoji} - <@&${r.roleId}>`).join("\n");

                const updatedEmbed = EmbedBuilder.from(currentEmbed)
                    .setDescription(
                        "```diff\n" +
                        "+ ROLE ASSIGNMENT PANEL\n" +
                        "+ REACT TO CLAIM ROLES\n" +
                        "```\n\n\n" +
                        "**Click the reactions below to assign yourself roles.**\n\n" +
                        "> React to add a role\n\n" +
                        "> Remove reaction to remove the role\n\n\n" +
                        `**Available Roles:**\n${roleList}`
                    );

                await panelMessage.edit({ embeds: [updatedEmbed] });

                return message.reply({
                    embeds: [new EmbedBuilder()
                        .setColor(SUCCESS_COLOR)
                        .setTitle("✅ Role Added to Panel")
                        .setDescription(`**${emoji} → ${role}** has been added to the reaction role panel.`)
                        .setFooter({ text: "BlueSealPrime • Reaction Roles" })
                    ]
                });
            } catch (err) {
                console.error(err);
                return message.reply("❌ **Failed to update the panel.** Make sure the message still exists.");
            }
        }

        // ───── REMOVE ROLE ─────
        if (subCommand === "remove") {
            const messageId = args[1];
            const emoji = args[2];

            if (!messageId || !emoji) {
                return message.reply("⚠️ **Invalid syntax.**\nUsage: `!reactionrole remove <messageID> <emoji>`");
            }

            if (!data[messageId]) {
                return message.reply("❌ **That message is not a reaction role panel.**");
            }

            const roleIndex = data[messageId].roles.findIndex(r => r.emoji === emoji);
            if (roleIndex === -1) {
                return message.reply("⚠️ **That emoji is not assigned to any role on this panel.**");
            }

            // Remove role
            data[messageId].roles.splice(roleIndex, 1);
            saveReactionRoles(data);

            // Update message
            try {
                const channel = message.guild.channels.cache.get(data[messageId].channelId);
                const panelMessage = await channel.messages.fetch(messageId);

                // Remove reaction
                await panelMessage.reactions.cache.get(emoji)?.remove();

                // Update embed
                const currentEmbed = panelMessage.embeds[0];
                const roleList = data[messageId].roles.length > 0
                    ? data[messageId].roles.map(r => `${r.emoji} - <@&${r.roleId}>`).join("\n")
                    : "*No roles configured yet. Use `!reactionrole add` to add roles.*";

                const updatedEmbed = EmbedBuilder.from(currentEmbed)
                    .setDescription(
                        "```diff\n" +
                        "+ ROLE ASSIGNMENT PANEL\n" +
                        "+ REACT TO CLAIM ROLES\n" +
                        "```\n\n\n" +
                        "**Click the reactions below to assign yourself roles.**\n\n" +
                        "> React to add a role\n\n" +
                        "> Remove reaction to remove the role\n\n\n" +
                        `**Available Roles:**\n${roleList}`
                    );

                await panelMessage.edit({ embeds: [updatedEmbed] });

                return message.reply({
                    embeds: [new EmbedBuilder()
                        .setColor(SUCCESS_COLOR)
                        .setTitle("✅ Role Removed from Panel")
                        .setDescription(`**${emoji}** has been removed from the reaction role panel.`)
                        .setFooter({ text: "BlueSealPrime • Reaction Roles" })
                    ]
                });
            } catch (err) {
                console.error(err);
                return message.reply("❌ **Failed to update the panel.**");
            }
        }

        // ───── LIST PANELS ─────
        if (subCommand === "list") {
            const guildPanels = Object.entries(data).filter(([id, panel]) => panel.guildId === message.guild.id);

            if (guildPanels.length === 0) {
                return message.reply("ℹ️ **No reaction role panels found in this server.**");
            }

            const panelList = guildPanels.map(([id, panel]) => {
                return `**Message ID:** \`${id}\`\n> Channel: <#${panel.channelId}>\n> Roles: ${panel.roles.length}`;
            }).join("\n\n");

            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor(EMBED_COLOR)
                    .setTitle("📋 Reaction Role Panels")
                    .setDescription(panelList)
                    .setFooter({ text: "BlueSealPrime • Reaction Roles" })
                ]
            });
        }

        // ───── DELETE PANEL ─────
        if (subCommand === "delete") {
            const messageId = args[1];

            if (!messageId) {
                return message.reply("⚠️ **Invalid syntax.**\nUsage: `!reactionrole delete <messageID>`");
            }

            if (!data[messageId]) {
                return message.reply("❌ **That message is not a reaction role panel.**");
            }

            // Delete from database
            delete data[messageId];
            saveReactionRoles(data);

            return message.reply({
                embeds: [new EmbedBuilder()
                    .setColor(SUCCESS_COLOR)
                    .setTitle("✅ Panel Deleted")
                    .setDescription("**The reaction role panel has been removed from the database.**\n\n> The message itself was not deleted.")
                    .setFooter({ text: "BlueSealPrime • Reaction Roles" })
                ]
            });
        }

        return message.reply("❓ **Unknown subcommand.**\nUse: `create`, `add`, `remove`, `list`, or `delete`");
    }
};
