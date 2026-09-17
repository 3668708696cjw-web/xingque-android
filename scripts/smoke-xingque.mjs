import { chromium } from 'playwright';

const base = 'http://127.0.0.1:8080';
const routes = [
  '/', '/catalog', '/natal', '/bazi', '/ziwei', '/qimen', '/liuren', '/liuyao',
  '/taiyi', '/sanshi', '/fengshui', '/tarot', '/geomancy', '/jinkou', '/taixuan',
  '/qizheng', '/vedic', '/synastry', '/transits', '/parts', '/shushu',
  '/almanac', '/sky', '/reference', '/celebs', '/history',
  '/history/simaqian', '/history/c-tianguan', '/me', '/about',
];

const browser = await chromium.launch({
  executablePath: process.env.AGENT_BROWSER_EXECUTABLE_PATH || undefined,
  args: ['--no-sandbox', '--disable-gpu'],
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const fails = [];
const timings = [];
page.on('pageerror', (e) => fails.push('pageerror ' + page.url() + ' ' + e.message));
page.on('console', (msg) => {
  if (msg.type() === 'error') fails.push('console ' + page.url() + ' ' + msg.text());
});

for (const r of routes) {
  const t0 = Date.now();
  const res = await page.goto(base + r, { waitUntil: 'networkidle', timeout: 25000 });
  await page.waitForTimeout(250);
  const status = res?.status() ?? 0;
  const body = (await page.locator('body').innerText().catch(() => '')).slice(0, 80).replace(/\s+/g, ' ');
  const ms = Date.now() - t0;
  timings.push({ r, ms, status, body });
  if (status >= 400) fails.push('http ' + r + ' ' + status);
  if (!body.trim()) fails.push('empty ' + r);
}

// click 文献 tab
await page.goto(base + '/history', { waitUntil: 'networkidle' });
const tab = page.getByRole('button', { name: '词条百科', exact: true });
if (await tab.count()) {
  await tab.click();
  await page.waitForTimeout(200);
  const t = await page.innerText('body');
  if (!t.includes('词条') && !t.includes('百科') && !t.includes('天官')) {
    fails.push('history 词条百科 tab missing');
  } else {
    console.log('词条百科 tab ok, snippet:', t.slice(0, 120).replace(/\s+/g, ' '));
  }
} else {
  fails.push('no 词条百科 button');
}

// natal compute visible
await page.goto(base + '/natal', { waitUntil: 'networkidle' });
await page.waitForTimeout(400);
const natal = await page.innerText('body');
if (!natal.includes('ASC') && !natal.includes('太阳') && !natal.includes('占星')) {
  fails.push('natal missing chart');
}

await browser.close();
console.log('--- timings ---');
for (const t of timings) console.log(`${t.ms.toString().padStart(5)}ms  ${t.status}  ${t.r}  | ${t.body}`);
const slow = timings.filter((t) => t.ms > 2500);
console.log('slow>', slow.map((s) => s.r + ' ' + s.ms).join(', ') || 'none');
console.log('fails', fails.length);
for (const f of fails) console.log('FAIL', f);
process.exit(fails.length ? 1 : 0);
