// Undo and Redo History Manager for TileMap (up to 50 states)

export class UndoRedoManager {
  constructor(tileMap, onStateRestore = () => {}) {
    this.tileMap = tileMap;
    this.onStateRestore = onStateRestore;

    this.maxHistory = 50;
    this.history = [];
    this.currentIndex = -1;

    // Initial baseline state
    this.recordState();
  }

  recordState() {
    const snapshot = JSON.stringify(this.tileMap.toJSON());

    // If current state is identical to last recorded, skip
    if (this.currentIndex >= 0 && this.history[this.currentIndex] === snapshot) {
      return;
    }

    // Truncate redo history if we are in the middle of stack
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    this.history.push(snapshot);

    // Limit to max 50 states
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    } else {
      this.currentIndex++;
    }

    this.updateUI();
  }

  canUndo() {
    return this.currentIndex > 0;
  }

  canRedo() {
    return this.currentIndex < this.history.length - 1;
  }

  undo() {
    if (!this.canUndo()) return false;
    this.currentIndex--;
    const snapshot = JSON.parse(this.history[this.currentIndex]);
    this.tileMap.fromJSON(snapshot);
    this.onStateRestore(snapshot);
    this.updateUI();
    return true;
  }

  redo() {
    if (!this.canRedo()) return false;
    this.currentIndex++;
    const snapshot = JSON.parse(this.history[this.currentIndex]);
    this.tileMap.fromJSON(snapshot);
    this.onStateRestore(snapshot);
    this.updateUI();
    return true;
  }

  updateUI() {
    if (typeof document === 'undefined') return;
    const btnUndoList = document.querySelectorAll('#btn-undo, .btn-undo-action');
    const btnRedoList = document.querySelectorAll('#btn-redo, .btn-redo-action');

    btnUndoList.forEach((btn) => {
      btn.disabled = !this.canUndo();
      btn.classList.toggle('disabled', !this.canUndo());
    });

    btnRedoList.forEach((btn) => {
      btn.disabled = !this.canRedo();
      btn.classList.toggle('disabled', !this.canRedo());
    });
  }

  reset() {
    this.history = [];
    this.currentIndex = -1;
    this.recordState();
  }
}
