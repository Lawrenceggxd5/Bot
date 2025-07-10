
// Handler para confirmar_info_1: fluxo reescrito para robustez e clareza
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '../painel.sqlite');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

async function handleConfirmarInfo1(interaction) {
    let nickname = interaction.user.globalName || interaction.user.username || '';
    let rowPerfil = await getPerfil(interaction.user.id);
    // Nickname
    if (rowPerfil && rowPerfil.nickname_roblox) {
        const useNick = await askButton(interaction, `Deseja utilizar o nickname salvo no perfil? (${rowPerfil.nickname_roblox})`, [
            { id: 'usar_nick_salvo', label: 'Sim', style: ButtonStyle.Success },
            { id: 'nao_usar_nick_salvo', label: 'Não', style: ButtonStyle.Secondary }
        ]);
        if (useNick === 'usar_nick_salvo') {
            nickname = rowPerfil.nickname_roblox;
        } else {
            nickname = await askText(interaction, 'Por favor, envie seu nickname:');
            await savePerfil(interaction.user.id, 'nickname_roblox', nickname);
        }
    } else {
        nickname = await askText(interaction, 'Por favor, envie seu nickname:');
        await savePerfil(interaction.user.id, 'nickname_roblox', nickname);
    }
    // Gmail
    rowPerfil = await getPerfil(interaction.user.id);
    let gmail = rowPerfil && rowPerfil.gmail ? rowPerfil.gmail : '';
    if (gmail) {
        const useGmail = await askButton(interaction, `Deseja utilizar o Gmail salvo no perfil? (${gmail})`, [
            { id: 'usar_gmail_salvo', label: 'Sim', style: ButtonStyle.Success },
            { id: 'nao_usar_gmail_salvo', label: 'Não', style: ButtonStyle.Secondary }
        ]);
        if (useGmail !== 'usar_gmail_salvo') {
            gmail = await askText(interaction, 'Por favor, envie seu Gmail:');
            await savePerfil(interaction.user.id, 'gmail', gmail);
        }
    } else {
        gmail = await askText(interaction, 'Por favor, envie seu Gmail:');
        await savePerfil(interaction.user.id, 'gmail', gmail);
    }
    // Telefone
    rowPerfil = await getPerfil(interaction.user.id);
    let telefone = rowPerfil && rowPerfil.telefone ? rowPerfil.telefone : '';
    if (telefone) {
        const useTel = await askButton(interaction, `Deseja utilizar o telefone salvo no perfil? (${telefone})`, [
            { id: 'usar_tel_salvo', label: 'Sim', style: ButtonStyle.Success },
            { id: 'nao_usar_tel_salvo', label: 'Não', style: ButtonStyle.Secondary }
        ]);
        if (useTel !== 'usar_tel_salvo') {
            telefone = await askText(interaction, 'Por favor, envie seu telefone (apenas números):');
            await savePerfil(interaction.user.id, 'telefone', telefone);
        }
    } else {
        telefone = await askText(interaction, 'Por favor, envie seu telefone (apenas números):');
        await savePerfil(interaction.user.id, 'telefone', telefone);
    }
    // Segue para o próximo fluxo
    await showInfoPadrao1(interaction, nickname);
}

// Utilitários de banco e helpers
function getPerfil(userId) {
    return new Promise((resolve) => {
        const db = new sqlite3.Database(dbPath);
        db.get('SELECT nickname_roblox, gmail, telefone FROM perfis WHERE user_id = ?', [userId], (err, row) => {
            db.close();
            resolve(row);
        });
    });
}
function savePerfil(userId, campo, valor) {
    return new Promise((resolve) => {
        const db = new sqlite3.Database(dbPath);
        db.run('INSERT OR IGNORE INTO perfis (user_id) VALUES (?)', [userId], () => {
            db.run(`UPDATE perfis SET ${campo} = ? WHERE user_id = ?`, [valor, userId], () => {
                db.close();
                resolve();
            });
        });
    });
}
async function askButton(interaction, content, buttons) {
    const row = new ActionRowBuilder().addComponents(
        ...buttons.map(btn => new ButtonBuilder().setCustomId(btn.id).setLabel(btn.label).setStyle(btn.style))
    );
    await interaction.reply({ content, components: [row], ephemeral: true });
    return new Promise((resolve) => {
        const filter = i => buttons.map(b => b.id).includes(i.customId) && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 60000 });
        collector.on('collect', async i => {
            await i.reply({ content: `Selecionado: ${i.component.label}`, ephemeral: true });
            resolve(i.customId);
        });
        collector.on('end', collected => {
            if (collected.size === 0) resolve(null);
        });
    });
}
async function askText(interaction, content) {
    await interaction.followUp({ content, ephemeral: true });
    return new Promise((resolve) => {
        const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
        const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });
        collector.on('collect', async m => {
            resolve(m.content.trim());
        });
        collector.on('end', collected => {
            if (collected.size === 0) resolve(null);
        });
    });
}

