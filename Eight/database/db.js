// Função para salvar embed de perfil
const salvarEmbedPerfil = (userId, embedJson, cb) => {
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('painel.sqlite');
    db.run(`CREATE TABLE IF NOT EXISTS perfis (user_id TEXT PRIMARY KEY, embed_perfil TEXT)`, () => {
        db.run(`INSERT OR REPLACE INTO perfis (user_id, embed_perfil) VALUES (?, ?)`, [userId, embedJson], (err) => {
            db.close();
            if (cb) cb(err);
        });
    });
};

// Função para obter embed de perfil
const obterEmbedPerfil = (userId, cb) => {
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('painel.sqlite');
    db.get(`SELECT embed_perfil FROM perfis WHERE user_id = ?`, [userId], (err, row) => {
        db.close();
        if (cb) cb(err, row ? row.embed_perfil : null);
    });
};

module.exports.salvarEmbedPerfil = salvarEmbedPerfil;
module.exports.obterEmbedPerfil = obterEmbedPerfil;
// Tabela de categorias customizadas e campo categoria_produtos em paineis
try {
    const sqlite3 = require('sqlite3').verbose();
    const path = require('path');
    const dbPath = path.join(__dirname, '../painel.sqlite');
    const db = new sqlite3.Database(dbPath);
    db.run('CREATE TABLE IF NOT EXISTS categorias (id TEXT PRIMARY KEY, nome TEXT, itens TEXT)', err => {
        if (err) {
            console.error('Erro ao criar tabela categorias:', err.message);
        }
    });
    // Garante que a tabela paineis exista antes de alterar
    // Cria a tabela paineis com todas as colunas necessárias se não existir
    db.run(`CREATE TABLE IF NOT EXISTS paineis (
        id TEXT PRIMARY KEY,
        painel TEXT,
        title TEXT,
        description TEXT,
        color_embed TEXT,
        color_button TEXT,
        msg_button TEXT,
        thumbnail TEXT,
        image TEXT,
        categoria_ticket TEXT,
        notificarticket TEXT DEFAULT 'None',
        ticketmensagem TEXT DEFAULT 'None',
        categoria_ticket_closed TEXT DEFAULT 'None',
        fields TEXT,
        msg_inicial TEXT,
        msg_cancelamento TEXT,
        msg_cancelar_ticket TEXT,
        msg_carrinho TEXT,
        msg_produtos TEXT,
        info_1 TEXT,
        info_2 TEXT,
        info_3 TEXT,
        confirmar_info_1 TEXT,
        confirmar_info_2 TEXT,
        confirmar_info_3 TEXT,
        msg_confirmar_compra TEXT,
        msg_metodos_pagamento TEXT,
        msg_realizar_pagamento TEXT,
        msg_metodos TEXT,
        carregando_ticket TEXT,
        info_padrao_1 TEXT,
        info_padrao_2 TEXT,
        info_padrao_3 TEXT,
        info_padronizada_1 TEXT,
        info_padronizada_2 TEXT,
        info_padronizada_3 TEXT,
        carrinho_vazio TEXT,
        timeout_1 TEXT,
        timeout_2 TEXT,
        timeout_3 TEXT,
        timeout_4 TEXT,
        categoriaticketoutrosmetodos TEXT,
        categoriaticketpagos TEXT,
        mg_metodo_pagamento TEXT,
        mg_pix TEXT,
        mg_paypal TEXT,
        mg_crypto TEXT,
        paypal_link TEXT,
        paypal_nome TEXT,
        categoria_produtos TEXT,
        crypto_currency TEXT,
        crypto_api_key TEXT,
        mercadopago_api_key TEXT,
        mg_outras TEXT
    )`, () => {
        // Após criar a tabela, garante que todas as colunas existem (para upgrades em bancos antigos)
        const allCols = [
            'painel','title','description','color_embed','color_button','msg_button','thumbnail','image','categoria_ticket','notificarticket','ticketmensagem','categoria_ticket_closed','fields','msg_inicial','msg_cancelamento','msg_cancelar_ticket','msg_carrinho','msg_produtos','info_1','info_2','info_3','confirmar_info_1','confirmar_info_2','confirmar_info_3','msg_confirmar_compra','msg_metodos_pagamento','msg_realizar_pagamento','msg_metodos','carregando_ticket','info_padrao_1','info_padrao_2','info_padrao_3','info_padronizada_1','info_padronizada_2','info_padronizada_3','carrinho_vazio','timeout_1','timeout_2','timeout_3','timeout_4','categoriaticketoutrosmetodos','categoriaticketpagos','mg_metodo_pagamento','mg_pix','mg_paypal','mg_crypto','paypal_link','paypal_nome','categoria_produtos','crypto_currency','crypto_api_key','mercadopago_api_key','mg_outras'
        ];
        allCols.forEach(col => {
            db.run(`ALTER TABLE paineis ADD COLUMN ${col} TEXT`, () => {});
        });
        db.close();
    });
} catch (e) {
    console.error('Erro ao inicializar tabela categorias:', e.message);
}
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('painel.sqlite');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS paineis (
        id TEXT PRIMARY KEY,
        painel TEXT,
        title TEXT,
        description TEXT,
        color_embed TEXT,
        color_button TEXT,
        msg_button TEXT,
        thumbnail TEXT,
        image TEXT,
        categoria_ticket TEXT,
        notificarticket TEXT DEFAULT 'None',
        ticketmensagem TEXT DEFAULT 'None',
        categoria_ticket_closed TEXT DEFAULT 'None',
        fields TEXT,
        msg_inicial TEXT,
        msg_cancelamento TEXT,
        msg_cancelar_ticket TEXT,
        msg_carrinho TEXT,
        msg_produtos TEXT,
        info_1 TEXT,
        info_2 TEXT,
        info_3 TEXT,
        confirmar_info_1 TEXT,
        confirmar_info_2 TEXT,
        confirmar_info_3 TEXT,
        msg_confirmar_compra TEXT,
        msg_metodos_pagamento TEXT,
        msg_realizar_pagamento TEXT,
        msg_metodos TEXT,
        carregando_ticket TEXT,
        info_padrao_1 TEXT,
        info_padrao_2 TEXT,
        info_padrao_3 TEXT,
        info_padronizada_1 TEXT,
        info_padronizada_2 TEXT,
        info_padronizada_3 TEXT,
        carrinho_vazio TEXT,
        timeout_1 TEXT,
        timeout_2 TEXT,
        timeout_3 TEXT,
        timeout_4 TEXT,
        categoriaticketoutrosmetodos TEXT,
        categoriaticketpagos TEXT,
        mg_metodo_pagamento TEXT,
        mg_pix TEXT,
        mg_paypal TEXT,
        mg_crypto TEXT,
        paypal_link TEXT,
        paypal_nome TEXT,
        categoria_produtos TEXT,
        crypto_currency TEXT,
        crypto_api_key TEXT,
        mercadopago_api_key TEXT,
        mg_outras TEXT
    )`, (err) => {
        if (err) {
            console.error('Erro ao criar tabela paineis:', err.message);
            console.log('ATENÇÃO: Envie esta mensagem de erro para o suporte ou para o desenvolvedor:');
            console.log(err);
        } else {
            console.log('Tabela paineis criada/verificada!');
        }
        db.close();
    });
});