const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'commands');

const targetCommands = [
    'rolecopy.js', 'createrole.js', 'deleterole.js',
    'massrole.js', 'reactionrole.js', 'roleperm.js',
    'temprole.js', 'autorole.js', 'roleinfo.js'
];

const injectPayload = `
            // --- SOVEREIGN ROLE PREVENTION ---
            let isSovereignRole = false;
            
            // Collect any variable that might represent a role in this execution context
            const rolesToCheck = [];
            if (typeof role !== 'undefined' && role) rolesToCheck.push(role);
            if (typeof targetRole !== 'undefined' && targetRole) rolesToCheck.push(targetRole);
            if (typeof sourceRole !== 'undefined' && sourceRole) rolesToCheck.push(sourceRole);
            if (typeof newRole !== 'undefined' && newRole) rolesToCheck.push(newRole);

            for (const r of rolesToCheck) {
                if (!r || !r.name) continue;
                const rName = r.name.toLowerCase();
                if (rName.includes("bluesealprime") || rName.includes("antinuke") || rName.includes("anti-raid") || rName.includes("quarantine") || rName.includes("botrole") || r.tags?.botId === message.client.user.id) {
                    isSovereignRole = true;
                    break;
                }
            }

            if (isSovereignRole) {
                return message.reply({
                    content: null,
                    flags: typeof V2 !== "undefined" ? V2.flag : undefined,
                    components: typeof V2 !== "undefined" ? [V2.container([
                        V2.heading("🚫 SOVEREIGN PROTECTION", 3),
                        V2.text("This is an integrated Bot Role and cannot be manually assigned or modified by human users.")
                    ], V2_RED)] : undefined
                }).catch(()=>{});
            }
            // ---------------------------------
`;

for (const f of targetCommands) {
    const p = path.join(dir, f);
    if (!fs.existsSync(p)) continue;
    let code = fs.readFileSync(p, 'utf8');

    // We want to inject right after `const V2 = require("../utils/v2Utils");` inside the execute block.
    // Wait, the variables (`role`, `targetRole`, etc) haven't been resolved at that point yet.

    // A safer bet is to simply inject right before the `/* --- KERNEL_END --- */` or right before the `catch (err)` block closes, 
    // BUT that would be too late. The command would already process.

    // Let's find the FIRST usage of `require("../utils/v2Utils")` inside the KERNEL_START section, and inject it soon after the role fetching blocks.
    // Many commands have: `if (!role) { return message.reply({ ... }) }`

    if (!code.includes('SOVEREIGN ROLE PREVENTION') && code.includes('/* --- KERNEL_START --- */')) {
        const splitToken = "/* --- KERNEL_START --- */";
        const parts = code.split(splitToken);

        if (parts.length > 1) {
            let kernelStr = parts[1];
            // Find the first error handler to inject immediately BEFORE Discord is updated.

            // Let's use a dynamic search. Most commands have `if (role.position >=` or `if (targetRole.position >=`
            const searchTokens = [
                "if (role.position >=", "if(role.position >=",
                "if (targetRole.position >=", "if(targetRole.position >=",
                "if (role && role.position >=", "if (sourceRole.position >="
            ];

            let injected = false;
            for (const token of searchTokens) {
                const insertIdx = kernelStr.indexOf(token);
                if (insertIdx > -1) {
                    kernelStr = kernelStr.substring(0, insertIdx) + injectPayload + kernelStr.substring(insertIdx);
                    code = parts[0] + splitToken + kernelStr;
                    fs.writeFileSync(p, code, 'utf8');
                    console.log("Updated " + f + " via Hierarchy Token");
                    injected = true;
                    break;
                }
            }

            // Fallback if none of those exist in the file (e.g., createrole, roleinfo might not check hierarchy before processing)
            if (!injected) {
                // Just inject it blindly right before the API call to Discord.
                // We'll search for things like `.create`, `.delete`, `.edit`, `.add`, `.remove`
                const fallbackTokens = [
                    "message.guild.roles.create",
                    "targetRole.delete",
                    "message.guild.members.cache.filter",
                    "data[message.guild.id]" // autorole
                ];

                for (const token of fallbackTokens) {
                    const insertIdx = kernelStr.indexOf(token);
                    if (insertIdx > -1) {
                        kernelStr = kernelStr.substring(0, insertIdx) + injectPayload + kernelStr.substring(insertIdx);
                        code = parts[0] + splitToken + kernelStr;
                        fs.writeFileSync(p, code, 'utf8');
                        console.log("Updated " + f + " via Fallback Token");
                        injected = true;
                        break;
                    }
                }
            }
        }
    }
}