// Função para mostrar info_padrao_1 e seguir fluxo original
async function showInfoPadrao1(interaction, nickname) {
    try {
        const db = new sqlite3.Database(dbPath);
        const rowPadrao = await new Promise((resolve, reject) => {
            db.get('SELECT info_padrao_1 FROM paineis WHERE id = (SELECT id FROM paineis LIMIT 1)', (err, row) => {
                db.close();
                if (err) reject(err);
                else resolve(row);
            });
        });
        if (!rowPadrao || !rowPadrao.info_padrao_1) {
            await interaction.reply({ content: '❌ Erro ao buscar info_padrao_1.', ephemeral: true });
            return;
        }
        let jsonStr = rowPadrao.info_padrao_1.replace(/<nickname>/gi, nickname);
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
        // Botões: labels vindos do JSON (json.buttons[])
        let rowBtn;
        if (Array.isArray(json.buttons) && json.buttons.length > 0) {
            const btns = json.buttons.map((btn, idx) =>
                new ButtonBuilder()
                    .setCustomId(btn.custom_id || `padrao1id-${idx+1}`)
                    .setLabel(btn.label || `Botão ${idx+1}`)
                    .setStyle(btn.style ? ButtonStyle[btn.style] || ButtonStyle.Secondary : ButtonStyle.Secondary)
            );
            rowBtn = new ActionRowBuilder().addComponents(...btns);
        } else {
            rowBtn = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('padrao1id-1').setLabel('Avançar').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('padrao1id-2').setLabel('Cancelar').setStyle(ButtonStyle.Secondary)
            );
        }
        const sentMsg = await interaction.reply({ embeds: [embed], components: [rowBtn], ephemeral: true, fetchReply: true });
        // Handler para padrao1id-1
        const filterBtn = i => i.customId === 'padrao1id-1' && i.user.id === interaction.user.id;
        const collectorBtn = sentMsg.channel.createMessageComponentCollector({ filter: filterBtn, max: 1, time: 60000 });
        collectorBtn.on('collect', async i => {
            try {
                // Mostra embed info_padronizada_1
                const dbInfoPadronizada = new sqlite3.Database(dbPath);
                const rowPadronizada = await new Promise((resolve, reject) => {
                    dbInfoPadronizada.get('SELECT info_padronizada_1 FROM paineis WHERE id = (SELECT id FROM paineis LIMIT 1)', (err4, row) => {
                        dbInfoPadronizada.close();
                        if (err4) reject(err4);
                        else resolve(row);
                    });
                });
                if (!rowPadronizada || !rowPadronizada.info_padronizada_1) {
                    await i.reply({ content: '❌ Erro ao buscar info_padronizada_1.', ephemeral: true });
                    return;
                }
                let json2Str = rowPadronizada.info_padronizada_1.replace(/<nickname>/gi, nickname);
                const json2 = JSON.parse(json2Str);
                const embed2 = new EmbedBuilder();
                if (json2.title) embed2.setTitle(json2.title);
                if (json2.description) embed2.setDescription(json2.description);
                if (json2.color_embed) embed2.setColor(json2.color_embed);
                if (json2.color) embed2.setColor(json2.color);
                if (json2.url) embed2.setURL(json2.url);
                if (json2.timestamp) embed2.setTimestamp(new Date(json2.timestamp));
                if (json2.footer) {
                    if (typeof json2.footer === 'string') {
                        embed2.setFooter({ text: json2.footer });
                    } else {
                        embed2.setFooter({ text: json2.footer.text || '', iconURL: json2.footer.icon_url || json2.footer.iconURL });
                    }
                }
                if (json2.author) {
                    if (typeof json2.author === 'string') {
                        embed2.setAuthor({ name: json2.author });
                    } else {
                        embed2.setAuthor({ name: json2.author.name || '', iconURL: json2.author.icon_url || json2.author.iconURL, url: json2.author.url });
                    }
                }
                if (json2.thumbnail) embed2.setThumbnail(json2.thumbnail);
                if (json2.image) embed2.setImage(json2.image);
                if (Array.isArray(json2.fields)) {
                    json2.fields.forEach(f => {
                        if (f && f.name && f.value) embed2.addFields({ name: f.name, value: f.value, inline: !!f.inline });
                    });
                }
                const sentMsg2 = await i.reply({ embeds: [embed2], ephemeral: true, fetchReply: true });
                setTimeout(async () => {
                    try { await sentMsg2.delete(); } catch (e) {}
                    await handleCarrinhoEEmail(interaction);
                }, 3000);
            } catch (e) {
                await i.reply({ content: '❌ Erro ao montar o embed info_padronizada_1.', ephemeral: true });
            }
        });
    } catch (e) {
        await interaction.reply({ content: '❌ Erro ao montar o embed info_padrao_1.', ephemeral: true });
    }
}

