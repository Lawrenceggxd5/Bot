const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '../painel.sqlite');

module.exports = {
    name: 'perfil',
    description: 'Mostra o perfil do usuário',
    async execute(client, messageOrInteraction, args) {
        // Apenas exibe o embed salvo, não pede JSON!
        const isInteraction = !!messageOrInteraction.isRepliable;
        const user = isInteraction ? messageOrInteraction.user : messageOrInteraction.author;
        const userId = user.id;
        // Busca embed salvo no banco
        const db = new sqlite3.Database(dbPath);
        db.get('SELECT embed_perfil FROM perfis WHERE user_id = ?', [userId], (err, row) => {
            db.close();
            if (err || !row || !row.embed_perfil) {
                const msg = 'Nenhum perfil personalizado encontrado. Use o botão de editar perfil em "Outros" para criar um. Tags dinâmicas: <User>, <ID>, <Tag>, <Data>';
                if (isInteraction) {
                    return messageOrInteraction.reply({ content: msg, flags: 64 });
                } else {
                    return messageOrInteraction.reply({ content: msg });
                }
            }
            let embedObj;
            try {
                embedObj = JSON.parse(row.embed_perfil);
            } catch (e) {
                const msg = 'Erro ao carregar seu perfil. O JSON está corrompido.';
                if (isInteraction) {
                    return messageOrInteraction.reply({ content: msg, flags: 64 });
                } else {
                    return messageOrInteraction.reply({ content: msg });
                }
            }
            // Substitui tags dinâmicas
            const now = new Date();
            const tagMap = {
                '<User>': user.username,
                '<ID>': user.id,
                '<Tag>': user.tag || `${user.username}#${user.discriminator}`,
                '<Data>': now.toLocaleDateString('pt-BR')
            };
            function replaceTags(str) {
                if (typeof str !== 'string') return str;
                return Object.entries(tagMap).reduce((acc, [k, v]) => acc.replaceAll(k, v), str);
            }
            for (const k of Object.keys(embedObj)) {
                if (typeof embedObj[k] === 'string') embedObj[k] = replaceTags(embedObj[k]);
            }
            const embed = EmbedBuilder.from(embedObj);
            if (isInteraction) {
                messageOrInteraction.reply({ embeds: [embed], flags: 64 });
            } else {
                messageOrInteraction.reply({ embeds: [embed] });
            }
        });
    },
    async handleButton(interaction) {
        if (interaction.customId === 'perfil_voltar') {
            await interaction.reply({ content: 'Operação cancelada. Use /perfil ou !perfil para editar seu perfil.', flags: 64 });
            return;
        }
        // Mostra o perfil salvo do usuário
        const db = new sqlite3.Database(dbPath);
        db.get('SELECT embed_perfil FROM perfis WHERE user_id = ?', [interaction.user.id], (err, row) => {
            db.close();
            if (err || !row || !row.embed_perfil) {
                return interaction.reply({
                    content: 'Nenhum perfil personalizado encontrado. Use /perfil ou !perfil para cadastrar um JSON de embed.\n\nTags dinâmicas disponíveis: <User>, <ID>, <Tag>, <Data> (serão substituídas automaticamente).',
                    flags: 64
                });
            }
            let embedObj;
            try {
                embedObj = JSON.parse(row.embed_perfil);
            } catch (e) {
                return interaction.reply({ content: '❌ O JSON do perfil está inválido. Use /perfil ou !perfil para corrigir.', flags: 64 });
            }
            // Substitui tags dinâmicas
            const user = interaction.user;
            const data = new Date().toLocaleDateString('pt-BR');
            const replacer = (str) => str
                .replace(/<User>/g, user.username)
                .replace(/<ID>/g, user.id)
                .replace(/<Tag>/g, user.tag || `${user.username}#${user.discriminator}`)
                .replace(/<Data>/g, data);
            if (embedObj.title) embedObj.title = replacer(embedObj.title);
            if (embedObj.description) embedObj.description = replacer(embedObj.description);
            if (Array.isArray(embedObj.fields)) {
                embedObj.fields = embedObj.fields.map(f => ({
                    name: replacer(f.name),
                    value: replacer(f.value)
                }));
            }
            const embed = EmbedBuilder.from(embedObj);
            interaction.reply({
                content: 'Seu perfil personalizado:',
                embeds: [embed],
                flags: 64
            });
        });
    },
};
