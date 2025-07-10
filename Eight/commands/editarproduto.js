// Handler para o botão editar_type_produto_<id>
async function handleEditarTypeProduto(interaction) {
    const id = interaction.customId.replace('editar_type_produto_', '');
    const rowVoltar = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`voltar_editarproduto_${id}`)
            .setLabel('Voltar')
            .setStyle(ButtonStyle.Secondary)
    );
    await interaction.reply({
        content: 'Envie o novo type do produto:',
        components: [rowVoltar],
        ephemeral: true
    });
    const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
    const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 60000 });
    collector.on('collect', m => {
        const type = m.content.trim();
        if (!type) return m.reply('❌ O type não pode ser vazio.');
        const db = new sqlite3.Database(dbPath);
        db.run('UPDATE produtos SET type = ? WHERE id = ?', [type, id], err => {
            db.close();
            if (err) {
                m.reply('❌ Erro ao atualizar o type do produto.');
            } else {
                m.reply('✅ Type do produto atualizado com sucesso!');
            }
        });
    });
    collector.on('end', collected => {
        if (collected.size === 0) interaction.followUp({ content: 'Tempo esgotado. Nenhuma alteração feita.', ephemeral: true });
    });
}

// Handler para o botão editar_preco_produto_<id>
async function handleEditarPrecoProduto(interaction) {
    const id = interaction.customId.replace('editar_preco_produto_', '');
    const rowVoltar = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`voltar_editarproduto_${id}`)
            .setLabel('Voltar')
            .setStyle(ButtonStyle.Secondary)
    );
    await interaction.reply({
        content: 'Envie o novo preço do produto (apenas número, use ponto para decimais):',
        components: [rowVoltar],
        ephemeral: true
    });
    const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
    const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 60000 });
    collector.on('collect', m => {
        const precoStr = m.content.trim().replace(',', '.');
        const preco = parseFloat(precoStr);
        if (isNaN(preco)) return m.reply('❌ Preço inválido. Envie apenas números.');
        const db = new sqlite3.Database(dbPath);
        db.run('UPDATE produtos SET preco = ? WHERE id = ?', [preco, id], err => {
            db.close();
            if (err) {
                m.reply('❌ Erro ao atualizar o preço do produto.');
            } else {
                m.reply('✅ Preço do produto atualizado com sucesso!');
            }
        });
    });
    collector.on('end', collected => {
        if (collected.size === 0) interaction.followUp({ content: 'Tempo esgotado. Nenhuma alteração feita.', ephemeral: true });
    });
}

module.exports.handleEditarTypeProduto = handleEditarTypeProduto;
module.exports.handleEditarPrecoProduto = handleEditarPrecoProduto;
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '../painel.sqlite');

// Handler para o botão editar_titulo_produto_<id>
async function handleEditarTituloProduto(interaction) {
    const id = interaction.customId.replace('editar_titulo_produto_', '');
    const rowVoltar = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`voltar_editarproduto_${id}`)
            .setLabel('Voltar')
            .setStyle(ButtonStyle.Secondary)
    );
    await interaction.reply({
        content: 'Envie o novo nome do produto:',
        components: [rowVoltar],
        ephemeral: true
    });
    const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
    const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 60000 });
    collector.on('collect', m => {
        const nome = m.content.trim();
        if (!nome) return m.reply('❌ O nome não pode ser vazio.');
        const db = new sqlite3.Database(dbPath);
        db.run('UPDATE produtos SET titulo = ? WHERE id = ?', [nome, id], err => {
            db.close();
            if (err) {
                m.reply('❌ Erro ao atualizar o nome do produto.');
            } else {
                m.reply('✅ Nome do produto atualizado com sucesso!');
            }
        });
    });
    collector.on('end', collected => {
        if (collected.size === 0) interaction.followUp({ content: 'Tempo esgotado. Nenhuma alteração feita.', ephemeral: true });
    });
}

