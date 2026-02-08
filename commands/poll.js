const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { SUCCESS_COLOR } = require("../config");

module.exports = {
    name: "poll",
    description: "Create a simple poll",
    usage: "!poll <Question> | <Option1> | <Option2> ...",
    aliases: ["createpoll"],
    permissions: [PermissionsBitField.Flags.ManageMessages], // Restrict to staff to avoid spam

    async execute(message, args) {
        // 1. Parse Args
        // Expect format: !poll Question | Option 1 | Option 2 ...
        const raw = args.join(" ");
        const parts = raw.split("|").map(p => p.trim()).filter(p => p.length > 0);

        if (parts.length < 2) {
            return message.reply("Usage: `!poll Question | Option 1 | Option 2 ...`");
        }

        const question = parts[0];
        const options = parts.slice(1);

        if (options.length > 10) {
            return message.reply("❌ Maximum 10 options allowed.");
        }

        // 2. Build Embed
        const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

        let description = "";
        for (let i = 0; i < options.length; i++) {
            description += `${emojis[i]} **${options[i]}**\n\n`;
        }

        const embed = new EmbedBuilder()
            .setColor(SUCCESS_COLOR)
            .setTitle(`📊 ${question}`)
            .setDescription(description)
            .setFooter({ text: `Poll started by ${message.author.tag}` })
            .setTimestamp();

        // 3. Send & React
        const pollMsg = await message.channel.send({ embeds: [embed] });

        for (let i = 0; i < options.length; i++) {
            await pollMsg.react(emojis[i]);
        }

        // Delete command message to keep it clean
        message.delete().catch(() => { });
    }
};
