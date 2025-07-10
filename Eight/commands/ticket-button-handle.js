// Handler para Msg Carrinho
async function handleMsgCarrinho(interaction, painelId, log, error) {
    try {
        const db = new sqlite3.Database(dbPath);
        db.get('SELECT msg_carrinho FROM paineis WHERE id = ?', [painelId], async (err, painel) => {
            db.close();
            if (err || !painel) {
                return safeReply(interaction, { content: '❌ Não foi possível buscar a mensagem do carrinho.', flags: 64 });
            }
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`mensagens_${painelId}`).setLabel('Voltar').setStyle(ButtonStyle.Secondary)
            );
            await safeReply(interaction, {
                content: `Mensagem do carrinho atual:\n\n${painel.msg_carrinho || 'Não definida.'}\n\nATENÇÃO: O campo salvo no banco é msg_carrinho.\n\nEnvie um JSON válido para a mensagem do carrinho.\n\nExemplo:\n\n\`\`\`json\n{\n  "content": "Seu carrinho está aqui!"\n}\n\`\`\`\n\nClique em Voltar para retornar.`,
                components: [row],
                flags: 64
            });
            // Coleta a próxima mensagem do usuário
            const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });
            collector.on('collect', m => {
                let json;
                try {
                    json = JSON.parse(m.content);
                } catch (e) {
                    return m.reply('❌ JSON inválido. Tente novamente enviando um JSON válido.');
                }
                const db2 = new sqlite3.Database(dbPath);
                db2.run('UPDATE paineis SET msg_carrinho = ? WHERE id = ?', [m.content, painelId], err => {
                    db2.close();
                    if (err) {
                        m.reply('❌ Erro ao salvar a nova mensagem do carrinho.');
                    } else {
                        m.reply('✅ Mensagem do carrinho atualizada com sucesso!');
                    }
                });
            });
            collector.on('end', collected => {
                if (collected.size === 0) safeReply(interaction, { content: 'Tempo esgotado. Nenhuma alteração feita.', flags: 64 });
            });
        });
    } catch (err) {
        error('handleMsgCarrinho', err);
        try { await safeReply(interaction, { content: '❌ Erro inesperado ao processar mensagem do carrinho.', flags: 64 }); } catch (e) { error('handleMsgCarrinho_error', e); }
    }
}

// Handler para Msg Produtos
async function handleMsgProdutos(interaction, painelId, log, error) {
    try {
        const db = new sqlite3.Database(dbPath);
        db.get('SELECT msg_produtos FROM paineis WHERE id = ?', [painelId], async (err, painel) => {
            db.close();
            if (err || !painel) {
                return safeReply(interaction, { content: '❌ Não foi possível buscar a mensagem de produtos.', flags: 64 });
            }
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`mensagens_${painelId}`).setLabel('Voltar').setStyle(ButtonStyle.Secondary)
            );
            await safeReply(interaction, {
                content: `Mensagem de produtos atual:\n\n${painel.msg_produtos || 'Não definida.'}\n\nATENÇÃO: O campo salvo no banco é msg_produtos.\n\nEnvie um JSON válido para a mensagem de produtos.\n\nExemplo:\n\n\`\`\`json\n{\n  "content": "Estes são os produtos disponíveis."\n}\n\`\`\`\n\nClique em Voltar para retornar.`,
                components: [row],
                flags: 64
            });
            // Coleta a próxima mensagem do usuário
            const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });
            collector.on('collect', m => {
                let json;
                try {
                    json = JSON.parse(m.content);
                } catch (e) {
                    return m.reply('❌ JSON inválido. Tente novamente enviando um JSON válido.');
                }
                const db2 = new sqlite3.Database(dbPath);
                db2.run('UPDATE paineis SET msg_produtos = ? WHERE id = ?', [m.content, painelId], err => {
                    db2.close();
                    if (err) {
                        m.reply('❌ Erro ao salvar a nova mensagem de produtos.');
                    } else {
                        m.reply('✅ Mensagem de produtos atualizada com sucesso!');
                    }
                });
            });
            collector.on('end', collected => {
                if (collected.size === 0) safeReply(interaction, { content: 'Tempo esgotado. Nenhuma alteração feita.', flags: 64 });
            });
        });
    } catch (err) {
        error('handleMsgProdutos', err);
        try { await safeReply(interaction, { content: '❌ Erro inesperado ao processar mensagem de produtos.', flags: 64 }); } catch (e) { error('handleMsgProdutos_error', e); }
    }
}

// Handler para Msg Info 1, 2, 3
async function handleMsgInfo(interaction, painelId, i, log, error) {
    try {
        const db = new sqlite3.Database(dbPath);
        db.get(`SELECT info_${i} FROM paineis WHERE id = ?`, [painelId], async (err, painel) => {
            db.close();
            if (err || !painel) {
                return safeReply(interaction, { content: `❌ Não foi possível buscar a mensagem info_${i}.`, flags: 64 });
            }
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`mensagens_${painelId}`).setLabel('Voltar').setStyle(ButtonStyle.Secondary)
            );
            await safeReply(interaction, {
                content: `Mensagem info_${i} atual:\n\n${painel[`info_${i}`] || 'Não definida.'}\n\nATENÇÃO: O campo salvo no banco é info_${i}.\n\nEnvie um JSON válido para a mensagem info_${i}.\n\nExemplo:\n\n\`\`\`json\n{\n  "content": "Mensagem info ${i}."\n}\n\`\`\`\n\nClique em Voltar para retornar.`,
                components: [row],
                flags: 64
            });
            // Coleta a próxima mensagem do usuário
            const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });
            collector.on('collect', m => {
                let json;
                try {
                    json = JSON.parse(m.content);
                } catch (e) {
                    return m.reply('❌ JSON inválido. Tente novamente enviando um JSON válido.');
                }
                const db2 = new sqlite3.Database(dbPath);
                db2.run(`UPDATE paineis SET info_${i} = ? WHERE id = ?`, [m.content, painelId], err => {
                    db2.close();
                    if (err) {
                        m.reply(`❌ Erro ao salvar a nova mensagem info_${i}.`);
                    } else {
                        m.reply(`✅ Mensagem info_${i} atualizada com sucesso!`);
                    }
                });
            });
            collector.on('end', collected => {
                if (collected.size === 0) safeReply(interaction, { content: 'Tempo esgotado. Nenhuma alteração feita.', flags: 64 });
            });
        });
    } catch (err) {
        error('handleMsgInfo', err);
        try { await safeReply(interaction, { content: '❌ Erro inesperado ao processar mensagem info.', flags: 64 }); } catch (e) { error('handleMsgInfo_error', e); }
    }
}

// Handler para Msg Info Padronizado 1, 2, 3
async function handleMsgInfoPadronizado(interaction, painelId, i, log, error) {
    try {
        const db = new sqlite3.Database(dbPath);
        db.get(`SELECT info_padronizado_${i} FROM paineis WHERE id = ?`, [painelId], async (err, painel) => {
            db.close();
            if (err || !painel) {
                return safeReply(interaction, { content: `❌ Não foi possível buscar a mensagem info_padronizado_${i}.`, flags: 64 });
            }
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`mensagens_${painelId}`).setLabel('Voltar').setStyle(ButtonStyle.Secondary)
            );
            await safeReply(interaction, {
                content: `Mensagem info_padronizado_${i} atual:\n\n${painel[`info_padronizado_${i}`] || 'Não definida.'}\n\nATENÇÃO: O campo salvo no banco é info_padronizado_${i}.\n\nEnvie um JSON válido para a mensagem info_padronizado_${i}.\n\nExemplo:\n\n\`\`\`json\n{\n  "content": "Mensagem info padronizado ${i}."\n}\n\`\`\`\n\nClique em Voltar para retornar.`,
                components: [row],
                flags: 64
            });
            // Coleta a próxima mensagem do usuário
            const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });
            collector.on('collect', m => {
                let json;
                try {
                    json = JSON.parse(m.content);
                } catch (e) {
                    return m.reply('❌ JSON inválido. Tente novamente enviando um JSON válido.');
                }
                const db2 = new sqlite3.Database(dbPath);
                db2.run(`UPDATE paineis SET info_padronizado_${i} = ? WHERE id = ?`, [m.content, painelId], err => {
                    db2.close();
                    if (err) {
                        m.reply(`❌ Erro ao salvar a nova mensagem info_padronizado_${i}.`);
                    } else {
                        m.reply(`✅ Mensagem info_padronizado_${i} atualizada com sucesso!`);
                    }
                });
            });
            collector.on('end', collected => {
                if (collected.size === 0) safeReply(interaction, { content: 'Tempo esgotado. Nenhuma alteração feita.', flags: 64 });
            });
        });
    } catch (err) {
        error('handleMsgInfoPadronizado', err);
        try { await safeReply(interaction, { content: '❌ Erro inesperado ao processar mensagem info padronizado.', flags: 64 }); } catch (e) { error('handleMsgInfoPadronizado_error', e); }
    }
}

// Handler para Timeout 1, 2, 3, 4
async function handleTimeout(interaction, painelId, i, log, error) {
    try {
        const db = new sqlite3.Database(dbPath);
        db.get(`SELECT timeout_${i} FROM paineis WHERE id = ?`, [painelId], async (err, painel) => {
            db.close();
            if (err || !painel) {
                return safeReply(interaction, { content: `❌ Não foi possível buscar a mensagem timeout_${i}.`, flags: 64 });
            }
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`mensagens_${painelId}`).setLabel('Voltar').setStyle(ButtonStyle.Secondary)
            );
            await safeReply(interaction, {
                content: `Mensagem timeout_${i} atual:\n\n${painel[`timeout_${i}`] || 'Não definida.'}\n\nATENÇÃO: O campo salvo no banco é timeout_${i}.\n\nEnvie um JSON válido para a mensagem timeout_${i}.\n\nExemplo:\n\n\`\`\`json\n{\n  "content": "Timeout ${i}."\n}\n\`\`\`\n\nClique em Voltar para retornar.`,
                components: [row],
                flags: 64
            });
            // Coleta a próxima mensagem do usuário
            const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });
            collector.on('collect', m => {
                let json;
                try {
                    json = JSON.parse(m.content);
                } catch (e) {
                    return m.reply('❌ JSON inválido. Tente novamente enviando um JSON válido.');
                }
                const db2 = new sqlite3.Database(dbPath);
                db2.run(`UPDATE paineis SET timeout_${i} = ? WHERE id = ?`, [m.content, painelId], err => {
                    db2.close();
                    if (err) {
                        m.reply(`❌ Erro ao salvar a nova mensagem timeout_${i}.`);
                    } else {
                        m.reply(`✅ Mensagem timeout_${i} atualizada com sucesso!`);
                    }
                });
            });
            collector.on('end', collected => {
                if (collected.size === 0) safeReply(interaction, { content: 'Tempo esgotado. Nenhuma alteração feita.', flags: 64 });
            });
        });
    } catch (err) {
        error('handleTimeout', err);
        try { await safeReply(interaction, { content: '❌ Erro inesperado ao processar mensagem timeout.', flags: 64 }); } catch (e) { error('handleTimeout_error', e); }
    }
}

