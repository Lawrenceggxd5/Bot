const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'visual-button-handle',
    async handle(interaction, painelId) {
        // Se clicar em painel, pede JSON de 1 botão para o painel
        if (interaction.customId === `painel_${painelId}`) {
        // Se clicar em Voltar, mostra o menu principal de edição do painel
        if (interaction.customId === `voltar_visual_${painelId}`) {
            const { ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
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
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`confirmar_${painelId}`)
                    .setLabel('Confirmar')
                    .setStyle(ButtonStyle.Danger)
            );
            await interaction.reply({
                content: `Opções do painel [${painelId}]:`,
                components: [row],
                flags: 64
            });
            return;
        }
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`voltar_visual_${painelId}`)
                    .setLabel('Voltar')
                    .setStyle(ButtonStyle.Secondary)
            );
            await interaction.reply({
                content: `Envie um JSON para alterar o visual do painel.\n\nATENÇÃO: O campo salvo no banco é painel, então o ID deste JSON é sempre "painel".\n\nExemplo:\n\n\`\`\`json\n{\n  "title": "Novo Título!",\n  "description": "Nova descrição.",\n  "color_embed": "#00FF00",\n  "color_button": "#FF0000",\n  "msg_button": {\n    "content": "Bem-vindo ao painel!",\n    "components": [{ "type": 2, "label": "Acessar", "style": 1, "custom_id": "acessar" }]\n  },\n  "thumbnail": "url_da_thumbnail",\n  "image": "url_da_image"\n}\n\`\`\`\n\nClique em Voltar para retornar.`,
                components: [row],
                flags: 64 // MessageFlags.Ephemeral
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
                // Validação mínima
                if (!json.title || !json.description) {
                    return m.reply('❌ O JSON deve conter pelo menos title e description.');
                }
                // Salva tudo em painel
                const painelJson = JSON.stringify(json);
                const sqlite3 = require('sqlite3').verbose();
                const path = require('path');
                const dbPath = path.join(__dirname, '../painel.sqlite');
                const db = new sqlite3.Database(dbPath);
                db.run('UPDATE paineis SET painel = ? WHERE id = ?', [painelJson, painelId], err => {
                    db.close();
                    if (err) {
                        m.reply('❌ Erro ao atualizar o visual do painel.');
                    } else {
                        m.reply('✅ Visual do painel atualizado com sucesso!');
                    }
                });
            });
                collector.on('end', collected => {
                if (collected.size === 0) interaction.followUp({ content: 'Tempo esgotado. Nenhuma alteração feita.', flags: 64 });
            });
            return;
        }
    }
};
