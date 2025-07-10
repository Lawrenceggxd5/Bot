const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'outros',
    description: 'Mostra opções de outros comandos',
    async execute(client, messageOrInteraction, args) {
        const isInteraction = !!messageOrInteraction.isRepliable;
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('outros_perfil').setLabel('Perfil').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('outros_verificar').setLabel('Verificar').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('outros_confirmar').setLabel('Confirmar').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('outros_cancelar').setLabel('Cancelar').setStyle(ButtonStyle.Danger)
        );
        if (isInteraction) {
            await messageOrInteraction.reply({ content: 'Escolha uma opção:', components: [row], flags: 64 });
        } else {
            await messageOrInteraction.reply({ content: 'Escolha uma opção:', components: [row] });
        }
    },
    async handleButton(interaction) {
        // Handler para cada botão
        if (interaction.customId === 'outros_perfil') {
            // Mostra instrução sobre as tags dinâmicas
            const tagsMsg = 'Envie o JSON do embed de perfil. Você pode usar as tags dinâmicas: <User>, <ID>, <Tag>, <Data>\n\nExemplo: {"title": "Perfil de <User>", "description": "ID: <ID>\nTag: <Tag>\nData: <Data>"}\n\nOu clique em Voltar.';
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('outros_perfil_salvar').setLabel('Salvar').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('outros_perfil_preview').setLabel('Preview').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('outros_voltar').setLabel('Voltar').setStyle(ButtonStyle.Secondary)
            );
            await interaction.reply({ content: tagsMsg, components: [row], flags: 64 });
            // Coleta a próxima mensagem do usuário
            const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });
            collector.on('collect', async m => {
                let embedObj;
                try {
                    embedObj = JSON.parse(m.content);
                } catch (e) {
                    return m.reply('❌ JSON inválido. Tente novamente ou clique em Voltar.');
                }
                // Substitui tags dinâmicas para preview
                const previewEmbed = JSON.parse(JSON.stringify(embedObj));
                const user = m.author;
                const now = new Date();
                const tagMap = {
                    '<User>': user.username,
                    '<ID>': user.id,
                    '<Tag>': user.tag || `${user.username}#${user.discriminator}`,
                    '<Data>': now.toLocaleDateString('pt-BR')
                };
                function replaceTags(str) {
                    if (typeof str !== 'string') return str;
                    return Object.entries(tagMap).reduce((acc, [k, v]) => acc.replaceAll(k, v), str);
                }
                for (const k of Object.keys(previewEmbed)) {
                    if (typeof previewEmbed[k] === 'string') previewEmbed[k] = replaceTags(previewEmbed[k]);
                }
                // Salva embed puro no banco via db.js
                const db = require('../database/db');
                const embedToSave = { ...embedObj };
                delete embedToSave.buttons;
                db.salvarEmbedPerfil(user.id, JSON.stringify(embedToSave), (err) => {
                    if (err) {
                        return m.reply('❌ Erro ao salvar o embed no banco.');
                    }
                    const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
                    const embed = EmbedBuilder.from(previewEmbed);
                    let rowBtn = null;
                    if (Array.isArray(embedObj.buttons) && embedObj.buttons.length > 0) {
                        const btns = embedObj.buttons
                            .map(btn => {
                                let b = new ButtonBuilder()
                                    .setCustomId(btn.custom_id || 'custom')
                                    .setLabel(btn.label || 'Botão')
                                    .setStyle(btn.style || 1)
                                    .setDisabled(!!btn.disabled);
                                if (btn.emoji) b = b.setEmoji(btn.emoji);
                                return b;
                            })
                            .filter(Boolean);
                        if (btns.length > 0) {
                            rowBtn = new ActionRowBuilder().addComponents(...btns);
                        }
                    }
                    const replyOptions = { content: 'Preview do embed de perfil salvo! Use !perfil para exibir seu perfil.', embeds: [embed] };
                    if (rowBtn) replyOptions.components = [rowBtn];
                    m.reply(replyOptions);
                });
            });
        } else if (interaction.customId === 'outros_verificar') {
            // Pede o JSON do embed e mostra botão Voltar
            const voltarRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('outros_voltar').setLabel('Voltar').setStyle(ButtonStyle.Secondary)
            );
            await interaction.reply({ content: 'Envie o JSON do embed de verificação (ou clique em Voltar):', components: [voltarRow], flags: 64 });
            // Coleta a próxima mensagem do usuário
            const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });
            collector.on('collect', async m => {
                let embedObj;
                try {
                    embedObj = JSON.parse(m.content);
                } catch (e) {
                    return m.reply('❌ JSON inválido. Tente novamente ou clique em Voltar.');
                }
                // Salva o embed no banco de dados (campo embed_verificar do usuário), garantindo schema
                const sqlite3 = require('sqlite3').verbose();
                const path = require('path');
                const dbPath = path.join(__dirname, '../painel.sqlite');
                const db = new sqlite3.Database(dbPath);
                // Cria tabela e coluna se não existirem
                db.serialize(() => {
                    db.run(`CREATE TABLE IF NOT EXISTS perfis (
                        user_id TEXT PRIMARY KEY,
                        embed_verificar TEXT
                    )`);
                    db.run(`ALTER TABLE perfis ADD COLUMN embed_verificar TEXT`, [], function(e){}); // ignora erro se já existe
                    // Se vier buttons, salva só embed puro no banco
                    const embedToSave = { ...embedObj };
                    delete embedToSave.buttons;
                    db.run('INSERT OR REPLACE INTO perfis (user_id, embed_verificar) VALUES (?, ?)', [m.author.id, JSON.stringify(embedToSave)], function(err) {
                        db.close();
                        if (err) {
                            return m.reply('❌ Erro ao salvar o embed no banco.');
                        }
                        const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
                        const embed = EmbedBuilder.from(embedToSave);
                        let rowBtn;
                        if (Array.isArray(embedObj.buttons) && embedObj.buttons.length > 0) {
                            rowBtn = new ActionRowBuilder().addComponents(
                                ...embedObj.buttons.map(btn => {
                                    let b = new ButtonBuilder()
                                        .setCustomId(btn.custom_id || 'custom')
                                        .setLabel(btn.label || 'Botão')
                                        .setStyle(btn.style || 1)
                                        .setDisabled(!!btn.disabled);
                                    if (btn.emoji) b = b.setEmoji(btn.emoji);
                                    return b;
                                })
                            );
                        } else {
                            rowBtn = new ActionRowBuilder().addComponents(
                                new ButtonBuilder()
                                    .setCustomId('verificar_botao')
                                    .setLabel('Verificar')
                                    .setStyle(ButtonStyle.Success),
                                new ButtonBuilder()
                                    .setCustomId('outros_voltar')
                                    .setLabel('Voltar')
                                    .setStyle(ButtonStyle.Secondary)
                            );
                        }
                        m.reply({ content: 'Preview do embed de verificação salvo! Use !verificar para testar.', embeds: [embed], components: [rowBtn] });
                    });
                });
            });
        } else if (interaction.customId === 'outros_confirmar') {
            await interaction.reply({ content: 'Confirmação realizada!', flags: 64 });
        } else if (interaction.customId === 'outros_voltar') {
            await interaction.reply({ content: 'Voltando ao menu anterior.', flags: 64 });
        } else if (interaction.customId === 'outros_cancelar') {
            await interaction.reply({ content: 'Operação cancelada.', flags: 64 });
        } else {
            await interaction.reply({ content: 'Botão não reconhecido.', flags: 64 });
        }
    }
};
