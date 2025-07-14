// fix_data_structure.js - データ構造修正スクリプト
const fs = require('fs').promises; // Use async file operations
const path = require('path');

const dataDir = path.join(__dirname, 'data');

/**
 * Applies all migration rules to a single data object.
 * @param {object} data The guild data object.
 * @returns {{data: object, modified: boolean, logs: string[]}}
 */
function applyMigrations(data) {
  let modified = false;
  const logs = [];

  // 1. tousuna -> totusuna
  if (data.tousuna) {
    logs.push("🔄 'tousuna' key renamed to 'totusuna'.");
    data.totusuna = data.tousuna;
    delete data.tousuna;
    modified = true;
  }

  // 2. Ensure totusuna object and instances array exist
  if (!data.totusuna) {
    logs.push("➕ 'totusuna' section created.");
    data.totusuna = { instances: [] };
    modified = true;
  } else if (data.totusuna.instances && typeof data.totusuna.instances === 'object' && !Array.isArray(data.totusuna.instances)) {
    logs.push("🔄 'instances' converted from object to array.");
    data.totusuna.instances = [];
    modified = true;
  } else if (!data.totusuna.instances) {
    logs.push("➕ 'instances' array created.");
    data.totusuna.instances = [];
    modified = true;
  }

  // 3. star_config.adminRoleId -> adminRoleIds
  if (data.star_config?.adminRoleId && !data.star_config.adminRoleIds) {
    logs.push("🔄 Migrated 'adminRoleId' to 'adminRoleIds' array.");
    data.star_config.adminRoleIds = [data.star_config.adminRoleId];
    delete data.star_config.adminRoleId;
    modified = true;
  }

  return { data, modified, logs };
}

/**
 * Main function to run the data structure migration.
 */
async function fixDataStructure() {
  const dryRun = process.argv.includes('--dry-run');
  console.log('🔧 Starting data structure migration...');
  if (dryRun) {
    console.log('💧 DRY RUN MODE: No files will be changed.');
  }

  try {
    await fs.access(dataDir);
  } catch {
    console.error('❌ "data" directory does not exist. Aborting.');
    return;
  }

  const guildDirs = (await fs.readdir(dataDir, { withFileTypes: true }))
    .filter(dirent => dirent.isDirectory() && /^\d+$/.test(dirent.name))
    .map(dirent => dirent.name);

  console.log(`📁 Found ${guildDirs.length} guild directories.`);
  let modifiedCount = 0;

  for (const guildId of guildDirs) {
    const jsonPath = path.join(dataDir, guildId, `${guildId}.json`);
    try {
      await fs.access(jsonPath);
      const rawData = await fs.readFile(jsonPath, 'utf8');
      const data = JSON.parse(rawData);

      const result = applyMigrations(data);

      if (result.modified) {
        modifiedCount++;
        console.log(`\n⚠️ [${guildId}] Needs update:`);
        result.logs.forEach(log => console.log(`  - ${log}`));

        if (!dryRun) {
          // Create backup
          const backupPath = `${jsonPath}.backup.${Date.now()}`;
          await fs.copyFile(jsonPath, backupPath);
          console.log(`  💾 Backup created: ${path.basename(backupPath)}`);

          // Write modified data
          await fs.writeFile(jsonPath, JSON.stringify(result.data, null, 2), 'utf8');
          console.log(`  ✅ Data structure successfully updated.`);
        }
      } else {
        console.log(`- [${guildId}] OK. No changes needed.`);
      }
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log(`- [${guildId}] No JSON file found, skipping.`);
      } else {
        console.error(`❌ [${guildId}] Error processing file:`, error.message);
      }
    }
  }

  console.log('\n🎉 Migration process complete.');
  if (dryRun) {
    console.log(`💧 DRY RUN: Found ${modifiedCount} files that would be modified.`);
  } else {
    console.log(`✅ Successfully updated ${modifiedCount} files.`);
  }
}

// Execute the script
fixDataStructure().catch(err => {
  console.error('An unexpected error occurred during the migration process:', err);
});
