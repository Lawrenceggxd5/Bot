const { EmbedBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '../painel.sqlite');

// Handler para seleção de produto no select-menu
async function handleSelectProduto(interaction) {
    if (!interaction.isStringSelectMenu()) return;
    const customId = interaction.customId;
    if (!customId.startsWith('select_produto_')) return;
    const categoriaId = customId.replace('select_produto_', '');
    const produtoId = interaction.values[0];

    // Recupera o estado anterior do carrinho do usuário (pode ser do interaction ou de um cache, aqui simplificado)
    let produtosSelecionados = interaction.produtosSelecionados || [];
    let valorTotal = interaction.valorTotal || 0;
    // Busca o produto selecionado no banco
    const db = new sqlite3.Database(dbPath);
    db.get('SELECT titulo, preco FROM produtos WHERE id = ?', [produtoId], async (err, row) => {
        if (err || !row) {
            db.close();
            return interaction.reply({ content: '❌ Produto não encontrado.', flags: 64 });
        }
        // Verifica se o produto já está no carrinho
        const carrinhoDb = new sqlite3.Database(dbPath);
        carrinhoDb.get('SELECT * FROM carrinhos WHERE user_id = ?', [interaction.user.id], async (err2, carrinho) => {
            let produtos = [];
            if (carrinho && carrinho.produtos) {
                try { produtos = JSON.parse(carrinho.produtos); } catch (e) {}
            }
            if (produtos.includes(row.titulo)) {
                const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
                const rowBotoes = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`adicionar_produto_${produtoId}`)
                        .setLabel('Adicionar')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId(`remover_produto_${produtoId}`)
                        .setLabel('Remover')
                        .setStyle(ButtonStyle.Danger)
                );
                await interaction.reply({ content: `O produto "${row.titulo}" já está no carrinho. O que deseja fazer?`, components: [rowBotoes], flags: 64 });
                db.close();
                carrinhoDb.close();
                return;
            } else {
                // Produto não está no carrinho, perguntar quantidade
                await interaction.reply({ content: `Quantos de "${row.titulo}" deseja adicionar ao carrinho?`, flags: 64 });
                const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
                const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 60000 });
                collector.on('collect', async m => {
                    const quantidade = parseInt(m.content.trim());
                    if (isNaN(quantidade) || quantidade <= 0) return m.reply('❌ Envie um número válido maior que zero.');
                    // Recupera carrinho novamente
                    carrinhoDb.get('SELECT * FROM carrinhos WHERE user_id = ?', [interaction.user.id], async (err3, carrinho2) => {
                        let produtos2 = [];
                        let valorTotal2 = 0;
                        if (carrinho2 && carrinho2.produtos) {
                            try { produtos2 = JSON.parse(carrinho2.produtos); } catch (e) {}
                            valorTotal2 = parseFloat(carrinho2.valor_total) || 0;
                        }
                        for (let i = 0; i < quantidade; i++) {
                            produtos2.push(row.titulo);
                        }
                        valorTotal2 += quantidade * parseFloat(row.preco);
                        carrinhoDb.run('INSERT OR REPLACE INTO carrinhos (user_id, produtos, valor_total) VALUES (?, ?, ?)', [interaction.user.id, JSON.stringify(produtos2), valorTotal2], err4 => {
                            if (err4) {
                                m.reply('❌ Erro ao atualizar o carrinho.');
                            } else {
                                m.reply(`✅ ${quantidade}x "${row.titulo}" adicionado(s) ao carrinho! Valor total: R$ ${valorTotal2.toFixed(2)}`);
                            }
                            carrinhoDb.close();
                        });
                    });
                });
                collector.on('end', collected => {
                    if (collected.size === 0) interaction.followUp({ content: 'Tempo esgotado. Nenhuma alteração feita.', flags: 64 });
                });
                db.close();
                return;
            }
        });
    });
// ...existing code...
}

