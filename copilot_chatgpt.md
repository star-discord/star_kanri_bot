# Jestテストにおける同一モジュール内関数のSpy失敗と対策

## 1. 発生したエラー

`npm test` を実行した際に、`utils/__tests__/errorHelper.test.js` で以下のテスト失敗が報告された。

**エラーログ:**
```
 FAIL  utils/__tests__/errorHelper.test.js
  ● logAndReplyError › logError と safeReplyToUser が適切に呼ばれること

    expect(jest.fn()).toHaveBeenCalledWith(...expected)

    Expected: "test_cmd [Guild:test_guild] [User:test_user]", "ログだけ", undefined

    Number of calls: 0

      117 |     await errorHelper.logAndReplyError(mockInteraction, 'ログだけ', '表示メッセージ');
      118 |
    > 119 |     expect(logErrorSpy).toHaveBeenCalledWith(
          |                         ^
      120 |       'test_cmd [Guild:test_guild] [User:test_user]',
      121 |       'ログだけ',
      122 |       undefined

      at Object.toHaveBeenCalledWith (utils/__tests__/errorHelper.test.js:119:25)
```

`logAndReplyError` 関数をテストするにあたり、内部で呼び出されるはずの `logError` 関数が一度も呼び出されていない (`Number of calls: 0`) ことが原因でテストが失敗している。

## 2. エラーの原因

この問題は、Jestで**同一モジュール内の関数をspy（スパイ）する際によく発生する典型的な参照の問題**です。

`errorHelper.js` 内で、`logAndReplyError` 関数が同じファイル内で定義されている `logError` 関数を直接呼び出しています。

```javascript
// utils/errorHelper.js
async function logError(...) { /* ... */ }

async function logAndReplyError(...) {
  // この呼び出しは、テストファイルでモックされた関数ではなく、
  // モジュール内部の直接の参照を使っている
  await logError(...); 
}

module.exports = { logError, logAndReplyError };
```

テストファイル側で、`jest.spyOn` を使って `logError` をモックしても、`logAndReplyError` が呼び出す `logError` はモックされる前のオリジナルの関数への参照を保持しているため、spyが検知できません。

## 3. 解決策

この問題を解決するには、関数を個別にインポートするのではなく、**モジュール全体をオブジェクトとしてインポートし、そのオブジェクトのメソッドに対してspyを仕掛ける**必要があります。

### 修正手順

1.  **モジュールをオブジェクトとして `require` する**
    分割代入 (`{ logError, ... }`) ではなく、オブジェクトとしてインポートします。
    ```javascript
    const errorHelper = require('../errorHelper');
    ```

2.  **`jest.spyOn` でオブジェクトのメソッドをモックする**
    `beforeEach` 内で、インポートした `errorHelper` オブジェクトの `logError` プロパティを対象にspyを設定します。
    ```javascript
    let logErrorSpy;
    
    beforeEach(() => {
      // errorHelperオブジェクトのlogErrorメソッドをspyの対象にする
      logErrorSpy = jest.spyOn(errorHelper, 'logError').mockImplementation(async () => {});
    });
    ```

3.  **`mockRestore` で後始末をする**
    `afterEach` でspyを元に戻し、他のテストに影響が出ないようにします。
    ```javascript
    afterEach(() => {
      logErrorSpy.mockRestore();
    });
    ```

---

# Jestテスト: 同一モジュール内関数のSpy失敗と対策 (最終)

## 1. 発生したエラーと根本原因

Jest テスト (`utils/__tests__/errorHelper.test.js`) において、`logAndReplyError` 関数内で呼び出される `logError` および `safeReplyToUser` 関数が、`jest.spyOn` で設定したスパイによって捕捉されない問題が発生していました。

これは、`errorHelper.js` モジュール内で関数が直接呼び出されており、テストでスパイしているモジュールオブジェクト経由の呼び出しと異なるため、スパイが有効になっていなかったことが原因です。

## 2. 最終的な解決策

モジュール内で関数を呼び出す際に、常にモジュールオブジェクト自身 (`module.exports`) を経由するように統一することで、スパイが正しく機能するように修正しました。

### 修正手順 (utils/errorHelper.js)

1.  **ファイルの先頭でモジュールオブジェクトへの参照を保持**
    ```javascript
    const errorHelper = module.exports;
    ```

2.  **関数呼び出しを、保持した参照経由に変更**
    `logAndReplyError` 関数内の `logError` と `safeReplyToUser` の呼び出しを、`errorHelper` 経由に変更
    ```diff
    --- a/utils/errorHelper.js
    +++ b/utils/errorHelper.js
    @@ -66,8 +66,8 @@
      const logMessage = logMsg instanceof Error ? logMsg.message : logMsg;
      const errorObject = logMsg instanceof Error ? logMsg : undefined;
    
    - await logError(`${source} [Guild:${guildId}] [User:${userId}]`, logMessage, errorObject);
    - await safeReplyToUser(interaction, userMsg, options);
    + await errorHelper.logError(`${source} [Guild:${guildId}] [User:${userId}]`, logMessage, errorObject);
    + await errorHelper.safeReplyToUser(interaction, userMsg, options);
    }
    ```

3.  **`module.exports` の再代入を避ける** (より安全な方法)
    ファイルの末尾で `module.exports = { ... }` のように新しいオブジェクトを代入するのではなく、既存の `exports` オブジェクトに `Object.assign` でプロパティを追加
    ```javascript
    Object.assign(module.exports, { logError, safeReplyToUser, logAndReplyError });
    ```

### 修正後の `utils/errorHelper.js` (全体)

```javascript
// utils/errorHelper.js
const { MessageFlagsBitField } = require('discord.js');
const fs = require('fs/promises');
const path = require('path');

const errorHelper = module.exports;

// ... (関数定義: logError, safeReplyToUser, logAndReplyError) ...

Object.assign(module.exports, { logError, safeReplyToUser, logAndReplyError });
```

この修正により、`jest.spyOn(errorHelper, 'logError')` や `jest.spyOn(errorHelper, 'safeReplyToUser')` が `logAndReplyError` 内の呼び出しを正しく捕捉できるようになり、テストは成功するようになりました。

## 3. 関連情報

Jest の `jest.mock()` と `jest.spyOn()` の違いと使い分け:

-   `jest.mock(moduleName)`: 指定されたモジュールを完全にモック化し、そのモジュールのすべてのエクスポートをモック関数に置き換えます。
    -   主に、外部モジュールとの依存を遮断し、テスト対象のロジックに集中したい場合に使用します。
-   `jest.spyOn(object, methodName)`: 特定のオブジェクトのメソッドを監視し、その呼び出し状況（呼び出し回数、引数など）を追跡します。
    -   メソッドの元の実装を維持したまま、テスト中にその動作を検証したい場合に使用します。
    -   `mockImplementation()` を併用することで、メソッドの挙動を一時的に変更することも可能です。

## 4. プロジェクト内 他のテストへの適用

今回のような同一モジュール内関数のスパイに関する問題は、他のテストファイルでも発生する可能性があります。同様の状況がないか確認し、必要であれば同様の修正を適用することで、テストの信頼性を向上させることができます。
この修正により、`errorHelper.logAndReplyError()` が呼び出された際に、その内部で呼び出される `errorHelper.logError()` も正しくモックされた関数が実行され、`toHaveBeenCalledWith` で呼び出しを検知できるようになります。