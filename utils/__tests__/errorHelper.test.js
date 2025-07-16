// utils/__tests__/errorHelper.test.js
const fs = require('fs/promises');
const errorHelper = require('../errorHelper');

// モジュール全体をモックするのではなく、必要な部分だけをモックする
jest.mock('fs/promises');

describe('logError', () => {
  let consoleSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('ログファイルとコンソールに出力されること', async () => {
    const error = new Error('テストエラー');
    error.stack = 'Error: テストエラー\n at Test.fn';

    await errorHelper.logError('testSource', 'Test message', error);

    // コンソール出力の確認
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[testSource] Test message\nError: テストエラー\n at Test.fn'));

    // ファイル書き込みの確認
    expect(fs.appendFile).toHaveBeenCalledWith(
      expect.stringContaining('error.log'),
      expect.stringContaining('[testSource] Test message\nError: テストエラー\n at Test.fn'),
      'utf8'
    );
  });

  it('ファイル出力に失敗しても例外を出さないこと', async () => {
    fs.appendFile.mockRejectedValueOnce(new Error('書き込み失敗'));

    await errorHelper.logError('testSource', 'ログ失敗のテスト');

    // 失敗ログがコンソールに出力されることを確認
    expect(consoleSpy).toHaveBeenCalledWith('[logError] ログファイルへの書き込みに失敗:', expect.any(Error));
  });
});

describe('safeReplyToUser', () => {
  const mockFollowUp = jest.fn();
  const mockReply = jest.fn();
  let consoleSpy;

  const baseInteraction = {
    replied: false,
    deferred: false,
    reply: mockReply,
    followUp: mockFollowUp,
    id: '123',
    customId: 'test_custom_id',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('未応答なら reply を使う', async () => {
    await errorHelper.safeReplyToUser(baseInteraction, 'hello');
    expect(mockReply).toHaveBeenCalledWith(expect.objectContaining({ content: 'hello' }));
    expect(mockFollowUp).not.toHaveBeenCalled();
  });

  it('応答済みなら followUp を使う', async () => {
    const interaction = { ...baseInteraction, replied: true };
    await errorHelper.safeReplyToUser(interaction, 'already replied');
    expect(mockFollowUp).toHaveBeenCalledWith(expect.objectContaining({ content: 'already replied' }));
    expect(mockReply).not.toHaveBeenCalled();
  });

  it('エラーが起きても例外を投げずに console.error を出す', async () => {
    const erroringReply = jest.fn().mockRejectedValue(new Error('失敗'));
    const interaction = { ...baseInteraction, reply: erroringReply };

    await errorHelper.safeReplyToUser(interaction, 'error case');
    expect(consoleSpy).toHaveBeenCalledWith('[safeReplyToUser] 応答失敗:', '失敗', expect.any(Object));
  });
});

describe('logAndReplyError', () => {
  let logErrorSpy;
  let safeReplyToUserSpy;

  const mockInteraction = {
    commandName: 'test_cmd',
    guildId: 'test_guild',
    user: { id: 'test_user' },
    reply: jest.fn(),
    followUp: jest.fn(),
  };

  beforeEach(() => {
    // spyOnを使用して、同じモジュール内の関数呼び出しを監視・モックする
    logErrorSpy = jest.spyOn(errorHelper, 'logError').mockImplementation(async () => {});
    safeReplyToUserSpy = jest.spyOn(errorHelper, 'safeReplyToUser').mockImplementation(async () => {});
  });

  afterEach(() => {
    // テスト後にスパイを元に戻す
    logErrorSpy.mockRestore();
    safeReplyToUserSpy.mockRestore();
  });

  it('logError と safeReplyToUser が適切に呼ばれること', async () => {
    await errorHelper.logAndReplyError(mockInteraction, 'ログだけ', '表示メッセージ');

    expect(logErrorSpy).toHaveBeenCalled();
    expect(safeReplyToUserSpy).toHaveBeenCalled();
  });

  it('Error オブジェクトを渡した場合に正しく処理されること', async () => {
    const err = new Error('スタック確認');
    await errorHelper.logAndReplyError(mockInteraction, err, '表示メッセージ');

    expect(logErrorSpy).toHaveBeenCalled();
  });
});