// Handler para Métodos de Pagamento (chama outro arquivo)
async function handleMsgMetodosPagamento(interaction, painelId, log, error) {
    try {
        const metodosPagamento = require('./metodos-pagamento-handle');
        await metodosPagamento.handle(interaction, painelId, log, error);
    } catch (err) {
        error('handleMsgMetodosPagamento', err);
        try { await safeReply(interaction, { content: '❌ Erro ao processar métodos de pagamento.', flags: 64 }); } catch (e) { error('handleMsgMetodosPagamento_error', e); }
    }
}

// Handler para Mensagem Realizar Pagamento
async function handleMsgRealizarPagamento(interaction, painelId, log, error) {
    try {
        const db = new sqlite3.Database(dbPath);
        db.get('SELECT msg_realizar_pagamento FROM paineis WHERE id = ?', [painelId], async (err, painel) => {
            db.close();
            if (err || !painel) {
                return safeReply(interaction, { content: '❌ Não foi possível buscar a mensagem de realizar pagamento.', flags: 64 });
            }
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`mensagens_${painelId}`).setLabel('Voltar').setStyle(ButtonStyle.Secondary)
            );
            await safeReply(interaction, {
                content: `Mensagem de realizar pagamento atual:\n\n${painel.msg_realizar_pagamento || 'Não definida.'}\n\nATENÇÃO: O campo salvo no banco é msg_realizar_pagamento.\n\nEnvie um JSON válido para a mensagem de realizar pagamento.\n\nExemplo:\n\n\`\`\`json\n{\n  "content": "Clique para pagar."\n}\n\`\`\`\n\nClique em Voltar para retornar.`,
                components: [row],
                flags: 64
            });
            // Coleta a próxima mensagem do usuário
            const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });
            collector.on('collect', m => {
                let json;
                try {
                    json = JSON.parse(m.content);
                } catch (e) {
                    return m.reply('❌ JSON inválido. Tente novamente enviando um JSON válido.');
                }
                const db2 = new sqlite3.Database(dbPath);
                db2.run('UPDATE paineis SET msg_realizar_pagamento = ? WHERE id = ?', [m.content, painelId], err => {
                    db2.close();
                    if (err) {
                        m.reply('❌ Erro ao salvar a nova mensagem de realizar pagamento.');
                    } else {
                        m.reply('✅ Mensagem de realizar pagamento atualizada com sucesso!');
                    }
                });
            });
            collector.on('end', collected => {
                if (collected.size === 0) safeReply(interaction, { content: 'Tempo esgotado. Nenhuma alteração feita.', flags: 64 });
            });
        });
    } catch (err) {
        error('handleMsgRealizarPagamento', err);
        try { await safeReply(interaction, { content: '❌ Erro inesperado ao processar mensagem de realizar pagamento.', flags: 64 }); } catch (e) { error('handleMsgRealizarPagamento_error', e); }
    }
}
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '../painel.sqlite');
const safeReply = require('../utils/safeReply');

// Handler principal

async function handleMsgInicial(interaction, painelId, logInfo, logError) {
    try {
        logInfo('handleMsgInicial', `Início handler. interaction.customId=${interaction.customId}, painelId=${painelId}`);
        const realPainelId = interaction.customId.replace('msg_inicial_', '');
        const db = new sqlite3.Database(dbPath);
        db.get('SELECT msg_inicial FROM paineis WHERE id = ?', [realPainelId], async (err, painel) => {
            db.close();
            if (err || !painel) {
                logError('handleMsgInicial_dbget', err || 'Painel não encontrado');
                return await safeReply(interaction, { content: '❌ Não foi possível buscar a mensagem inicial.', flags: 64 });
            }
            logInfo('handleMsgInicial', `Painel encontrado. msg_inicial=${painel.msg_inicial}`);
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`mensagens_${realPainelId}`)
                    .setLabel('Voltar')
                    .setStyle(ButtonStyle.Secondary)
            );
            await safeReply(interaction, {
                content: `Mensagem inicial atual:\n\n${painel.msg_inicial || 'Não definida.'}\n\nEnvie um JSON contendo exatamente 2 botões para a mensagem inicial.\n\nExemplo:\n\`\`\`json\n{\n  "content": "Bem-vindo!",\n  "components": [\n    { "type": 2, "label": "Botão 1", "style": 1, "custom_id": "msg_inicial-1" },\n    { "type": 2, "label": "Botão 2", "style": 2, "custom_id": "msg_inicial-2" }\n  ]\n}\n\`\`\``,
                components: [row],
                flags: 64
            });

            const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });
            collector.on('collect', m => {
                let json;
                try {
                    json = JSON.parse(m.content);
                    if (!json.components || !Array.isArray(json.components) || json.components.length !== 2) {
                        return m.reply('❌ O JSON deve conter exatamente 2 botões no array "components".');
                    }
                } catch (e) {
                    return m.reply('❌ JSON inválido. Tente novamente enviando um JSON válido.');
                }
                const db_2 = new sqlite3.Database(dbPath);
                db_2.run('UPDATE paineis SET msg_inicial = ? WHERE id = ?', [m.content, realPainelId], err => {
                    db_2.close();
                    if (err) {
                        m.reply('❌ Erro ao salvar a nova mensagem inicial.');
                    } else {
                        m.reply('✅ Mensagem inicial atualizada com sucesso!');
                    }
                });
            });
            collector.on('end', collected => {
                if (collected.size === 0) safeReply(interaction, { content: 'Tempo esgotado. Nenhuma alteração feita.', flags: 64 });
            });
        });
    } catch (err) {
        logError('handleMsgInicial_main', err);
        try { await safeReply(interaction, { content: '❌ Erro inesperado ao processar mensagem inicial.', flags: 64 }); }
        catch (e) { logError('handleMsgInicial_error', e); }
    }
}


