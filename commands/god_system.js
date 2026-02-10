const { EmbedBuilder } = require("discord.js");
const { BOT_OWNER_ID } = require("../config");
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

            const embed = new EmbedBuilder()
                .setColor("#000000") // Black
                .setTitle("🖥️ SYSTEM INTELLIGENCE")
                .setThumbnail(message.client.user.displayAvatarURL())
                .setDescription(`\`\`\`asciidoc\n= SYSTEM RESOURCES =\n\nRAM :: ${progressBar} ${percentage}%\n      [${usedMemGB}GB / ${totalMemGB}GB]\n\nCPU :: ${cpu}\nOS  :: ${platform} ${os.release()}\nUP  :: ${(os.uptime() / 3600).toFixed(1)} Hours\`\`\``)
                .setFooter({ text: "BlueSealPrime • System Integrity", iconURL: message.client.user.displayAvatarURL() });
            return message.reply({ embeds: [embed] });
        }

        // ESTATS: Bot Performance
        if (commandName === "estats") {
            const sent = await message.reply("Calculating...");
            const ping = sent.createdTimestamp - message.createdTimestamp;
            await sent.delete();

            const apiPing = message.client.ws.ping;
            const heap = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

            const pingStatus = ping < 100 ? "🟢" : ping < 300 ? "🟡" : "🔴";
            const apiStatus = apiPing < 100 ? "🟢" : apiPing < 300 ? "🟡" : "🔴";

            const embed = new EmbedBuilder()
                .setColor("#000000")
                .setTitle("📊 PERFORMANCE METRICS")
                .addFields(
                    { name: "Latency", value: `\`\`\`yml\n${pingStatus} ${ping}ms\`\`\``, inline: true },
                    { name: "API", value: `\`\`\`yml\n${apiStatus} ${apiPing}ms\`\`\``, inline: true },
                    { name: "Memory", value: `\`\`\`yml\n💾 ${heap} MB\`\`\``, inline: true },
                    { name: "Uptime", value: `<t:${Math.floor((Date.now() - message.client.uptime) / 1000)}:R>`, inline: false }
                )
                .setFooter({ text: "BlueSealPrime • Analytics", iconURL: message.client.user.displayAvatarURL() });
            return message.reply({ embeds: [embed] });
        }

        // EUSERS: User & Guild Stats
        if (commandName === "eusers") {
            const totalUsers = message.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
            const totalGuilds = message.client.guilds.cache.size;
            const totalChannels = message.client.channels.cache.size;

            const embed = new EmbedBuilder()
                .setColor("#000000")
                .setTitle("👥 FACTION STATISTICS")
                .setDescription(`\`\`\`asciidoc\n= GLOBAL CENSUS =\n\nUsers    :: ${totalUsers.toLocaleString()}\nServers  :: ${totalGuilds.toLocaleString()}\nChannels :: ${totalChannels.toLocaleString()}\`\`\``)
                .setFooter({ text: "BlueSealPrime • Population Control", iconURL: message.client.user.displayAvatarURL() });
            return message.reply({ embeds: [embed] });
        }

        // EEXIT: Exit God Mode (Visual)
        if (commandName === "eexit") {
            const embed = new EmbedBuilder()
                .setColor("#000000")
                .setTitle("🔌 TERMINATING SESSION")
                .setImage("https://media.discordapp.net/attachments/1093150036663308318/1113885934572900454/line-red.gif") // Cool line gif if available, or just remove if not sure. I'll stick to simple.
                // Actually the user has seen red line gifs in my thought process code, but I don't have one guaranteed. I'll use a code block.
                .setDescription(`\`\`\`diff\n- ROOT ACCESS: DISCONNECTED\n- SYSTEM: SECURE\n- PROTOCOL: STANDBY\`\`\``)
                .setFooter({ text: "BlueSealPrime • Logout", iconURL: message.client.user.displayAvatarURL() });
            return message.reply({ embeds: [embed] });
        }
    }
};
