// index.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { unifiedHandler } = require('./utils/unifiedInteractionHandler');
const logger = require('./utils/logger');
const { DataMigration } = require('./utils/dataMigration');
const { logAndReplyError } = require('./utils/errorHelper');
const { StartupDiagnostics } = require('./utils/startupDiagnostics');

// --- Client Initialization ---
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent, // Required for some message-based interactions
  ],
});

/**
 * The main entry point for the bot.
 * Initializes diagnostics, loads commands, and logs in.
 */
async function main() {
  // 1. Run startup diagnostics
  const diagnostics = new StartupDiagnostics();
  const { success } = await diagnostics.runDiagnostics();

  if (!success) {
    logger.error('❌ Startup diagnostics failed. Halting bot startup.');
    process.exit(1);
  }

  // 2. Load commands
  loadAllCommands();

  // 3. Login to Discord
  client.login(process.env.DISCORD_TOKEN);
}

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

function loadAllCommands() {
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
    // This is a critical error, so we should exit.
    process.exit(1);
  }
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
      logger.error(`No command matching '${interaction.commandName}' was found.`, {
        commandName: interaction.commandName,
        user: interaction.user.tag,
      });
      // ユーザーにコマンドが存在しないことを通知
      await interaction
        .reply({
          content: '❌ このコマンドは存在しないか、現在利用できません。',
          ephemeral: true,
        })
        .catch((e) => logger.error('Failed to reply for non-existent command', { error: e }));
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      // 個々のコマンドでエラーが捕捉されなかった場合の最終的なフォールバック
      logger.error(`[CommandHandler] Uncaught error in command '${interaction.commandName}'`, { error });
      await logAndReplyError(interaction, error, 'コマンドの実行中に予期せぬエラーが発生しました。');
    }
  } else if (interaction.isMessageComponent() || interaction.isModalSubmit()) {
    try {
      await unifiedHandler.handleInteraction(interaction);
    } catch (error) {
      // 個々のハンドラでエラーが捕捉されなかった場合の最終的なフォールバック
      logger.error(`[ComponentHandler] Uncaught error in component '${interaction.customId}'`, { error });
      await logAndReplyError(interaction, error, 'コンポーネントの操作中に予期せぬエラーが発生しました。');
    }
  }
});

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

// --- Start the bot ---
main();