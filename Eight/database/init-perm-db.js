const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../db.js');

// Inicializa o arquivo db.js (JSON) com campo senha padrão se não existir
if (!fs.existsSync(dbPath)) {
    const initialData = {
        senha: 'Senhaboa123'
    };
    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
}
