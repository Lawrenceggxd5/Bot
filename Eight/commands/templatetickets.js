module.exports = {
    name: 'templatetickets',
    description: 'Exibe exemplos de JSON para embed e botões, com instruções.',
    async execute(client, message, args) {
        const embedJson = [
            '{',
            '    "title": "Bem-vindo, <User>!",',
            '    "description": "Escolha uma das opções abaixo no canal <Ticket>.",',
            '    "color": 5793266,',
            '    "fields": [',
            '        { "name": "Produto", "value": "VIP Mensal" },',
            '        { "name": "Preço", "value": "R$ 10,00" }',
            '    ],',
            '    "image": { "url": "https://exemplo.com/imagem.png" },',
            '    "thumbnail": { "url": "https://exemplo.com/thumb.png" }',
            '}',
        ].join('\n');

        const buttonsJson = [
            '[',
            '    { "label": "Opção 1", "custom_id": "botao1", "style": 1 },',
            '    { "label": "Opção 2", "custom_id": "botao2", "style": 3 },',
            '    { "label": "Cancelar", "custom_id": "botao3", "style": 4 }',
            ']',
        ].join('\n');

        const jsonTemplateCompleto = [
            '{',
            '    "title": "Bem-vindo, <User>!",',
            '    "description": "Escolha uma das opções abaixo no canal <Ticket>.",',
            '    "color": 5793266,',
            '    "fields": [',
            '        { "name": "Produto", "value": "VIP Mensal" },',
            '        { "name": "Preço", "value": "R$ 10,00" }',
            '    ],',
            '    "image": { "url": "https://exemplo.com/imagem.png" },',
            '    "thumbnail": { "url": "https://exemplo.com/thumb.png" },',
            '    "buttons": [',
            '        { "label": "Opção 1", "custom_id": "botao1", "style": 1 },',
            '        { "label": "Opção 2", "custom_id": "botao2", "style": 3 },',
            '        { "label": "Cancelar", "custom_id": "botao3", "style": 4 }',
            '    ]',
            '}',
        ].join('\n');

        const jsonExample = [
            '**Exemplo de JSON completo para Embed com 3 Botões customizáveis:**',
            '```json',
            jsonTemplateCompleto,
            '```',
            '',
            'Observações:',
            '- Os campos <User> e <Ticket> são placeholders e só funcionam em mensagens de ticket.',
            '- O campo "buttons" é um array de botões customizáveis. Cada botão pode ter: label, custom_id, style, emoji, disabled.',
            '- Códigos de cor dos botões: 1=azul, 2=cinza, 3=verde, 4=vermelho.',
            '- O campo "color" deve ser número (decimal).',
            '- Não use comentários dentro do JSON.',
            '',
            '**Exemplo de array de botões:**',
            '```json',
            buttonsJson,
            '```',
            '',
            '**Exemplo de Embed simples:**',
            '```json',
            embedJson,
            '```',
        ].join('\n');

        await message.reply(jsonExample);
    }
};
