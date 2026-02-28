const V2 = require("../utils/v2Utils");
const { PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "setupverify",
    description: "Setup the premium verification panel",
    usage: "!setupverify #channel @role",
    permissions: [PermissionsBitField.Flags.Administrator],

    async execute(message, args, commandName) {
        const EXECUTION_START_TIME = Date.now();
        const { V2_BLUE, V2_RED, BOT_OWNER_ID } = require("../config");
        const V2 = require("../utils/v2Utils");
        const mainProcess = require("../index");

        if (!message || !message.guild) return;
        const botMember = message.guild.members.me;

        if (!botMember.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({
                flags: V2.flag,
                components: [V2.container([V2.text("❌ **PERMISSION_FAULT:** Administrator role required.")], V2_RED)]
            }).catch(() => { });
        }

        if (mainProcess.REACTOR) {
            await mainProcess.REACTOR.checkBucket(message.guild.id, message.author.id);
            const cooldown = 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "setupverify", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => { });
            }
        }

        try {
            if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator) && message.author.id !== BOT_OWNER_ID) return;

            const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
            const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);

            if (!channel || !role)
                return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ **Usage:** `!setupverify #channel @role`")], V2_RED)] });

            // --- SOVEREIGN ROLE PREVENTION ---
            const rName = role.name.toLowerCase();
            if (rName.includes("bluesealprime") || rName.includes("antinuke") || rName.includes("anti-raid") || rName.includes("quarantine") || rName.includes("botrole") || role.tags?.botId === message.client.user.id) {
                return message.reply({
                    content: null,
                    flags: V2.flag,
                    components: [V2.container([
                        V2.heading("🚫 SOVEREIGN PROTECTION", 3),
                        V2.text("This is an integrated Bot Role and cannot be used for the verification panel.")
                    ], V2_RED)]
                }).catch(() => { });
            }

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`verify_${role.id}`)
                    .setLabel("✅ Verify Membership")
                    .setStyle(ButtonStyle.Success)
            );

            const verifyPanel = V2.container([
                V2.section([
                    V2.heading("🛡️ SOVEREIGN GATEWAY", 1),
                    V2.text("Biometric & Identity Authentication Required")
                ], V2.thumbnail(message.guild.iconURL({ dynamic: true, size: 512 }) || V2.botAvatar(message))),
                V2.separator(),
                V2.text("To access the restricted sectors of this dominion, you must verify your identity. This process ensures the integrity and security of the Sovereign network.\n\n> **Authorized Access Only**"),
                V2.separator(),
                V2.text("**Identity Registry:** You will be granted the role: " + role.name + "\n**Security Protocol:** By verifying, you commit to honoring all Imperial Statutes."),
                row
            ], V2_BLUE);

            await channel.send({
                flags: V2.flag,
                components: [verifyPanel]
            });

            return message.reply({
                flags: V2.flag,
                components: [V2.container([V2.text(`💎 **Sovereign Gateway synchronized with ${channel}.**\nRegistry Role: ${role}`)], V2_BLUE)]
            });

        } catch (err) {
            console.error(err);
            return message.reply("❌ Failed to send panel.");
        }
    }
};