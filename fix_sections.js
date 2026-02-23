const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, 'commands', 'setupverify.js');
let content = fs.readFileSync(target, 'utf8');

content = content.replace(
    /V2\.section\(\[\s*V2\.text\("\*\*Identity Registry:\*\* You will be granted the role: " \+ role\.name\),\s*V2\.text\("\*\*Security Protocol:\*\* By verifying, you commit to honoring all Imperial Statutes\."\)\s*\]\)/,
    'V2.text("**Identity Registry:** You will be granted the role: " + role.name + "\\n**Security Protocol:** By verifying, you commit to honoring all Imperial Statutes.")'
);

fs.writeFileSync(target, content);
console.log('Fixed setupverify.js');

const sayTarget = path.join(__dirname, 'commands', 'say.js');
let sayContent = fs.readFileSync(sayTarget, 'utf8');

sayContent = sayContent.replace(
    /V2\.section\(\s*\[\s*V2\.heading\("📢 ANNOUNCEMENT", 2\),\s*V2\.text\(rawContent\)\s*\]\)/,
    'V2.heading("📢 ANNOUNCEMENT", 2),\n                        V2.text(rawContent)'
);
fs.writeFileSync(sayTarget, sayContent);
console.log('Fixed say.js');

const nukeTarget = path.join(__dirname, 'commands', 'nuke.js');
let nukeContent = fs.readFileSync(nukeTarget, 'utf8');
nukeContent = nukeContent.replace(
    /V2\.section\(\[\s*V2\.heading\("✅ NUKE COMPLETE", 2\)/,
    'V2.heading("✅ NUKE COMPLETE", 2'
).replace(
    /V2\.text\(`Channel wiped and cloned\.\\n> \*\*Restored By:\*\* <@\${message\.author\.id}>`\)\s*\]\)/,
    'V2.text(`Channel wiped and cloned.\\n> **Restored By:** <@${message.author.id}>`)'
);
fs.writeFileSync(nukeTarget, nukeContent);

console.log("Fixed nuke.js");
