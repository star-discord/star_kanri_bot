const fs = require('fs/promises');
const path = require('path');

/**
 * 初期データを返す（必要に応じて外部からカスタム可能）
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
 * JSONファイルを読み込み、失敗時はエラーを投げる
 * @param {string} filePath
 * @returns {Promise<Object>}
 */
async function readJSON(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`❌ [fileHandler:readJSON] ファイル読み込み失敗: ${filePath}`, err);
    throw err;
  }
}

/**
 * オブジェクトをJSONファイルに保存（フォルダ自動作成）
 * @param {string} filePath
 * @param {Object} data
 * @returns {Promise<void>}
 */
async function writeJSON(filePath, data) {
  try {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`❌ [fileHandler:writeJSON] 書き込み失敗: ${filePath}`, err);
    throw err;
  }
}

/**
 * ギルド用のJSONファイルがなければ作成し、そのパスを返す
 * @param {string} guildId
 * @param {Object} [initialData=getInitialGuildData()] 初期データ
 * @returns {Promise<string>}
 */
async function ensureGuildJSON(guildId, initialData = getInitialGuildData()) {
  const dir = path.join('data', guildId);
  const filePath = path.join(dir, `${guildId}.json`);

  try {
    await fs.mkdir(dir, { recursive: true });

    try {
      await fs.access(filePath); // ファイル存在確認
    } catch {
      // ファイルが存在しない → 新規作成
      await fs.writeFile(filePath, JSON.stringify(initialData, null, 2), 'utf8');
      console.log(`✅ [fileHandler] 初期ファイル作成: ${filePath}`);
    }

    return filePath;
  } catch (err) {
    console.error(`❌ [fileHandler:ensureGuildJSON] 初期化失敗: ${filePath}`, err);
    throw err;
  }
}

module.exports = {
  readJSON,
  writeJSON,
  ensureGuildJSON,
  getInitialGuildData, // 外部利用のためにエクスポート
};
