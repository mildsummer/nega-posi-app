import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import loadThreeJS from '../utils/loadThreeJS';

let THREE = null;
let renderer = null;
let scene = null;
let camera = null;
let controls = null;

export default class ARMode extends Component {
  constructor(props) {
    super(props);
    this.initContents = this.initContents.bind(this);
    this.updateTexture = this.updateTexture.bind(this);
    this.onResize = this.onResize.bind(this);
    this.update = this.update.bind(this);
    this.timer = null;
    this.state = {
      isLoading: false
    };
  }

  componentDidMount() {
    loadThreeJS(() => {
      THREE = window.THREE;
      const { getImage } = this.props;
      this.initScene();
      getImage(this.initContents);
      this.update();
      controls.addEventListener('change', this.update);
      window.addEventListener('resize', this.onResize);
      this.onResize();
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.checkUpdate(nextProps, nextState);
  }

  checkUpdate(nextProps, nextState) {
    return this.state.isLoading !== nextState.isLoading
      || this.props.isBlend !== nextProps.isBlend;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data || nextProps.shadeAngle !== this.props.shadeAngle) {
      window.clearTimeout(this.timer);
      this.timer = window.setTimeout(this.updateTexture, 300);
      this.setState({
        isLoading: true
      });
    }
    if (this.props.offsetX !== nextProps.offsetX || this.props.offsetY !== nextProps.offsetY) {
      this.translate(nextProps.offsetX, nextProps.offsetY);
    }
  }

  componentWillUnmount() {
    window.clearTimeout(this.timer);
    controls.enabled = false;
    this.contents.children.forEach((mesh) => {
      this.contents.remove(mesh);
      mesh.geometry.dispose();
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach((material) => {
          material.dispose()
        });
      } else {
        mesh.material.dispose();
      }
    });
  }

