// 2D Camera system supporting infinite smooth player tracking and editor free pan/zoom

export class Camera {
  constructor(viewportWidth = 800, viewportHeight = 600) {
    this.x = 0;
    this.y = 0;
    this.viewportWidth = (typeof viewportWidth === 'number' && viewportWidth > 0) ? viewportWidth : 800;
    this.viewportHeight = (typeof viewportHeight === 'number' && viewportHeight > 0) ? viewportHeight : 600;
    this.zoom = 1.0;
  }

  resize(width, height) {
    if (typeof width === 'number' && width > 0 && isFinite(width)) {
      this.viewportWidth = Math.round(width);
    }
    if (typeof height === 'number' && height > 0 && isFinite(height)) {
      this.viewportHeight = Math.round(height);
    }
  }

  // Smoothly center on target in infinite world coordinates without clamping
  follow(targetCenterX, targetCenterY, smoothFactor = 0.1) {
    const cx = (typeof targetCenterX === 'number' && isFinite(targetCenterX)) ? targetCenterX : 0;
    const cy = (typeof targetCenterY === 'number' && isFinite(targetCenterY)) ? targetCenterY : 0;
    const z = Math.max(0.1, (typeof this.zoom === 'number' && isFinite(this.zoom)) ? this.zoom : 1.0);
    const vw = Math.max(100, (typeof this.viewportWidth === 'number' && isFinite(this.viewportWidth)) ? this.viewportWidth : 800);
    const vh = Math.max(100, (typeof this.viewportHeight === 'number' && isFinite(this.viewportHeight)) ? this.viewportHeight : 600);

    const desiredX = cx - (vw / z) / 2;
    const desiredY = cy - (vh / z) / 2;

    if (isNaN(this.x) || !isFinite(this.x)) this.x = desiredX;
    if (isNaN(this.y) || !isFinite(this.y)) this.y = desiredY;

    this.x += (desiredX - this.x) * smoothFactor;
    this.y += (desiredY - this.y) * smoothFactor;
  }

  screenToWorld(screenX, screenY) {
    const z = Math.max(0.1, (typeof this.zoom === 'number' && isFinite(this.zoom)) ? this.zoom : 1.0);
    const cx = (typeof this.x === 'number' && isFinite(this.x)) ? this.x : 0;
    const cy = (typeof this.y === 'number' && isFinite(this.y)) ? this.y : 0;
    return {
      x: cx + screenX / z,
      y: cy + screenY / z
    };
  }

  worldToScreen(worldX, worldY) {
    const z = Math.max(0.1, (typeof this.zoom === 'number' && isFinite(this.zoom)) ? this.zoom : 1.0);
    const cx = (typeof this.x === 'number' && isFinite(this.x)) ? this.x : 0;
    const cy = (typeof this.y === 'number' && isFinite(this.y)) ? this.y : 0;
    return {
      x: (worldX - cx) * z,
      y: (worldY - cy) * z
    };
  }
}

export default Camera;
