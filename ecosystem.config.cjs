// pm2 設定：appinews-slack-actions（子專案 2 / Phase 1 Slack 互動端點）。
// 注意：pm2 只把標準檔名 ecosystem.config.cjs 當設定解析；自訂檔名會被當腳本直接跑。
// 部署：cd /root/appi.news && pm2 start ecosystem.config.cjs && pm2 save
// 健康：curl -s http://127.0.0.1:3399/health   # 應回 ok
// 對外：NPM Proxy Host hook.appi.news → 172.18.0.1:3399（Force SSL）；UFW 放行 172.18.0.0/16 → 3399。
module.exports = {
  apps: [
    {
      name: 'appinews-slack-actions',
      script: 'scripts/slack-actions-start.sh',
      interpreter: 'bash',
      cwd: __dirname,
      env: { SLACK_ACTIONS_PORT: '3399' },
      out_file: '/root/.pm2/logs/appinews-slack-actions-out.log',
      error_file: '/root/.pm2/logs/appinews-slack-actions-err.log',
    },
  ],
};