  initScene() {
    const container = this.wrapper.parentNode;
    scene = scene || new THREE.Scene();
    renderer = renderer || new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      localClippingEnabled: true,
      preserveDrawingBuffer: true
    });
    renderer.setClearColor(new THREE.Color('black'), 0);
    renderer.setSize(640, 480);
    renderer.domElement.classList.add('ar-layer');
    this.wrapper.appendChild(renderer.domElement);
    if (!camera) {
      camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 1000);
      camera.lookAt(0, 0, 0);
      camera.position.set(0, 0, 3);
    }
    controls = controls || new THREE.OrbitControls(camera, container);
    controls.enablePan = false;
    controls.enabled = true;
    controls.update();
    scene.add(camera);
    container.addEventListener('mousewheel', (e) => {
      e.preventDefault();
    });
  }

  initContents(imageURL, width, height) {
    const { data, shadeAngle } = this.props;
    const shadeStrength = 0.5;
    if (this.contents) {
      this.contents.children.forEach((mesh) => {
        mesh.geometry.dispose();
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((material) => {
            material.dispose();
          });
        } else {
          mesh.material.dispose();
        }
        this.contents.remove(mesh);
      });
      scene.remove(this.contents);
    }
    this.contents = new THREE.Group();
    scene.add(this.contents);
    const geometry = new THREE.BoxGeometry(1, height / width, 0.05);
    const loader = new THREE.TextureLoader();
    const texture = loader.load(imageURL, () => {
      this.update();
      if (this.state.isLoading && !this.timer) {
        this.setState({
          isLoading: false
        });
      }
    });
    const frameColor = new THREE.Color(
      `rgb(${(data.frame || data.mat || data.base).value.join(',')})`
    );
    const materials = [
      new THREE.MeshBasicMaterial({
        color: frameColor.clone().multiplyScalar(
          (Math.min(shadeAngle, Math.PI * 2 - shadeAngle) / Math.PI) * shadeStrength - shadeStrength + 1
        )
      }),
      new THREE.MeshBasicMaterial({
        color: frameColor.clone().multiplyScalar(
          (Math.abs(shadeAngle - Math.PI) / Math.PI) * shadeStrength - shadeStrength + 1
        )
      }),
      new THREE.MeshBasicMaterial({
        color: frameColor.clone().multiplyScalar(
          (Math.min(Math.abs(shadeAngle - Math.PI * 0.5), Math.abs(shadeAngle - Math.PI * 2.5)) / Math.PI) * shadeStrength - shadeStrength + 1
        )
      }),
      new THREE.MeshBasicMaterial({
        color: frameColor.clone().multiplyScalar(
          (Math.min(Math.abs(shadeAngle - Math.PI * 1.5), shadeAngle + Math.PI * 0.5) / Math.PI) * shadeStrength - shadeStrength + 1
        )
      }),
      new THREE.MeshBasicMaterial({
        map: texture
      }),
      new THREE.MeshBasicMaterial({
        color: frameColor.clone().multiplyScalar(1 - shadeStrength)
      })
    ];
    const mesh = new THREE.Mesh(geometry, materials);
    mesh.position.set(0, 0, 0.015);
    this.contents.add(mesh);

    // 影のcanvasを用意
    const canvas = document.createElement('canvas');
    const canvasSize = 300;
    const frameWidth = 100;
    const shadeSize = 8;
    const shadeX = shadeSize * Math.cos(shadeAngle);
    const shadeY = -(shadeSize * Math.sin(shadeAngle));
    const frameHeight = frameWidth * (height / width);
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    const context = canvas.getContext('2d');
    const leftTop = [(canvasSize - frameWidth) / 2, (canvasSize - frameHeight) / 2];
    const rightTop = [leftTop[0] + frameWidth, leftTop[1]];
    const rightBottom = [rightTop[0], rightTop[1] + frameHeight];
    const leftBottom = [leftTop[0], rightBottom[1]];
    context.shadowColor = 'rgba(0, 0, 0, 0.2)';
    context.shadowBlur = 20;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    context.beginPath();
    if (shadeAngle > Math.PI * 1.5) {
      context.moveTo(leftTop[0], leftTop[1]);
      context.lineTo(rightTop[0], rightTop[1]);
      context.lineTo(rightTop[0] + shadeX, rightTop[1] + shadeY);
      context.lineTo(rightTop[0] + shadeX, rightBottom[1] + shadeY);
      context.lineTo(leftBottom[0] + shadeX, leftBottom[1] + shadeY);
      context.lineTo(leftBottom[0], leftBottom[1]);
    } else if (shadeAngle > Math.PI) {
      context.moveTo(leftTop[0], leftTop[1]);
      context.lineTo(rightTop[0], rightTop[1]);
      context.lineTo(rightBottom[0], rightBottom[1]);
      context.lineTo(rightBottom[0] + shadeX, rightBottom[1] + shadeY);
      context.lineTo(leftBottom[0] + shadeX, leftBottom[1] + shadeY);
      context.lineTo(leftTop[0] + shadeX, leftTop[1] + shadeY);
    } else if (shadeAngle > Math.PI / 2) {
      context.moveTo(leftTop[0] + shadeX, leftTop[1] + shadeY);
      context.lineTo(rightTop[0] + shadeX, rightTop[1] + shadeY);
      context.lineTo(rightTop[0], rightTop[1]);
      context.lineTo(rightBottom[0], rightBottom[1]);
      context.lineTo(leftBottom[0], leftBottom[1]);
      context.lineTo(leftBottom[0] + shadeX, leftBottom[1] + shadeY);
    } else {
      context.moveTo(leftTop[0], leftTop[1]);
      context.lineTo(leftTop[0] + shadeX, leftTop[1] + shadeY);
      context.lineTo(rightTop[0] + shadeX, rightTop[1] + shadeY);
      context.lineTo(rightBottom[0] + shadeX, rightBottom[1] + shadeY);
      context.lineTo(rightBottom[0], rightBottom[1]);
      context.lineTo(leftBottom[0], leftBottom[1]);
    }
    context.closePath();
    context.fillStyle = context.shadowColor;
    context.fill();
    const shadeTexture = new THREE.Texture(canvas);
    shadeTexture.needsUpdate = true;
    shadeTexture.onUpdate = () => {
      window.setTimeout(() => {
        this.update();
      });
    };
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(canvasSize / frameWidth, canvasSize / frameWidth), new THREE.MeshBasicMaterial({ map: shadeTexture }));
    this.contents.add(plane);
  }

  updateTexture() {
    const { getImage } = this.props;
    getImage(this.initContents);
    delete this.timer;
  }

  onResize() {
    const width = window.innerWidth || document.documentElement.clientWidth;
    const height = window.innerHeight || document.documentElement.clientHeight;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    this.update();
  }

  update() {
    renderer.render(scene, camera);
  }

  translate(x, y) {
    renderer.domElement.style.transform = `translate(${x}px, ${y}px)`;
  }

  get domElement() {
    return renderer.domElement;
  }

  render() {
    const { isLoading } = this.state;
    const { isBlend } = this.props;
    return (
      <div
        className={classNames('ar-layer__wrapper', {
          'ar-layer__wrapper--loading': isLoading,
          'ar-layer__wrapper--blend': isBlend
        })}
        ref={(ref) => {
          if (ref) {
            this.wrapper = ref;
          }
        }}
      />
    );
  }
}

ARMode.propTypes = {
  data: PropTypes.object.isRequired,
  getImage: PropTypes.func.isRequired,
  isBlend: PropTypes.bool.isRequired,
  shadeAngle: PropTypes.number.isRequired,
  offsetX: PropTypes.number.isRequired,
  offsetY: PropTypes.number.isRequired
};
