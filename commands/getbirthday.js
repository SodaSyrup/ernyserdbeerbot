const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('getbirthday')
    .setDescription('Zeigt den Geburtstag eines Benutzers an')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Der Benutzer, dessen Geburtstag du sehen möchtest')
        .setRequired(true)),
  async execute(interaction, db) {
    const targetUser = interaction.options.getUser('user');

    const stmt = db.prepare('SELECT birthday_date FROM birthdays WHERE user_id = ?');
    const row = stmt.get(targetUser.id);

    if (row) {
      await interaction.reply({ content: `<@${targetUser.id}> hat am ${row.birthday_date} Geburtstag!`, ephemeral: true });
    } else {
      await interaction.reply({ content: 'Dieser Benutzer hat noch keinen Geburtstag gespeichert.', ephemeral: true });
    }
  },
};