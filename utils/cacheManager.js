const fs = require('fs');
const path = require('path');

/**
 * SOVEREIGN_CACHE_KERNEL
 * Engineered for sub-millisecond retrieval of configuration data.
 * Replaces synchronous disk I/O with memory-mapped buffers.
 */
class CacheManager {
    constructor() {
        this.cache = new Map();
        this.basePath = path.join(__dirname, '../data');
        this.files = [
            'whitelist.json',
            'blacklist.json',
            'antinuke.json',
            'automod.json',
            'owners.json',
            'restricted.json',
            'spamblacklist.json',
            'system.json'
        ];
        this.initialize();
    }

    initialize() {
        console.log("⚡ [Cache_Kernel] Hydrating memory-mapped buffers...");
        this.files.forEach(file => this.hydrate(file));

        // File Watchers for Real-time Sync
        this.files.forEach(file => {
            const fullPath = path.join(this.basePath, file);
            if (fs.existsSync(fullPath)) {
                fs.watch(fullPath, (eventType) => {
                    if (eventType === 'change') {
                        // Small debounce to avoid race conditions with fast writes
                        setTimeout(() => this.hydrate(file), 100);
                    }
                });
            }
        });
    }

    hydrate(file) {
        const fullPath = path.join(this.basePath, file);
        if (!fs.existsSync(fullPath)) {
            this.cache.set(file, {});
            return;
        }

        try {
            const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
            this.cache.set(file, data);
            // console.log(`✅ [Cache_Kernel] Synchronized: ${file}`);
        } catch (e) {
            console.error(`❌ [Cache_Kernel] Failed to hydrate ${file}:`, e.message);
            // Don't overwrite existing cache if new read fails (safety first)
            if (!this.cache.has(file)) this.cache.set(file, {});
        }
    }

    get(file) {
        return this.cache.get(file) || {};
    }

    /**
     * Specialized retrieval for guild-specific settings
     */
    getGuild(file, guildId) {
        const data = this.get(file);
        return data[guildId] || null;
    }
}

module.exports = new CacheManager();
