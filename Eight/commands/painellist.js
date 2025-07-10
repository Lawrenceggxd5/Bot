const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '../painel.sqlite');

module.exports = {
    name: 'painellist',
    description: 'Lista todos os IDs dos paineis salvos.',
    async execute(client, message, args) {
        const db = new sqlite3.Database(dbPath);
        try {
            db.all('SELECT id FROM paineis', [], (err, rows) => {
                db.close();
                if (err) return message.reply('❌ Erro ao buscar paineis.');
                if (!rows || rows.length === 0) return message.reply('Nenhum painel cadastrado.');
                const lista = rows.map(r => `- Painel ${r.id}`).join('\n');
                message.reply(`Lista de paineis salvos:\n${lista}`);
            });
        } catch (e) {
            db.close();
            message.reply('❌ Ocorreu um erro inesperado ao listar os paineis.');
        }
    }
};
