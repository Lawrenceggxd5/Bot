// index.js corrigido com todos os botões tratados
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const config = require('./config.json');
require('./database/db.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.once('ready', () => {
    console.log(`🤖 Bot ${client.user.tag} está online!`);
    const guilds = client.guilds.cache;
    guilds.forEach(guild => {
        const channel = guild.channels.cache.find(
            c => c.type === 0 && c.permissionsFor(guild.members.me).has('SendMessages')
        );
        if (channel) {
            channel.send('Bot ligado!').catch(() => {});
        }
    });
});

process.on('SIGINT', async () => {
    for (const guild of client.guilds.cache.values()) {
        const channel = guild.channels.cache.find(
            c => c.type === 0 && c.permissionsFor(guild.members.me).has('SendMessages')
        );
        if (channel) {
            try { await channel.send('Bot desligando!'); } catch {}
        }
    }
    process.exit(0);
});
process.on('SIGTERM', async () => {
    for (const guild of client.guilds.cache.values()) {
        const channel = guild.channels.cache.find(
            c => c.type === 0 && c.permissionsFor(guild.members.me).has('SendMessages')
        );
        if (channel) {
            try { await channel.send('Bot desligando!'); } catch {}
        }
    }
    process.exit(0);
});

client.on('messageCreate', async message => {
    if (message.author.bot || !message.content.startsWith('!')) return;
    const args = message.content.slice(1).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName);
    if (!command) return;
    try {
        await command.execute(client, message, args);
    } catch (error) {
        console.error(error);
        message.reply('❌ Ocorreu um erro ao executar o comando.');
    }
});

client.on('interactionCreate', async interaction => {
    const customId = interaction.customId;

    if (interaction.isStringSelectMenu() && customId.startsWith('select_produto_')) {
        const { handleSelectProduto } = require('./commands/select-produto-handler');
        await handleSelectProduto(interaction);
        return;
    }

    if (!interaction.isButton()) return;

    // Handlers externos
    if (customId.startsWith('adicionar_produto_')) {
        const { handleAdicionarProduto } = require('./commands/select-produto-handler');
        await handleAdicionarProduto(interaction);
        return;
    }
    if (customId.startsWith('remover_produto_')) {
        const { handleRemoverProduto } = require('./commands/select-produto-handler');
        await handleRemoverProduto(interaction);
        return;
    }
    if (customId === 'verificar_botao') {
        const verificar = require('./commands/verificar.js');
        await verificar.handleInteraction(interaction);
        return;
    }
    if (customId.startsWith('perm-')) {
        const perm = require('./commands/perm.js');
        await perm.handleButton(interaction);
        return;
    }
    if (customId.startsWith('outros_')) {
        const outros = require('./commands/outros.js');
        await outros.handleButton(interaction);
        return;
    }
    if (customId.startsWith('metodos_pagamento_') || customId.startsWith('msg_metodos_pagamento_')) {
        const painelId = customId.split('_').pop();
        const metodosHandler = require('./commands/metodos-pagamento-handle.js');
        await metodosHandler.handle(interaction, painelId);
        return;
    }
    if (customId.startsWith('timeout_')) {
        const timeoutHandler = require('./commands/time-out.js');
        await timeoutHandler.handle(interaction);
        return;
    }

    // Handler centralizado de botões do painel
    const paineldButtonPrefixes = [
        'ticket_', 'painel_', 'mensagens_', 'msg_', 'msg_inicial_', 'msg_cancelamento_',
        'msg_cancelar_ticket_', 'msg_carrinho_', 'msg_produtos_', 'msg_infos_',
        'info_padrao__', 'info-padronizada_', 'confirmar_info_', 'msg_confirmar_compra_',
        'notificacao_painel_', 'timeout_', 'metodos_pagamento_', 'msg_metodos_pagamento_'
    ];
    if (paineldButtonPrefixes.some(prefix => customId.startsWith(prefix))) {
        const painelId = customId.split('_').pop();
        const ticketButtonHandler = require('./commands/ticket-button-handle.js');
        await ticketButtonHandler.handle(interaction, painelId);
        return;
    }

    if (customId.startsWith('config_')) {
        const painelId = customId.replace('config_', '');
        const configButtonHandler = require('./commands/config-button-handle');
        await configButtonHandler.handle(interaction, painelId);
        return;
    }

    if (customId.startsWith('confirmar_')) {
        const safeReply = require('./utils/safeReply');
        await safeReply(interaction, { content: '✅ Painel confirmado com sucesso!', flags: 64 });
        return;
    }
});

client.login(config.token);
