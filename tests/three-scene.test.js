import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

describe('Three.js Integration Tests', () => {
  it('index.html에 Three.js 씬 초기화 및 4개 조각 메쉬 생성 로직이 온전히 포함되어야 한다', () => {
    const html = fs.readFileSync('index.html', 'utf-8');
    assert.ok(html.includes('THREE.WebGLRenderer'), 'Renderer code missing');
    assert.ok(html.includes('THREE.OrbitControls'), 'OrbitControls code missing');
    assert.ok(html.includes('createGoreMeshes'), 'createGoreMeshes function missing');
    assert.ok(html.includes('createTargetDisks'), 'createTargetDisks function missing');
    assert.ok(html.includes('createWireframeSphere'), 'createWireframeSphere function missing');
    assert.ok(html.includes('updateMorphingGeometry'), 'updateMorphingGeometry function missing');
    assert.ok(html.includes('resetCameraView'), 'resetCameraView function missing');
  });

  it('4개 조각의 고유 색상(코랄, 앰버, 에메랄드, 블루)이 메쉬 머티리얼에 정의되어야 한다', () => {
    const html = fs.readFileSync('index.html', 'utf-8');
    assert.ok(html.includes('0xff6b6b') || html.includes('#ff6b6b') || html.includes('0xFF6B6B'), 'Coral color missing');
    assert.ok(html.includes('0xffa94d') || html.includes('#ffa94d') || html.includes('0xFFA94D'), 'Amber color missing');
    assert.ok(html.includes('0x51cf66') || html.includes('#51cf66') || html.includes('0x51CF66'), 'Emerald color missing');
    assert.ok(html.includes('0x339af0') || html.includes('#339af0') || html.includes('0x339AF0'), 'Blue color missing');
  });

  it('메쉬 렌더링에 DoubleSide, computeVertexNormals 및 조명 설정이 포함되어야 한다', () => {
    const html = fs.readFileSync('index.html', 'utf-8');
    assert.ok(html.includes('THREE.DoubleSide'), 'DoubleSide material missing');
    assert.ok(html.includes('computeVertexNormals'), 'computeVertexNormals missing');
    assert.ok(html.includes('THREE.AmbientLight'), 'AmbientLight missing');
    assert.ok(html.includes('THREE.DirectionalLight'), 'DirectionalLight missing');
    assert.ok(html.includes('THREE.BufferGeometry'), 'BufferGeometry missing');
  });

  it('바닥 원판 4개에 대응하는 라벨 스프라이트가 정의되어야 한다', () => {
    const html = fs.readFileSync('index.html', 'utf-8');
    assert.ok(html.includes('원 1: πr²'), 'Label 1 missing');
    assert.ok(html.includes('원 2: πr²'), 'Label 2 missing');
    assert.ok(html.includes('원 3: πr²'), 'Label 3 missing');
    assert.ok(html.includes('원 4: πr²'), 'Label 4 missing');
  });
});
