# SNSプロフィール用URL（掲載準備）

サイトがレビュー・マージされて公開された後に使う。今回、SNS投稿・プロフィール編集は実施していない。

| 対象 | 日本語トップ | 英語トップ |
| --- | --- | --- |
| Reddit u/springport04 | https://springport.github.io/?from=reddit&campaign=profile_202611 | https://springport.github.io/en/?from=reddit&campaign=profile_202611 |
| X @SpringPort_yh | https://springport.github.io/?from=x&campaign=profile_202611 | https://springport.github.io/en/?from=x&campaign=profile_202611 |
| TikTok @spring_port | https://springport.github.io/?from=tiktok&campaign=profile_202611 | https://springport.github.io/en/?from=tiktok&campaign=profile_202611 |
| YouTube（アカウント確認後） | https://springport.github.io/?from=youtube&campaign=profile_202611 | https://springport.github.io/en/?from=youtube&campaign=profile_202611 |

特定アプリを紹介する投稿では、`/`を`/apps/kitchen-notes/`などへ置き換え、同じクエリを付ける。英語詳細は`/en/apps/kitchen-notes/`。例:

https://springport.github.io/en/apps/night-aquarium/?from=reddit&campaign=aquarium_intro_202611

`campaign`は半角英数字・ハイフン・アンダースコアの1〜64文字。氏名やメールなどの個人情報は含めない。`utm_source=reddit&utm_medium=organic_social&utm_campaign=profile_202611`形式でも受け付ける。従来のfrom/campaignリンクもそのまま使える。

サイト内の対応ページや日英を移動しても識別情報を引き継ぎ、Playリンクのutm_source/utm_medium/utm_campaign/referrerへ反映する。utm_contentは`en_detail`や`ja_bottom`など、言語とCTA位置を自動付与する。

フッターのSNS一覧は`content/social.json`で管理する。YouTubeは正しい公開アカウントを確認してから追加し、`node scripts/build.mjs`で再生成する。Reddit/X/TikTokはユーザー指定のプロフィールを設定済み。

リンクを付けても訪問・インストール件数がこのサイト内に自動集計されるわけではない。集計の範囲は[AUDIT.ja.md](AUDIT.ja.md)を参照。
