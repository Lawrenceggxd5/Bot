const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '../painel.sqlite');

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run("ALTER TABLE paineis ADD COLUMN categoria_ticket_closed TEXT", err => {
        if (err) {
            if (err.message.includes('duplicate column name')) {
                console.log('A coluna categoria_ticket_closed já existe.');
            } else {
                console.error('Erro ao adicionar coluna:', err.message);
            }
        } else {
            console.log('Coluna categoria_ticket_closed adicionada com sucesso!');
        }
        db.close();
    });
});
