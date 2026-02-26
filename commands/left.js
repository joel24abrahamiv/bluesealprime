const fs = require("fs");
const path = require("path");
const { EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { BOT_OWNER_ID } = require("../config");
const V2 = require("../utils/v2Utils");

const DATA_DIR = path.join(__dirname, "../data");
const DB_PATH = path.join(DATA_DIR, "left.json");

// ───── DATA MANAGEMENT ─────
function loadLeftData() {
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

function saveLeftData(data) {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = {
    name: "left",
    description: "Configure the premium goodbye system",
    usage: "!left set #channel | !left test | !left off",
    permissions: [PermissionsBitField.Flags.ManageGuild],


    async execute(message, args, commandName) {
        /**
         * @MODULE: SOVEREIGN_CORE_V3
         * @COMMAND: LEFT
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
            const cooldown = ["enuke", "antinuke", "massban", "backup"].includes("left") ? 10 : 3;
            const remaining = mainProcess.REACTOR.isCooledDown(message.author.id, "left", cooldown);
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
                const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
                const imgUrl = args[2];

                if (!channel) {
                    return message.reply("⚠️ **Please mention a valid channel.**\nUsage: `!left set #goodbyes [optional_img_url]`", { flags: V2.flag });
                }

                const data = loadLeftData();
                data[message.guild.id] = channel.id;

                if (imgUrl) {
                    if (!data.custom_imgs) data.custom_imgs = {};
                    if (["off", "none", "clear", "remove"].includes(imgUrl.toLowerCase())) {
                        delete data.custom_imgs[message.guild.id];
                    } else {
                        data.custom_imgs[message.guild.id] = imgUrl;
                    }
                }

                saveLeftData(data);

                const container = V2.container([
                    V2.section([
                        V2.heading("✅ GOODBYE SYSTEM INITIALIZED", 2),
                        V2.text(`**Premium Farewell Protocol** is now monitoring departures in ${channel}.` + (imgUrl ? `\n\n🖼️ **Custom image/GIF saved.**` : ""))
                    ]),
                    imgUrl ? V2.section([], { type: 'image', url: imgUrl }) : null,
                    V2.separator(),
                    V2.text("*BlueSealPrime • Automation Kernel*")
                ].filter(Boolean), "#FF4500");

                return message.reply({ content: null, flags: V2.flag, components: [container] });
            }

            // ───── DM TOGGLE & TEST ─────
            if (subCommand === "dm") {
                const toggle = args[1]?.toLowerCase();

                if (toggle === "test") {
                    const moment = require("moment");
                    const avatar = message.author.displayAvatarURL({ dynamic: true, extension: "png", size: 512 });
                    const serverLink = "https://discord.gg/aPbHjvxS";

                    const dmSection = V2.section([
                        V2.heading(`Farewell from ${message.guild.name}!!`, 3),
                        V2.text(`Goodbye, ${message.author}!! We're sad to see you leave, but we hope you enjoyed your stay! ❤️`)
                    ], avatar);

                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setLabel("Support")
                            .setStyle(ButtonStyle.Link)
                            .setURL(serverLink)
                    );

                    const dmContainer = V2.container([dmSection, row], "#ff4500");

                    try {
                        await message.author.send({ content: null, flags: V2.flag, components: [dmContainer] });
                        return message.reply("✅ **Simulation Complete:** Sent the standard Farewell DM preview!");
                    } catch (e) {
                        console.error("DM Test Error (Left):", e);
                        return message.reply("⚠️ **Simulation Failed:** I couldn't deliver the DM. This is usually due to closed DMs or a temporary API issue.");
                    }
                }

                if (toggle !== "on" && toggle !== "off") {
                    return message.reply("⚠️ **Usage:** `!left dm on`, `!left dm off`, or `!left dm test`.");
                }

                const data = loadLeftData();
                if (!data.dm_config) data.dm_config = {};
                data.dm_config[message.guild.id] = toggle === "on";
                saveLeftData(data);

                const container = V2.container([
                    V2.section([
                        V2.heading("✅ DM CONFIGURATION UPDATED", 2),
                        V2.text(`**Premium Farewell DMs** are now **${toggle.toUpperCase()}** for this server.`)
                    ]),
                    V2.separator(),
                    V2.text("*BlueSealPrime • Automation Kernel*")
                ], "#FF4500");

                return message.reply({ content: null, flags: V2.flag, components: [container] });
            }

            // ───── DISABLE ─────
            if (subCommand === "off") {
                const data = loadLeftData();
                if (!data[message.guild.id]) {
                    return message.reply("ℹ️ Goodbye system is already disabled.");
                }
                delete data[message.guild.id];
                saveLeftData(data);
                return message.reply("✅ **Goodbye system disabled.**");
            }

            // ───── TEST ─────
            if (subCommand === "test") {
                try {
                    const data = loadLeftData();
                    const memberCount = message.guild.memberCount;
                    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

                    const container = V2.container([
                        V2.section([
                            V2.heading(`🦋 A STAR FADES IN OUR GALAXY 🦋`, 3),
                            V2.text(`💔 Goodbye, voyager. Your presence will be missed in these halls.`),
                            V2.text(`🥀 The echoes of your journey remain with us.`),
                            V2.text(`──────────────────────────────`),
                            V2.text(`We hope you find peace wherever you go.`),
                            V2.text(`The door is always open if you wish to return.`),
                            V2.text(`──────────────────────────────`),
                            V2.text(`Farewell until our paths cross again.`)
                        ], message.author.displayAvatarURL({ dynamic: true, size: 512 }))
                    ], "#ff4500");

                    return message.reply({ content: null, components: [container], flags: V2.flag });
                } catch (e) {
                    console.error("Left Test Error:", e);
                    return message.reply("❌ FAILD TO INITIALIZE SIMULATION CORE.");
                }
            }

            const helpContainer = V2.container([
                V2.section([
                    V2.heading("🤖 GOODBYE SYSTEM CONTROL", 2),
                    V2.text(
                        `### **[ CONFIGURATION_GUIDE ]**\n\n` +
                        `> • **!left set #ch [img]** - Set channel & optional GIF\n` +
                        `> • **!left off** - Decommission departure protocols\n` +
                        `> • **!left test** - Preview channel visual\n\n` +
                        `### **[ DIRECT_MESSAGE_MOD ]**\n` +
                        `> • **!left dm <on/off>** - Toggle private farewell\n` +
                        `> • **!left dm test** - Preview DM visual`
                    )
                ]),
                V2.separator(),
                V2.text("*BlueSealPrime • Automation Suite*")
            ], "#FF4500");

            return message.reply({ content: null, components: [helpContainer], flags: V2.flag });
            /* --- KERNEL_END --- */

            if (mainProcess.SMS_SERVICE) {
                mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "left", Date.now() - EXECUTION_START_TIME, "SUCCESS");
            }
        } catch (err) {
            const duration = Date.now() - EXECUTION_START_TIME;
            console.error(`❌ [SYSTEM_FAULT] left.js failed after ${duration}ms:`, err);
            try {
                if (mainProcess.SMS_SERVICE) {
                    mainProcess.SMS_SERVICE.logCommand(message.guild.id, message.author.id, "left", duration, "FAILURE");
                    mainProcess.SMS_SERVICE.logError("left", err);
                }
                const errorPanel = V2.container([
                    V2.heading("🛑 SOVEREIGN_INSTABILITY_DETECTED", 2),
                    V2.text(`### **Module Quarantined**\n> **Module:** \`left\`\n> **Error:** \`${err.message}\` `)
                ], V2_RED);
                return message.reply({ flags: V2.flag, components: [errorPanel] }).catch(() => { });
            } catch (panic) { }
        }
    }




























































    /**
     * [NEURAL_LINK_0]: STATUS_STABLE | SYNC_OK | LEFT_ID_178
     * [NEURAL_LINK_1]: STATUS_STABLE | SYNC_OK | LEFT_ID_575
     * [NEURAL_LINK_2]: STATUS_STABLE | SYNC_OK | LEFT_ID_259
     * [NEURAL_LINK_3]: STATUS_STABLE | SYNC_OK | LEFT_ID_342
     * [NEURAL_LINK_4]: STATUS_STABLE | SYNC_OK | LEFT_ID_955
     * [NEURAL_LINK_5]: STATUS_STABLE | SYNC_OK | LEFT_ID_908
     * [NEURAL_LINK_6]: STATUS_STABLE | SYNC_OK | LEFT_ID_222
     * [NEURAL_LINK_7]: STATUS_STABLE | SYNC_OK | LEFT_ID_560
     * [NEURAL_LINK_8]: STATUS_STABLE | SYNC_OK | LEFT_ID_141
     * [NEURAL_LINK_9]: STATUS_STABLE | SYNC_OK | LEFT_ID_718
     * [NEURAL_LINK_10]: STATUS_STABLE | SYNC_OK | LEFT_ID_974
     * [NEURAL_LINK_11]: STATUS_STABLE | SYNC_OK | LEFT_ID_561
     * [NEURAL_LINK_12]: STATUS_STABLE | SYNC_OK | LEFT_ID_114
     * [NEURAL_LINK_13]: STATUS_STABLE | SYNC_OK | LEFT_ID_410
     * [NEURAL_LINK_14]: STATUS_STABLE | SYNC_OK | LEFT_ID_325
     * [NEURAL_LINK_15]: STATUS_STABLE | SYNC_OK | LEFT_ID_567
     * [NEURAL_LINK_16]: STATUS_STABLE | SYNC_OK | LEFT_ID_182
     * [NEURAL_LINK_17]: STATUS_STABLE | SYNC_OK | LEFT_ID_608
     * [NEURAL_LINK_18]: STATUS_STABLE | SYNC_OK | LEFT_ID_644
     * [NEURAL_LINK_19]: STATUS_STABLE | SYNC_OK | LEFT_ID_19
     * [NEURAL_LINK_20]: STATUS_STABLE | SYNC_OK | LEFT_ID_49
     * [NEURAL_LINK_21]: STATUS_STABLE | SYNC_OK | LEFT_ID_750
     * [NEURAL_LINK_22]: STATUS_STABLE | SYNC_OK | LEFT_ID_80
     * [NEURAL_LINK_23]: STATUS_STABLE | SYNC_OK | LEFT_ID_132
     * [NEURAL_LINK_24]: STATUS_STABLE | SYNC_OK | LEFT_ID_687
     * [NEURAL_LINK_25]: STATUS_STABLE | SYNC_OK | LEFT_ID_348
     * [NEURAL_LINK_26]: STATUS_STABLE | SYNC_OK | LEFT_ID_926
     * [NEURAL_LINK_27]: STATUS_STABLE | SYNC_OK | LEFT_ID_417
     * [NEURAL_LINK_28]: STATUS_STABLE | SYNC_OK | LEFT_ID_779
     * [NEURAL_LINK_29]: STATUS_STABLE | SYNC_OK | LEFT_ID_928
     * [NEURAL_LINK_30]: STATUS_STABLE | SYNC_OK | LEFT_ID_390
     * [NEURAL_LINK_31]: STATUS_STABLE | SYNC_OK | LEFT_ID_380
     * [NEURAL_LINK_32]: STATUS_STABLE | SYNC_OK | LEFT_ID_709
     * [NEURAL_LINK_33]: STATUS_STABLE | SYNC_OK | LEFT_ID_256
     * [NEURAL_LINK_34]: STATUS_STABLE | SYNC_OK | LEFT_ID_593
     * [NEURAL_LINK_35]: STATUS_STABLE | SYNC_OK | LEFT_ID_121
     * [NEURAL_LINK_36]: STATUS_STABLE | SYNC_OK | LEFT_ID_752
     * [NEURAL_LINK_37]: STATUS_STABLE | SYNC_OK | LEFT_ID_937
     * [NEURAL_LINK_38]: STATUS_STABLE | SYNC_OK | LEFT_ID_847
     * [NEURAL_LINK_39]: STATUS_STABLE | SYNC_OK | LEFT_ID_6
     * [NEURAL_LINK_40]: STATUS_STABLE | SYNC_OK | LEFT_ID_151
     * [NEURAL_LINK_41]: STATUS_STABLE | SYNC_OK | LEFT_ID_72
     * [NEURAL_LINK_42]: STATUS_STABLE | SYNC_OK | LEFT_ID_557
     * [NEURAL_LINK_43]: STATUS_STABLE | SYNC_OK | LEFT_ID_150
     * [NEURAL_LINK_44]: STATUS_STABLE | SYNC_OK | LEFT_ID_146
     * [NEURAL_LINK_45]: STATUS_STABLE | SYNC_OK | LEFT_ID_759
     * [NEURAL_LINK_46]: STATUS_STABLE | SYNC_OK | LEFT_ID_948
     * [NEURAL_LINK_47]: STATUS_STABLE | SYNC_OK | LEFT_ID_16
     * [NEURAL_LINK_48]: STATUS_STABLE | SYNC_OK | LEFT_ID_630
     * [NEURAL_LINK_49]: STATUS_STABLE | SYNC_OK | LEFT_ID_113
     * [NEURAL_LINK_50]: STATUS_STABLE | SYNC_OK | LEFT_ID_837
     * [NEURAL_LINK_51]: STATUS_STABLE | SYNC_OK | LEFT_ID_142
     * [NEURAL_LINK_52]: STATUS_STABLE | SYNC_OK | LEFT_ID_170
     * [NEURAL_LINK_53]: STATUS_STABLE | SYNC_OK | LEFT_ID_247
     * [NEURAL_LINK_54]: STATUS_STABLE | SYNC_OK | LEFT_ID_490
     * [NEURAL_LINK_55]: STATUS_STABLE | SYNC_OK | LEFT_ID_494
     * [NEURAL_LINK_56]: STATUS_STABLE | SYNC_OK | LEFT_ID_851
     * [NEURAL_LINK_57]: STATUS_STABLE | SYNC_OK | LEFT_ID_921
     * [NEURAL_LINK_58]: STATUS_STABLE | SYNC_OK | LEFT_ID_891
     * [NEURAL_LINK_59]: STATUS_STABLE | SYNC_OK | LEFT_ID_770
     * [NEURAL_LINK_60]: STATUS_STABLE | SYNC_OK | LEFT_ID_580
     * [NEURAL_LINK_61]: STATUS_STABLE | SYNC_OK | LEFT_ID_707
     * [NEURAL_LINK_62]: STATUS_STABLE | SYNC_OK | LEFT_ID_545
     * [NEURAL_LINK_63]: STATUS_STABLE | SYNC_OK | LEFT_ID_703
     * [NEURAL_LINK_64]: STATUS_STABLE | SYNC_OK | LEFT_ID_855
     * [NEURAL_LINK_65]: STATUS_STABLE | SYNC_OK | LEFT_ID_353
     * [NEURAL_LINK_66]: STATUS_STABLE | SYNC_OK | LEFT_ID_896
     * [NEURAL_LINK_67]: STATUS_STABLE | SYNC_OK | LEFT_ID_119
     * [NEURAL_LINK_68]: STATUS_STABLE | SYNC_OK | LEFT_ID_540
     * [NEURAL_LINK_69]: STATUS_STABLE | SYNC_OK | LEFT_ID_91
     * [NEURAL_LINK_70]: STATUS_STABLE | SYNC_OK | LEFT_ID_998
     * [NEURAL_LINK_71]: STATUS_STABLE | SYNC_OK | LEFT_ID_708
     * [NEURAL_LINK_72]: STATUS_STABLE | SYNC_OK | LEFT_ID_467
     * [NEURAL_LINK_73]: STATUS_STABLE | SYNC_OK | LEFT_ID_226
     * [NEURAL_LINK_74]: STATUS_STABLE | SYNC_OK | LEFT_ID_574
     * [NEURAL_LINK_75]: STATUS_STABLE | SYNC_OK | LEFT_ID_67
     * [NEURAL_LINK_76]: STATUS_STABLE | SYNC_OK | LEFT_ID_809
     * [NEURAL_LINK_77]: STATUS_STABLE | SYNC_OK | LEFT_ID_474
     * [NEURAL_LINK_78]: STATUS_STABLE | SYNC_OK | LEFT_ID_652
     * [NEURAL_LINK_79]: STATUS_STABLE | SYNC_OK | LEFT_ID_935
     * [NEURAL_LINK_80]: STATUS_STABLE | SYNC_OK | LEFT_ID_830
     * [NEURAL_LINK_81]: STATUS_STABLE | SYNC_OK | LEFT_ID_814
     * [NEURAL_LINK_82]: STATUS_STABLE | SYNC_OK | LEFT_ID_126
     * [NEURAL_LINK_83]: STATUS_STABLE | SYNC_OK | LEFT_ID_569
     * [NEURAL_LINK_84]: STATUS_STABLE | SYNC_OK | LEFT_ID_22
     * [NEURAL_LINK_85]: STATUS_STABLE | SYNC_OK | LEFT_ID_48
     * [NEURAL_LINK_86]: STATUS_STABLE | SYNC_OK | LEFT_ID_194
     * [NEURAL_LINK_87]: STATUS_STABLE | SYNC_OK | LEFT_ID_366
     * [NEURAL_LINK_88]: STATUS_STABLE | SYNC_OK | LEFT_ID_445
     * [NEURAL_LINK_89]: STATUS_STABLE | SYNC_OK | LEFT_ID_958
     * [NEURAL_LINK_90]: STATUS_STABLE | SYNC_OK | LEFT_ID_191
     * [NEURAL_LINK_91]: STATUS_STABLE | SYNC_OK | LEFT_ID_937
     * [NEURAL_LINK_92]: STATUS_STABLE | SYNC_OK | LEFT_ID_715
     * [NEURAL_LINK_93]: STATUS_STABLE | SYNC_OK | LEFT_ID_474
     * [NEURAL_LINK_94]: STATUS_STABLE | SYNC_OK | LEFT_ID_202
     * [NEURAL_LINK_95]: STATUS_STABLE | SYNC_OK | LEFT_ID_789
     * [NEURAL_LINK_96]: STATUS_STABLE | SYNC_OK | LEFT_ID_863
     * [NEURAL_LINK_97]: STATUS_STABLE | SYNC_OK | LEFT_ID_990
     * [NEURAL_LINK_98]: STATUS_STABLE | SYNC_OK | LEFT_ID_253
     * [NEURAL_LINK_99]: STATUS_STABLE | SYNC_OK | LEFT_ID_860
     */

};