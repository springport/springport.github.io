# SpringPort

SpringPort公式アプリ紹介サイト。GitHub Pagesで配信する静的HTMLです。

- 日本語: https://springport.github.io/
- English: https://springport.github.io/en/
- 調査・素材の制約: [docs/AUDIT.ja.md](docs/AUDIT.ja.md)
- SNS掲載用URL: [docs/SOCIAL-URLS.ja.md](docs/SOCIAL-URLS.ja.md)

## 編集と確認

Node.js 20以上のみで動作し、npm依存パッケージのインストールは不要です。

```sh
node scripts/build.mjs
node --test tests/*.test.mjs
node scripts/serve.mjs
```

プレビュー: http://127.0.0.1:4173/

本文は`content/apps.json`、SNSリンクは`content/social.json`、出典・画像サイズは`content/media.json`で管理します。`scripts/build.mjs`で日英18ページ・404・sitemapを生成し、生成物もコミットします。GitHub Pages側でビルドや外部サービスの設定は不要です。

`assets/site.css`と`assets/site.js`は共通です。日英の対応ページへ切り替えても、許可した流入元とキャンペーン情報をURLと同じタブのsessionStorageで引き継ぎます。Google PlayリンクにUTMとInstall Referrer用の`referrer`を付けます。サイトから解析イベントは送信しません。

`app-ads.txt`、`google15383816efe73253.html`、`.nojekyll`は変更せず、既存のプライバシーポリシーURLを保持してください。レビュー後にmainへマージすると既存のGitHub Pagesで公開されます。
