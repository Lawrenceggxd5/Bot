// Handler para os botões de concluir e cancelar carrinho
const { ButtonStyle } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '../painel.sqlite');

async function handleCarrinhoConcluir(interaction) {
    const db = new sqlite3.Database(dbPath);
    // Busca o carrinho do usuário
    db.get('SELECT produtos FROM carrinhos WHERE user_id = ?', [interaction.user.id], (err, carrinho) => {
        if (err || !carrinho) {
            db.close();
            return interaction.reply({ content: '❌ Carrinho não encontrado.', flags: 64 });
        }
        let produtos = [];
        try { produtos = JSON.parse(carrinho.produtos); } catch (e) {}
        // Busca todos os produtos do carrinho para verificar se algum é type 1
        db.all('SELECT id, titulo, type FROM produtos', [], (err2, allProdutos) => {
            if (err2) {
                db.close();
                return interaction.reply({ content: '❌ Erro ao buscar produtos.', flags: 64 });
            }
            // Verifica se algum produto do carrinho é type 1
            const temType1 = allProdutos.some(p => produtos.includes(p.titulo) && String(p.type) === '1');
            if (temType1) {
                // Solicita nickname do Roblox
                interaction.reply({ content: 'Por favor, envie seu nickname do Roblox para finalizar a compra:', flags: 64 }).then(() => {
                    const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
                    const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 60000 });
                    collector.on('collect', async m => {
                        const nickname = m.content.trim();
                        // Busca o userId do Roblox
                        try {
                            const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
                            const userRes = await fetch(`https://api.roblox.com/users/get-by-username?username=${encodeURIComponent(nickname)}`);
                            const userData = await userRes.json();
                            if (!userData.Id) return m.reply('❌ Nickname do Roblox não encontrado.');
                            // Busca a imagem do avatar
                            const thumbRes = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userData.Id}&size=420x420&format=Png&isCircular=false`);
                            const thumbData = await thumbRes.json();
                            const imageUrl = thumbData.data && thumbData.data[0] && thumbData.data[0].imageUrl ? thumbData.data[0].imageUrl : null;
                            // Monta embed info1
                            const db2 = new sqlite3.Database(dbPath);
                            db2.get('SELECT msg_info1 FROM paineis WHERE id = (SELECT id FROM paineis LIMIT 1)', (err3, rowInfo) => {
                                db2.close();
                                if (err3 || !rowInfo || !rowInfo.msg_info1) {
                                    return m.reply('❌ Erro ao buscar info1.');
                                }
                                try {
                                    const json = JSON.parse(rowInfo.msg_info1);
                                    const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
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
                                    if (imageUrl) embed.setThumbnail(imageUrl);
                                    if (json.image) embed.setImage(json.image);
                                    if (Array.isArray(json.fields)) {
                                        json.fields.forEach(f => {
                                            if (f && f.name && f.value) embed.addFields({ name: f.name, value: f.value, inline: !!f.inline });
                                        });
                                    }
                                    // Adiciona botão Voltar, lendo emote do JSON se existir
                                    let voltarLabel = 'Voltar';
                                    let voltarEmote = '';
                                    let voltarStyle = ButtonStyle.Secondary;
                                    if (json.buttons && Array.isArray(json.buttons)) {
                                        const btnVoltar = json.buttons.find(b => (b.custom_id === 'confirmar_info_2' || b.id === 'confirmar_info_2' || b.label === 'Voltar'));
                                        if (btnVoltar) {
                                            if (btnVoltar.label) voltarLabel = btnVoltar.label;
                                            if (btnVoltar.emoji) voltarEmote = btnVoltar.emoji;
                                            if (btnVoltar.emote) voltarEmote = btnVoltar.emote;
                                            if (btnVoltar.style) voltarStyle = ButtonStyle[btnVoltar.style] || voltarStyle;
                                        }
                                    }
                                    const rowVoltar = new ActionRowBuilder().addComponents(
                                        new ButtonBuilder()
                                            .setCustomId('confirmar_info_2')
                                            .setLabel(voltarLabel)
                                            .setStyle(voltarStyle)
                                            .setEmoji(voltarEmote || undefined)
                                    );
                                    // Após mostrar info1, deleta a mensagem info1 e pede confirmação
                                    m.reply({ content: '✅ Carrinho concluído com sucesso! Obrigado pela compra.', embeds: [embed], components: [rowVoltar], flags: 64 }).then(async sentMsg => {
                                        // Aguarda o clique no botão Voltar ou Confirmar
                                        const filterBtn = i => i.customId === 'voltar_info1' || i.customId === 'confirmar_info_1';
                                        const collectorBtn = sentMsg.createMessageComponentCollector({ filter: i => i.customId === 'confirmar_info_2' || i.customId === 'confirmar_info_1', time: 60000 });
                                        collectorBtn.on('collect', async i => {
                                            if (i.customId === 'confirmar_info_2') {
                                                await sentMsg.delete();
                                                // Volta para o início do fluxo: pede novamente o nickname do Roblox
                                                return i.reply({ content: 'Por favor, envie seu nickname do Roblox para finalizar a compra:', flags: 64 });
                                            } else if (i.customId === 'confirmar_info_1') {
                                                await sentMsg.delete();
                                                // Busca embed confirmarinfo1
                                                const db3 = new sqlite3.Database(dbPath);
                                                db3.get('SELECT confirmarinfo1 FROM paineis WHERE id = (SELECT id FROM paineis LIMIT 1)', async (err4, rowConf) => {
                                                    db3.close();
                                                    if (err4 || !rowConf || !rowConf.confirmarinfo1) {
                                                        return i.reply({ content: '❌ Erro ao buscar confirmarinfo1.', flags: 64 });
                                                    }
                                                    try {
                                                        const jsonConf = JSON.parse(rowConf.confirmarinfo1);
                                                        const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
                                                        const embedConf = new EmbedBuilder();
                                                        if (jsonConf.title) embedConf.setTitle(jsonConf.title);
                                                        if (jsonConf.description) embedConf.setDescription(jsonConf.description);
                                                        if (jsonConf.color_embed) embedConf.setColor(jsonConf.color_embed);
                                                        if (jsonConf.color) embedConf.setColor(jsonConf.color);
                                                        if (jsonConf.url) embedConf.setURL(jsonConf.url);
                                                        if (jsonConf.timestamp) embedConf.setTimestamp(new Date(jsonConf.timestamp));
                                                        if (jsonConf.footer) {
                                                            if (typeof jsonConf.footer === 'string') {
                                                                embedConf.setFooter({ text: jsonConf.footer });
                                                            } else {
                                                                embedConf.setFooter({ text: jsonConf.footer.text || '', iconURL: jsonConf.footer.icon_url || jsonConf.footer.iconURL });
                                                            }
                                                        }
                                                        if (jsonConf.author) {
                                                            if (typeof jsonConf.author === 'string') {
                                                                embedConf.setAuthor({ name: jsonConf.author });
                                                            } else {
                                                                embedConf.setAuthor({ name: jsonConf.author.name || '', iconURL: jsonConf.author.icon_url || jsonConf.author.iconURL, url: jsonConf.author.url });
                                                            }
                                                        }
                                                        if (imageUrl) embedConf.setImage(imageUrl);
                                                        if (Array.isArray(jsonConf.fields)) {
                                                            jsonConf.fields.forEach(f => {
                                                                if (f && f.name && f.value) embedConf.addFields({ name: f.name, value: f.value, inline: !!f.inline });
                                                            });
                                                        }
                                                        // Botões: Confirmar e Voltar, lendo emote do JSON se existir
                                                        let confirmarLabel = 'Confirmar';
                                                        let confirmarEmote = '';
                                                        let confirmarStyle = ButtonStyle.Success;
                                                        let voltarLabel = 'Voltar';
                                                        let voltarEmote = '';
                                                        let voltarStyle = ButtonStyle.Primary;
                                                        if (jsonConf.buttons && Array.isArray(jsonConf.buttons)) {
                                                            const btnConfirmar = jsonConf.buttons.find(b => (b.custom_id === 'confirmar_info_1' || b.id === 'confirmar_info_1' || b.label === 'Confirmar'));
                                                            if (btnConfirmar) {
                                                                if (btnConfirmar.label) confirmarLabel = btnConfirmar.label;
                                                                if (btnConfirmar.emoji) confirmarEmote = btnConfirmar.emoji;
                                                                if (btnConfirmar.emote) confirmarEmote = btnConfirmar.emote;
                                                                if (btnConfirmar.style) confirmarStyle = ButtonStyle[btnConfirmar.style] || confirmarStyle;
                                                            }
                                                            const btnVoltar = jsonConf.buttons.find(b => (b.custom_id === 'confirmar_info_2' || b.id === 'confirmar_info_2' || b.label === 'Voltar'));
                                                            if (btnVoltar) {
                                                                if (btnVoltar.label) voltarLabel = btnVoltar.label;
                                                                if (btnVoltar.emoji) voltarEmote = btnVoltar.emoji;
                                                                if (btnVoltar.emote) voltarEmote = btnVoltar.emote;
                                                                if (btnVoltar.style) voltarStyle = ButtonStyle[btnVoltar.style] || voltarStyle;
                                                            }
                                                        }
                                                        const rowConfirm = new ActionRowBuilder().addComponents(
                                                            new ButtonBuilder()
                                                                .setCustomId('confirmar_info_1')
                                                                .setLabel(confirmarLabel)
                                                                .setStyle(confirmarStyle)
                                                                .setEmoji(confirmarEmote || undefined),
                                                            new ButtonBuilder()
                                                                .setCustomId('confirmar_info_2')
                                                                .setLabel(voltarLabel)
                                                                .setStyle(voltarStyle)
                                                                .setEmoji(voltarEmote || undefined)
                                                        );
                                                        await i.reply({ content: 'Confirme as informações abaixo:', embeds: [embedConf], components: [rowConfirm], flags: 64 });
                                                    } catch (e) {
                                                        i.reply({ content: '❌ Erro ao montar o embed de confirmação.', flags: 64 });
                                                    }
                                                });
                                            }
                                        });
                                    });
                                } catch (e) {
                                    m.reply('✅ Carrinho concluído com sucesso! (info1 inválido)');
                                }
                            });
                        } catch (e) {
                            m.reply('❌ Erro ao buscar avatar do Roblox.');
                        }
                    });
                    collector.on('end', collected => {
                        if (collected.size === 0) interaction.followUp({ content: 'Tempo esgotado. Nenhuma alteração feita.', flags: 64 });
                    });
                });
                return;
            } else {
                db.run('DELETE FROM carrinhos WHERE user_id = ?', [interaction.user.id], err4 => {
                    db.close();
                    if (err4) {
                        return interaction.reply({ content: '❌ Erro ao concluir o carrinho.', flags: 64 });
                    }
                    interaction.reply({ content: '✅ Carrinho concluído com sucesso! Obrigado pela compra.', flags: 64 });
                });
            }
        });
    });
}

async function handleCarrinhoCancelar(interaction) {
    // Cancela e limpa o carrinho do usuário
    const db = new sqlite3.Database(dbPath);
    db.run('DELETE FROM carrinhos WHERE user_id = ?', [interaction.user.id], err => {
        db.close();
        if (err) {
            return interaction.reply({ content: '❌ Erro ao cancelar o carrinho.', flags: 64 });
        }
        interaction.reply({ content: '🚫 Carrinho cancelado e limpo.', flags: 64 });
    });
}

module.exports = { handleCarrinhoConcluir, handleCarrinhoCancelar };
