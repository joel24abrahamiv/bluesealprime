const { EmbedBuilder, PermissionsBitField, ChannelType } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { BOT_OWNER_ID } = require("../config");

const SAFETY_DIR = path.join(__dirname, "../data/safety");
if (!fs.existsSync(SAFETY_DIR)) fs.mkdirSync(SAFETY_DIR, { recursive: true });

module.exports = {
    name: "safetybackup",
    description: "Structural DNA Backup (Roles & Channels Only)",
    usage: "!safetybackup create | !safetybackup list | !safetybackup delete <id> | !safetybackup clear",
    aliases: ["sfbk", "structuralbackup"],
    whitelistOnly: true,

    async execute(message, args) {
        if (message.author.id !== BOT_OWNER_ID && message.author.id !== message.guild.ownerId) {
            return message.reply("🚫 **Access Denied:** Only the Server or Bot Owner can manage structural templates.");
        }

        const sub = args[0]?.toLowerCase();

        if (sub === "create") {
            const initEmbed = new EmbedBuilder()
                .setColor("#5865F2")
                .setTitle("🧬 EXTRACTING STRUCTURAL DNA")
                .setDescription("```diff\n+ Isolating Role Hierarchy\n+ Mapping Sector Coordinates\n+ Encrypting Permission Tables\n```")
                .setFooter({ text: "BlueSealPrime • Structural Integrity Protocol" });

            const status = await message.channel.send({ embeds: [initEmbed] });

            try {
                // Generate a unique ID: SF-XXXX
                const dnaKey = `SF-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

                const backupData = {
                    id: dnaKey,
                    guildName: message.guild.name,
                    guildId: message.guild.id,
                    createdAt: new Date().toISOString(),
                    roles: message.guild.roles.cache
                        .filter(r => !r.managed && r.name !== "@everyone")
                        .sort((a, b) => b.position - a.position)
                        .map(r => ({
                            id: r.id,
                            name: r.name,
                            color: r.hexColor,
                            permissions: r.permissions.bitfield.toString(),
                            hoist: r.hoist,
                            mentionable: r.mentionable,
                            position: r.position
                        })),
                    channels: []
                };

                // Map categories first (Sorted by position)
                const categories = message.guild.channels.cache
                    .filter(c => c.type === ChannelType.GuildCategory)
                    .sort((a, b) => a.position - b.position);

                categories.forEach(cat => {
                    const catData = {
                        name: cat.name,
                        type: cat.type,
                        position: cat.position,
                        overwrites: cat.permissionOverwrites.cache.map(o => ({
                            id: o.id,
                            type: o.type,
                            allow: o.allow.bitfield.toString(),
                            deny: o.deny.bitfield.toString()
                        })),
                        children: message.guild.channels.cache
                            .filter(c => c.parentId === cat.id)
                            .sort((a, b) => a.position - b.position)
                            .map(c => ({
                                name: c.name,
                                type: c.type,
                                topic: c.topic || null,
                                position: c.position,
                                bitrate: c.bitrate || null,
                                userLimit: c.userLimit || null,
                                nsfw: c.nsfw || false,
                                rawPosition: c.rawPosition,
                                overwrites: c.permissionOverwrites.cache.map(o => ({
                                    id: o.id,
                                    type: o.type,
                                    allow: o.allow.bitfield.toString(),
                                    deny: o.deny.bitfield.toString()
                                }))
                            }))
                    };
                    backupData.channels.push(catData);
                });

                // Add orphaned channels
                const orphans = message.guild.channels.cache
                    .filter(c => !c.parentId && c.type !== ChannelType.GuildCategory && !c.thread)
                    .sort((a, b) => a.position - b.position);

                orphans.forEach(c => {
                    backupData.channels.push({
                        name: c.name,
                        type: c.type,
                        topic: c.topic || null,
                        position: c.position,
                        bitrate: c.bitrate || null,
                        userLimit: c.userLimit || null,
                        rawPosition: c.rawPosition,
                        overwrites: c.permissionOverwrites.cache.map(o => ({
                            id: o.id,
                            type: o.type,
                            allow: o.allow.bitfield.toString(),
                            deny: o.deny.bitfield.toString()
                        }))
                    });
                });

                const filePath = path.join(SAFETY_DIR, `${dnaKey}.json`);
                fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));

                const successEmbed = new EmbedBuilder()
                    .setColor("#00FF00")
                    .setTitle("🛡️ STRUCTURAL DNA SECURED")
                    .setDescription(
                        `### **[ DNA_EXTRACT_SUCCESS ]**\n` +
                        `> **DNA Key:** \`${dnaKey}\`\n` +
                        `> **Integrity:** 100%\n\n` +
                        `This template contains **${backupData.roles.length} Roles** and **${backupData.channels.length} Regions**.\n` +
                        `Use \`!rstsafbackup ${dnaKey}\` to deploy this structure to any server.`
                    )
                    .setImage("https://media.discordapp.net/attachments/1093150036663308318/1113885934572900454/line-red.gif")
                    .setFooter({ text: "BlueSealPrime Safety Archive" });

                await status.edit({ embeds: [successEmbed] });

            } catch (err) {
                console.error(err);
                status.edit(`❌ **Critical Failure:** DNA extraction sequence interrupted.`);
            }

        } else if (sub === "list") {
            const files = fs.readdirSync(SAFETY_DIR).filter(f => f.endsWith(".json"));

            if (files.length === 0) {
                return message.reply("📁 **Safety Vault is Empty.**");
            }

            const listEmbed = new EmbedBuilder()
                .setColor("#5865F2")
                .setTitle("📂 SAFETY ARCHIVE VAULT")
                .setDescription("```fix\n[ LISTING STRUCTURAL TEMPLATES ]\n```")
                .setTimestamp();

            files.forEach(file => {
                try {
                    const data = JSON.parse(fs.readFileSync(path.join(SAFETY_DIR, file), "utf8"));
                    listEmbed.addFields({
                        name: `🧬 ${data.id}`,
                        value: `**Source:** ${data.guildName}\n**Roles:** ${data.roles.length} | **Channels:** ${data.channels.length}`,
                        inline: true
                    });
                } catch (e) { }
            });

            message.reply({ embeds: [listEmbed] });

        } else if (sub === "delete") {
            const targetId = args[1]?.toUpperCase();
            if (!targetId) return message.reply("⚠️ Specify a DNA Key to delete.");

            const targetPath = path.join(SAFETY_DIR, `${targetId}.json`);
            if (!fs.existsSync(targetPath)) return message.reply("❌ DNA Key not found.");

            fs.unlinkSync(targetPath);
            message.reply(`🗑️ **DNA Purged:** Template \`${targetId}\` has been deleted.`);

        } else if (sub === "clear") {
            const files = fs.readdirSync(SAFETY_DIR).filter(f => f.endsWith(".json"));
            if (files.length === 0) return message.reply("📭 **Safety Vault is already empty.**");

            files.forEach(f => fs.unlinkSync(path.join(SAFETY_DIR, f)));
            message.reply(`🧹 **Safety Vault Cleared:** Total of **${files.length}** templates deleted.`);

        } else {
            message.reply("💡 **Safety Manual:**\n`!safetybackup create` - Save structure\n`!safetybackup list` - View templates\n`!safetybackup delete <ID>` - Remove template\n`!safetybackup clear` - Wipe vault");
        }
    }
};
