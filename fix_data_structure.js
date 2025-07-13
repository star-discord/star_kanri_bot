// fix_data_structure.js - データ構造修正スクリプト
const fs = require('fs');
const path = require('path');

const dataDir = './data';

function fixDataStructure() {
  console.log('🔧 データ構造修正を開始します...');
  
  if (!fs.existsSync(dataDir)) {
    console.log('❌ dataディレクトリが存在しません');
    return;
  }
  
  const guildDirs = fs.readdirSync(dataDir).filter(dir => {
    const fullPath = path.join(dataDir, dir);
    return fs.statSync(fullPath).isDirectory() && /^\d+$/.test(dir);
  });
  
  console.log(`📁 ${guildDirs.length}個のギルドディレクトリを発見`);
  
  guildDirs.forEach(guildId => {
    const jsonPath = path.join(dataDir, guildId, `${guildId}.json`);
    
    if (!fs.existsSync(jsonPath)) {
      console.log(`⚠️ ${guildId}: JSONファイルが存在しません`);
      return;
    }
    
    try {
      const rawData = fs.readFileSync(jsonPath, 'utf8');
      const data = JSON.parse(rawData);
      
      let modified = false;
      
      // 1. tousuna → totusuna 修正
      if (data.tousuna) {
        console.log(`🔄 ${guildId}: tousuna → totusuna に修正`);
        data.totusuna = data.tousuna;
        delete data.tousuna;
        modified = true;
      }
      
      // 2. totusuna 構造確認・修正
      if (!data.totusuna) {
        console.log(`➕ ${guildId}: totusuna セクション追加`);
        data.totusuna = {};
        modified = true;
      }
      
      // 3. instances が {} なら [] に修正
      if (data.totusuna.instances && typeof data.totusuna.instances === 'object' && !Array.isArray(data.totusuna.instances)) {
        console.log(`🔄 ${guildId}: instances を {} から [] に修正`);
        data.totusuna.instances = [];
        modified = true;
      }
      
      // 4. instances が存在しなければ追加
      if (!data.totusuna.instances) {
        console.log(`➕ ${guildId}: instances 配列追加`);
        data.totusuna.instances = [];
        modified = true;
      }
      
      // 5. star_config.adminRoleId → adminRoleIds 移行
      if (data.star_config && data.star_config.adminRoleId && !data.star_config.adminRoleIds) {
        console.log(`🔄 ${guildId}: adminRoleId → adminRoleIds 移行`);
        data.star_config.adminRoleIds = [data.star_config.adminRoleId];
        delete data.star_config.adminRoleId;
        modified = true;
      }
      
      if (modified) {
        // バックアップ作成
        const backupPath = `${jsonPath}.backup.${Date.now()}`;
        fs.copyFileSync(jsonPath, backupPath);
        console.log(`💾 ${guildId}: バックアップ作成: ${path.basename(backupPath)}`);
        
        // 修正済みデータ保存
        fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`✅ ${guildId}: データ構造修正完了`);
      } else {
        console.log(`✅ ${guildId}: 修正不要`);
      }
      
    } catch (error) {
      console.error(`❌ ${guildId}: 処理エラー:`, error.message);
    }
  });
  
  console.log('🎉 データ構造修正完了');
}

// 実行
fixDataStructure();
