require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commandsPath = path.join(__dirname, 'commands');

// Read all command files
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Filter out extra/god/dev commands to fit Discord's hard 100-limit per app 
const priorityCommands = commandFiles.filter(f => !f.startsWith('god_') && !f.startsWith('e'));
const remainingCommands = commandFiles.filter(f => f.startsWith('god_') || f.startsWith('e'));

// Recombine up to 100 max
let finalFilesToLoad = [...priorityCommands, ...remainingCommands].slice(0, 100);

console.log(`📦 Preparing to port exactly ${finalFilesToLoad.length} base commands to Slash Commands (/) to respect Discord API limits...`);

const commands = [];
let validCount = 0;
let skippedCount = 0;

for (const file of finalFilesToLoad) {
    try {
        const command = require(`./commands/${file}`);

        // Validate command name to strictly match Discord's requirements
        const name = (command.name || file.replace('.js', '')).toLowerCase();

        // Commands must be 1-32 lowercase characters
        if (!name.match(/^[-_\p{L}\p{N}\p{sc=Deva}\p{sc=Thai}]{1,32}$/u)) {
            console.log(`⚠️ Skipping ${file}: Invalid slash command name '${name}'.`);
            skippedCount++;
            continue;
        }

        // Default description if missing
        let description = `Execute the ${name} command module.`;
        if (typeof command.description === 'string' && command.description.trim().length > 0) {
            description = command.description.trim().substring(0, 95);
        }

        const slashCmd = new SlashCommandBuilder()
            .setName(name)
            .setDescription(description);

        if (name === "addowner" || name === "delowner") {
            slashCmd
                .addUserOption(option => option.setName('user').setDescription('The user to Elevate/Revoke').setRequired(true))
                .addBooleanOption(option => option.setName('trusted').setDescription('Grant Trust-Level bypasses? (Default: False)').setRequired(false))
                .addBooleanOption(option => option.setName('co_admin').setDescription('Grant Co-Admin parity? (Default: False)').setRequired(false));
        } else if (["ban", "kick", "vckick", "mute", "unmute", "timeout", "untimeout"].includes(name)) {
            slashCmd
                .addUserOption(option => option.setName('user').setDescription('The target user').setRequired(true))
                .addStringOption(option => option.setName('reason').setDescription('Optional reason').setRequired(false));
        } else if (name === "antinuke") {
            slashCmd
                .addSubcommand(sub => sub.setName('on').setDescription('Enable antinuke countermeasures'))
                .addSubcommand(sub => sub.setName('off').setDescription('Disable antinuke countermeasures'))
                .addSubcommand(sub => sub.setName('view').setDescription('View current antinuke status and limits'))
                .addSubcommand(sub =>
                    sub.setName('edit').setDescription('Modify antinuke limit thresholds')
                        .addIntegerOption(opt => opt.setName('channel_delete').setDescription('Limit: Channel Deletion').setRequired(false))
                        .addIntegerOption(opt => opt.setName('channel_create').setDescription('Limit: Channel Creation').setRequired(false))
                        .addIntegerOption(opt => opt.setName('role_delete').setDescription('Limit: Role Deletion').setRequired(false))
                        .addIntegerOption(opt => opt.setName('ban_limit').setDescription('Limit: Member Ban').setRequired(false))
                        .addIntegerOption(opt => opt.setName('kick_limit').setDescription('Limit: Member Kick').setRequired(false))
                        .addIntegerOption(opt => opt.setName('webhook_create').setDescription('Limit: Webhook Creation').setRequired(false))
                );
        } else if (name === "antiraid") {
            slashCmd
                .addSubcommand(sub => sub.setName('on').setDescription('Enable anti-raid protection'))
                .addSubcommand(sub => sub.setName('off').setDescription('Disable anti-raid protection'))
                .addSubcommand(sub => sub.setName('view').setDescription('View anti-raid diagnostics'))
                .addSubcommand(sub =>
                    sub.setName('edit').setDescription('Modify anti-raid detection thresholds')
                        .addIntegerOption(opt => opt.setName('joins').setDescription('Raid Threshold (Joins)').setRequired(false))
                        .addIntegerOption(opt => opt.setName('time').setDescription('Raid Timeframe (Seconds)').setRequired(false))
                );
        } else if (name === "panic") {
            slashCmd
                .addSubcommand(sub => sub.setName('on').setDescription('Enable server-wide lockdown'))
                .addSubcommand(sub => sub.setName('off').setDescription('Lift server-wide lockdown'));
        } else if (name === "automod") {
            slashCmd
                .addBooleanOption(option => option.setName('anti_links').setDescription('Block unauthorized links').setRequired(false))
                .addBooleanOption(option => option.setName('anti_spam').setDescription('Block message spam').setRequired(false))
                .addBooleanOption(option => option.setName('anti_badwords').setDescription('Block profanity').setRequired(false))
                .addBooleanOption(option => option.setName('anti_mentions').setDescription('Block mass pinging').setRequired(false));
        } else if (name === "blacklist" || name === "spamblacklist") {
            slashCmd
                .addStringOption(option =>
                    option.setName('action')
                        .setDescription('Select the Blacklist protocol')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Add (Block)', value: 'add' },
                            { name: 'Remove (Unblock)', value: 'remove' },
                            { name: 'List (View Registry)', value: 'list' }
                        )
                )
                .addUserOption(option => option.setName('user').setDescription('Target User (Required for Add/Remove)').setRequired(false))
                .addIntegerOption(option => option.setName('days').setDescription('Duration (Add only)').setRequired(false))
                .addStringOption(option => option.setName('reason').setDescription('Reason (Add only)').setRequired(false));
        } else if (name === "avatar" || name === "userinfo") {
            slashCmd
                .addUserOption(option => option.setName('user').setDescription('The target user').setRequired(false));
        } else if (name === "setguildavatar" || name === "setguildbanner" || name === "setavatar" || name === "pfp") {
            slashCmd
                .addStringOption(option => option.setName('url').setDescription("Image Link URL or type 'default' to reset").setRequired(true));
        } else if (name === "createch") {
            slashCmd
                .addStringOption(option => option.setName('name').setDescription('The new channel name').setRequired(true))
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Channel Type')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Text Channel', value: 'text' },
                            { name: 'Voice Channel', value: 'voice' }
                        )
                );
        } else if (name === "createvc") {
            slashCmd
                .addStringOption(option => option.setName('name').setDescription('The new voice channel name').setRequired(true));
        } else if (name === "createrole") {
            slashCmd
                .addStringOption(option => option.setName('name').setDescription('The new role name').setRequired(true))
                .addStringOption(option => option.setName('color').setDescription('HEX Color (e.g., #FF0000)').setRequired(false));
        } else if (name === "autorole") {
            slashCmd
                .addStringOption(option =>
                    option.setName('action')
                        .setDescription('Autorole Protocol')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Set (Enable)', value: 'set' },
                            { name: 'Off (Disable)', value: 'off' },
                            { name: 'Status (View)', value: 'status' }
                        )
                )
                .addRoleOption(option => option.setName('role').setDescription('Role to assign (Set only)').setRequired(false));
        } else if (name === "chperm") {
            slashCmd
                .addMentionableOption(option => option.setName('target').setDescription('Target User or Role').setRequired(true))
                .addStringOption(option =>
                    option.setName('action')
                        .setDescription('Action')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Allow', value: 'allow' },
                            { name: 'Deny', value: 'deny' },
                            { name: 'Neutral/Default', value: 'neutral' }
                        )
                )
                .addStringOption(option =>
                    option.setName('permission')
                        .setDescription('Permission Type')
                        .setRequired(true)
                        .addChoices(
                            { name: 'View Channel', value: 'view' },
                            { name: 'Send Messages', value: 'send' },
                            { name: 'Connect (Voice)', value: 'connect' },
                            { name: 'All', value: 'all' }
                        )
                );
        } else if (name === "addrole" || name === "removerole") {
            slashCmd
                .addUserOption(option => option.setName('user').setDescription('The target user').setRequired(true))
                .addRoleOption(option => option.setName('role').setDescription('The target role').setRequired(true));
        } else if (name === "editrole") {
            slashCmd
                .addRoleOption(option => option.setName('role').setDescription('The target role to edit interactively').setRequired(true));
        } else if (name === "renamech" || name === "renamevc") {
            slashCmd
                .addChannelOption(option => option.setName('channel').setDescription('The channel to rename').setRequired(true))
                .addStringOption(option => option.setName('new_name').setDescription('The new name').setRequired(true));
        } else if (name === "vmoveall") {
            slashCmd
                .addChannelOption(option => option.setName('from_vc').setDescription('The origin Voice Channel').setRequired(true))
                .addChannelOption(option => option.setName('to_vc').setDescription('The destination Voice Channel').setRequired(true));
        } else if (["lock", "unlock", "hide", "show", "clear"].includes(name)) {
            slashCmd
                .addChannelOption(option => option.setName('channel').setDescription('The target channel').setRequired(false));
        } else if (name === "purge") {
            slashCmd
                .addIntegerOption(option => option.setName('amount').setDescription('Number of messages to delete (1-100, Default: 100)').setRequired(false));
        } else if (name === "rebuild") {
            slashCmd
                .addStringOption(option =>
                    option.setName('target')
                        .setDescription('Select the network sector to purge and rebuild')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Roles', value: 'roles' },
                            { name: 'Channels', value: 'channels' },
                            { name: 'Categories', value: 'categories' },
                            { name: 'Emojis', value: 'emojis' },
                            { name: 'ALL (Full Nuke)', value: 'all' }
                        )
                );
        } else if (name === "whitelist" || name === "wl") {
            slashCmd
                .addStringOption(option =>
                    option.setName('action')
                        .setDescription('Select the Whitelist protocol')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Add User to Core Whitelist', value: 'add' },
                            { name: 'Remove User from Core Whitelist', value: 'remove' },
                            { name: 'List all Sovereign Entities', value: 'list' }
                        )
                )
                .addUserOption(option => option.setName('user').setDescription('The target user').setRequired(false));
        } else {
            // Intelligently parse source code to see if command requires generic arguments
            const fileContent = fs.readFileSync(path.join(commandsPath, file), 'utf8');
            const cleanContent = fileContent.replace(/execute\s*\([^)]*\)/, '');

            const usesArgs = cleanContent.includes('args[') ||
                cleanContent.includes('.mentions.') ||
                cleanContent.includes('args.slice') ||
                cleanContent.includes('args.length') ||
                cleanContent.includes('args.join');

            if (usesArgs) {
                slashCmd.addStringOption(option =>
                    option.setName('input')
                        .setDescription('Arguments to pass to the command (e.g. @user, text, IDs)')
                        .setRequired(false) // Left false to gracefully support optional-arg commands
                );
            }
        }

        commands.push(slashCmd.toJSON());
        validCount++;
    } catch (error) {
        console.log(`❌ Error parsing ${file}: ${error.message}`);
        skippedCount++;
    }
}

console.log(`\n✅ Payload Constructed: ${validCount} valid commands (${skippedCount} skipped).`);

// Construct REST client
const token = process.env.TOKEN;
if (!token) {
    console.error("🛑 CRITICAL: Process.env.TOKEN is undefined. Please check your .env file.");
    process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        if (!process.env.CLIENT_ID) {
            console.log("⚠️ CLIENT_ID not found in .env. Attempting to extract from Token...");
            const tokenParts = token.split('.');
            if (tokenParts.length > 0) {
                const buffer = Buffer.from(tokenParts[0], 'base64');
                process.env.CLIENT_ID = buffer.toString('utf8');
                console.log(`🔍 Extracted Client ID: ${process.env.CLIENT_ID}`);
            }
        }

        console.log(`🌐 Synchronizing ${commands.length} application (/) commands to Discord Network for ID: ${process.env.CLIENT_ID}...`);

        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log(`🎉 SUCCESS! Successfully synchronized ${data.length} universal application (/) commands.`);
        console.log(`   Users will now see UI autocomplete when typing '/' natively!`);
        process.exit(0);
    } catch (error) {
        console.error("🛑 CRITICAL SYNC REJECTION:\n", error);
        process.exit(1);
    }
})();
