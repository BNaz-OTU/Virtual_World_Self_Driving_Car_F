class GraphEditor {
  constructor(viewport, graph) {
    this.viewport = viewport;
    this.canvas = viewport.canvas;
    this.graph = graph;

    this.ctx = this.canvas.getContext("2d");

    this.selected = null; // Checks if point is selected
    this.hovered = null; // Checks if point is being hovered over
    this.dragging = false; // Checks if point is being dragged
    this.mouse = null;
  }

  enable() {
    this.#addEventListeners();
  }

  disable() {
    this.#removeEventListeners();
    this.selected = false;
    this.hovered = false;
  }

  #addEventListeners() {
    // Without .bind(), 'this' will refer to the canvas (canvas doesn't have graph the
    // graphEditor has access to the graph), thus not allowing access to the
    // graphEditor. To overcome this issue use .bind(this) and 'this' will start to
    // refer to the graphEditor instead

    this.boundMouseDown = this.#handleMouseDown.bind(this);
    this.boundMouseMove = this.#handleMouseMove.bind(this);
    this.boundMouseUp = () => (this.dragging = false);
    this.boundContextMenu = (evt) => evt.preventDefault();

    this.canvas.addEventListener("mousedown", this.boundMouseDown);
    this.canvas.addEventListener("mousemove", this.boundMouseMove);
    this.canvas.addEventListener("mouseup", this.boundMouseUp);
    this.canvas.addEventListener("contextmenu", this.boundContextMenu);
  }

  #removeEventListeners() {
    this.canvas.removeEventListener("mousedown", this.boundMouseDown);
    this.canvas.removeEventListener("mousemove", this.boundMouseMove);
    this.canvas.removeEventListener("mouseup", this.boundMouseUp);
    this.canvas.removeEventListener("contextmenu", this.boundContextMenu);
  }

  #handleMouseMove(evt) {
    this.mouse = this.viewport.getMouse(evt, true); // refers to viewport the mouse value
    this.hovered = getNearestPoint(
      this.mouse,
      this.graph.points,
      10 * this.viewport.zoom // multiplying this.viewport.zoom adjusts the threshold for making connections to other points
    );
    if (this.dragging == true) {
      this.selected.x = this.mouse.x;
      this.selected.y = this.mouse.y;
    }
  }

  //   ** TODO: **
  //   Switch key maps to dblclick for left click to allow for
  //   Drag and panning

  #handleMouseDown(evt) {
    // right click
    if (evt.button == 2) {
      // (1/2) If a point has already been selected, right-clicking will un-select
      if (this.selected) {
        this.selected = null;
      }
      // (2/2) But, if you did not select a point and hover over a point, you delete it
      else if (this.hovered) {
        this.#removePoint(this.hovered);
      }
    }

    // left click
    if (evt.button == 0) {
      // (1/2) If you hover over a point and hold left-click, you can drag the point
      if (this.hovered) {
        this.#select(this.hovered);
        this.dragging = true;
        return;
      }
      // (2/2) regardless if you dragged a point, as soon as you let go of the left a
      // new point is created (dragged point will be updated to new position).
      // NEW: added if statement that connects to viewport, helps determine if command
      // key was pressed preventing new points from being created
      if (this.viewport.commandKeyActive == false) {
        this.graph.addPoint(this.mouse);
        this.#select(this.mouse);
        this.hovered = this.mouse;
      }
    }
  }

  #select(point) {
    if (this.selected) {
      this.graph.tryAddSegment(new Segment(this.selected, point));
    }
    this.selected = point;
  }

  #removePoint(point) {
    this.graph.removePoint(point);
    this.hovered = null;
    if (this.selected == point) {
      this.selected = null;
    }
  }

  dispose() {
    this.graph.dispose();
    this.selected = null;
    this.hovered = null;
  }

  display() {
    this.graph.draw(this.ctx);
    if (this.hovered) {
      this.hovered.draw(this.ctx, { fill: true });
    }
    if (this.selected) {
      // This function demonstrates the intention to create a line
      const intent = this.hovered ? this.hovered : this.mouse; // Snapping feature
      new Segment(this.selected, intent).draw(ctx, { dash: [3, 3] });
      this.selected.draw(this.ctx, { outline: true });
    }
  }
}
