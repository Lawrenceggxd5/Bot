const { EmbedBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '../painel.sqlite');

// Handler que será chamado ao apertar o botão com id "msgid-1"
async function handleMsgid1(interaction) {
    // Busca o embed do carrinho e as categorias de produtos do painel
    const db = new sqlite3.Database(dbPath);
    db.get('SELECT msg_carrinho, categoria_produtos FROM paineis WHERE id = (SELECT id FROM paineis LIMIT 1)', async (err, row) => {
        if (err || !row || !row.msg_carrinho) {
            db.close();
            return interaction.reply({ content: '❌ Não foi possível encontrar o embed do carrinho.', ephemeral: true });
        }
        let msgStr = row.msg_carrinho;
        const categoriaProdutos = row.categoria_produtos ? JSON.parse(row.categoria_produtos) : [];

        // Variáveis para substituição
        const ticketCreatedAt = interaction.channel.createdAt ? interaction.channel.createdAt.toLocaleString('pt-BR') : '';
        const produtos = interaction.produtosSelecionados || ['Produto 1', 'Produto 2'];
        const listaDeProdutos = produtos.join('\n');
        const valorTotal = interaction.valorTotal || 'R$ 0,00';
        const nickname = interaction.member ? interaction.member.nickname || interaction.user.username : interaction.user.username;
        const gmail = interaction.gmail || 'seuemail@gmail.com';
        const telefone = interaction.telefone || '(00) 00000-0000';

        msgStr = msgStr.replace(/<user>/g, `<@${interaction.user.id}>`)
            .replace(/<ticket>/g, interaction.channel.id)
            .replace(/<data>/g, ticketCreatedAt)
            .replace(/<lista_de_produtos>/g, listaDeProdutos)
            .replace(/<criador do carrinho>/g, `<@${interaction.user.id}>`)
            .replace(/<valor total>/g, valorTotal)
            .replace(/<nickname>/g, nickname)
            .replace(/<gmail>/g, gmail)
            .replace(/<telefone>/g, telefone);

        // Busca produtos de cada categoria e monta os select-menus
        const selectMenus = [];
        if (categoriaProdutos.length > 0) {
            for (const categoriaId of categoriaProdutos) {
                // Busca os produtos dessa categoria
                const produtosCategoria = await new Promise((resolve) => {
                    db.get('SELECT itens FROM categorias WHERE id = ?', [categoriaId], (err2, row2) => {
                        if (err2 || !row2) return resolve([]);
                        let itens = [];
                        try { itens = JSON.parse(row2.itens); } catch (e) {}
                        resolve(itens);
                    });
                });
                if (produtosCategoria.length > 0) {
                    // Busca detalhes de cada produto
                    const options = [];
                    for (const produtoId of produtosCategoria) {
                        const produto = await new Promise((resolve) => {
                            db.get('SELECT titulo, preco FROM produtos WHERE id = ?', [produtoId], (err3, row3) => {
                                if (err3 || !row3) return resolve(null);
                                resolve(row3);
                            });
                        });
                        if (produto) {
                            options.push({
                                label: produto.titulo,
                                value: produtoId,
                                description: `${produto.preco}` // Apenas o preço, sem prefixo
                            });
                        }
                    }
                    if (options.length > 0) {
                        const { StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
                        const select = new StringSelectMenuBuilder()
                            .setCustomId(`select_produto_${categoriaId}`)
                            .setPlaceholder('Selecione um produto')
                            .addOptions(options);
                        selectMenus.push(new ActionRowBuilder().addComponents(select));
                    }
                }
            }
        }

        try {
            const json = JSON.parse(msgStr);
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
            // Adiciona botões Cancelar, Concluir e Aplicar Cupom ao embed do carrinho
            const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
            const rowCarrinho = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('carrinhoid-1')
                    .setLabel('Cancelar')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('carrinhoid-2')
                    .setLabel('Concluir')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('carrinhoid-3')
                    .setLabel('Aplicar Cupom')
                    .setStyle(ButtonStyle.Primary)
            );
            await interaction.reply({ embeds: [embed], components: [...selectMenus, rowCarrinho], ephemeral: true });
        } catch (e) {
            await interaction.reply({ content: msgStr, ephemeral: true });
        }
        db.close();
    });
}

