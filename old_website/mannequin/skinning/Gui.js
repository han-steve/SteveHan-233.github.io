import { Camera } from "../lib/webglutils/Camera.js";
import { Mat4, Vec3, Vec4, Vec2, Quat } from "../lib/TSM.js";
import vue from "./index.js";
export var Mode;
(function (Mode) {
  Mode[(Mode["playback"] = 0)] = "playback";
  Mode[(Mode["edit"] = 1)] = "edit";
})(Mode || (Mode = {}));
/**
 * Handles Mouse and Button events along with
 * the the camera.
 */
export class GUI {
  /**
   *
   * @param canvas required to get the width and height of the canvas
   * @param animation required as a back pointer for some of the controls
   * @param sponge required for some of the controls
   */
  constructor(canvas, animation) {
    this.hoverX = 0;
    this.hoverY = 0;
    this.height = canvas.height;
    this.viewPortHeight = this.height - 200;
    this.width = canvas.width;
    this.prevX = 0;
    this.prevY = 0;
    this.intersectionIndex = -1;
    this.animation = animation;
    this.reset();
    this.registerEventListeners(canvas);
  }
  getNumKeyFrames() {
    // TODO
    // Used in the status bar in the GUI
    return this.animation.getScene().meshes[0].keyFrames.length;
  }
  getTime() {
    return this.time;
  }
  getMaxTime() {
    // TODO
    // The animation should stop after the last keyframe
    let keyframes = this.animation.getScene().meshes[0].keyFrames;
    let keyFrames = [...keyframes].sort((a, b) => {
      return a.time - b.time;
    });
    return keyFrames.length > 1 ? keyFrames[keyFrames.length - 1].time : 0;
  }
  /**
   * Resets the state of the GUI
   */
  reset() {
    this.fps = false;
    this.dragging = false;
    this.time = 0;
    this.mode = Mode.edit;
    this.camera = new Camera(
      new Vec3([0, 0, -6]),
      new Vec3([0, 0, 0]),
      new Vec3([0, 1, 0]),
      45,
      this.width / this.viewPortHeight,
      0.1,
      1000.0
    );
  }
  /**
   * Sets the GUI's camera to the given camera
   * @param cam a new camera
   */
  setCamera(pos, target, upDir, fov, aspect, zNear, zFar) {
    this.camera = new Camera(pos, target, upDir, fov, aspect, zNear, zFar);
  }
  /**
   * Returns the view matrix of the camera
   */
  viewMatrix() {
    return this.camera.viewMatrix();
  }
  /**
   * Returns the projection matrix of the camera
   */
  projMatrix() {
    return this.camera.projMatrix();
  }
  /**
   * Callback function for the start of a drag event.
   * @param mouse
   */
  dragStart(mouse) {
    if (mouse.offsetY > 600) {
      // outside the main panel
      return;
    }
    // TODO
    // Some logic to rotate the bones, instead of moving the camera, if there is a currently highlighted bone
    const bones = this.animation.getScene().meshes[0].bones;
    bones.forEach((bone, index) => {
      if (bone.highlighted) {
        this.intersectionIndex = index;
        let pos = this.projMatrix().multiplyVec4(
          this.viewMatrix().multiplyVec4(new Vec4([...bone.position.xyz, 1.0]))
        );
        pos = pos.scale(1 / pos.w);
        let [x, y] = pos.xy;
        x = ((x + 1) / 2) * this.width;
        y = ((y - 1) / -2) * this.viewPortHeight;
        this.bonePosScreen = new Vec2([x, y]);
      }
    });
    this.dragging = true;
    this.prevX = mouse.offsetX;
    this.prevY = mouse.offsetY;
  }
  incrementTime(dT) {
    if (this.mode === Mode.playback) {
      this.time += dT;
      if (this.time >= this.getMaxTime()) {
        this.time = 0;
        this.mode = Mode.edit;
      }
    }
  }
  cylinderIntersect(rDir, rPos, bLength, radius, i) {
    let EPSILON = 0.0001;
    let x0 = rPos.x;
    let y0 = rPos.y;
    let x1 = rDir.x;
    let y1 = rDir.y;
    let a = x1 * x1 + y1 * y1;
    let b = 2.0 * (x0 * x1 + y0 * y1);
    let c = x0 * x0 + y0 * y0 - radius * radius;
    if (0.0 == a) {
      // This implies that x1 = 0.0 and y1 = 0.0, which further
      // implies that the ray is aligned with the body of the cylinder,
      // so no intersection.
      return 0;
    }
    let discriminant = b * b - 4.0 * a * c;
    if (discriminant < 0.0) {
      return 0;
    }
    discriminant = Math.sqrt(discriminant);
    let t2 = (-b + discriminant) / (2.0 * a);
    if (t2 <= EPSILON) {
      return 0;
    }
    let t1 = (-b - discriminant) / (2.0 * a);
    if (t1 > EPSILON) {
      // Two intersections.
      let P = rPos.add(rDir.scale(t1));
      let z = P.z;
      if (z >= 0.0 && z <= bLength) {
        // It's okay. We will not fail this class.
        return t1;
      }
    }
    let P = rPos.add(rDir.scale(t2));
    let z = P.z;
    if (z >= 0.0 && z <= bLength) {
      return t2;
    }
    return 0;
  }
  updateChildBones(parent) {
    const bones = this.animation.getScene().meshes[0].bones;
    for (let i = 0; i < parent.children.length; i++) {
      let childIndex = parent.children[i];
      let child = bones[childIndex];
      // rotating child limbs
      child.rotation = parent.rotation.copy().multiply(child.T);
      child.B = child.initialPosition.copy().subtract(parent.initialPosition);
      child.position = parent.position
        .copy()
        .add(parent.rotation.multiplyVec3(child.B));
      // update child endpoints
      let localEndpoint = child.initialEndpoint
        .copy()
        .subtract(child.initialPosition);
      child.endpoint = child.rotation.multiplyVec3(localEndpoint);
      child.endpoint.add(child.position);
      this.updateChildBones(child);
    }
  }
  /**
   * The callback function for a drag event.
   * This event happens after dragStart and
   * before dragEnd.
   * @param mouse
   */
  drag(mouse) {
    let x = mouse.offsetX;
    let y = mouse.offsetY;
    if (this.intersectionIndex != -1) {
      // dragging a bone!
      const bone = this.animation.getScene().meshes[0].bones[
        this.intersectionIndex
      ];
      let prev = new Vec2([this.prevX, this.prevY])
        .subtract(this.bonePosScreen)
        .normalize();
      let curr = new Vec2([x, y]).subtract(this.bonePosScreen).normalize();
      let angle = Math.atan2(curr.y, curr.x) - Math.atan2(prev.y, prev.x);
      let currRot = Quat.fromAxisAngle(
        bone.rotation.copy().inverse().multiplyVec3(this.camera.forward()),
        -angle
      );
      // updating current bone
      bone.rotation.multiply(currRot);
      // current T
      bone.T.multiply(currRot);
      // current endpoint
      let localEndpoint = bone.initialEndpoint
        .copy()
        .subtract(bone.initialPosition);
      bone.endpoint = bone.rotation.multiplyVec3(localEndpoint);
      bone.endpoint.add(bone.position);
      // updating child bones
      this.updateChildBones(bone);
      this.prevX = mouse.offsetX;
      this.prevY = mouse.offsetY;
    } else if (this.dragging) {
      const dx = mouse.offsetX - this.prevX;
      const dy = mouse.offsetY - this.prevY;
      this.prevX = mouse.offsetX;
      this.prevY = mouse.offsetY;
      /* Left button, or primary button */
      const mouseDir = this.camera.right();
      mouseDir.scale(-dx);
      mouseDir.add(this.camera.up().scale(dy));
      mouseDir.normalize();
      if (dx === 0 && dy === 0) {
        return;
      }
      switch (mouse.buttons) {
        case 1: {
          let rotAxis = Vec3.cross(this.camera.forward(), mouseDir);
          rotAxis = rotAxis.normalize();
          if (this.fps) {
            this.camera.rotate(rotAxis, GUI.rotationSpeed);
          } else {
            this.camera.orbitTarget(rotAxis, GUI.rotationSpeed);
          }
          break;
        }
        case 2: {
          /* Right button, or secondary button */
          this.camera.offsetDist(Math.sign(mouseDir.y) * GUI.zoomSpeed);
          break;
        }
        default: {
          break;
        }
      }
    }
    // TODO
    // You will want logic here:
    // 1) To highlight a bone, if the mouse is hovering over a bone;
    // 2) To rotate a bone, if the mouse button is pressed and currently highlighting a bone.
    // shoot a ray
    const mouseNDC = new Vec4([
      (2 * mouse.offsetX) / this.width - 1,
      1 - (2 * mouse.offsetY) / this.viewPortHeight,
      -1,
      1,
    ]);
    const mouseWorld = this.viewMatrix()
      .inverse()
      .multiplyVec4(this.projMatrix().inverse().multiplyVec4(mouseNDC));
    // normalize w
    mouseWorld.scale(1 / mouseWorld.w);
    const rayDir = new Vec3(mouseWorld.xyz);
    rayDir.subtract(this.camera.pos());
    rayDir.normalize();
    // Rotation Matrix (create new axis with bone position at origin)
    // R = [z | x | y][boneDir | t1 | t2]^-1
    // [z | x | y]
    let xAxis = new Vec4([1, 0, 0, 0]);
    let yAxis = new Vec4([0, 1, 0, 0]);
    let zAxis = new Vec4([0, 0, 1, 0]);
    let finalCol = new Vec4([0, 0, 0, 1]);
    let values = [];
    values.push(...zAxis.xyzw, ...xAxis.xyzw, ...yAxis.xyzw, ...finalCol.xyzw);
    let zxyMat = new Mat4(values);
    const bones = this.animation.getScene().meshes[0].bones;
    let intersectIndex = -1; // which bone is intersected
    let intersectTime = 999999;
    for (let i = 0; i < bones.length; i++) {
      let b = bones[i];
      let boneDir = b.endpoint.copy();
      boneDir.subtract(b.position);
      let boneLen = boneDir.length();
      boneDir.normalize();
      // [boneDir | t1 | t2]^-1
      let random = boneDir.copy();
      random.y = random.y + 1; // making the vector NOT parallel
      if (random.x == 0 && random.z == 0) {
        // special case: 0 1 0
        random.x = random.x + 1;
      }
      let t1 = Vec3.cross(boneDir, random);
      let t2 = Vec3.cross(boneDir, t1);
      let values = [];
      values.push(
        ...boneDir.xyz,
        0,
        ...t1.xyz,
        0,
        ...t2.xyz,
        0,
        ...finalCol.xyzw
      );
      let bTTMat = new Mat4(values);
      // R = [z | x | y][boneDir | t1 | t2]^-1
      let rotation = new Mat4();
      zxyMat.multiply(bTTMat.inverse(), rotation);
      // rotating the ray
      let zRayStart = rotation.multiplyVec3(
        this.camera.pos().subtract(b.position)
      );
      let zRay = rotation
        .multiplyVec3(this.camera.pos().add(rayDir).subtract(b.position))
        .subtract(zRayStart)
        .normalize();
      // does this rotated ray intersect with the rotated cylinder?
      let r = b.radius;
      let intersect = this.cylinderIntersect(zRay, zRayStart, boneLen, r, i);
      if (intersect > 0) {
        if (intersect < intersectTime) {
          intersectIndex = i;
          intersectTime = intersect;
        }
      }
    }
    for (let i = 0; i < bones.length; i++) {
      if (i == intersectIndex) {
        bones[intersectIndex].highlighted = true;
      } else {
        bones[i].highlighted = false;
      }
    }
  }
  getModeString() {
    switch (this.mode) {
      case Mode.edit: {
        return "edit: " + this.getNumKeyFrames() + " keyframes";
      }
      case Mode.playback: {
        return (
          "playback: " +
          this.getTime().toFixed(2) +
          " / " +
          this.getMaxTime().toFixed(2)
        );
      }
    }
  }
  /**
   * Callback function for the end of a drag event
   * @param mouse
   */
  dragEnd(mouse) {
    this.dragging = false;
    this.prevX = 0;
    this.prevY = 0;
    // TODO
    // Maybe your bone highlight/dragging logic needs to do stuff here too
    this.intersectionIndex = -1;
  }
  addKeyFrame() {
    if (this.mode === Mode.edit) {
      if (
        this.animation.getScene().meshes[0].keyFrames.length == 0 &&
        vue.playheadTime != 0
      ) {
        // when first frame isn't at time 0
        let currKeyFrame = [];
        const bones = this.animation.getScene().meshes[0].bones;
        for (let i = 0; i < bones.length; i++) {
          let currBone = bones[i];
          currKeyFrame.push(currBone.T.copy());
        }
        this.animation.getScene().meshes[0].keyFrames.push({
          time: 0,
          rotations: currKeyFrame,
        });
        vue.keyframes.push({
          time: 0,
          index: vue.keyframes.length,
        });
      }
      let currKeyFrame = [];
      const bones = this.animation.getScene().meshes[0].bones;
      for (let i = 0; i < bones.length; i++) {
        let currBone = bones[i];
        currKeyFrame.push(currBone.T.copy());
      }
      this.animation.getScene().meshes[0].keyFrames.push({
        time: vue.playheadTime,
        rotations: currKeyFrame,
      });
      vue.keyframes.push({
        time: vue.playheadTime,
        index: vue.keyframes.length,
      });
    }
  }
  startPlayBack() {
    if (this.mode === Mode.edit && this.getNumKeyFrames() > 1) {
      // resetting rotaions so transformations can be applied on a fresh slate
      const bones = this.animation.getScene().meshes[0].bones;
      for (let i = 0; i < bones.length; i++) {
        let bone = bones[i];
        bone.position = bone.initialPosition;
        bone.endpoint = bone.initialEndpoint;
        bone.T = Quat.identity.copy();
        bone.rotation = Quat.identity.copy();
      }
      this.mode = Mode.playback;
      this.time = 0;
    } else if (this.mode === Mode.playback) {
      this.mode = Mode.edit;
    }
  }
  /**
   * Callback function for a key press event
   * @param key
   */
  onKeydown(key) {
    switch (key.code) {
      case "Digit1": {
        vue.keyframes = [];
        this.animation.setScene(
          "/mannequin/static/assets/skinning/split_cube.dae"
        );
        break;
      }
      case "Digit2": {
        vue.keyframes = [];
        this.animation.setScene(
          "/mannequin/static/assets/skinning/long_cubes.dae"
        );
        break;
      }
      case "Digit3": {
        vue.keyframes = [];
        this.animation.setScene(
          "/mannequin/static/assets/skinning/simple_art.dae"
        );
        break;
      }
      case "Digit4": {
        vue.keyframes = [];
        this.animation.setScene(
          "/mannequin/static/assets/skinning/mapped_cube.dae"
        );
        break;
      }
      case "Digit5": {
        vue.keyframes = [];
        this.animation.setScene("/mannequin/static/assets/skinning/robot.dae");
        break;
      }
      case "Digit6": {
        vue.keyframes = [];
        this.animation.setScene("/mannequin/static/assets/skinning/head.dae");
        break;
      }
      case "Digit7": {
        vue.keyframes = [];
        this.animation.setScene("/mannequin/static/assets/skinning/wolf.dae");
        break;
      }
      case "Digit8": {
        vue.keyframes = [];
        // not rigged perfectly, but enjoy rearranging our chicken!
        this.animation.setScene(
          "/mannequin/static/assets/skinning/chicken.dae"
        );
        break;
      }
      case "KeyW": {
        this.camera.offset(this.camera.forward().negate(), GUI.zoomSpeed, true);
        break;
      }
      case "KeyA": {
        this.camera.offset(this.camera.right().negate(), GUI.zoomSpeed, true);
        break;
      }
      case "KeyS": {
        this.camera.offset(this.camera.forward(), GUI.zoomSpeed, true);
        break;
      }
      case "KeyD": {
        this.camera.offset(this.camera.right(), GUI.zoomSpeed, true);
        break;
      }
      case "KeyR": {
        this.animation.reset();
        break;
      }
      case "ArrowLeft": {
        this.camera.roll(GUI.rollSpeed, false);
        break;
      }
      case "ArrowRight": {
        this.camera.roll(GUI.rollSpeed, true);
        break;
      }
      case "ArrowUp": {
        this.camera.offset(this.camera.up(), GUI.zoomSpeed, true);
        break;
      }
      case "ArrowDown": {
        this.camera.offset(this.camera.up().negate(), GUI.zoomSpeed, true);
        break;
      }
      case "KeyK": {
        this.addKeyFrame();
        break;
      }
      case "Space":
      case "KeyP": {
        this.startPlayBack();
        break;
      }
      default: {
        console.log("Key : '", key.code, "' was pressed.");
        break;
      }
    }
  }
  /**
   * Registers all event listeners for the GUI
   * @param canvas The canvas being used
   */
  registerEventListeners(canvas) {
    /* Event listener for key controls */
    window.addEventListener("keydown", (key) => this.onKeydown(key));
    /* Event listener for mouse controls */
    canvas.addEventListener("mousedown", (mouse) => this.dragStart(mouse));
    canvas.addEventListener("mousemove", (mouse) => this.drag(mouse));
    canvas.addEventListener("mouseup", (mouse) => this.dragEnd(mouse));
    /* Event listener to stop the right click menu */
    canvas.addEventListener("contextmenu", (event) => event.preventDefault());
  }
}
GUI.rotationSpeed = 0.05;
GUI.zoomSpeed = 0.1;
GUI.rollSpeed = 0.1;
GUI.panSpeed = 0.1;
//# sourceMappingURL=Gui.js.map
