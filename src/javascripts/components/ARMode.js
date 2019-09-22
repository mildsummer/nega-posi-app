import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
const { THREE, THREEx } = window;

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

  initScene() {
    const container = this.wrapper.parentNode;
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      localClippingEnabled: true
    });
    this.renderer.setClearColor(new THREE.Color('black'), 0);
    this.renderer.setSize(640, 480);
    this.renderer.domElement.classList.add('ar-layer');
    this.wrapper.appendChild(this.renderer.domElement);
    this.camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 1000);
    this.camera.lookAt(0, 0, 0);
    this.camera.position.set(0, 0, 10);
    this.controls = new THREE.OrbitControls(this.camera, container);
    this.controls.update();
    this.scene.add(this.camera);
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
    this.scene.add(this.contents);
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
      this.camera.projectionMatrix.copy(this.context.getProjectionMatrix());
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
      this.source.copyElementSizeTo(this.renderer.domElement);
      if(this.context.arController !== null){
        this.source.copyElementSizeTo(this.context.arController.canvas);
      }
    } else {
      const width = window.innerWidth || document.documentElement.clientWidth;
      const height = window.innerHeight || document.documentElement.clientHeight;
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(width, height);
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }
    this.update();
  }

  startAr() {
    this.controls.reset();
    this.controls.dispose();
    this.camera = new THREE.Camera();
    this.scene.remove(this.camera);
    this.initArToolkit();
    this.initMarker();
    this.isAr = true;
  }

  start() {
    this.isStop = false;
    this.update();
    this.controls.addEventListener('change', this.update);
  }

  update() {
    if (!this.isStop) {
      if (this.isAr) {
        if (this.source.ready === false) {
          return;
        }
        this.context.update(this.source.domElement);
      }
      this.renderer.render(this.scene, this.camera);
    }
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