module.exports.handleEditarTituloProduto = handleEditarTituloProduto;
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'editarproduto',
    description: 'Edita um produto pelo ID. Botões: Titulo, type, preço.',
    async execute(client, message, args) {
        const id = args[0];
        if (!id) return message.reply('❌ Forneça o ID do produto. Ex: !editarproduto prod1');
        // Mostra os botões Titulo, type, preço
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`editar_titulo_produto_${id}`)
                .setLabel('Titulo')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`editar_type_produto_${id}`)
                .setLabel('type')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId(`editar_preco_produto_${id}`)
                .setLabel('preço')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`editar_categoria_produto_${id}`)
                .setLabel('categoria')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`editar_personalizavel_produto_${id}`)
                .setLabel('personalizável')
                .setStyle(ButtonStyle.Secondary)
        );
        await message.reply({ content: `Edição do produto \`${id}\`:`, components: [row] });
// Handler para o botão editar_categoria_produto_<id>
async function handleEditarCategoriaProduto(interaction) {
    const id = interaction.customId.replace('editar_categoria_produto_', '');
    const rowVoltar = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`voltar_editarproduto_${id}`)
            .setLabel('Voltar')
            .setStyle(ButtonStyle.Secondary)
    );
    await interaction.reply({
        content: 'Envie o ID da categoria que deseja associar ao produto:',
        components: [rowVoltar],
        ephemeral: true
    });
    const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
    const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 60000 });
    collector.on('collect', m => {
        const categoriaId = m.content.trim();
        if (!categoriaId) return m.reply('❌ O ID da categoria não pode ser vazio.');
        const db = new sqlite3.Database(dbPath);
        db.run('UPDATE produtos SET categoria = ? WHERE id = ?', [categoriaId, id], err => {
            db.close();
            if (err) {
                m.reply('❌ Erro ao atualizar a categoria do produto.');
            } else {
                m.reply('✅ Categoria do produto atualizada com sucesso!');
            }
        });
    });
    collector.on('end', collected => {
        if (collected.size === 0) interaction.followUp({ content: 'Tempo esgotado. Nenhuma alteração feita.', ephemeral: true });
    });
}

module.exports.handleEditarCategoriaProduto = handleEditarCategoriaProduto;
// Handler para o botão editar_personalizavel_produto_<id>
async function handleEditarPersonalizavelProduto(interaction) {
    const id = interaction.customId.replace('editar_personalizavel_produto_', '');
    const rowVoltar = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`voltar_editarproduto_${id}`)
            .setLabel('Voltar')
            .setStyle(ButtonStyle.Secondary)
    );
    await interaction.reply({
        content: 'O produto é personalizável? (Y/N)',
        components: [rowVoltar],
        ephemeral: true
    });
    const filter = m => m.author.id === interaction.user.id && m.channel.id === interaction.channel.id;
    const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 60000 });
    collector.on('collect', m => {
        const resposta = m.content.trim().toUpperCase();
        if (resposta !== 'Y' && resposta !== 'N') return m.reply('❌ Responda apenas com Y (sim) ou N (não).');
        const personalizavel = resposta === 'Y' ? 1 : 0;
        const db = new sqlite3.Database(dbPath);
        db.run('UPDATE produtos SET personalizavel = ? WHERE id = ?', [personalizavel, id], err => {
            db.close();
            if (err) {
                m.reply('❌ Erro ao atualizar o campo personalizável do produto.');
            } else {
                m.reply(`✅ Campo personalizável atualizado para: ${resposta === 'Y' ? 'Sim' : 'Não'}`);
            }
        });
    });
    collector.on('end', collected => {
        if (collected.size === 0) interaction.followUp({ content: 'Tempo esgotado. Nenhuma alteração feita.', ephemeral: true });
    });
}

module.exports.handleEditarPersonalizavelProduto = handleEditarPersonalizavelProduto;
    }
};
