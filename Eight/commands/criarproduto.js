const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '../painel.sqlite');

module.exports = {
    name: 'criarproduto',
    description: 'Cria um produto padrão automaticamente com Titulo, type, preço e Categoria.',
    async execute(client, message, args) {
        const id = args[0];
        if (!id || /\s/.test(id)) return message.reply('❌ Forneça um ID válido (sem espaços). Ex: !criarproduto prod1');
        const db = new sqlite3.Database(dbPath);
        try {
            db.run('CREATE TABLE IF NOT EXISTS produtos (id TEXT PRIMARY KEY, titulo TEXT, type TEXT, preco REAL, categoria TEXT)', () => {
                db.run('INSERT INTO produtos (id, titulo, type, preco, categoria) VALUES (?, ?, ?, ?, ?)', [id, 'Título padrão', 'type padrão', 0.0, 'Categoria padrão'], err => {
                    db.close();
                    if (err) {
                        message.reply('❌ Erro ao criar produto.');
                    } else {
                        message.reply(`✅ Produto \`${id}\` criado com sucesso!`);
                    }
                });
            });
        } catch (e) {
            db.close();
            message.reply('❌ Ocorreu um erro inesperado ao criar o produto.');
        }
    }
};
