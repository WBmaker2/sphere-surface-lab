import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  computeCircleArea,
  computeSphereArea,
  getQuadrantGoreVertex,
  getDiskCenter
} from '../src/math-core.js';

describe('Math Core Tests', () => {
  it('반지름 r에 따른 원과 구의 넓이 공식이 정확해야 한다', () => {
    const r = 5;
    const circleArea = computeCircleArea(r);
    const sphereArea = computeSphereArea(r);
    assert.strictEqual(circleArea, Math.PI * 25);
    assert.strictEqual(sphereArea, 4 * Math.PI * 25);
    assert.strictEqual(sphereArea, 4 * circleArea);
  });

  it('바닥 4개 원의 중심 좌표가 2x2 그리드로 대칭 배치되어야 한다', () => {
    const r = 5;
    const centers = [0, 1, 2, 3].map(i => getDiskCenter(i, r));
    assert.strictEqual(centers.length, 4);
    assert.strictEqual(centers[0].y, -1.8 * r);
    assert.strictEqual(centers[0].x < 0 && centers[0].z < 0, true);
    assert.strictEqual(centers[1].x > 0 && centers[1].z < 0, true);
    assert.strictEqual(centers[2].x < 0 && centers[2].z > 0, true);
    assert.strictEqual(centers[3].x > 0 && centers[3].z > 0, true);
  });

  it('t = 0일 때 각 조각의 버텍스는 정확히 구면(반지름 r) 위에 위치해야 한다', () => {
    const r = 5;
    const v = getQuadrantGoreVertex(0.5, 0.5, 0.0, r, 0);
    const dist = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    assert.ok(Math.abs(dist - r) < 1e-4, `Expected radius ${r}, got ${dist}`);
  });

  it('t = 1일 때 각 조각의 버텍스는 해당 바닥 원의 평면(y = -1.8r)에 위치해야 한다', () => {
    const r = 5;
    const v = getQuadrantGoreVertex(0.5, 0.5, 1.0, r, 0);
    const targetY = -1.8 * r;
    assert.ok(Math.abs(v.y - targetY) < 1e-4, `Expected y ${targetY}, got ${v.y}`);
  });
});
