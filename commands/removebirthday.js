const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removebirthday')
    .setDescription('Löscht deinen gespeicherten Geburtstag aus der Datenbank'),
  async execute(interaction, db) {
    const stmt = db.prepare('DELETE FROM birthdays WHERE user_id = ?');
    const result = stmt.run(interaction.user.id);

    if (result.changes > 0) {
      await interaction.reply({ content: 'Dein Geburtstag wurde erfolgreich gelöscht.', ephemeral: true });
    } else {
      await interaction.reply({ content: 'Du hattest keinen Geburtstag gespeichert.', ephemeral: true });
    }
  },
};