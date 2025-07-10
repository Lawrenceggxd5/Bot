const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const dbPath = path.join(__dirname, '../painel.sqlite');

function painelJsonToEmbedAndComponents(json) {
    // Monta o embed
    const embed = new EmbedBuilder();
    if (json.title) embed.setTitle(json.title);
    if (json.description) embed.setDescription(json.description);
    if (json.color_embed) embed.setColor(json.color_embed);
    if (json.color) embed.setColor(json.color);
    if (json.url) embed.setURL(json.url);
    if (json.timestamp) embed.setTimestamp(new Date(json.timestamp));
    if (json.footer) {
        if (typeof json.footer === 'string') {
            embed.setFooter({ text: json.footer });
        } else {
            embed.setFooter({ text: json.footer.text || '', iconURL: json.footer.icon_url || json.footer.iconURL });
        }
    }
    if (json.author) {
        if (typeof json.author === 'string') {
            embed.setAuthor({ name: json.author });
        } else {
            embed.setAuthor({ name: json.author.name || '', iconURL: json.author.icon_url || json.author.iconURL, url: json.author.url });
        }
    }
    if (json.thumbnail) embed.setThumbnail(json.thumbnail);
    if (json.image) embed.setImage(json.image);
    if (Array.isArray(json.fields)) {
        json.fields.forEach(f => {
            if (f && f.name && f.value) embed.addFields({ name: f.name, value: f.value, inline: !!f.inline });
        });
    }

    // Monta os botões se existirem
    let components = [];
    if (json.msg_button && Array.isArray(json.msg_button.components)) {
        const row = new ActionRowBuilder();
        json.msg_button.components.forEach(btn => {
            // Se houver id do painel, sobrescreve o customId
            let customId = btn.custom_id || 'painel_btn';
            if (json.id) customId = `painelb_${json.id}`;
            const button = new ButtonBuilder()
                .setCustomId(customId)
                .setLabel(btn.label || 'Botão')
                .setStyle(btn.style || ButtonStyle.Primary);
            if (btn.emoji) button.setEmoji(btn.emoji);
            // Suporte a campo emote (alias para emoji)
            if (btn.emote) button.setEmoji(btn.emote);
            if (btn.url && btn.style === ButtonStyle.Link) button.setURL(btn.url);
            if (btn.disabled) button.setDisabled(!!btn.disabled);
            // Suporte a cor de botão customizada (caso venha como string)
            if (btn.color && typeof btn.color === 'string') {
                // Tenta mapear para ButtonStyle
                const styleMap = {
                    'primary': ButtonStyle.Primary,
                    'secondary': ButtonStyle.Secondary,
                    'success': ButtonStyle.Success,
                    'danger': ButtonStyle.Danger,
                    'link': ButtonStyle.Link
                };
                if (styleMap[btn.color.toLowerCase()]) button.setStyle(styleMap[btn.color.toLowerCase()]);
            }
            row.addComponents(button);
        });
        components.push(row);
    }
    return { embed, content: (json.msg_button && json.msg_button.content) || null, components };
}

