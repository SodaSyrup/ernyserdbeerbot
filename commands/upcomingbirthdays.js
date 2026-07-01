const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('upcomingbirthdays')
    .setDescription('Zeigt die nächsten 10 anstehenden Geburtstage an'),
  async execute(interaction, db) {
    const stmt = db.prepare('SELECT user_id, birthday_date FROM birthdays');
    const allBirthdays = stmt.all();

    if (allBirthdays.length === 0) {
      await interaction.reply({ content: 'Es sind noch keine Geburtstage in der Datenbank gespeichert.', ephemeral: true });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = allBirthdays.map(bday => {
      const parts = bday.birthday_date.split('.');
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;

      let nextBday = new Date(today.getFullYear(), month, day);

      if (nextBday < today) {
        nextBday.setFullYear(today.getFullYear() + 1);
      }

      const diffTime = nextBday.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        userId: bday.user_id,
        dateString: bday.birthday_date,
        daysUntil: diffDays
      };
    });

    upcoming.sort((a, b) => a.daysUntil - b.daysUntil);

    const top10 = upcoming.slice(0, 10);

    let replyText = '**Die nächsten 10 Geburtstage:**\n\n';
    
    top10.forEach((b, index) => {
      const inDaysText = b.daysUntil === 0 ? '**(Heute!)**' : `(in ${b.daysUntil} Tagen)`;
      replyText += `${index + 1}. <@${b.userId}> - ${b.dateString} ${inDaysText}\n`;
    });

    await interaction.reply({ content: replyText, ephemeral: true });
  },
};