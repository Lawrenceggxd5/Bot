// Handler para o botão de confirmação de compra (compr1id)
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '../painel.sqlite');

async function handleConfirmarCompra(interaction, painelId, valorCompra = 100, codigoPix = '1234567890', codigoPaypal = 'paypalcode', codigoCrypto = 'cryptocode', codigoCartao = 'cartaocode') {
    // valorCompra, codigoPix, etc, podem ser passados ou buscados do carrinho/DB
    // Busca o embed de métodos de pagamento do painel
    const db = new sqlite3.Database(dbPath);
    db.get('SELECT msg_metodos_pagamento, mg_pix, mg_paypal, mg_crypto, mg_cartao FROM paineis WHERE id = ?', [painelId], async (err, row) => {
        db.close();
        if (err || !row || !row.msg_metodos_pagamento) {
            return interaction.reply({ content: '❌ Erro ao buscar msg_metodos_pagamento.', ephemeral: true });
        }
        try {
            const json = JSON.parse(row.msg_metodos_pagamento);
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
            // 6 botões: Voltar, Pix, Paypal, Crypto, Cartão, Outras modalidades
            const rowBtn = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`voltar_metpag_${painelId}`),
                new ButtonBuilder().setCustomId(`abrir_pix_${painelId}`),
                new ButtonBuilder().setCustomId(`abrir_paypal_${painelId}`),
                new ButtonBuilder().setCustomId(`abrir_crypto_${painelId}`),
                new ButtonBuilder().setCustomId(`abrir_cartao_${painelId}`),
                new ButtonBuilder().setCustomId(`abrir_outras_${painelId}`)
            );
            // Definir label e style dos botões Voltar, Pix, Paypal, Crypto, Cartão, Outras modalidades pelo JSON
            if (Array.isArray(json.components)) {
                json.components.slice(0, 7).forEach((btnJson, idx) => {
                    if (btnJson) {
                        rowBtn.components[idx].setLabel(btnJson.label || `Botão ${idx+1}`);
                        rowBtn.components[idx].setStyle(btnJson.style ? ButtonStyle[btnJson.style] || ButtonStyle.Secondary : ButtonStyle.Secondary);
                    }
                });
            }
            await interaction.reply({ embeds: [embed], components: [rowBtn], ephemeral: true });

            // Collector para os botões
            const filter = i => i.user.id === interaction.user.id && i.message.id === interaction.message?.id;
            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 120000 });
            collector.on('collect', async i => {
                if (i.customId === `voltar_metpag_${painelId}`) {
                    // Voltar: configurações pelo JSON, ação: voltar para seleção anterior
                    await i.reply({ content: 'Voltando para seleção anterior...', ephemeral: true });
                } else if (i.customId === `abrir_outras_${painelId}`) {
                    // Handler de outras modalidades agora está em outro arquivo
                    // (implementar importação e chamada do handler externo aqui)
                    return;
                } else if (i.customId === `abrir_pix_${painelId}`) {
                    // PIX: monta embed e botões, gera QRCode Pix usando os campos do painel
                    const dbPix = new sqlite3.Database(dbPath);
                    dbPix.get('SELECT pix_chave, pix_versao, pix_name, pix_city, pix_message FROM paineis WHERE id = ?', [painelId], async (errPix, pixRow) => {
                        dbPix.close();
                        if (errPix || !pixRow || !pixRow.pix_chave || !pixRow.pix_versao || !pixRow.pix_name || !pixRow.pix_city) {
                            return i.reply({ content: '❌ Pix não configurado corretamente.', ephemeral: true });
                        }
                        // Gera o payload Pix e o QRCode usando a lib qrcode-pix
                        const { QrCodePix } = require('qrcode-pix');
                        const qr = QrCodePix({
                            version: pixRow.pix_versao,
                            key: pixRow.pix_chave,
                            name: pixRow.pix_name,
                            city: pixRow.pix_city,
                            value: valorCompra,
                            message: pixRow.pix_message || undefined
                        });
                        const payload = qr.payload();
                        const base64 = await qr.base64();
                        // Monta embed
                        // Substitui <codigo> pelo copia-e-cola Pix em todos os campos de texto do pixJson
                        let pixJsonStr = JSON.stringify(pixJson);
                        pixJsonStr = pixJsonStr.replace(/<codigo>/g, payload);
                        const pixJsonReplaced = JSON.parse(pixJsonStr);
                        const pixEmbed = new EmbedBuilder();
                        if (pixJsonReplaced.title) pixEmbed.setTitle(pixJsonReplaced.title);
                        if (pixJsonReplaced.description) pixEmbed.setDescription(pixJsonReplaced.description);
                        if (pixJsonReplaced.color_embed) pixEmbed.setColor(pixJsonReplaced.color_embed);
                        if (pixJsonReplaced.color) pixEmbed.setColor(pixJsonReplaced.color);
                        if (pixJsonReplaced.url) pixEmbed.setURL(pixJsonReplaced.url);
                        if (pixJsonReplaced.timestamp) pixEmbed.setTimestamp(new Date(pixJsonReplaced.timestamp));
                        if (pixJsonReplaced.footer) {
                            if (typeof pixJsonReplaced.footer === 'string') {
                                pixEmbed.setFooter({ text: pixJsonReplaced.footer });
                            } else {
                                pixEmbed.setFooter({ text: pixJsonReplaced.footer.text || '', iconURL: pixJsonReplaced.footer.icon_url || pixJsonReplaced.footer.iconURL });
                            }
                        }
                        if (pixJsonReplaced.author) {
                            if (typeof pixJsonReplaced.author === 'string') {
                                pixEmbed.setAuthor({ name: pixJsonReplaced.author });
                            } else {
                                pixEmbed.setAuthor({ name: pixJsonReplaced.author.name || '', iconURL: pixJsonReplaced.author.icon_url || pixJsonReplaced.author.iconURL, url: pixJsonReplaced.author.url });
                            }
                        }
                        if (pixJsonReplaced.thumbnail) pixEmbed.setThumbnail(pixJsonReplaced.thumbnail);
                        // Define o QRCode Pix como imagem (base64)
                        pixEmbed.setImage('attachment://pixqrcode.png');
                        // Adiciona o copia-e-cola Pix
                        pixEmbed.addFields({ name: 'Copia e Cola', value: `\`${payload}\`` });
                        if (Array.isArray(pixJsonReplaced.fields)) {
                            pixJsonReplaced.fields.forEach(f => {
                                if (f && f.name && f.value) pixEmbed.addFields({ name: f.name, value: f.value, inline: !!f.inline });
                            });
                        }
                        // Só define customId dos botões
                        let pixBtns = [];
                        if (Array.isArray(pixJson.components)) {
                            pixBtns = pixJson.components.slice(0, 5).map((btn, idx) => {
                                const b = new ButtonBuilder().setCustomId(btn.custom_id || `pix_btn_${idx+1}`);
                                if (btn.label) b.setLabel(btn.label);
                                if (btn.style) b.setStyle(ButtonStyle[btn.style] || ButtonStyle.Secondary);
                                return b;
                            });
                        }
                        await i.reply({
                            embeds: [pixEmbed],
                            components: [new ActionRowBuilder().addComponents(...pixBtns)],
                            files: [{ attachment: Buffer.from(base64.split(',')[1], 'base64'), name: 'pixqrcode.png' }],
                            ephemeral: true
                        });
                    });
                } else if (i.customId === `abrir_paypal_${painelId}`) {
                    // PAYPAL: abre embed com json paypal, 4 botões, image = qrcode paypal, <codigo> = link Paypal, <preço> = valorCompra
                    if (!row.mg_paypal) return i.reply({ content: '❌ Método Paypal não configurado.', ephemeral: true });
                    // Busca as infos do painel
                    const dbPaypal = new sqlite3.Database(dbPath);
                    dbPaypal.get('SELECT paypal_link, paypal_nome FROM paineis WHERE id = ?', [painelId], async (errPaypal, paypalRow) => {
                        dbPaypal.close();
                        if (errPaypal || !paypalRow || !paypalRow.paypal_link) {
                            return i.reply({ content: '❌ Paypal não configurado corretamente.', ephemeral: true });
                        }
                        const linkPaypal = paypalRow.paypal_link;
                        const nomePaypal = paypalRow.paypal_nome || '';
                        // Monta o link final (PayPal.Me ou link customizado)
                        let finalLink = linkPaypal;
                        // Se for PayPal.Me, adiciona valor
                        if (/paypal\.me\//i.test(linkPaypal)) {
                            finalLink = linkPaypal.replace(/\/$/, '') + `/${valorCompra}`;
                        } else if (/^https:\/\//.test(linkPaypal)) {
                            // Se já for link completo, só usa
                        } else if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(linkPaypal)) {
                            // Se for e-mail, monta link padrão
                            finalLink = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${encodeURIComponent(linkPaypal)}&amount=${valorCompra}&currency_code=BRL`;
                            if (nomePaypal) finalLink += `&item_name=${encodeURIComponent(nomePaypal)}`;
                        }
                        // Copia e cola = link final
                        let paypalJson = JSON.parse(row.mg_paypal);
                        if (paypalJson.content) {
                            paypalJson.content = paypalJson.content.replace(/<codigo>/g, finalLink).replace(/<preço>/g, valorCompra);
                        }
                        if (Array.isArray(paypalJson.components)) {
                            paypalJson.components = paypalJson.components.map(btn => {
                                if (btn.label) btn.label = btn.label.replace(/<codigo>/g, finalLink).replace(/<preço>/g, valorCompra);
                                if (btn.custom_id) btn.custom_id = btn.custom_id.replace(/<codigo>/g, finalLink).replace(/<preço>/g, valorCompra);
                                return btn;
                            });
                        }
                        const paypalEmbed = new EmbedBuilder();
                        if (paypalJson.title) paypalEmbed.setTitle(paypalJson.title);
                        if (paypalJson.description) paypalEmbed.setDescription(paypalJson.description);
                        if (paypalJson.color_embed) paypalEmbed.setColor(paypalJson.color_embed);
                        if (paypalJson.color) paypalEmbed.setColor(paypalJson.color);
                        if (paypalJson.url) paypalEmbed.setURL(paypalJson.url);
                        if (paypalJson.timestamp) paypalEmbed.setTimestamp(new Date(paypalJson.timestamp));
                        if (paypalJson.footer) {
                            if (typeof paypalJson.footer === 'string') {
                                paypalEmbed.setFooter({ text: paypalJson.footer });
                            } else {
                                paypalEmbed.setFooter({ text: paypalJson.footer.text || '', iconURL: paypalJson.footer.icon_url || paypalJson.footer.iconURL });
                            }
                        }
                        if (paypalJson.author) {
                            if (typeof paypalJson.author === 'string') {
                                paypalEmbed.setAuthor({ name: paypalJson.author });
                            } else {
                                paypalEmbed.setAuthor({ name: paypalJson.author.name || '', iconURL: paypalJson.author.icon_url || paypalJson.author.iconURL, url: paypalJson.author.url });
                            }
                        }
                        if (paypalJson.thumbnail) paypalEmbed.setThumbnail(paypalJson.thumbnail);
                        // Substitui image por qrcode paypal
                        paypalEmbed.setImage('https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(finalLink));
                        // Adiciona o copia-e-cola do Paypal
                        paypalEmbed.addFields({ name: 'Copia e Cola Paypal', value: `\`${finalLink}\`` });
                        if (Array.isArray(paypalJson.fields)) {
                            paypalJson.fields.forEach(f => {
                                if (f && f.name && f.value) paypalEmbed.addFields({ name: f.name, value: f.value, inline: !!f.inline });
                            });
                        }
                        // 4 botões do JSON
                        let paypalBtns = [];
                        if (Array.isArray(paypalJson.components)) {
                            paypalBtns = paypalJson.components.slice(0, 4).map((btn, idx) =>
                                new ButtonBuilder()
                                    .setCustomId(btn.custom_id || `paypal_btn_${idx+1}`)
                                    .setLabel(btn.label || `Botão ${idx+1}`)
                                    .setStyle(btn.style ? ButtonStyle[btn.style] || ButtonStyle.Secondary : ButtonStyle.Secondary)
                            );
                        }
                        await i.reply({ embeds: [paypalEmbed], components: [new ActionRowBuilder().addComponents(...paypalBtns)], ephemeral: true });
                    });
                } else if (i.customId === `abrir_crypto_${painelId}`) {
                    // CRYPTO: integra com NOWPayments para gerar QRCode e copia-e-cola dinâmico
                    if (!row.mg_crypto) return i.reply({ content: '❌ Método Crypto não configurado.', ephemeral: true });
                    // Buscar currency e api_key do painel
                    const dbCrypto = new sqlite3.Database(dbPath);
                    dbCrypto.get('SELECT crypto_currency, crypto_api_key FROM paineis WHERE id = ?', [painelId], async (errCrypto, cryptoRow) => {
                        dbCrypto.close();
                        if (errCrypto || !cryptoRow || !cryptoRow.crypto_currency || !cryptoRow.crypto_api_key) {
                            return i.reply({ content: '❌ Crypto não configurado corretamente (currency ou API Key ausente).', ephemeral: true });
                        }
                        // Chama a API da NOWPayments para criar o pagamento
                        const axios = require('axios');
                        let paymentData;
                        try {
                            const res = await axios.post('https://api.nowpayments.io/v1/invoice', {
                                price_amount: valorCompra,
                                price_currency: 'brl',
                                pay_currency: cryptoRow.crypto_currency,
                                order_id: `${painelId}_${Date.now()}`
                            }, {
                                headers: {
                                    'x-api-key': cryptoRow.crypto_api_key,
                                    'Content-Type': 'application/json'
                                }
                            });
                            paymentData = res.data;
                        } catch (err) {
                            return i.reply({ content: '❌ Erro ao criar pagamento na NOWPayments: ' + (err.response?.data?.message || err.message), ephemeral: true });
                        }
                        // O copia-e-cola é o endereço + valor
                        const copiaCola = `${paymentData.pay_address}`;
                        // O QR code pode ser gerado do payment_url
                        const qrUrl = paymentData.invoice_url || paymentData.payment_url || '';
                        // Monta embed substituindo <codigo> pelo copia-e-cola
                        let cryptoJson = JSON.parse(row.mg_crypto);
                        let cryptoJsonStr = JSON.stringify(cryptoJson);
                        cryptoJsonStr = cryptoJsonStr.replace(/<codigo>/g, copiaCola).replace(/<preço>/g, valorCompra);
                        const cryptoJsonReplaced = JSON.parse(cryptoJsonStr);
                        const cryptoEmbed = new EmbedBuilder();
                        if (cryptoJsonReplaced.title) cryptoEmbed.setTitle(cryptoJsonReplaced.title);
                        if (cryptoJsonReplaced.description) cryptoEmbed.setDescription(cryptoJsonReplaced.description);
                        if (cryptoJsonReplaced.color_embed) cryptoEmbed.setColor(cryptoJsonReplaced.color_embed);
                        if (cryptoJsonReplaced.color) cryptoEmbed.setColor(cryptoJsonReplaced.color);
                        if (cryptoJsonReplaced.url) cryptoEmbed.setURL(cryptoJsonReplaced.url);
                        if (cryptoJsonReplaced.timestamp) cryptoEmbed.setTimestamp(new Date(cryptoJsonReplaced.timestamp));
                        if (cryptoJsonReplaced.footer) {
                            if (typeof cryptoJsonReplaced.footer === 'string') {
                                cryptoEmbed.setFooter({ text: cryptoJsonReplaced.footer });
                            } else {
                                cryptoEmbed.setFooter({ text: cryptoJsonReplaced.footer.text || '', iconURL: cryptoJsonReplaced.footer.icon_url || cryptoJsonReplaced.footer.iconURL });
                            }
                        }
                        if (cryptoJsonReplaced.author) {
                            if (typeof cryptoJsonReplaced.author === 'string') {
                                cryptoEmbed.setAuthor({ name: cryptoJsonReplaced.author });
                            } else {
                                cryptoEmbed.setAuthor({ name: cryptoJsonReplaced.author.name || '', iconURL: cryptoJsonReplaced.author.icon_url || cryptoJsonReplaced.author.iconURL, url: cryptoJsonReplaced.author.url });
                            }
                        }
                        if (cryptoJsonReplaced.thumbnail) cryptoEmbed.setThumbnail(cryptoJsonReplaced.thumbnail);
                        // Substitui image por qrcode do payment_url
                        if (qrUrl) cryptoEmbed.setImage('https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(qrUrl));
                        // Adiciona o copia-e-cola
                        cryptoEmbed.addFields({ name: 'Copia e Cola Crypto', value: `${copiaCola}` });
                        if (Array.isArray(cryptoJsonReplaced.fields)) {
                            cryptoJsonReplaced.fields.forEach(f => {
                                if (f && f.name && f.value) cryptoEmbed.addFields({ name: f.name, value: f.value, inline: !!f.inline });
                            });
                        }
                        // 4 botões do JSON
                        let cryptoBtns = [];
                        if (Array.isArray(cryptoJsonReplaced.components)) {
                            cryptoBtns = cryptoJsonReplaced.components.slice(0, 4).map((btn, idx) =>
                                new ButtonBuilder()
                                    .setCustomId(btn.custom_id || `crypto_btn_${idx+1}`)
                                    .setLabel(btn.label || `Botão ${idx+1}`)
                                    .setStyle(btn.style ? ButtonStyle[btn.style] || ButtonStyle.Secondary : ButtonStyle.Secondary)
                            );
                        }
                        await i.reply({ embeds: [cryptoEmbed], components: [new ActionRowBuilder().addComponents(...cryptoBtns)], ephemeral: true });
                    });
                } else if (i.customId === `abrir_cartao_${painelId}`) {
                    // CARTÃO: gera QRCode e substitui <codigo> no embed
                    if (!row.mg_cartao) return i.reply({ content: '❌ Método Cartão não configurado.', ephemeral: true });
                    let cartaoJson = JSON.parse(row.mg_cartao);
                    const copiaCola = codigoCartao;
                    let cartaoJsonStr = JSON.stringify(cartaoJson);
                    cartaoJsonStr = cartaoJsonStr.replace(/<codigo>/g, copiaCola).replace(/<preço>/g, valorCompra);
                    const cartaoJsonReplaced = JSON.parse(cartaoJsonStr);
                    const cartaoEmbed = new EmbedBuilder();
                    if (cartaoJsonReplaced.title) cartaoEmbed.setTitle(cartaoJsonReplaced.title);
                    if (cartaoJsonReplaced.description) cartaoEmbed.setDescription(cartaoJsonReplaced.description);
                    if (cartaoJsonReplaced.color_embed) cartaoEmbed.setColor(cartaoJsonReplaced.color_embed);
                    if (cartaoJsonReplaced.color) cartaoEmbed.setColor(cartaoJsonReplaced.color);
                    if (cartaoJsonReplaced.url) cartaoEmbed.setURL(cartaoJsonReplaced.url);
                    if (cartaoJsonReplaced.timestamp) cartaoEmbed.setTimestamp(new Date(cartaoJsonReplaced.timestamp));
                    if (cartaoJsonReplaced.footer) {
                        if (typeof cartaoJsonReplaced.footer === 'string') {
                            cartaoEmbed.setFooter({ text: cartaoJsonReplaced.footer });
                        } else {
                            cartaoEmbed.setFooter({ text: cartaoJsonReplaced.footer.text || '', iconURL: cartaoJsonReplaced.footer.icon_url || cartaoJsonReplaced.footer.iconURL });
                        }
                    }
                    if (cartaoJsonReplaced.author) {
                        if (typeof cartaoJsonReplaced.author === 'string') {
                            cartaoEmbed.setAuthor({ name: cartaoJsonReplaced.author });
                        } else {
                            cartaoEmbed.setAuthor({ name: cartaoJsonReplaced.author.name || '', iconURL: cartaoJsonReplaced.author.icon_url || cartaoJsonReplaced.author.iconURL, url: cartaoJsonReplaced.author.url });
                        }
                    }
                    if (cartaoJsonReplaced.thumbnail) cartaoEmbed.setThumbnail(cartaoJsonReplaced.thumbnail);
                    // Substitui image por QRCode do copia-e-cola
                    cartaoEmbed.setImage('https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(copiaCola));
                    if (Array.isArray(cartaoJsonReplaced.fields)) {
                        cartaoJsonReplaced.fields.forEach(f => {
                            if (f && f.name && f.value) cartaoEmbed.addFields({ name: f.name, value: f.value, inline: !!f.inline });
                        });
                    }
                    // 4 botões do JSON
                    let cartaoBtns = [];
                    if (Array.isArray(cartaoJsonReplaced.components)) {
                        cartaoBtns = cartaoJsonReplaced.components.slice(0, 4).map((btn, idx) =>
                            new ButtonBuilder()
                                .setCustomId(btn.custom_id || `cartao_btn_${idx+1}`)
                                .setLabel(btn.label || `Botão ${idx+1}`)
                                .setStyle(btn.style ? ButtonStyle[btn.style] || ButtonStyle.Secondary : ButtonStyle.Secondary)
                        );
                    }
                    await i.reply({ embeds: [cartaoEmbed], components: [new ActionRowBuilder().addComponents(...cartaoBtns)], ephemeral: true });
                }
            });
        } catch (e) {
            interaction.reply({ content: '❌ Erro ao montar o embed msg_metodos_pagamento.', ephemeral: true });
        }
    });
}

module.exports = { handleConfirmarCompra };
