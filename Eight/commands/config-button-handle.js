const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'config-button-handle',
    async handle(interaction, painelId) {
        // Se clicar em CategoriaTicketFechado, pede o ID da categoria e salva no banco
        if (interaction.customId === `categoria_ticket_fechado_${painelId}`) {
            await interaction.reply({
                content: 'Envie o ID da categoria onde o ticket FECHADO deve ser movido:',
                ephemeral: true
            });
            const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 60000 });
            collector.on('collect', m => {
                const categoriaId = m.content.trim();
                if (!/^[0-9]{17,20}$/.test(categoriaId)) {
                    return m.reply('❌ ID de categoria inválido. Envie apenas números.');
                }
                const sqlite3 = require('sqlite3').verbose();
                const path = require('path');
                const dbPath = path.join(__dirname, '../painel.sqlite');
                const db = new sqlite3.Database(dbPath);
                db.run('UPDATE paineis SET CategoriaTicketFechado = ? WHERE id = ?', [categoriaId, painelId], err => {
                    db.close();
                    if (err) {
                        m.reply('❌ Erro ao salvar o ID da categoria fechada.');
                    } else {
                        m.reply('✅ Categoria de ticket fechado atualizada com sucesso!');
                    }
                });
            });
            collector.on('end', collected => {
                if (collected.size === 0) interaction.followUp({ content: 'Tempo esgotado. Nenhuma alteração feita.', ephemeral: true });
            });
            return;
        }
        // Se clicar em Voltar, volta para seleção anterior (Painel, Ticket, Configurações)
        if (interaction.customId === `painel_${painelId}`) {
            const rowAnterior = new ActionRowBuilder().addComponents(
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
            await interaction.reply({
                content: `Opções do painel [${painelId}]:`,
                components: [rowAnterior],
                ephemeral: true
            });
            return;
        }
        // Se clicar em CategoriaTicket, pede o ID da categoria e salva no banco
        if (interaction.customId === `categoria_ticket_${painelId}`) {
            await interaction.reply({
                content: 'Envie o ID da categoria onde o ticket deve ser aberto:',
                ephemeral: true
            });
            const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 60000 });
            collector.on('collect', m => {
                const categoriaId = m.content.trim();
                if (!/^[0-9]{17,20}$/.test(categoriaId)) {
                    return m.reply('❌ ID de categoria inválido. Envie apenas números.');
                }
                const sqlite3 = require('sqlite3').verbose();
                const path = require('path');
                const dbPath = path.join(__dirname, '../painel.sqlite');
                const db = new sqlite3.Database(dbPath);
                db.run('UPDATE paineis SET categoria_ticket = ? WHERE id = ?', [categoriaId, painelId], err => {
                    db.close();
                    if (err) {
                        m.reply('❌ Erro ao salvar o ID da categoria.');
                    } else {
                        m.reply('✅ Categoria do ticket atualizada com sucesso!');
                    }
                });
            });
            collector.on('end', collected => {
                if (collected.size === 0) interaction.followUp({ content: 'Tempo esgotado. Nenhuma alteração feita.', ephemeral: true });
            });
            return;
        }
        // Mostra botões: Voltar, CategoriaTicket, CategoriaTicketFechado
        // Lista de botões
        const buttons = [
            new ButtonBuilder()
                .setCustomId(`painel_${painelId}`)
                .setLabel('Voltar')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId(`pix_config_${painelId}`)
                .setLabel('Pix')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`paypal_config_${painelId}`)
                .setLabel('Paypal')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`crypto_config_${painelId}`)
                .setLabel('Crypto')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`mercadopago_config_${painelId}`)
                .setLabel('MercadoPago')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`categoria_ticket_${painelId}`)
                .setLabel('CategoriaTicket')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`categoria_ticket_fechado_${painelId}`)
                .setLabel('CategoriaTicketFechado')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`categoria_ticket_outrosmetodos_${painelId}`)
                .setLabel('CategoriaTicketOutrosMetodos')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`categoria_ticket_pagos_${painelId}`)
                .setLabel('CategoriaTicketPagos')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`categoria_ticket_pagar_${painelId}`)
                .setLabel('CategoriaTicketPagar')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`categoria_produtos_${painelId}`)
                .setLabel('Categoria_Produtos')
                .setStyle(ButtonStyle.Primary)
        ];
        const rowVoltar = new ActionRowBuilder().addComponents(...buttons);
        // Só envia ActionRow se houver de 1 a 5 botões
        let replyOptions = { content: 'Envie o ID da categoria para tickets PAGAR:', ephemeral: true };
        if (buttons.length > 0 && buttons.length <= 5) {
            replyOptions.components = [rowVoltar];
        }
        await interaction.reply(replyOptions);
        const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
        const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 60000 });
        collector.on('collect', m => {
            const categoriaId = m.content.trim();
            if (!/^[0-9]{17,20}$/.test(categoriaId)) {
                return m.reply('❌ ID de categoria inválido. Envie apenas números.');
            }
            const fs = require('fs');
            const path = require('path');
            const dbPath = path.join(__dirname, '../db.js');
            let db = {};
            if (fs.existsSync(dbPath)) {
                try { db = require(dbPath); } catch {}
            }
            db.CategoriaTicketPagar = categoriaId;
            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
            m.reply('✅ Categoria de tickets PAGAR salva com sucesso!');
        });
        collector.on('end', collected => {
            if (collected.size === 0) interaction.followUp({ content: 'Tempo esgotado. Nenhuma alteração feita.', ephemeral: true });
        });
        return;
    }
}
