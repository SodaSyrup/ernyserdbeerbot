const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('randomteams')
    .setDescription('Erstellt zufällige Teams aus einer Liste von Spielern')
    .addStringOption(option =>
      option.setName('players')
        .setDescription('Kommagetrennte Liste der Spieler (z.B. Alex, @Ben, Chris)')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('teams')
        .setDescription('Anzahl der Teams')
        .setRequired(true)
        .setMinValue(2)),
  async execute(interaction) {
    const playersString = interaction.options.getString('players');
    const teamCount = interaction.options.getInteger('teams');
    
    let players = playersString.split(',').map(p => p.trim()).filter(p => p.length > 0);

    if (players.length < teamCount) {
      return interaction.reply({ content: 'Du brauchst mehr Spieler als Teams!', ephemeral: true });
    }

    for (let i = players.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [players[i], players[j]] = [players[j], players[i]];
    }

    const teams = Array.from({ length: teamCount }, () => []);
    
    players.forEach((player, index) => {
      teams[index % teamCount].push(player);
    });

    let replyText = '**🎲 Zufällige Teams:**\n\n';
    teams.forEach((team, index) => {
      replyText += `**Team ${index + 1}:** ${team.join(', ')}\n`;
    });

    await interaction.reply({ content: replyText });
  },
};