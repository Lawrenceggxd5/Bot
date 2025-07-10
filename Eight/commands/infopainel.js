const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { EmbedBuilder } = require('discord.js');
const dbPath = path.join(__dirname, '../painel.sqlite');

module.exports = {
    name: 'infopainel',
    description: 'Mostra todas as informações do painel pelo ID.',
    async execute(client, message, args) {
        const id = args[0];
        if (!id) return message.reply('❌ Forneça o ID do painel. Ex: !infopainel vip');
        const db = new sqlite3.Database(dbPath);
        try {
            db.get('SELECT * FROM paineis WHERE id = ?', [id], async (err, painel) => {
                if (err) {
                    db.close();
                    return message.reply('❌ Erro ao buscar painel no banco de dados.');
                }
                if (!painel) {
                    db.close();
                    return message.reply('❌ Painel não encontrado.');
                }
                let fieldsText = '—';
                if (painel.fields) {
                    try {
                        const fields = JSON.parse(painel.fields);
                        if (Array.isArray(fields) && fields.length > 0) {
                            const limitedFields = fields.slice(0, 25); // Discord embed fields limit
                            fieldsText = limitedFields.map(f => `• **${f.name || '—'}**: ${f.value || '—'}`).join('\n');
                            if (fields.length > 25) fieldsText += '\n⚠️ Exibindo apenas os 25 primeiros fields.';
                        }
                    } catch (e) {
                        fieldsText = '❌ Erro ao ler os fields (JSON inválido).';
                    }
                }
                const embed = new EmbedBuilder()
                    .setTitle(`Informações do Painel: ${painel.id}`)
                    .setColor(painel.color_embed || '#FFFFFF')
                    .setDescription(
                        `**Título:** ${painel.title || '—'}\n` +
                        `**Descrição:** ${painel.description || '—'}\n` +
                        `**Cor do Embed:** ${painel.color_embed || '—'}\n` +
                        `**Cor do Botão:** ${painel.color_button || '—'}\n` +
                        `**Mensagem do Botão:** ${painel.msg_button || '—'}\n` +
                        `**Thumbnail:** ${painel.thumbnail || '—'}\n` +
                        `**Imagem:** ${painel.image || '—'}\n` +
                        `**CategoriaTicket:** ${painel.categoria_ticket || '—'}\n` +
                        `**CategoriaTicketFechado:** ${painel.categoria_ticket_closed || '—'}\n` +
                        `**NotificarTicket:** ${painel.notificarticket || '—'}\n` +
                        `**TicketMensagem:** ${painel.ticketmensagem || '—'}\n` +
                        `**Timeouts:** ${[painel.timeout_1, painel.timeout_2, painel.timeout_3, painel.timeout_4].filter(Boolean).join(' | ') || '—'}\n` +
                        `**Categorias Extras:** Outros Métodos: ${painel.categoriaticketoutrosmetodos || '—'} | Pagos: ${painel.categoriaticketpagos || '—'}\n` +
                        `**Pagamentos:** Pix: ${painel.mg_pix || '—'} | Paypal: ${painel.mg_paypal || '—'} | Crypto: ${painel.mg_crypto || '—'} | Cartão: ${painel.mg_metodo_pagamento || '—'} | Outras: ${painel.mg_outras || '—'}\n` +
                        `**MercadoPago Key:** ${painel.mercadopago_api_key || '—'}\n` +
                        `**Paypal Link:** ${painel.paypal_link || '—'}\n` +
                        `**Paypal Nome:** ${painel.paypal_nome || '—'}\n` +
                        `**Crypto Currency:** ${painel.crypto_currency || '—'}\n` +
                        `**Crypto API Key:** ${painel.crypto_api_key || '—'}\n` +
                        `**Categoria Produtos:** ${painel.categoria_produtos || '—'}\n` +
                        `**Info Padrão:** ${[painel.info_padrao_1, painel.info_padrao_2, painel.info_padrao_3].filter(Boolean).join(' | ') || '—'}\n` +
                        `**Info Padronizada:** ${[painel.info_padronizada_1, painel.info_padronizada_2, painel.info_padronizada_3].filter(Boolean).join(' | ') || '—'}\n` +
                        `**Carrinho Vazio:** ${painel.carrinho_vazio || '—'}\n` +
                        `**Fields:**\n${fieldsText}`
                    );
                await message.channel.send({ embeds: [embed] });
                db.close();
            });
        } catch (e) {
            message.reply('❌ Ocorreu um erro inesperado ao buscar informações do painel.');
            db.close();
        }
    }
};
