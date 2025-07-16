// utils/startupDiagnostics.js
const fs = require('fs');
const path = require('path');

/**
 * Bot起動時の診断レポート生成
 */
class StartupDiagnostics {
  constructor() {
    this.warnings = [];
    this.errors = [];
    this.info = [];
  }

  /**
   * 環境変数チェック
   */
  checkEnvironmentVariables() {
    this.info.push('🔍 環境変数チェック開始');
    
    const requiredVars = ['DISCORD_TOKEN'];
    const optionalVars = ['OPENAI_API_KEY', 'GCS_BUCKET_NAME', 'GCP_PROJECT_ID'];

    let allRequired = true;
    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        this.errors.push(`❌ 必須環境変数が未設定: ${varName}`);
        allRequired = false;
      } else {
        this.info.push(`✅ ${varName}: 設定済み`);
      }
    }

    for (const varName of optionalVars) {
      if (!process.env[varName]) {
        this.warnings.push(`⚠️ オプション環境変数が未設定: ${varName} (該当機能は無効)`);
      } else {
        this.info.push(`✅ ${varName}: 設定済み`);
      }
    }

    return allRequired;
  }

  /**
   * ファイル構造チェック
   */
  checkFileStructure() {
    this.info.push('📁 ファイル構造チェック開始');

    const criticalPaths = [
      'commands',
      'events', 
      'utils',
      'utils/permissions',
      'utils/star_chat_gpt_setti',
      'utils/totusuna_setti'
    ];

    for (const dirPath of criticalPaths) {
      if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        this.info.push(`✅ ${dirPath}: ${files.length}個のファイル`);
      } else {
        this.warnings.push(`⚠️ ディレクトリが存在しません: ${dirPath}`);
      }
    }
  }

  /**
   * コマンドファイルの整合性チェック
   */
  checkCommandFiles() {
    this.info.push('⚙️ コマンドファイルチェック開始');

    const commandsDir = 'commands';
    if (!fs.existsSync(commandsDir)) {
      this.errors.push('❌ commandsディレクトリが存在しません');
      return;
    }

    const files = fs.readdirSync(commandsDir);
    const jsFiles = files.filter(file => file.endsWith('.js'));

    let validCommands = 0;
    let invalidCommands = 0;

    for (const file of jsFiles) {
      const filePath = path.join(commandsDir, file);
      try {
        const stats = fs.statSync(filePath);
        if (stats.size === 0) {
          this.warnings.push(`⚠️ 空のコマンドファイル: ${file}`);
          invalidCommands++;
          continue;
        }

        // 基本的な構文チェック（require試行）
        delete require.cache[require.resolve(path.resolve(filePath))];
        const command = require(path.resolve(filePath));
        
        if (command?.data?.name && typeof command.execute === 'function') {
          validCommands++;
        } else {
          this.warnings.push(`⚠️ 無効なコマンド形式: ${file}`);
          invalidCommands++;
        }
      } catch (error) {
        this.errors.push(`❌ コマンド読み込みエラー (${file}): ${error.message}`);
        invalidCommands++;
      }
    }

    this.info.push(`📊 コマンド統計: 有効 ${validCommands}件, 無効 ${invalidCommands}件`);
  }

  /**
   * パッケージ依存関係チェック
   */
  checkDependencies() {
    this.info.push('📦 依存関係チェック開始');

    const criticalPackages = [
      'discord.js',
      'dotenv'
    ];

    const optionalPackages = [
      'openai',
      '@google-cloud/storage',
      'exceljs'
    ];

    for (const pkg of criticalPackages) {
      try {
        require(pkg);
        this.info.push(`✅ ${pkg}: インストール済み`);
      } catch (error) {
        this.errors.push(`❌ 必須パッケージが見つかりません: ${pkg}`);
      }
    }

    for (const pkg of optionalPackages) {
      try {
        require(pkg);
        this.info.push(`✅ ${pkg}: インストール済み`);
      } catch (error) {
        this.warnings.push(`⚠️ オプションパッケージが見つかりません: ${pkg} (該当機能は無効)`);
      }
    }
  }

  /**
   * 診断実行
   * @returns {Promise<{success: boolean, hasWarnings: boolean, errors: string[], warnings: string[], info: string[]}>}
   */
  async runDiagnostics() {
    console.log('🔬 STAR管理Bot 起動時診断を開始します...\n');

    this.checkEnvironmentVariables();
    this.checkFileStructure();
    this.checkCommandFiles();
    this.checkDependencies();

    console.log('📋 診断レポート');
    console.log('='.repeat(50));

    if (this.errors.length > 0) {
      console.log('\n❌ エラー:');
      this.errors.forEach(error => console.log(`  ${error}`));
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️ 警告:');
      this.warnings.forEach(warning => console.log(`  ${warning}`));
    }

    if (this.info.length > 0) {
      console.log('\nℹ️ 情報:');
      this.info.forEach(info => console.log(`  ${info}`));
    }

    console.log('='.repeat(50));

    const hasErrors = this.errors.length > 0;
    if (hasErrors) {
      console.log('🚨 重要なエラーが検出されました。Bot起動前に修正してください。');
    } else if (this.warnings.length > 0) {
      console.log('⚡ 警告はありますが、Botは起動可能です。');
    } else {
      console.log('✨ 診断完了 - すべて正常です！');
    }

    return {
      success: !hasErrors,
      hasWarnings: this.warnings.length > 0,
      errors: this.errors,
      warnings: this.warnings,
      info: this.info,
    };
  }
}

module.exports = { StartupDiagnostics };
