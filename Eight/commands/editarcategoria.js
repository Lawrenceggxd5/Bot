// Handler para o botão remover_categoria_<id>
async function handleRemoverCategoria(interaction) {
    const id = interaction.customId.replace('remover_categoria_', '');
    const rowVoltar = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`voltar_editarcategoria_${id}`)
            .setLabel('Voltar')
            .setStyle(ButtonStyle.Secondary)
    );
    await interaction.reply({
        content: 'Envie o ID do produto que deseja remover da categoria:',
        components: [rowVoltar],
        ephemeral: true
    });
    const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
    const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 60000 });
    collector.on('collect', m => {
        const produtoId = m.content.trim();
        if (!produtoId) return m.reply('❌ ID do produto não pode ser vazio.');
        const db = new sqlite3.Database(dbPath);
        db.get('SELECT itens FROM categorias WHERE id = ?', [id], (err, row) => {
            if (err || !row) {
                db.close();
                return m.reply('❌ Categoria não encontrada.');
            }
            let itens = [];
            try {
                itens = JSON.parse(row.itens);
            } catch (e) {}
            if (!Array.isArray(itens)) itens = [];
            const index = itens.indexOf(produtoId);
            if (index === -1) {
                db.close();
                return m.reply('❌ Produto não encontrado na categoria.');
            }
            itens.splice(index, 1);
            db.run('UPDATE categorias SET itens = ? WHERE id = ?', [JSON.stringify(itens), id], err2 => {
                db.close();
                if (err2) {
                    m.reply('❌ Erro ao remover produto.');
                } else {
                    m.reply('✅ Produto removido da categoria!');
                }
            });
        });
    });
    collector.on('end', collected => {
        if (collected.size === 0) interaction.followUp({ content: 'Tempo esgotado. Nenhuma alteração feita.', ephemeral: true });
    });
}

module.exports.handleRemoverCategoria = handleRemoverCategoria;
// Handler para o botão adicionar_categoria_<id>
async function handleAdicionarCategoria(interaction) {
    const id = interaction.customId.replace('adicionar_categoria_', '');
    const rowVoltar = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`voltar_editarcategoria_${id}`)
            .setLabel('Voltar')
            .setStyle(ButtonStyle.Secondary)
    );
    await interaction.reply({
        content: 'Envie o ID do produto que deseja adicionar à categoria:',
        components: [rowVoltar],
        ephemeral: true
    });
    const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
    const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 60000 });
    collector.on('collect', m => {
        const produtoId = m.content.trim();
        if (!produtoId) return m.reply('❌ ID do produto não pode ser vazio.');
        const db = new sqlite3.Database(dbPath);
        db.get('SELECT itens FROM categorias WHERE id = ?', [id], (err, row) => {
            if (err || !row) {
                db.close();
                return m.reply('❌ Categoria não encontrada.');
            }
            let itens = [];
            try {
                itens = JSON.parse(row.itens);
            } catch (e) {}
            if (!Array.isArray(itens)) itens = [];
            itens.push(produtoId);
            db.run('UPDATE categorias SET itens = ? WHERE id = ?', [JSON.stringify(itens), id], err2 => {
                db.close();
                if (err2) {
                    m.reply('❌ Erro ao adicionar produto.');
                } else {
                    m.reply('✅ Produto adicionado à categoria!');
                }
            });
        });
    });
    collector.on('end', collected => {
        if (collected.size === 0) interaction.followUp({ content: 'Tempo esgotado. Nenhuma alteração feita.', ephemeral: true });
    });
}

module.exports.handleAdicionarCategoria = handleAdicionarCategoria;
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '../painel.sqlite');

// Handler para o botão visual_categoria_<id>
async function handleVisualCategoria(interaction) {
    const id = interaction.customId.replace('visual_categoria_', '');
    const rowVoltar = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`voltar_editarcategoria_${id}`)
            .setLabel('Voltar')
            .setStyle(ButtonStyle.Secondary)
    );
    await interaction.reply({
        content: 'Envie o novo nome da categoria (pode incluir emoji padrão ou personalizado):',
        components: [rowVoltar],
        ephemeral: true
    });
    const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
    const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 60000 });
    collector.on('collect', m => {
        let nome = m.content.trim();
        // Aceita emojis normais e personalizados no início do nome
        // Exemplo: ":smile: Nome" ou "<:custom:123> Nome"
        // Não faz parsing, apenas salva o texto como está
        const db = new sqlite3.Database(dbPath);
        db.run('UPDATE categorias SET nome = ? WHERE id = ?', [nome, id], err => {
            db.close();
            if (err) {
                m.reply('❌ Erro ao atualizar o nome da categoria.');
            } else {
                m.reply('✅ Nome da categoria atualizado com sucesso!');
            }
        });
    });
    collector.on('end', collected => {
        if (collected.size === 0) interaction.followUp({ content: 'Tempo esgotado. Nenhuma alteração feita.', ephemeral: true });
    });
}

// Handler para o botão Voltar
async function handleVoltarEditarCategoria(interaction) {
    const id = interaction.customId.replace('voltar_editarcategoria_', '');
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`visual_categoria_${id}`)
            .setLabel('Visual')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId(`adicionar_categoria_${id}`)
            .setLabel('Adicionar')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId(`remover_categoria_${id}`)
            .setLabel('Remover')
            .setStyle(ButtonStyle.Danger)
    );
    await interaction.reply({ content: `Edição da categoria \`${id}\`:`, components: [row], ephemeral: true });
}

module.exports.handleVisualCategoria = handleVisualCategoria;
module.exports.handleVoltarEditarCategoria = handleVoltarEditarCategoria;
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'editarcategoria',
    description: 'Edita uma categoria customizada. Botões: Visualizar, Adicionar, Remover.',
    async execute(client, message, args) {
        const id = args[0];
        if (!id) return message.reply('❌ Forneça o ID da categoria. Ex: !editarcategoria vip');
        // Mostra os botões Visualizar, Adicionar, Remover
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`visual_categoria_${id}`)
                .setLabel('Visual')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`adicionar_categoria_${id}`)
                .setLabel('Adicionar')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`remover_categoria_${id}`)
                .setLabel('Remover')
                .setStyle(ButtonStyle.Danger)
        );
        await message.reply({ content: `Edição da categoria \`${id}\`:`, components: [row] });
    }
};
