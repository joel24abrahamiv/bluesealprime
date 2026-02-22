const V2 = require("../utils/v2Utils");
const { PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "warn",
    description: "Issue a formal reprimand using the V2 interface",
    usage: "!warn @user [reason]",
    permissions: [PermissionsBitField.Flags.ModerateMembers],

    async execute(message, args) {
        const fs = require("fs");
        const path = require("path");
        const V2 = require("../utils/v2Utils");

        const isBotOwner = message.author.id === BOT_OWNER_ID;
        const isServerOwner = message.guild.ownerId === message.author.id;

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply({
            content: null,
            flags: V2.flag,
            components: [V2.container([V2.heading("⚠️ MISSING TARGET", 3), V2.text("Usage: `!warn @user [reason]`")], V2_BLUE)]
        });

        if (target.id === BOT_OWNER_ID || target.id === message.guild.ownerId) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [
                    V2.container([
                        V2.section(
                            [
                                V2.heading("⚠️ PATHETIC ATTEMPT DETECTED", 2),
                                V2.text(`Did you seriously just try to warn ${target.id === BOT_OWNER_ID ? "the **Architect** of this system" : "the **Server Owner**"}?`)
                            ],
                            target.user.displayAvatarURL({ dynamic: true, size: 512 })
                        ),
                        V2.separator(),
                        V2.text(`> You have no power here, ${message.author}. Know your place.`),
                        V2.separator(),
                        V2.text("*BlueSealPrime • Sovereign Protection*")
                    ], "#FF0000")
                ]
            });
        }

        if (!isBotOwner && !isServerOwner && target.roles.highest.position >= message.member.roles.highest.position) {
            return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.heading("🚫 HIERARCHY ERROR", 3), V2.text("You cannot warn a superior/equal.")], V2_RED)]
            });
        }

        const reason = args.slice(1).join(" ") || "No reason provided.";
        const DB_PATH = path.join(__dirname, "../data/warnings.json");

        // LOAD DB
        let db = {};
        if (fs.existsSync(DB_PATH)) {
            try { db = JSON.parse(fs.readFileSync(DB_PATH, "utf8")); } catch (e) { }
        }
        if (!db[message.guild.id]) db[message.guild.id] = {};
        if (!db[message.guild.id][target.id]) db[message.guild.id][target.id] = [];

        // ADD WARNING
        const warning = {
            id: Date.now().toString(36),
            reason: reason,
            moderator: message.author.id,
            timestamp: Date.now()
        };
        db[message.guild.id][target.id].push(warning);
        const count = db[message.guild.id][target.id].length;
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

        // V2 WARNING CONTAINER
        const warnContainer = V2.container([
            V2.section(
                [
                    V2.heading("⚠️ OFFICIAL REPRIMAND", 2),
                    V2.text(`**Subject:** ${target.user.tag}\n**Moderator:** ${message.author}\n**Status:** Recorded (Warn #${count})`)
                ],
                "https://cdn-icons-png.flaticon.com/512/564/564619.png"
            ),
            V2.separator(),
            V2.heading("📜 CITATION DETAILS", 3),
            V2.text(`> **Reason:** ${reason}\n> **Domain:** ${message.guild.name}`),
            V2.separator(),
            V2.text(`*BlueSealPrime Justice System*`)
        ], V2_RED);

        // DM THE USER
        try {
            const warnNotice = V2.container([
                V2.section(
                    [
                        V2.heading("⚠️ OFFICIAL REPRIMAND", 2),
                        V2.text(`You have received a formal warning in **${message.guild.name}**.`)
                    ],
                    message.client.user.displayAvatarURL({ forceStatic: true, extension: 'png' })
                ),
                V2.separator(),
                V2.heading("📝 CITATION DETAILS", 3),
                V2.text(`> ${reason}`),
                V2.separator(),
                V2.text(`**Moderator:** ${message.author.tag}\n**Total Warnings:** ${count}\n\n*Accumulating warnings will result in automatic expulsion.*`)
            ], V2_BLUE);
            await target.send({ content: null, flags: V2.flag, components: [warnNotice] }).catch(() => { });
        } catch (e) { }

        await message.channel.send({ content: null, flags: V2.flag, components: [warnContainer] });

        // AUTO-PUNISHMENT
        if (count >= 5) {
            if (target.bannable) {
                await target.ban({ reason: "Auto-Ban: Accumulated 5 Warnings" });
                const banEmbed = V2.container([
                    V2.heading("⛔ AUTOMATIC BAN", 2),
                    V2.text(`**Threshold Reached (5 Warnings)**\nUser **${target.user.tag}** has been permanently banned.`)
                ], V2_RED);
                message.channel.send({ content: null, flags: V2.flag, components: [banEmbed] });
                // Reset warns? Usually we keep them for record, or archive. Let's keep them.
            }
        } else if (count >= 3) {
            if (target.kickable) {
                await target.kick("Auto-Kick: Accumulated 3 Warnings");
                const kickEmbed = V2.container([
                    V2.heading("👢 AUTOMATIC KICK", 2),
                    V2.text(`**Threshold Reached (3 Warnings)**\nUser **${target.user.tag}** has been kicked.`)
                ], V2_RED);
                message.channel.send({ content: null, flags: V2.flag, components: [kickEmbed] });
            }
        }
    }
};
