// utils/config/configManager.test.js
const { ConfigManager } = require('./configManager');
const { configSchema, CURRENT_SCHEMA_VERSION } = require('./schema');
const { migrate } = require('./migration');

// Jestでモジュールをモック化
jest.mock('./migration');

/**
 * ICacheインターフェースのインメモリ版モック
 */
class MockCache {
  constructor() { this.store = new Map(); }
  get(guildId) { return this.store.get(guildId); }
  set(guildId, config) { this.store.set(guildId, config); }
  invalidate(guildId) { this.store.delete(guildId); }
}

/**
 * IPersistenceインターフェースのインメモリ版モック
 */
class MockStorage {
  constructor() { this.store = new Map(); }
  async load(guildId) { return this.store.get(guildId) || null; }
  async save(guildId, config) { this.store.set(guildId, config); }
}

describe('ConfigManager', () => {
  let mockCache;
  let mockStorage;
  let configManager;
  const guildId = 'test-guild-123';
  const v1Data = {
    star: { adminRoleIds: ['111'] },
    chatgpt: { apiKey: 'old-key' },
    _version: 1,
  };
  const v2Data = {
    ...v1Data,
    chatgpt: {
        ...v1Data.chatgpt,
        systemMessage: 'You are a helpful assistant.' // 移行後のデータ
    },
    _version: 2
  };

  beforeEach(() => {
    // 各テストの前にモックとインスタンスをリセット
    mockCache = new MockCache();
    mockStorage = new MockStorage();
    configManager = new ConfigManager(mockCache, mockStorage);

    // migrationモックをリセット
    migrate.mockClear();
  });

  describe('get', () => {
    it('キャッシュに存在する場合、キャッシュからデータを返すこと', async () => {
      mockCache.set(guildId, v2Data);
      const config = await configManager.get(guildId);

      expect(config).toEqual(v2Data);
      expect(mockStorage.store.size).toBe(0); // ストレージは呼ばれない
      expect(configManager.cacheHits).toBe(1);
      expect(configManager.cacheMisses).toBe(0);
    });

    it('キャッシュになくストレージに存在する場合、ストレージから読み込みキャッシュに保存すること', async () => {
      mockStorage.store.set(guildId, v2Data);
      migrate.mockReturnValue(v2Data); // 移行は不要

      const config = await configManager.get(guildId);

      expect(config).toEqual(v2Data);
      expect(mockCache.get(guildId)).toEqual(v2Data); // キャッシュに保存されたか
      expect(migrate).toHaveBeenCalledWith(v2Data);
      expect(configManager.cacheHits).toBe(0);
      expect(configManager.cacheMisses).toBe(1);
    });

    it('データが存在しない場合、デフォルト設定を生成し、キャッシュとストレージに保存すること', async () => {
      const defaultConfig = configSchema.parse({});
      defaultConfig._version = CURRENT_SCHEMA_VERSION;

      const config = await configManager.get(guildId);

      expect(config).toEqual(defaultConfig);
      expect(mockCache.get(guildId)).toEqual(defaultConfig);
      expect(mockStorage.store.get(guildId)).toEqual(defaultConfig);
      expect(migrate).not.toHaveBeenCalled();
    });

    it('古いバージョンのデータを読み込んだ場合、移行処理を呼び出し、移行後のデータを保存すること', async () => {
      // ストレージにはv1データをセット
      mockStorage.store.set(guildId, { ...v1Data });
      // migrate関数がv2データを返すようにモック化
      migrate.mockReturnValue({ ...v2Data });

      const config = await configManager.get(guildId);

      // 1. 正しくmigrateが呼び出されたか
      expect(migrate).toHaveBeenCalledTimes(1);
      expect(migrate).toHaveBeenCalledWith(v1Data);

      // 2. 返されたconfigが移行後のものか
      expect(config).toEqual(v2Data);

      // 3. キャッシュにも移行後のデータが保存されているか
      expect(mockCache.get(guildId)).toEqual(v2Data);

      // 4. ストレージも移行後のデータで上書きされたか
      expect(mockStorage.store.get(guildId)).toEqual(v2Data);
    });

    it('移行後のデータが不正な場合、デフォルト設定を返すこと', async () => {
      const invalidData = { star: null }; // 不正なデータ
      mockStorage.store.set(guildId, invalidData);
      migrate.mockReturnValue(invalidData);

      const config = await configManager.get(guildId);
      const defaultConfig = configManager.defaultConfig();

      expect(config).toEqual(defaultConfig);
    });
  });

  describe('set', () => {
    it('有効な設定データをキャッシュとストレージに保存すること', async () => {
      await configManager.set(guildId, v2Data);

      expect(mockCache.get(guildId)).toEqual(v2Data);
      expect(mockStorage.store.get(guildId)).toEqual(v2Data);
    });

    it('無効な設定データを渡すとエラーをスローすること', async () => {
      const invalidConfig = { chatgpt: { maxTokens: 'not-a-number' } };
      // expect(...).rejects.toThrow() で非同期関数のエラーをテスト
      await expect(configManager.set(guildId, invalidConfig)).rejects.toThrow(
        '設定データのバリデーションに失敗しました。'
      );
    });
  });

  describe('invalidate', () => {
    it('指定したギルドのキャッシュを無効化すること', async () => {
        mockCache.set(guildId, v2Data);
        expect(mockCache.get(guildId)).toBeDefined();

        configManager.invalidate(guildId);
        expect(mockCache.get(guildId)).toBeUndefined();
    });
  });
});