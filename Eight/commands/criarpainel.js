const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '../painel.sqlite');

module.exports = {
    name: 'criarpainel',
    description: 'Cria um painel padrão e armazena no banco de dados SQLite.',
    async execute(client, message, args) {
        const id = args[0];
        if (!id || /\s/.test(id)) return message.reply('❌ Forneça um ID válido (sem espaços). Ex: !criarpainel vip');
        const db = new sqlite3.Database(dbPath);
        // Garante que a tabela paineis existe antes de qualquer operação
        db.run(`CREATE TABLE IF NOT EXISTS paineis (
            id TEXT PRIMARY KEY
        )`, () => {
            // Adiciona as colunas extras se não existirem
            const alterCols = [
                'painel','title','description','color_embed','color_button','msg_button','thumbnail','image','categoria_ticket','notificarticket','ticketmensagem','categoria_ticket_closed','fields','msg_inicial','msg_cancelamento','msg_cancelar_ticket','msg_carrinho','msg_produtos','info_1','info_2','info_3','confirmar_info_1','confirmar_info_2','confirmar_info_3','msg_confirmar_compra','msg_metodos_pagamento','msg_realizar_pagamento','msg_metodos','carregando_ticket','info_padrao_1','info_padrao_2','info_padrao_3','info_padronizada_1','info_padronizada_2','info_padronizada_3','carrinho_vazio','timeout_1','timeout_2','timeout_3','timeout_4','categoriaticketoutrosmetodos','categoriaticketpagos','mg_metodo_pagamento','mg_pix','mg_paypal','mg_crypto','paypal_link','paypal_nome','categoria_produtos','crypto_currency','crypto_api_key','mercadopago_api_key','mg_outras'
            ];
            alterCols.forEach(col => {
                db.run(`ALTER TABLE paineis ADD COLUMN ${col} TEXT`, () => {}); // ignora erro se já existe
            });
            db.get('SELECT id FROM paineis WHERE id = ?', [id], (err, row) => {
                if (err) {
                    db.close();
                    console.error('Erro ao verificar existência do painel:', err.message);
                    console.log('ATENÇÃO: Envie esta mensagem de erro para o suporte ou para o desenvolvedor:');
                    console.log(err);
                    return message.reply('❌ Erro ao verificar existência do painel. Detalhes no console.');
                }
                if (row) {
                    db.close();
                    return message.reply('❌ Já existe um painel com esse ID.');
                }
                db.run(`INSERT INTO paineis (
                    id, painel, title, description, color_embed, color_button, msg_button, thumbnail, image, categoria_ticket, notificarticket, ticketmensagem, categoria_ticket_closed, fields, msg_inicial, msg_cancelamento, msg_cancelar_ticket, msg_carrinho, msg_produtos, info_1, info_2, info_3, confirmar_info_1, confirmar_info_2, confirmar_info_3, msg_confirmar_compra, msg_metodos_pagamento, msg_realizar_pagamento, msg_metodos, carregando_ticket, info_padrao_1, info_padrao_2, info_padrao_3, info_padronizada_1, info_padronizada_2, info_padronizada_3, carrinho_vazio, timeout_1, timeout_2, timeout_3, timeout_4, categoriaticketoutrosmetodos, categoriaticketpagos, mg_metodo_pagamento, mg_pix, mg_paypal, mg_crypto, paypal_link, paypal_nome, categoria_produtos, crypto_currency, crypto_api_key, mercadopago_api_key, mg_outras
                ) VALUES (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                )`,
                    [
                        id,
                        JSON.stringify({
                            title: 'Compre aqui',
                            description: 'Clique no botão abaixo e compre',
                            color_embed: '#FFFFFF',
                            color_button: '#00FF00',
                            msg_button: { content: 'Comprar!', components: [{ type: 2, label: 'Comprar!', style: 1, custom_id: 'comprar' }] },
                            thumbnail: null,
                            image: null
                        }),
                        'Compre aqui', // title
                        'Clique no botão abaixo e compre', // description
                        '#FFFFFF', // color_embed
                        '#00FF00', // color_button
                        JSON.stringify({ content: 'Comprar!', components: [{ type: 2, label: 'Comprar!', style: 1, custom_id: 'comprar' }] }), // msg_button
                        null, // thumbnail
                        null, // image
                        'CategoriaTicket', // categoria_ticket
                        'Notificação Ticket', // notificarticket
                        'Mensagem Ticket',  // ticketmensagem
                        'Categoria do Ticket Fechado',  // categoria_ticket_closed
                        JSON.stringify([{ name: '', value: '' }, { name: '', value: '' }]), // fields
                        'Mensagem inicial padrão',
                        'Mensagem de cancelamento padrão',
                        'Mensagem cancelar ticket padrão',
                        'Mensagem carrinho padrão',
                        'Mensagem produtos padrão',
                        'Mensagem infos 1 padrão',
                        'Mensagem infos 2 padrão',
                        'Mensagem infos 3 padrão',
                        'Mensagem confirmar info 1 padrão',
                        'Mensagem confirmar info 2 padrão',
                        'Mensagem confirmar info 3 padrão',
                        'Mensagem confirmar compra padrão',
                        'Mensagem métodos de pagamento padrão',
                        'Mensagem realizar pagamento padrão',
                        'Mensagem métodos padrão',
                        '{"content": "Aguarde, estamos carregando seu ticket..."}',
                        'Mensagem info-padrão 1',
                        'Mensagem info-padrão 2',
                        'Mensagem info-padrão 3',
                        '', // info_padronizada_1
                        '', // info_padronizada_2
                        '', // info_padronizada_3
                        '{"content": "Seu carrinho está vazio."}',
                        '', '', '', '', // timeout_1, timeout_2, timeout_3, timeout_4
                        '', '', // categoriaticketoutrosmetodos, categoriaticketpagos
                        '', '', '', '', // mg_metodo_pagamento, mg_pix, mg_paypal, mg_crypto
                        '', '', '', // paypal_link, paypal_nome, categoria_produtos
                        '', '', '', // crypto_currency, crypto_api_key, mercadopago_api_key
                        '' // mg_outras
                    ],
                    err => {
                        db.close();
                        if (err) {
                            console.log('Erro SQLite:', err);
                            return message.reply('❌ Erro ao criar painel.');
                        }
                        message.reply(`✅ Painel \`${id}\` criado com sucesso!`);
                    }
                );
            });
        });
    }
};
