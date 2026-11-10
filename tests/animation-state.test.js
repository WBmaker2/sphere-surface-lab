import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

describe('Animation and State Logic Tests', () => {
  it('index.html에 애니메이션 루프 및 실시간 상태 동기화 함수가 포함되어야 한다', () => {
    const html = fs.readFileSync('index.html', 'utf-8');
    assert.ok(html.includes('requestAnimationFrame'), 'requestAnimationFrame missing');
    assert.ok(html.includes('setTimelineProgress'), 'setTimelineProgress missing');
    assert.ok(html.includes('setRadius'), 'setRadius missing');
    assert.ok(html.includes('playChime'), 'playChime missing');
    assert.ok(html.includes('AudioContext') || html.includes('webkitAudioContext'), 'AudioContext missing');
  });

  it('100% 원 채우기 완료 시 시각적 하이라이트 및 축하 사운드 트리거가 연결되어야 한다', () => {
    const html = fs.readFileSync('index.html', 'utf-8');
    assert.ok(html.includes('playChime'), 'Chime trigger missing');
    assert.ok(html.includes('createRadiusArrow'), 'Radius arrow helper missing');
    assert.ok(html.includes('disposeHierarchy') || html.includes('disposeMaterial'), 'Resource cleanup logic missing');
  });

  it('Web Audio 신디사이저 함수(playTone, playTick, playChime) 및 지연 초기화가 존재해야 한다', () => {
    const html = fs.readFileSync('index.html', 'utf-8');
    assert.ok(html.includes('function playTone') || html.includes('const playTone'), 'playTone missing');
    assert.ok(html.includes('function playTick') || html.includes('const playTick'), 'playTick missing');
    assert.ok(html.includes('function playChime') || html.includes('const playChime'), 'playChime missing');
  });

  it('반지름 r 화살표 헬퍼 및 3D 라벨 표시 및 갱신 함수가 구현되어야 한다', () => {
    const html = fs.readFileSync('index.html', 'utf-8');
    assert.ok(html.includes('createRadiusArrow'), 'createRadiusArrow missing');
    assert.ok(html.includes('updateRadiusArrow'), 'updateRadiusArrow missing');
    assert.ok(html.includes('THREE.ArrowHelper'), 'THREE.ArrowHelper missing');
  });

  it('WebGL 리소스 해제 헬퍼(disposeHierarchy) 및 캔버스 접근성 속성이 포함되어야 한다', () => {
    const html = fs.readFileSync('index.html', 'utf-8');
    assert.ok(html.includes('disposeHierarchy'), 'disposeHierarchy missing');
    assert.ok(html.includes('role="img"') || html.includes("setAttribute('role', 'img')") || html.includes('setAttribute("role", "img")'), 'canvas role="img" missing');
    assert.ok(html.includes('aria-label') || html.includes("setAttribute('aria-label'"), 'canvas aria-label missing');
  });
});
