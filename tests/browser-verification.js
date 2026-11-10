import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Ensure screenshots directory exists
const screenshotsDir = path.join(projectRoot, 'docs', 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function runBrowserVerification() {
  console.log('🚀 Starting Browser Verification & E2E Testing...');

  let browser;
  try {
    try {
      browser = await chromium.launch({
        headless: true,
        args: ['--use-gl=angle', '--use-angle=swiftshader']
      });
    } catch (err) {
      console.log('Standard chromium launch failed, falling back to msedge channel...');
      browser = await chromium.launch({
        channel: 'msedge',
        headless: true,
        args: ['--use-gl=angle', '--use-angle=swiftshader']
      });
    }

    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 1
    });

    const page = await context.newPage();

    const consoleErrors = [];
    const pageErrors = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', err => {
      pageErrors.push(err.message);
    });

    // Cross-platform file URL using pathToFileURL
    const fileUrl = pathToFileURL(path.resolve(projectRoot, 'index.html')).href;
    console.log(`📍 Loading: ${fileUrl}`);

    await page.goto(fileUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // 1. Verify zero JS console errors & page errors on load
    console.log('🔍 Checking for initial JS runtime errors...');
    if (consoleErrors.length > 0) {
      throw new Error(`Console errors detected on load: ${JSON.stringify(consoleErrors)}`);
    }
    if (pageErrors.length > 0) {
      throw new Error(`Page errors detected on load: ${JSON.stringify(pageErrors)}`);
    }
    console.log('✅ 1. Loaded index.html with 0 errors.');

    // 2. Verify 3D canvas is mounted and WebGL renderer is initialized
    console.log('🔍 Verifying 3D canvas & WebGL renderer...');
    const canvasLocator = page.locator('#canvas-container canvas');
    const canvasCount = await canvasLocator.count();
    if (canvasCount !== 1) {
      throw new Error(`Expected exactly 1 canvas element, found ${canvasCount}`);
    }

    const canvasBox = await canvasLocator.boundingBox();
    if (!canvasBox || canvasBox.width <= 0 || canvasBox.height <= 0) {
      throw new Error('Canvas bounding box is invalid or has 0 dimensions.');
    }

    const hasAppState = await page.evaluate(() => typeof window.appState === 'object' && window.appState !== null);
    if (!hasAppState) {
      throw new Error('window.appState is not defined.');
    }
    console.log(`✅ 2. 3D canvas mounted (${Math.round(canvasBox.width)}x${Math.round(canvasBox.height)}) and WebGL initialized.`);

    // 3. Verifies initial KaTeX formula values (r = 5.0 cm, pi r^2 approx 78.54, S approx 314.16)
    console.log('🔍 Verifying initial KaTeX formula values (r = 5.0 cm)...');
    const initialRadiusText = await page.locator('#calc-radius').innerText();
    const initialCircleText = await page.locator('#calc-circle').innerText();
    const initialSphereText = await page.locator('#calc-sphere').innerText();
    const initialStageBadge = await page.locator('#stage-badge').innerText();
    const initialStepTitle = await page.locator('#step-title').innerText();

    console.log(`   - calc-radius: ${initialRadiusText}`);
    console.log(`   - calc-circle: ${initialCircleText}`);
    console.log(`   - calc-sphere: ${initialSphereText}`);

    if (!initialRadiusText.includes('5.0')) {
      throw new Error(`calc-radius does not contain "5.0", got: ${initialRadiusText}`);
    }
    if (!initialCircleText.includes('78.54')) {
      throw new Error(`calc-circle does not contain "78.54", got: ${initialCircleText}`);
    }
    if (!initialSphereText.includes('314.16')) {
      throw new Error(`calc-sphere does not contain "314.16", got: ${initialSphereText}`);
    }
    if (!initialStageBadge.includes('1단계')) {
      throw new Error(`stage-badge does not contain "1단계", got: ${initialStageBadge}`);
    }
    if (!initialStepTitle.includes('온전한 구')) {
      throw new Error(`step-title does not contain "온전한 구", got: ${initialStepTitle}`);
    }
    console.log('✅ 3. Initial KaTeX formulas verified (r=5.0, circle=78.54, sphere=314.16).');

    // Capture Stage 1 screenshot
    const stage1Path = path.join(screenshotsDir, 'stage-1-whole-sphere.png');
    await page.screenshot({ path: stage1Path });
    console.log(`📸 Saved screenshot: ${stage1Path}`);

    // 4. Simulates changing radius to 8.0 cm and verifies formulas update (pi r^2 approx 201.06, S approx 804.25)
    console.log('🔍 Simulates changing radius to 8.0 cm...');
    await page.evaluate(() => {
      window.setRadius(8.0);
    });
    await page.waitForTimeout(300);

    const updatedRadiusLabel = await page.locator('#radius-value').innerText();
    const updatedRadiusText = await page.locator('#calc-radius').innerText();
    const updatedCircleText = await page.locator('#calc-circle').innerText();
    const updatedSphereText = await page.locator('#calc-sphere').innerText();

    console.log(`   - radius-value: ${updatedRadiusLabel}`);
    console.log(`   - calc-radius: ${updatedRadiusText}`);
    console.log(`   - calc-circle: ${updatedCircleText}`);
    console.log(`   - calc-sphere: ${updatedSphereText}`);

    if (!updatedRadiusLabel.includes('8.0')) {
      throw new Error(`radius-value does not contain "8.0", got: ${updatedRadiusLabel}`);
    }
    if (!updatedRadiusText.includes('8.0')) {
      throw new Error(`calc-radius does not contain "8.0", got: ${updatedRadiusText}`);
    }
    if (!updatedCircleText.includes('201.06')) {
      throw new Error(`calc-circle does not contain "201.06", got: ${updatedCircleText}`);
    }
    if (!updatedSphereText.includes('804.25')) {
      throw new Error(`calc-sphere does not contain "804.25", got: ${updatedSphereText}`);
    }
    console.log('✅ 4. Radius update simulation verified (r=8.0, circle=201.06, sphere=804.25).');

    // Reset radius to 5.0 for consistent stage demonstration screenshots
    await page.evaluate(() => {
      window.setRadius(5.0);
    });
    await page.waitForTimeout(200);

    // 5. Simulates timeline progress (t=0.35, 0.65, 1.0) and verifies step title and celebration state
    // Stage 2 (t = 0.35)
    console.log('🔍 Simulating Stage 2 (t = 0.35: 4조각 분리)...');
    await page.click('#step-2-btn');
    await page.waitForTimeout(400);

    const stage2Badge = await page.locator('#stage-badge').innerText();
    const stage2Title = await page.locator('#step-title').innerText();
    const stage2Progress = await page.locator('#timeline-percent').innerText();
    console.log(`   - Stage 2: ${stage2Badge} | ${stage2Title} | ${stage2Progress}`);

    if (!stage2Badge.includes('2단계')) {
      throw new Error(`Stage 2 badge mismatch: ${stage2Badge}`);
    }
    if (!stage2Title.includes('분리')) {
      throw new Error(`Stage 2 title mismatch: ${stage2Title}`);
    }
    if (!stage2Progress.includes('35%')) {
      throw new Error(`Stage 2 progress mismatch: ${stage2Progress}`);
    }

    const stage2Path = path.join(screenshotsDir, 'stage-2-quadrant-split.png');
    await page.screenshot({ path: stage2Path });
    console.log(`📸 Saved screenshot: ${stage2Path}`);

    // Stage 3 (t = 0.65)
    console.log('🔍 Simulating Stage 3 (t = 0.65: 바닥 원 상공 비행)...');
    await page.click('#step-3-btn');
    await page.waitForTimeout(400);

    const stage3Badge = await page.locator('#stage-badge').innerText();
    const stage3Title = await page.locator('#step-title').innerText();
    const stage3Progress = await page.locator('#timeline-percent').innerText();
    console.log(`   - Stage 3: ${stage3Badge} | ${stage3Title} | ${stage3Progress}`);

    if (!stage3Badge.includes('3단계')) {
      throw new Error(`Stage 3 badge mismatch: ${stage3Badge}`);
    }
    if (!stage3Title.includes('비행')) {
      throw new Error(`Stage 3 title mismatch: ${stage3Title}`);
    }
    if (!stage3Progress.includes('65%')) {
      throw new Error(`Stage 3 progress mismatch: ${stage3Progress}`);
    }

    const stage3Path = path.join(screenshotsDir, 'stage-3-flight-to-disks.png');
    await page.screenshot({ path: stage3Path });
    console.log(`📸 Saved screenshot: ${stage3Path}`);

    // Stage 4 (t = 1.0)
    console.log('🔍 Simulating Stage 4 (t = 1.0: 평면화 및 원 4개 채우기 완성)...');
    await page.click('#step-4-btn');
    await page.waitForTimeout(400);

    const stage4Badge = await page.locator('#stage-badge').innerText();
    const stage4Title = await page.locator('#step-title').innerText();
    const stage4Progress = await page.locator('#timeline-percent').innerText();
    console.log(`   - Stage 4: ${stage4Badge} | ${stage4Title} | ${stage4Progress}`);

    if (!stage4Badge.includes('4단계')) {
      throw new Error(`Stage 4 badge mismatch: ${stage4Badge}`);
    }
    if (!stage4Title.includes('원 4개') && !stage4Title.includes('채우기')) {
      throw new Error(`Stage 4 title mismatch: ${stage4Title}`);
    }
    if (!stage4Progress.includes('100%')) {
      throw new Error(`Stage 4 progress mismatch: ${stage4Progress}`);
    }

    // Check celebration effect
    const celebrationActive = await page.evaluate(() => {
      const calcBox = document.getElementById('formula-calc');
      return calcBox && (calcBox.classList.contains('ring-4') || calcBox.classList.contains('ring-emerald-400'));
    });
    console.log(`   - Celebration state triggered: ${celebrationActive}`);
    if (!celebrationActive) {
      throw new Error('Celebration ring-4 / ring-emerald-400 not active on formula-calc at t=1.0');
    }

    const stage4Path = path.join(screenshotsDir, 'stage-4-four-disks-covered.png');
    await page.screenshot({ path: stage4Path });
    console.log(`📸 Saved screenshot: ${stage4Path}`);
    console.log('✅ 5. Stages 2, 3, 4 progress, step titles and celebration state verified.');

    // 6. Test Help Modal & Shortcuts
    console.log('🔍 Verifying Help Guide modal open/close & shortcuts...');
    await page.click('#help-btn');
    await page.waitForTimeout(300);
    const modalVisible = await page.locator('#help-modal').isVisible();
    if (!modalVisible) {
      throw new Error('Help modal failed to open.');
    }

    // Close modal via Escape key
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    const modalHidden = !(await page.locator('#help-modal').isVisible());
    if (!modalHidden) {
      throw new Error('Help modal failed to close on Escape key.');
    }
    console.log('✅ 6. Help modal open and Escape hotkey verified.');

    // 7. Verify Play/Pause Toggle & Speed Controls
    console.log('🔍 Verifying Playback & Speed controls...');
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);
    let isPlaying = await page.evaluate(() => window.appState.isPlaying);
    if (!isPlaying) {
      throw new Error('Play button / Spacebar toggle did not start playback.');
    }
    await page.keyboard.press('Space');
    await page.waitForTimeout(200);
    isPlaying = await page.evaluate(() => window.appState.isPlaying);
    if (isPlaying) {
      throw new Error('Play button / Spacebar toggle did not pause playback.');
    }

    await page.click('[data-speed="2.0"]');
    const currentSpeed = await page.evaluate(() => window.appState.speed);
    if (currentSpeed !== 2.0) {
      throw new Error(`Speed button failed to set speed to 2.0, got: ${currentSpeed}`);
    }
    console.log('✅ 7. Playback toggle and speed controls verified.');

    // 8. Lifecycle-wide error verification (all interactions completed)
    console.log('🔍 Checking for any errors throughout the entire lifecycle...');
    if (consoleErrors.length > 0) {
      throw new Error(`Console errors detected during lifecycle: ${JSON.stringify(consoleErrors)}`);
    }
    if (pageErrors.length > 0) {
      throw new Error(`Page errors detected during lifecycle: ${JSON.stringify(pageErrors)}`);
    }
    console.log('✅ 8. Zero errors detected across full lifecycle.');

    console.log('🎉 ALL BROWSER E2E VERIFICATION CHECKS PASSED SUCCESSFULLY!');
    return {
      success: true,
      screenshots: [stage1Path, stage2Path, stage3Path, stage4Path],
      fileUrl
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Execute if run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runBrowserVerification()
    .then(result => {
      console.log('\n=============================================');
      console.log('✅ E2E Verification Complete!');
      console.log(`Local HVC Link: ${result.fileUrl}`);
      console.log('Screenshots generated:');
      result.screenshots.forEach(s => console.log(` - ${s}`));
      console.log('=============================================\n');
      process.exit(0);
    })
    .catch(err => {
      console.error('\n❌ E2E Verification Failed:', err);
      process.exit(1);
    });
}

export { runBrowserVerification };
