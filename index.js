const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const db = new Database('birthdays.db');

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

client.on('ready', async () => {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  await rest.put(
    Routes.applicationCommands(client.user.id),
    { body: commands },
  );

  const birthdayScheduler = require('./tasks/birthdayScheduler.js');
  birthdayScheduler(client, db);
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