module.exports = {
    async handle(interaction, painelId) {
        // DEBUG: Log customId e painelId logo no início
        console.log('[DEBUG][ticket-button-handle] interaction.customId:', interaction.customId, '| painelId:', painelId);
        const logError = (context, err) => {
            console.error(`[TicketButtonHandle][${context}]`, err && err.stack ? err.stack : err);
        };
        const logInfo = (context, ...msg) => {
            console.log(`[TicketButtonHandle][${context}]`, ...msg);
        };

        try {
            // Handler do botão Ticket (menu principal de mensagens)
            if (interaction.customId === `ticket_${painelId}`) {
                logInfo('ticket', `Botão 'Ticket' clicado para painelId=${painelId} por user=${interaction.user?.id}`);
                return await handleMenuMensagens(interaction, painelId, logInfo, logError);
            }
            // Handler dos grupos de mensagens
            else if (interaction.customId === `mensagens_1_${painelId}`) {
                logInfo('mensagens__1', `Botão 'Mensagens 1' clicado para painelId=${painelId} por user=${interaction.user?.id}`);
                return await handleMensagens1(interaction, painelId, logInfo, logError);
            }
            else if (interaction.customId === `mensagens_2_${painelId}`) {
                logInfo('mensagens__2', `Botão 'Mensagens 2' clicado para painelId=${painelId} por user=${interaction.user?.id}`);
                return await handleMensagens2(interaction, painelId, logInfo, logError);
            }
            else if (interaction.customId === `mensagens_3_${painelId}`) {
                logInfo('mensagens__3', `Botão 'Mensagens 3' clicado para painelId=${painelId} por user=${interaction.user?.id}`);
                return await handleMensagens3(interaction, painelId, logInfo, logError);
            }
            else if (interaction.customId === `mensagens_4_${painelId}`) {
                logInfo('mensagens__4', `Botão 'Mensagens 4' clicado para painelId=${painelId} por user=${interaction.user?.id}`);
                return await handleMensagens4(interaction, painelId, logInfo, logError);
            }
            // Handler do botão Voltar para o menu principal
            else if (interaction.customId === `painel_${painelId}`) {
                return await handleMenuPrincipal(interaction, painelId, logInfo, logError);
            }
            // Handler para Mensagem Cancelamento
            else if (interaction.customId.startsWith('msg_cancelamento_')) {
                return await handleMsgCancelamento(interaction, painelId, logInfo, logError);
            }
            // Handler para Notificar Ticket
            else if (interaction.customId.startsWith('notificacao_painel_')) {
                return await handleNotificacaoPainel(interaction, painelId, logInfo, logError);
            }
            // Handler para Confirmar Info 1, 2, 3
            else {
                for (let i = 1; i <= 3; i++) {
                    if (interaction.customId === `confirmar_info_${i}_${painelId}`) {
                        return await handleConfirmarInfo(interaction, painelId, i, logInfo, logError);
                    }
                }
            }
            // Handler para Mensagem Infos 1, 2, 3
            for (let i = 1; i <= 3; i++) {
                if (typeof interaction !== 'undefined' && interaction.customId === `msg_infos_${i}_${painelId}`) {
                    if (// ⚠️ POSSÍVEL ESCOPAMENTO INCORRETO
typeof handleMsgInfos === 'function') {
                        return await handleMsgInfos(interaction, painelId, i, logInfo, logError);
                    }
                    return;
                }
            }
            // Handler para Mensagem Confirmar Compra
            if (typeof interaction !== 'undefined' && interaction.customId === `msg_confirmar_compra_${painelId}`) {
                if (// ⚠️ POSSÍVEL ESCOPAMENTO INCORRETO
typeof handleMsgConfirmarCompra === 'function') {
                    return await handleMsgConfirmarCompra(interaction, painelId, logInfo, logError);
                }
                return;
            }
            // Handler para voltar ao menu de grupos de mensagens (Mensagens 1-4)
            if (typeof interaction !== 'undefined' && interaction.customId === `mensagens_${painelId}`) {
                logInfo('mensagens_menu', `Botão 'Voltar para grupos de mensagens' clicado para painelId=${painelId} por user=${interaction.user?.id}`);
                await (async () => {
                    try {
                        const rows = [
                            new ActionRowBuilder().addComponents(
                                new ButtonBuilder()
                                    .setCustomId(`mensagens_1_${painelId}`)
                                    .setLabel('Mensagens 1')
                                    .setStyle(ButtonStyle.Primary)
                            ),
                            new ActionRowBuilder().addComponents(
                                new ButtonBuilder()
                                    .setCustomId(`mensagens_2_${painelId}`)
                                    .setLabel('Mensagens 2')
                                    .setStyle(ButtonStyle.Primary)
                            ),
                            new ActionRowBuilder().addComponents(
                                new ButtonBuilder()
                                    .setCustomId(`mensagens_3_${painelId}`)
                                    .setLabel('Mensagens 3')
                                    .setStyle(ButtonStyle.Primary)
                            ),
                            new ActionRowBuilder().addComponents(
                                new ButtonBuilder()
                                    .setCustomId(`mensagens_4_${painelId}`)
                                    .setLabel('Mensagens 4')
                                    .setStyle(ButtonStyle.Primary)
                            ),
                            new ActionRowBuilder().addComponents(
                                new ButtonBuilder()
                                    .setCustomId(`painel_${painelId}`)
                                    .setLabel('Voltar')
                                    .setStyle(ButtonStyle.Secondary)
                            )
                        ];
                        await safeReply(interaction,  { content: `Ticket do painel [${painelId}]. Escolha o grupo de mensagens para editar:`, components: rows, flags: 64 });
                        logInfo('mensagens_menu', 'Menu de grupos de mensagens enviado com sucesso.');
                    } catch (err) {
                        logError('mensagens_menu', err);
                        try { await safeReply(interaction,  { content: '❌ Erro ao exibir menu de mensagens.', flags: 64 }); } catch (e) { logError('mensagens_menu_safereply', e); }
                    }
                })();
                return;
            }
            // Se o botão clicado for Voltar, volta para a seleção de opções anterior (Painel, Ticket, Configurações)
            if (typeof interaction !== 'undefined' && interaction.customId === `painel_${painelId}`) {
                logInfo('voltar_painel', `Botão 'Voltar Painel' clicado para painelId=${painelId} por user=${interaction.user?.id}`);
                await (async () => {
                    try {
                        const row = new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId(`painel_${painelId}`)
                                .setLabel('Painel')
                                .setStyle(ButtonStyle.Primary),
                            new ButtonBuilder()
                                .setCustomId(`ticket_${painelId}`)
                                .setLabel('Ticket')
                                .setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder()
                                .setCustomId(`config_${painelId}`)
                                .setLabel('Configurações')
                                .setStyle(ButtonStyle.Success)
                        );
                        await safeReply(interaction,  { content: `Opções do painel [${painelId}]:`, components: [row], flags: 64 });
                        logInfo('voltar_painel', 'Menu principal do painel enviado com sucesso.');
                    } catch (err) {
                        logError('voltar_painel', err);
                        try { await safeReply(interaction,  { content: '❌ Erro ao exibir menu principal do painel.', flags: 64 }); } catch (e) { logError('voltar_painel_safereply', e); }
                    }
                })();
                return;
            }
            // Se o botão clicado for Mensagem inicial
            if (typeof interaction !== 'undefined' && interaction.customId.startsWith('msg_inicial_')) {
                const painelId = interaction.customId.replace('msg_inicial_', '');
                const db = new sqlite_3.Database(dbPath);
                await db.get('SELECT msg_inicial FROM paineis WHERE id = ?', [painelId], async (err, painel) => {
                    db.close();
                    if (err || !painel) {
                        return safeReply(interaction,  { content: '❌ Não foi possível buscar a mensagem inicial.', flags: 64 });
                    }
                    // Botão Voltar
                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`mensagens_${painelId}`)
                            .setLabel('Voltar')
                            .setStyle(ButtonStyle.Secondary)
                    );
                    await safeReply(interaction,  {
                        content: `Mensagem inicial atual:\n\n${painel.msg_inicial || 'Não definida.'}\n\nATENÇÃO: O campo salvo no banco é msg_inicial, então o ID deste JSON é sempre "msg_inicial".\n\nEnvie um JSON contendo exatamente 2 botões para a mensagem inicial.\n\nVocê pode usar as variáveis <user> e <ticket> no texto, que serão substituídas automaticamente.\n\nO custom_id dos botões deve ser:\n- msg_inicial-1\n- msg_inicial-2\n\nExemplo:\n\n\`\`\`json\n{\n  "content": "Bem-vindo!",\n  "components": [\n    { "type": 2, "label": "Botão 1", "style": 1, "custom_id": "msg_inicial-1" },\n    { "type": 2, "label": "Botão 2", "style": 2, "custom_id": "msg_inicial-2" }\n  ]\n}\n\`\`\`\n\nClique em Voltar para retornar.`,
                        components: [row],
                        flags: 64
                    });
                    // Coleta a próxima mensagem do usuário
                    const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
                    const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });
                    collector.on('collect', m => {
                        let json;
                        try {
                            json = JSON.parse(m.content);
                            if (!json.components || !Array.isArray(json.components) || json.components.length !== 2) {
                                return m.reply('❌ O JSON deve conter exatamente 2 botões no array "components".');
                            }
                        } catch (e) {
                            return m.reply('❌ JSON inválido. Tente novamente enviando um JSON válido.');
                        }
                        const db_2 = new sqlite_3.Database(dbPath);
                        db_2.run('UPDATE paineis SET msg_inicial = ? WHERE id = ?', [m.content, painelId], err => {
                            db_2.close();
                            if (err) {
                                m.reply('❌ Erro ao salvar a nova mensagem inicial.');
                            } else {
                                m.reply('✅ Mensagem inicial atualizada com sucesso!');
                            }
                        });
                    });
                    collector.on('end', collected => {
                        if (collected.size === 0) safeReply(interaction, { content: 'Tempo esgotado. Nenhuma alteração feita.', flags: 64 });
                    });
                });
                return;
            }
            // Se o botão clicado for Mensagem Cancelar Ticket
            if (typeof interaction !== 'undefined' && interaction.customId.startsWith('msg_cancelar_ticket_')) {
                const painelId = interaction.customId.replace('msg_cancelar_ticket_', '');
                const db = new sqlite3.Database(dbPath);
                await db.get('SELECT msg_cancelar_ticket FROM paineis WHERE id = ?', [painelId], async (err, painel) => {
                    db.close();
                    if (err || !painel) {
                        return safeReply(interaction,  { content: '❌ Não foi possível buscar a mensagem de cancelar ticket.', flags: 64 });
                    }
                    // Botão Voltar
                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`mensagens_${painelId}`)
                            .setLabel('Voltar')
                            .setStyle(ButtonStyle.Secondary)
                    );
                    await safeReply(interaction,  {
                        content: `Mensagem de cancelar ticket atual:\n\n${painel.msg_cancelar_ticket || 'Não definida.'}\n\nATENÇÃO: O campo salvo no banco é msg_cancelar_ticket, então o ID deste JSON é sempre "msg_cancelar_ticket".\n\nEnvie um JSON contendo exatamente 2 botões para a mensagem de cancelar ticket.\n\nVocê pode usar as variáveis <user> e <ticket> no texto, que serão substituídas automaticamente.\n\nO custom_id dos botões deve ser:\n- cancel_ticket-1\n- cancel_ticket-2\n\nExemplo:\n\n\`\`\`json\n{\n  "content": "Tem certeza que deseja cancelar o ticket?",\n  "components": [\n    { "type": 2, "label": "Sim, cancelar", "style": 4, "custom_id": "cancel_ticket-1" },\n    { "type": 2, "label": "Não, voltar", "style": 2, "custom_id": "cancel_ticket-2" }\n  ]\n}\n\`\`\`\n\nClique em Voltar para retornar.`,
                        components: [row],
                        flags: 64
                    });
                    // Coleta a próxima mensagem do usuário
                    const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
                    const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });
                    collector.on('collect', m => {
                        let json;
                        try {
                            json = JSON.parse(m.content);
                            if (!json.components || !Array.isArray(json.components) || json.components.length !== 2) {
                                return m.reply('❌ O JSON deve conter exatamente 2 botões no array "components".');
                            }
                        } catch (e) {
                            return m.reply('❌ JSON inválido. Tente novamente enviando um JSON válido.');
                        }
                        const db_2 = new sqlite3.Database(dbPath);
                        db_2.run('UPDATE paineis SET msg_cancelar_ticket = ? WHERE id = ?', [m.content, painelId], err => {
                            db_2.close();
                            if (err) {
                                m.reply('❌ Erro ao salvar a nova mensagem de cancelar ticket.');
                            } else {
                                m.reply('✅ Mensagem de cancelar ticket atualizada com sucesso!');
                            }
                        });
                    });
                    collector.on('end', collected => {
                        if (collected.size === 0) safeReply(interaction, { content: 'Tempo esgotado. Nenhuma alteração feita.', flags: 64 });
                    });
                });
                return;
            }
            // Handler para Info-Padrão 1, 2, 3
            for (let i = 1; i <= 3; i++) {
                if (typeof interaction !== 'undefined' && interaction.customId === `info-padrao_${i}_${painelId}`) {
                    if (// ⚠️ POSSÍVEL ESCOPAMENTO INCORRETO
typeof handleInfoPadrao === 'function') {
                        return await handleInfoPadrao(interaction, painelId, i, logInfo, logError);
                    }
                    return;
                }
            }
            // Handler para Info-Padronizada 1, 2, 3 (sem botões)
            for (let i = 1; i <= 3; i++) {
                if (typeof interaction !== 'undefined' && interaction.customId === `info-padronizada_${i}_${painelId}`) {
                    if (// ⚠️ POSSÍVEL ESCOPAMENTO INCORRETO
typeof handleInfoPadronizada === 'function') {
                        return await handleInfoPadronizada(interaction, painelId, i, logInfo, logError);
                    }
                    return;
                }
            }
            // Handler para Notificar Ticket (duplicado, mas para garantir await)
            if (typeof interaction !== 'undefined' && interaction.customId.startsWith('notificacao_painel_')) {
                const painelId = interaction.customId.replace('notificacao_painel_', '');
                const db = new sqlite3.Database(dbPath);
                await db.get('SELECT notificarticket FROM paineis WHERE id = ?', [painelId], async (err, painel) => {
                    db.close();
                    if (err || !painel) {
                        return safeReply(interaction,  { content: '❌ Não foi possível buscar a mensagem de notificação do ticket.', flags: 64 });
                    }
                    // Botão Voltar
                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`mensagens_${painelId}`)
                            .setLabel('Voltar')
                            .setStyle(ButtonStyle.Secondary)
                    );
                    await safeReply(interaction,  {
                        content: `Mensagem de notificação do ticket atual:\n\n${painel.notificarticket || 'Não definida.'}\n\nATENÇÃO: O campo salvo no banco é notificarticket, então o ID deste JSON é sempre "notificarticket".\n\nEnvie um JSON válido para a mensagem de notificação do ticket (sem botões).\nVocê pode usar as variáveis <user> e <ticket> no texto, que serão substituídas automaticamente.\nExemplo:\n\n\`\`\`json\n{\n  "content": "Você foi notificado sobre o ticket."\n}\n\`\`\`\n\nClique em Voltar para retornar.`,
                        components: [row],
                        flags: 64
                    });
                    // Coleta a próxima mensagem do usuário
                    const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
                    const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });
                    collector.on('collect', m => {
                        let json;
                        try {
                            json = JSON.parse(m.content);
                            if (json.components && Array.isArray(json.components) && json.components.length > 0) {
                                return m.reply('❌ Não envie botões (array "components") para esta mensagem.');
                            }
                        } catch (e) {
                            return m.reply('❌ JSON inválido. Tente novamente enviando um JSON válido.');
                        }
                        const db_2 = new sqlite3.Database(dbPath);
                        db_2.run('UPDATE paineis SET notificarticket = ? WHERE id = ?', [m.content, painelId], err => {
                            db_2.close();
                            if (err) {
                                m.reply('❌ Erro ao salvar a nova mensagem de notificação do ticket.');
                            } else {
                                m.reply('✅ Mensagem de notificação do ticket atualizada com sucesso!');
                            }
                        });
                    });
                    collector.on('end', collected => {
                        if (collected.size === 0) safeReply(interaction, { content: 'Tempo esgotado. Nenhuma alteração feita.', flags: 64 });
                    });
                });
                return;
            }
            // ...adicione outros handlers específicos aqui, sempre chamando funções auxiliares...
        } catch (err) {
            logError('main_handler', err);
            try { await safeReply(interaction,  { content: '❌ Erro inesperado ao processar interação.', flags: 64 }); } catch (e) { logError('main_handler_safereply', e); }
        }
    }
};