// Função para fluxo do carrinho e e-mail (restante do fluxo original)
async function handleCarrinhoEEmail(interaction) {
    // Garante que a tabela carrinhos existe e tem os campos necessários
    await new Promise((resolve, reject) => {
        const dbInit = new sqlite3.Database(dbPath);
        dbInit.run(`CREATE TABLE IF NOT EXISTS carrinhos (
            user_id TEXT PRIMARY KEY,
            produtos TEXT,
            email TEXT,
            celular TEXT,
            nickname TEXT
        )`, (err) => {
            dbInit.close();
            if (err) reject(err); else resolve();
        });
    });
    // Busca o carrinho do usuário
    const carrinho = await new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath);
        db.get('SELECT produtos FROM carrinhos WHERE user_id = ?', [interaction.user.id], (err, row) => {
            db.close();
            if (err) reject(err);
            else resolve(row);
        });
    });
    if (!carrinho) {
        await interaction.reply({ content: '❌ Carrinho não encontrado.', flags: 64 });
        return;
    }
    let produtos = [];
    try { produtos = JSON.parse(carrinho.produtos); } catch (e) {}
    // Busca todos os produtos para verificar se algum é type 2
    const allProdutos = await new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath);
        db.all('SELECT id, titulo, type FROM produtos', [], (err, rows) => {
            db.close();
            if (err) reject(err);
            else resolve(rows);
        });
    });
    const temType2 = allProdutos.some(p => produtos.includes(p.titulo) && String(p.type) === '2');
    if (temType2) {
        await handleEmailConfirm(interaction);
    }
}

