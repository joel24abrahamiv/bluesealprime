const V2 = require("../utils/v2Utils");

module.exports = {
  name: "avatar",
  description: "Displays a user's avatar with a premium reference-matched layout",

  async execute(message, args) {
    const botAvatar = V2.botAvatar(message);
    const { BOT_OWNER_ID, V2_RED } = require("../config");
    const isBotOwner = message.author.id === BOT_OWNER_ID;
    const isServerOwner = message.guild.ownerId === message.author.id;

    // Check if user is trying to SET an avatar
    const url = message.attachments.first()?.url || args.find(arg => arg.startsWith("http://") || arg.startsWith("https://"));

    if (url && (args[0] === "set" || (isBotOwner || isServerOwner))) {
      // If user provided a URL and is authorized, or used 'set' keyword
      // Forward to setguildavatar command
      const setCmd = message.client.commands.get("setguildavatar");
      if (setCmd && (isBotOwner || isServerOwner)) {
        return setCmd.execute(message, args);
      }
    }

    const member =
      message.mentions.members.first() ||
      message.guild.members.cache.get(args[0]) ||
      message.member;

    const user = member.user;
    const avatarURL = user.displayAvatarURL({ dynamic: true, size: 1024 });
    const pngURL = user.displayAvatarURL({ extension: 'png', size: 1024 });
    const jpgURL = user.displayAvatarURL({ extension: 'jpg', size: 1024 });
    const webpURL = user.displayAvatarURL({ extension: 'webp', size: 1024 });

    const container = V2.container([
      V2.section(
        [
          V2.text(`**Time:** ${new Date().toLocaleTimeString()}`),
          V2.text(`🔹 **Executed by:** <@${message.author.id}>`)
        ],
        botAvatar // Bot PFP here
      ),
      V2.separator(),
      V2.text(`🖼️ **${user.username}'s Avatar**`),
      V2.text(`**Avatar URL:**\n${avatarURL}`),
      V2.text(`🔗 **Download Links:**\n[PNG](${pngURL}) | [JPG](${jpgURL}) | [WEBP](${webpURL})`)
    ], "#0099ff");

    message.reply({
      content: null,
      flags: V2.flag,
      components: [container]
    });
  }
};
