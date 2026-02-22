const V2 = require("../utils/v2Utils");
const { ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");

const SAFETY_DIR = path.join(__dirname, "../data/safety");
if (!fs.existsSync(SAFETY_DIR)) fs.mkdirSync(SAFETY_DIR, { recursive: true });

module.exports = {
    name: "safetybackup",
    description: "Structural DNA Backup (Roles & Channels Only)",
    usage: "!safetybackup create | list | delete <id> | clear",
    aliases: ["sfbk", "structuralbackup"],
    whitelistOnly: true,

    async execute(message, args) {
        const botAvatar = V2.botAvatar(message);

        if (message.author.id !== BOT_OWNER_ID && message.author.id !== message.guild.ownerId) {
            return message.reply({
                flags: V2.flag,
                components: [V2.container([V2.text("🚫 **Access Denied:** Only the Server or Bot Owner can manage structural templates.")], V2_RED)]
            });
        }

        const sub = args[0]?.toLowerCase();

        // ─── CREATE ───
        if (sub === "create") {
            const dnaKey = `SF-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

            const status = await message.channel.send({
                flags: V2.flag,
                components: [V2.container([
                    V2.section([
                        V2.heading("🧬 EXTRACTING STRUCTURAL DNA", 2),
                        V2.text("```diff\n+ Isolating Role Hierarchy\n+ Mapping Sector Coordinates\n+ Encrypting Permission Tables\n```")
                    ], botAvatar)
                ], V2_BLUE)]
            });

            try {
                const guild = message.guild;
                const backupData = {
                    id: dnaKey,
                    guildName: guild.name,
                    guildId: guild.id,
                    createdAt: new Date().toISOString(),
                    roles: guild.roles.cache
                        .filter(r => !r.managed && r.name !== "@everyone")
                        .sort((a, b) => b.position - a.position)
                        .map(r => ({ id: r.id, name: r.name, color: r.hexColor, permissions: r.permissions.bitfield.toString(), hoist: r.hoist, mentionable: r.mentionable, position: r.position })),
                    channels: []
                };

                // Categories
                guild.channels.cache
                    .filter(c => c.type === ChannelType.GuildCategory)
                    .sort((a, b) => a.position - b.position)
                    .forEach(cat => {
                        backupData.channels.push({
                            name: cat.name, type: cat.type, position: cat.position,
                            overwrites: cat.permissionOverwrites.cache.map(o => ({ id: o.id, type: o.type, allow: o.allow.bitfield.toString(), deny: o.deny.bitfield.toString() })),
                            children: guild.channels.cache
                                .filter(c => c.parentId === cat.id)
                                .sort((a, b) => a.position - b.position)
                                .map(c => ({ name: c.name, type: c.type, topic: c.topic || null, position: c.position, bitrate: c.bitrate || null, userLimit: c.userLimit || null, nsfw: c.nsfw || false, rawPosition: c.rawPosition, overwrites: c.permissionOverwrites.cache.map(o => ({ id: o.id, type: o.type, allow: o.allow.bitfield.toString(), deny: o.deny.bitfield.toString() })) }))
                        });
                    });

                // Orphaned channels
                guild.channels.cache
                    .filter(c => !c.parentId && c.type !== ChannelType.GuildCategory && !c.thread)
                    .sort((a, b) => a.position - b.position)
                    .forEach(c => {
                        backupData.channels.push({ name: c.name, type: c.type, topic: c.topic || null, position: c.position, bitrate: c.bitrate || null, userLimit: c.userLimit || null, rawPosition: c.rawPosition, overwrites: c.permissionOverwrites.cache.map(o => ({ id: o.id, type: o.type, allow: o.allow.bitfield.toString(), deny: o.deny.bitfield.toString() })) });
                    });

                fs.writeFileSync(path.join(SAFETY_DIR, `${dnaKey}.json`), JSON.stringify(backupData, null, 2));

                await status.edit({
                    flags: V2.flag,
                    components: [V2.container([
                        V2.section([
                            V2.heading("🛡️ STRUCTURAL DNA SECURED", 2),
                            V2.text(`### **[ DNA_EXTRACT_SUCCESS ]**\n> **DNA Key:** \`${dnaKey}\`\n> **Server:** ${guild.name}\n> **Roles:** \`${backupData.roles.length}\` • **Channel Regions:** \`${backupData.channels.length}\`\n\nUse \`!rstsafbackup ${dnaKey}\` to deploy this to any server.`)
                        ], botAvatar),
                        V2.separator(),
                        V2.text("*BlueSealPrime • Structural Integrity Protocol*")
                    ], "#00FF7F")]
                });

            } catch (err) {
                console.error(err);
                await status.edit({ flags: V2.flag, components: [V2.container([V2.text("❌ **Critical Failure:** DNA extraction interrupted.")], V2_RED)] });
            }

            // ─── LIST ───
        } else if (sub === "list") {
            const files = fs.readdirSync(SAFETY_DIR).filter(f => f.endsWith(".json"));

            if (files.length === 0) {
                return message.reply({ flags: V2.flag, components: [V2.container([V2.text("📭 **Safety Vault is Empty.** Use `!safetybackup create` to save a structural template.")], V2_BLUE)] });
            }

            const items = files.map(file => {
                try {
                    const data = JSON.parse(fs.readFileSync(path.join(SAFETY_DIR, file), "utf8"));
                    return `> 🧬 \`${data.id}\` — **${data.guildName}** | Roles: \`${data.roles.length}\` • Channels: \`${data.channels.length}\``;
                } catch (e) { return null; }
            }).filter(Boolean);

            await message.reply({
                flags: V2.flag,
                components: [V2.container([
                    V2.section([
                        V2.heading("📂 SAFETY ARCHIVE VAULT", 2),
                        V2.text(`**${files.length} Template${files.length !== 1 ? "s" : ""} Stored:**\n\n${items.join("\n")}`)
                    ], botAvatar),
                    V2.separator(),
                    V2.text("*BlueSealPrime • Structural DNA Registry*")
                ], V2_BLUE)]
            });

            // ─── DELETE ───
        } else if (sub === "delete") {
            const targetId = args[1]?.toUpperCase();
            if (!targetId) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ Specify a DNA Key: `!safetybackup delete <KEY>`")], V2_RED)] });
            const targetPath = path.join(SAFETY_DIR, `${targetId}.json`);
            if (!fs.existsSync(targetPath)) return message.reply({ flags: V2.flag, components: [V2.container([V2.text(`❌ DNA Key \`${targetId}\` not found in vault.`)], V2_RED)] });
            fs.unlinkSync(targetPath);
            message.reply({ flags: V2.flag, components: [V2.container([V2.text(`🗑️ **DNA Purged:** Template \`${targetId}\` has been permanently deleted.`)], V2_BLUE)] });

            // ─── CLEAR ───
        } else if (sub === "clear") {
            const files = fs.readdirSync(SAFETY_DIR).filter(f => f.endsWith(".json"));
            if (files.length === 0) return message.reply({ flags: V2.flag, components: [V2.container([V2.text("📭 **Safety Vault is already empty.**")], V2_BLUE)] });
            files.forEach(f => fs.unlinkSync(path.join(SAFETY_DIR, f)));
            message.reply({ flags: V2.flag, components: [V2.container([V2.text(`🧹 **Safety Vault Cleared:** \`${files.length}\` templates permanently deleted.`)], V2_BLUE)] });

            // ─── HELP ───
        } else {
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("sfbk_create").setLabel("Create Template").setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId("sfbk_list").setLabel("List Templates").setStyle(ButtonStyle.Secondary)
            );
            await message.reply({
                content: `## 🧬 Safety Backup System\n> \`!safetybackup create\` — Save structural DNA\n> \`!safetybackup list\` — View stored templates\n> \`!safetybackup delete <KEY>\` — Remove a template\n> \`!safetybackup clear\` — Wipe entire vault`,
                components: [row]
            });
        }
    }
};
