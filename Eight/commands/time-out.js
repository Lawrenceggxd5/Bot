// Handlers para os botões de timeout 1, 2, 3 e 4
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '../painel.sqlite');

async function handleTimeout(interaction, timeoutField, timeoutLabel) {
    const painelId = interaction.customId.split('_').pop();
    const rowVoltar = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`voltar_timeout_${painelId}`)
            .setLabel('Voltar')
            .setStyle(ButtonStyle.Secondary)
    );
    await interaction.reply({
        content: `Envie o JSON do embed para ${timeoutLabel} (sem botões):`,
        components: [rowVoltar],
        flags: 64
    });
    const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
    const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });
    collector.on('collect', m => {
        let jsonStr = m.content.trim();
        try {
            const json = JSON.parse(jsonStr);
            if (json.msg_button) delete json.msg_button; // Remove botões se vierem
            jsonStr = JSON.stringify(json);
        } catch (e) {
            return m.reply('❌ JSON inválido. Envie um JSON válido de embed.');
        }
        const db = new sqlite3.Database(dbPath);
        db.run(`UPDATE paineis SET ${timeoutField} = ? WHERE id = ?`, [jsonStr, painelId], err => {
            db.close();
            if (err) {
                m.reply('❌ Erro ao salvar o JSON no banco.');
            } else {
                m.reply(`✅ Embed de ${timeoutLabel} salvo com sucesso!`);
            }
        });
    });
    collector.on('end', async collected => {
        if (collected.size === 0) {
            // Timeout AFK: remove acesso do usuário ao canal/ticket
            try {
                // Remove permissões do usuário
                if (interaction.channel && interaction.member) {
                    await interaction.channel.permissionOverwrites.edit(interaction.user.id, { VIEW_CHANNEL: false });
                }
            } catch {}
            // Envia mensagem com botão para deletar o ticket
            const rowDelete = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`deletar_ticket_${painelId}`)
                    .setLabel('Deletar ticket')
                    .setStyle(ButtonStyle.Danger)
            );
            await interaction.channel.send({ content: 'Deletar ticket?', components: [rowDelete] });
        }
    });
}

module.exports = {
    async handleTimeout1(interaction) {
        await handleTimeout(interaction, 'timeout_1', 'Timeout 1');
    },
    async handleTimeout2(interaction) {
        await handleTimeout(interaction, 'timeout_2', 'Timeout 2');
    },
    async handleTimeout3(interaction) {
        await handleTimeout(interaction, 'timeout_3', 'Timeout 3');
    },
    async handleTimeout4(interaction) {
        await handleTimeout(interaction, 'timeout_4', 'Timeout 4');
    },
    // Handler para botão voltar
    async handleVoltarTimeout(interaction) {
        // Aqui você pode redirecionar para o menu anterior de configuração de timeouts
        await interaction.reply({ content: 'Voltando ao menu anterior...', flags: 64 });
    },
    // Handler para deletar ticket
    async handleDeletarTicket(interaction) {
        // Só executa se for o botão correto
        if (!interaction.customId.startsWith('deletar_ticket_')) return;
        try {
            // Buscar categoria_ticket_fechado do painel
            const painelId = interaction.customId.split('_').pop();
            const sqlite3 = require('sqlite3').verbose();
            const path = require('path');
            const dbPath = path.join(__dirname, '../painel.sqlite');
            const db = new sqlite3.Database(dbPath);
            db.get('SELECT CategoriaTicketFechado FROM paineis WHERE id = ?', [painelId], async (err, row) => {
                db.close();
                if (!err && row && row.CategoriaTicketFechado && interaction.channel && interaction.channel.setParent) {
                    try {
                        await interaction.channel.setParent(row.CategoriaTicketFechado, { lockPermissions: false });
                    } catch {}
                }
                // Aguarda 2 segundos para garantir a troca de categoria antes de deletar
                setTimeout(async () => {
                    try {
                        await interaction.channel.delete();
                    } catch (e) {
                        await interaction.reply({ content: '❌ Erro ao deletar o ticket.', flags: 64 });
                    }
                }, 2000);
            });
        } catch (e) {
            await interaction.reply({ content: '❌ Erro ao deletar o ticket.', flags: 64 });
        }
    },
    // Handler genérico para uso externo
    async handle(interaction) {
        // Detecta qual timeout pelo customId
        if (interaction.customId.startsWith('timeout_1')) return module.exports.handleTimeout1(interaction);
        if (interaction.customId.startsWith('timeout_2')) return module.exports.handleTimeout2(interaction);
        if (interaction.customId.startsWith('timeout_3')) return module.exports.handleTimeout3(interaction);
        if (interaction.customId.startsWith('timeout_4')) return module.exports.handleTimeout4(interaction);
        // Voltar
        if (interaction.customId.startsWith('voltar_timeout_')) return module.exports.handleVoltarTimeout(interaction);
        // Deletar ticket
        if (interaction.customId.startsWith('deletar_ticket_')) return module.exports.handleDeletarTicket(interaction);
        // Se não for nenhum dos acima, não faz nada
        return;
    }
};
