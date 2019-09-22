import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
const { THREE, THREEx } = window;

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
    this.startAr = this.startAr.bind(this);
    this.update = this.update.bind(this);
    this.timer = null;
    this.state = {
      isLoading: false
    };
  }

  componentDidMount() {
    const { getImage } = this.props;
    this.initScene();
    getImage(this.initContents);
    // this.initStartButton();
    // this.initStopButton();
    this.start();
    window.addEventListener('resize', this.onResize);
    this.onResize();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.checkUpdate(nextProps, nextState);
  }

  checkUpdate(nextProps, nextState) {
    return this.state.isLoading !== nextState.isLoading;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.props.data) {
      window.clearTimeout(this.timer);
      this.timer = window.setTimeout(this.updateTexture, 300);
      this.setState({
        isLoading: true
      });
    }
  }

  componentWillUnmount() {
    window.clearTimeout(this.timer);
    this.contents.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.mesh.material.forEach((material) => {
      material.dispose()
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
    camera = camera || new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 1000);
    camera.lookAt(0, 0, 0);
    camera.position.set(0, 0, 10);
    controls = controls || new THREE.OrbitControls(camera, container);
    controls.update();
    scene.add(camera);
    container.addEventListener('mousewheel', (e) => {
      e.preventDefault();
    });
  }

  initContents(imageURL, width, height) {
    const { data } = this.props;
    if (this.mesh) {
      this.contents.remove(this.mesh);
      this.mesh.geometry.dispose();
      this.mesh.material.forEach((material) => {
        material.dispose()
      });
    } else {
      this.contents = new THREE.Group();
    }
    const geometry = new THREE.BoxGeometry(1, height / width, 0.03);
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
      new THREE.MeshBasicMaterial({ color: frameColor }),
      new THREE.MeshBasicMaterial({ color: frameColor }),
      new THREE.MeshBasicMaterial({ color: frameColor }),
      new THREE.MeshBasicMaterial({ color: frameColor }),
      new THREE.MeshBasicMaterial({
        map: texture
      }),
      new THREE.MeshBasicMaterial({ color: frameColor })
    ];
    this.mesh = new THREE.Mesh(geometry, materials);
    this.mesh.position.set(0, 0, 0);
    this.contents.add(this.mesh);
    scene.add(this.contents);
  }

  updateTexture() {
    const { getImage } = this.props;
    getImage(this.initContents);
    delete this.timer;
  }

  initArToolkit() {
    this.source = new THREEx.ArToolkitSource({
      sourceType: 'webcam',
    });
    this.source.init(this.onResize);

    this.context = new THREEx.ArToolkitContext({
      debug: false,
      cameraParametersUrl: './assets/vendor/camera_para.dat',
      detectionMode: 'mono',
      imageSmoothingEnabled: true,
      maxDetectionRate: 60,
      canvasWidth: this.source.parameters.sourceWidth,
      canvasHeight: this.source.parameters.sourceHeight,
    });
    this.context.init(() => {
      camera.projectionMatrix.copy(this.context.getProjectionMatrix());
    });
  }

  initMarker() {
    new THREEx.ArMarkerControls(this.context, this.contents, {
      type: 'pattern',
      patternUrl: './assets/vendor/patt.hiro'
    });
  }

  initStartButton() {
    document.getElementById('start-button').addEventListener('click', this.startAr);
  }

  initStopButton() {
    document.getElementById('stop-button').addEventListener('click', () => {
      this.isStop = true;
      if (this.source) {
        this.source.domElement.srcObject.getTracks().forEach((track) => {
          track.stop();
        });
        this.source.domElement.srcObject = null;
      }
    });
  }

  onResize() {
    if (this.source && this.contents) {
      this.source.onResizeElement();
      this.source.copyElementSizeTo(renderer.domElement);
      if(this.context.arController !== null){
        this.source.copyElementSizeTo(this.context.arController.canvas);
      }
    } else {
      const width = window.innerWidth || document.documentElement.clientWidth;
      const height = window.innerHeight || document.documentElement.clientHeight;
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
    this.update();
  }

  startAr() {
    controls.reset();
    controls.dispose();
    camera = new THREE.Camera();
    scene.remove(camera);
    this.initArToolkit();
    this.initMarker();
    this.isAr = true;
  }

  start() {
    this.isStop = false;
    this.update();
    controls.addEventListener('change', this.update);
  }

  update() {
    if (!this.isStop) {
      if (this.isAr) {
        if (this.source.ready === false) {
          return;
        }
        this.context.update(this.source.domElement);
      }
      renderer.render(scene, camera);
    }
  }

  get domElement() {
    return renderer.domElement;
  }

  render() {
    const { isLoading } = this.state;
    return (
      <div
        className={classNames('ar-layer__wrapper', {
          'ar-layer__wrapper--loading': isLoading
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
  getImage: PropTypes.func.isRequired
};
