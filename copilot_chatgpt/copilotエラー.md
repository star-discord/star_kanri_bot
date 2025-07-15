# Copilotエラー記録

このファイルは、copilotディレクトリ内で発生したエラーや修正内容を記録するためのものです。

---


## 2025-07-14
- `ファイル構造_命名.md` を新規作成。
  - プロジェクト全体のファイル構造、ファイル構造法則、命名規則を明文化。
- `attendance/buttons.js` を他のfeatureと同じローダー構造に統一。
- 旧来の個別ボタン実装を `attendance/buttons/attendance_work_start_20.js` および `attendance_work_end.js` に分割・移動。
- `attendance/buttons/template.js` を追加。
- これにより、`attendance` 機能も他のfeatureと同じ構造・命名規則に統一。
- 今後、copilot配下の修正や統一作業のたびにここへ記載すること。

---

（以降、作業ごとに追記してください）

## 2025-07-14
- Discord.js v14以降の仕様変更により、`ephemeral: true` は非推奨となったため、全サンプル・実装を `flags: 1 << 6` へ修正。
- インタラクションで「The reply to this interaction has already been sent or deferred.」エラーが出る場合、`deferReply`/`reply`/`editReply` の重複呼び出しを防ぐように修正。
- サンプル（selectsの書き方.md等）も最新仕様に合わせて修正。
- 今後も修正・更新時は必ずこのファイルに内容を記録すること。
