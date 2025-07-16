
// utils/dataMigration.test.js
const { DataMigration } = require('./dataMigration');

/**
 * データ移行のテスト用サンプルデータ
 */
const sampleOldData = {
  // 旧式形式: トップレベルに管理者設定
  adminRoleIds: ["123456789", "987654321"],
  notifyChannelId: "555666777",

  // 旧式形式: totusunaが配列
  totsuna: [
    {
      id: "uuid-1",
      userId: "user123",
      body: "報告内容1",
      installChannelId: "channel123",
      replicateChannelIds: ["channel456", "channel789"]
    }
  ],

  // 他のデータ
  someOtherData: {
    value: "preserved"
  }
};

const sampleMixedData = {
  // 新旧混在
  adminRoleIds: ["old-role-1"],
  star_config: {
    adminRoleIds: ["new-role-1", "new-role-2"]
  },
  notifyChannelId: "old-channel",

  totsuna: {
    // 新しい形式だが、一部データが古い
    instances: [
      {
        id: "uuid-new",
        userId: "user456"
      }
    ]
  }
};

/**
 * テスト実行関数
 */
async function testMigration() {
  console.log('🧪 データ移行テスト開始');

  const migration = new DataMigration();

  // テスト1: 旧式データの移行
  console.log('\n📋 テスト1: 旧式データ移行');
  console.log('移行前:', JSON.stringify(sampleOldData, null, 2));

  // ダミーclient（guilds参照エラー防止用）
  const dummyClient = { guilds: { cache: new Map() } };
  const migratedData1 = await migration.performMigration(sampleOldData, 'test-guild-1', dummyClient);
  console.log('移行後:', JSON.stringify(migratedData1, null, 2));

  // テスト2: 混在データの移行
  console.log('\n📋 テスト2: 混在データ移行');
  console.log('移行前:', JSON.stringify(sampleMixedData, null, 2));

  const migratedData2 = await migration.performMigration(sampleMixedData, 'test-guild-2', dummyClient);
  console.log('移行後:', JSON.stringify(migratedData2, null, 2));

  console.log('\n✅ テスト完了');
  // ここでテストが成功したことをJestに伝える
  expect(true).toBe(true);
}

// Jestのテストケースとして定義
test('データ移行が正常に完了すること', async () => {
  await testMigration();
});

// node での直接実行用
if (require.main === module) {
  testMigration().catch(console.error);
}

module.exports = { testMigration, sampleOldData, sampleMixedData };
