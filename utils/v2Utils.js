const Discord = require('discord.js');
const {
    SectionBuilder = class { },
    TextDisplayBuilder = class { },
    SeparatorBuilder = class { },
    MessageFlags,
    ButtonBuilder,
    ButtonStyle,
    ThumbnailBuilder,
    ContainerBuilder = class { },
    ActionRowBuilder
} = Discord;

/**
 * Utility to simplify Components V2 implementation
 */
class V2Helper {
    /**
     * Create a simple text display
     */
    static text(content) {
        return new TextDisplayBuilder().setContent(content);
    }

    /**
     * Create a heading
     */
    static heading(text, level = 1) {
        const hashes = '#'.repeat(level);
        return new TextDisplayBuilder().setContent(`${hashes} ${text}`);
    }

    /**
     * Create a simple button accessory or action row button
     */
    static button(id, label, style = ButtonStyle.Secondary, disabled = false) {
        return new ButtonBuilder().setCustomId(id).setLabel(label).setStyle(style).setDisabled(disabled);
    }

    /**
     * Create a link button
     */
    static linkButton(url, label) {
        return new ButtonBuilder().setURL(url).setLabel(label).setStyle(ButtonStyle.Link);
    }

    /**
     * Create a container to wrap components.
     * Use direct TextDisplay components inside for a "button-free" look.
     */
    static container(components = [], accentColor = null) {
        const container = new ContainerBuilder();
        if (Array.isArray(components)) {
            for (const c of components) {
                // console.log(`Processing component: ${c.constructor.name}`);
                if (c instanceof SectionBuilder) container.addSectionComponents(c);
                else if (c instanceof SeparatorBuilder) container.addSeparatorComponents(c);
                else if (c instanceof TextDisplayBuilder) container.addTextDisplayComponents(c);
                else if (c instanceof ActionRowBuilder) {
                    // console.log("Adding ActionRow to Container");
                    container.addActionRowComponents(c);
                }
                else if (typeof c === 'string') container.addTextDisplayComponents(this.text(c));
            }
        }

        if (accentColor) {
            const color = typeof accentColor === 'string' ? parseInt(accentColor.replace('#', ''), 16) : accentColor;
            container.setAccentColor(color);
        }
        return container;
    }

    /**
     * Create a section. 
     * WARNING: Sections REQUIRE an accessory (icon/button) by Discord API.
     */
    static currentBotAvatar = null;

    static section(components = [], accessory = undefined) {
        const section = new SectionBuilder();

        const textComponents = Array.isArray(components) ? components.map(c => {
            if (typeof c === 'string') return this.text(c);
            return c;
        }) : [this.text(components)];

        if (textComponents.length > 0) {
            section.addTextDisplayComponents(...textComponents.slice(0, 3));
        } else {
            section.addTextDisplayComponents(this.text("\u200b"));
        }

        // Strictly enforce an accessory for Discord Components V2 validation
        if (!accessory && this.currentBotAvatar) {
            accessory = this.currentBotAvatar;
        }

        // If STILL no accessory, Discord will crash. We inject an invisible 1x1 image.
        if (!accessory) {
            accessory = "https://raw.githubusercontent.com/TheGreyGhost/MinecraftByExample/master/src/main/resources/assets/minecraftbyexample/textures/items/transparent.png";
        }

        if (accessory) {
            if (accessory instanceof ButtonBuilder) {
                section.setButtonAccessory(accessory);
            } else if (accessory instanceof ThumbnailBuilder) {
                section.setThumbnailAccessory(accessory);
            } else if (typeof accessory === 'string' && (accessory.includes('http') || accessory.startsWith('attachment://'))) {
                section.setThumbnailAccessory(new ThumbnailBuilder().setURL(accessory));
            }
        }

        return section;
    }

    /**
     * Create a separator
     */
    static separator() {
        return new SeparatorBuilder();
    }

    /**
     * Create a thumbnail accessory
     */
    static thumbnail(url) {
        return new ThumbnailBuilder().setURL(url);
    }

    /**
     * Create a "field" style section
     */
    static field(name, value, inline = false) {
        return new SectionBuilder().addComponents(
            new TextDisplayBuilder().setContent(`**${name}**\n${value}`)
        );
    }

    /**
     * Convert a standard EmbedBuilder to a list of V2 components
     */
    static fromEmbed(embed) {
        const components = [];
        const data = embed.data || embed;

        // Title & Author
        if (data.title || (data.author && data.author.name)) {
            const titleText = data.title || data.author.name;
            components.push(this.heading(titleText, 2));
            components.push(this.separator());
        }

        // Description
        if (data.description) {
            components.push(this.text(data.description));
            components.push(this.separator());
        }

        // Fields
        if (data.fields && data.fields.length > 0) {
            for (const field of data.fields) {
                if (field.name === '\u200b' && field.value === '\u200b') {
                    components.push(this.separator());
                } else {
                    components.push(this.text(`**${field.name}**\n${field.value}`));
                }
            }
            components.push(this.separator());
        }

        // Footer
        if (data.footer && data.footer.text) {
            components.push(this.text(`*${data.footer.text}*`));
        }

        const color = data.color ? data.color : null;
        return [this.container(components, color)];
    }

    /**
     * Wrap a message object to intercept replies and convert to V2
     */
    static wrapMessage(message) {
        const originalReply = message.reply.bind(message);
        const originalSend = message.channel.send.bind(message.channel);

        message.reply = async (options) => {
            if (typeof options === 'string') options = { content: options };
            if (options.embeds) {
                options.components = options.components || [];
                options.embeds.forEach(e => options.components.push(...this.fromEmbed(e)));
                options.flags = (options.flags || 0) | this.flag;
                delete options.embeds;
                options.content = null; // V2 doesn't use content
            }
            const sent = await originalReply(options);
            if (sent) this.wrapSentMessage(sent);
            return sent;
        };

        message.channel.send = async (options) => {
            if (typeof options === 'string') options = { content: options };
            if (options.embeds) {
                options.components = options.components || [];
                options.embeds.forEach(e => options.components.push(...this.fromEmbed(e)));
                options.flags = (options.flags || 0) | this.flag;
                delete options.embeds;
                options.content = null;
            }
            const sent = await originalSend(options);
            if (sent) this.wrapSentMessage(sent);
            return sent;
        };

        return message;
    }

    /**
     * Wrap a sent message to intercept edits
     */
    static wrapSentMessage(message) {
        const originalEdit = message.edit.bind(message);
        message.edit = async (options) => {
            if (typeof options === 'string') options = { content: options };
            if (options.embeds) {
                options.components = options.components || [];
                options.embeds.forEach(e => options.components.push(...this.fromEmbed(e)));
                options.flags = (options.flags || 0) | this.flag;
                delete options.embeds;
                options.content = null;
            }
            return originalEdit(options);
        };
        return message;
    }

    /**
     * Standardized Bot Avatar retriever for V2 layouts.
     * Prioritizes guild-specific avatar for consistency.
     */
    static botAvatar(message) {
        // forceStatic + 512px PNG = most reliable format for V2 section thumbnails
        const member = message.guild?.members?.me;
        return member?.displayAvatarURL({ forceStatic: true, extension: "png", size: 512 })
            || message.client.user.displayAvatarURL({ forceStatic: true, extension: "png", size: 512 });
    }

    /**
     * Get the Components V2 flag
     */
    static get flag() {
        // Standard V2 flag (MessageFlags.IS_COMPONENTS_V2)
        return 32768;
    }
}

module.exports = V2Helper;