// Função para fluxo do e-mail e embed confirmar_info_2
async function handleEmailConfirm(interaction) {
    const nickname = interaction.user.globalName || interaction.user.username || '';
    // Solicita o e-mail do usuário
    await interaction.reply({ content: 'Por favor, envie seu e-mail para confirmação:', ephemeral: true });
    const email = await new Promise((resolve) => {
        const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
        const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });
        collector.on('collect', m => resolve(m.content.trim()));
        collector.on('end', collected => {
            if (collected.size === 0) interaction.followUp({ content: 'Tempo esgotado. Nenhuma confirmação feita.', ephemeral: true });
        });
    });
    // Atualiza o email e nickname no carrinho
    await new Promise((resolve) => {
        const dbCarrinhoEmail = new sqlite3.Database(dbPath);
        dbCarrinhoEmail.run('UPDATE carrinhos SET email = ?, nickname = ? WHERE user_id = ?', [email, nickname, interaction.user.id], () => {
            dbCarrinhoEmail.close();
            resolve();
        });
    });
    // Busca dados do painel
    const rowConf = await new Promise((resolve, reject) => {
        const db2 = new sqlite3.Database(dbPath);
        db2.get('SELECT confirmar_info_2, padronizar_info_2, info_padronizada_2 FROM paineis WHERE id = (SELECT id FROM paineis LIMIT 1)', (err, row) => {
            db2.close();
            if (err || !row || !row.confirmar_info_2 || !row.padronizar_info_2 || !row.info_padronizada_2) reject('❌ Erro ao buscar dados do painel.');
            else resolve(row);
        });
    });
    // Exibe confirmar_info_2 (trocando <email>)
    let jsonStr = rowConf.confirmar_info_2.replace(/<email>/gi, email);
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
    // Botões: labels vindos do JSON (json.buttons[])
    let rowBtn;
    if (Array.isArray(json.buttons) && json.buttons.length > 0) {
        const btns = json.buttons.map((btn, idx) =>
            new ButtonBuilder()
                .setCustomId(btn.custom_id || `confirmar_info2-${idx+1}`)
                .setLabel(btn.label || `Botão ${idx+1}`)
                .setStyle(btn.style ? ButtonStyle[btn.style] || ButtonStyle.Secondary : ButtonStyle.Secondary)
        );
        rowBtn = new ActionRowBuilder().addComponents(...btns);
    } else {
        rowBtn = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('confirmar_info2-1').setLabel('Confirmar').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('confirmar_info2-2').setLabel('Voltar').setStyle(ButtonStyle.Secondary)
        );
    }
    const sentEmbedMsg = await interaction.followUp({ embeds: [embed], components: [rowBtn], ephemeral: true, fetchReply: true });
    // Espera interação em um dos botões
    const filterPadronizar = i => (i.customId === 'confirmar_info2-1' || i.customId === 'confirmar_info2-2') && i.user.id === interaction.user.id;
    const collectedPadronizar = await sentEmbedMsg.awaitMessageComponent({ filter: filterPadronizar, time: 60000 }).catch(() => null);
    if (!collectedPadronizar) return;
    await sentEmbedMsg.delete().catch(() => {});
    // Exibe padronizar_info_2 (trocando <email>)
    let padronizarStr = rowConf.padronizar_info_2.replace(/<email>/gi, email);
    const padronizarJson = JSON.parse(padronizarStr);
    const embedPadronizar = new EmbedBuilder();
    if (padronizarJson.title) embedPadronizar.setTitle(padronizarJson.title);
    if (padronizarJson.description) embedPadronizar.setDescription(padronizarJson.description);
    if (padronizarJson.color_embed) embedPadronizar.setColor(padronizarJson.color_embed);
    if (padronizarJson.color) embedPadronizar.setColor(padronizarJson.color);
    if (padronizarJson.url) embedPadronizar.setURL(padronizarJson.url);
    if (padronizarJson.timestamp) embedPadronizar.setTimestamp(new Date(padronizarJson.timestamp));
    if (padronizarJson.footer) {
        if (typeof padronizarJson.footer === 'string') {
            embedPadronizar.setFooter({ text: padronizarJson.footer });
        } else {
            embedPadronizar.setFooter({ text: padronizarJson.footer.text || '', iconURL: padronizarJson.footer.icon_url || padronizarJson.footer.iconURL });
        }
    }
    if (padronizarJson.author) {
        if (typeof padronizarJson.author === 'string') {
            embedPadronizar.setAuthor({ name: padronizarJson.author });
        } else {
            embedPadronizar.setAuthor({ name: padronizarJson.author.name || '', iconURL: padronizarJson.author.icon_url || padronizarJson.author.iconURL, url: padronizarJson.author.url });
        }
    }
    if (padronizarJson.thumbnail) embedPadronizar.setThumbnail(padronizarJson.thumbnail);
    if (padronizarJson.image) embedPadronizar.setImage(padronizarJson.image);
    if (Array.isArray(padronizarJson.fields)) {
        padronizarJson.fields.forEach(f => {
            if (f && f.name && f.value) embedPadronizar.addFields({ name: f.name, value: f.value, inline: !!f.inline });
        });
    }
    // Botões: labels vindos do JSON (padronizarJson.buttons[])
    let rowBtnPadronizar;
    if (Array.isArray(padronizarJson.buttons) && padronizarJson.buttons.length > 0) {
        const btns = padronizarJson.buttons.map((btn, idx) =>
            new ButtonBuilder()
                .setCustomId(btn.custom_id || `padronizar2id-${idx+1}`)
                .setLabel(btn.label || `Botão ${idx+1}`)
                .setStyle(btn.style ? ButtonStyle[btn.style] || ButtonStyle.Secondary : ButtonStyle.Secondary)
        );
        rowBtnPadronizar = new ActionRowBuilder().addComponents(...btns);
    } else {
        rowBtnPadronizar = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('padronizar2id-1').setLabel('Avançar').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('padronizar2id-2').setLabel('Cancelar').setStyle(ButtonStyle.Secondary)
        );
    }
    const sentPadronizarMsg = await interaction.followUp({ embeds: [embedPadronizar], components: [rowBtnPadronizar], ephemeral: true, fetchReply: true });
    // Handler para padronizar2id-1
    const filterPadronizada2 = i2 => i2.customId === 'padronizar2id-1' && i2.user.id === interaction.user.id;
    const collectedPadronizada2 = await sentPadronizarMsg.awaitMessageComponent({ filter: filterPadronizada2, time: 60000 }).catch(() => null);
    if (!collectedPadronizada2) return;
    await sentPadronizarMsg.delete().catch(() => {});
    // Exibe info_padronizada_2 (trocando <email>)
    let infoPadronizada2Str = rowConf.info_padronizada_2.replace(/<email>/gi, email);
    const infoPadronizada2Json = JSON.parse(infoPadronizada2Str);
    const embedInfoPadronizada2 = new EmbedBuilder();
    if (infoPadronizada2Json.title) embedInfoPadronizada2.setTitle(infoPadronizada2Json.title);
    if (infoPadronizada2Json.description) embedInfoPadronizada2.setDescription(infoPadronizada2Json.description);
    if (infoPadronizada2Json.color_embed) embedInfoPadronizada2.setColor(infoPadronizada2Json.color_embed);
    if (infoPadronizada2Json.color) embedInfoPadronizada2.setColor(infoPadronizada2Json.color);
    if (infoPadronizada2Json.url) embedInfoPadronizada2.setURL(infoPadronizada2Json.url);
    if (infoPadronizada2Json.timestamp) embedInfoPadronizada2.setTimestamp(new Date(infoPadronizada2Json.timestamp));
    if (infoPadronizada2Json.footer) {
        if (typeof infoPadronizada2Json.footer === 'string') {
            embedInfoPadronizada2.setFooter({ text: infoPadronizada2Json.footer });
        } else {
            embedInfoPadronizada2.setFooter({ text: infoPadronizada2Json.footer.text || '', iconURL: infoPadronizada2Json.footer.icon_url || infoPadronizada2Json.footer.iconURL });
        }
    }
    if (infoPadronizada2Json.author) {
        if (typeof infoPadronizada2Json.author === 'string') {
            embedInfoPadronizada2.setAuthor({ name: infoPadronizada2Json.author });
        } else {
            embedInfoPadronizada2.setAuthor({ name: infoPadronizada2Json.author.name || '', iconURL: infoPadronizada2Json.author.icon_url || infoPadronizada2Json.author.iconURL, url: infoPadronizada2Json.author.url });
        }
    }
    if (infoPadronizada2Json.thumbnail) embedInfoPadronizada2.setThumbnail(infoPadronizada2Json.thumbnail);
    if (infoPadronizada2Json.image) embedInfoPadronizada2.setImage(infoPadronizada2Json.image);
    if (Array.isArray(infoPadronizada2Json.fields)) {
        infoPadronizada2Json.fields.forEach(f => {
            if (f && f.name && f.value) embedInfoPadronizada2.addFields({ name: f.name, value: f.value, inline: !!f.inline });
        });
    }
    // Botões Voltar e Pular para o info2
    let rowInfo3;
    // Busca info_padronizada_3
    const rowInfo3Json = await new Promise((resolve, reject) => {
        const dbInfo3 = new sqlite3.Database(dbPath);
        dbInfo3.get('SELECT info_padronizada_3 FROM paineis WHERE id = (SELECT id FROM paineis LIMIT 1)', (err, row) => {
            dbInfo3.close();
            if (err || !row || !row.info_padronizada_3) reject('❌ Erro ao buscar info_padronizada_3.');
            else resolve(row);
        });
    });
    const info3Json = JSON.parse(rowInfo3Json.info_padronizada_3);
    if (Array.isArray(info3Json.buttons) && info3Json.buttons.length > 0) {
        const btns = info3Json.buttons.map((btn, idx) =>
            new ButtonBuilder()
                .setCustomId(btn.custom_id || `info3-btn${idx+1}`)
                .setLabel(btn.label || `Botão ${idx+1}`)
                .setStyle(btn.style ? ButtonStyle[btn.style] || ButtonStyle.Secondary : ButtonStyle.Secondary)
        );
        rowInfo3 = new ActionRowBuilder().addComponents(...btns);
    } else {
        rowInfo3 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('info3-voltar').setLabel('Voltar').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('info3-pular').setLabel('Pular').setStyle(ButtonStyle.Primary)
        );
    }
    // Exibe embed info3 com botões
    const embedInfo3 = new EmbedBuilder();
    if (info3Json.title) embedInfo3.setTitle(info3Json.title);
    if (info3Json.description) embedInfo3.setDescription(info3Json.description);
    if (info3Json.color_embed) embedInfo3.setColor(info3Json.color_embed);
    if (info3Json.color) embedInfo3.setColor(info3Json.color);
    if (info3Json.url) embedInfo3.setURL(info3Json.url);
    if (info3Json.timestamp) embedInfo3.setTimestamp(new Date(info3Json.timestamp));
    if (info3Json.footer) {
        if (typeof info3Json.footer === 'string') {
            embedInfo3.setFooter({ text: info3Json.footer });
        } else {
            embedInfo3.setFooter({ text: info3Json.footer.text || '', iconURL: info3Json.footer.icon_url || info3Json.footer.iconURL });
        }
    }
    if (info3Json.author) {
        if (typeof info3Json.author === 'string') {
            embedInfo3.setAuthor({ name: info3Json.author });
        } else {
            embedInfo3.setAuthor({ name: info3Json.author.name || '', iconURL: info3Json.author.icon_url || info3Json.author.iconURL, url: info3Json.author.url });
        }
    }
    if (info3Json.thumbnail) embedInfo3.setThumbnail(info3Json.thumbnail);
    if (info3Json.image) embedInfo3.setImage(info3Json.image);
    if (Array.isArray(info3Json.fields)) {
        info3Json.fields.forEach(f => {
            if (f && f.name && f.value) embedInfo3.addFields({ name: f.name, value: f.value, inline: !!f.inline });
        });
    }
    const sentInfo3Msg = await interaction.followUp({ embeds: [embedInfo3], components: [rowInfo3], ephemeral: true, fetchReply: true });
    // Handler dos botões info3-voltar e info3-pular
    const filterInfo3 = btn => (btn.customId === 'info3-voltar' || btn.customId === 'info3-pular') && btn.user.id === interaction.user.id;
    const collectedInfo3 = await sentInfo3Msg.awaitMessageComponent({ filter: filterInfo3, time: 60000 }).catch(() => null);
    if (collectedInfo3 && collectedInfo3.customId === 'info3-voltar') {
        await sentInfo3Msg.delete().catch(() => {});
        await interaction.followUp({ embeds: [embedInfoPadronizada2], ephemeral: true });
        return;
    }
    // Coleta input do usuário (número de celular)
    const celular = await new Promise((resolve) => {
        const filterMsg = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
        const collectorMsg = sentInfo3Msg.channel.createMessageCollector({ filter: filterMsg, max: 1, time: 120000 });
        collectorMsg.on('collect', mCel => resolve(mCel.content.trim()));
    });
    // Verifica se é um número de celular simples (ex: 10-13 dígitos)
    if (!/^\d{10,13}$/.test(celular)) {
        await interaction.followUp({ content: 'Por favor, envie um número de celular válido (apenas dígitos, 10 a 13 caracteres).', ephemeral: true });
        return;
    }
    await sentInfo3Msg.delete().catch(() => {});
    // Atualiza o celular no carrinho
    await new Promise((resolve) => {
        const dbCarrinhoCel = new sqlite3.Database(dbPath);
        dbCarrinhoCel.run('UPDATE carrinhos SET celular = ? WHERE user_id = ?', [celular, interaction.user.id], () => {
            dbCarrinhoCel.close();
            resolve();
        });
    });
    // Limpa o chat do usuário (apaga as últimas 20 mensagens do canal, se possível)
    try {
        const messages = await interaction.channel.messages.fetch({ limit: 20 });
        const userMsgs = messages.filter(msg => msg.author.id === interaction.user.id);
        for (const msg of userMsgs.values()) {
            await msg.delete().catch(() => {});
        }
    } catch (e) {}
    // Exibe embed de confirmação de compra
    const rowConfirma = await new Promise((resolve, reject) => {
        const dbConfirma = new sqlite3.Database(dbPath);
        dbConfirma.get('SELECT msg_confirmar_compra FROM paineis WHERE id = (SELECT id FROM paineis LIMIT 1)', (err, row) => {
            dbConfirma.close();
            if (err || !row || !row.msg_confirmar_compra) reject('❌ Erro ao buscar msg_confirmar_compra.');
            else resolve(row);
        });
    });
    const jsonConfirma = JSON.parse(rowConfirma.msg_confirmar_compra);
    const embedConfirma = new EmbedBuilder();
    if (jsonConfirma.title) embedConfirma.setTitle(jsonConfirma.title);
    if (jsonConfirma.description) embedConfirma.setDescription(jsonConfirma.description);
    if (jsonConfirma.color_embed) embedConfirma.setColor(jsonConfirma.color_embed);
    if (jsonConfirma.color) embedConfirma.setColor(jsonConfirma.color);
    if (jsonConfirma.url) embedConfirma.setURL(jsonConfirma.url);
    if (jsonConfirma.timestamp) embedConfirma.setTimestamp(new Date(jsonConfirma.timestamp));
    if (jsonConfirma.footer) {
        if (typeof jsonConfirma.footer === 'string') {
            embedConfirma.setFooter({ text: jsonConfirma.footer });
        } else {
            embedConfirma.setFooter({ text: jsonConfirma.footer.text || '', iconURL: jsonConfirma.footer.icon_url || jsonConfirma.footer.iconURL });
        }
    }
    if (jsonConfirma.author) {
        if (typeof jsonConfirma.author === 'string') {
            embedConfirma.setAuthor({ name: jsonConfirma.author });
        } else {
            embedConfirma.setAuthor({ name: jsonConfirma.author.name || '', iconURL: jsonConfirma.author.icon_url || jsonConfirma.author.iconURL, url: jsonConfirma.author.url });
        }
    }
    if (jsonConfirma.thumbnail) embedConfirma.setThumbnail(jsonConfirma.thumbnail);
    if (jsonConfirma.image) embedConfirma.setImage(jsonConfirma.image);
    if (Array.isArray(jsonConfirma.fields)) {
        jsonConfirma.fields.forEach(f => {
            if (f && f.name && f.value) embedConfirma.addFields({ name: f.name, value: f.value, inline: !!f.inline });
        });
    }
    // Botões do JSON
    const rowBtnConfirma = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('compr1id').setLabel('Confirmar').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('compr2id').setLabel('Voltar').setStyle(ButtonStyle.Secondary)
    );
    const sentConfirmaMsg = await interaction.followUp({ embeds: [embedConfirma], components: [rowBtnConfirma], ephemeral: true, fetchReply: true });
    // Handler dos botões de confirmação
    const filterConfirma = btn => (btn.customId === 'compr1id' || btn.customId === 'compr2id') && btn.user.id === interaction.user.id;
    const collectedConfirma = await sentConfirmaMsg.awaitMessageComponent({ filter: filterConfirma, time: 60000 }).catch(() => null);
    if (collectedConfirma && collectedConfirma.customId === 'compr2id') {
        await sentConfirmaMsg.delete().catch(() => {});
        if (typeof handleVoltarSelecaoProdutos === 'function') {
            handleVoltarSelecaoProdutos(interaction);
        } else {
            await interaction.followUp({ content: 'Fluxo de seleção de produtos não implementado.', ephemeral: true });
        }
        return;
    } else if (collectedConfirma && collectedConfirma.customId === 'compr1id') {
        await sentConfirmaMsg.delete().catch(() => {});
        if (typeof handleConfirmarCompra === 'function') {
            handleConfirmarCompra(interaction);
        } else {
            await interaction.followUp({ content: 'Fluxo de confirmação de compra não implementado.', ephemeral: true });
        }
        return;
    }
}

module.exports = { handleConfirmarInfo1 };
