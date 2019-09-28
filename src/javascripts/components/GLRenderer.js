import { LUMINANCE_COEFFICIENT, CONTRAST_LENGTH, CONTRAST_THRESHOLD_LENGTH } from '../constants/General';
import loadThreeJS from '../utils/loadThreeJS';

let THREE = null;

export default class GLRenderer {
  constructor(canvas, source, data) {
    this.canvas = canvas;
    this.source = source;
    this.data = data;
    this.inited = false;
    loadThreeJS(this.init.bind(this));
  }

  init() {
    const { base, drawing, contrast, contrastThresholdValue, inversion, flip } = this.data;
    THREE = THREE || window.THREE;
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({
      preserveDrawingBuffer: true,
      canvas: this.canvas,
      depth: false
    });
    this.renderer.autoClear = false;
    this.camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 1000);
    this.camera.lookAt(0, 0, 0);
    this.camera.position.set(0, 0, 1);
    this.scene.add(this.camera);
    this.texture = new THREE.Texture(this.source);
    this.texture.needsUpdate = true;
    this.texture.minFilter = THREE.NearestFilter;
    const vertexShader = `
      varying vec2 vUv;
      uniform float flip;
			void main() {
			  vUv = position.xy / 2.0 + vec2(0.5, 0.5);
			  vUv.x = abs(flip - vUv.x);
        gl_Position = vec4(position, 1.0);
      }
    `;
    const fragmentShader = `
      precision mediump float;
      varying vec2 vUv;
      uniform sampler2D texture;
      uniform vec3 LUMINANCE_COEFFICIENT;
      uniform vec3 base;
      uniform vec3 drawing;
      uniform float contrastThresholdValue;
      uniform float CONTRAST_LENGTH;
      uniform float contrast;
      uniform float inversion;
			void main() {
			  vec4 color = texture2D(texture, vUv);
        float luminance = (color.x * LUMINANCE_COEFFICIENT.x) + (color.y * LUMINANCE_COEFFICIENT.y) + (color.z * LUMINANCE_COEFFICIENT.z);
        luminance = (luminance - contrastThresholdValue) * (CONTRAST_LENGTH + contrast) / CONTRAST_LENGTH + contrastThresholdValue;
        luminance = abs(inversion - luminance);
        color.x = (luminance * base.x + (1.0 - luminance) * drawing.x) / 255.0;
        color.y = (luminance * base.y + (1.0 - luminance) * drawing.y) / 255.0;
        color.z = (luminance * base.z + (1.0 - luminance) * drawing.z) / 255.0;
				gl_FragColor = color;
			}
    `;
    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: this.uniforms = {
        texture: { value: this.texture },
        LUMINANCE_COEFFICIENT: { value: LUMINANCE_COEFFICIENT },
        CONTRAST_LENGTH: { value: CONTRAST_LENGTH },
        contrast: { value: contrast },
        contrastThresholdValue: { value: contrastThresholdValue },
        base: { value: base.value },
        drawing: { value: drawing.value },
        inversion: { value: inversion * 1 },
        flip: { value: flip * 1 }
      },
      vertexShader,
      fragmentShader,
      depthTest: false
    });
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      shaderMaterial
    );
    plane.material.depthTest = false;
    plane.material.depthWrite = false;
    this.scene.add(plane);
    this.inited = true;
  }

  render(data = this.data) {
    this.data = data;
    if (this.inited) {
      this.uniforms.base.value = data.base.value;
      this.uniforms.drawing.value = data.drawing.value;
      this.uniforms.contrast.value = data.contrast;
      this.uniforms.contrastThresholdValue.value = data.contrastThreshold / CONTRAST_THRESHOLD_LENGTH;
      this.uniforms.inversion.value = data.inversion * 1;
      this.uniforms.flip.value = data.flip * 1;
      this.texture.needsUpdate = true;
      this.renderer.render(this.scene, this.camera);
    }
  }

  resize(width, height) {
    if (this.inited) {
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(width, height, false);
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.render();
    }
  }
}
