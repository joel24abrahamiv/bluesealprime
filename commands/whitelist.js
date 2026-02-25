const fs = require("fs");
const path = require("path");
const { EmbedBuilder, ActionRowBuilder, ButtonStyle, ComponentType, PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID, EMBED_COLOR } = require("../config");

const WHITELIST_PATH = path.join(__dirname, "../data/whitelist.json");
const LOGS_DB = path.join(__dirname, "../data/logs.json");

function getLogChannel(guildId, type) {
  if (!fs.existsSync(LOGS_DB)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(LOGS_DB, "utf8"));
    const guildData = data[guildId];
    if (!guildData) return null;
    return guildData[type];
  } catch (e) { return null; }
}

// ───── LOAD WHITELIST ─────
function loadWhitelist() {
  if (!fs.existsSync(WHITELIST_PATH)) {
    fs.writeFileSync(WHITELIST_PATH, JSON.stringify({}, null, 2));
    return {};
  }
  try {
    const content = fs.readFileSync(WHITELIST_PATH, "utf8");
    return content.trim() ? JSON.parse(content) : {};
  } catch (error) {
    console.error("❌ Failed to parse whitelist.json:", error);
    return {};
  }
}

// ───── SAVE WHITELIST ─────
function saveWhitelist(data) {
  if (!fs.existsSync(path.dirname(WHITELIST_PATH))) {
    fs.mkdirSync(path.dirname(WHITELIST_PATH), { recursive: true });
  }
  fs.writeFileSync(WHITELIST_PATH, JSON.stringify(data, null, 2));
}

// ───── ADD TO WHITELIST (object format: {addedBy, addedAt, permissions}) ─────
function addEntry(whitelist, guildId, targetId, addedById, permissions = null) {
  if (!whitelist[guildId]) whitelist[guildId] = {};

  // Migrate old array format if needed
  if (Array.isArray(whitelist[guildId])) {
    const arr = whitelist[guildId];
    whitelist[guildId] = {};
    arr.forEach(id => { whitelist[guildId][id] = { addedBy: null, addedAt: Date.now(), permissions: {} }; });
  }

  const defaultPerms = {
    roleCreate: false, roleDelete: false, roleUpdate: false, roleAdd: false,
    kickBan: false, antiDangerous: false,
    channelCreate: false, channelDelete: false, channelUpdate: false,
    guildUpdate: false, emojiUpdate: false, webhooks: false,
    botAdd: false
  };

  if (!whitelist[guildId][targetId]) {
    whitelist[guildId][targetId] = {
      addedBy: addedById,
      addedAt: Date.now(),
      permissions: permissions || defaultPerms
    };
  } else {
    // Entry exists, ensure permissions object exists
    if (!whitelist[guildId][targetId].permissions) {
      whitelist[guildId][targetId].permissions = defaultPerms;
    }
    if (permissions) {
      whitelist[guildId][targetId].permissions = permissions;
    }
  }
}

// ───── REMOVE FROM WHITELIST ─────
function removeEntry(whitelist, guildId, targetId) {
  if (!whitelist[guildId]) return;
  if (Array.isArray(whitelist[guildId])) {
    whitelist[guildId] = whitelist[guildId].filter(id => id !== targetId);
  } else {
    delete whitelist[guildId][targetId];
  }
}

// ───── GET ALL IDS ─────
function getIds(whitelist, guildId) {
  const g = whitelist[guildId];
  if (!g) return [];
  if (Array.isArray(g)) return g;
  return Object.keys(g);
}

