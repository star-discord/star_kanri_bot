const { configManager } = require('../configManager');
const fileHelper = require('../fileHelper');

// fileHelperモジュールをモック化し、実際のファイルI/Oを発生させないようにします。
jest.mock('../fileHelper', () => ({
  ensureGuildJSON: jest.fn(),
  readJSON: jest.fn(),
  writeJSON: jest.fn(),
}));

describe('ConfigManager', () => {
  const guildId = 'test-guild-123';
  const jsonPath = `/data/${guildId}/${guildId}.json`;
  const defaultConfig = {
    star: { adminRoleIds: [], notifyChannelId: null },
    chatgpt: { apiKey: '', maxTokens: 150, temperature: 0.7, persona: null },
    totusuna: { instances: [] },
    kpi: { settings: {} },
  };

  beforeEach(() => {
    // 各テストの前に、すべてのモックと内部キャッシュをクリアします。
    jest.clearAllMocks();
    configManager.pathCache.clear();
    configManager.configCache.clear();
    // ensureGuildJSONが常にテスト用のパスを返すように設定します。
    fileHelper.ensureGuildJSON.mockResolvedValue(jsonPath);
  });

  describe('getGuildConfig', () => {
    it('should read from file, merge defaults, and cache on first call', async () => {
      const fileConfig = { star: { adminRoleIds: ['123'] }, customSection: {} };
      fileHelper.readJSON.mockResolvedValue(fileConfig);

      const result = await configManager.getGuildConfig(guildId);

      // readJSONが呼ばれたことを確認します。
      expect(fileHelper.readJSON).toHaveBeenCalledWith(jsonPath);
      // デフォルト設定とファイルの設定がマージされていることを確認します。
      expect(result.star.adminRoleIds).toEqual(['123']);
      expect(result.chatgpt.temperature).toBe(0.7); // from default
      // キャッシュに保存されたことを確認します。
      expect(configManager.configCache.get(guildId)).toEqual(result);
    });

    it('should return from cache on subsequent calls without reading file', async () => {
      const cachedConfig = { ...defaultConfig, star: { adminRoleIds: ['from-cache'] } };
      configManager.configCache.set(guildId, cachedConfig);

      const result = await configManager.getGuildConfig(guildId);

      // ファイルI/Oが発生していないことを確認します。
      expect(fileHelper.readJSON).not.toHaveBeenCalled();
      // キャッシュからデータが返されたことを確認します。
      expect(result).toEqual(cachedConfig);
    });
  });

  describe('saveGuildConfig', () => {
    it('should write to file and update the cache', async () => {
      const newConfig = { ...defaultConfig, star: { adminRoleIds: ['new-role'] } };

      await configManager.saveGuildConfig(guildId, newConfig);

      // writeJSONが正しいパスとデータで呼ばれたことを確認します。
      expect(fileHelper.writeJSON).toHaveBeenCalledWith(jsonPath, newConfig);
      // キャッシュが新しい設定で更新されたことを確認します。
      expect(configManager.configCache.get(guildId)).toEqual(newConfig);
    });
  });

  describe('Array Operations', () => {
    beforeEach(() => {
      // すべての配列操作テストで、初期状態のモックを設定します。
      const initialConfig = {
        ...defaultConfig,
        totusuna: {
          instances: [{ id: 'uuid-1', body: 'initial body' }],
        },
      };
      // getGuildConfigが常にこの初期設定を返すようにします。
      jest.spyOn(configManager, 'getGuildConfig').mockResolvedValue(initialConfig);
    });

    it('addItemToArray should add an item and save', async () => {
      const newItem = { id: 'uuid-2', body: 'new item' };
      await configManager.addItemToArray(guildId, 'totusuna', 'instances', newItem);

      // writeJSONが呼ばれたことを確認します。
      expect(fileHelper.writeJSON).toHaveBeenCalledTimes(1);
      // writeJSONに渡されたデータ（第一引数）のtotusuna.instancesを確認します。
      const savedConfig = fileHelper.writeJSON.mock.calls[0][1];
      expect(savedConfig.totusuna.instances).toHaveLength(2);
      expect(savedConfig.totusuna.instances[1]).toEqual(newItem);
    });

    it('updateItemInArray should update an existing item and save', async () => {
      const updates = { body: 'updated body' };
      const result = await configManager.updateItemInArray(
        guildId,
        'totusuna',
        'instances',
        'uuid-1',
        updates
      );

      expect(result).toBe(true);
      expect(fileHelper.writeJSON).toHaveBeenCalledTimes(1);
      const savedConfig = fileHelper.writeJSON.mock.calls[0][1];
      expect(savedConfig.totusuna.instances[0].body).toBe('updated body');
    });

    it('updateItemInArray should return false for a non-existent item', async () => {
      const result = await configManager.updateItemInArray(
        guildId,
        'totusuna',
        'instances',
        'non-existent-uuid',
        { body: 'wont happen' }
      );

      expect(result).toBe(false);
      expect(fileHelper.writeJSON).not.toHaveBeenCalled();
    });

    it('removeItemFromArray should remove an existing item and save', async () => {
      const result = await configManager.removeItemFromArray(
        guildId,
        'totusuna',
        'instances',
        'uuid-1'
      );

      expect(result).toBe(true);
      expect(fileHelper.writeJSON).toHaveBeenCalledTimes(1);
      const savedConfig = fileHelper.writeJSON.mock.calls[0][1];
      expect(savedConfig.totusuna.instances).toHaveLength(0);
    });

    it('removeItemFromArray should return false for a non-existent item', async () => {
      const result = await configManager.removeItemFromArray(
        guildId,
        'totusuna',
        'instances',
        'non-existent-uuid'
      );

      expect(result).toBe(false);
      expect(fileHelper.writeJSON).not.toHaveBeenCalled();
    });
  });
});