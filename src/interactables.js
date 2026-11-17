// Interactable map objects: each one is bound to a use case id and offers an E prompt within 1 tile.
const RANGE = 1; // tiles

// Returns the objects that point at an unknown use case id (reported once at load).
export function unknownUseCaseIds(map, useCases) {
  const known = new Set(useCases.map((u) => u.id));
  return (map.objects ?? []).filter((o) => !known.has(o.useCaseId));
}

// Keeps only objects with a known use case id and warns about the rest.
export function loadObjects(map, useCases, warn = console.warn) {
  const bad = new Set(unknownUseCaseIds(map, useCases));
  bad.forEach((o) => warn(`Map object "${o.id}" references unknown use case id "${o.useCaseId}"`));
  return (map.objects ?? []).filter((o) => !bad.has(o));
}

// The closest object within 1 tile of the tile under the player's feet (Chebyshev distance), or null.
export function nearestInteractable(map, objects, player) {
  const t = map.tileSize;
  const col = Math.floor(player.x / t);
  const row = Math.floor(player.y / t);
  let best = null;
  let bestDist = Infinity;
  for (const o of objects) {
    const dx = Math.abs(o.x - col);
    const dy = Math.abs(o.y - row);
    const dist = Math.max(dx, dy);
    if (dist <= RANGE && dist < bestDist) {
      best = o;
      bestDist = dist;
    }
  }
  return best;
}

// Placeholder markers; the E prompt is drawn above the object that is in range.
export function drawInteractables(ctx, map, objects, active, camX, camY, colors) {
  const t = map.tileSize;
  for (const o of objects) {
    const px = o.x * t - camX;
    const py = o.y * t - camY;
    ctx.fillStyle = colors.outline;
    ctx.fillRect(px + 2, py + 2, t - 4, t - 4);
    ctx.fillStyle = colors.marker;
    ctx.fillRect(px + 3, py + 3, t - 6, t - 6);
  }
  if (!active) return;
  const px = active.x * t - camX + t / 2;
  const py = active.y * t - camY - 4;
  ctx.fillStyle = colors.outline;
  ctx.fillRect(px - 6, py - 12, 12, 12);
  ctx.fillStyle = colors.marker;
  ctx.fillRect(px - 5, py - 11, 10, 10);
  ctx.fillStyle = colors.outline;
  ctx.font = '12px "Jersey 10", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('E', px, py - 2);
}