// Handler para adicionar produto
async function handleAdicionarProduto(interaction) {
    const produtoId = interaction.customId.replace('adicionar_produto_', '');
    const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
    await interaction.reply({ content: 'Quantos desse produto deseja adicionar ao carrinho?', flags: 64 });
    const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 60000 });
    collector.on('collect', async m => {
        const quantidade = parseInt(m.content.trim());
        if (isNaN(quantidade) || quantidade <= 0) return m.reply('❌ Envie um número válido maior que zero.');
        const db = new sqlite3.Database(dbPath);
        db.get('SELECT titulo, preco FROM produtos WHERE id = ?', [produtoId], async (err, row) => {
            if (err || !row) {
                db.close();
                return m.reply('❌ Produto não encontrado.');
            }
            // Recupera carrinho do usuário
            db.get('SELECT * FROM carrinhos WHERE user_id = ?', [interaction.user.id], async (err2, carrinho) => {
                let produtos = [];
                let valorTotal = 0;
                if (carrinho && carrinho.produtos) {
                    try { produtos = JSON.parse(carrinho.produtos); } catch (e) {}
                    valorTotal = parseFloat(carrinho.valor_total) || 0;
                }
                // Adiciona a quantidade
                for (let i = 0; i < quantidade; i++) {
                    produtos.push(row.titulo);
                }
                valorTotal += quantidade * parseFloat(row.preco);
                // Atualiza no banco
                db.run('INSERT OR REPLACE INTO carrinhos (user_id, produtos, valor_total) VALUES (?, ?, ?)', [interaction.user.id, JSON.stringify(produtos), valorTotal], err3 => {
                    db.close();
                    if (err3) {
                        m.reply('❌ Erro ao atualizar o carrinho.');
                    } else {
                        m.reply(`✅ ${quantidade}x "${row.titulo}" adicionado(s) ao carrinho! Valor total: R$ ${valorTotal.toFixed(2)}`);
                    }
                });
            });
        });
    });
    collector.on('end', collected => {
        if (collected.size === 0) interaction.followUp({ content: 'Tempo esgotado. Nenhuma alteração feita.', flags: 64 });
    });
}

// Handler para remover produto
async function handleRemoverProduto(interaction) {
    const produtoId = interaction.customId.replace('remover_produto_', '');
    const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
    await interaction.reply({ content: 'Quantos desse produto deseja remover do carrinho?', flags: 64 });
    const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 60000 });
    collector.on('collect', async m => {
        const quantidade = parseInt(m.content.trim());
        if (isNaN(quantidade) || quantidade <= 0) return m.reply('❌ Envie um número válido maior que zero.');
        const db = new sqlite3.Database(dbPath);
        db.get('SELECT titulo, preco FROM produtos WHERE id = ?', [produtoId], async (err, row) => {
            if (err || !row) {
                db.close();
                return m.reply('❌ Produto não encontrado.');
            }
            // Recupera carrinho do usuário
            db.get('SELECT * FROM carrinhos WHERE user_id = ?', [interaction.user.id], async (err2, carrinho) => {
                let produtos = [];
                let valorTotal = 0;
                if (carrinho && carrinho.produtos) {
                    try { produtos = JSON.parse(carrinho.produtos); } catch (e) {}
                    valorTotal = parseFloat(carrinho.valor_total) || 0;
                }
                // Remove a quantidade
                let removidos = 0;
                for (let i = 0; i < quantidade; i++) {
                    const idx = produtos.indexOf(row.titulo);
                    if (idx !== -1) {
                        produtos.splice(idx, 1);
                        valorTotal -= parseFloat(row.preco);
                        removidos++;
                    }
                }
                if (removidos === 0) {
                    db.close();
                    return m.reply('❌ Nenhum produto removido.');
                }
                // Atualiza no banco
                db.run('INSERT OR REPLACE INTO carrinhos (user_id, produtos, valor_total) VALUES (?, ?, ?)', [interaction.user.id, JSON.stringify(produtos), valorTotal], err3 => {
                    db.close();
                    if (err3) {
                        m.reply('❌ Erro ao atualizar o carrinho.');
                    } else {
                        m.reply(`✅ ${removidos}x "${row.titulo}" removido(s) do carrinho! Valor total: R$ ${valorTotal.toFixed(2)}`);
                    }
                });
            });
        });
    });
    collector.on('end', collected => {
        if (collected.size === 0) interaction.followUp({ content: 'Tempo esgotado. Nenhuma alteração feita.', flags: 64 });
    });
}

module.exports = { handleSelectProduto, handleAdicionarProduto, handleRemoverProduto };
