import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

describe('UI Structure Tests', () => {
  it('index.html 파일에 3D 캔버스, 해설 패널, 컨트롤 슬라이더 및 필수 ID가 존재해야 한다', () => {
    const html = fs.readFileSync('index.html', 'utf-8');
    assert.ok(html.includes('id="canvas-container"'), 'canvas container missing');
    assert.ok(html.includes('id="timeline-slider"'), 'timeline slider missing');
    assert.ok(html.includes('id="radius-slider"'), 'radius slider missing');
    assert.ok(html.includes('id="play-btn"'), 'play button missing');
    assert.ok(html.includes('id="step-text"'), 'step text missing');
    assert.ok(html.includes('id="formula-calc"'), 'formula calc missing');
    assert.ok(html.includes('id="math-panel"'), 'math panel missing');
    assert.ok(html.includes('4\\pi r^2') || html.includes('4\\pi r^{2}') || html.includes('4πr²'), 'formula representation missing');
    assert.ok(html.includes('id="step-1-btn"'), 'step 1 button missing');
    assert.ok(html.includes('id="step-2-btn"'), 'step 2 button missing');
    assert.ok(html.includes('id="step-3-btn"'), 'step 3 button missing');
    assert.ok(html.includes('id="step-4-btn"'), 'step 4 button missing');
  });

  it('추가 UI 컨트롤 요소(뷰 초기화, 도움말 모달, 반지름 표시 라벨)가 포함되어야 한다', () => {
    const html = fs.readFileSync('index.html', 'utf-8');
    assert.ok(html.includes('id="reset-view-btn"'), 'reset view button missing');
    assert.ok(html.includes('id="help-btn"'), 'help button missing');
    assert.ok(html.includes('id="help-modal"'), 'help modal missing');
    assert.ok(html.includes('id="radius-value"'), 'radius value label missing');
  });
});
