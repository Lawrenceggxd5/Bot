const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '../painel.sqlite');

// Handler para "Abrir Outras Modalidades"
async function handleAbrirOutras(interaction, painelId) {
    // Busca o JSON salvo em mg_outras
    const db = new sqlite3.Database(dbPath);
    db.get('SELECT mg_outras, categoriaticketoutrosmetodos FROM paineis WHERE id = ?', [painelId], async (err, row) => {
        db.close();
        if (err || !row || !row.mg_outras) {
            return interaction.reply({ content: '❌ Não foi possível carregar o método Outras Modalidades.', ephemeral: true });
        }
        let json;
        try {
            json = JSON.parse(row.mg_outras);
        } catch (e) {
            return interaction.reply({ content: '❌ JSON inválido salvo para Outras Modalidades.', ephemeral: true });
        }
        // Cria embed básico
        const embed = new EmbedBuilder()
            .setTitle('Outras Modalidades')
            .setDescription('Clique no botão abaixo para cancelar a compra.');
        // Cria botão a partir do JSON, mas só usa o custom_id e label
        const btnData = json.components[0];
        const rowBtn = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(btnData.custom_id || 'cancelar_compra')
                .setLabel(btnData.label || 'Cancelar')
                .setStyle(ButtonStyle.Danger)
        );
        // Muda a categoria do ticket para categoriaticketoutrosmetodos
        if (row.categoriaticketoutrosmetodos) {
            try {
                await interaction.channel.setParent(row.categoriaticketoutrosmetodos);
            } catch (e) {
                // Se falhar, apenas ignora
            }
        }
        // Envia embed e botão
        await interaction.reply({ embeds: [embed], components: [rowBtn], ephemeral: true });
    });
}

module.exports = { handleAbrirOutras };
