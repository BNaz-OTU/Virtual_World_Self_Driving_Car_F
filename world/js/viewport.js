class Viewport {
  constructor(canvas, zoom = 1, offset = null) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.zoom = zoom;
    this.center = new Point(canvas.width / 2, canvas.height / 2);
    this.offset = offset ? offset : scale(this.center, -1);

    // this.offset = new Point(0, 0);

    this.drag = {
      start: new Point(0, 0),
      end: new Point(0, 0),
      offset: new Point(0, 0),
      active: false,
    };

    this.commandKeyActive = false;
    this.commandClickActive = false;

    this.#addEventListeners();
  }

  reset() {
    this.ctx.restore();
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    this.ctx.translate(this.center.x, this.center.y);
    this.ctx.scale(1 / this.zoom, 1 / this.zoom);
    const offset = this.getOffset(); // Constantly updates everytime viewport is panned (basically update the window as you drag)
    this.ctx.translate(offset.x, offset.y);
  }

  // Without this it would mess up the location of where you want to create points/lines
  // this.offset, this.zoom and this.center is used to help properly adjust the mouse clicks after panning
  getMouse(evt, subtractDragOffset = false) {
    const p = new Point(
      (evt.offsetX - this.center.x) * this.zoom - this.offset.x,
      (evt.offsetY - this.center.y) * this.zoom - this.offset.y
    );

    return subtractDragOffset ? subtract(p, this.drag.offset) : p;
  }

  getOffset() {
    return add(this.offset, this.drag.offset);
  }

  //   #addEventListeners() {
  //     this.canvas.addEventListener(
  //       "mousewheel",
  //       this.#handleMouseWheel.bind(this)
  //     );

  //     this.canvas.addEventListener("mousedown", this.#handleMouseDown.bind(this));
  //     this.canvas.addEventListener("mousemove", this.#handleMouseMove.bind(this));
  //     this.canvas.addEventListener("mouseup", this.#handleMouseUp.bind(this));
  //   }

  //   #handleMouseDown(evt) {
  //     if (evt.button == 1) {
  //       // middle button
  //       this.drag.start = this.getMouse(evt);
  //       this.drag.active = true;
  //     }
  //   }

  //   #handleMouseMove(evt) {
  //     if (this.drag.active) {
  //       this.drag.end = this.getMouse(evt);
  //       this.drag.offset = subtract(this.drag.end, this.drag.start);
  //     }
  //   }

  //   #handleMouseUp(evt) {
  //     if (this.drag.active) {
  //       this.offset = add(this.offset, this.drag.offset);
  //       this.drag = {
  //         start: new Point(0, 0),
  //         end: new Point(0, 0),
  //         offset: new Point(0, 0),
  //         active: false,
  //       };
  //     }
  //   }

  #addEventListeners() {
    this.canvas.addEventListener(
      "mousewheel",
      this.#handleMouseWheel.bind(this)
    );
    this.canvas.addEventListener("keydown", this.#handleKeyDown.bind(this));
    this.canvas.addEventListener("keyup", this.#handleKeyUp.bind(this));
    this.canvas.addEventListener("mousedown", this.#handleMouseDown.bind(this));
    this.canvas.addEventListener("mousemove", this.#handleMouseMove.bind(this));
    this.canvas.addEventListener("mouseup", this.#handleMouseUp.bind(this));
  }

  #handleKeyDown(evt) {
    // When "COMMAND" key is held it will allow for the mouse to be used for panning
    if (evt.key == "Meta") {
      this.commandKeyActive = true;
      // console.log(this.commandKeyActive); //DEBUG
      //   console.log("KEYDOWN"); DEBUG
    }
  }

  #handleKeyUp(evt) {
    if (evt.key == "Meta") {
      this.commandKeyActive = false;
      //   console.log(this.commandKeyActive); DEBUG
      //   console.log("KEYUP"); DEBUG
    }
  }

  #handleMouseDown(evt) {
    if (evt.button == 0 && this.commandKeyActive == true) {
      // middle button
      this.drag.start = this.getMouse(evt);
      this.drag.active = true;
      //   this.selected = null;
      this.commandClickActive = true;
      //   console.log("MouseDown"); DEBUG
    }
  }

  #handleMouseMove(evt) {
    if (this.commandKeyActive == true && this.commandClickActive == true) {
      //   console.log("MouseMove"); DEBUG
    }

    if (this.drag.active) {
      this.drag.end = this.getMouse(evt);
      this.drag.offset = subtract(this.drag.end, this.drag.start);
    }
  }

  #handleMouseUp(evt) {
    if (this.commandKeyActive == true && this.commandClickActive == true) {
      this.commandClickActive = false;
      //   console.log("MouseUp"); DEBUG
    }

    if (this.drag.active) {
      this.offset = add(this.offset, this.drag.offset);
      this.drag = {
        start: new Point(0, 0),
        end: new Point(0, 0),
        offset: new Point(0, 0),
        active: false,
      };
    }
  }

  #handleMouseWheel(evt) {
    // Zoom in or out
    // --- Old Version ---
    const dir = Math.sign(evt.deltaY);
    const step = 0.1; // how much to change zoom
    this.zoom += dir * step;
    this.zoom = Math.max(1, Math.min(5, this.zoom)); // Keeps the zoom functionality in a threshold preventing it from zooming to far out or to far in
  }
}
