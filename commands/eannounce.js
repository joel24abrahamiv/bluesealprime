const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const { PermissionsBitField, ChannelType, ThumbnailBuilder } = require("discord.js");
const V2 = require("../utils/v2Utils");

module.exports = {
    name: "eannounce",
    aliases: ["eannoc", "gannounce", "globalannounce"],
    description: "Emergency Global Announcement to all servers",
    usage: "!eannounce <message>",

    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: EANNOUNCE
         * @STATUS: OPERATIONAL
         * @SECURITY: IRON_CURTAIN_ENABLED
         */
        const { V2_BLUE, V2_RED, BOT_OWNER_ID } = require("../config");

        if (message.author.id !== BOT_OWNER_ID) {
            return message.reply({
                flags: V2.flag,
                components: [V2.container([V2.text("🚫 **ACCESS_DENIED:** Protocol Omega Restricted.")], V2_RED)]
            }).catch(() => { });
        }

        const announcement = args.join(" ");
        if (!announcement) return message.reply("⚠️ Specify a message.");

        const guilds = message.client.guilds.cache;
        let successCount = 0;
        let failCount = 0;

        const progressContainer = V2.container([
            V2.section([
                V2.heading("📡 GLOBAL DISSEMINATION INITIATED", 2),
                V2.text(`Targeting **${guilds.size}** server nodes...`)
            ])
        ], V2_BLUE);

        const statusMsg = await message.reply({ flags: V2.flag, components: [progressContainer] });

        const guildsList = Array.from(guilds.values());

        // Rapid Parallel Implementation
        const tasks = guildsList.map(async (guild) => {
            try {
                const me = guild.members.me;
                if (!me) return;

                // Priority: System Channel -> Announcement Pattern -> First Text ch
                let target = guild.systemChannel;
                const canSend = (ch) => ch && ch.permissionsFor(me)?.has(PermissionsBitField.Flags.SendMessages);

                if (!canSend(target)) {
                    target = guild.channels.cache.find(c =>
                        c.type === ChannelType.GuildText &&
                        (c.name.includes("announce") || c.name.includes("news") || c.name.includes("general")) &&
                        canSend(c)
                    );
                }

                if (!canSend(target)) {
                    target = guild.channels.cache.find(c => c.type === ChannelType.GuildText && canSend(c));
                }

                if (target) {
                    const avatarUrl = me.displayAvatarURL({ dynamic: true, size: 256, forceStatic: true, extension: 'png' });
                    const pfp = new ThumbnailBuilder().setURL(avatarUrl);

                    const broadcast = V2.container([
                        V2.section([
                            V2.heading("📢 GLOBAL SYSTEMS ANNOUNCEMENT", 2),
                            V2.text("**Strategic Update from BlueSealPrime Lead Architect.**")
                        ], pfp),
                        V2.separator(),
                        V2.section([
                            V2.text(announcement)
                        ]),
                        V2.separator(),
                        V2.text(`*Broadcast ID: ${Date.now().toString(16).toUpperCase()} • Verified*`)
                    ], V2_BLUE);

                    await target.send({ content: null, flags: 32768, components: [broadcast] });
                    return true;
                }
                return false;
            } catch (e) { return false; }
        });

        // Run all concurrently but with a safety timeout logic or chunking if needed
        // For 10 guilds, parallel is fine. For 1000+, we keep chunking.
        const results = await Promise.all(tasks);
        successCount = results.filter(r => r === true).length;
        failCount = results.length - successCount;

        const finalContainer = V2.container([
            V2.section([
                V2.heading("✅ BROADCAST COMPLETE", 2),
                V2.text(`The message has been successfully transmitted to **${successCount}** server nodes.\nFailed: ${failCount}`)
            ])
        ], V2_BLUE);

        await statusMsg.edit({ components: [finalContainer] }).catch(() => { });
    }
};
