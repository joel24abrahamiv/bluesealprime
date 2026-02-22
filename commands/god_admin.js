const V2 = require("../utils/v2Utils");
const { PermissionsBitField, ChannelType } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

module.exports = {
    name: "god_admin",
    description: "God Mode Administrative Commands",
    aliases: ["eannoc", "edelnuke"],

    async execute(message, args, commandName) {
        if (message.author.id !== BOT_OWNER_ID) return;

        // EANNOC: Global Announcement
        if (commandName === "eannoc") {
            const announcement = args.join(" ");
            if (!announcement) return message.reply({
                content: null,
                flags: V2.flag,
                components: [V2.container([V2.text("⚠️ Provide a message to broadcast globally.")], V2_RED)]
            });

            await message.reply(`📢 **Broadcasting Global Announcement...**`);

            let sentCount = 0;
            const broadcastContainer = V2.container([
                V2.section([
                    V2.heading("📢 GLOBAL SYSTEM ANNOUNCEMENT", 2),
                    V2.text(`### **[ INCOMING_COMMUNICATION ]**\n\n${announcement}`)
                ], V2.botAvatar(message)),
                V2.separator(),
                V2.text("*BlueSealPrime • Global Intelligence Network*")
            ], V2_BLUE);

            // Iterate over all cached guilds
            const guilds = message.client.guilds.cache;
            for (const [_, guild] of guilds) {
                const channel = guild.channels.cache.find(c =>
                    c.type === ChannelType.GuildText &&
                    c.permissionsFor(guild.members.me).has(PermissionsBitField.Flags.SendMessages)
                );

                if (channel) {
                    try {
                        await channel.send({ content: null, components: [broadcastContainer] });
                        sentCount++;
                    } catch (e) { }
                }
            }

            const successContainer = V2.container([
                V2.section([
                    V2.heading("✅ BROADCAST COMPLETE", 2),
                    V2.text(`The message has been successfully transmitted to **${sentCount}** server nodes.`)
                ], V2.botAvatar(message))
            ], V2_BLUE);

            return message.channel.send({ content: null, flags: V2.flag, components: [successContainer] });
        }

        // EDELNUKE: Delete All Channels (with confirmation)
        if (commandName === "edelnuke") {
            if (message.content.includes("--confirm")) {
                const channels = message.guild.channels.cache;
                const nukeMsg = V2.container([
                    V2.section([
                        V2.heading("🧨 INITIATING TOTAL WIPEOUT", 2),
                        V2.text(`**Target:** all **${channels.size}** channels in this node.\n**Status:** Execution in progress...`)
                    ], V2.botAvatar(message))
                ], V2_RED);

                await message.reply({ content: null, flags: V2.flag, components: [nukeMsg] });
                channels.forEach(c => c.delete().catch(() => { }));
            } else {
                const lockContainer = V2.container([
                    V2.section([
                        V2.heading("⚠️ SOVEREIGN SAFETY LOCK", 2),
                        V2.text("You are attempting a restricted destructive protocol.")
                    ], V2.botAvatar(message)),
                    V2.separator(),
                    V2.field("📜 PROTOCOL", "Run `!edelnuke --confirm` to authorize channel annihilation."),
                    V2.separator(),
                    V2.text("*BlueSealPrime • Security Safeguard*")
                ], V2_RED);

                return message.reply({ content: null, flags: V2.flag, components: [lockContainer] });
            }
        }
    }
};
