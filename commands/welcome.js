const fs = require("fs");
const path = require("path");
const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { BOT_OWNER_ID } = require("../config");
const V2 = require("../utils/v2Utils");

const DATA_DIR = path.join(__dirname, "../data");
const DB_PATH = path.join(DATA_DIR, "welcome.json");

// ───── DATA MANAGEMENT ─────
function loadWelcomeData() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify({}, null, 2));
        return {};
    }
    try {
        return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
    } catch {
        return {};
    }
}

function saveWelcomeData(data) {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = {
    name: "welcome",
    description: "Configure the premium welcome system",
    usage: "!welcome set #channel | !welcome test | !welcome off",
    permissions: [PermissionsBitField.Flags.ManageGuild],


    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: WELCOME
         * @STATUS: OPERATIONAL
         * @SECURITY: IRON_CURTAIN_ENABLED
         */
        const EXECUTION_START_TIME = Date.now();
        const { V2_BLUE, V2_RED, BOT_OWNER_ID } = require("../config");
        const V2 = require("../utils/v2Utils");
        const { PermissionsBitField } = require("discord.js");
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("welcome") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "welcome", cooldown);
            if (remaining && message.author.id !== BOT_OWNER_ID) {
                return message.reply({ content: `⚠️ **THROTTLED:** Wait ${remaining}s.`, flags: V2.flag }).catch(() => { });
            }
        }

        try {
            /* --- KERNEL_START --- */
            const isBotOwner = message.author.id === BOT_OWNER_ID;
            const isServerOwner = message.guild.ownerId === message.author.id;

            if (!isBotOwner && !isServerOwner && !message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
                return message.reply({ content: "🚫 **ACCESS DENIED:** You need Manage Server permission.", flags: V2.flag });
            }

            const subCommand = args[0]?.toLowerCase();

            // ───── CONFIGURATION ─────
            if (subCommand === "set") {
                const argsList = args.slice(1);
                const channel = message.mentions.channels.first() || message.guild.channels.cache.get(argsList[0]);

                if (!channel) {
                    return message.reply("⚠️ **Usage:** `!welcome set #joins [image_url] [@role]`\nExample: `!welcome set #joins https://...gif @Member`", { flags: V2.flag });
                }

                let imgUrl = null;
                let roleId = null;

                // Simple parsing for remaining args
                for (let i = 1; i < argsList.length; i++) {
                    const arg = argsList[i];
                    if (arg.startsWith("http")) imgUrl = arg;
                    else if (arg.match(/<@&(\d+)>/)) roleId = arg.match(/<@&(\d+)>/)[1];
                    else if (message.guild.roles.cache.has(arg)) roleId = arg;
                    else if (["off", "none", "clear"].includes(arg.toLowerCase())) {
                        // If 'off' is provided, we clear both but the user might want to clear specific ones.
                        // For now, let's treat it as a clear signal for whatever follows.
                    }
                }

                const data = loadWelcomeData();
                data[message.guild.id] = channel.id;

                if (imgUrl || argsList.includes("off") || argsList.includes("none")) {
                    if (!data.custom_imgs) data.custom_imgs = {};
                    if (["off", "none"].includes(imgUrl?.toLowerCase()) || argsList.includes("off") || argsList.includes("none")) {
                        delete data.custom_imgs[message.guild.id];
                    } else if (imgUrl) {
                        data.custom_imgs[message.guild.id] = imgUrl;
                    }
                }

                if (roleId || argsList.includes("off") || argsList.includes("none")) {
                    if (!data.verify_roles) data.verify_roles = {};
                    if (["off", "none"].includes(argsList.find(a => ["off", "none"].includes(a.toLowerCase())))) {
                        delete data.verify_roles[message.guild.id];
                    } else if (roleId) {
                        data.verify_roles[message.guild.id] = roleId;
                    }
                }

                saveWelcomeData(data);

                const container = V2.container([
                    V2.section([
                        V2.heading("✅ WELCOME RECONFIGURED", 2),
                        V2.text(`**Premium Welcome System** is now active in ${channel}.` +
                            (imgUrl ? `\n🖼️ **Custom visual saved.**` : "") +
                            (roleId ? `\n🔘 **Verification button enabled.**` : "")
                        )
                    ]),
                    imgUrl && !["off", "none"].includes(imgUrl.toLowerCase()) ? V2.section([], { type: 'image', url: imgUrl }) : null,
                    V2.separator(),
                    V2.text("*BlueSealPrime • Automation Kernel*")
                ].filter(Boolean), "#00FF00");

                return message.reply({ content: null, flags: V2.flag, components: [container] });
            }

            // ───── DM TOGGLE & TEST ─────
            if (subCommand === "dm") {
                const toggle = args[1]?.toLowerCase();

                if (toggle === "test") {
                    const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
                    const serverLink = "https://discord.gg/aPbHjvxS";
                    const count = message.guild.memberCount;
                    const suffix = ["st", "nd", "rd"][((count % 100 > 10 && count % 100 < 14) ? 0 : (count % 10) - 1)] || "th";
                    const botInvite = `https://discord.com/api/oauth2/authorize?client_id=${message.client.user.id}&permissions=8&scope=bot%20applications.commands`;

                    const avatar = message.author.displayAvatarURL({ dynamic: true, extension: "png", size: 512 });

                    const dmSection = V2.section([
                        V2.heading(`Welcome ${message.author.displayName}!`, 3),
                        V2.text(`- Thanks for joining **${message.guild.name}**! I'm **${message.client.user.username}**, the best bot here. You can Add me to your server [click here](${botInvite}).\n\n🛡️ You are the ${count}${suffix} member in this server!`)
                    ], avatar);

                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setLabel("Support")
                            .setStyle(ButtonStyle.Link)
                            .setURL(serverLink),
                        new ButtonBuilder()
                            .setLabel("Invite")
                            .setStyle(ButtonStyle.Link)
                            .setURL(botInvite)
                    );

                    const dmContainer = V2.container([dmSection, row], "#2b2d31");

                    try {
                        await message.author.send({ content: null, flags: V2.flag, components: [dmContainer] });
                        return message.reply("✅ **Simulation Complete:** Sent the standard Welcome DM preview!");
                    } catch (e) {
                        console.error("DM Test Error (Welcome):", e);
                        return message.reply("⚠️ **Simulation Failed:** I couldn't deliver the DM. This is usually due to closed DMs or a temporary API issue.");
                    }
                }

                if (toggle !== "on" && toggle !== "off") {
                    return message.reply("⚠️ **Usage:** `!welcome dm on`, `!welcome dm off`, or `!welcome dm test`.");
                }

                const dmData = loadWelcomeData();
                if (!dmData.dm_config) dmData.dm_config = {};
                dmData.dm_config[message.guild.id] = toggle === "on";
                saveWelcomeData(dmData);

                const dmConfigContainer = V2.container([
                    V2.section([
                        V2.heading("✅ DM CONFIGURATION UPDATED", 2),
                        V2.text(`**Premium Welcome DMs** are now **${toggle.toUpperCase()}** for this server.`)
                    ]),
                    V2.separator(),
                    V2.text("*BlueSealPrime • Automation Kernel*")
                ], "#00FF00");

                return message.reply({ content: null, flags: V2.flag, components: [dmConfigContainer] });
            }

            // ───── DISABLE ─────
            if (subCommand === "off") {
                const data = loadWelcomeData();
                if (!data[message.guild.id]) {
                    return message.reply("ℹ️ Welcome system is already disabled.");
                }
                delete data[message.guild.id];
                saveWelcomeData(data);
                return message.reply("✅ **Welcome system disabled.**");
            }

            // ───── TEST ─────
            if (subCommand === "test") {
                try {
                    const data = loadWelcomeData();
                    const verifyRole = data.verify_roles ? data.verify_roles[message.guild.id] : null;
                    const memberCount = message.guild.memberCount;
                    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

                    const container = V2.container([
                        V2.section([
                            V2.heading(`🦋 WELCOME TO OUR SANCTUARY 🦋`, 3),
                            V2.text(`✨ Your journey begins here, in the heart of our community.`),
                            V2.text(`🌷 May your stay be filled with joy and new connections.`),
                            V2.text(`──────────────────────────────`),
                            V2.text(`📜 Read our rules to stay in harmony.`),
                            V2.text(`🎨 Pick your colors and roles to shine.`),
                            V2.text(`──────────────────────────────`),
                            V2.text(`You are our special member #${message.guild.memberCount}!`)
                        ], message.author.displayAvatarURL({ dynamic: true, size: 512 }))
                    ], "#ff00ea");

                    return message.reply({ content: null, components: [container], flags: V2.flag });
                } catch (e) {
                    console.error("Welcome Test Error:", e);
                    return message.reply("❌ FAILD TO INITIALIZE SIMULATION CORE.");
                }
            }

            const helpContainer = V2.container([
                V2.section([
                    V2.heading("🤖 WELCOME SYSTEM CONTROL", 2),
                    V2.text(
                        `### **[ CONFIGURATION_GUIDE ]**\n\n` +
                        `> • **!welcome set #ch [img] [@role]** - Set automation parameters\n` +
                        `> • **!welcome off** - Decommission welcome protocols\n` +
                        `> • **!welcome test** - Preview channel visual\n\n` +
                        `### **[ DIRECT_MESSAGE_MOD ]**\n` +
                        `> • **!welcome dm <on/off>** - Toggle private greeting\n` +
                        `> • **!welcome dm test** - Preview DM visual`
                    )
                ]),
                V2.separator(),
                V2.text("*BlueSealPrime • Automation Suite*")
            ], "#0099ff");

            return message.reply({ content: null, components: [helpContainer], flags: V2.flag });
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "welcome", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] welcome.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "welcome", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("welcome", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`welcome\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => { });
            } catch (panic) { }
        }
    }




























































    /**
     * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | WELCOME_ID_360
     * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | WELCOME_ID_196
     * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | WELCOME_ID_266
     * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | WELCOME_ID_830
     * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | WELCOME_ID_931
     * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | WELCOME_ID_107
     * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | WELCOME_ID_369
     * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | WELCOME_ID_368
     * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | WELCOME_ID_686
     * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | WELCOME_ID_48
     * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | WELCOME_ID_322
     * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | WELCOME_ID_546
     * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | WELCOME_ID_426
     * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | WELCOME_ID_807
     * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | WELCOME_ID_428
     * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | WELCOME_ID_728
     * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | WELCOME_ID_700
     * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | WELCOME_ID_472
     * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | WELCOME_ID_899
     * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | WELCOME_ID_643
     * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | WELCOME_ID_88
     * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | WELCOME_ID_961
     * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | WELCOME_ID_111
     * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | WELCOME_ID_75
     * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | WELCOME_ID_9
     * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | WELCOME_ID_652
     * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | WELCOME_ID_711
     * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | WELCOME_ID_582
     * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | WELCOME_ID_30
     * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | WELCOME_ID_509
     * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | WELCOME_ID_430
     * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | WELCOME_ID_506
     * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | WELCOME_ID_970
     * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | WELCOME_ID_877
     * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | WELCOME_ID_328
     * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | WELCOME_ID_107
     * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | WELCOME_ID_442
     * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | WELCOME_ID_654
     * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | WELCOME_ID_523
     * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | WELCOME_ID_729
     * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | WELCOME_ID_703
     * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | WELCOME_ID_69
     * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | WELCOME_ID_367
     * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | WELCOME_ID_71
     * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | WELCOME_ID_208
     * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | WELCOME_ID_616
     * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | WELCOME_ID_433
     * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | WELCOME_ID_490
     * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | WELCOME_ID_756
     * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | WELCOME_ID_285
     * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | WELCOME_ID_545
     * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | WELCOME_ID_534
     * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | WELCOME_ID_265
     * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | WELCOME_ID_864
     * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | WELCOME_ID_945
     * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | WELCOME_ID_243
     * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | WELCOME_ID_984
     * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | WELCOME_ID_31
     * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | WELCOME_ID_741
     * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | WELCOME_ID_678
     * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | WELCOME_ID_213
     * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | WELCOME_ID_337
     * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | WELCOME_ID_619
     * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | WELCOME_ID_332
     * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | WELCOME_ID_922
     * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | WELCOME_ID_84
     * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | WELCOME_ID_143
     * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | WELCOME_ID_610
     * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | WELCOME_ID_109
     * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | WELCOME_ID_971
     * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | WELCOME_ID_936
     * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | WELCOME_ID_322
     * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | WELCOME_ID_804
     * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | WELCOME_ID_810
     * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | WELCOME_ID_552
     * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | WELCOME_ID_189
     * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | WELCOME_ID_897
     * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | WELCOME_ID_119
     * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | WELCOME_ID_806
     * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | WELCOME_ID_507
     * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | WELCOME_ID_882
     * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | WELCOME_ID_154
     * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | WELCOME_ID_299
     * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | WELCOME_ID_624
     * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | WELCOME_ID_84
     * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | WELCOME_ID_473
     * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | WELCOME_ID_244
     * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | WELCOME_ID_894
     * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | WELCOME_ID_189
     * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | WELCOME_ID_748
     * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | WELCOME_ID_470
     * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | WELCOME_ID_188
     * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | WELCOME_ID_102
     * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | WELCOME_ID_582
     * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | WELCOME_ID_29
     * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | WELCOME_ID_380
     * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | WELCOME_ID_385
     * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | WELCOME_ID_815
     * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | WELCOME_ID_185
     * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | WELCOME_ID_97
     */

};