const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('triggerbirthday')
    .setDescription('Löst manuell eine Geburtstagsnachricht zum Testen aus')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Der Benutzer, für den die Nachricht gesendet werden soll')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction, db) {
    const targetUser = interaction.options.getUser('user');

    const stmt = db.prepare('SELECT channel_id FROM birthdays WHERE user_id = ?');
    const row = stmt.get(targetUser.id);

    if (row) {
      const channel = interaction.client.channels.cache.get(row.channel_id);
      if (channel) {
        await channel.send(`@everyone Alles Gute zum Geburtstag, <@${targetUser.id}>! Ich wünsche dir einen wunderbaren Tag voller Freude, Kuchen und tollen Momenten!`);
        await interaction.reply({ content: 'Test-Nachricht wurde erfolgreich gesendet!', ephemeral: true });
      } else {
        await interaction.reply({ content: 'Fehler: Der Kanal, in dem der Geburtstag gespeichert wurde, existiert nicht mehr.', ephemeral: true });
      }
    } else {
      await interaction.reply({ content: 'Fehler: Dieser Benutzer hat noch keinen Geburtstag in der Datenbank gespeichert.', ephemeral: true });
    }
  },
};