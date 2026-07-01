const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const db = new Database('birthdays.db');

db.prepare(`
  CREATE TABLE IF NOT EXISTS birthdays (
    user_id TEXT PRIMARY KEY,
    birthday_date TEXT,
    channel_id TEXT
  )
`).run();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds
  ]
});

client.commands = new Collection();
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
  }
}

let lastCheckedDate = null;

client.on('ready', async () => {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  await rest.put(
    Routes.applicationCommands(client.user.id),
    { body: commands },
  );

  setInterval(() => {
    const today = new Date();
    const dateString = `${today.getDate().toString().padStart(2, '0')}.${(today.getMonth() + 1).toString().padStart(2, '0')}`;
    
    if (today.getHours() === 8 && lastCheckedDate !== dateString) {
      lastCheckedDate = dateString;
      
      const stmt = db.prepare('SELECT user_id, channel_id FROM birthdays WHERE birthday_date LIKE ?');
      const rows = stmt.all(`${dateString}%`);
      
      for (const row of rows) {
        const channel = client.channels.cache.get(row.channel_id);
        if (channel) {
          channel.send(`@everyone Alles Gute zum Geburtstag, <@${row.user_id}>! Ich wünsche dir einen wunderbaren Tag voller Freude, Kuchen und tollen Momenten!`);
        }
      }
    }
  }, 60000);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction, db);
  } catch (error) {
    await interaction.reply({ content: 'Ein Fehler ist aufgetreten.', ephemeral: true });
  }
});

client.login(process.env.DISCORD_TOKEN);