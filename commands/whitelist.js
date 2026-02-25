const fs = require("fs");
const path = require("path");
const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, PermissionsBitField, ComponentType, ButtonBuilder, ButtonStyle } = require("discord.js");
const { BOT_OWNER_ID, V2_BLUE, V2_RED, WARN_COLOR, ERROR_COLOR } = require("../config");
const V2 = require("../utils/v2Utils");
const mainProcess = require("../index");

const WHITELIST_PATH = path.join(__dirname, "../data/whitelist.json");
const ANTINUKE_PATH = path.join(__dirname, "../data/antinuke.json");

// ────── GLOBAL DATABASE MANAGERS ──────

function loadWhitelist() {
  if (!fs.existsSync(WHITELIST_PATH)) return {};
  try {
    const data = JSON.parse(fs.readFileSync(WHITELIST_PATH, "utf8"));
    return data || {};
  } catch { return {}; }
}

function saveWhitelist(data) {
  if (!fs.existsSync(path.dirname(WHITELIST_PATH))) fs.mkdirSync(path.dirname(WHITELIST_PATH), { recursive: true });
  fs.writeFileSync(WHITELIST_PATH, JSON.stringify(data, null, 2));
}

function loadAntinuke() {
  if (!fs.existsSync(ANTINUKE_PATH)) return {};
  try { return JSON.parse(fs.readFileSync(ANTINUKE_PATH, "utf8")); } catch { return {}; }
}

function saveAntinuke(data) {
  if (!fs.existsSync(path.dirname(ANTINUKE_PATH))) fs.mkdirSync(path.dirname(ANTINUKE_PATH), { recursive: true });
  fs.writeFileSync(ANTINUKE_PATH, JSON.stringify(data, null, 2));
}

function getSafePerms(entry) {
  const defaultPerms = {
    roleCreate: false, roleDelete: false, roleUpdate: false, roleAdd: false,
    kickBan: false, antiDangerous: false,
    channelCreate: false, channelDelete: false, channelUpdate: false,
    guildUpdate: false, emojiUpdate: false, webhooks: false,
    botAdd: false
  };
  if (!entry || !entry.permissions) return defaultPerms;
  return { ...defaultPerms, ...entry.permissions };
}

function syncWhitelistAdd(guildId, userId, addedBy, permissions = null) {
  // Sync Whitelist.json
  let wl = loadWhitelist();
  if (!wl[guildId]) wl[guildId] = {};

  // Migrate array to object if needed
  if (Array.isArray(wl[guildId])) {
    const arr = wl[guildId];
    wl[guildId] = {};
    arr.forEach(id => { wl[guildId][id] = { addedBy: null, addedAt: Date.now(), permissions: getSafePerms() }; });
  }

  if (!wl[guildId][userId]) {
    wl[guildId][userId] = {
      addedBy: addedBy,
      addedAt: Date.now(),
      permissions: getSafePerms()
    };
  }

  if (permissions) {
    wl[guildId][userId].permissions = { ...wl[guildId][userId].permissions, ...permissions };
  }
  saveWhitelist(wl);

  // Sync Antinuke.json
  let an = loadAntinuke();
  if (!an[guildId]) an[guildId] = { enabled: false, whitelisted: [], autorestore: true, limits: {} };
  if (!an[guildId].whitelisted) an[guildId].whitelisted = [];
  if (!an[guildId].whitelisted.includes(userId)) {
    an[guildId].whitelisted.push(userId);
    saveAntinuke(an);
  }

  return wl[guildId][userId];
}

function syncWhitelistRemove(guildId, userId) {
  // Sync Whitelist.json
  let wl = loadWhitelist();
  if (wl[guildId]) {
    if (Array.isArray(wl[guildId])) {
      wl[guildId] = wl[guildId].filter(id => id !== userId);
    } else {
      delete wl[guildId][userId];
    }
    saveWhitelist(wl);
  }

  // Sync Antinuke.json
  let an = loadAntinuke();
  if (an[guildId] && an[guildId].whitelisted) {
    an[guildId].whitelisted = an[guildId].whitelisted.filter(id => id !== userId);
    saveAntinuke(an);
  }
}

