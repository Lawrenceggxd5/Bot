const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '../painel.sqlite');

module.exports = {
    name: 'verificar',
    description: 'Envia o embed de verificação com botão',
    /**
     * Suporta tanto message quanto interaction
     */
    async execute(client, messageOrInteraction, args) {
        // Detecta se é interaction ou mensagem
        const isInteraction = !!messageOrInteraction.isRepliable;
        const userId = isInteraction ? messageOrInteraction.user.id : messageOrInteraction.author.id;
        const replyFn = async (msg) => {
            if (isInteraction) {
                await messageOrInteraction.reply({ content: msg, flags: 64 });
            } else {
                await messageOrInteraction.reply(msg);
            }
        };
        const db = new sqlite3.Database(dbPath);
        db.get('SELECT embed_verificar FROM perfis WHERE user_id = ?', [userId], async (err, row) => {
            if (err || !row || !row.embed_verificar) {
                db.close();
                return replyFn('❌ Nenhum embed de verificação personalizado encontrado.');
            }
            let embedObj;
            try {
                embedObj = JSON.parse(row.embed_verificar);
            } catch (e) {
                db.close();
                return replyFn('❌ O JSON do embed de verificação está inválido. Peça para um admin corrigir.');
            }
            const embed = EmbedBuilder.from(embedObj);
            const rowBtn = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('verificar_botao')
                    .setLabel('Verificar')
                    .setStyle(ButtonStyle.Success)
            );
            if (isInteraction) {
                await messageOrInteraction.reply({ embeds: [embed], components: [rowBtn], flags: 64 });
            } else {
                await messageOrInteraction.reply({ embeds: [embed], components: [rowBtn] });
            }
            db.close();
        });
    },
    async handleInteraction(interaction) {
        if (interaction.customId !== 'verificar_botao') return;
        const userId = interaction.user.id;
        const db = new sqlite3.Database(dbPath);
        // Garante que a tabela e colunas existem
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS perfis (
                user_id TEXT PRIMARY KEY,
                nome TEXT,
                data_entrada TEXT,
                verificado INTEGER,
                cupons TEXT,
                embed_verificar TEXT
            )`);
            db.run(`ALTER TABLE perfis ADD COLUMN nome TEXT`, [], function(e){});
            db.run(`ALTER TABLE perfis ADD COLUMN data_entrada TEXT`, [], function(e){});
            db.run(`ALTER TABLE perfis ADD COLUMN verificado INTEGER`, [], function(e){});
            db.run(`ALTER TABLE perfis ADD COLUMN cupons TEXT`, [], function(e){});
            db.run(`ALTER TABLE perfis ADD COLUMN embed_verificar TEXT`, [], function(e){});
            db.get('SELECT verificado FROM perfis WHERE user_id = ?', [userId], (err, row) => {
                if (row && row.verificado) {
                    db.close();
                    return interaction.reply({ content: 'Você já foi verificado!', flags: 64 });
                }
                db.run('INSERT OR REPLACE INTO perfis (user_id, nome, data_entrada, verificado) VALUES (?, ?, ?, 1)', [
                    userId,
                    interaction.user.username,
                    new Date().toISOString().split('T')[0]
                ], err => {
                    if (err) {
                        db.close();
                        return interaction.reply({ content: 'Erro ao criar perfil.', flags: 64 });
                    }
                    // Dá o cargo "verificado"
                    const cargo = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === 'verificado');
                    if (cargo) {
                        interaction.member.roles.add(cargo).catch(() => {});
                    }
                    // Dá cupom se existir
                    db.get('SELECT cupons FROM perfis WHERE user_id = ?', [userId], (err2, row2) => {
                        if (row2 && row2.cupons) {
                            let cupons = row2.cupons.split(',').map(c => c.trim());
                            if (!cupons.includes('entrada')) {
                                cupons.push('entrada');
                                db.run('UPDATE perfis SET cupons = ? WHERE user_id = ?', [cupons.join(','), userId]);
                            }
                        } else {
                            db.run('UPDATE perfis SET cupons = ? WHERE user_id = ?', ['entrada', userId]);
                        }
                        db.close();
                        interaction.reply({ content: 'Verificação concluída! Seu perfil foi criado.', flags: 64 });
                    });
                });
            });
        });
    }
};
