import { chromium } from '@playwright/test';
import { mkdirSync } from 'fs';

const OUT = '/tmp/portfolio-verify';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const errors = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

console.log('→ Navigating to localhost:3000...');
await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

// t=0: immediately after load
await page.screenshot({ path: `${OUT}/01-load-0s.png` });
console.log('✓ Screenshot 1: t=0s (name should be invisible)');

// t=1.5s: name should be fading in (starts at 1.3s)
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/02-load-1.5s.png` });
console.log('✓ Screenshot 2: t=1.5s (name mid-fade)');

// t=3.1s: name fully visible
await page.waitForTimeout(1600);
await page.screenshot({ path: `${OUT}/03-load-3.1s.png` });
console.log('✓ Screenshot 3: t=3.1s (name fully visible)');

// t=5s: typewriter mid-typing
await page.waitForTimeout(1900);
await page.screenshot({ path: `${OUT}/04-load-5s.png` });
console.log('✓ Screenshot 4: t=5s (typewriter typing)');

// t=8s: typewriter complete, cursor fading
await page.waitForTimeout(3000);
await page.screenshot({ path: `${OUT}/05-load-8s.png` });
console.log('✓ Screenshot 5: t=8s (typewriter complete)');

// DOM inspection
const h1 = await page.$('h1');
const h1Text = h1 ? await h1.textContent() : 'NOT FOUND';
const h1Opacity = h1 ? await h1.evaluate(el => window.getComputedStyle(el).opacity) : 'N/A';
const h1Font = h1 ? await h1.evaluate(el => window.getComputedStyle(el).fontFamily) : 'N/A';
const h1Weight = h1 ? await h1.evaluate(el => window.getComputedStyle(el).fontWeight) : 'N/A';
const h1LetterSpacing = h1 ? await h1.evaluate(el => window.getComputedStyle(el).letterSpacing) : 'N/A';
const h1FontSize = h1 ? await h1.evaluate(el => window.getComputedStyle(el).fontSize) : 'N/A';

console.log(`\n=== DOM INSPECTION ===`);
console.log(`h1 text:           "${h1Text}"`);
console.log(`h1 opacity:        ${h1Opacity}  (expected: ~1.0 at t=8s)`);
console.log(`h1 font-family:    ${h1Font}`);
console.log(`h1 font-weight:    ${h1Weight}   (expected: ~250)`);
console.log(`h1 letter-spacing: ${h1LetterSpacing}  (expected: ~0.2em resolved)`);
console.log(`h1 font-size:      ${h1FontSize}`);

// Subtitle
const subtitle = await page.$('p');
const subtitleText = subtitle ? await subtitle.textContent() : 'NOT FOUND';
const subtitleOpacity = subtitle ? await subtitle.evaluate(el => window.getComputedStyle(el).opacity) : 'N/A';
console.log(`\nsubtitle text:     "${subtitleText}"`);
console.log(`subtitle opacity:  ${subtitleOpacity}`);

// Cursor
const cursor = await page.$('span[aria-hidden="true"]');
console.log(`cursor element:    ${cursor ? 'FOUND' : 'NOT FOUND'}`);

// The shared page-wide grain overlay has been intentionally removed.
const pageGrain = await page.evaluate(() => {
  const style = window.getComputedStyle(document.body, '::after');
  return {
    content: style.content,
    backgroundImage: style.backgroundImage,
    animationName: style.animationName,
  };
});
console.log(`\n=== PAGE-WIDE GRAIN ===`);
console.log(`pseudo content:     ${pageGrain.content}  (expected: none)`);
console.log(`background image:   ${pageGrain.backgroundImage}  (expected: none)`);
console.log(`animation:          ${pageGrain.animationName}  (expected: none)`);
if (pageGrain.content !== 'none' || pageGrain.backgroundImage !== 'none' || pageGrain.animationName !== 'none') {
  throw new Error('Page-wide grain overlay is still active');
}

// --motion-ok token
const motionOk = await page.evaluate(() => {
  return getComputedStyle(document.documentElement).getPropertyValue('--motion-ok').trim();
});
console.log(`\n--motion-ok:       "${motionOk}"  (expected: "1")`);

console.log(`\n=== CONSOLE ERRORS (${errors.length}) ===`);
if (errors.length) errors.forEach(e => console.log('  ERROR:', e));
else console.log('  none');

await browser.close();
console.log(`\n✓ Done. Screenshots: ${OUT}/`);
