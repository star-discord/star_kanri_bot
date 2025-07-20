const fs = require('fs/promises');
const path = require('path');

/**
 * 指定パスの破損ファイルをバックアップフォルダに移動
 * @param {string} filePath
 * @returns {Promise<string|null>} バックアップ先ファイルパス
 */
async function backupCorruptedFile(filePath, error) {
  try {
    const backupDir = path.join(path.dirname(filePath), 'backup_errors');
    await fs.mkdir(backupDir, { recursive: true });

    const backupPath = path.join(backupDir, `${path.basename(filePath)}.${Date.now()}.corrupted`);
    await fs.rename(filePath, backupPath);
    logger.info(`💾 破損ファイルをバックアップ: ${backupPath}`);
    logger.error(
      `[backupCorruptedFile] ❌ 破損ファイル "${filePath}" をバックアップしました:`,
      { errorMessage: error.message }
    );
    return backupPath;
  } catch (err) {
    logger.error(`❌ バックアップ失敗: ${filePath}`, { error: err });
    return null;
  }
}

/**
 * 読み込み失敗・破損時に使う初期データ構造
 * @returns {Object}
 */
function getInitialGuildData() {
  return {
    star: {
      adminRoleIds: [],
      notifyChannelId: null,
    },
    chatgpt: {
      apiKey: '',
      maxTokens: 150,
      temperature: 0.7,
    },
    totusuna: {
      instances: [],
    },
    kpi: {
      settings: {},
    },
  };
}

/**
 * オブジェクトを整形して文字列化（2スペースJSON）
 * @param {Object} data
 * @returns {string}
 */
function prettyStringify(data) {
  return JSON.stringify(data, null, 2);
}

/**
 * 指定されたJSONファイルを読み込む（存在しない/破損時は初期データで復元）
 * @param {string} filePath
 * @param {object} initialData
 * @returns {Promise<Object>}
 */
async function readJSON(filePath, initialData = {}) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    if (err.code === 'ENOENT') {
      logger.warn(`[readJSON] ファイル未発見 → 初期データ使用: ${filePath}`);
      return initialData;
    }

    if (err instanceof SyntaxError) {
      logger.error(`❌ JSONパースエラー: ${filePath}`, { error: err });
      await backupCorruptedFile(filePath, err);
      logger.warn(`[readJSON] パース不能 → 初期データで復元: ${filePath}`);
      return initialData;
    }

    logger.error(`❌ 読み込み失敗: ${filePath}`, { error: err });
    throw err;
  }
}

/**
 * オブジェクトをJSONファイルとして保存
 * @param {string} filePath
 * @param {Object} data
 * @returns {Promise<void>}
 */
async function writeJSON(filePath, data) {
  try {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, prettyStringify(data), 'utf-8');
  } catch (err) {
    logger.error(`❌ 書き込み失敗: ${filePath}`, { error: err });
    throw err;
  }
}

/**
 * ギルドごとの初期データファイルを保証・返却
 * @param {string} guildId
 * @returns {Promise<string>} - JSONファイルのパス
 */
async function ensureGuildJSON(guildId) {
  const dir = path.join('data', guildId);
  const filePath = path.join(dir, `${guildId}.json`);

  try {
    await fs.mkdir(dir, { recursive: true });

    try {
      await fs.access(filePath);
      logger.info(`📄 JSONファイル発見: ${filePath}`);
    } catch {
      const initialData = getInitialGuildData();
      await fs.writeFile(filePath, prettyStringify(initialData), 'utf-8');
      logger.info(`✅ 新規JSONファイル作成: ${filePath}`);
    }

    return filePath;
  } catch (err) {
    logger.error(`❌ ensureGuildJSON: 初期化失敗: ${filePath}`, { error: err });
    throw err;
  }
}

module.exports = {
  readJSON,
  writeJSON,
  ensureGuildJSON,
  getInitialGuildData, // オプション: 初期値だけ使いたい他モジュール用
};
