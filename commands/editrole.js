const { PermissionsBitField, StringSelectMenuBuilder, ActionRowBuilder, ComponentType, EmbedBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED } = require("../config");
const ObjectKeys = Object.keys(PermissionsBitField.Flags);

module.exports = {
    name: "editrole",
    description: "Interactively edit a role's permissions (Admin Only)",
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
                    V2.text("This command is strictly restricted to the **Bot Owner**, **Server Owner**, and **Extra Owners**.\\nRole modifications are heavily monitored.")
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

        // Discord limits StringSelectMenus to 25 options maximum.
        const allFlags = Object.keys(PermissionsBitField.Flags);
        const chunkedFlags = [];
        for (let i = 0; i < allFlags.length; i += 25) {
            chunkedFlags.push(allFlags.slice(i, i + 25));
        }

        const buildMenuOptions = (flagsSubset, rolePerms) => {
            return flagsSubset.map(flag => {
                const hasPerm = rolePerms.has(PermissionsBitField.Flags[flag]);
                return {
                    label: ((hasPerm ? "🟢 " : "🔴 ") + flag.replace(/([A-Z])/g, ' $1').trim()).slice(0, 40),
                    value: flag,
                    description: hasPerm ? "Currently ENABLED - Click to Disable" : "Currently DISABLED - Click to Enable",
                    default: hasPerm
                };
            });
        };

        const createUI = (role, currentPermsOverride = null) => {
            const rolePerms = currentPermsOverride || role.permissions;
            const activeFlags = allFlags.filter(f => rolePerms.has(PermissionsBitField.Flags[f]));
            const activeText = activeFlags.length > 0 ? activeFlags.map(f => `\`${f}\``).join(', ') : "None";

            const embed = new EmbedBuilder()
                .setTitle(`🛡️ Role Permission Editor (Draft Mode)`)
                .setDescription(`**Target:** ${role.name}\n**ID:** \`${role.id}\`\n**Color:** \`${role.hexColor}\`\n\n**Draft Permissions:**\n${activeText}\n\n**Select permissions via the dropdown menus below.**\n(🟢 = Enabled | 🔴 = Disabled)\n\n*Click **Save Changes** when finished!*`)
                .setColor(V2_BLUE)
                .setThumbnail(message.guild?.members?.me?.displayAvatarURL({ forceStatic: true, extension: "png", size: 512 }) || message.client?.user?.displayAvatarURL({ forceStatic: true, extension: "png", size: 512 }) || null);

            const components = [];
            chunkedFlags.forEach((chunk, index) => {
                const options = buildMenuOptions(chunk, rolePerms);
                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId(`editrole_part${index + 1}`)
                    .setPlaceholder(`Permissions Page ${index + 1}/${chunkedFlags.length}`)
                    .setMinValues(0)
                    .setMaxValues(options.length)
                    .addOptions(options);

                components.push(new ActionRowBuilder().addComponents(selectMenu));
            });

            // Action Buttons
            const saveBtn = new ButtonBuilder().setCustomId("editrole_save").setLabel("Save Changes").setStyle(ButtonStyle.Success).setEmoji("✅");
            const cancelBtn = new ButtonBuilder().setCustomId("editrole_cancel").setLabel("Terminate").setStyle(ButtonStyle.Danger).setEmoji("✖️");
            components.push(new ActionRowBuilder().addComponents(saveBtn, cancelBtn));

            return {
                embeds: [embed],
                components: components
            };
        };

        // Send UI
        const uiPayload = createUI(targetRole);
        let promptMessage;

        // Native Interaction Support
        const isInteraction = typeof message.isCommand === 'function' && message.isCommand();

        try {
            if (isInteraction) {
                // For slash commands
                promptMessage = await message.reply({
                    embeds: uiPayload.embeds[0] ? [uiPayload.embeds[0]] : [],
                    components: uiPayload.components,
                    fetchReply: true
                });
            } else {
                // For normal text commands
                promptMessage = await message.reply({
                    embeds: uiPayload.embeds[0] ? [uiPayload.embeds[0]] : [],
                    components: uiPayload.components
                });
            }
        } catch (e) {
            // V2 fallback structure
            if (isInteraction) {
                promptMessage = await message.reply({
                    components: [uiPayload.embeds[0], ...uiPayload.components],
                    fetchReply: true
                });
            } else {
                promptMessage = await message.reply({
                    components: [uiPayload.embeds[0], ...uiPayload.components]
                });
            }
        }

        // If interaction, we need the underlying message via fetchReply
        let collectorTarget = promptMessage;
        if (isInteraction && typeof message.fetchReply === 'function') {
            try { collectorTarget = await message.fetchReply(); } catch (e) { }
        }

        // Initialize a Local Draft of the permissions so we don't save to Discord continuously
        let localDraftPerms = new PermissionsBitField(targetRole.permissions);

        const collector = collectorTarget.createMessageComponentCollector({
            time: 120000 // 2 minutes
        });

        collector.on("collect", async (interaction) => {
            if (interaction.user.id !== message.author.id) {
                return interaction.reply({ content: "🚫 Only the command executor can use this menu.", ephemeral: true });
            }

            const id = interaction.customId;

            if (interaction.isButton()) {
                if (id === "editrole_cancel") {
                    collector.stop("cancelled");
                    return interaction.update({ content: "🛑 Edit session terminated.", components: [], embeds: [] });
                }

                if (id === "editrole_save") {
                    try {
                        targetRole = await targetRole.setPermissions(localDraftPerms, `Interactive EditRole saved by ${interaction.user.tag}`);

                        const successEmbed = new EmbedBuilder()
                            .setTitle(`✅ Role Permissions Saved`)
                            .setDescription(`Permissions for **${targetRole.name}** have been successfully updated.`)
                            .setColor(V2_BLUE);

                        collector.stop("saved");
                        return interaction.update({ embeds: [successEmbed], components: [] });
                    } catch (err) {
                        console.error(err);
                        return interaction.reply({ content: "❌ Failed to save permissions. My hierarchy position might be too low.", ephemeral: true });
                    }
                }
            }

            if (interaction.isStringSelectMenu()) {
                const selectedValues = interaction.values; // Array of flag names

                // Extract the index from the custom ID. "editrole_part1" -> 1. Arrays are 0-indexed, so we subtract 1.
                const pageNumberMatch = id.match(/editrole_part(\d+)/);
                if (!pageNumberMatch) return interaction.reply({ content: `❌ Unknown menu ID. Received: \`${id}\``, ephemeral: true });

                const chunkIndex = parseInt(pageNumberMatch[1]) - 1;
                const relevantFlags = chunkedFlags[chunkIndex];

                // Remove ALL flags from this specific page chunk from our local draft
                relevantFlags.forEach(flag => {
                    localDraftPerms.remove(PermissionsBitField.Flags[flag]);
                });

                // Add back the ones the user currently has selected in the dropdown
                selectedValues.forEach(flag => {
                    localDraftPerms.add(PermissionsBitField.Flags[flag]);
                });

                // Re-render UI with draft perms
                const updatedUIPayload = createUI(targetRole, localDraftPerms);
                if (updatedUIPayload.embeds[0]) {
                    await interaction.update({ embeds: updatedUIPayload.embeds, components: updatedUIPayload.components });
                } else {
                    await interaction.update({ components: [updatedUIPayload.embeds[0], ...updatedUIPayload.components] });
                }
            }
        });

        collector.on("end", () => {
            promptMessage.edit({ components: [] }).catch(() => { });
        });

        /* --- KERNEL_END --- */
    }
};
