const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '../painel.sqlite');

module.exports = {
    name: 'criarcupom',
    description: 'Cria um cupom',
    async execute(message) {
        const perguntas = [
            'Qual o nome do cupom?',
            'Qual o percentual de desconto (%)?',
            'Qual a quantidade disponível?',
            'Qual o tipo? (ex: entrada, vip, etc)'
        ];
        let respostas = [];
        let i = 0;
        const ask = async () => {
            if (i >= perguntas.length) {
                // Salva no banco
                const db = new sqlite3.Database(dbPath);
                db.run('INSERT INTO cupons (nome, percentual, quantidade, tipo) VALUES (?, ?, ?, ?)', respostas, err => {
                    db.close();
                    if (err) return message.reply('❌ Erro ao criar cupom.');
                    message.reply('✅ Cupom criado com sucesso!');
                });
                return;
            }
            await message.reply(perguntas[i]);
            const filter = m => m.author.id === message.author.id && m.channel.id === message.channel.id;
            const collector = message.channel.createMessageCollector({ filter, max: 1, time: 60000 });
            collector.on('collect', m => {
                respostas.push(m.content.trim());
                i++;
                ask();
            });
            collector.on('end', collected => {
                if (collected.size === 0) message.reply('Tempo esgotado. Nenhum cupom criado.');
            });
        };
        ask();
    },

    name2: 'darcupom',
    description2: 'Dá um cupom a alguém',
    async execute2(message, args) {
        // args: nome do cupom, @user ou @cargo
        const nomeCupom = args[0];
        if (!nomeCupom) return message.reply('Informe o nome do cupom.');
        const db = new sqlite3.Database(dbPath);
        db.get('SELECT * FROM cupons WHERE nome = ?', [nomeCupom], async (err, cupom) => {
            if (err || !cupom || cupom.quantidade <= 0) {
                db.close();
                return message.reply('Cupom não existe ou acabou.');
            }
            let users = [];
            if (message.mentions.users.size > 0) {
                users = Array.from(message.mentions.users.values());
            } else if (message.mentions.roles.size > 0) {
                const role = message.mentions.roles.first();
                users = message.guild.members.cache.filter(m => m.roles.cache.has(role.id)).map(m => m.user);
            } else {
                db.close();
                return message.reply('Mencione um usuário ou cargo.');
            }
            for (const user of users) {
                db.run('UPDATE perfis SET cupons = COALESCE(cupons, "") || ? WHERE user_id = ?', [cupom.nome + ',', user.id]);
            }
            db.run('UPDATE cupons SET quantidade = quantidade - ? WHERE nome = ?', [users.length, nomeCupom], () => {
                db.close();
                message.reply(`Cupom ${nomeCupom} dado para ${users.length} usuário(s).`);
            });
        });
    },

    name3: 'listcupom',
    description3: 'Lista todos os cupons',
    async execute3(message) {
        const db = new sqlite3.Database(dbPath);
        db.all('SELECT * FROM cupons', [], (err, rows) => {
            db.close();
            if (err || !rows.length) return message.reply('Nenhum cupom cadastrado.');
            let txt = rows.map(c => `**${c.nome}** | ${c.percentual}% | Qtd: ${c.quantidade} | Tipo: ${c.tipo}`).join('\n');
            message.reply(txt);
        });
    },

    name4: 'cupom',
    description4: 'Lista cupons do usuário',
    async execute4(message) {
        const userId = message.author.id;
        const db = new sqlite3.Database(dbPath);
        db.get('SELECT cupons FROM perfis WHERE user_id = ?', [userId], (err, row) => {
            db.close();
            if (err || !row || !row.cupons) return message.reply('Você não possui cupons.');
            let lista = row.cupons.split(',').filter(Boolean);
            if (!lista.length) return message.reply('Você não possui cupons.');
            message.reply('Seus cupons: ' + lista.join(', '));
        });
    }
};
