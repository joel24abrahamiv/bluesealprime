const V2 = require("../utils/v2Utils");
const { BOT_OWNER_ID, V2_BLUE } = require("../config");
const os = require("os");

module.exports = {
    name: "god_system",
    description: "God Mode System Commands",
    aliases: ["eram", "estats", "eusers", "eexit"],

    async execute(message, args, commandName) {
        if (message.author.id !== BOT_OWNER_ID) return;

        // ERAM: System Resource Usage
        if (commandName === "eram") {
            const totalMem = os.totalmem();
            const freeMem = os.freemem();
            const usedMem = totalMem - freeMem;
            const usedMemGB = (usedMem / 1024 / 1024 / 1024).toFixed(2);
            const totalMemGB = (totalMem / 1024 / 1024 / 1024).toFixed(2);

            const percentage = Math.round((usedMem / totalMem) * 100);
            const progressBar = "▓".repeat(Math.round(percentage / 10)) + "░".repeat(10 - Math.round(percentage / 10));

            let cpu = os.cpus()[0].model;
            cpu = cpu.replace(/\(R\)/g, "").replace(/\(TM\)/g, "").replace("Core", "").replace("CPU", "").trim();

            const platform = os.platform() === "win32" ? "Windows" : os.platform();

            const ramContainer = V2.container([
                V2.section([
                    V2.heading("🖥️ RESOURCE MONITOR: KERNEL", 2),
                    V2.text(`\`\`\`yml\nRAM :: ${progressBar} ${percentage}%\n      [${usedMemGB}GB / ${totalMemGB}GB]\n\nCPU :: ${cpu}\nOS  :: ${platform} ${os.release()}\nUP  :: ${(os.uptime() / 3600).toFixed(1)} Hours\n\`\`\``)
                ], V2.botAvatar(message)),
                V2.separator(),
                V2.text("*BlueSealPrime • System Integrity Protocol*")
            ], V2_BLUE);

            return message.reply({ content: null, flags: V2.flag, components: [ramContainer] });
        }

        // ESTATS: Bot Performance
        if (commandName === "estats") {
            const apiPing = message.client.ws.ping;
            const heap = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

            const statsContainer = V2.container([
                V2.section([
                    V2.heading("📊 PERFORMANCE METRICS", 2),
                    V2.text(`**API Latency:** \`${apiPing}ms\`\n**Memory Heap:** \`${heap} MB\`\n**Uptime:** <t:${Math.floor((Date.now() - message.client.uptime) / 1000)}:R>`)
                ], V2.botAvatar(message)),
                V2.separator(),
                V2.text("*BlueSealPrime • Analytics Manifest*")
            ], V2_BLUE);

            return message.reply({ content: null, flags: V2.flag, components: [statsContainer] });
        }

        // EUSERS: User & Guild Stats
        if (commandName === "eusers") {
            const totalUsers = message.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
            const totalGuilds = message.client.guilds.cache.size;
            const totalChannels = message.client.channels.cache.size;

            const usersContainer = V2.container([
                V2.section([
                    V2.heading("👥 GLOBAL NETWORK CENSUS", 2),
                    V2.text(`\`\`\`asciidoc\nUsers    :: ${totalUsers.toLocaleString()}\nServers  :: ${totalGuilds.toLocaleString()}\nChannels :: ${totalChannels.toLocaleString()}\n\`\`\``)
                ], V2.botAvatar(message)),
                V2.separator(),
                V2.text("*BlueSealPrime • Population Analysis*")
            ], V2_BLUE);

            return message.reply({ content: null, flags: V2.flag, components: [usersContainer] });
        }

        // EEXIT: Exit God Mode (Visual)
        if (commandName === "eexit") {
            const exitContainer = V2.container([
                V2.section([
                    V2.heading("🔌 SESSION TERMINATED", 2),
                    V2.text(`\`\`\`diff\n- ROOT ACCESS: DISCONNECTED\n- SYSTEM: SECURE\n- PROTOCOL: STANDBY\n\`\`\``)
                ], V2.botAvatar(message)),
                V2.separator(),
                V2.text("*BlueSealPrime • Root Logout Protocol*")
            ], "#FF0000"); // Red for logout

            return message.reply({ content: null, flags: V2.flag, components: [exitContainer] });
        }
    }
};
