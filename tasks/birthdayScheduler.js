module.exports = (client, db) => {
  db.prepare(`
    CREATE TABLE IF NOT EXISTS birthdays (
      user_id TEXT PRIMARY KEY,
      birthday_date TEXT,
      channel_id TEXT
    )
  `).run();

  let lastCheckedDate = null;

  setInterval(() => {
    const today = new Date();
    const dateString = `${today.getDate().toString().padStart(2, '0')}.${(today.getMonth() + 1).toString().padStart(2, '0')}`;
    
    if (today.getHours() === 8 && lastCheckedDate !== dateString) {
      lastCheckedDate = dateString;
      
      const stmt = db.prepare('SELECT user_id, channel_id, birthday_date FROM birthdays WHERE birthday_date LIKE ?');
      const rows = stmt.all(`${dateString}%`);
      
      for (const row of rows) {
        const channel = client.channels.cache.get(row.channel_id);
        if (channel) {
          let greeting = `Alles Gute zum Geburtstag, <@${row.user_id}>!`;
          const parts = row.birthday_date.split('.');
          
          if (parts.length === 3) {
            const age = today.getFullYear() - parseInt(parts[2], 10);
            greeting = `Herzlichen Glückwunsch zum ${age}. Geburtstag, <@${row.user_id}>!`;
          }
          
          channel.send(`@everyone ${greeting} Ich wünsche dir einen wunderbaren Tag voller Freude, Kuchen und tollen Momenten!`);
        }
      }
    }
  }, 60000);
};