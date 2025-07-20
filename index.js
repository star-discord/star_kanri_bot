// index.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { unifiedHandler } = require('./utils/unifiedInteractionHandler');
const logger = require('./utils/logger');
const { DataMigration } = require('./utils/dataMigration');

// --- Client Initialization ---
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent, // Required for some message-based interactions
  ],
});

// --- Command Loading ---
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');

/**
 * Recursively loads command files from a directory.
 * @param {string} dir The directory to search.
 * @returns {string[]} An array of full file paths.
 */
function loadCommandFiles(dir) {
  const commandFilePaths = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      commandFilePaths.push(...loadCommandFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      commandFilePaths.push(fullPath);
    }
  }
  return commandFilePaths;
}

try {
  const commandFiles = loadCommandFiles(commandsPath);
  for (const filePath of commandFiles) {
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    } else {
      logger.warn(
        `[CommandLoad] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
  logger.info(`[CommandLoad] Successfully loaded ${client.commands.size} commands.`);
} catch (error) {
  logger.error('[CommandLoad] Failed to load commands.', { error });
}

// --- Event Handlers ---
client.once('ready', async () => {
  logger.info(`✅ Logged in as ${client.user.tag}!`);

  try {
    // Run data migration on startup
    const migration = new DataMigration();
    await migration.migrateAllGuilds(client);
  } catch (error) {
    logger.error('[Migration] An error occurred during the startup data migration.', { error });
  }

  logger.info('🚀 Bot is ready and running!');
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) {
      logger.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }
    try {
      await command.execute(interaction);
    } catch (error) {
      // The command's own error handler should catch this, but this is a fallback.
      logger.error(`[CommandHandler] Uncaught error executing command: ${interaction.commandName}`, {
        error,
      });
    }
  } else if (interaction.isMessageComponent() || interaction.isModalSubmit()) {
    try {
      await unifiedHandler.handleInteraction(interaction);
    } catch (error) {
      logger.error('[ComponentHandler] Uncaught error handling component interaction', {
        customId: interaction.customId,
        error,
      });
    }
  }
});

// --- Bot Login ---
if (!process.env.DISCORD_TOKEN) {
  logger.error('❌ DISCORD_TOKEN is not set in .env file. Bot cannot start.');
  process.exit(1);
}

client.login(process.env.DISCORD_TOKEN);

// --- Process-level Error Handling ---
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', { error });
  // 重大なエラーの場合はプロセスを終了するのが安全
  process.exit(1);
});

// --- Graceful Shutdown ---
const handleShutdown = (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  client.destroy();
  process.exit(0);
};

process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);