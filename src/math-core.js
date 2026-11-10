export function computeCircleArea(r) {
  return Math.PI * r * r;
}

export function computeSphereArea(r) {
  return 4 * Math.PI * r * r;
}

export function getDiskCenter(index, r) {
  const spacing = 1.45 * r;
  const targetY = -1.8 * r;
  const idx = ((index % 4) + 4) % 4;
  const signs = [
    { x:  1, z:  1 }, // Quad 0: [0, pi/2] -> x > 0, z > 0
    { x: -1, z:  1 }, // Quad 1: [pi/2, pi] -> x < 0, z > 0
    { x: -1, z: -1 }, // Quad 2: [pi, 3pi/2] -> x < 0, z < 0
    { x:  1, z: -1 }  // Quad 3: [3pi/2, 2pi] -> x > 0, z < 0
  ];
  return {
    x: signs[idx].x * spacing,
    y: targetY,
    z: signs[idx].z * spacing
  };
}

export function getQuadrantGoreVertex(u, v, t, r, quadIndex) {
  const clampedT = Math.min(1.0, Math.max(0.0, t));
  const normalizedQuad = ((quadIndex % 4) + 4) % 4;

  const phi = u * Math.PI;
  const thetaStart = normalizedQuad * (Math.PI / 2);
  const theta = thetaStart + v * (Math.PI / 2);

  const sx = r * Math.sin(phi) * Math.cos(theta);
  const sy = r * Math.cos(phi);
  const sz = r * Math.sin(phi) * Math.sin(theta);

  const midTheta = thetaStart + Math.PI / 4;
  const midPhi = Math.PI / 2;
  const dirX = Math.sin(midPhi) * Math.cos(midTheta);
  const dirY = 0;
  const dirZ = Math.sin(midPhi) * Math.sin(midTheta);

  const center = getDiskCenter(normalizedQuad, r);
  const diskAngle = v * 2 * Math.PI;
  const diskRadius = r * Math.sin(u * Math.PI * 0.5);
  const dx = center.x + diskRadius * Math.cos(diskAngle);
  const dy = center.y;
  const dz = center.z + diskRadius * Math.sin(diskAngle);

  if (clampedT <= 0.2) {
    return { x: sx, y: sy, z: sz };
  } else if (clampedT <= 0.45) {
    const tau = (clampedT - 0.2) / 0.25;
    const separation = 0.5 * r * tau;
    return {
      x: sx + dirX * separation,
      y: sy + dirY * separation,
      z: sz + dirZ * separation
    };
  } else if (clampedT <= 0.75) {
    const tau = (clampedT - 0.45) / 0.3;
    const easeTau = tau * tau * (3 - 2 * tau);

    const hoverY = center.y + 0.5 * r;
    const curCenterX = (1 - easeTau) * (dirX * 0.5 * r) + easeTau * center.x;
    const curCenterY = (1 - easeTau) * 0 + easeTau * hoverY;
    const curCenterZ = (1 - easeTau) * (dirZ * 0.5 * r) + easeTau * center.z;

    const relX = (1 - easeTau) * (sx) + easeTau * (dx - center.x);
    const relY = (1 - easeTau) * (sy) + easeTau * 0;
    const relZ = (1 - easeTau) * (sz) + easeTau * (dz - center.z);

    return {
      x: curCenterX + relX,
      y: curCenterY + relY,
      z: curCenterZ + relZ
    };
  } else {
    const tau = (clampedT - 0.75) / 0.25;
    const easeTau = tau * tau * (3 - 2 * tau);
    const hoverY = center.y + 0.5 * r;

    const p3x = dx;
    const p3y = hoverY;
    const p3z = dz;

    return {
      x: p3x,
      y: (1 - easeTau) * p3y + easeTau * dy,
      z: p3z
    };
  }
}
