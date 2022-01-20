import { mainGLSL, filmGrainGLSL } from './film-grain.glsl'
import * as webglUtils from "twgl.js";

export default class GrainRenderer {
  constructor(canvas) {
    this.onResize();
    this.gl = canvas.getContext("webgl");
    this.programInfo = webglUtils.createProgramInfo(this.gl, [mainGLSL, filmGrainGLSL]);
    this.bufferInfo = webglUtils.createBufferInfoFromArrays(this.gl, {
      position: [-1, -1, 0, 3, -1, 0, -1, 3, 0]
    });

    this.color1 = { r: 0.3, g: 0.3, b: 0.3 };
    this.color2 = { r: 1, g: 1, b: 1 };

    this.uniforms = {
      time: 0,
      resolution: [this.viewport.x, this.viewport.y],
      color1: [this.color1.r, this.color1.g, this.color1.b],
      color2: [this.color2.r, this.color2.g, this.color2.b]
    };

    this.skipFrame = 0;
  }

  enable() {
    this.animID = requestAnimationFrame(this.render.bind(this));
    this.onResize();
    window.addEventListener("resize", this.onResize.bind(this));
  }

  disable() {
    cancelAnimationFrame(this.animID);
    window.removeEventListener("resize", this.onResize.bind(this));
    this.animID = null;
  }

  onResize() {
    this.viewport = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    };
  }

  render(time) {
    this.animID = requestAnimationFrame(this.render.bind(this));
    this.skipFrame++;
    this.skipFrame >= 10 && (this.skipFrame = 0);
    webglUtils.resizeCanvasToDisplaySize(this.gl.canvas, 0.5);
    this.gl.viewport(0, 0, this.viewport.x, this.viewport.y);
    this.gl.useProgram(this.programInfo.program);
    webglUtils.setBuffersAndAttributes(
      this.gl,
      this.programInfo,
      this.bufferInfo
    );
    this.uniforms.time = 0.001 * time;
    this.uniforms.color1 = [this.color1.r, this.color1.g, this.color1.b];
    this.uniforms.color2 = [this.color2.r, this.color2.g, this.color2.b];
    this.uniforms.resolution = [this.viewport.x, this.viewport.y];
    webglUtils.setUniforms(this.programInfo, this.uniforms);
    webglUtils.drawBufferInfo(this.gl, this.bufferInfo);
  }
}