// Handlers auxiliares abaixo
// Função auxiliar para Mensagem Cancelamento
async function handleMsgCancelamento(interaction, painelId, logInfo, logError) {
    try {
        logInfo('handleMsgCancelamento', `Início handler. interaction.customId=${interaction.customId}, painelId=${painelId}`);
        const realPainelId = interaction.customId.replace('msg_cancelamento_', '');
        const db = new sqlite3.Database(dbPath);
        db.get('SELECT msg_cancelamento FROM paineis WHERE id = ?', [realPainelId], async (err, painel) => {
            db.close();
            if (err || !painel) {
                logError('handleMsgCancelamento_dbget', err || 'Painel não encontrado');
                await safeReply(interaction,  { content: '❌ Não foi possível buscar a mensagem de cancelamento.', flags: 64 });
                return;
            }
            logInfo('handleMsgCancelamento', `Painel encontrado. msg_cancelamento=${painel.msg_cancelamento}`);
            // Botão Voltar
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`mensagens_${realPainelId}`)
                    .setLabel('Voltar')
                    .setStyle(ButtonStyle.Secondary)
            );
            await safeReply(interaction,  {
                content: `Mensagem de cancelamento atual:\n\n${painel.msg_cancelamento || 'Não definida.'}\n\nATENÇÃO: O campo salvo no banco é msg_cancelamento, então o ID deste JSON é sempre "msg_cancelamento".\n\nEnvie um JSON contendo exatamente 2 botões para a mensagem de cancelamento.\n\nVocê pode usar as variáveis <user> e <ticket> no texto, que serão substituídas automaticamente.\n\nO custom_id dos botões deve ser:\n- msg_cancel-1\n- msg_cancel-2\n\nExemplo:\n\n\`\`\`json\n{\n  "content": "Seu ticket foi cancelado.",\n  "components": [\n    { "type": 2, "label": "OK", "style": 3, "custom_id": "msg_cancel-1" },\n    { "type": 2, "label": "Voltar", "style": 2, "custom_id": "msg_cancel-2" }\n  ]\n}\n\`\`\`\n\nClique em Voltar para retornar.`,
                components: [row],
                flags: 64
            });
            logInfo('handleMsgCancelamento', 'Mensagem enviada, iniciando collector.');
            // Coleta a próxima mensagem do usuário
            const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });
            collector.on('collect', m => {
                logInfo('handleMsgCancelamento_collector', `Mensagem recebida do usuário: ${m.content}`);
                let json;
                try {
                    json = JSON.parse(m.content);
                    if (!json.components || !Array.isArray(json.components) || json.components.length !== 2) {
                        logInfo('handleMsgCancelamento_collector', 'JSON components inválido.');
                        return m.reply('❌ O JSON deve conter exatamente 2 botões no array "components".');
                    }
                } catch (e) {
                    logError('handleMsgCancelamento_collector_json', e);
                    return m.reply('❌ JSON inválido. Tente novamente enviando um JSON válido.');
                }
                const db_2 = new sqlite3.Database(dbPath);
                db_2.run('UPDATE paineis SET msg_cancelamento = ? WHERE id = ?', [m.content, realPainelId], err => {
                    db_2.close();
                    if (err) {
                        logError('handleMsgCancelamento_db2run', err);
                        m.reply('❌ Erro ao salvar a nova mensagem de cancelamento.');
                    } else {
                        logInfo('handleMsgCancelamento_db2run', 'Mensagem de cancelamento atualizada com sucesso!');
                        m.reply('✅ Mensagem de cancelamento atualizada com sucesso!');
                    }
                });
            });
            collector.on('end', collected => {
                if (collected.size === 0) {
                    logInfo('handleMsgCancelamento_collector_end', 'Tempo esgotado, nenhuma mensagem recebida.');
                    try {
                        safeReply(interaction, { content: 'Tempo esgotado. Nenhuma alteração feita.', flags: 64 });
                    } catch (e) {
                        logError('handleMsgCancelamento_collector_end_followup', e);
                    }
                }
            });
        });
    } catch (err) {
        logError('handleMsgCancelamento_main', err);
        try { await safeReply(interaction,  { content: '❌ Erro inesperado ao processar mensagem de cancelamento.', flags: 64 }); } catch (e) { logError('handleMsgCancelamento_main_safereply', e); }
    }
}

async function handleNotificacaoPainel(interaction, painelId, logInfo, logError) {
    try {
        logInfo('handleNotificacaoPainel', `Início handler. interaction.customId=${interaction.customId}, painelId=${painelId}`);
        const realPainelId = interaction.customId.replace('notificacao_painel_', '');
        const db = new sqlite3.Database(dbPath);
        db.get('SELECT notificarticket FROM paineis WHERE id = ?', [realPainelId], async (err, painel) => {
            db.close();
            if (err || !painel) {
                logError('handleNotificacaoPainel_dbget', err || 'Painel não encontrado');
                await safeReply(interaction,  { content: '❌ Não foi possível buscar a mensagem de notificação do ticket.', flags: 64 });
                return;
            }
            logInfo('handleNotificacaoPainel', `Painel encontrado. notificarticket=${painel.notificarticket}`);
            // Botão Voltar
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`mensagens_${realPainelId}`)
                    .setLabel('Voltar')
                    .setStyle(ButtonStyle.Secondary)
            );
            await safeReply(interaction,  {
                content: `Mensagem de notificação do ticket atual:\n\n${painel.notificarticket || 'Não definida.'}\n\nATENÇÃO: O campo salvo no banco é notificarticket, então o ID deste JSON é sempre "notificarticket".\n\nEnvie um JSON válido para a mensagem de notificação do ticket (sem botões).\nVocê pode usar as variáveis <user> e <ticket> no texto, que serão substituídas automaticamente.\nExemplo:\n\n\`\`\`json\n{\n  "content": "Você foi notificado sobre o ticket."\n}\n\`\`\`\n\nClique em Voltar para retornar.`,
                components: [row],
                flags: 64
            });
            logInfo('handleNotificacaoPainel', 'Mensagem enviada, iniciando collector.');
            // Coleta a próxima mensagem do usuário
            const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });
            collector.on('collect', m => {
                logInfo('handleNotificacaoPainel_collector', `Mensagem recebida do usuário: ${m.content}`);
                let json;
                try {
                    json = JSON.parse(m.content);
                    if (json.components && Array.isArray(json.components) && json.components.length > 0) {
                        logInfo('handleNotificacaoPainel_collector', 'Usuário enviou components, rejeitando.');
                        return m.reply('❌ Não envie botões (array "components") para esta mensagem.');
                    }
                } catch (e) {
                    logError('handleNotificacaoPainel_collector_json', e);
                    return m.reply('❌ JSON inválido. Tente novamente enviando um JSON válido.');
                }
                const db_2 = new sqlite_3.Database(dbPath);
                db_2.run('UPDATE paineis SET notificarticket = ? WHERE id = ?', [m.content, realPainelId], err => {
                    db_2.close();
                    if (err) {
                        logError('handleNotificacaoPainel_db2run', err);
                        m.reply('❌ Erro ao salvar a nova mensagem de notificação do ticket.');
                    } else {
                        logInfo('handleNotificacaoPainel_db2run', 'Mensagem de notificação do ticket atualizada com sucesso!');
                        m.reply('✅ Mensagem de notificação do ticket atualizada com sucesso!');
                    }
                });
            });
            collector.on('end', collected => {
                if (collected.size === 0) {
                    logInfo('handleNotificacaoPainel_collector_end', 'Tempo esgotado, nenhuma mensagem recebida.');
                    try {
                        safeReply(interaction, { content: 'Tempo esgotado. Nenhuma alteração feita.', flags: 64 });
                    } catch (e) {
                        logError('handleNotificacaoPainel_collector_end_followup', e);
                    }
                }
            });
        });
    } catch (err) {
        logError('handleNotificacaoPainel_main', err);
        try { await safeReply(interaction,  { content: '❌ Erro inesperado ao processar mensagem de notificação do ticket.', flags: 64 }); } catch (e) { logError('handleNotificacaoPainel_main_safereply', e); }
    }
}

