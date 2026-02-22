const V2 = require("../utils/v2Utils");

module.exports = {
    name: "roleinfo",
    aliases: ["rinfo", "role"],
    description: "Get information about a specific role using Components V2",

    async execute(message, args) {
        const role = message.mentions.roles.first() ||
            message.guild.roles.cache.get(args[0]) ||
            message.guild.roles.cache.find(r => r.name.toLowerCase() === args.join(" ").toLowerCase());

        if (!role) return message.reply("❌ **Role not found.** Please specify a valid role (mention, ID, or name).");

        const perms = role.permissions.toArray().map(p => p.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase()));
        const permString = perms.length > 0 ? (perms.length > 10 ? `${perms.slice(0, 10).join(", ")} + ${perms.length - 10} more` : perms.join(", ")) : "None";

        const container = V2.container([
            V2.section(
                [
                    V2.heading(`ROLE: ${role.name.toUpperCase()}`, 2),
                    V2.text(`**ID:** \`${role.id}\`\n**Members:** ${role.members.size}`)
                ],
                "https://cdn-icons-png.flaticon.com/512/681/681392.png"
            ),
            V2.separator(),
            V2.heading("📊 SPECIFICATIONS", 3),
            V2.text(`> **Hex Color:** \`${role.hexColor}\`\n> **Created:** <t:${Math.floor(role.createdTimestamp / 1000)}:R>`),
            V2.separator(),
            V2.heading("⚙️ SETTINGS", 3),
            V2.text(`> **Hoisted:** ${role.hoist ? "✅ Yes" : "❌ No"}\n> **Managed:** ${role.managed ? "✅ Yes" : "❌ No"}\n> **Mentionable:** ${role.mentionable ? "✅ Yes" : "❌ No"}`),
            V2.separator(),
            V2.heading("📜 PERMISSIONS", 3),
            V2.text(`\`\`\`\n${permString}\n\`\`\``)
        ], "#0099ff");

        message.reply({
            content: null,
            flags: V2.flag,
            components: [container]
        });
    }
};
