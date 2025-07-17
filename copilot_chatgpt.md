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

# Jestテストにおける同一モジュール内関数のSpy失敗と対策 (最終解決策)

## 概要
以前から発生していた `utils/__tests__/errorHelper.test.js` のテスト失敗は、`jest.spyOn` が同一モジュール内の関数呼び出しを正しく捕捉できないというJestの典型的な問題に起因していた。

## 根本原因
`errorHelper.js` 内で `logAndReplyError` 関数が、同じファイルで定義された `logError` 関数を直接呼び出していた (`await logError(...)`)。
一方、テストコード (`errorHelper.test.js`) では `jest.spyOn(errorHelper, 'logError')` を使って、`require('../errorHelper')` でインポートした **モジュールオブジェクト (`errorHelper`)** の `logError` メソッドをスパイしていた。

この2つの `logError` は参照が異なるため、スパイは呼び出しを検知できず、「`Number of calls: 0`」という結果になっていた。

## 最終的な解決策
この参照の不一致を解決するため、`errorHelper.js` 自身が自分自身の `exports` オブジェクトを経由して内部関数を呼び出すように修正する。

### 修正ステップ (errorHelper.js)

1.  **ファイルの先頭で `module.exports` への参照を保持する**
    ```javascript
    // utils/errorHelper.js の先頭
    const errorHelper = module.exports;
    ```
2.  **内部関数呼び出しを、保持した参照経由に変更する**
    `logAndReplyError` 関数内の呼び出しを修正。
    ```diff
    // 修正前
    - await logError(`${source} [Guild:${guildId}] [User:${userId}]`, logMessage, errorObject);

    // 修正後
    + await errorHelper.logError(`${source} [Guild:${guildId}] [User:${userId}]`, logMessage, errorObject);
    ```

3.  **`module.exports` の再代入を避ける**
    ファイルの末尾で `module.exports = { ... }` のように新しいオブジェクトを代入すると、ステップ1で保持した参照が無効になる。代わりに `Object.assign` を使い、既存のオブジェクトにプロパティを追加する。
    ```javascript
    // utils/errorHelper.js の末尾
    Object.assign(module.exports, { logError, safeReplyToUser, logAndReplyError });
    ```

## なぜこれで解決するのか
-   `const errorHelper = module.exports;` により、モジュール内の `errorHelper` 変数は、外部から `require` される際と同じ `exports` オブジェクトを指すようになる。
-   `await errorHelper.logError(...)` という呼び出しは、この共有されたオブジェクトのメソッドを実行することになる。
-   テストコードの `jest.spyOn(errorHelper, 'logError')` も同じオブジェクトの同じメソッドを監視するため、呼び出しを正確に捕捉できる。

この修正により、テストコードを変更することなく、`errorHelper.js` 側の実装を修正するだけでテストが成功するようになった。
この修正により、`errorHelper.logAndReplyError()` が呼び出された際に、その内部で呼び出される `errorHelper.logError()` も正しくモックされた関数が実行され、`toHaveBeenCalledWith` で呼び出しを検知できるようになります。