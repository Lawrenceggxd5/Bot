const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../db.js');

// Função utilitária para ler e salvar o DB.js (JSON)
function readDB() {
    if (!fs.existsSync(dbPath)) return {};
    try {
        return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    } catch {
        return {};
    }
}
function saveDB(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

module.exports = {
    name: 'perm',
    description: 'Gerenciar permissões do bot',
    /**
     * Suporte a message command (!perm) e interaction (slash, se quiser)
     */
    async execute(client, messageOrInteraction, args) {
        // Detecta se é interaction ou message
        const isInteraction = !!messageOrInteraction.isRepliable;
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('perm-senha').setLabel('Senha').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('perm-owner').setLabel('Owner').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('perm-adm').setLabel('Adm').setStyle(ButtonStyle.Secondary),
            new ButtonBuilder().setCustomId('perm-atendente').setLabel('Atendente').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('perm-verificado').setLabel('Verificado').setStyle(ButtonStyle.Primary)
        );
        if (isInteraction) {
            await messageOrInteraction.reply({ content: 'Escolha uma permissão para configurar:', components: [row], flags: 64 });
        } else {
            await messageOrInteraction.reply({ content: 'Escolha uma permissão para configurar:', components: [row] });
        }
    },
    async handleButton(interaction) {
        const db = readDB();
        // Senha
        if (interaction.customId === 'perm-senha') {
            await interaction.reply({ content: 'Envie: <Senha atual> <Nova senha> <Nova senha novamente>', flags: 64 });
            const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });
            collector.on('collect', m => {
                const [senhaAtual, novaSenha, novaSenha2] = m.content.trim().split(/\s+/);
                if (!senhaAtual || !novaSenha || !novaSenha2) return m.reply('❌ Envie no formato: <Senha atual> <Nova senha> <Nova senha novamente>');
                if (!db.senha || db.senha === senhaAtual) {
                    if (novaSenha !== novaSenha2) return m.reply('❌ As senhas não coincidem.');
                    db.senha = novaSenha;
                    saveDB(db);
                    m.reply('✅ Senha alterada com sucesso!');
                } else {
                    m.reply('❌ Senha atual incorreta.');
                }
            });
            return;
        }
        // Owner
        if (interaction.customId === 'perm-owner') {
            await interaction.reply({ content: 'Envie: <Senha atual> <ID do novo Owner>', flags: 64 });
            const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });
            collector.on('collect', m => {
                const [senha, idOwner] = m.content.trim().split(/\s+/);
                if (!senha || !idOwner) return m.reply('❌ Envie no formato: <Senha atual> <ID do novo Owner>');
                if (!db.senha || db.senha === senha) {
                    db.owner = idOwner;
                    saveDB(db);
                    m.reply('✅ Novo Owner definido com sucesso!');
                } else {
                    m.reply('❌ Senha atual incorreta.');
                }
            });
            return;
        }
        // Adm
        if (interaction.customId === 'perm-adm') {
            await interaction.reply({ content: 'Envie: <ID do cargo ADM> <Senha>', flags: 64 });
            const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });
            collector.on('collect', m => {
                const [idAdm, senha] = m.content.trim().split(/\s+/);
                if (!idAdm || !senha) return m.reply('❌ Envie no formato: <ID do cargo ADM> <Senha>');
                if (!db.senha || db.senha === senha) {
                    db.adm = idAdm;
                    saveDB(db);
                    m.reply('✅ Cargo ADM definido com sucesso!');
                } else {
                    m.reply('❌ Senha incorreta.');
                }
            });
            return;
        }
        // Atendente
        if (interaction.customId === 'perm-atendente') {
            await interaction.reply({ content: 'Envie: <ID do cargo Atendente> <Senha>', flags: 64 });
            const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });
            collector.on('collect', m => {
                const [idAtendente, senha] = m.content.trim().split(/\s+/);
                if (!idAtendente || !senha) return m.reply('❌ Envie no formato: <ID do cargo Atendente> <Senha>');
                if (!db.senha || db.senha === senha) {
                    db.atendente = idAtendente;
                    saveDB(db);
                    m.reply('✅ Cargo Atendente definido com sucesso!');
                } else {
                    m.reply('❌ Senha incorreta.');
                }
            });
            return;
        }
        // Verificado
        if (interaction.customId === 'perm-verificado') {
            await interaction.reply({ content: 'Envie: <Senha atual> <ID do cargo Verificado>', flags: 64 });
            const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
            const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 120000 });
            collector.on('collect', m => {
                const [senha, idVerificado] = m.content.trim().split(/\s+/);
                if (!senha || !idVerificado) return m.reply('❌ Envie no formato: <Senha atual> <ID do cargo Verificado>');
                if (!db.senha || db.senha === senha) {
                    db.verificado = idVerificado;
                    saveDB(db);
                    m.reply('✅ Cargo Verificado definido com sucesso!');
                } else {
                    m.reply('❌ Senha incorreta.');
                }
            });
            return;
        }
    }
};
