// Comando !Finalizar
// Este comando deve ser chamado quando o pagamento for detectado em qualquer modalidade

module.exports = {
    name: 'finalizar',
    description: 'Finaliza o pedido após pagamento confirmado',
    async execute(interaction) {
        // Permite ser chamado tanto por interaction quanto por mensagem (!Finalizar)
        // Se for mensagem (!Finalizar)
        if (interaction.content && interaction.content.toLowerCase().startsWith('!finalizar')) {
            // Adapta para objeto similar ao interaction
            interaction = {
                ...interaction,
                reply: async (opts) => interaction.channel.send(opts),
            };
        }
        // Carrega o JSON de finalização do db.js
        const path = require('path');
        const fs = require('fs');
        const dbPath = path.join(__dirname, '../db.js');
        let db = {};
        if (fs.existsSync(dbPath)) {
            try { db = require(dbPath); } catch {}
        }
        const finalizarJson = db.finalizar || db.finalizado || {};

        // Monta o embed a partir do JSON salvo
        const { EmbedBuilder } = require('discord.js');
        const embed = new EmbedBuilder();
        if (finalizarJson.title) embed.setTitle(finalizarJson.title);
        if (finalizarJson.description) embed.setDescription(finalizarJson.description);
        if (finalizarJson.color_embed) embed.setColor(finalizarJson.color_embed);
        if (finalizarJson.color) embed.setColor(finalizarJson.color);
        if (finalizarJson.url) embed.setURL(finalizarJson.url);
        if (finalizarJson.timestamp) embed.setTimestamp(new Date(finalizarJson.timestamp));
        if (finalizarJson.footer) {
            if (typeof finalizarJson.footer === 'string') {
                embed.setFooter({ text: finalizarJson.footer });
            } else {
                embed.setFooter({ text: finalizarJson.footer.text || '', iconURL: finalizarJson.footer.icon_url || finalizarJson.footer.iconURL });
            }
        }
        if (finalizarJson.author) {
            if (typeof finalizarJson.author === 'string') {
                embed.setAuthor({ name: finalizarJson.author });
            } else {
                embed.setAuthor({ name: finalizarJson.author.name || '', iconURL: finalizarJson.author.icon_url || finalizarJson.author.iconURL, url: finalizarJson.author.url });
            }
        }
        if (finalizarJson.thumbnail) embed.setThumbnail(finalizarJson.thumbnail);
        if (finalizarJson.image) embed.setImage(finalizarJson.image);
        if (Array.isArray(finalizarJson.fields)) {
            finalizarJson.fields.forEach(f => {
                if (f && f.name && f.value) embed.addFields({ name: f.name, value: f.value, inline: !!f.inline });
            });
        }

        // Menciona o cargo Atendente
        const atendenteRoleId = db.Atendente || db.atendente || null;
        let mention = atendenteRoleId ? `<@&${atendenteRoleId}>` : '';

        // Envia o embed e menção
        if (interaction.reply) {
            await interaction.reply({ content: `${mention} ✅ Pedido finalizado!`, embeds: [embed], ephemeral: false });
        } else if (interaction.channel && interaction.channel.send) {
            await interaction.channel.send({ content: `${mention} ✅ Pedido finalizado!`, embeds: [embed] });
        }

        // Transfere o ticket para a categoria CategoriaTicketPagar
        const categoriaId = db.CategoriaTicketPagar || db.categoria_ticket_pagar || db.categoriaTicketPagar;
        if (categoriaId && interaction.channel && interaction.channel.setParent) {
            try {
                await interaction.channel.setParent(categoriaId, { lockPermissions: false });
            } catch (e) {
                // Ignora erro de permissão
            }
        }
    }
};
