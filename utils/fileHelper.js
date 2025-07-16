// utils/fileHelper.js

const fs = require('fs');
const path = require('path');

/**
 * 指定されたJSONファイルを読み込んでオブジェクトとして返す
 * @param {string} filePath
 * @param {object | null} initialData - パースエラー時のフォールバックデータ
 * @returns {Promise<Object>}
 */
function readJSON(filePath, initialData = null) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(`❌ readJSON: ファイル読み込みエラー - ${filePath}`, err);
        return reject(err);
      }
      try {
        const json = JSON.parse(data);
        resolve(json);
      } catch (parseErr) {
        console.error(`❌ readJSON: JSONパースエラー - ${filePath}`, parseErr);

        // パースエラー時に破損ファイルをバックアップ
        try {
          const backupDir = path.join(path.dirname(filePath), 'backup_errors');
          if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
          }
          const backupPath = path.join(backupDir, `${path.basename(filePath)}.${Date.now()}.corrupted`);
          fs.renameSync(filePath, backupPath); // 同期的にリネーム
          console.log(`💾 破損ファイルをバックアップしました: ${backupPath}`);
        } catch (backupErr) {
          console.error(`❌ 破損ファイルのバックアップに失敗しました: ${filePath}`, backupErr);
        }

        if (initialData) {
          console.warn(`[readJSON] パースエラーのため初期データでフォールバックします: ${filePath}`);
          resolve(initialData);
        } else {
          reject(parseErr);
        }
      }
    });
  });
}

/**
 * オブジェクトをJSONファイルとして保存する
 * @param {string} filePath
 * @param {Object} data
 * @returns {Promise<void>}
 */
function writeJSON(filePath, data) {
  return new Promise((resolve, reject) => {
    const dir = path.dirname(filePath);
    fs.mkdir(dir, { recursive: true }, (mkErr) => {
      if (mkErr) {
        console.error(`❌ writeJSON: ディレクトリ作成エラー - ${dir}`, mkErr);
        return reject(mkErr);
      }
      fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8', (err) => {
        if (err) {
          console.error(`❌ writeJSON: ファイル書き込みエラー - ${filePath}`, err);
          return reject(err);
        }
        resolve();
      });
    });
  });
}

/**
 * ギルドごとのデータフォルダと初期JSONファイルを作成し、ファイルパスを返す
 * @param {string} guildId
 * @returns {Promise<string>} - JSONファイルの絶対パス
 */
async function ensureGuildJSON(guildId) {
  const dir = path.join('data', guildId);
  const filePath = path.join(dir, `${guildId}.json`);

  try {
    await fs.promises.mkdir(dir, { recursive: true });

    try {
      await fs.promises.access(filePath); // 存在確認
      console.log(`📄 既存JSONファイルを使用: ${filePath}`);
    } catch {
      // ファイルが存在しない場合のみ新規作成
      const initialData = {
        star_config: {
          adminRoleIds: [],
          notifyChannelId: null
        },
        // 他の初期設定項目をここに追加
      };
      await fs.promises.writeFile(filePath, JSON.stringify(initialData, null, 2), 'utf8');
      console.log(`✅ 初期JSONファイルを作成しました: ${filePath}`);
    }

    return filePath;
  } catch (err) {
    console.error(`❌ ensureGuildJSON: 初期化エラー - ${filePath}`, err);
    throw err;
  }
}

module.exports = {
  readJSON,
  writeJSON,
  ensureGuildJSON,
};