// Handler para o botão Aplicar Cupom
async function handleAplicarCupom(interaction) {
    if (interaction.customId !== 'carrinhoid-3') return;
    const db = new sqlite3.Database(dbPath);
    // Busca cupons do usuário
    db.get('SELECT cupons FROM perfis WHERE user_id = ?', [interaction.user.id], async (err, row) => {
        if (err || !row || !row.cupons) {
            db.close();
            return interaction.reply({ content: 'Você não possui cupons disponíveis.', ephemeral: true });
        }
        let lista = row.cupons.split(',').filter(Boolean);
        if (!lista.length) {
            db.close();
            return interaction.reply({ content: 'Você não possui cupons disponíveis.', ephemeral: true });
        }
        // Busca produtos do carrinho e seus TYPES
        db.get('SELECT produtos FROM carrinhos WHERE user_id = ?', [interaction.user.id], (err2, carrinho) => {
            if (err2 || !carrinho) {
                db.close();
                return interaction.reply({ content: '❌ Carrinho não encontrado.', ephemeral: true });
            }
            let produtos = [];
            try { produtos = JSON.parse(carrinho.produtos); } catch (e) {}
            db.all('SELECT id, titulo, type FROM produtos', [], (err3, allProdutos) => {
                if (err3) {
                    db.close();
                    return interaction.reply({ content: '❌ Erro ao buscar produtos.', ephemeral: true });
                }
                // Descobre os TYPES dos produtos do carrinho
                const typesCarrinho = allProdutos.filter(p => produtos.includes(p.titulo)).map(p => String(p.type));
                // Busca cupons válidos para esses TYPES
                db.all('SELECT * FROM cupons WHERE nome IN (' + lista.map(() => '?').join(',') + ')', lista, (err4, cuponsDb) => {
                    db.close();
                    if (err4 || !cuponsDb.length) return interaction.reply({ content: 'Você não possui cupons válidos.', ephemeral: true });
                    // Só mostra cupons que tenham type compatível
                    const cuponsValidos = cuponsDb.filter(c => {
                        if (!c.type) return true;
                        // type pode ser "robux,giftcard" etc
                        const tiposCupom = c.type.split(',').map(s => s.trim().toLowerCase());
                        return typesCarrinho.some(t => tiposCupom.includes(t.toLowerCase()));
                    });
                    if (!cuponsValidos.length) return interaction.reply({ content: 'Nenhum cupom válido para os produtos do carrinho.', ephemeral: true });
                    const { StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
                    const select = new StringSelectMenuBuilder()
                        .setCustomId('select_cupom')
                        .setPlaceholder('Selecione um cupom')
                        .addOptions(cuponsValidos.map(cupom => ({ label: cupom.nome + ` (${cupom.percentual}% off)`, value: cupom.nome })));
                    const rowSelect = new ActionRowBuilder().addComponents(select);
                    interaction.reply({ content: 'Selecione um cupom para aplicar:', components: [rowSelect], ephemeral: true });
                });
            });
        });
    });
}

// Handler para selecionar o cupom e aplicar desconto visual
async function handleSelectCupom(interaction) {
    if (interaction.customId !== 'select_cupom') return;
    const cupomSelecionado = interaction.values[0];
    const db = new sqlite3.Database(dbPath);
    db.get('SELECT * FROM cupons WHERE nome = ?', [cupomSelecionado], (err, cupom) => {
        if (err || !cupom) {
            db.close();
            return interaction.reply({ content: 'Cupom inválido.', ephemeral: true });
        }
        // Sempre troca o cupom_aplicado do carrinho para o novo cupom selecionado
        db.run('UPDATE carrinhos SET cupom_aplicado = ? WHERE user_id = ?', [cupomSelecionado, interaction.user.id], err2 => {
            db.close();
            if (err2) return interaction.reply({ content: 'Erro ao aplicar cupom.', ephemeral: true });
            interaction.reply({ content: `Cupom ${cupomSelecionado} aplicado! Desconto de ${cupom.percentual}% será mostrado no valor final. O cupom só será consumido ao concluir a compra.`, ephemeral: true });
        });
    });
}

// Handler para concluir o carrinho e consumir o cupom
async function handleConcluirCarrinho(interaction) {
    if (interaction.customId !== 'carrinhoid-2') return;
    const db = new sqlite3.Database(dbPath);
    // Busca produtos do carrinho, cupom aplicado e calcula valor real com desconto
    db.get('SELECT produtos, cupom_aplicado FROM carrinhos WHERE user_id = ?', [interaction.user.id], (err, row) => {
        if (err || !row || !row.produtos) {
            db.close();
            return interaction.reply({ content: '❌ Carrinho não encontrado.', ephemeral: true });
        }
        let produtos = [];
        try { produtos = JSON.parse(row.produtos); } catch (e) {}
        // Busca todos os produtos para pegar preço e type
        db.all('SELECT id, titulo, preco, type FROM produtos', [], (err2, allProdutos) => {
            if (err2) {
                db.close();
                return interaction.reply({ content: '❌ Erro ao buscar produtos.', ephemeral: true });
            }
            // Monta lista de produtos do carrinho com preço e type
            const produtosCarrinho = allProdutos.filter(p => produtos.includes(p.titulo));
            let valorTotal = 0;
            produtosCarrinho.forEach(p => {
                let preco = 0;
                if (typeof p.preco === 'string') {
                    preco = parseFloat(p.preco.replace('R$', '').replace(',', '.').replace(/[^0-9.]/g, ''));
                } else {
                    preco = Number(p.preco) || 0;
                }
                valorTotal += preco;
            });
            let descontoTotal = 0;
            if (row.cupom_aplicado) {
                // Busca info do cupom
                db.get('SELECT * FROM cupons WHERE nome = ?', [row.cupom_aplicado], (err3, cupom) => {
                    if (!err3 && cupom) {
                        // Aplica desconto apenas nos produtos do type permitido
                        let tiposCupom = [];
                        if (cupom.type) {
                            tiposCupom = cupom.type.split(',').map(s => s.trim().toLowerCase());
                        }
                        const percentual = Number(cupom.percentual) || 0;
                        produtosCarrinho.forEach(p => {
                            const typeProduto = String(p.type || '').toLowerCase();
                            let aplica = false;
                            if (!tiposCupom.length || tiposCupom.includes(typeProduto)) aplica = true;
                            if (aplica) {
                                let preco = 0;
                                if (typeof p.preco === 'string') {
                                    preco = parseFloat(p.preco.replace('R$', '').replace(',', '.').replace(/[^0-9.]/g, ''));
                                } else {
                                    preco = Number(p.preco) || 0;
                                }
                                descontoTotal += preco * (percentual / 100);
                            }
                        });
                        // Remove o cupom do usuário e decrementa quantidade
                        db.get('SELECT cupons FROM perfis WHERE user_id = ?', [interaction.user.id], (err2, row2) => {
                            let cupons = row2 && row2.cupons ? row2.cupons.split(',').filter(Boolean) : [];
                            cupons = cupons.filter(c => c !== row.cupom_aplicado);
                            db.run('UPDATE perfis SET cupons = ? WHERE user_id = ?', [cupons.join(','), interaction.user.id]);
                            db.run('UPDATE cupons SET quantidade = quantidade - 1 WHERE nome = ?', [row.cupom_aplicado]);
                            // Limpa cupom_aplicado do carrinho
                            db.run('UPDATE carrinhos SET cupom_aplicado = NULL WHERE user_id = ?', [interaction.user.id]);
                        });
                    }
                    db.close();
                    // Valor final já com desconto
                    const valorFinal = Math.max(0, valorTotal - descontoTotal);
                    // Aqui você deve gerar o QRCODE/pagamento usando valorFinal
                    // Exemplo:
                    // gerarQRCode(valorFinal);
                    interaction.reply({ content: `✅ Carrinho concluído com sucesso! Valor final: R$ ${valorFinal.toFixed(2).replace('.', ',')} (desconto de R$ ${descontoTotal.toFixed(2).replace('.', ',')})`, ephemeral: true });
                });
            } else {
                db.close();
                // Sem cupom, valor total normal
                // gerarQRCode(valorTotal);
                interaction.reply({ content: `✅ Carrinho concluído com sucesso! Valor final: R$ ${valorTotal.toFixed(2).replace('.', ',')}`, ephemeral: true });
            }
        });
    });
}

module.exports = { handleMsgid1, handleAplicarCupom, handleSelectCupom, handleConcluirCarrinho };