module.exports = {
    name: 'painel',
    description: 'Exibe o painel pelo ID, renderizando o JSON salvo no banco.',
    async execute(client, message, args) {
        const id = args[0];
        if (!id) return message.reply('❌ Forneça o ID do painel. Ex: !painel vip');
        const db = new sqlite3.Database(dbPath);
        db.get('SELECT painel FROM paineis WHERE id = ?', [id], async (err, row) => {
            db.close();
            if (err) return message.reply('❌ Erro ao buscar painel no banco de dados.');
            if (!row || !row.painel) return message.reply('❌ Painel não encontrado ou sem JSON salvo.');
            let painelData;
            try {
                painelData = JSON.parse(row.painel);
            } catch (e) {
                return message.reply('❌ O JSON salvo para este painel está inválido.');
            }
            const { embed, content, components } = painelJsonToEmbedAndComponents(painelData);
            await message.channel.send({
                content,
                embeds: [embed],
                components
            });
        });
    },

    // Handler para o botão painelb_ID
    async handlePainelb(interaction) {
        const painelId = interaction.customId.replace('painelb_', '');
        const db = new sqlite3.Database(dbPath);
        db.get('SELECT painel, categoria_ticket FROM paineis WHERE id = ?', [painelId], async (err, row) => {
            db.close();
            if (err || !row || !row.painel) {
                return interaction.reply({ content: '❌ Não foi possível buscar o painel.', flags: 64 });
            }
            let painelData;
            try {
                painelData = JSON.parse(row.painel);
            } catch (e) {
                return interaction.reply({ content: '❌ O JSON salvo para este painel está inválido.', flags: 64 });
            }


            // Função utilitária para criar embed a partir do JSON carregando_ticket
            function embedFromJsonWithVars(jsonString, userId, ticketId) {
                if (!jsonString) return new EmbedBuilder().setDescription('Aguarde, estamos criando seu ticket...');
                try {
                    let jsonStr = jsonString;
                    if (userId) jsonStr = jsonStr.replace(/<user>/g, `<@${userId}>`);
                    if (ticketId) jsonStr = jsonStr.replace(/<ticket>/g, ticketId);
                    const json = JSON.parse(jsonStr);
                    const embed = new EmbedBuilder();
                    if (json.title) embed.setTitle(json.title);
                    if (json.description) embed.setDescription(json.description);
                    if (json.color_embed) embed.setColor(json.color_embed);
                    if (json.color) embed.setColor(json.color);
                    if (json.url) embed.setURL(json.url);
                    if (json.timestamp) embed.setTimestamp(new Date(json.timestamp));
                    if (json.footer) {
                        if (typeof json.footer === 'string') {
                            embed.setFooter({ text: json.footer });
                        } else {
                            embed.setFooter({ text: json.footer.text || '', iconURL: json.footer.icon_url || json.footer.iconURL });
                        }
                    }
                    if (json.author) {
                        if (typeof json.author === 'string') {
                            embed.setAuthor({ name: json.author });
                        } else {
                            embed.setAuthor({ name: json.author.name || '', iconURL: json.author.icon_url || json.author.iconURL, url: json.author.url });
                        }
                    }
                    if (json.thumbnail) embed.setThumbnail(json.thumbnail);
                    if (json.image) embed.setImage(json.image);
                    if (Array.isArray(json.fields)) {
                        json.fields.forEach(f => {
                            if (f && f.name && f.value) embed.addFields({ name: f.name, value: f.value, inline: !!f.inline });
                        });
                    }
                    return embed;
                } catch (e) {
                    return new EmbedBuilder().setDescription('Aguarde, estamos criando seu ticket...');
                }
            }

            const carregandoEmbed = embedFromJsonWithVars(painelData.carregando_ticket, interaction.user.id);
            await interaction.reply({ embeds: [carregandoEmbed], flags: 64 });

            // Cria o chat na categoria especificada
            const categoriaId = row.categoria_ticket || painelData.categoria_ticket;
            if (!categoriaId) return;
            const guild = interaction.guild;
            if (!guild) return;
            try {
                // Conta quantos tickets já existem para o usuário
                const allChannels = guild.channels.cache.filter(c => c.type === 0 && c.name.startsWith(`ticket-${interaction.user.username}`));
                const userTickets = allChannels.filter(c => c.name.match(new RegExp(`^ticket-${interaction.user.username}-\\d+$`)));
                const n = userTickets.size + 1;
                const channelName = `ticket-${interaction.user.username}-${n}`;
                const channel = await guild.channels.create({
                    name: channelName,
                    type: 0, // 0 = GUILD_TEXT
                    parent: categoriaId,
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone,
                            deny: ['ViewChannel']
                        },
                        {
                            id: interaction.user.id,
                            allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory']
                        }
                    ]
                });
        // Envia embed inicial no canal, se houver msg_inicial no painel
        // Busca msg_inicial do painel no banco
        const db2 = new sqlite3.Database(dbPath);
        db2.get('SELECT msg_inicial FROM paineis WHERE id = ?', [painelId], async (err2, row2) => {
            db2.close();
            if (!err2 && row2 && row2.msg_inicial) {
                let msgInicialStr = row2.msg_inicial;
                // Substitui variáveis
                if (interaction.user.id) msgInicialStr = msgInicialStr.replace(/<user>/g, `<@${interaction.user.id}>`);
                if (channel.id) msgInicialStr = msgInicialStr.replace(/<ticket>/g, channel.id);
                try {
                    const msgInicialJson = JSON.parse(msgInicialStr);
                    // Seta custom_id dos dois primeiros botões, se existirem
                    if (msgInicialJson.msg_button && Array.isArray(msgInicialJson.msg_button.components)) {
                        if (msgInicialJson.msg_button.components[0]) msgInicialJson.msg_button.components[0].custom_id = 'msgid-1';
                        if (msgInicialJson.msg_button.components[1]) msgInicialJson.msg_button.components[1].custom_id = 'msgid-2';
                    }
                    // Usa a mesma lógica de embedFromJsonWithVars para todos os campos
                    const embed = new EmbedBuilder();
                    if (msgInicialJson.title) embed.setTitle(msgInicialJson.title);
                    if (msgInicialJson.description) embed.setDescription(msgInicialJson.description);
                    if (msgInicialJson.color_embed) embed.setColor(msgInicialJson.color_embed);
                    if (msgInicialJson.color) embed.setColor(msgInicialJson.color);
                    if (msgInicialJson.url) embed.setURL(msgInicialJson.url);
                    if (msgInicialJson.timestamp) embed.setTimestamp(new Date(msgInicialJson.timestamp));
                    if (msgInicialJson.footer) {
                        if (typeof msgInicialJson.footer === 'string') {
                            embed.setFooter({ text: msgInicialJson.footer });
                        } else {
                            embed.setFooter({ text: msgInicialJson.footer.text || '', iconURL: msgInicialJson.footer.icon_url || msgInicialJson.footer.iconURL });
                        }
                    }
                    if (msgInicialJson.author) {
                        if (typeof msgInicialJson.author === 'string') {
                            embed.setAuthor({ name: msgInicialJson.author });
                        } else {
                            embed.setAuthor({ name: msgInicialJson.author.name || '', iconURL: msgInicialJson.author.icon_url || msgInicialJson.author.iconURL, url: msgInicialJson.author.url });
                        }
                    }
                    if (msgInicialJson.thumbnail) embed.setThumbnail(msgInicialJson.thumbnail);
                    if (msgInicialJson.image) embed.setImage(msgInicialJson.image);
                    if (Array.isArray(msgInicialJson.fields)) {
                        msgInicialJson.fields.forEach(f => {
                            if (f && f.name && f.value) embed.addFields({ name: f.name, value: f.value, inline: !!f.inline });
                        });
                    }
                    // Monta botões se existirem
                    let components = [];
                    if (msgInicialJson.msg_button && Array.isArray(msgInicialJson.msg_button.components)) {
                        const row = new ActionRowBuilder();
                        msgInicialJson.msg_button.components.forEach(btn => {
                            const button = new ButtonBuilder()
                                .setCustomId(btn.custom_id || 'msgid')
                                .setLabel(btn.label || 'Botão')
                                .setStyle(btn.style || ButtonStyle.Primary);
                            if (btn.emoji) button.setEmoji(btn.emoji);
                            // Suporte a campo emote (alias para emoji)
                            if (btn.emote) button.setEmoji(btn.emote);
                            if (btn.url && btn.style === ButtonStyle.Link) button.setURL(btn.url);
                            if (btn.disabled) button.setDisabled(!!btn.disabled);
                            if (btn.color && typeof btn.color === 'string') {
                                const styleMap = {
                                    'primary': ButtonStyle.Primary,
                                    'secondary': ButtonStyle.Secondary,
                                    'success': ButtonStyle.Success,
                                    'danger': ButtonStyle.Danger,
                                    'link': ButtonStyle.Link
                                };
                                if (styleMap[btn.color.toLowerCase()]) button.setStyle(styleMap[btn.color.toLowerCase()]);
                            }
                            row.addComponents(button);
                        });
                        components.push(row);
                    }
                    await channel.send({ embeds: [embed], components });
        // TIMEOUT DE 10 MINUTOS COM AVISOS EM EMBEDS
        // 3min, 6min, 9min, 9:50min e 10min (deleta)
        // Busca os embeds de timeout do banco e usa eles
        (function () {
            const dbTimeout = new sqlite3.Database(dbPath);
            dbTimeout.get('SELECT timeout_1, timeout_2, timeout_3, timeout_4 FROM paineis WHERE id = ?', [painelId], (errTimeout, rowTimeout) => {
                dbTimeout.close();
                function embedTimeoutFromJson(jsonString) {
                    if (!jsonString) return null;
                    try {
                        let jsonStr = jsonString;
                        if (interaction.user.id) jsonStr = jsonStr.replace(/<user>/g, `<@${interaction.user.id}>`);
                        if (channel.id) jsonStr = jsonStr.replace(/<ticket>/g, channel.id);
                        const json = JSON.parse(jsonStr);
                        const embed = new EmbedBuilder();
                        if (json.title) embed.setTitle(json.title);
                        if (json.description) embed.setDescription(json.description);
                        if (json.color_embed) embed.setColor(json.color_embed);
                        if (json.color) embed.setColor(json.color);
                        if (json.url) embed.setURL(json.url);
                        if (json.timestamp) embed.setTimestamp(new Date(json.timestamp));
                        if (json.footer) {
                            if (typeof json.footer === 'string') {
                                embed.setFooter({ text: json.footer });
                            } else {
                                embed.setFooter({ text: json.footer.text || '', iconURL: json.footer.icon_url || json.footer.iconURL });
                            }
                        }
                        if (json.author) {
                            if (typeof json.author === 'string') {
                                embed.setAuthor({ name: json.author });
                            } else {
                                embed.setAuthor({ name: json.author.name || '', iconURL: json.author.icon_url || json.author.iconURL, url: json.author.url });
                            }
                        }
                        if (json.thumbnail) embed.setThumbnail(json.thumbnail);
                        if (json.image) embed.setImage(json.image);
                        if (Array.isArray(json.fields)) {
                            json.fields.forEach(f => {
                                if (f && f.name && f.value) embed.addFields({ name: f.name, value: f.value, inline: !!f.inline });
                            });
                        }
                        return embed;
                    } catch (e) {
                        return null;
                    }
                }
                setTimeout(() => {
                    const embed = embedTimeoutFromJson(rowTimeout && rowTimeout.timeout_1);
                    if (embed) {
                        channel.send({ embeds: [embed] });
                    }
                }, 3 * 60 * 1000);
                setTimeout(() => {
                    const embed = embedTimeoutFromJson(rowTimeout && rowTimeout.timeout_2);
                    if (embed) {
                        channel.send({ embeds: [embed] });
                    }
                }, 6 * 60 * 1000);
                setTimeout(() => {
                    const embed = embedTimeoutFromJson(rowTimeout && rowTimeout.timeout_3);
                    if (embed) {
                        channel.send({ embeds: [embed] });
                    }
                }, 9 * 60 * 1000);
                setTimeout(() => {
                    const embed = embedTimeoutFromJson(rowTimeout && rowTimeout.timeout_4);
                    if (embed) {
                        channel.send({ embeds: [embed] });
                    }
                }, (9 * 60 + 50) * 1000);
                setTimeout(() => {
                    const avisoEmbed = new EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle('⏰ Ticket Fechado')
                        .setDescription('O ticket foi fechado automaticamente por inatividade.');
                    channel.send({ embeds: [avisoEmbed] }).then(() => {
                        channel.delete('Ticket fechado automaticamente por inatividade.');
                    });
                }, 10 * 60 * 1000);
            });
        })();
                } catch (e) {
                    // Se não for JSON válido, envia como texto puro
                    await channel.send({ content: msgInicialStr });
                }
            }
        });
                // Após criar o canal, monta o embed de notificarticket e adiciona o botão com custom_id Notificarb_id
                let notificarticketJson = painelData.notificarticket;
                let notificarticketObj;
                try {
                    let jsonStr = notificarticketJson;
                    if (interaction.user.id) jsonStr = jsonStr.replace(/<user>/g, `<@${interaction.user.id}>`);
                    if (channel.id) jsonStr = jsonStr.replace(/<ticket>/g, channel.id);
                    notificarticketObj = JSON.parse(jsonStr);
                } catch (e) {
                    notificarticketObj = {};
                }
                // Adiciona/ajusta botão para custom_id Notificarb_id
                if (!notificarticketObj.msg_button) notificarticketObj.msg_button = { components: [] };
                if (!Array.isArray(notificarticketObj.msg_button.components)) notificarticketObj.msg_button.components = [];
                // Se já existe botão, sobrescreve o custom_id do primeiro botão
                if (notificarticketObj.msg_button.components.length > 0) {
                    // Clona todas as configs do botão original, só troca o custom_id
                    notificarticketObj.msg_button.components[0] = {
                        ...notificarticketObj.msg_button.components[0],
                        custom_id: `Notificarb_${painelId}`
                    };
                } else {
                    // Cria botão padrão, mas permite configs extras se vierem no JSON
                    notificarticketObj.msg_button.components.push({
                        label: 'Notificar',
                        style: 1, // Primary
                        custom_id: `Notificarb_${painelId}`
                        // Adicione outros campos se necessário
                    });
                }
                notificarticketObj.id = painelId;
                const { embed: notificarticketEmbed, content, components } = painelJsonToEmbedAndComponents(notificarticketObj);
                await interaction.editReply({ embeds: [notificarticketEmbed], components });
            } catch (e) {
                await interaction.followUp({ content: '❌ Erro ao criar o chat de atendimento.', flags: 64 });
            }
        });
    }
    ,
    // Handler para o botão Notificarb_id
    async handleNotificarb(interaction) {
        // Extrai o ID do painel do customId
        const painelId = interaction.customId.replace('Notificarb_', '');
        // Busca o canal de ticket do usuário relacionado a esse painel
        const guild = interaction.guild;
        if (!guild) return await interaction.reply({ content: '❌ Não foi possível encontrar o servidor.', flags: 64 });
        // Procura o canal de ticket mais recente do usuário para esse painel
        const user = interaction.user;
        // Nome padrão: ticket-{username}-{n}
        const channel = guild.channels.cache.find(c => c.type === 0 && c.name.startsWith(`ticket-${user.username}-`));
        if (channel) {
            await interaction.reply({ content: `🔔 Você foi direcionado para o seu ticket: <#${channel.id}>`, flags: 64 });
        } else {
            await interaction.reply({ content: '❌ Não foi possível localizar o canal do ticket.', flags: 64 });
        }
    }
};

