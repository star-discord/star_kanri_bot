// utils/migrationHelper.js
const fs = require('fs');
const path = require('path');

/**
 * 移行支援ヘルパークラス
 * 既存ファイルの統合と移行を支援
 */
class MigrationHelper {
  constructor() {
    this.baseDir = __dirname;
    this.backupDir = path.join(this.baseDir, '.backup');
  }

  /**
   * ファイルをバックアップ
   * @param {string} filePath 
   */
  async backupFile(filePath) {
    if (!fs.existsSync(filePath)) return false;

    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }

    const fileName = path.basename(filePath);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(this.backupDir, `${fileName}.${timestamp}.bak`);

    try {
      fs.copyFileSync(filePath, backupPath);
      console.log(`📦 バックアップ作成: ${fileName} → ${backupPath}`);
      return true;
    } catch (error) {
      console.error(`❌ バックアップ失敗: ${fileName}`, error);
      return false;
    }
  }

  /**
   * 重複するハンドラーファイルを特定
   * @returns {object}
   */
  findDuplicateHandlers() {
    const duplicates = {
      buttons: [],
      modals: [],
      selects: [],
      handlers: []
    };

    // ボタンハンドラーファイルを検索
    const buttonFiles = this.findFilesByPattern('**/buttons.js');
    duplicates.buttons = buttonFiles;

    // モーダルハンドラーファイルを検索
    const modalFiles = this.findFilesByPattern('**/modals.js');
    duplicates.modals = modalFiles;

    // セレクトハンドラーファイルを検索
    const selectFiles = this.findFilesByPattern('**/selects.js');
    duplicates.selects = selectFiles;

    // その他のハンドラーファイル
    const handlerFiles = this.findFilesByPattern('**/*Handler.js');
    duplicates.handlers = handlerFiles;

    return duplicates;
  }

  /**
   * パターンに一致するファイルを検索
   * @param {string} pattern 
   * @returns {string[]}
   */
  findFilesByPattern(pattern) {
    const results = [];
    const searchDir = path.resolve(this.baseDir);

    const search = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          // ディレクトリの場合は再帰的に検索
          search(fullPath);
        } else if (entry.isFile()) {
          // ファイルの場合はパターンマッチング
          const relativePath = path.relative(searchDir, fullPath);
          if (this.matchPattern(relativePath, pattern)) {
            results.push(fullPath);
          }
        }
      }
    };

    search(searchDir);
    return results;
  }

  /**
   * 簡単なパターンマッチング
   * @param {string} filePath 
   * @param {string} pattern 
   * @returns {boolean}
   */
  matchPattern(filePath, pattern) {
    // 簡単な実装：**と*をサポート
    const regexPattern = pattern
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\./g, '\\.');
    
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(filePath.replace(/\\/g, '/'));
  }

  /**
   * 統合可能性を分析
   * @returns {object}
   */
  analyzeIntegrationPotential() {
    const duplicates = this.findDuplicateHandlers();
    const analysis = {
      totalFiles: 0,
      integrationCandidates: [],
      potentialSavings: 0
    };

    // ファイル数を計算
    for (const [type, files] of Object.entries(duplicates)) {
      analysis.totalFiles += files.length;

      if (files.length > 1) {
        analysis.integrationCandidates.push({
          type,
          count: files.length,
          files: files.map(f => path.relative(this.baseDir, f)),
          savingsPotential: files.length - 1 // 1つに統合できる
        });
        analysis.potentialSavings += files.length - 1;
      }
    }

    return analysis;
  }

  /**
   * 使用されていないファイルを特定
   * @returns {string[]}
   */
  async findUnusedFiles() {
    const allFiles = this.findFilesByPattern('**/*.js');
    const unusedFiles = [];

    for (const filePath of allFiles) {
      if (await this.isFileUnused(filePath)) {
        unusedFiles.push(filePath);
      }
    }

    return unusedFiles;
  }

  /**
   * ファイルが使用されているかチェック
   * @param {string} filePath 
   * @returns {boolean}
   */
  async isFileUnused(filePath) {
    const fileName = path.basename(filePath, '.js');
    const allFiles = this.findFilesByPattern('**/*.js');
    
    // 自分自身を除外
    const otherFiles = allFiles.filter(f => f !== filePath);

    for (const otherFile of otherFiles) {
      try {
        const content = fs.readFileSync(otherFile, 'utf8');
        
        // require文でインポートされているかチェック
        if (content.includes(`require('./${fileName}')`) ||
            content.includes(`require('./${fileName}.js')`) ||
            content.includes(`require('${fileName}')`) ||
            content.includes(fileName)) {
          return false; // 使用されている
        }
      } catch (error) {
        // ファイル読み込みエラーは無視
      }
    }

    return true; // 使用されていない
  }

  /**
   * 移行レポートを生成
   * @returns {string}
   */
  generateMigrationReport() {
    const analysis = this.analyzeIntegrationPotential();
    
    let report = '# コード統合分析レポート\n\n';
    report += `**分析日時:** ${new Date().toLocaleString('ja-JP')}\n\n`;
    report += `**総ファイル数:** ${analysis.totalFiles}\n`;
    report += `**統合可能性:** ${analysis.potentialSavings}ファイル削減可能\n\n`;

    if (analysis.integrationCandidates.length > 0) {
      report += '## 統合候補\n\n';
      
      for (const candidate of analysis.integrationCandidates) {
        report += `### ${candidate.type} ファイル\n`;
        report += `- **ファイル数:** ${candidate.count}\n`;
        report += `- **削減可能:** ${candidate.savingsPotential}ファイル\n`;
        report += '- **対象ファイル:**\n';
        
        for (const file of candidate.files) {
          report += `  - \`${file}\`\n`;
        }
        report += '\n';
      }
    }

    report += '## 推奨統合手順\n\n';
    report += '1. **バックアップ作成** - 既存ファイルをバックアップ\n';
    report += '2. **統合ハンドラー導入** - unifiedInteractionHandler.js を使用\n';
    report += '3. **段階的移行** - 機能別に順次移行\n';
    report += '4. **テスト実施** - 各機能の動作確認\n';
    report += '5. **重複ファイル削除** - 不要なファイルを削除\n\n';

    report += '## 注意事項\n\n';
    report += '- 移行前に必ずバックアップを作成してください\n';
    report += '- 段階的に移行し、各段階でテストを実施してください\n';
    report += '- customId の互換性を確認してください\n';

    return report;
  }

  /**
   * 自動移行を実行（デモ）
   * @param {boolean} dryRun - 実際の変更は行わず、ログ出力のみ
   */
  async performAutoMigration(dryRun = true) {
    console.log('🚀 自動移行を開始します...');
    console.log(`📋 モード: ${dryRun ? 'ドライラン（変更なし）' : '実際の移行'}`);

    const duplicates = this.findDuplicateHandlers();

    // Step 1: バックアップ作成
    if (!dryRun) {
      console.log('\n📦 バックアップを作成中...');
      for (const [type, files] of Object.entries(duplicates)) {
        for (const file of files) {
          await this.backupFile(file);
        }
      }
    }

    // Step 2: 統合可能ファイルの特定
    console.log('\n🔍 統合可能ファイルを分析中...');
    const analysis = this.analyzeIntegrationPotential();
    console.log(`統合により ${analysis.potentialSavings} ファイル削減可能`);

    // Step 3: index.js の更新提案
    console.log('\n📝 index.js の更新提案:');
    console.log('従来のハンドラー import を以下に置き換え:');
    console.log('const { unifiedHandler } = require(\'./utils/unifiedInteractionHandler\');');
    
    if (dryRun) {
      console.log('\n⚠️  ドライランモードのため実際の変更は行いませんでした');
      console.log('実際の移行を行う場合は performAutoMigration(false) を実行してください');
    } else {
      console.log('\n✅ 移行が完了しました');
    }

    return analysis;
  }
}

// シングルトンインスタンス
const migrationHelper = new MigrationHelper();

// CLI用のスクリプト
if (require.main === module) {
  console.log('📊 コード統合分析を実行中...\n');
  
  const analysis = migrationHelper.analyzeIntegrationPotential();
  console.log('分析結果:');
  console.log(`総ファイル数: ${analysis.totalFiles}`);
  console.log(`削減可能: ${analysis.potentialSavings} ファイル\n`);
  
  if (analysis.integrationCandidates.length > 0) {
    console.log('統合候補:');
    analysis.integrationCandidates.forEach(candidate => {
      console.log(`- ${candidate.type}: ${candidate.count}ファイル → ${candidate.savingsPotential}削減可能`);
    });
  }

  // レポート生成
  const report = migrationHelper.generateMigrationReport();
  const reportPath = path.join(__dirname, 'migration-report.md');
  require('fs').writeFileSync(reportPath, report);
  console.log(`\n📄 詳細レポート: ${reportPath}`);
}

module.exports = {
  MigrationHelper,
  migrationHelper
};
