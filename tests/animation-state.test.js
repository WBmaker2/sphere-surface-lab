import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import { determineStepIndex, clampProgress, calculatePlaybackDelta } from '../src/animation-logic.js';

describe('Animation and State Logic Tests', () => {
  it('determineStepIndex가 모든 경계 조건에서 정확한 단계 인덱스를 반환해야 한다', () => {
    // Stage 1 (Sphere): [0.0, 0.25)
    assert.strictEqual(determineStepIndex(0.0), 0);
    assert.strictEqual(determineStepIndex(0.1), 0);
    assert.strictEqual(determineStepIndex(0.249), 0);

    // Stage 2 (Separation): [0.25, 0.55)
    assert.strictEqual(determineStepIndex(0.25), 1);
    assert.strictEqual(determineStepIndex(0.35), 1);
    assert.strictEqual(determineStepIndex(0.549), 1);

    // Stage 3 (Flight): [0.55, 0.85)
    assert.strictEqual(determineStepIndex(0.55), 2);
    assert.strictEqual(determineStepIndex(0.65), 2);
    assert.strictEqual(determineStepIndex(0.849), 2);

    // Stage 4 (Floor filling): [0.85, 1.0]
    assert.strictEqual(determineStepIndex(0.85), 3);
    assert.strictEqual(determineStepIndex(0.95), 3);
    assert.strictEqual(determineStepIndex(1.0), 3);
  });

  it('clampProgress가 음수 및 1.0 초과 값을 안전하게 [0.0, 1.0] 범위로 클램핑해야 한다', () => {
    assert.strictEqual(clampProgress(-0.5), 0.0);
    assert.strictEqual(clampProgress(-0.001), 0.0);
    assert.strictEqual(clampProgress(0.0), 0.0);
    assert.strictEqual(clampProgress(0.42), 0.42);
    assert.strictEqual(clampProgress(1.0), 1.0);
    assert.strictEqual(clampProgress(1.001), 1.0);
    assert.strictEqual(clampProgress(2.5), 1.0);
    assert.strictEqual(clampProgress(NaN), 0.0);
  });

  it('calculatePlaybackDelta가 재생 속도(0.5x, 1x, 2x)에 비례하고 프레임 지연 스파이크를 클램핑해야 한다', () => {
    const last = 1000;
    const current = 1016.67; // approx 16.67ms (60fps)

    const delta1x = calculatePlaybackDelta(current, last, 1.0);
    const delta05x = calculatePlaybackDelta(current, last, 0.5);
    const delta2x = calculatePlaybackDelta(current, last, 2.0);

    assert.ok(Math.abs(delta05x - delta1x * 0.5) < 1e-6, '0.5x speed should be half of 1x');
    assert.ok(Math.abs(delta2x - delta1x * 2.0) < 1e-6, '2x speed should be double of 1x');

    // Spike test: 500ms lag between frames -> should clamp to 0.1s
    const lagCurrent = 1500;
    const deltaLag = calculatePlaybackDelta(lagCurrent, last, 1.0);
    const maxExpectedDelta = (0.1 / 6.0) * 1.0;
    assert.ok(Math.abs(deltaLag - maxExpectedDelta) < 1e-6, 'Lag spike must be clamped to 0.1s max');
  });

  it('index.html에 애니메이션 루프 및 실시간 상태 동기화 함수가 포함되어야 한다', () => {
    const html = fs.readFileSync('index.html', 'utf-8');
    assert.ok(html.includes('requestAnimationFrame'), 'requestAnimationFrame missing');
    assert.ok(html.includes('setTimelineProgress'), 'setTimelineProgress missing');
    assert.ok(html.includes('setRadius'), 'setRadius missing');
    assert.ok(html.includes('playChime'), 'playChime missing');
    assert.ok(html.includes('AudioContext') || html.includes('webkitAudioContext'), 'AudioContext missing');
  });

  it('Web Audio 노드 해제, 시작시간 정밀 스케줄링 및 게인 안전 처리가 구현되어야 한다', () => {
    const html = fs.readFileSync('index.html', 'utf-8');
    assert.ok(html.includes('osc.onended'), 'osc.onended disconnect logic missing');
    assert.ok(html.includes('startTime'), 'startTime scheduling parameter missing');
    assert.ok(html.includes('safeGain') || html.includes('Math.max(0.0001'), 'safeGain protection missing');
    assert.ok(html.includes('ctx.currentTime') && html.includes('playTone'), 'hardware clock scheduling missing');
  });

  it('WAI-ARIA 접근성 속성 및 RAF 중복 방지 가드가 포함되어야 한다', () => {
    const html = fs.readFileSync('index.html', 'utf-8');
    assert.ok(html.includes('aria-label="애니메이션 재생/일시정지"'), 'play-btn aria-label missing');
    assert.ok(html.includes('aria-pressed'), 'play-btn aria-pressed missing');
    assert.ok(html.includes('aria-label="모핑 타임라인 진행률"'), 'timeline-slider aria-label missing');
    assert.ok(html.includes('aria-valuemin="0"'), 'timeline-slider aria-valuemin missing');
    assert.ok(html.includes('aria-valuemax="100"'), 'timeline-slider aria-valuemax missing');
    assert.ok(html.includes('aria-valuenow'), 'timeline-slider aria-valuenow missing');
    assert.ok(html.includes('role="dialog"'), 'help-modal role="dialog" missing');
    assert.ok(html.includes('aria-modal="true"'), 'help-modal aria-modal missing');
    assert.ok(html.includes('aria-labelledby="help-modal-title"'), 'help-modal aria-labelledby missing');
    assert.ok(html.includes('cancelAnimationFrame'), 'cancelAnimationFrame RAF guard missing');
  });

  it('100% 원 채우기 완료 시 시각적 하이라이트 및 축하 사운드 트리거가 연결되어야 한다', () => {
    const html = fs.readFileSync('index.html', 'utf-8');
    assert.ok(html.includes('playChime'), 'Chime trigger missing');
    assert.ok(html.includes('createRadiusArrow'), 'Radius arrow helper missing');
    assert.ok(html.includes('disposeHierarchy') || html.includes('disposeMaterial'), 'Resource cleanup logic missing');
  });
});
