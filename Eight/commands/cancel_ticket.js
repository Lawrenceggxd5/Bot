const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '../painel.sqlite');

// Handler para o botão msgid-2 (cancelar ticket)
module.exports = {
    async handleMsgid2(interaction, painelId) {
        const channel = interaction.channel;
        // Confirmação de cancelamento do ticket
        // Opcional: só permite cancelar se for canal de ticket
        if (!channel || !channel.name.startsWith('ticket-')) {
            return await interaction.reply({ content: '❌ Este comando só pode ser usado em um canal de ticket.', ephemeral: true });
        }
        // Busca os JSONs do painel
        const db = new sqlite3.Database(dbPath);
        db.get('SELECT msg_cancelamento, msg_cancelar_ticket, categoria_ticket_closed FROM paineis WHERE id = ?', [painelId], async (err, row) => {
            db.close();
            if (err || !row) {
                return interaction.reply({ content: '❌ Não foi possível carregar as mensagens do painel.', ephemeral: true });
            }
            // Primeiro embed: msg_cancelamento
            let cancelamentoJson, cancelarTicketJson;
            try {
                cancelamentoJson = JSON.parse(row.msg_cancelamento);
                cancelarTicketJson = JSON.parse(row.msg_cancelar_ticket);
            } catch (e) {
                return interaction.reply({ content: '❌ JSON inválido salvo para mensagens de cancelamento.', ephemeral: true });
            }
            // Cria embed e botões do cancelamento
            const embed = EmbedBuilder.from(cancelamentoJson.embed || { title: 'Cancelar Ticket', description: 'Deseja cancelar o ticket?' });
            const rowBtn = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('cancelar_cancelamento')
                    .setLabel(cancelamentoJson.components?.[0]?.label || 'Voltar')
                    .setStyle(ButtonStyle.Secondary)
                    // Suporte a emoji e emote
                    .setEmoji(cancelamentoJson.components?.[0]?.emoji || cancelamentoJson.components?.[0]?.emote || null),
                new ButtonBuilder()
                    .setCustomId('confirmar_cancelamento')
                    .setLabel(cancelamentoJson.components?.[1]?.label || 'Cancelar Ticket')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji(cancelamentoJson.components?.[1]?.emoji || cancelamentoJson.components?.[1]?.emote || null)
            );
            await interaction.reply({ embeds: [embed], components: [rowBtn], ephemeral: true });

            // Coleta interação dos botões
            const collector = channel.createMessageComponentCollector({ filter: i => i.user.id === interaction.user.id, time: 60000 });
            collector.on('collect', async i => {
                if (i.customId === 'cancelar_cancelamento') {
                    await i.update({ content: 'Cancelamento abortado.', embeds: [], components: [], ephemeral: true });
                    collector.stop();
                } else if (i.customId === 'confirmar_cancelamento') {
                    await i.message.delete();
                    // Segundo embed: msg_cancelar_ticket
                    const embed2 = EmbedBuilder.from(cancelarTicketJson.embed || { title: 'Confirmar Cancelamento', description: 'Tem certeza que deseja cancelar?' });
                    const rowBtn2 = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('voltar_cancelar_ticket')
                            .setLabel(cancelarTicketJson.components?.[0]?.label || 'Voltar')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji(cancelarTicketJson.components?.[0]?.emoji || cancelarTicketJson.components?.[0]?.emote || null),
                        new ButtonBuilder()
                            .setCustomId('confirmar_cancelar_ticket')
                            .setLabel(cancelarTicketJson.components?.[1]?.label || 'Confirmar Cancelamento')
                            .setStyle(ButtonStyle.Danger)
                            .setEmoji(cancelarTicketJson.components?.[1]?.emoji || cancelarTicketJson.components?.[1]?.emote || null)
                    );
                    await i.channel.send({ embeds: [embed2], components: [rowBtn2], ephemeral: true });
                } else if (i.customId === 'voltar_cancelar_ticket') {
                    await i.update({ content: 'Cancelamento abortado.', embeds: [], components: [], ephemeral: true });
                    collector.stop();
                } else if (i.customId === 'confirmar_cancelar_ticket') {
                    // Remove o usuário do canal e move para categoria_ticket_closed
                    try {
                        await channel.permissionOverwrites.edit(interaction.user.id, { VIEW_CHANNEL: false });
                    } catch (e) {}
                    if (row.categoria_ticket_closed) {
                        try {
                            await channel.setParent(row.categoria_ticket_closed);
                        } catch (e) {}
                    }
                    await i.update({ content: '🗑️ Ticket cancelado! Este canal será fechado.', embeds: [], components: [], ephemeral: true });
                    setTimeout(() => {
                        channel.delete('Ticket cancelado pelo usuário via botão.');
                    }, 2000);
                    collector.stop();
                }
            });
        });
    }
};
