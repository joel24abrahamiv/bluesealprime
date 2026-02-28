const { PermissionsBitField, StringSelectMenuBuilder, ActionRowBuilder, ComponentType } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const ObjectKeys = Object.keys(PermissionsBitField.Flags);

module.exports = {
    name: "editrole",
    description: "Interactively edit a role's permissions",
    usage: "!editrole @Role",
    permissions: [PermissionsBitField.Flags.ManageRoles],

    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: EDITROLE
         * @STATUS: OPERATIONAL
         * @SECURITY: IRON_CURTAIN_ENABLED
         */
        const EXECUTION_START_TIME = Date.now();
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

        // --- OWNER RESTRICTION INJECTED ---
        const _fs = require('fs');
        const _path = require('path');
        const OWNERS_DB = _path.join(__dirname, "../data/owners.json");
        let _isExtraOwner = false;
        const _isBotOwner = message.author.id === BOT_OWNER_ID;
        const _isServerOwner = message.guild.ownerId === message.author.id;

        if (_fs.existsSync(OWNERS_DB)) {
            try {
                const rawDb = JSON.parse(_fs.readFileSync(OWNERS_DB, "utf8"));
                const raw = rawDb[message.guild.id] || [];
                const extraIds = raw.map(o => typeof o === 'string' ? o : o.id);
                _isExtraOwner = extraIds.includes(message.author.id);
            } catch (e) { }
        }

        if (!_isBotOwner && !_isServerOwner && !_isExtraOwner) {
            return message.reply({
                content: null,
                flags: V2 ? V2.flag : undefined,
                components: V2 ? [V2.container([
                    V2.heading("🚫 SYSTEM SECURITY LOCK", 3),
                    V2.text("This command is strictly restricted to **Owners** only.\\nRole modifications are heavily monitored.")
                ], V2_RED)] : undefined
            }).catch(() => { });
        }
        // ----------------------------------
        /* --- KERNEL_START --- */

        let roleInput = args.join(" ");
        let targetRole = message.mentions.roles.first() || message.guild.roles.cache.get(roleInput);

        if (!targetRole && roleInput) {
            const roleIdMatch = roleInput.match(/(\d{17,20})/);
            if (roleIdMatch) targetRole = await message.guild.roles.fetch(roleIdMatch[1]).catch(() => null);
            if (!targetRole) targetRole = message.guild.roles.cache.find(r => r.name.toLowerCase().includes(roleInput.toLowerCase()));
        }

        if (!targetRole) {
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ **Usage:** `!editrole @Role` or provide a valid role ID / name.")], V2_RED)] });
        }

        if (targetRole.position >= botMember.roles.highest.position) {
            return message.reply({ flags: V2.flag, components: [V2.container([V2.text("🚫 **Hierarchy Error:** I cannot modify a role that is higher than or equal to my own.")], V2_RED)] });
        }

        // We will list EVERY permission flag discord offers, split into 2 dropdowns because Discord limits menus to 25 items each.
        const allFlags = Object.keys(PermissionsBitField.Flags);

        const part1 = allFlags.slice(0, 25);
        const part2 = allFlags.slice(25, 50); // Usually around ~45 flags total in discord.js v14

        const buildMenuOptions = (flagsSubset, rolePerms) => {
            return flagsSubset.map(flag => {
                const hasPerm = rolePerms.has(PermissionsBitField.Flags[flag]);
                return {
                    label: (hasPerm ? "🟢 " : "🔴 ") + flag.replace(/([A-Z])/g, ' $1').trim(), // Make it slightly readable 
                    value: flag,
                    description: hasPerm ? "Currently ENABLED - Click to Disable" : "Currently DISABLED - Click to Enable",
                    default: hasPerm
                };
            });
        };

        const createUI = (role) => {
            const activeFlags = allFlags.filter(f => role.permissions.has(PermissionsBitField.Flags[f]));
            const activeText = activeFlags.length > 0 ? activeFlags.map(f => `\`${f}\``).join(', ') : "None";

            const embed = V2.container([
                V2.section([
                    V2.heading(`🛡️ Role Permission Editor`, 2),
                    V2.text(`**Target:** ${role.name}\n**ID:** \`${role.id}\`\n**Color:** \`${role.hexColor}\`\n\n**Current Permissions:**\n${activeText}\n\n**Select permissions via the dropdown menus below.**\n(🟢 = Enabled | 🔴 = Disabled)`)
                ], V2.botAvatar(message)),
                V2.separator(),
                V2.text(`*Changes apply instantly upon selection.*`)
            ], V2_BLUE);

            const options1 = buildMenuOptions(part1, role.permissions);
            const selectMenu1 = new StringSelectMenuBuilder()
                .setCustomId("editrole_part1")
                .setPlaceholder("General / Text Permissions (1/2)")
                .setMinValues(0)
                .setMaxValues(options1.length)
                .addOptions(options1);

            const options2 = buildMenuOptions(part2, role.permissions);
            const selectMenu2 = new StringSelectMenuBuilder()
                .setCustomId("editrole_part2")
                .setPlaceholder("Voice / Advanced Permissions (2/2)")
                .setMinValues(0)
                .setMaxValues(options2.length)
                .addOptions(options2);

            return {
                embeds: [embed],
                components: [
                    new ActionRowBuilder().addComponents(selectMenu1),
                    new ActionRowBuilder().addComponents(selectMenu2)
                ]
            };
        };

        // Send UI
        const uiPayload = createUI(targetRole);
        let promptMessage;
        try {
            // Using embeds here since V2 container usually returns embeds depending on implementation
            promptMessage = await message.reply({
                flags: V2.flag,
                embeds: uiPayload.embeds[0] ? [uiPayload.embeds[0]] : [],
                components: uiPayload.components
            });
        } catch (e) {
            // If V2 returns something else or embeds is undefined structure
            promptMessage = await message.reply({
                flags: V2.flag,
                components: [uiPayload.embeds[0], ...uiPayload.components]
            });
        }

        const collector = promptMessage.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            time: 120000 // 2 minutes
        });

        collector.on("collect", async (interaction) => {
            if (interaction.user.id !== message.author.id) {
                return interaction.reply({ content: "🚫 Only the command executor can use this menu.", ephemeral: true });
            }

            // We need to fetch the LATEST permissions, calculate the delta, and save.
            await targetRole.guild.roles.fetch(targetRole.id, { force: true });
            let currentPerms = new PermissionsBitField(targetRole.permissions);

            const selectedValues = interaction.values; // Array of flag names
            const id = interaction.customId;
            const relevantFlags = id === "editrole_part1" ? part1 : part2;

            // First, remove ALL relevantFlags from the current perm set
            relevantFlags.forEach(flag => {
                currentPerms.remove(PermissionsBitField.Flags[flag]);
            });

            // Then, add back the ones that were selected
            selectedValues.forEach(flag => {
                currentPerms.add(PermissionsBitField.Flags[flag]);
            });

            try {
                // Update Discord
                targetRole = await targetRole.setPermissions(currentPerms, `Interactive EditRole by ${interaction.user.tag}`);

                // Re-render UI
                const updatedUIPayload = createUI(targetRole);
                if (updatedUIPayload.embeds[0]) {
                    await interaction.update({ embeds: updatedUIPayload.embeds, components: updatedUIPayload.components });
                } else {
                    await interaction.update({ components: [updatedUIPayload.embeds[0], ...updatedUIPayload.components] });
                }
            } catch (err) {
                console.error(err);
                await interaction.reply({ content: "❌ Failed to update permissions. My role position might be too low.", ephemeral: true });
            }
        });

        collector.on("end", () => {
            promptMessage.edit({ components: [] }).catch(() => { });
        });

        /* --- KERNEL_END --- */
    }
};
