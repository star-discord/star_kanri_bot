const { idManager } = require('../idManager');

describe('idManager', () => {
  const testUUID = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';

  describe('generateUUID', () => {
    it('should generate a valid v4 UUID', () => {
      const uuid = idManager.generateUUID();
      // A simple regex check is sufficient for this test's purpose.
      // The underlying library is assumed to be tested.
      expect(uuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });
  });

  describe('createButtonId', () => {
    it('should create a standard button ID without a UUID', () => {
      expect(idManager.createButtonId('star_config', 'add_role')).toBe('star_config:add_role');
    });

    it('should create a standard button ID with a UUID', () => {
      expect(idManager.createButtonId('totusuna_setti', 'delete', testUUID)).toBe(
        `totusuna_setti:delete:${testUUID}`
      );
    });

    it('should create a special report button ID for totusuna_setti', () => {
      expect(idManager.createButtonId('totusuna_setti', 'report', testUUID)).toBe(
        `report_totsuna_button_${testUUID}`
      );
    });

    it('should throw an error for an unknown category', () => {
      expect(() => idManager.createButtonId('unknown_category', 'action')).toThrow(
        '[IdManager] Unknown button category: "unknown_category"'
      );
    });
  });

  describe('createModalId', () => {
    it('should create a simple modal ID without an action or UUID', () => {
      expect(idManager.createModalId('star_config')).toBe('star_config_modal');
    });

    it('should create a modal ID with an action', () => {
      expect(idManager.createModalId('totusuna_setti', 'install')).toBe('totusuna_modal_install');
    });

    it('should create a modal ID with an action and UUID', () => {
      expect(idManager.createModalId('totusuna_setti', 'edit', testUUID)).toBe(
        `totusuna_modal_edit:${testUUID}`
      );
    });

    it('should create a modal ID with only a UUID for specific categories', () => {
      expect(idManager.createModalId('totusuna_config', '', testUUID)).toBe(
        `totusuna_config_edit_modal_${testUUID}`
      );
    });

    it('should throw an error for an unknown category', () => {
      expect(() => idManager.createModalId('unknown_category')).toThrow(
        '[IdManager] Unknown modal category: "unknown_category"'
      );
    });
  });

  describe('createSelectId', () => {
    it('should create a select menu ID', () => {
      expect(idManager.createSelectId('totusuna_setti', 'select_main')).toBe(
        'totusuna_setti:select_main'
      );
    });

    it('should throw an error for an unknown category', () => {
      expect(() => idManager.createSelectId('unknown_category', 'action')).toThrow(
        '[IdManager] Unknown select category: "unknown_category"'
      );
    });
  });
});