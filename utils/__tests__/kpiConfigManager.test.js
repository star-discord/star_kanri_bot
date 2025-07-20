const { configManager } = require('../configManager');
const { kpiConfigManager } = require('../kpiConfigManager');

// configManagerモジュールをモック化し、実際のファイルI/Oを発生させないようにします。
jest.mock('../configManager');

describe('KpiConfigManager', () => {
  const guildId = 'test-kpi-guild';
  const SECTION = 'kpi';

  beforeEach(() => {
    // 各テストの前に、すべてのモックをクリアします。
    jest.clearAllMocks();
  });

  describe('getShopList', () => {
    it('should return the list of shops from configManager', async () => {
      const mockShops = ['shopA', 'shopB'];
      configManager.getSectionConfig.mockResolvedValue({ shops: mockShops });

      const shops = await kpiConfigManager.getShopList(guildId);

      expect(configManager.getSectionConfig).toHaveBeenCalledWith(guildId, SECTION);
      expect(shops).toEqual(mockShops);
    });

    it('should return an empty array if no shops are configured', async () => {
      configManager.getSectionConfig.mockResolvedValue({}); // 'shops'キーが存在しない場合

      const shops = await kpiConfigManager.getShopList(guildId);

      expect(shops).toEqual([]);
    });
  });

  describe('addShop', () => {
    it('should add a new shop and call updateSectionConfig', async () => {
      const initialShops = ['shopA'];
      // getShopListの動作をモックします。
      jest.spyOn(kpiConfigManager, 'getShopList').mockResolvedValue(initialShops);

      const result = await kpiConfigManager.addShop(guildId, 'shopB');

      expect(result.success).toBe(true);
      // updateSectionConfigが新しいリストで呼ばれたか検証します。
      expect(configManager.updateSectionConfig).toHaveBeenCalledWith(guildId, SECTION, {
        shops: ['shopA', 'shopB'],
      });
    });

    it('should not add a duplicate shop', async () => {
      const initialShops = ['shopA', 'shopB'];
      jest.spyOn(kpiConfigManager, 'getShopList').mockResolvedValue(initialShops);

      const result = await kpiConfigManager.addShop(guildId, 'shopA');

      expect(result.success).toBe(false);
      expect(result.reason).toBe('duplicate');
      // configManagerが呼ばれていないことを確認します。
      expect(configManager.updateSectionConfig).not.toHaveBeenCalled();
    });
  });

  describe('getTargets', () => {
    it('should return the targets object from configManager', async () => {
      const mockTargets = { shopA: [{ date: '2024-01-01', target: 10 }] };
      configManager.getSectionConfig.mockResolvedValue({ targets: mockTargets });

      const targets = await kpiConfigManager.getTargets(guildId);

      expect(configManager.getSectionConfig).toHaveBeenCalledWith(guildId, SECTION);
      expect(targets).toEqual(mockTargets);
    });

    it('should return an empty object if no targets are configured', async () => {
      configManager.getSectionConfig.mockResolvedValue({});

      const targets = await kpiConfigManager.getTargets(guildId);

      expect(targets).toEqual({});
    });
  });

  describe('addTargets', () => {
    it('should add a new target for a shop and save', async () => {
      configManager.getSectionConfig.mockResolvedValue({ targets: {} });

      await kpiConfigManager.addTargets(guildId, ['shopA'], '2024-01-01', 100, 'test-user');

      expect(configManager.updateSectionConfig).toHaveBeenCalledTimes(1);
      const savedPayload = configManager.updateSectionConfig.mock.calls[0][2];

      expect(savedPayload.targets.shopA).toHaveLength(1);
      expect(savedPayload.targets.shopA[0].date).toBe('2024-01-01');
      expect(savedPayload.targets.shopA[0].target).toBe(100);
    });

    it('should update an existing target for a specific date', async () => {
      const initialTargets = { shopA: [{ date: '2024-01-01', target: 50, setBy: 'old-user' }] };
      configManager.getSectionConfig.mockResolvedValue({ targets: initialTargets });

      await kpiConfigManager.addTargets(guildId, ['shopA'], '2024-01-01', 200, 'new-user');

      expect(configManager.updateSectionConfig).toHaveBeenCalledTimes(1);
      const savedPayload = configManager.updateSectionConfig.mock.calls[0][2];

      expect(savedPayload.targets.shopA).toHaveLength(1);
      expect(savedPayload.targets.shopA[0].target).toBe(200);
      expect(savedPayload.targets.shopA[0].setBy).toBe('new-user');
    });
  });
});