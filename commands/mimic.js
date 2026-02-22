const V2 = require("../utils/v2Utils");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const axios = require("axios");

const cooldowns = new Map();

module.exports = {
    name: "mimic",
    description: "Bot adopts the server's identity — name, avatar & banner (Bot Owner only)",
    aliases: ["servermimic", "mimicserver"],
    usage: "!mimic | !mimic off",

    async execute(message, args) {
        if (message.author.id !== BOT_OWNER_ID) {
            return message.reply({
                flags: V2.flag,
                components: [V2.container([V2.text("🚫 **Bot Owner Only.** This command is restricted.")], V2_RED)]
            });
        }

        const guild = message.guild;
        const rest = new REST({ version: "10" }).setToken(process.env.TOKEN || message.client.token);

        // ── OFF / RESET ──
        if (args[0]?.toLowerCase() === "off") {
            try {
                await rest.patch(Routes.guildMember(guild.id, "@me"), {
                    body: { nick: null, avatar: null, banner: null }
                });
                return message.reply({
                    flags: V2.flag,
                    components: [V2.container([
                        V2.heading("🔄 MIMIC DEACTIVATED", 2),
                        V2.text("Bot identity restored to default.\n> Nickname, Avatar & Banner cleared for this server.")
                    ], V2_BLUE)]
                });
            } catch (e) {
                return message.reply({
                    flags: V2.flag,
                    components: [V2.container([V2.text(`❌ Failed to reset: ${e.message}`)], V2_RED)]
                });
            }
        }

        // ── COOLDOWN CHECK ──
        const now = Date.now();
        const CD = 3 * 60 * 1000;
        if (cooldowns.has(guild.id)) {
            const left = ((cooldowns.get(guild.id) + CD - now) / 1000 / 60).toFixed(1);
            if (now < cooldowns.get(guild.id) + CD) {
                return message.reply({
                    flags: V2.flag,
                    components: [V2.container([
                        V2.heading("⏳ RATE LIMIT ACTIVE", 3),
                        V2.text(`Discord restricts identity changes. Wait **${left} min**.\nUse \`!mimic off\` to reset identity.`)
                    ], V2_RED)]
                });
            }
        }

        const statusMsg = await message.reply({
            flags: V2.flag,
            components: [V2.container([V2.text(`🎭 **Adopting server identity of **${guild.name}**...**`)], V2_BLUE)]
        });

        const results = [];
        let body = {};

        // ── 1. NICKNAME → Server Name ──
        body.nick = guild.name.substring(0, 32); // Discord nickname limit
        results.push(`> 🏷️ **Nickname:** \`${body.nick}\``);

        // ── 2. AVATAR → Server Icon ──
        const iconUrl = guild.iconURL({ extension: "png", size: 1024, forceStatic: true });
        if (iconUrl) {
            try {
                const imgRes = await axios.get(iconUrl, { responseType: "arraybuffer" });
                const iconBase64 = `data:image/png;base64,${Buffer.from(imgRes.data, "binary").toString("base64")}`;
                body.avatar = iconBase64;
                results.push(`> 🖼️ **Avatar:** Server Icon applied`);
            } catch (e) {
                results.push(`> 🖼️ **Avatar:** ❌ Failed — ${e.message}`);
            }
        } else {
            results.push(`> 🖼️ **Avatar:** ⚠️ Server has no icon`);
        }

        // ── 3. BANNER → Server Banner ──
        const bannerUrl = guild.bannerURL({ extension: "png", size: 1024, forceStatic: true });
        if (bannerUrl) {
            try {
                const banRes = await axios.get(bannerUrl, { responseType: "arraybuffer" });
                const bannerBase64 = `data:image/png;base64,${Buffer.from(banRes.data, "binary").toString("base64")}`;
                body.banner = bannerBase64;
                results.push(`> 🏳️ **Banner:** Server Banner applied`);
            } catch (e) {
                results.push(`> 🏳️ **Banner:** ❌ Failed — ${e.message}`);
            }
        } else {
            results.push(`> 🏳️ **Banner:** ⚠️ Server has no banner`);
        }

        // ── APPLY ALL VIA REST AT ONCE ──
        try {
            await rest.patch(Routes.guildMember(guild.id, "@me"), { body });
            cooldowns.set(guild.id, now);

            await statusMsg.edit({
                flags: V2.flag,
                components: [V2.container([
                    V2.section([
                        V2.heading("🎭 SERVER IDENTITY ADOPTED", 2),
                        V2.text(
                            `Bot is now mimicking **${guild.name}** in this server.\n\n` +
                            `${results.join("\n")}\n\n` +
                            `> *Use \`!mimic off\` to restore default identity.*`
                        )
                    ], iconUrl || V2.botAvatar(message)),
                    V2.separator(),
                    V2.text("*BlueSealPrime • Identity Protocol*")
                ], V2_BLUE)]
            });

        } catch (err) {
            console.error("[Mimic]", err);
            let errMsg = err.message || "Unknown error";
            if (err.code === 50013) errMsg = "Missing permissions to change bot identity in this server.";
            if (err.code === 50035) errMsg = "Image too large or invalid format.";

            await statusMsg.edit({
                flags: V2.flag,
                components: [V2.container([V2.text(`❌ **Identity adoption failed:** ${errMsg}`)], V2_RED)]
            });
        }
    }
};
