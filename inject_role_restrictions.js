const fs = require('fs');
const path = require('path');

const targetCommands = [
    "addrole.js",
    "removerole.js",
    "rolecopy.js",
    "createrole.js",
    "deleterole.js",
    "massrole.js",
    "reactionrole.js",
    "roleperm.js",
    "temprole.js",
    "autorole.js",
    "testroles.js"
];

const snippet = `
            // --- OWNER RESTRICTION INJECTED ---
            const fs = require('fs');
            const path = require('path');
            const OWNERS_DB = path.join(__dirname, "../data/owners.json");
            let isExtraOwner = false;
            let isBotOwner = message.author.id === BOT_OWNER_ID;
            let isServerOwner = message.guild.ownerId === message.author.id;
            
            if (fs.existsSync(OWNERS_DB)) {
                try {
                    const rawDb = JSON.parse(fs.readFileSync(OWNERS_DB, "utf8"));
                    const raw = rawDb[message.guild.id] || [];
                    const extraIds = raw.map(o => typeof o === 'string' ? o : o.id);
                    isExtraOwner = extraIds.includes(message.author.id);
                } catch (e) { }
            }

            if (!isBotOwner && !isServerOwner && !isExtraOwner) {
                return message.reply({
                    content: null,
                    flags: V2.flag,
                    components: [V2.container([
                        V2.heading("🚫 SYSTEM SECURITY LOCK", 3),
                        V2.text("This command is strictly restricted to **Owners** only.")
                    ], V2_RED)]
                });
            }
            // ----------------------------------
`;

// Regex to find where to inject: right after /* --- KERNEL_START --- */
const injectionPoint = /\/\*\s*---\s*KERNEL_START\s*---\s*\*\//;

let successCount = 0;

targetCommands.forEach(cmd => {
    const filePath = path.join(__dirname, "commands", cmd);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');

        // Check if already injected
        if (content.includes("OWNER RESTRICTION INJECTED")) {
            console.log(`[SKIP] ${cmd} already has the restriction.`);
            return;
        }

        if (injectionPoint.test(content)) {
            // Because some files define isBotOwner/isServerOwner below KERNEL_START,
            // we inject our own isolated block that redefines them if necessary or shadows them.
            // But javascript `let` in the same scope as an existing `const isBotOwner` will throw an error.
            // Let's replace the existing declarations if they exist right after Kernel Start.

            // To avoid redeclaration syntax errors, we can just wrap our check in an IIFE or block, 
            // OR we can just inject earlier, before the execute method finishes evaluating `mainProcess.REACTOR`.

            // Actually, the best place is right before `/* --- KERNEL_START --- */` so we don't interfere with inner variables, but we have access to message and BOT_OWNER_ID.
            const injText = "// --- OWNER RESTRICTION INJECTED ---\\n" +
                "const _fs = require('fs');\\n" +
                "const _path = require('path');\\n" +
                "const OWNERS_DB = _path.join(__dirname, '../data/owners.json');\\n" +
                "let _isExtraOwner = false;\\n" +
                "const _isBotOwner = message.author.id === BOT_OWNER_ID;\\n" +
                "const _isServerOwner = message.guild.ownerId === message.author.id;\\n" +
                "if (_fs.existsSync(OWNERS_DB)) {\\n" +
                "    try {\\n" +
                "        const rawDb = JSON.parse(_fs.readFileSync(OWNERS_DB, 'utf8'));\\n" +
                "        const raw = rawDb[message.guild.id] || [];\\n" +
                "        const extraIds = raw.map(o => typeof o === 'string' ? o : o.id);\\n" +
                "        _isExtraOwner = extraIds.includes(message.author.id);\\n" +
                "    } catch (e) { }\\n" +
                "}\\n" +
                "if (!_isBotOwner && !_isServerOwner && !_isExtraOwner) {\\n" +
                "    return message.reply({\\n" +
                "        content: null,\\n" +
                "        flags: V2 ? V2.flag : undefined,\\n" +
                "        components: V2 ? [V2.container([\\n" +
                "            V2.heading('🚫 SYSTEM SECURITY LOCK', 3),\\n" +
                "            V2.text('This command is strictly restricted to the **Bot Owner**, **Server Owner**, and **Extra Owners**.\\nRole modifications are heavily monitored.')\\n" +
                "        ], V2_RED)] : undefined\\n" +
                "    }).catch(()=>{});\\n" +
                "}\\n" +
                "// ----------------------------------\\n" +
                "/* --- KERNEL_START --- */";

            content = content.replace(injectionPoint, injText);

            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`[OK] Injected restriction into ${cmd}`);
            successCount++;
        } else {
            console.log(`[FAIL] ${cmd}: KERNEL_START anchor not found.`);
        }
    } else {
        console.log(`[NOT_FOUND] ${cmd} does not exist.`);
    }
});

console.log(`Finished processing. Successfully injected: ${successCount}`);
