// utils/safeReply.js
module.exports = async function safeReply(interaction, options) {
    try {
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(options);
        } else {
            // Se já passou muito tempo, tente deferReply antes
            const now = Date.now();
            if (interaction.createdTimestamp && now - interaction.createdTimestamp > 2500) {
                try { await interaction.deferReply({ flags: 64 }); } catch {}
                await interaction.followUp(options);
            } else {
                await interaction.reply(options);
            }
        }
    } catch (err) {
        // Ignora erro de interaction já respondida/expirada
        if (!err || ![40060, 10062].includes(err.code)) throw err;
    }
};
