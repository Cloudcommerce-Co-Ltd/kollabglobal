import { spawn, execSync } from 'child_process';
import { setTimeout } from 'timers/promises';
import { existsSync, writeFileSync } from 'fs';

// ── ANSI helpers ────────────────────────────────────────────────────────────
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  white: '\x1b[97m',
  bgBlue: '\x1b[44m',
};

const tag = (color, label) => `${color}${c.bold} ${label} ${c.reset}`;
const ok = msg => console.log(`${tag(c.green, '✔')} ${msg}`);
const info = msg => console.log(`${tag(c.cyan, '→')} ${msg}`);
const err = msg => console.error(`${tag(c.red, '✖')} ${msg}`);

function divider(char = '─', len = 56) {
  return `${c.dim}${''.padEnd(len, char)}${c.reset}`;
}

function banner() {
  const lines = [
    '',
    `${c.bold}${c.cyan}  KOLLAB Global — Dev Environment${c.reset}`,
    `${c.dim}  Next.js · Worker · Ngrok · Omise Webhooks${c.reset}`,
    '',
  ];
  console.log(divider('─'));
  lines.forEach(l => console.log(l));
  console.log(divider('─'));
  console.log('');
}

// ── Boot ────────────────────────────────────────────────────────────────────
banner();

// ── Database ────────────────────────────────────────────────────────────────
const SEED_MARKER = '.db-seeded';

console.log(divider());
info(`${c.bold}Database${c.reset} — applying pending migrations…`);
console.log('');
try {
  execSync('pnpm exec prisma migrate deploy', { stdio: 'inherit' });
  ok('Migrations up to date');
} catch {
  console.log('');
  err('Migration failed — fix the error above and retry.');
  process.exit(1);
}

if (!existsSync(SEED_MARKER)) {
  console.log('');
  info('First run — seeding database…');
  console.log('');
  try {
    execSync('pnpm exec prisma db seed', { stdio: 'inherit' });
    writeFileSync(SEED_MARKER, new Date().toISOString());
    console.log('');
    ok('Database seeded');
  } catch {
    console.log('');
    err('Seed failed — fix the error above and retry.');
    process.exit(1);
  }
} else {
  ok(`Seed already done ${c.dim}(delete .db-seeded to re-run)${c.reset}`);
}
console.log(divider());
console.log('');

// ── Start processes ──────────────────────────────────────────────────────────
const labelColors = {
  server: c.green,
  worker: c.yellow,
  ngrok:  c.magenta,
};

function run(cmd, args, { label, ...opts } = {}) {
  const proc = spawn(cmd, args, { stdio: 'pipe', shell: true, ...opts });

  const color = labelColors[label] ?? c.dim;
  const prefix = label ? `${color}${c.bold}[${label}]${c.reset} ` : '';

  proc.stdout?.on('data', data => {
    data.toString().split('\n').forEach(line => {
      if (line.trim()) process.stdout.write(prefix + line + '\n');
    });
  });
  proc.stderr?.on('data', data => {
    data.toString().split('\n').forEach(line => {
      if (line.trim()) process.stderr.write(prefix + line + '\n');
    });
  });

  proc.on('error', e => err(`[${cmd}] ${e.message}`));
  return proc;
}

info(`Starting ${c.bold}Next.js${c.reset}         ${c.dim}next dev${c.reset}`);
run('pnpm', ['dev'], { label: 'server' });

info(
  `Starting ${c.bold}Worker${c.reset}           ${c.dim}tsx watch payment-worker${c.reset}`,
);
run('pnpm', ['worker:dev'], { label: 'worker' });

info(
  `Starting ${c.bold}Ngrok${c.reset}            ${c.dim}http 3000${c.reset}`,
);
run('ngrok', ['http', '3000'], { label: 'ngrok' });

console.log('');

// ── Ngrok URL ────────────────────────────────────────────────────────────────
async function getNgrokUrl(retries = 20) {
  for (let i = 0; i < retries; i++) {
    await setTimeout(1000);
    try {
      const res = await fetch('http://localhost:4040/api/tunnels');
      const { tunnels } = await res.json();
      const tunnel = tunnels.find(t => t.proto === 'https');
      if (tunnel) return tunnel.public_url;
    } catch {}
  }
  throw new Error('Ngrok tunnel not found after 20s');
}

try {
  const url = await getNgrokUrl();
  const webhookUrl = `${url}/api/webhooks/omise`;

  console.log(divider('─'));
  console.log('');
  console.log(`  ${c.bold}${c.green}Dev environment ready${c.reset}`);
  console.log('');
  console.log(
    `  ${c.dim}Local   ${c.reset}${c.white}http://localhost:3000${c.reset}`,
  );
  console.log(`  ${c.dim}Ngrok   ${c.reset}${c.cyan}${c.bold}${url}${c.reset}`);
  console.log(
    `  ${c.dim}Webhook ${c.reset}${c.magenta}${c.bold}${webhookUrl}${c.reset} ${c.dim}<- add this in https://dashboard.omise.co/v2/settings/webhooks${c.reset}`,
  );
  console.log('');
  console.log(divider('─'));
  console.log('');
} catch (e) {
  err(e.message);
}