// Função auxiliar para Confirmar Info 1, 2, 3
async function handleConfirmarInfo(interaction, painelId, i, logInfo, logError) {
    try {
        logInfo('handleConfirmarInfo', `Início handler. interaction.customId=${interaction.customId}, painelId=${painelId}, i=${i}`);
        const db = new sqlite_3.Database(dbPath);
        db.get(`SELECT confirmar_info_${i} FROM paineis WHERE id = ?`, [painelId], async (err, painel) => {
            db.close();
            if (err || !painel) {
                logError('handleConfirmarInfo_dbget', err || 'Painel não encontrado');
                await safeReply(interaction,  { content: `❌ Não foi possível buscar a mensagem de confirmação de informações ${i}.`, flags: 64 });
                return;
            }
            logInfo('handleConfirmarInfo', `Painel encontrado. confirmar_info_${i}=${painel[`confirmar_info_${i}`]}`);
            // Botão Voltar
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`mensagens_${painelId}`)
                    .setLabel('Voltar')
                    .setStyle(ButtonStyle.Secondary)
            );
            await safeReply(interaction,  {
                content: `Mensagem de confirmação de informações ${i} atual:\n\n${painel[`confirmar_info_${i}`] || 'Não definida.'}\n\nATENÇÃO: O campo salvo no banco é confirmar_info_${i}, então o ID deste JSON é sempre "confirmar_info_${i}".\n\nEnvie um JSON válido contendo exatamente 2 botões no array "components".\n- O custom_id dos botões deve ser:\n  - confirmar_info${i}-1\n  - confirmar_info${i}-2\n\nVocê pode usar as variáveis <user> e <ticket> no texto, que serão substituídas automaticamente.\n\nExemplo:\n\n\`\`\`json\n{\n  "content": "Confirme suas informações.",\n  "components": [\n    { "type": 2, "label": "Confirmar", "style": 3, "custom_id": "confirmar_info${i}-1" },\n    { "type": 2, "label": "Editar", "style": 2, "custom_id": "confirmar_info${i}-2" }\n  ]\n}\n\`\`\`\n\nClique em Voltar para retornar.`,
                components: [row],
                flags: 64
            });
            logInfo('handleConfirmarInfo', 'Mensagem enviada, iniciando collector.');
            // Coleta a próxima mensagem do usuário
            const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });
            collector.on('collect', m => {
                logInfo('handleConfirmarInfo_collector', `Mensagem recebida do usuário: ${m.content}`);
                let json;
                try {
                    json = JSON.parse(m.content);
                    if (!json.components || !Array.isArray(json.components) || json.components.length !== 2) {
                        logInfo('handleConfirmarInfo_collector', 'JSON components inválido.');
                        return m.reply('❌ O JSON deve conter exatamente 2 botões no array "components".');
                    }
else if (json.components[0].custom_id !== `confirmar_info${i}-1` || json.components[1].custom_id !== `confirmar_info${i}-2`) {
                        logInfo('handleConfirmarInfo_collector', 'custom_id dos botões inválido.');
                        return m.reply(`❌ Os custom_id dos botões devem ser "confirmar_info${i}-1" e "confirmar_info${i}-2".`);
                    }
                } catch (e) {
                    logError('handleConfirmarInfo_collector_json', e);
                    return m.reply('❌ JSON inválido. Tente novamente enviando um JSON válido.');
                }
                const db_2 = new sqlite_3.Database(dbPath);
                db_2.run(`UPDATE paineis SET confirmar_info_${i} = ? WHERE id = ?`, [m.content, painelId], err => {
                    db_2.close();
                    if (err) {
                        logError('handleConfirmarInfo_db2run', err);
                        m.reply('❌ Erro ao salvar a nova mensagem de confirmação de informações.');
                    } else {
                        logInfo('handleConfirmarInfo_db2run', 'Mensagem de confirmação de informações atualizada com sucesso!');
                        m.reply('✅ Mensagem de confirmação de informações atualizada com sucesso!');
                    }
                });
            });
            collector.on('end', collected => {
                if (collected.size === 0) {
                    logInfo('handleConfirmarInfo_collector_end', 'Tempo esgotado, nenhuma mensagem recebida.');
                    try {
                        safeReply(interaction, { content: 'Tempo esgotado. Nenhuma alteração feita.', flags: 64 });
                    } catch (e) {
                        logError('handleConfirmarInfo_collector_end_followup', e);
                    }
                }
            });
        });
    } catch (err) {
        logError('handleConfirmarInfo_main', err);
        try { await safeReply(interaction,  { content: `❌ Erro inesperado ao processar mensagem de confirmação de informações ${i}.`, flags: 64 }); } catch (e) { logError('handleConfirmarInfo_main_safereply', e); }
    }
}

// Handler do menu principal de mensagens
async function handleMenuMensagens(interaction, painelId, logInfo, logError) {
    logInfo('menu_mensagens', `Handler 'handleMenuMensagens' aberto para painelId=${painelId} por user=${interaction.user?.id}`);
    logInfo('menu_mensagens', `Exibindo menu de grupos de mensagens para painelId=${painelId}`);
    try {
        const row_1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`mensagens_1_${painelId}`)
                .setLabel('Mensagens 1')
                .setStyle(ButtonStyle.Primary)
        );
        const row_2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`mensagens_2_${painelId}`)
                .setLabel('Mensagens 2')
                .setStyle(ButtonStyle.Primary)
        );
        const row_3 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`mensagens_3_${painelId}`)
                .setLabel('Mensagens 3')
                .setStyle(ButtonStyle.Primary)
        );
        const row_4 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`mensagens_4_${painelId}`)
                .setLabel('Mensagens 4')
                .setStyle(ButtonStyle.Primary)
        );
        const rowVoltar = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`painel_${painelId}`)
                .setLabel('Voltar')
                .setStyle(ButtonStyle.Secondary)
        );
        await safeReply(interaction,  {
            content: `Ticket do painel [${painelId}]. Escolha o grupo de mensagens para editar:`,
            components: [row_1, row_2, row_3, row_4, rowVoltar],
            flags: 64
        });
        logInfo('menu_mensagens', 'Menu de grupos de mensagens enviado com sucesso.');
    } catch (err) {
        logError('menu_mensagens', err);
        try { await safeReply(interaction,  { content: '❌ Erro ao exibir menu de mensagens.', flags: 64 }); } catch (e) { logError('menu_mensagens_safereply', e); }
    }
}

// Handler do menu principal do painel
async function handleMenuPrincipal(interaction, painelId, logInfo, logError) {
    logInfo('menu_principal', `Handler 'handleMenuPrincipal' aberto para painelId=${painelId} por user=${interaction.user?.id}`);
    logInfo('menu_principal', `Exibindo menu principal do painel para painelId=${painelId}`);
    try {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`painel_${painelId}`)
                .setLabel('Painel')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`ticket_${painelId}`)
                .setLabel('Ticket')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId(`config${painelId}`)
                .setLabel('Configurações')
                .setStyle(ButtonStyle.Success)
        );
        await safeReply(interaction,  {
            content: `Opções do painel [${painelId}]:`,
            components: [row],
            flags: 64
        });
        logInfo('menu_principal', 'Menu principal do painel enviado com sucesso.');
    } catch (err) {
        logError('menu_principal', err);
        try { await safeReply(interaction,  { content: '❌ Erro ao exibir menu principal do painel.', flags: 64 }); } catch (e) { logError('menu_principal_safereply', e); }
    }
}

// Handler do grupo Mensagens 1
        // Handler para Carregando Ticket
        // ...existing code...
        // Handler para Mensagem Infos 1, 2, 3
        for (let i = 1; i <= 3; i++) {
            if (typeof interaction !== 'undefined' && interaction.customId === `msg_infos_${i}_${painelId}`) {
                if (// ⚠️ POSSÍVEL ESCOPAMENTO INCORRETO
typeof handleMsgInfos === 'function') {
                    return handleMsgInfos(interaction, painelId, i, logInfo, logError);
                }
                return;
            }
        }
