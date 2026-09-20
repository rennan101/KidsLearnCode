// 2D Camera system supporting infinite smooth player tracking and editor free pan/zoom

export class Camera {
  constructor(viewportWidth = 800, viewportHeight = 600) {
    this.x = 0;
    this.y = 0;
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.zoom = 1.0;
  }

  resize(width, height) {
    this.viewportWidth = width;
    this.viewportHeight = height;
  }

  // Smoothly center on target in infinite world coordinates without clamping
  follow(targetCenterX, targetCenterY, smoothFactor = 0.1) {
    const desiredX = targetCenterX - (this.viewportWidth / this.zoom) / 2;
    const desiredY = targetCenterY - (this.viewportHeight / this.zoom) / 2;

    this.x += (desiredX - this.x) * smoothFactor;
    this.y += (desiredY - this.y) * smoothFactor;
  }

  screenToWorld(screenX, screenY) {
    return {
      x: this.x + screenX / this.zoom,
      y: this.y + screenY / this.zoom
    };
  }

  worldToScreen(worldX, worldY) {
    return {
      x: (worldX - this.x) * this.zoom,
      y: (worldY - this.y) * this.zoom
    };
  }
}
