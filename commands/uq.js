const V2 = require("../utils/v2Utils");
const {
    PermissionsBitField,
    SeparatorBuilder, SeparatorSpacingSize,
    ContainerBuilder, SectionBuilder,
    TextDisplayBuilder, HeadingBuilder, HeadingLevel
} = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "../data/quarantine.json");

function getSavedRoles(guildId, userId) {
    if (!fs.existsSync(DB_PATH)) return [];
    try { const data = JSON.parse(fs.readFileSync(DB_PATH, "utf8")); return data[guildId]?.[userId] || []; } catch { return []; }
}

// ── Builder Helpers ──
const sepLg = () => new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true);
const sepSm = () => new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true);
const txt = (content) => new TextDisplayBuilder().setContent(content);
const h = (content, level = 2) => new HeadingBuilder().setText(content).setLevel(level);

module.exports = {
    name: "uq",
    description: "Unquarantine a user — restores all saved roles (Admin/Owner Only)",
    aliases: ["unquarantine"],
    usage: "!uq @user",
    permissions: [PermissionsBitField.Flags.ModerateMembers],

    async execute(message, args) {
        const isOwner = message.author.id === BOT_OWNER_ID || message.guild.ownerId === message.author.id;
        if (!isOwner && !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const container = new ContainerBuilder()
                .setAccentColor(parseInt(V2_RED.replace("#", ""), 16))
                .addSeparatorComponents(sepLg())
                .addTextDisplayComponents(txt("🚫 **ACCESS DENIED** | Authorized Personnel Only."))
                .addSeparatorComponents(sepLg());
            return message.reply({ flags: V2.flag, components: [container] });
        }

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) {
            const container = new ContainerBuilder()
                .setAccentColor(parseInt(V2_RED.replace("#", ""), 16))
                .addSeparatorComponents(sepSm())
                .addTextDisplayComponents(txt("⚠️ **User not found.**\nUsage: `!uq @user`"))
                .addSeparatorComponents(sepSm());
            return message.reply({ flags: V2.flag, components: [container] });
        }

        try { await target.fetch(); } catch (e) { }

        const qrRole = message.guild.roles.cache.find(r => r.name.toLowerCase() === "quarantined");
        if (!qrRole) {
            const container = new ContainerBuilder()
                .setAccentColor(parseInt(V2_RED.replace("#", ""), 16))
                .addSeparatorComponents(sepSm())
                .addTextDisplayComponents(txt("⚠️ **Quarantine system not active** — `Quarantined` role not found.\nRun `!qr setup` first."))
                .addSeparatorComponents(sepSm());
            return message.reply({ flags: V2.flag, components: [container] });
        }

        if (qrRole.position >= message.guild.members.me.roles.highest.position) {
            const container = new ContainerBuilder()
                .setAccentColor(parseInt(V2_RED.replace("#", ""), 16))
                .addSeparatorComponents(sepSm())
                .addTextDisplayComponents(txt("❌ **Hierarchy Error:** `Quarantined` role is above my highest role. Reposition it."))
                .addSeparatorComponents(sepSm());
            return message.reply({ flags: V2.flag, components: [container] });
        }

        if (!target.roles.cache.has(qrRole.id)) {
            const container = new ContainerBuilder()
                .setAccentColor(parseInt(V2_RED.replace("#", ""), 16))
                .addSeparatorComponents(sepSm())
                .addTextDisplayComponents(txt(`⚠️ **${target.user.tag}** is not currently quarantined.`))
                .addSeparatorComponents(sepSm());
            return message.reply({ flags: V2.flag, components: [container] });
        }

        try {
            // ── Remove quarantine & restore roles simultaneously ──
            await target.roles.remove(qrRole, `Unquarantined by ${message.author.tag}`);

            const savedRoleIds = getSavedRoles(message.guild.id, target.id);
            let restoredCount = 0;
            if (savedRoleIds.length > 0) {
                const rolesToRestore = savedRoleIds.filter(id => {
                    const r = message.guild.roles.cache.get(id);
                    return r && r.editable && r.id !== message.guild.id;
                });
                if (rolesToRestore.length > 0) {
                    await target.roles.add(rolesToRestore, "Quarantine: Restoring roles").catch(() => { });
                    restoredCount = rolesToRestore.length;
                }
            }

            // ── Remove from DB ──
            if (fs.existsSync(DB_PATH)) {
                try {
                    const data = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
                    if (data[message.guild.id]?.[target.id]) {
                        delete data[message.guild.id][target.id];
                        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
                    }
                } catch (e) { }
            }

            // ── SUCCESS CARD ──
            const section = new SectionBuilder()
                .addTextDisplayComponents(
                    h("✅ SUBJECT RELEASED", 1),
                    txt(`**${target.user.tag}** has been freed from isolation.\nAll previous roles have been restored.`)
                )
                .setThumbnailAccessory(
                    target.user.displayAvatarURL({ dynamic: true, size: 512 })
                );

            const container = new ContainerBuilder()
                .setAccentColor(parseInt(V2_BLUE.replace("#", ""), 16))
                .addSeparatorComponents(sepLg())
                .addSectionComponents(section)
                .addSeparatorComponents(sepLg())
                .addHeadingComponents(h("[ RELEASE RECORD ]", 3))
                .addTextDisplayComponents(
                    txt(
                        `> 🔁 **Roles Restored:** \`${restoredCount}\`\n` +
                        `> 👮 **Released by:** ${message.author.tag}\n` +
                        `> 🕐 **At:** <t:${Math.floor(Date.now() / 1000)}:f>`
                    )
                )
                .addSeparatorComponents(sepLg())
                .addTextDisplayComponents(txt("*BlueSealPrime • Quarantine Protocol*"));

            return message.reply({ flags: V2.flag, components: [container] });

        } catch (e) {
            const container = new ContainerBuilder()
                .setAccentColor(parseInt(V2_RED.replace("#", ""), 16))
                .addSeparatorComponents(sepSm())
                .addTextDisplayComponents(txt(`❌ **Failed to unquarantine:** ${e.message}`))
                .addSeparatorComponents(sepSm());
            return message.reply({ flags: V2.flag, components: [container] });
        }
    }
};