// Handler modular para Mensagem Infos 1, 2, 3
async function handleMsgInfos(interaction, painelId, i, logInfo, logError) {
    logInfo(`msg_infos_${i}`, `Botão 'Mensagem Infos ${i}' clicado para painelId=${painelId} por user=${interaction.user?.id}`);
    try {
        const db = new sqlite_3.Database(dbPath);
        db.get(`SELECT info_${i} FROM paineis WHERE id = ?`, [painelId], async (err, painel) => {
            db.close();
            if (err || !painel) {
                logError(`msg_infos_${i}_db_get`, err || 'Painel não encontrado');
                return safeReply(interaction,  { content: `❌ Não foi possível buscar a mensagem de informações ${i}.`, flags: 64 });
            }
            // Botão Voltar
            let row;
            try {
                logInfo(`msg_infos_${i}`, 'Criando botão Voltar...');
                row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`mensagens_${painelId}`)
                        .setLabel('Voltar')
                        .setStyle(ButtonStyle.Secondary)
                );
            } catch (err) {
                logError(`msg_infos_${i}_row`, err);
                try { await safeReply(interaction,  { content: '❌ Erro ao criar botão Voltar.', flags: 64 }); } catch (e) { logError(`msg_infos_${i}_row_safereply`, e); }
                return;
            }
            try {
                logInfo(`msg_infos_${i}`, 'Enviando mensagem de informações para interaction...');
                await safeReply(interaction,  {
                    content: `Mensagem de informações ${i} atual:\n\n${painel[`info_${i}`] || 'Não definida.'}\n\nATENÇÃO: O campo salvo no banco é info_${i}, então o ID deste JSON é sempre "info_${i}".\n\nEnvie um JSON válido para a mensagem de informações, sem nenhum botão (não envie o campo "components").\n\nVocê pode usar as variáveis <user> e <ticket> no texto, que serão substituídas automaticamente.\n\nExemplo:\n\n\`\`\`json\n{\n  "content": "Digite aqui as informações do cliente."\n}\n\`\`\`\n\nClique em Voltar para retornar.`,
                    components: [row],
                    flags: 64
                });
                logInfo(`msg_infos_${i}`, 'Mensagem enviada com sucesso. Iniciando coleta de mensagem do usuário...');
            } catch (err) {
                logError(`msg_infos_${i}_safereply`, err);
                try { await safeReply(interaction,  { content: '❌ Erro ao exibir mensagem de informações.', flags: 64 }); } catch (e) { logError(`msg_infos_${i}_safereply_fallback`, e); }
                return;
            }
            // Coleta a próxima mensagem do usuário
            const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });
            collector.on('collect', m => {
                logInfo(`msg_infos_${i}`, `Mensagem coletada do usuário ${m.author.id}: ${m.content}`);
                let json;
                try {
                    json = JSON.parse(m.content);
                    if (json.components) {
                        logInfo(`msg_infos_${i}`, 'Usuário enviou campo components, rejeitando...');
                        return m.reply('❌ Não envie botões (campo "components") para esta mensagem.');
                    }
                } catch (e) {
                    logError(`msg_infos_${i}_json_parse`, e);
                    return m.reply('❌ JSON inválido. Tente novamente enviando um JSON válido.');
                }
                const db_2 = new sqlite_3.Database(dbPath);
                db_2.run(`UPDATE paineis SET info_${i} = ? WHERE id = ?`, [m.content, painelId], err => {
                    db_2.close();
                    if (err) {
                        logError(`msg_infos_${i}_db_update`, err);
                        m.reply('❌ Erro ao salvar a nova mensagem de informações.');
                    } else {
                        logInfo(`msg_infos_${i}`, 'Mensagem de informações atualizada com sucesso no banco.');
                        m.reply('✅ Mensagem de informações atualizada com sucesso!');
                    }
                });
            });
            collector.on('end', collected => {
                if (collected.size === 0) {
                    logInfo(`msg_infos_${i}`, 'Tempo esgotado para coleta de mensagem do usuário.');
                    try {
                        safeReply(interaction, { content: 'Tempo esgotado. Nenhuma alteração feita.', flags: 64 });
                    } catch (e) {
                        logError(`msg_infos_${i}_collector_end_followup`, e);
                    }
                }
            });
        });
    } catch (err) {
        logError(`msg_infos_${i}_main`, err);
        try { await safeReply(interaction,  { content: '❌ Erro inesperado ao processar mensagem de informações.', flags: 64 }); } catch (e) { logError(`msg_infos_${i}_main_safereply`, e); }
    }
}
        // Handler para Mensagem Confirmar Compra
        if (typeof interaction !== 'undefined' && interaction.customId === `msg_confirmar_compra_${painelId}`) {
            // Handler duplicado removido. Use apenas a versão modular.
            // Corrigido: não retorna vazio, chama handler modular se existir
            if (// ⚠️ POSSÍVEL ESCOPAMENTO INCORRETO
typeof handleMsgConfirmarCompra === 'function') {
                return handleMsgConfirmarCompra(interaction, painelId, logInfo, logError);
            }
            return;
        }
        // Handler duplicado para msg_carrinho_ removido (já existe handler para msg_carrinho_ abaixo)
        // Handler para voltar ao menu de grupos de mensagens (Mensagens 1-4)
        if (typeof interaction !== 'undefined' && interaction.customId === `mensagens_${painelId}`) {
            logInfo('mensagens_menu', `Botão 'Voltar para grupos de mensagens' clicado para painelId=${painelId} por user=${interaction.user?.id}`);
            (async () => {
                try {
                    const rows = [
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId(`mensagens_1_${painelId}`)
                                .setLabel('Mensagens 1')
                                .setStyle(ButtonStyle.Primary)
                        ),
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId(`mensagens_2_${painelId}`)
                                .setLabel('Mensagens 2')
                                .setStyle(ButtonStyle.Primary)
                        ),
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId(`mensagens_3_${painelId}`)
                                .setLabel('Mensagens 3')
                                .setStyle(ButtonStyle.Primary)
                        ),
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId(`mensagens_4_${painelId}`)
                                .setLabel('Mensagens 4')
                                .setStyle(ButtonStyle.Primary)
                        ),
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId(`painel_${painelId}`)
                                .setLabel('Voltar')
                                .setStyle(ButtonStyle.Secondary)
                        )
                    ];
                    await safeReply(interaction,  { content: `Ticket do painel [${painelId}]. Escolha o grupo de mensagens para editar:`, components: rows, flags: 64 });
                    logInfo('mensagens_menu', 'Menu de grupos de mensagens enviado com sucesso.');
                } catch (err) {
                    logError('mensagens_menu', err);
                    try { await safeReply(interaction,  { content: '❌ Erro ao exibir menu de mensagens.', flags: 64 }); } catch (e) { logError('mensagens_menu_safereply', e); }
                }
            })();
            return;
        }
        // Se o botão clicado for Mensagem Carrinho
        // Handler duplicado para msg_carrinho_ removido (já existe handler para msg_carrinho_ abaixo)
        // Se o botão clicado for Voltar, volta para a seleção de opções anterior (Painel, Ticket, Configurações)
        if (typeof interaction !== 'undefined' && interaction.customId === `painel_${painelId}`) {
            logInfo('voltar_painel', `Botão 'Voltar Painel' clicado para painelId=${painelId} por user=${interaction.user?.id}`);
            (async () => {
                try {
                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`painel_${painelId}`)
                            .setLabel('Painel')
                            .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                            .setCustomId(`ticket_${painelId}`)
                            .setLabel('Ticket')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId(`config_${painelId}`)
                            .setLabel('Configurações')
                            .setStyle(ButtonStyle.Success)
                    );
                    await safeReply(interaction,  { content: `Opções do painel [${painelId}]:`, components: [row], flags: 64 });
                    logInfo('voltar_painel', 'Menu principal do painel enviado com sucesso.');
                } catch (err) {
                    logError('voltar_painel', err);
                    try { await safeReply(interaction,  { content: '❌ Erro ao exibir menu principal do painel.', flags: 64 }); } catch (e) { logError('voltar_painel_safereply', e); }
                }
            })();
            return;
        }
        // Menu principal de mensagens (mensagens_*) não deve ser acessível diretamente, apenas via Ticket
        // (Bloco removido para impedir acesso via botão intermediário 'Mensagens')
        // Se o botão clicado for Mensagem inicial
        if (typeof interaction !== 'undefined' && interaction.customId.startsWith('msg_inicial_')) {
            const painelId = interaction.customId.replace('msg_inicial_', '');
            const db = new sqlite_3.Database(dbPath);
            db.get('SELECT msg_inicial FROM paineis WHERE id = ?', [painelId], async (err, painel) => {
                db.close();
                if (err || !painel) {
                    return safeReply(interaction,  { content: '❌ Não foi possível buscar a mensagem inicial.', flags: 64 });
                }
                // Botão Voltar
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`mensagens_${painelId}`)
                        .setLabel('Voltar')
                        .setStyle(ButtonStyle.Secondary)
                );
                await safeReply(interaction,  {
            content: `Mensagem inicial atual:\n\n${painel.msg_inicial || 'Não definida.'}\n\nATENÇÃO: O campo salvo no banco é msg_inicial, então o ID deste JSON é sempre "msg_inicial".\n\nEnvie um JSON contendo exatamente 2 botões para a mensagem inicial.\n\nVocê pode usar as variáveis <user> e <ticket> no texto, que serão substituídas automaticamente.\n\nO custom_id dos botões deve ser:\n- msg_inicial-1\n- msg_inicial-2\n\nExemplo:\n\n\`\`\`json\n{\n  "content": "Bem-vindo!",\n  "components": [\n    { "type": 2, "label": "Botão 1", "style": 1, "custom_id": "msg_inicial-1" },\n    { "type": 2, "label": "Botão 2", "style": 2, "custom_id": "msg_inicial-2" }\n  ]\n}\n\`\`\`\n\nClique em Voltar para retornar.`,
                    components: [row],
                    flags: 64
                });
                // Coleta a próxima mensagem do usuário
                const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
                const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });
                collector.on('collect', m => {
                    let json;
                    try {
                        json = JSON.parse(m.content);
                        if (!json.components || !Array.isArray(json.components) || json.components.length !== 2) {
                            return m.reply('❌ O JSON deve conter exatamente 2 botões no array "components".');
                        }
                    } catch (e) {
                        return m.reply('❌ JSON inválido. Tente novamente enviando um JSON válido.');
                    }
                    const db_2 = new sqlite_3.Database(dbPath);
                    db_2.run('UPDATE paineis SET msg_inicial = ? WHERE id = ?', [m.content, painelId], err => {
                        db_2.close();
                        if (err) {
                            m.reply('❌ Erro ao salvar a nova mensagem inicial.');
                        } else {
                            m.reply('✅ Mensagem inicial atualizada com sucesso!');
                        }
                    });
                });
                collector.on('end', collected => {
                    if (collected.size === 0) safeReply(interaction, { content: 'Tempo esgotado. Nenhuma alteração feita.', flags: 64 });
                });
            });
            return;
        }
        // Se o botão clicado for Mensagem Cancelar Ticket
        if (typeof interaction !== 'undefined' && interaction.customId.startsWith('msg_cancelar_ticket_')) {
            const painelId = interaction.customId.replace('msg_cancelar_ticket_', '');
            const db = new sqlite_3.Database(dbPath);
            db.get('SELECT msg_cancelar_ticket FROM paineis WHERE id = ?', [painelId], async (err, painel) => {
                db.close();
                if (err || !painel) {
                    return safeReply(interaction,  { content: '❌ Não foi possível buscar a mensagem de cancelar ticket.', flags: 64 });
                }
                // Botão Voltar
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`mensagens_${painelId}`)
                        .setLabel('Voltar')
                        .setStyle(ButtonStyle.Secondary)
                );
                await safeReply(interaction,  {
            content: `Mensagem de cancelar ticket atual:\n\n${painel.msg_cancelar_ticket || 'Não definida.'}\n\nATENÇÃO: O campo salvo no banco é msg_cancelar_ticket, então o ID deste JSON é sempre "msg_cancelar_ticket".\n\nEnvie um JSON contendo exatamente 2 botões para a mensagem de cancelar ticket.\n\nVocê pode usar as variáveis <user> e <ticket> no texto, que serão substituídas automaticamente.\n\nO custom_id dos botões deve ser:\n- cancel_ticket-1\n- cancel_ticket-2\n\nExemplo:\n\n\`\`\`json\n{\n  "content": "Tem certeza que deseja cancelar o ticket?",\n  "components": [\n    { "type": 2, "label": "Sim, cancelar", "style": 4, "custom_id": "cancel_ticket-1" },\n    { "type": 2, "label": "Não, voltar", "style": 2, "custom_id": "cancel_ticket-2" }\n  ]\n}\n\`\`\`\n\nClique em Voltar para retornar.`,
                    components: [row],
                    flags: 64
                });
                // Coleta a próxima mensagem do usuário
                const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
                const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });
                collector.on('collect', m => {
                    let json;
                    try {
                        json = JSON.parse(m.content);
                        if (!json.components || !Array.isArray(json.components) || json.components.length !== 2) {
                            return m.reply('❌ O JSON deve conter exatamente 2 botões no array "components".');
                        }
                    } catch (e) {
                        return m.reply('❌ JSON inválido. Tente novamente enviando um JSON válido.');
                    }
                    const db_2 = new sqlite_3.Database(dbPath);
                    db_2.run('UPDATE paineis SET msg_cancelar_ticket = ? WHERE id = ?', [m.content, painelId], err => {
                        db_2.close();
                        if (err) {
                            m.reply('❌ Erro ao salvar a nova mensagem de cancelar ticket.');
                        } else {
                            m.reply('✅ Mensagem de cancelar ticket atualizada com sucesso!');
                        }
                    });
                });
                collector.on('end', collected => {
                    if (collected.size === 0) safeReply(interaction, { content: 'Tempo esgotado. Nenhuma alteração feita.', flags: 64 });
                });
            });
            return;
        }
        // Handler para Info-Padrão 1, 2, 3
        for (let i = 1; i <= 3; i++) {
            if (typeof interaction !== 'undefined' && interaction.customId === `info-padrao_${i}_${painelId}`) {
                if (// ⚠️ POSSÍVEL ESCOPAMENTO INCORRETO
typeof handleInfoPadrao === 'function') {
                    return handleInfoPadrao(interaction, painelId, i, logInfo, logError);
                }
                return;
            }
        }

        // Handler para Info-Padronizada 1, 2, 3 (sem botões)
        for (let i = 1; i <= 3; i++) {
            if (typeof interaction !== 'undefined' && interaction.customId === `info-padronizada_${i}_${painelId}`) {
                if (// ⚠️ POSSÍVEL ESCOPAMENTO INCORRETO
typeof handleInfoPadronizada === 'function') {
                    return handleInfoPadronizada(interaction, painelId, i, logInfo, logError);
                }
                return;
            }
        }
