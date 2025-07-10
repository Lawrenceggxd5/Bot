const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '../painel.sqlite');

function atualizarPainelVisual(id, visualJson, callback) {
    const db = new sqlite3.Database(dbPath);
    // Lista dos campos válidos na tabela paineis
    const camposValidos = [
        'title', 'description', 'color_embed', 'color_button', 'msg_button',
        'thumbnail', 'image', 'categoria_ticket', 'notificarticket', 'ticketmensagem', 'categoria_ticket_closed', 'fields'
    ];
    const updates = [];
    const values = [];
    for (const campo of camposValidos) {
        if (visualJson[campo] !== undefined) {
            updates.push(`${campo} = ?`);
            values.push(visualJson[campo]);
        }
    }
    if (updates.length === 0) {
        db.close();
        if (callback) callback(new Error('Nenhum campo válido para atualizar.'));
        return;
    }
    values.push(id);
    const sql = `UPDATE paineis SET ${updates.join(', ')} WHERE id = ?`;
    db.run(sql, values, function(err) {
        db.close();
        if (callback) callback(err, this);
    });
}

module.exports = { atualizarPainelVisual };
