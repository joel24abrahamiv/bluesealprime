const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const { PermissionsBitField } = require("discord.js");
const axios = require("axios");

const cooldowns = new Map();

module.exports = {
    name: "setguildavatar",
    description: "Set the bot's avatar ONLY for this guild (Force Attempt)",
    usage: "!setguildavatar <url | default>",
    aliases: ["setavatar", "pfp", "setpfp"],
    permissions: [PermissionsBitField.Flags.Administrator],

    async execute(message, args) {
        const V2 = require("../utils/v2Utils");
        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;

        if (!isBotOwner && !isServerOwner) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("🚫 **SOVEREIGN ONLY:** You are not authorized.")], V2_RED)]
            });
        }

        let url = message.attachments.first()?.url;

        if (!url && args.length > 0) {
            // Find the first argument that looks like a URL
            const foundUrl = args.find(arg => arg.startsWith("http://") || arg.startsWith("https://"));
            if (foundUrl) {
                url = foundUrl;
            } else if (args[0].toLowerCase() === "default") {
                url = "default";
            }
        }

        if (!url) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("⚠️ **Missing Image Source:** Please provide a URL, attach an image, or type `default`.")], V2_RED)]
            });
        }

        const { REST } = require('@discordjs/rest');
        const { Routes } = require('discord-api-types/v10');
        require('dotenv').config(); // Ensure token is loaded
        const rest = new REST({ version: '10' }).setToken(process.env.TOKEN || message.client.token);

        try {
            // Check for 'default' reset
            if (url.toLowerCase() === "default") {
                await rest.patch(Routes.guildMember(message.guild.id, '@me'), { body: { avatar: null } });

                return message.reply({
                    content: null, flags: V2.flag,
                    components: [V2.container([
                        V2.heading("🔄 IDENTITY RESET", 2),
                        V2.text("Guild Avatar has been restored to default.")
                    ], V2_BLUE)]
                });
            }

            // RATE LIMIT CHECK (3 Minutes)
            const now = Date.now();
            const cdAmount = 3 * 60 * 1000; // 3 Minutes
            if (cooldowns.has(message.guild.id)) {
                const expires = cooldowns.get(message.guild.id) + cdAmount;
                if (now < expires) {
                    const timeLeft = ((expires - now) / 1000 / 60).toFixed(1);
                    return message.reply({
                        content: null, flags: V2.flag,
                        components: [V2.container([
                            V2.heading("⏳ RATE LIMIT ACTIVE", 3),
                            V2.text(`Discord API restricts avatar updates. Please wait **${timeLeft} minutes**.\nIf you want to clear it, type \`!setguildavatar default\`.`)
                        ], V2_RED)]
                    });
                }
            }

            // Check for Tenor/Giphy links which are HTML pages, not images
            if (url.includes("tenor.com") && !url.endsWith(".gif")) {
                throw new Error("Invalid URL: Tenor links are web pages. Right-click the GIF and 'Copy Image Link' (ending in .gif).");
            }

            // Fetch the image and convert to base64 buffer for Discord API
            const response = await axios.get(url, { responseType: 'arraybuffer' });

            // Determine mime type from URL or fallback
            let mime = 'image/png';
            if (url.endsWith('.gif') || url.includes('.gif')) mime = 'image/gif';
            else if (url.endsWith('.jpg') || url.endsWith('.jpeg')) mime = 'image/jpeg';
            else if (url.endsWith('.webp')) mime = 'image/webp';
            else if (url.startsWith('data:image')) mime = '';

            const base64Avatar = `data:${mime};base64,${Buffer.from(response.data, 'binary').toString('base64')}`;

            // Execute Avatar Change
            await rest.patch(
                Routes.guildMember(message.guild.id, '@me'),
                { body: { avatar: base64Avatar } }
            );

            // Set cooldown
            cooldowns.set(message.guild.id, now);

            const container = V2.container([
                V2.section(
                    [
                        V2.heading("🎭 BOT IDENTITY UPDATED", 2),
                        V2.text(`**Scope:** Local Guild Only\n**Target:** Bot Avatar\n**Mode:** Direct REST Injection`)
                    ],
                    url
                ),
                V2.separator(),
                V2.text("*BlueSealPrime Identity Protocol*")
            ], V2_BLUE);

            message.channel.send({ content: null, flags: V2.flag, components: [container] });

        } catch (err) {
            console.error(err);
            let errorMsg = err.message || "Failed to update guild avatar.";

            if (err.code === 50013) errorMsg = "Missing Permissions (I cannot change my own nickname/avatar in this server).";
            if (err.code === 50035) errorMsg = "Invalid Form Body (Image too large or invalid URL format).";
            if (err.message.includes("Premium")) errorMsg = "Discord API Error: Server likely requires Boosts.";

            message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text(`❌ **Update Failed:** ${errorMsg}`)], V2_RED)]
            });
        }
    }
};
