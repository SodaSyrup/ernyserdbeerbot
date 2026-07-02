const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Wirft eine Münze (Kopf oder Zahl)'),
  async execute(interaction) {
    const outcome = Math.random() < 0.5 ? 'Kopf' : 'Zahl';
    await interaction.reply({ content: `🪙 Die Münze zeigt: **${outcome}**!` });
  },
};