// ────── COMMAND BODY ──────

module.exports = {
  name: "whitelist",
  aliases: ["wl", "wllist", "unwhitelist"],
  description: "Manage Sovereign Anti-Nuke Whitelist & Clearances.",
  usage: "!whitelist <add|remove|list> [@user/ID]",

  async execute(message, args, commandAlias) {
    const EXECUTION_START_TIME = Date.now();

    if (!message || !message.guild) return;

    // Ensure Bot Admin
    const botMember = message.guild.members.me;
    if (!botMember.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply({
        flags: V2.flag,
        components: [V2.container([V2.text("❌ **PERMISSION_FAULT:** Administrator role required.")], V2_RED)]
      }).catch(() => { });
    }

    // Auth Checks (Owner Level required ONLY for Advanced config)
    const isBotOwner = message.author.id === BOT_OWNER_ID;
    const isServerOwner = message.author.id === message.guild.ownerId;
    const OWNERS_DB = path.join(__dirname, "../data/owners.json");
    let extraOwners = [];
    if (fs.existsSync(OWNERS_DB)) {
      try {
        const db = JSON.parse(fs.readFileSync(OWNERS_DB, "utf8"));
        if (db[message.guild.id]) extraOwners = db[message.guild.id].map(o => typeof o === 'string' ? o : o.id);
      } catch (e) { }
    }
    const isOwner = isBotOwner || isServerOwner || extraOwners.includes(message.author.id);
    const isAdmin = message.member.permissions.has(PermissionsBitField.Flags.Administrator);

    if (!isAdmin) {
      return message.reply({
        flags: V2.flag,
        components: [V2.container([V2.text("🚫 **Security Alert:** Access Denied. Administrator clearance required.")], V2_RED)]
      }).catch(() => { });
    }

    try {
      const isAdvanced = message.content.includes(`<@${message.client.user.id}>`);
      let shiftIndex = 0;

      // If the very first argument is the bot mention, shift everything by 1 so we correctly read 'add' or 'remove'
      if (args[0] && args[0].includes(message.client.user.id)) {
        shiftIndex = 1;
      }

      // Determine action based on alias
      let action = args[shiftIndex]?.toLowerCase();
      let targetArg = args[shiftIndex + 1];

      if (commandAlias === "unwhitelist") {
        action = "remove";
        targetArg = args[shiftIndex];
      } else if (commandAlias === "wllist") {
        action = "list";
      }

      if (!action || !["add", "remove", "list"].includes(action)) {
        return message.reply({
          flags: V2.flag,
          components: [V2.container([
            V2.section(
              [V2.heading("🛡️ SOVEREIGN CLEARANCE REGISTRY", 2), V2.text("Manage immune agents across the server architecture.")],
              message.client.user.displayAvatarURL()
            ),
            V2.separator(),
            V2.heading("⚙️ TIER 1: AUTO-MOD WHITELIST", 3),
            V2.text("> `!whitelist add @user` — Grant Spam/BadWord Immunity\n> `!whitelist remove @user` — Revoke AI immunities"),
            V2.separator(),
            V2.heading("⚙️ TIER 2: ANTI-NUKE MATRIX (OWNERS ONLY)", 3),
            V2.text(`> \`@${message.client.user.username} !whitelist add @user\` — Open Granular Settings`),
            V2.separator(),
            V2.text("*BlueSealPrime Identity Protocol*")
          ], V2_BLUE)]
        });
      }

      // Target Resolver function
      const resolveTarget = async (idOrMention) => {
        // Must filter out the bot if it was tagged for advanced mode
        const mention = message.mentions.users.filter(u => u.id !== message.client.user.id).first();
        if (mention) return mention;
        if (idOrMention && /^\d{17,20}$/.test(idOrMention)) {
          try { return await message.client.users.fetch(idOrMention); } catch { return null; }
        }
        return null; // Silent fallthrough handled by checks below
      };

      // ── ADD TO WHITELIST & SETUP CLEARANCES ──
      if (action === "add" || (isAdvanced && action === "remove")) {
        const target = await resolveTarget(targetArg);
        if (!target) {
          return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ **Invalid Target:** Please mention a user/bot or provide their ID.")], WARN_COLOR || "#FFCC00")] });
        }
        if (target.id === BOT_OWNER_ID || target.id === message.guild.ownerId) {
          return message.reply({ flags: V2.flag, components: [V2.container([V2.text("ℹ️ **Sovereign Override:** Target already possesses maximum absolute clearance.")], V2_BLUE)] });
        }

        // ── NORMAL FLOW: INSTANT AUTO-MOD IMMUNITY ──
        if (!isAdvanced) {
          let wl = loadWhitelist();
          if (!wl[message.guild.id]) wl[message.guild.id] = {};
          if (!wl[message.guild.id][target.id]) {
            wl[message.guild.id][target.id] = { addedBy: message.author.id, addedAt: Date.now(), permissions: getSafePerms() };
          }
          if (!wl[message.guild.id][target.id].permissions) wl[message.guild.id][target.id].permissions = getSafePerms();

          wl[message.guild.id][target.id].permissions.antiSpam = true;
          wl[message.guild.id][target.id].permissions.antiBadwords = true;
          saveWhitelist(wl);

          return message.reply({
            flags: V2.flag,
            components: [V2.container([
              V2.section([
                V2.heading("✅ AUTO-MOD EXEMPTION GRANTED", 2),
                V2.text(`**Target:** ${target.tag || target.username}\n> Agent is now immune to Chat Filters (Spam/BadWords).`)
              ], target.displayAvatarURL({ dynamic: true }))
            ], "#2ECC71")]
          });
        }

        // ── ADVANCED FLOW: DROPDOWN MATRIX (Requires Owner) ──
        if (isAdvanced && !isOwner) {
          return message.reply({ flags: V2.flag, components: [V2.container([V2.text("🚫 **Security Alert:** Advanced Dropdown Matrix restricted to System Owners.")], V2_RED)] });
        }     // Add to registry with default perms to begin interacting
        const entry = syncWhitelistAdd(message.guild.id, target.id, message.author.id);
        let currentPerms = getSafePerms(entry);

        const buildMenu = (perms) => {
          // Mappings for UI
          const optionsData = [
            { id: "roleCreate", label: "Create Roles", desc: "Allow creating new server roles" },
            { id: "roleDelete", label: "Delete Roles", desc: "Allow omitting existing server roles" },
            { id: "roleUpdate", label: "Update Roles", desc: "Allow modify role details and hierarchy" },
            { id: "roleAdd", label: "Assign Roles", desc: "Allow giving roles to members" },
            { id: "channelCreate", label: "Create Channels", desc: "Allow building new text/voice channels" },
            { id: "channelDelete", label: "Delete Channels", desc: "Allow removing existing channels" },
            { id: "channelUpdate", label: "Update Channels", desc: "Allow modifying channel overrides" },
            { id: "kickBan", label: "Ban & Kick", desc: "Allow moderating and expelling users" },
            { id: "antiDangerous", label: "Anti-Dangerous", desc: "Bypass anti-dangerous permission filters" },
            { id: "botAdd", label: "Invite Bots", desc: "Allow executing bot invites to server" },
            { id: "guildUpdate", label: "Server Settings", desc: "Allow updating guild name, icon, vanity" },
            { id: "webhooks", label: "Manage Webhooks", desc: "Allow creation and deletion of webhooks" }
          ];

          const selectMenu = new StringSelectMenuBuilder()
            .setCustomId(`wl_select_${target.id}`)
            .setPlaceholder("Select Immunities for this target...")
            .setMinValues(0)
            .setMaxValues(optionsData.length);

          optionsData.forEach(opt => {
            const isEnabled = !!perms[opt.id];
            selectMenu.addOptions(
              new StringSelectMenuOptionBuilder()
                .setLabel(opt.label)
                .setDescription(opt.desc)
                .setValue(opt.id)
                .setDefault(isEnabled)
            );
          });

          const buttonsRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(`wl_save_${target.id}`)
              .setLabel("Save Clearance")
              .setStyle(ButtonStyle.Success)
              .setEmoji("✅"),
            new ButtonBuilder()
              .setCustomId(`wl_terminate_${target.id}`)
              .setLabel("Terminate")
              .setStyle(ButtonStyle.Danger)
              .setEmoji("🛑")
          );

          return [
            V2.section([
              V2.heading(`Clearance Matrix: ${target.tag || target.username}`, 2),
              V2.text("Configure specific actions this agent is immune against.")
            ], target.displayAvatarURL({ dynamic: true })),
            V2.separator(),
            new ActionRowBuilder().addComponents(selectMenu),
            buttonsRow
          ];
        };

        const msgResponse = await message.reply({ components: [V2.container(buildMenu(currentPerms), V2_BLUE)], flags: V2.flag });

        const collector = msgResponse.createMessageComponentCollector({
          time: 90000,
          filter: i => i.user.id === message.author.id
        });

        collector.on("collect", async (i) => {
          if (i.componentType === ComponentType.StringSelect) {
            const selected = i.values || []; // Array of selected option IDs

            // Reset all
            const newPerms = getSafePerms();
            // Apply selected
            selected.forEach(optId => {
              newPerms[optId] = true;
            });

            // Save properties dynamically without closing
            currentPerms = newPerms;
            syncWhitelistAdd(message.guild.id, target.id, message.author.id, currentPerms);

            await i.update({ components: [V2.container(buildMenu(currentPerms), V2_BLUE)] });
          } else if (i.componentType === ComponentType.Button) {
            if (i.customId.startsWith("wl_save_")) {
              // Already synced on dropdown change, simply close
              await i.update({
                components: [V2.container([
                  V2.section([
                    V2.heading("✅ REGISTRY SYNCHRONIZED", 2),
                    V2.text(`Clearance architecture for **${target.tag || target.username}** successfully archived.`)
                  ])
                ], "#2ECC71")]
              });
              collector.stop("saved");
            } else if (i.customId.startsWith("wl_terminate_")) {
              await i.update({
                components: [V2.container([
                  V2.section([
                    V2.heading("🛑 CONFIGURATION TERMINATED", 2),
                    V2.text(`Clearance interface for **${target.tag || target.username}** was aborted by the administrator.`)
                  ])
                ], V2_RED)]
              });
              collector.stop("terminated");
            }
          }
        });

        collector.on("end", (collected, reason) => {
          if (reason === "time") {
            const savedText = `Clearance interface for **${target.tag || target.username}** timed out. Changes previously made were saved.`;
            msgResponse.edit({
              components: [V2.container([
                V2.section([
                  V2.heading("⚠️ SESSION TIMEOUT", 2),
                  V2.text(savedText)
                ])
              ], WARN_COLOR || "#FFCC00")]
            }).catch(() => { });
          }
        });
      } // <--- Added missing bracket closing the `add` logical block

      // ── REMOVE FROM WHITELIST (NORMAL ROUTE) ──
      if (action === "remove" && !isAdvanced) {
        const target = await resolveTarget(targetArg);
        if (!target) {
          return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ **Invalid Target:** Please mention a user/bot or provide their ID.")], WARN_COLOR || "#FFCC00")] });
        }

        let wl = loadWhitelist();
        if (wl[message.guild.id] && wl[message.guild.id][target.id]) {
          // Just revoke specific auto-mod perms instead of full nuke
          if (wl[message.guild.id][target.id].permissions) {
            wl[message.guild.id][target.id].permissions.antiSpam = false;
            wl[message.guild.id][target.id].permissions.antiBadwords = false;
            saveWhitelist(wl);
          }
        }

        return message.reply({
          flags: V2.flag,
          components: [V2.container([
            V2.section([
              V2.heading("🗑️ AUTO-MOD EXEMPTION REVOKED", 2),
              V2.text(`**Target:** ${target.tag || target.username}\n> Spam & Chat Filter immunities successfully stripped.`)
            ], target.displayAvatarURL({ dynamic: true }))
          ], V2_RED)]
        });
      }

      // ── LIST WHITELISTED ENTITIES ──
      if (action === "list") {
        const wl = loadWhitelist();
        const guildWl = wl[message.guild.id];
        let ids = [];

        if (guildWl) {
          if (Array.isArray(guildWl)) ids = guildWl;
          else ids = Object.keys(guildWl);
        }

        let targetIds = [];
        if (!Array.isArray(guildWl) && guildWl) {
          for (const id of ids) {
            const perms = guildWl[id].permissions || {};
            const hasAdvanced = ['roleCreate', 'roleDelete', 'roleUpdate', 'roleAdd', 'channelCreate', 'channelDelete', 'channelUpdate', 'kickBan', 'antiDangerous', 'botAdd', 'guildUpdate', 'webhooks'].some(p => perms[p]);
            const hasNormal = perms.antiSpam || perms.antiBadwords;

            if (isAdvanced && hasAdvanced) targetIds.push(id);
            else if (!isAdvanced && hasNormal) targetIds.push(id);
          }
        } else {
          targetIds = ids; // Legacy mapping
        }

        const title = isAdvanced ? "🛡️ ANTI-NUKE MATRIX REGISTRY" : "🛡️ AUTO-MOD EXEMPTION REGISTRY";
        const desc = isAdvanced ? "**Agents holding Dangerous Clearances:**" : "**Agents holding Chat Filter Immunities:**";
        const emptyDesc = isAdvanced ? "No agents possess advanced Anti-Nuke clearances." : "No agents possess basic Auto-Mod immunities.";

        if (targetIds.length === 0) {
          return message.reply({
            flags: V2.flag,
            components: [V2.container([
              V2.section(
                [V2.heading(title, 2), V2.text(emptyDesc)],
                message.client.user.displayAvatarURL()
              )
            ], V2_BLUE)]
          });
        }

        const linesPromises = targetIds.map(async (id, i) => {
          const u = message.client.users.cache.get(id) || await message.client.users.fetch(id).catch(() => null);
          const icon = u ? (u.bot ? "🤖" : "👤") : "❓";
          const name = u ? (u.tag || u.username) : "Unknown Entity";

          if (!isAdvanced) {
            return `> **${i + 1}.** ${icon} **${name}** (\`${id}\`)`;
          }

          // Advanced Mode: Show spacious granular permissions mapping
          const perms = guildWl[id]?.permissions || {};
          let heldPerms = [];
          if (perms.roleCreate) heldPerms.push("RoleCreate");
          if (perms.roleDelete) heldPerms.push("RoleDelete");
          if (perms.roleUpdate) heldPerms.push("RoleUpdate");
          if (perms.roleAdd) heldPerms.push("RoleAdd");
          if (perms.channelCreate) heldPerms.push("ChannelCreate");
          if (perms.channelDelete) heldPerms.push("ChannelDelete");
          if (perms.channelUpdate) heldPerms.push("ChannelUpdate");
          if (perms.kickBan) heldPerms.push("Kick/Ban");
          if (perms.antiDangerous) heldPerms.push("Anti-Dangerous");
          if (perms.botAdd) heldPerms.push("Bot Add");
          if (perms.guildUpdate) heldPerms.push("Guild Settings");
          if (perms.webhooks) heldPerms.push("Webhooks");

          const permString = heldPerms.length > 0 ? heldPerms.join(" • ") : "No specific clearances identified";

          return `> **${i + 1}.** ${icon} **${name}**\n> └ 🆔 \`${id}\`\n> └ ⚙️ \`${permString}\`\n`;
        });

        const lines = await Promise.all(linesPromises);

        return message.reply({
          flags: V2.flag,
          components: [V2.container([
            V2.section(
              [V2.heading(title, 2), V2.text(desc)],
              message.guild.iconURL({ dynamic: true })
            ),
            V2.text("\n" + lines.join("\n")),
            V2.separator(),
            V2.text("*BlueSealPrime Identity Protocol*")
          ], V2_BLUE)]
        });
      }

    } catch (err) {
      console.error("[WHITELIST COMMAND ERROR]", err);
      return message.reply({
        flags: V2.flag,
        components: [V2.container([
          V2.heading("🛑 CRITICAL EXCEPTION", 2),
          V2.text(`\`${err.message}\``)
        ], ERROR_COLOR || V2_RED)]
      }).catch(() => { });
    }
  }
};
