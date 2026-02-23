const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

/**
 * SECURE QUERY WRAPPER
 */
async function query(text, params) {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        return res;
    } catch (err) {
        console.error('❌ [DATABASE_CORE_ERROR]:', err.message);
        throw err;
    }
}

/**
 * SOVEREIGN SCHEMA INITIALIZATION
 * Engineered for 100M+ data points and 1M+ active nodes.
 */
async function init() {
    console.log('📡 [System_Core] Initializing Sovereign Database Schema...');

    // 1. NEURAL COMMAND ANALYTICS (Big Data)
    await query(`
        CREATE TABLE IF NOT EXISTS command_analytics (
            id BIGSERIAL PRIMARY KEY,
            guild_id TEXT,
            user_id TEXT,
            command_name TEXT,
            execution_time_ms INTEGER,
            status TEXT, -- 'SUCCESS', 'FAILURE', 'RESTRAINED'
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // 2. SOVEREIGN GUILD CONFIGURATION
    await query(`
        CREATE TABLE IF NOT EXISTS guild_config (
            guild_id TEXT PRIMARY KEY,
            antinuke_enabled BOOLEAN DEFAULT FALSE,
            autorestore_enabled BOOLEAN DEFAULT TRUE,
            antinuke_limits JSONB DEFAULT '{"channelDelete": 2, "roleDelete": 2, "ban": 3, "kick": 3, "interval": 10000}'::jsonb,
            security_level INTEGER DEFAULT 1, -- 1: Normal, 2: Enhanced, 3: Overkill
            auto_quarantine BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // 3. TRUST CHAIN (Extra Owners)
    await query(`
        CREATE TABLE IF NOT EXISTS extra_owners (
            id SERIAL PRIMARY KEY,
            guild_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            added_by TEXT,
            added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(guild_id, user_id)
        );
    `);

    // 4. IDENTITY REGISTRY (Whitelists)
    await query(`
        CREATE TABLE IF NOT EXISTS whitelist (
            id SERIAL PRIMARY KEY,
            guild_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            added_by TEXT,
            added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(guild_id, user_id)
        );
    `);

    // 5. SYSTEM HEALTH MONITORING
    await query(`
        CREATE TABLE IF NOT EXISTS system_health (
            id SERIAL PRIMARY KEY,
            shards_active INTEGER,
            cpu_usage FLOAT,
            ram_usage_mb FLOAT,
            db_latency_ms INTEGER,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // 6. GLOBAL BLACKLIST (Omniscient Protection)
    await query(`
        CREATE TABLE IF NOT EXISTS global_blacklist (
            user_id TEXT PRIMARY KEY,
            reason TEXT,
            added_by TEXT,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // HIGH-PERFORMANCE INDEXING GRID
    await query(`CREATE INDEX IF NOT EXISTS idx_analytics_guild ON command_analytics(guild_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_analytics_command ON command_analytics(command_name);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_extra_owners_guild ON extra_owners(guild_id);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_whitelist_guild ON whitelist(guild_id);`);

    console.log('✅ [System_Core] Neural indexing complete. Sovereign Matrix Synchronized.');
}

module.exports = {
    query,
    init,
    pool
};