// Handler modular para Mensagem Confirmar Compra
async function handleMsgConfirmarCompra(interaction, painelId, logInfo, logError) {
    const db = new sqlite3.Database(dbPath);
    db.get('SELECT msg_confirmar_compra FROM paineis WHERE id = ?', [painelId], async (err, painel) => {
        db.close();
        if (err || !painel) {
            return safeReply(interaction,  { content: '❌ Não foi possível buscar a mensagem de confirmação de compra.', flags: 64 });
        }
        // Botão Voltar
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`mensagens_${painelId}`)
                .setLabel('Voltar')
                .setStyle(ButtonStyle.Secondary)
        );
        await safeReply(interaction,  {
            content: `Mensagem de confirmação de compra atual:\n\n${painel.msg_confirmar_compra || 'Não definida.'}\n\nATENÇÃO: O campo salvo no banco é msg_confirmar_compra, então o ID deste JSON é sempre "msg_confirmar_compra".\n\nEnvie um JSON contendo exatamente 2 botões para a mensagem de confirmação de compra.\n\nVocê pode usar as variáveis <user> e <ticket> no texto, que serão substituídas automaticamente.\n\nO custom_id dos botões deve ser:\n- msg_confirmar_compra-1\n- msg_confirmar_compra-2\n\nExemplo:\n\n\`\`\`json\n{\n  "content": "Deseja confirmar a compra?",\n  "components": [\n    { "type": 2, "label": "Sim", "style": 3, "custom_id": "msg_confirmar_compra-1" },\n    { "type": 2, "label": "Não", "style": 2, "custom_id": "msg_confirmar_compra-2" }\n  ]\n}\n\`\`\`\n\nClique em Voltar para retornar.`,
            components: [row],
            flags: 64
        });
        // Coleta a próxima mensagem do usuário
        const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
        const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });
        collector.on('collect', m => {
            let json;
            try {
                json = JSON.parse(m.content);
                if (!json.components || !Array.isArray(json.components) || json.components.length !== 2) {
                    return m.reply('❌ O JSON deve conter exatamente 2 botões no array "components".');
                }
            } catch (e) {
                return m.reply('❌ JSON inválido. Tente novamente enviando um JSON válido.');
            }
            const db_2 = new sqlite3.Database(dbPath);
            db_2.run('UPDATE paineis SET msg_confirmar_compra = ? WHERE id = ?', [m.content, painelId], err => {
                db_2.close();
                if (err) {
                    m.reply('❌ Erro ao salvar a nova mensagem de confirmação de compra.');
                } else {
                    m.reply('✅ Mensagem de confirmação de compra atualizada com sucesso!');
                }
            });
        });
        collector.on('end', collected => {
            if (collected.size === 0) safeReply(interaction, { content: 'Tempo esgotado. Nenhuma alteração feita.', flags: 64 });
        });
    });
}

// Handler modular para Info-Padrão 1, 2, 3
async function handleInfoPadrao(interaction, painelId, i, logInfo, logError) {
    const db = new sqlite3.Database(dbPath);
    db.get(`SELECT info_padrao_${i} FROM paineis WHERE id = ?`, [painelId], async (err, painel) => {
        db.close();
        if (err || !painel) {
            return safeReply(interaction,  { content: `❌ Não foi possível buscar a mensagem Info-Padrão ${i}.`, flags: 64 });
        }
        // Botão Voltar
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`mensagens_${painelId}`)
                .setLabel('Voltar')
                .setStyle(ButtonStyle.Secondary)
        );
        await safeReply(interaction,  {
            content: `Mensagem Info-Padrão ${i} atual:\n\n${painel[`info_padrao_${i}`] || 'Não definida.'}\n\nATENÇÃO: O campo salvo no banco é info_padrao_${i}, então o ID deste JSON é sempre "info_padrao_${i}".\n\nEnvie um JSON válido contendo exatamente 2 botões no array "components".\n- O custom_id dos botões deve ser:\n  - info_padrao${i}-1\n  - info_padrao${i}-2\n\nVocê pode usar as variáveis <user> e <ticket> no texto, que serão substituídas automaticamente.\n\nExemplo:\n\n\`\`\`json\n{\n  "content": "Mensagem padrão de informação.",\n  "components": [\n    { "type": 2, "label": "Botão 1", "style": 1, "custom_id": "info_padrao${i}-1" },\n    { "type": 2, "label": "Botão 2", "style": 2, "custom_id": "info_padrao${i}-2" }\n  ]\n}\n\`\`\`\n\nClique em Voltar para retornar.`,
            components: [row],
            flags: 64
        });
        // Coleta a próxima mensagem do usuário
        const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
        const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });
        collector.on('collect', m => {
            let json;
            try {
                json = JSON.parse(m.content);
                if (!json.components || !Array.isArray(json.components) || json.components.length !== 2) {
                    return m.reply('❌ O JSON deve conter exatamente 2 botões no array "components".');
                }
else if (json.components[0].custom_id !== `info_padrao${i}-1` || json.components[1].custom_id !== `info_padrao${i}-2`) {
                    return m.reply(`❌ Os custom_id dos botões devem ser "info_padrao${i}-1" e "info_padrao${i}-2".`);
                }
            } catch (e) {
                return m.reply('❌ JSON inválido. Tente novamente enviando um JSON válido.');
            }
            const db_2 = new sqlite3.Database(dbPath);
            db_2.run(`UPDATE paineis SET info_padrao_${i} = ? WHERE id = ?`, [m.content, painelId], err => {
                db_2.close();
                if (err) {
                    m.reply('❌ Erro ao salvar a nova mensagem Info-Padrão.');
                } else {
                    m.reply('✅ Mensagem Info-Padrão atualizada com sucesso!');
                }
            });
        });
        collector.on('end', collected => {
            if (collected.size === 0) safeReply(interaction, { content: 'Tempo esgotado. Nenhuma alteração feita.', flags: 64 });
        });
    });
}

// Handler modular para Info-Padronizada 1, 2, 3 (sem botões)
async function handleInfoPadronizada(interaction, painelId, i, logInfo, logError) {
    const db = new sqlite3.Database(dbPath);
    db.get(`SELECT info_padronizada_${i} FROM paineis WHERE id = ?`, [painelId], async (err, painel) => {
        db.close();
        if (err || !painel) {
            return safeReply(interaction,  { content: `❌ Não foi possível buscar a mensagem Info-Padronizada ${i}.`, flags: 64 });
        }
        // Botão Voltar
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`mensagens_${painelId}`)
                .setLabel('Voltar')
                .setStyle(ButtonStyle.Secondary)
        );
        await safeReply(interaction,  {
            content: `Mensagem Info-Padronizada ${i} atual:\n\n${painel[`info_padronizada_${i}`] || 'Não definida.'}\n\nATENÇÃO: O campo salvo no banco é info_padronizada_${i}, então o ID deste JSON é sempre "info_padronizada_${i}".\n\nEnvie um JSON válido para a mensagem Info-Padronizada, sem nenhum botão (não envie o campo "components").\n\nVocê pode usar as variáveis <user> e <ticket> no texto, que serão substituídas automaticamente.\n\nExemplo:\n\n\`\`\`json\n{\n  "content": "Mensagem padronizada de informação.\nSem botões."\n}\n\`\`\`\n\nClique em Voltar para retornar.`,
            components: [row],
            flags: 64
        });
        // Coleta a próxima mensagem do usuário
        const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
        const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });
        collector.on('collect', m => {
            let json;
            try {
                json = JSON.parse(m.content);
                if (json.components) {
                    return m.reply('❌ Não envie botões (campo "components") para esta mensagem.');
                }
            } catch (e) {
                return m.reply('❌ JSON inválido. Tente novamente enviando um JSON válido.');
            }
            const db_2 = new sqlite3.Database(dbPath);
            db_2.run(`UPDATE paineis SET info_padronizada_${i} = ? WHERE id = ?`, [m.content, painelId], err => {
                db_2.close();
                if (err) {
                    m.reply('❌ Erro ao salvar a nova mensagem Info-Padronizada.');
                } else {
                    m.reply('✅ Mensagem Info-Padronizada atualizada com sucesso!');
                }
            });
        });
        collector.on('end', collected => {
            if (collected.size === 0) safeReply(interaction, { content: 'Tempo esgotado. Nenhuma alteração feita.', flags: 64 });
        });
    });
}
        // Se o botão clicado for Mensagem Cancelamento
        // Se o botão clicado for Notificar Ticket
        if (typeof interaction !== 'undefined' && interaction.customId.startsWith('notificacao_painel_')) {
            const painelId = interaction.customId.replace('notificacao_painel_', '');
    const db = new sqlite3.Database(dbPath);
            db.get('SELECT notificarticket FROM paineis WHERE id = ?', [painelId], async (err, painel) => {
                db.close();
                if (err || !painel) {
                    return safeReply(interaction,  { content: '❌ Não foi possível buscar a mensagem de notificação do ticket.', flags: 64 });
                }
                // Botão Voltar
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`mensagens_${painelId}`)
                        .setLabel('Voltar')
                        .setStyle(ButtonStyle.Secondary)
                );
                await safeReply(interaction,  {
            content: `Mensagem de notificação do ticket atual:\n\n${painel.notificarticket || 'Não definida.'}\n\nATENÇÃO: O campo salvo no banco é notificarticket, então o ID deste JSON é sempre "notificarticket".\n\nEnvie um JSON válido para a mensagem de notificação do ticket (sem botões).\nVocê pode usar as variáveis <user> e <ticket> no texto, que serão substituídas automaticamente.\nExemplo:\n\n\`\`\`json\n{\n  "content": "Você foi notificado sobre o ticket."\n}\n\`\`\`\n\nClique em Voltar para retornar.`,
                    components: [row],
                    flags: 64
                });
                // Coleta a próxima mensagem do usuário
                const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
                const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });
                collector.on('collect', m => {
                    let json;
                    try {
                        json = JSON.parse(m.content);
                        if (json.components && Array.isArray(json.components) && json.components.length > 0) {
                            return m.reply('❌ Não envie botões (array "components") para esta mensagem.');
                        }
                    } catch (e) {
                        return m.reply('❌ JSON inválido. Tente novamente enviando um JSON válido.');
                    }
            const db_2 = new sqlite3.Database(dbPath);
                    db_2.run('UPDATE paineis SET notificarticket = ? WHERE id = ?', [m.content, painelId], err => {
                        db_2.close();
                        if (err) {
                            m.reply('❌ Erro ao salvar a nova mensagem de notificação do ticket.');
                        } else {
                            m.reply('✅ Mensagem de notificação do ticket atualizada com sucesso!');
                        }
                    });
                });
                collector.on('end', collected => {
                    if (collected.size === 0) safeReply(interaction, { content: 'Tempo esgotado. Nenhuma alteração feita.', flags: 64 });
                });
            });
            return;
        }
// Fim do arquivo


