const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setbirthday')
    .setDescription('Speichert deinen Geburtstag')
    .addStringOption(option =>
      option.setName('date')
        .setDescription('Datum im Format DD.MM')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('year')
        .setDescription('Optional: Dein Geburtsjahr (z.B. 1995)')
        .setRequired(false)),
  async execute(interaction, db) {
    const date = interaction.options.getString('date');
    const year = interaction.options.getInteger('year');
    
    const datePattern = /^(0[1-9]|[12]\d|3[01])\.(0[1-9]|1[0-2])$/;
    if (!datePattern.test(date)) {
      await interaction.reply({ content: 'Bitte verwende das Format DD.MM (z.B. 24.05 für den 24. Mai).', ephemeral: true });
      return;
    }

    const finalDate = year ? `${date}.${year}` : date;

    const stmt = db.prepare(`
      INSERT INTO birthdays (user_id, birthday_date, channel_id)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        birthday_date = excluded.birthday_date,
        channel_id = excluded.channel_id
    `);
    
    stmt.run(interaction.user.id, finalDate, interaction.channelId);
    await interaction.reply({ content: 'Dein Geburtstag wurde erfolgreich gespeichert!', ephemeral: true });
  },
};