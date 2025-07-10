// Outras modalidades: pede JSON de 1 botão e salva em mg_outras
async function handleOutrasModalidades(interaction, painelId) {
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`metpag-voltar_${painelId}`).setLabel('Voltar').setStyle(ButtonStyle.Secondary)
    );
    await interaction.reply({
        content: 'Envie o JSON para o método Outras modalidades (campo salvo: mg_outras). O JSON deve conter 1 botão. Você pode usar <codigo> no texto!',
        components: [row],
        flags: 64
    });
    const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
    const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });
    collector.on('collect', m => {
        let json;
        try {
            json = JSON.parse(m.content);
            if (!json.components || !Array.isArray(json.components) || json.components.length !== 1) {
                return m.reply('❌ O JSON deve conter exatamente 1 botão no array "components".');
            }
        } catch (e) {
            return m.reply('❌ JSON inválido. Tente novamente enviando um JSON válido.');
        }
        const db2 = new sqlite3.Database(dbPath);
        db2.run('UPDATE paineis SET mg_outras = ? WHERE id = ?', [m.content, painelId], err => {
            db2.close();
            if (err) {
                m.reply('❌ Erro ao salvar o método Outras modalidades.');
            } else {
                m.reply('✅ Método Outras modalidades salvo com sucesso!');
            }
        });
    });
}
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '../painel.sqlite');

