const Discord = require('discord.js');

/**
 * BlueSealPrime V2 Compatibility Shim
 * This file patches discord.js to provide missing / experimental builders
 * to ensure the bot doesn't crash on standard djs installations.
 */

// 1. Define Dummy/Mock Builders if missing
if (!Discord.HeadingBuilder) {
    Discord.HeadingBuilder = class HeadingBuilder {
        constructor() { this.data = { type: 1 }; }
        setText(t) { this.data.text = t; return this; }
        setContent(t) { this.data.text = t; return this; }
        setLevel(l) { this.data.level = l; return this; }
        toJSON() {
            // Convert to a TextDisplay component with markdown headers
            const level = this.data.level || 1;
            const hashes = '#'.repeat(level);
            return {
                type: 1, // TextDisplay type
                content: `${hashes} ${this.data.text}`
            };
        }
    };
}

// 2. Ensure all other V2 builders are present at least as empty classes to avoid ReferenceErrors
const v2Builders = [
    'SeparatorBuilder',
    'ContainerBuilder',
    'SectionBuilder',
    'TextDisplayBuilder',
    'ThumbnailBuilder'
];

v2Builders.forEach(builder => {
    if (!Discord[builder]) {
        Discord[builder] = class {
            constructor() { this.data = {}; this.components = []; }
            toJSON() { return { type: 0 }; } // Generic fallback
        };
    }
});

// 3. Global assignments for files that use them without declaration
v2Builders.forEach(builder => {
    if (!global[builder]) global[builder] = Discord[builder];
});
if (!global.HeadingBuilder) global.HeadingBuilder = Discord.HeadingBuilder;

// 4. Constants
if (!Discord.SeparatorSpacingSize) {
    Discord.SeparatorSpacingSize = { Small: 1, Medium: 2, Large: 3 };
}
if (!Discord.HeadingLevel) {
    Discord.HeadingLevel = { Level1: 1, Level2: 2, Level3: 3 };
}

console.log('✅ [V2_SHIM] Discord.js patched for V2 compatibility.');