module.exports = {
  name: "whitelist",
  aliases: ["wl", "wllist"],
  description: "Manage the anti-nuke bot whitelist with granular permissions",

  async execute(message, args, commandName) {
    const EXECUTION_START_TIME = Date.now();
    const { V2_BLUE, V2_RED, WARN_COLOR, ERROR_COLOR } = require("../config");
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
      const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "whitelist", cooldown);
      if (remaining && message.author.id !== BOT_OWNER_ID) {
        return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => { });
      }
    }

    try {
      const ownersDbPath = path.join(__dirname, "../data/owners.json");
      let extraOwners = [];
      if (fs.existsSync(ownersDbPath)) {
        try {
          const db = JSON.parse(fs.readFileSync(ownersDbPath, "utf8"));
          extraOwners = db[message.guild.id] || [];
        } catch (e) { }
      }

      const isBotOwner = message.author.id === BOT_OWNER_ID;
      const isServerOwner = message.guild.ownerId === message.author.id;
      const isExtraOwner = extraOwners.includes(message.author.id);

      if (!isBotOwner && !isServerOwner && !isExtraOwner) {
        return message.reply({
          flags: V2.flag,
          components: [V2.container([V2.heading("🚫 ACCESS DENIED", 3), V2.text("Unauthorized access. Admin privileges required.")], ERROR_COLOR || "#FF3030")]
        });
      }

      const action = args[0]?.toLowerCase();
      const whitelist = loadWhitelist();
      const guildId = message.guild.id;

      if (!action) {
        return message.reply({
          flags: V2.flag,
          components: [V2.container([
            V2.section([V2.heading("📜 SECURITY WHITELIST", 2), V2.text("Manage authorized agents with granular security clearances.")], message.client.user.displayAvatarURL()),
            V2.separator(),
            V2.heading("⚙️ USAGE", 3),
            V2.text("> `!whitelist add @user` — Configure permissions\n> `!whitelist remove @user` — Remove clearance\n> `!whitelist list` — View registry"),
            V2.separator(),
            V2.text("*BlueSealPrime Security Matrix*")
          ], V2_BLUE || "#0099ff")]
        });
      }

      async function resolveTarget(argsList, startIndex = 1) {
        const mention = message.mentions.users.first();
        if (mention) return mention;
        const id = argsList[startIndex];
        if (id && /^\d{17,20}$/.test(id)) {
          try { return await message.client.users.fetch(id); } catch (e) { return null; }
        }
        return null;
      }

      if (action === "add") {
        const target = await resolveTarget(args, 1);
        if (!target) {
          return message.reply({ flags: V2.flag, components: [V2.container([V2.text("⚠️ Identify a target user or bot.")], WARN_COLOR)] });
        }
        if (target.id === BOT_OWNER_ID) {
          return message.reply({ flags: V2.flag, components: [V2.container([V2.text("ℹ️ Bot Owner has absolute clearance.")], V2_BLUE)] });
        }

        // Always call addEntry to ensure permissions object exists and is migrated if necessary
        addEntry(whitelist, guildId, target.id, message.author.id);
        saveWhitelist(whitelist);

        const currentEntry = (whitelist[guildId] && whitelist[guildId][target.id]) || { permissions: {} };
        const perms = currentEntry.permissions || {};

        const createButton = (id, label, enabled) => {
          return V2.button(`wl_${target.id}_${id}`, label, enabled ? ButtonStyle.Danger : ButtonStyle.Secondary).setEmoji(enabled ? "🔴" : "🔘");
        };

        const generateComponents = (currentPerms) => [
          V2.section([V2.heading(`Clearance: ${target.tag || target.username}`, 2), V2.text("Toggle specific authorizations for this agent.")], target.displayAvatarURL({ dynamic: true })),
          V2.separator(),
          V2.text("**Roles**"),
          new ActionRowBuilder().addComponents(createButton("roleCreate", "Create", currentPerms.roleCreate), createButton("roleDelete", "Delete", currentPerms.roleDelete), createButton("roleUpdate", "Update", currentPerms.roleUpdate), createButton("roleAdd", "Give", currentPerms.roleAdd)),
          V2.text("**Moderation**"),
          new ActionRowBuilder().addComponents(createButton("kickBan", "Ban/Kick", currentPerms.kickBan), createButton("antiDangerous", "Dangerous", currentPerms.antiDangerous)),
          V2.text("**Channels**"),
          new ActionRowBuilder().addComponents(createButton("channelCreate", "Create", currentPerms.channelCreate), createButton("channelDelete", "Delete", currentPerms.channelDelete), createButton("channelUpdate", "Update", currentPerms.channelUpdate)),
          V2.text("**Server**"),
          new ActionRowBuilder().addComponents(createButton("guildUpdate", "Settings", currentPerms.guildUpdate), createButton("emojiUpdate", "Emoji", currentPerms.emojiUpdate), createButton("webhooks", "Webhooks", currentPerms.webhooks)),
          V2.text("**System**"),
          new ActionRowBuilder().addComponents(createButton("botAdd", "Add/Rem Bots", currentPerms.botAdd)),
          V2.separator(),
          new ActionRowBuilder().addComponents(V2.button(`wl_${target.id}_save`, "SAVE CLEARANCE", ButtonStyle.Primary))
        ];

        const response = await message.reply({ components: [V2.container(generateComponents(perms), V2_BLUE)] });
        const collector = response.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000, filter: i => i.user.id === message.author.id });
        let activePerms = { ...perms };

        collector.on("collect", async i => {
          const parts = i.customId.split("_");
          const subAction = parts[2];

          if (subAction === "save") {
            const fresh = loadWhitelist();
            addEntry(fresh, guildId, target.id, message.author.id, activePerms);
            saveWhitelist(fresh);
            await i.update({ components: [V2.container([V2.heading("✅ REGISTRY UPDATED", 2), V2.text(`Clearance levels for **${target.tag}** have been secured.`)], "#2ECC71")] });
            return collector.stop();
          }
          activePerms[subAction] = !activePerms[subAction];
          await i.update({ components: [V2.container(generateComponents(activePerms), V2_BLUE)] });
        });
        return;
      }

      if (action === "remove") {
        const target = await resolveTarget(args, 1);
        if (!target || !getIds(whitelist, guildId).includes(target.id)) {
          return message.reply({ content: "⚠️ Agent not found in registry.", flags: V2.flag });
        }
        removeEntry(whitelist, guildId, target.id);
        saveWhitelist(whitelist);
        return message.reply({ content: `✅ **${target.tag}** clearance revoked.`, flags: V2.flag });
      }

      if (action === "list" || action === "wllist") {
        const ids = getIds(whitelist, guildId);
        if (ids.length === 0) return message.channel.send({ content: "📜 Registry is empty." });
        const lines = await Promise.all(ids.map(async (id, i) => {
          const u = message.client.users.cache.get(id) || await message.client.users.fetch(id).catch(() => null);
          return `**${i + 1}.** ${u ? (u.bot ? "🤖" : "👤") + " " + u.tag : "❓ Unknown"} (\`${id}\`)`;
        }));
        return message.channel.send({ components: [V2.container([V2.heading("📜 AUTHORIZED PERSONNEL", 2), V2.text(lines.join("\n"))], V2_BLUE)] });
      }

    } catch (err) {
      console.error(err);
      return message.reply({ content: `❌ **SYSTEM_ERROR:** ${err.message}`, flags: V2.flag }).catch(() => { });
    }
  }
};