module.exports = {
    async handle(interaction, painelId) {
        // Sempre que abrir esse handle, mostra 6 botões: voltar, visual, pix, paypal, crypto, cartão, outras modalidades
        if (interaction.customId === `msg_metodos_pagamento_${painelId}` || interaction.customId === `metodos_pagamento_${painelId}`) {
            // Máximo 5 botões por ActionRow!
            const row1 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`metpag-voltar_${painelId}`).setLabel('Voltar').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId(`metpag-visual_${painelId}`).setLabel('Visual').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId(`metpag-pix_${painelId}`).setLabel('Pix').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId(`metpag-paypal_${painelId}`).setLabel('Paypal').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId(`metpag-crypto_${painelId}`).setLabel('Crypto').setStyle(ButtonStyle.Primary)
            );
            const row2 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`metpag-cartao_${painelId}`).setLabel('Cartão').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId(`metpag-outras_${painelId}`).setLabel('Outras modalidades').setStyle(ButtonStyle.Secondary)
            );
            await interaction.reply({
                content: 'Escolha uma modalidade de pagamento para configurar ou visualizar.\n\n- O botão "Visual" permite configurar um JSON livre para métodos de pagamento.\n- Os botões Pix, Paypal, Crypto e Cartão vão pedir um JSON com 4 botões (pode usar <codigo> no texto).',
                components: [row1, row2],
                flags: 64
            });
            return;
        }
        // Outras modalidades
        if (interaction.customId.startsWith('metpag-outras_')) {
            await handleOutrasModalidades(interaction, painelId);
            return;
        }

        // Voltar: volta para seleção anterior
        if (interaction.customId.startsWith('metpag-voltar_')) {
            // Aqui você pode chamar o handler de voltar para seleção anterior
            return interaction.reply({ content: 'Voltando para seleção anterior...', ephemeral: true });
        }

        // Visual: pede JSON de 6 botões e salva em mg_metodo_pagamento
        if (interaction.customId.startsWith('metpag-visual_')) {
            await interaction.reply({ content: 'Envie o JSON para o método de pagamento visual (campo salvo: mg_metodo_pagamento). O JSON deve conter 8 botões. Você pode usar <codigo> no texto!', ephemeral: true });
            const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });
            collector.on('collect', m => {
                let json;
                try {
                    json = JSON.parse(m.content);
                    if (!json.components || !Array.isArray(json.components) || json.components.length !== 6) {
                        return m.reply('❌ O JSON deve conter exatamente 6 botões no array "components".');
                    }
                } catch (e) {
                    return m.reply('❌ JSON inválido. Tente novamente enviando um JSON válido.');
                }
                const db2 = new sqlite3.Database(dbPath);
                db2.run('UPDATE paineis SET mg_metodo_pagamento = ? WHERE id = ?', [m.content, painelId], err => {
                    db2.close();
                    if (err) {
                        m.reply('❌ Erro ao salvar o método de pagamento visual.');
                    } else {
                        m.reply('✅ Método de pagamento visual salvo com sucesso!');
                    }
                });
            });
            return;
        }

        // Pix: pede JSON de 4 botões e salva em mg_pix
        if (interaction.customId.startsWith('metpag-pix_')) {
            await interaction.reply({ content: 'Envie o JSON para o método Pix (campo salvo: mg_pix).\nO JSON deve conter 4 botões. Você pode usar <codigo> no texto!', ephemeral: true });
            const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });
            collector.on('collect', m => {
                let json;
                try {
                    json = JSON.parse(m.content);
                    if (!json.components || !Array.isArray(json.components) || json.components.length !== 4) {
                        return m.reply('❌ O JSON deve conter exatamente 4 botões no array "components".');
                    }
                } catch (e) {
                    return m.reply('❌ JSON inválido. Tente novamente enviando um JSON válido.');
                }
                const db2 = new sqlite3.Database(dbPath);
                db2.run('UPDATE paineis SET mg_pix = ? WHERE id = ?', [m.content, painelId], err => {
                    db2.close();
                    if (err) {
                        m.reply('❌ Erro ao salvar o método Pix.');
                    } else {
                        m.reply('✅ Método Pix salvo com sucesso!');
                    }
                });
            });
            return;
        }

        // Paypal: pede JSON de 4 botões e salva em mg_paypal
        if (interaction.customId.startsWith('metpag-paypal_')) {
            await interaction.reply({ content: 'Envie o JSON para o método Paypal (campo salvo: mg_paypal).\nO JSON deve conter 4 botões. Você pode usar <codigo> no texto!', ephemeral: true });
            const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });
            collector.on('collect', m => {
                let json;
                try {
                    json = JSON.parse(m.content);
                    if (!json.components || !Array.isArray(json.components) || json.components.length !== 4) {
                        return m.reply('❌ O JSON deve conter exatamente 4 botões no array "components".');
                    }
                } catch (e) {
                    return m.reply('❌ JSON inválido. Tente novamente enviando um JSON válido.');
                }
                const db2 = new sqlite3.Database(dbPath);
                db2.run('UPDATE paineis SET mg_paypal = ? WHERE id = ?', [m.content, painelId], err => {
                    db2.close();
                    if (err) {
                        m.reply('❌ Erro ao salvar o método Paypal.');
                    } else {
                        m.reply('✅ Método Paypal salvo com sucesso!');
                    }
                });
            });
            return;
        }

        // Crypto: pede JSON de 4 botões e salva em mg_crypto
        if (interaction.customId.startsWith('metpag-crypto_')) {
            await interaction.reply({ content: 'Envie o JSON para o método Crypto (campo salvo: mg_crypto).\nO JSON deve conter 4 botões. Você pode usar <codigo> no texto!', ephemeral: true });
            const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });
            collector.on('collect', m => {
                let json;
                try {
                    json = JSON.parse(m.content);
                    if (!json.components || !Array.isArray(json.components) || json.components.length !== 4) {
                        return m.reply('❌ O JSON deve conter exatamente 4 botões no array "components".');
                    }
                } catch (e) {
                    return m.reply('❌ JSON inválido. Tente novamente enviando um JSON válido.');
                }
                const db2 = new sqlite3.Database(dbPath);
                db2.run('UPDATE paineis SET mg_crypto = ? WHERE id = ?', [m.content, painelId], err => {
                    db2.close();
                    if (err) {
                        m.reply('❌ Erro ao salvar o método Crypto.');
                    } else {
                        m.reply('✅ Método Crypto salvo com sucesso!');
                    }
                });
            });
            return;
        }

        // Cartão: pede JSON de 4 botões e salva em mg_cartao
        if (interaction.customId.startsWith('metpag-cartao_')) {
            await interaction.reply({ content: 'Envie o JSON para o método Cartão (campo salvo: mg_cartao).\nO JSON deve conter 4 botões. Você pode usar <codigo> no texto!', ephemeral: true });
            const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });
            collector.on('collect', m => {
                let json;
                try {
                    json = JSON.parse(m.content);
                    if (!json.components || !Array.isArray(json.components) || json.components.length !== 4) {
                        return m.reply('❌ O JSON deve conter exatamente 4 botões no array "components".');
                    }
                } catch (e) {
                    return m.reply('❌ JSON inválido. Tente novamente enviando um JSON válido.');
                }
                const db2 = new sqlite3.Database(dbPath);
                db2.run('UPDATE paineis SET mg_cartao = ? WHERE id = ?', [m.content, painelId], err => {
                    db2.close();
                    if (err) {
                        m.reply('❌ Erro ao salvar o método Cartão.');
                    } else {
                        m.reply('✅ Método Cartão salvo com sucesso!');
                    }
                });
            });
            return;
        }
    }
};
