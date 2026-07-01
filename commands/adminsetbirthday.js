const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('adminsetbirthday')
    .setDescription('Setzt den Geburtstag eines anderen Benutzers (Nur für Administratoren)')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Der Benutzer, dessen Geburtstag gesetzt werden soll')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('date')
        .setDescription('Datum im Format DD.MM')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('year')
        .setDescription('Optional: Das Geburtsjahr (z.B. 1995)')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction, db) {
    const targetUser = interaction.options.getUser('user');
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
    
    stmt.run(targetUser.id, finalDate, interaction.channelId);
    await interaction.reply({ content: `Der Geburtstag von <@${targetUser.id}> wurde erfolgreich auf den ${finalDate} gesetzt!`, ephemeral: true });
  },
};