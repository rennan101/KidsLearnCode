// ShorelineFoamRenderer.js - Cleaned up to avoid rendering any lines, dots, or rectangles on water and magma borders.

export class ShorelineFoamRenderer {
  constructor() {
    this.foamColor = 'transparent';
  }

  isLandTile() {
    return false;
  }

  renderShorelines() {
    // Disabled per user request (clean borderless water & magma look)
  }

  drawWaveLapBand() {
    // Disabled
  }
}
