#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const repoRoot = path.resolve(process.cwd());

function run(cmd, cwd = repoRoot) {
  output.write(`\n[exec] ${cmd}\n`);
  execSync(cmd, { stdio: 'inherit', cwd, shell: '/bin/zsh' });
}

async function ensureEnv() {
  const envPath = path.join(repoRoot, '.env');
  try {
    await access(envPath);
    output.write('[init] .env detected\n');
  } catch {
    output.write('[init] .env not found. create one before publishing.\n');
  }
}

async function showGitStatus() {
  run('git status -sb');
}

async function pagesReminder(rl) {
  output.write(`\n[pages] GitHub Pages 手動設定手順\n`);
  output.write(`  1. GitHub リポジトリ → Settings → Pages\n`);
  output.write(`  2. Source: Deploy from branch\n`);
  output.write(`  3. Branch: main / Folder: apps/frontend/preview-ui/dist\n`);
  await rl.question('設定が完了したら Enter を押してください…');
}

async function deployChoice(rl) {
  output.write('\n[bff-deploy] デプロイ先を選んでください。\n');
  output.write('  1) Render\n  2) Railway\n  3) Fly.io\n  4) ローカルのみ (skip)\n');
  const ans = (await rl.question('選択番号を入力 → ')).trim();
  switch (ans) {
    case '1':
      output.write('Render デプロイ：Dashboard でサービスを作成し、GitHub を連携→環境変数を設定してください。\n');
      break;
    case '2':
      output.write('Railway デプロイ：Railway CLI または Dashboard でサービスを作成してください。\n');
      break;
    case '3':
      output.write('Fly.io デプロイ：fly launch → fly deploy を行ってください。\n');
      break;
    default:
      output.write('ローカル保持を選択。後で update-deploy タスクで差し替え可能です。\n');
  }
  await rl.question('デプロイ作業を終えたら Enter…');
}

async function dnsInstructions(rl) {
  output.write('\n[dns] Cloudflare DNS 設定候補\n');
  output.write('  api.izakayaverse.com  → <BFFホスト> (CNAME)\n');
  output.write('  ipn.izakayaverse.com  → api.izakayaverse.com (CNAME)\n');
  output.write('  app.izakayaverse.com  → <Pagesホスト> (CNAME)\n');
  output.write('  llm./cdn./dev.        → TODO コメントで記録のみ\n');
  await rl.question('Cloudflare Dashboard で CNAME を登録したら Enter…');
}

async function paypalInstructions(rl) {
  output.write('\n[paypal] ビジネス設定\n');
  output.write('  • 通知URL: https://ipn.izakayaverse.com/paypal/ipn/notify\n');
  output.write('  • Sandbox でテスト送信し、BFF ログで受信を確認してください。\n');
  await rl.question('PayPal IPN 設定が完了したら Enter…');
}

async function llmKeys(rl) {
  output.write('\n[llm-keys] Secrets 登録\n');
  output.write('  • GitHub Actions → Settings → Secrets and variables\n');
  output.write('    OPENAI_API_KEY / GEMINI_API_KEY / CLOUDFLARE_API_TOKEN などを登録してください。\n');
  await rl.question('登録完了で Enter…');
}

async function verify() {
  output.write('\n[verify] ローカル検証を実行します…\n');
  try {
    const fetch = (await import('node-fetch')).default;
    const base = process.env.VERIFY_BASE ?? 'http://127.0.0.1:4117';
    const userId = 'verify-user-' + Date.now();
    const headers = { 'X-IZK-UID': userId, 'content-type': 'application/json' };
    const health = await fetch(`${base}/health`);
    output.write(`  /health → ${health.status}\n`);
    await fetch(`${base}/wallet/redeem`, { method: 'POST', headers, body: JSON.stringify({ amount_pt: 10, tx_id: 'TX-VERIFY-ABC123', source: 'VERIFY' }) });
    const consumed = await fetch(`${base}/wallet/consume`, { method: 'POST', headers, body: JSON.stringify({ amount_pt: 5, sku: 'VERIFY_SKU', idempotency_key: 'verify-001' }) });
    output.write(`  /wallet/consume → ${consumed.status}\n`);
    const preview = await fetch(`${base}/preview/`);
    output.write(`  /preview → ${preview.status}\n`);
  } catch (err) {
    output.write(`[verify] エラー: ${err?.message ?? err}\n`);
  }
}

async function main() {
  const rl = readline.createInterface({ input, output });
  await ensureEnv();
  await showGitStatus();
  await rl.question('\nGitHub へ push する準備が整ったら Enter…');
  await pagesReminder(rl);
  await deployChoice(rl);
  await dnsInstructions(rl);
  await paypalInstructions(rl);
  await llmKeys(rl);
  await verify();
  output.write('\nREADY TO PUBLIC\n');
  rl.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
