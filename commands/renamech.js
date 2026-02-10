const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { SUCCESS_COLOR, ERROR_COLOR } = require("../config");

module.exports = {
    name: "renamech",
    description: "Rename the current channel.",
    usage: "!renamech <new_name>",
    permissions: [PermissionsBitField.Flags.ManageChannels],
    aliases: ["rch"],

    async execute(message, args) {
        if (!args[0]) {
            return message.reply({
                embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("⚠️ **Usage:** `!renamech <new_name>`")]
            });
        }

        const newName = args.join("-");
        const oldName = message.channel.name;

        try {
            await message.channel.setName(newName);

            const embed = new EmbedBuilder()
                .setColor(SUCCESS_COLOR)
                .setTitle("✅ Channel Renamed")
                .setDescription(`**${oldName}** ➡️ **${newName}**`)
                .setTimestamp();

            message.channel.send({ embeds: [embed] });

        } catch (err) {
            console.error(err);
            message.reply({
                embeds: [new EmbedBuilder().setColor(ERROR_COLOR).setDescription("❌ **Error:** Failed to rename channel. (Rate limits? Permissions?)")]
            });
        }
    }
};
