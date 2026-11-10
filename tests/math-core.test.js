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

  it('바닥 4개 원의 중심 좌표가 2x2 그리드로 대칭 배치되어야 한다 (기하학적 4분면 일치)', () => {
    const r = 5;
    const centers = [0, 1, 2, 3].map(i => getDiskCenter(i, r));
    assert.strictEqual(centers.length, 4);
    assert.strictEqual(centers[0].y, -1.8 * r);

    // Quad 0: [0, pi/2] -> x > 0, z > 0
    assert.strictEqual(centers[0].x > 0 && centers[0].z > 0, true);
    // Quad 1: [pi/2, pi] -> x < 0, z > 0
    assert.strictEqual(centers[1].x < 0 && centers[1].z > 0, true);
    // Quad 2: [pi, 3pi/2] -> x < 0, z < 0
    assert.strictEqual(centers[2].x < 0 && centers[2].z < 0, true);
    // Quad 3: [3pi/2, 2pi] -> x > 0, z < 0
    assert.strictEqual(centers[3].x > 0 && centers[3].z < 0, true);

    // 모듈로 인덱스 방어 처리 검증
    const centerMod4 = getDiskCenter(4, r);
    const centerNeg1 = getDiskCenter(-1, r);
    assert.deepStrictEqual(centerMod4, centers[0]);
    assert.deepStrictEqual(centerNeg1, centers[3]);
  });

  it('t = 0일 때 각 조각의 버텍스는 정확히 구면(반지름 r) 위에 위치해야 한다', () => {
    const r = 5;
    const v = getQuadrantGoreVertex(0.5, 0.5, 0.0, r, 0);
    const dist = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    assert.ok(Math.abs(dist - r) < 1e-4, `Expected radius ${r}, got ${dist}`);
  });

  it('t = 0.35일 때 방사형 분리 벡터의 방향과 크기가 정확해야 한다 (Stage 2)', () => {
    const r = 5;
    const v0 = getQuadrantGoreVertex(0.5, 0.5, 0.0, r, 0);
    const vSep = getQuadrantGoreVertex(0.5, 0.5, 0.35, r, 0);

    const diffX = vSep.x - v0.x;
    const diffY = vSep.y - v0.y;
    const diffZ = vSep.z - v0.z;

    const sepMag = Math.sqrt(diffX * diffX + diffY * diffY + diffZ * diffZ);
    // tau = (0.35 - 0.2) / 0.25 = 0.6; separation = 0.5 * r * tau = 0.5 * 5 * 0.6 = 1.5
    assert.ok(Math.abs(sepMag - 1.5) < 1e-4, `Expected separation 1.5, got ${sepMag}`);
    assert.ok(Math.abs(diffY) < 1e-4, `Expected y delta 0, got ${diffY}`);
    assert.ok(diffX > 0 && diffZ > 0, `Expected direction to point into quad 0 (x>0, z>0)`);
  });

  it('t = 0.60일 때 중간 호버링 높이로 이동 및 부분 평면화가 진행되어야 한다 (Stage 3)', () => {
    const r = 5;
    const v = getQuadrantGoreVertex(0.5, 0.5, 0.60, r, 0);
    const groundY = -1.8 * r;

    // t=0.60에서 y는 0과 바닥 높이(groundY) 사이에 안정적으로 위치해야 함
    assert.ok(v.y < 0 && v.y > groundY, `Expected y between 0 and ${groundY}, got ${v.y}`);
    // u = 0.5에서 sy = 0이므로 v.y는 curCenterY = 0.5 * hoverY = 0.5 * (-1.3 * 5) = -3.25
    assert.ok(Math.abs(v.y - (-3.25)) < 1e-4, `Expected y -3.25, got ${v.y}`);
  });

  it('t = 1일 때 각 조각의 버텍스는 해당 바닥 원의 평면(y = -1.8r)에 위치해야 한다', () => {
    const r = 5;
    const v = getQuadrantGoreVertex(0.5, 0.5, 1.0, r, 0);
    const targetY = -1.8 * r;
    assert.ok(Math.abs(v.y - targetY) < 1e-4, `Expected y ${targetY}, got ${v.y}`);
  });

  it('t = 1.0일 때 버텍스는 해당 바닥 원의 반경 r 이내에 위치해야 한다 (반경 경계 검증)', () => {
    const r = 5;
    for (let quad = 0; quad < 4; quad++) {
      const center = getDiskCenter(quad, r);
      for (const u of [0.0, 0.25, 0.5, 0.75, 1.0]) {
        for (const vCoord of [0.0, 0.25, 0.5, 0.75, 1.0]) {
          const vert = getQuadrantGoreVertex(u, vCoord, 1.0, r, quad);
          const dx = vert.x - center.x;
          const dz = vert.z - center.z;
          const distFromCenter = Math.sqrt(dx * dx + dz * dz);
          assert.ok(
            distFromCenter <= r + 1e-4,
            `Expected distance <= ${r}, got ${distFromCenter} at u=${u}, v=${vCoord}, quad=${quad}`
          );
        }
      }
    }
  });

  it('t의 범위 초과(t > 1.0, t < 0.0) 시 안전하게 클램핑되어 바운스 없이 경계값을 유지해야 한다', () => {
    const r = 5;
    const vNormal1 = getQuadrantGoreVertex(0.5, 0.5, 1.0, r, 0);
    const vOver = getQuadrantGoreVertex(0.5, 0.5, 1.05, r, 0);
    assert.strictEqual(vOver.x, vNormal1.x);
    assert.strictEqual(vOver.y, vNormal1.y);
    assert.strictEqual(vOver.z, vNormal1.z);

    const vNormal0 = getQuadrantGoreVertex(0.5, 0.5, 0.0, r, 0);
    const vUnder = getQuadrantGoreVertex(0.5, 0.5, -0.05, r, 0);
    assert.strictEqual(vUnder.x, vNormal0.x);
    assert.strictEqual(vUnder.y, vNormal0.y);
    assert.strictEqual(vUnder.z, vNormal0.z);
  });
});