async function handle(interaction, painelId) {
    const log = (ctx, ...msg) => console.log(`[${ctx}]`, ...msg);
    const error = (ctx, err) => console.error(`[${ctx}]`, err?.stack || err);

    try {
        const id = interaction.customId;
        log('ticket-button-handle', `interaction.customId: ${id} | painelId: ${painelId}`);

        if (id === `ticket_${painelId}`) return await handleMenuMensagens(interaction, painelId, log, error);
        else if (id === `painel_${painelId}`) return await handleMenuPrincipal(interaction, painelId, log, error);
        else if (id === `mensagens_1_${painelId}`) return await handleMensagens1(interaction, painelId, log, error);
        else if (id === `mensagens_2_${painelId}`) return await handleMensagens2(interaction, painelId, log, error);
        else if (id === `mensagens_3_${painelId}`) return await handleMensagens3(interaction, painelId, log, error);
        else if (id === `mensagens_4_${painelId}`) return await handleMensagens4(interaction, painelId, log, error);

        else if (id === `mensagens${painelId}`) return await voltarParaMenuMensagens(interaction, painelId, log, error);

        // Handlers dinâmicos por prefixo
        else if (id.startsWith(`msg_inicial_`)) return await handleMsgInicial(interaction, painelId, log, error);
        else if (id.startsWith(`msg_cancelamento_`)) return await handleMsgCancelamento(interaction, painelId, log, error);
        else if (id.startsWith(`msg_cancelar_ticket_`)) return await handleMsgCancelarTicket(interaction, painelId, log, error);
        else if (id.startsWith(`notificacao_painel_`)) return await handleNotificacaoPainel(interaction, painelId, log, error);
        else if (id.startsWith(`msg_carrinho_`)) return await handleMsgCarrinho(interaction, painelId, log, error);
        else if (id.startsWith(`msg_produtos_`)) return await handleMsgProdutos(interaction, painelId, log, error);
        else if (id.startsWith(`msg_info_`)) {
            for (let i = 1; i <= 3; i++) {
                if (id === `msg_info_${i}_${painelId}`) return await handleMsgInfo(interaction, painelId, i, log, error);
            }
        }
        else if (id.startsWith(`msg_info_padronizado_`)) {
            for (let i = 1; i <= 3; i++) {
                if (id === `msg_info_padronizado_${i}_${painelId}`) return await handleMsgInfoPadronizado(interaction, painelId, i, log, error);
            }
        }
        else if (id.startsWith(`msg_info_padrao_`)) {
            for (let i = 1; i <= 3; i++) {
                if (id === `msg_info_padrao_${i}_${painelId}`) return await handleInfoPadrao(interaction, painelId, i, log, error);
            }
        }
        else if (id.startsWith(`msg_confirmar_info_`)) {
            for (let i = 1; i <= 3; i++) {
                if (id === `msg_confirmar_info_${i}_${painelId}`) return await handleConfirmarInfo(interaction, painelId, i, log, error);
            }
        }
        else if (id.startsWith(`timeout_`)) {
            for (let i = 1; i <= 4; i++) {
                if (id === `timeout_${i}_${painelId}`) {
                    // Chama handler do arquivo time-out.js
                    const timeoutHandler = require('./time-out');
                    return await timeoutHandler.handle(interaction, painelId, i, log, error);
                }
            }
        }
        else if (id.startsWith(`msg_metodos_pagamento_`)) {
            // Chama handler do arquivo metodos-pagamento-handle.js
            const metodosPagamento = require('./metodos-pagamento-handle');
            return await metodosPagamento.handle(interaction, painelId, log, error);
        }
        else if (id.startsWith(`msg_realizar_pagamento_`)) {
            return await handleMsgRealizarPagamento(interaction, painelId, log, error);
        }

        for (let i = 1; i <= 3; i++) {
            if (id === `msg_infos_${i}_${painelId}`) return await handleMsgInfos(interaction, painelId, i, log, error);
            if (id === `confirmar_info_${i}_${painelId}`) return await handleConfirmarInfo(interaction, painelId, i, log, error);
            if (id === `info-padrao_${i}_${painelId}`) return await handleInfoPadrao(interaction, painelId, i, log, error);
            if (id === `info-padronizada_${i}_${painelId}`) return await handleInfoPadronizada(interaction, painelId, i, log, error);
        }

        await safeReply(interaction,  { content: '❌ Botão não reconhecido.', flags: 64 });
    } catch (err) {
        error('main_handle', err);
        try { await safeReply(interaction,  { content: '❌ Erro inesperado ao processar interação.', flags: 64 }); }
        catch (e) { error('main_handle_reply', e); }
    }
}

async function handleMensagens1(interaction, painelId, log, error) {
    log('mensagens_1', `Abrindo Mensagens 1 para painelId=${painelId}`);
    try {
        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`notificacao_painel_${painelId}`).setLabel('Notificação Painel').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`msg_inicial_${painelId}`).setLabel('Msg Inicial').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`msg_cancelamento_${painelId}`).setLabel('Msg Cancelamento').setStyle(ButtonStyle.Danger)
        );
        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`msg_cancelar_ticket_${painelId}`).setLabel('Msg Cancelar Ticket').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`msg_carrinho_${painelId}`).setLabel('Msg Carrinho').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`msg_produtos_${painelId}`).setLabel('Msg Produtos').setStyle(ButtonStyle.Primary)
        );
        const row3 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`mensagens_${painelId}`).setLabel('Voltar').setStyle(ButtonStyle.Secondary)
        );
        await safeReply(interaction,  {
            content: `📝 Mensagens 1 do painel [${painelId}]`,
            components: [row1, row2, row3],
            flags: 64
        });
    } catch (err) {
        error('mensagens_1', err);
    }
}

async function handleMensagens2(interaction, painelId, log, error) {
    log('mensagens_2', `Abrindo Mensagens 2 para painelId=${painelId}`);
    try {
        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`msg_info_1_${painelId}`).setLabel('Msg Info 1').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`msg_info_2_${painelId}`).setLabel('Msg Info 2').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`msg_info_3_${painelId}`).setLabel('Msg Info 3').setStyle(ButtonStyle.Primary)
        );
        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`msg_info_padronizado_1_${painelId}`).setLabel('Msg Info Padronizado 1').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`msg_info_padronizado_2_${painelId}`).setLabel('Msg Info Padronizado 2').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`msg_info_padronizado_3_${painelId}`).setLabel('Msg Info Padronizado 3').setStyle(ButtonStyle.Primary)
        );
        const row3 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`mensagens_${painelId}`).setLabel('Voltar').setStyle(ButtonStyle.Secondary)
        );
        await safeReply(interaction,  {
            content: `📝 Mensagens 2 do painel [${painelId}]`,
            components: [row1, row2, row3],
            flags: 64
        });
    } catch (err) {
        error('mensagens_2', err);
    }
}

async function handleMensagens3(interaction, painelId, log, error) {
    log('mensagens_3', `Abrindo Mensagens 3 para painelId=${painelId}`);
    try {
        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`msg_info_padrao_1_${painelId}`).setLabel('Msg Info Padrão 1').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`msg_info_padrao_2_${painelId}`).setLabel('Msg Info Padrão 2').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId(`msg_info_padrao_3_${painelId}`).setLabel('Msg Info Padrão 3').setStyle(ButtonStyle.Secondary)
        );
        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`msg_confirmar_info_1_${painelId}`).setLabel('Msg Confirmar Info 1').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`msg_confirmar_info_2_${painelId}`).setLabel('Msg Confirmar Info 2').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`msg_confirmar_info_3_${painelId}`).setLabel('Msg Confirmar Info 3').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`msg_confirmar_compra_${painelId}`).setLabel('Msg Confirmar Compra').setStyle(ButtonStyle.Primary)
        );
        const row3 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`mensagens_${painelId}`).setLabel('Voltar').setStyle(ButtonStyle.Secondary)
        );
        await safeReply(interaction,  {
            content: `📝 Mensagens 3 do painel [${painelId}]`,
            components: [row1, row2, row3],
            flags: 64
        });
    } catch (err) {
        error('mensagens_3', err);
    }
}

async function handleMensagens4(interaction, painelId, log, error) {
    log('mensagens_4', `Abrindo Mensagens 4 para painelId=${painelId}`);
    try {
        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`timeout_1_${painelId}`).setLabel('Timeout 1').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`timeout_2_${painelId}`).setLabel('Timeout 2').setStyle(ButtonStyle.Primary)
        );
        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`timeout_3_${painelId}`).setLabel('Timeout 3').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`timeout_4_${painelId}`).setLabel('Timeout 4').setStyle(ButtonStyle.Primary)
        );
        const row3 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`msg_metodos_pagamento_${painelId}`).setLabel('Métodos de Pagamento').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`msg_realizar_pagamento_${painelId}`).setLabel('Msg Realizar Pagamento').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId(`mensagens_${painelId}`).setLabel('Voltar').setStyle(ButtonStyle.Secondary)
        );
        await safeReply(interaction, {
            content: `📝 Mensagens 4 do painel [${painelId}]`,
            components: [row1, row2, row3],
            flags: 64
        });
    } catch (err) {
        error('mensagens_4', err);
    }
}





async function handleMsgInicial(interaction, painelId, logInfo, logError) {
    try {
        logInfo('handleMsgInicial', `Início handler. interaction.customId=${interaction.customId}, painelId=${painelId}`);
        const realPainelId = interaction.customId.replace('msg_inicial_', '');
        const db = new sqlite3.Database(dbPath);
        db.get('SELECT msg_inicial FROM paineis WHERE id = ?', [realPainelId], async (err, painel) => {
            db.close();
            if (err || !painel) {
                logError('handleMsgInicial_dbget', err || 'Painel não encontrado');
                return await safeReply(interaction, { content: '❌ Não foi possível buscar a mensagem inicial.', flags: 64 });
            }
            logInfo('handleMsgInicial', `Painel encontrado. msg_inicial=${painel.msg_inicial}`);
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`mensagens_${realPainelId}`)
                    .setLabel('Voltar')
                    .setStyle(ButtonStyle.Secondary)
            );
            await safeReply(interaction, {
                content: `Mensagem inicial atual:\n\n${painel.msg_inicial || 'Não definida.'}\n\nEnvie um JSON contendo exatamente 2 botões para a mensagem inicial.\n\nExemplo:\n\`\`\`json\n{\n  "content": "Bem-vindo!",\n  "components": [\n    { "type": 2, "label": "Botão 1", "style": 1, "custom_id": "msg_inicial-1" },\n    { "type": 2, "label": "Botão 2", "style": 2, "custom_id": "msg_inicial-2" }\n  ]\n}\n\`\`\``,
                components: [row],
                flags: 64
            });

            const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });
            collector.on('collect', m => {
                let json;
                try {
                    json = JSON.parse(m.content);
                    if (!json.components || !Array.isArray(json.components) || json.components.length !== 2) {
                        return m.reply('❌ O JSON deve conter exatamente 2 botões no array "components".');
                    }
                } catch (e) {
                    return m.reply('❌ JSON inválido. Tente novamente enviando um JSON válido.');
                }
                const db_2 = new sqlite3.Database(dbPath);
                db_2.run('UPDATE paineis SET msg_inicial = ? WHERE id = ?', [m.content, realPainelId], err => {
                    db_2.close();
                    if (err) {
                        m.reply('❌ Erro ao salvar a nova mensagem inicial.');
                    } else {
                        m.reply('✅ Mensagem inicial atualizada com sucesso!');
                    }
                });
            });
            collector.on('end', collected => {
                if (collected.size === 0) safeReply(interaction, { content: 'Tempo esgotado. Nenhuma alteração feita.', flags: 64 });
            });
        });
    } catch (err) {
        logError('handleMsgInicial_main', err);
        try { await safeReply(interaction, { content: '❌ Erro inesperado ao processar mensagem inicial.', flags: 64 }); }
        catch (e) { logError('handleMsgInicial_error', e); }
    }
}


module.exports = {
    handle,
    handleConfirmarInfo,
    handleInfoPadrao,
    handleInfoPadronizada,
    handleMensagens1,
    handleMensagens2,
    handleMensagens3,
    handleMensagens4,
    handleMenuMensagens,
    handleMenuPrincipal,
    handleMsgCancelamento,
    handleMsgConfirmarCompra,
    handleMsgInfos,
    handleNotificacaoPainel
};
