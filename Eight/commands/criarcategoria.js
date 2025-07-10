const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '../painel.sqlite');

module.exports = {
    name: 'criarcategoria',
    description: 'Cria uma categoria customizada com nome e itens e salva no banco.',
    async execute(client, message, args) {
        const id = args[0];
        if (!id || /\s/.test(id)) return message.reply('❌ Forneça um ID válido (sem espaços). Ex: !criarcategoria vip');
        const db = new sqlite3.Database(dbPath);
        try {
            db.run('CREATE TABLE IF NOT EXISTS categorias (id TEXT PRIMARY KEY, nome TEXT, itens TEXT)', () => {
                db.run('INSERT INTO categorias (id, nome, itens) VALUES (?, ?, ?)', [id, '', JSON.stringify([])], err => {
                    db.close();
                    if (err) {
                        message.reply('❌ Erro ao criar categoria.');
                    } else {
                        message.reply(`✅ Categoria \`${id}\` criada com sucesso!`);
                    }
                });
            });
        } catch (e) {
            db.close();
            message.reply('❌ Ocorreu um erro inesperado ao criar a categoria.');
        }
    }
};
