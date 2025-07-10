const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const dbPath = path.join(__dirname, '../painel.sqlite');

module.exports = {
    name: 'editarpainel',
    description: 'Exibe o painel pelo ID e mostra 4 botões: Painel, Ticket, Configurações, Confirmar.',
    async execute(client, message, args) {
        try {
            const id = args[0];
            if (!id) return message.reply('❌ Forneça o ID do painel. Ex: !editarpainel vip');
            const db = new sqlite3.Database(dbPath);
            db.get('SELECT * FROM paineis WHERE id = ?', [id], async (err, painel) => {
                db.close();
                if (err) return message.reply('❌ Erro ao buscar painel no banco de dados.');
                if (!painel) return message.reply('❌ Painel não encontrado.');
                const embed = new EmbedBuilder()
                    .setTitle(painel.title || 'Painel')
                    .setDescription(painel.description || '—')
                    .setColor(painel.color_embed || '#FFFFFF');
                if (painel.thumbnail && /^https?:\/\//.test(painel.thumbnail)) embed.setThumbnail(painel.thumbnail);
                if (painel.image && /^https?:\/\//.test(painel.image)) embed.setImage(painel.image);
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`painel_${id}`)
                        .setLabel('Painel')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId(`ticket_${id}`)
                        .setLabel('Ticket')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId(`config_${id}`)
                        .setLabel('Configurações')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId(`confirmar_${id}`)
                        .setLabel('Confirmar')
                        .setStyle(ButtonStyle.Danger)
                );
                await message.channel.send({ embeds: [embed], components: [row] });
                // Não há mais collector local para botões, toda a lógica de interação é roteada pelo index.js
            });
        } catch (e) {
            await message.reply(`❌ Erro inesperado ao exibir o painel. Avise o suporte.\nDetalhes: ${e.message || e}`);
        }
    }
};
