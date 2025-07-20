const { unifiedHandler } = require('../unifiedInteractionHandler');
const { MessageFlagsBitField } = require('discord.js');

// `unifiedInteractionHandler` が依存する `totusuna_setti` モジュールをモック化します。
// これにより、実際のハンドラロジックを実行せずに、
// `unifiedInteractionHandler` が正しくハンドラを呼び出しているかだけをテストできます。
jest.mock(
  '../totusuna_setti',
  () => {
    // 各インタラクションタイプ（button, modal, select）のモックハンドラを作成します。
    const mockButtonHandler = { handle: jest.fn() };
    const mockModalHandler = { handle: jest.fn() };
    const mockSelectHandler = { handle: jest.fn() };

    // customId に基づいて適切なモックハンドラを返す、モックの `findHandler` 関数を作成します。
    const findButtonHandler = (customId) =>
      customId.startsWith('test_button:') ? mockButtonHandler : null;
    const findModalHandler = (customId) =>
      customId.startsWith('test_modal:') ? mockModalHandler : null;
    const findSelectHandler = (customId) =>
      customId.startsWith('test_select:') ? mockSelectHandler : null;

    return {
      buttons: jest.fn(findButtonHandler),
      modals: jest.fn(findModalHandler),
      selects: jest.fn(findSelectHandler),
      // テストケース内でモックハンドラにアクセスできるように、内部的に保持します。
      _mockHandlers: {
        button: mockButtonHandler,
        modal: mockModalHandler,
        select: mockSelectHandler,
      },
    };
  },
  { virtual: true }
);

describe('UnifiedInteractionHandler', () => {
  let totusunaHandlers;
  let mockButtonHandler, mockModalHandler, mockSelectHandler;

  beforeEach(() => {
    // 各テストの前に、すべてのモックをリセットします。
    jest.clearAllMocks();
    // モック化されたモジュールとその内部ハンドラへの参照を取得します。
    totusunaHandlers = require('../totusuna_setti');
    mockButtonHandler = totusunaHandlers._mockHandlers.button;
    mockModalHandler = totusunaHandlers._mockHandlers.modal;
    mockSelectHandler = totusunaHandlers._mockHandlers.select;
  });

  it('should find and execute a button handler for a matching customId', async () => {
    const mockInteraction = {
      isButton: () => true,
      isModalSubmit: () => false,
      isStringSelectMenu: () => false,
      customId: 'test_button:action1',
    };

    await unifiedHandler.handleInteraction(mockInteraction);

    // 正しいハンドラ検索関数が呼ばれたか検証します。
    expect(totusunaHandlers.buttons).toHaveBeenCalledWith('test_button:action1');
    // 正しいハンドラの `handle` メソッドが呼ばれたか検証します。
    expect(mockButtonHandler.handle).toHaveBeenCalledWith(mockInteraction);
    // 他のタイプのハンドラが呼ばれていないことを確認します。
    expect(mockModalHandler.handle).not.toHaveBeenCalled();
  });

  it('should find and execute a modal handler for a matching customId', async () => {
    const mockInteraction = {
      isButton: () => false,
      isModalSubmit: () => true,
      isStringSelectMenu: () => false,
      customId: 'test_modal:submit',
    };

    await unifiedHandler.handleInteraction(mockInteraction);

    expect(totusunaHandlers.modals).toHaveBeenCalledWith('test_modal:submit');
    expect(mockModalHandler.handle).toHaveBeenCalledWith(mockInteraction);
    expect(mockButtonHandler.handle).not.toHaveBeenCalled();
  });

  it('should find and execute a select menu handler for a matching customId', async () => {
    const mockInteraction = {
      isButton: () => false,
      isModalSubmit: () => false,
      isStringSelectMenu: () => true,
      customId: 'test_select:optionA',
    };

    await unifiedHandler.handleInteraction(mockInteraction);

    expect(totusunaHandlers.selects).toHaveBeenCalledWith('test_select:optionA');
    expect(mockSelectHandler.handle).toHaveBeenCalledWith(mockInteraction);
  });

  it('should do nothing for unsupported interaction types', async () => {
    const mockInteraction = {
      isButton: () => false,
      isModalSubmit: () => false,
      isStringSelectMenu: () => false,
      customId: 'some_id',
    };

    await unifiedHandler.handleInteraction(mockInteraction);

    // どのハンドラ検索関数も呼ばれないことを確認します。
    expect(totusunaHandlers.buttons).not.toHaveBeenCalled();
    expect(totusunaHandlers.modals).not.toHaveBeenCalled();
    expect(totusunaHandlers.selects).not.toHaveBeenCalled();
  });

  it('should reply with an ephemeral message if no handler is found', async () => {
    const mockInteraction = {
      isButton: () => true,
      customId: 'unhandled_button_id',
      replied: false,
      deferred: false,
      reply: jest.fn().mockResolvedValue(),
    };

    await unifiedHandler.handleInteraction(mockInteraction);

    // ハンドラが見つからなかった場合に、ユーザーに通知する `reply` が呼ばれることを検証します。
    expect(mockInteraction.reply).toHaveBeenCalledWith({
      content: 'この操作は現在無効か、期限切れです。',
      flags: MessageFlagsBitField.Flags.Ephemeral,
    });
  });
});