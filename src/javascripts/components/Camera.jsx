import React, { PureComponent, createRef } from 'react';
import PropTypes from 'prop-types';
import Hammer from 'react-hammerjs';
import classNames from 'classnames';
import { getDevice, getMediaManifest, throttle } from '../utils/Utils';
import Renderer from './GLRenderer';
import PictureFrame from './PictureFrame';
import ARMode from './ARMode';

export default class Camera extends PureComponent {
  constructor(props) {
    super(props);
    this.update = this.update.bind(this);
    this.getImage = this.getImage.bind(this);
    this.onResize = this.onResize.bind(this);
    this.start = this.start.bind(this);
    this.isSP = getDevice() === 'sp';
    window.addEventListener('resize', throttle(this.onResize, 500));
    this.ratio = this.isSP ? window.devicePixelRatio : 1;
    this.canvasRef = createRef();
    this.videoRef = createRef();
    this.state = {
      init: false,
      width: window.innerWidth * this.ratio,
      height: window.innerHeight * this.ratio,
      videoWidth: 0,
      videoHeight: 0
    };
  }

  get canvas() {
    return this.canvasRef.current;
  }

  get video() {
    return this.videoRef.current;
  }

  componentDidMount() {
    this.init();
  }

  componentDidUpdate(prevProps) {
    const { pause, isARMode } = this.props;
    if (prevProps.isARMode !== isARMode || prevProps.pause !== pause) {
      if (!prevProps.isARMode && isARMode) {
        this.cacheSource();
      } else if (!isARMode && prevProps.isARMode) {
        delete this.cacheCanvas;
      }
      if (pause) {
        this.pause();
      } else if (!pause) {
        this.start();
      }
    } else {
      this.update(false);
    }
  }

  init() {
    const { data } = this.props;
    window.navigator.mediaDevices.getUserMedia(getMediaManifest())
      .then((stream) => {
        this.video.srcObject = stream;
        this.setState({ init: true });
      })
      .catch(() => {
        window.navigator.mediaDevices.getUserMedia(getMediaManifest(true))
          .then((stream) => {
            this.video.srcObject = stream;
            this.setState({ init: true });
          })
          .catch((error) => {
            console.error(error);
          });
      });
    this.video.onloadedmetadata = () => {
      this.setState({
        videoWidth: this.video.videoWidth,
        videoHeight: this.video.videoHeight
      }, () => {
        this.renderer = new Renderer(this.canvasRef, this.videoRef, data);
        this.start();
      });
    };
  }

  update(af = true) {
    const { pause, isARMode, data } = this.props;
    if (this.renderer) {
      this.renderer.render(data, this.cacheCanvas || null);
    }
    if (!pause && !isARMode && af) {
      this.tick = window.requestAnimationFrame(this.update);
    } else {
      delete this.tick;
    }
  }

  onResize() {
    const width = window.innerWidth * this.ratio;
    const height = window.innerHeight * this.ratio;
    this.setState({ width, height });
  }

  pause() {
    window.cancelAnimationFrame(this.tick);
    delete this.tick;
    this.video.pause();
  }

  start() {
    if (this.video.paused) {
      this.video.play().catch((error) => {
        console.error(error);
      });
    }
    const { isARMode } = this.props;
    if (!isARMode && !this.tick) {
      this.update(true);
    }
    // window.setTimeout(() => {
    //   this.pause();
    // }, 2000);
  }

  getImage(callback) {
    const { videoWidth, videoHeight } = this.state;
    const { data } = this.props;
    const { mat, frame } = data;
    const { clipWidth, clipHeight, clipTop, clipLeft } = this.frame.marginedRect;
    const { frameWidth, frameHeight } = this.frame.frameSize;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = frameWidth;
    canvas.height = frameHeight;
    if (mat || frame) {
      if (videoWidth / videoHeight > clipWidth / clipHeight) {
        const clipSize = videoWidth * (clipHeight / videoHeight);
        context.drawImage(
          this.canvas,
          clipLeft - (clipSize - clipWidth) / 2,
          clipTop,
          clipSize,
          clipHeight
        );
      } else {
        const clipSize = videoHeight * (clipWidth / videoWidth);
        context.drawImage(
          this.canvas,
          clipLeft,
          clipTop - (clipSize - clipHeight) / 2,
          clipWidth,
          clipSize
        );
      }
      context.resetTransform();
      context.drawImage(this.frame.canvas, 0, 0);
      callback(canvas.toDataURL('image/jpeg'), frameWidth, frameHeight);
    } else {
      callback((this.cacheCanvas || this.canvas).toDataURL('image/jpeg'), frameWidth, frameHeight);
    }
  }

  getARImage() {
    const { isBlend, offsetX, offsetY } = this.props;
    const { width, height, videoWidth, videoHeight } = this.state;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (videoWidth / videoHeight > width / height) {
      const w = videoWidth * (height / videoHeight);
      context.drawImage(this.video, (width - w) / 2, 0, w, height);
    } else {
      const h = videoHeight * (width / videoWidth);
      context.drawImage(this.video, 0, (height - h) / 2, width, h);
    }
    if (isBlend) {
      context.globalCompositeOperation = 'multiply';
    }
    context.drawImage(this.ar.domElement, offsetX, offsetY, width, height);
    return canvas.toDataURL('image/jpeg');
  }

  cacheSource() {
    const cacheCanvas = document.createElement('canvas');
    cacheCanvas.width = this.canvas.width;
    cacheCanvas.height = this.canvas.height;
    const context = cacheCanvas.getContext('2d');
    context.drawImage(this.canvas, 0, 0);
    this.cacheCanvas = cacheCanvas;
  }

  render() {
    const { init, width, height, videoWidth, videoHeight } = this.state;
    const { onClick, data, pause, isARMode, isBlend, shadeAngle, offsetX, offsetY } = this.props;
    const { base, mat, clipSize, clipRatio, clipVerticalPosition, matThickness, frame, frameRatio, margin, frameType, frameBorderWidth } = data;
    return (
      <Hammer onTap={onClick}>
        <div
          className={classNames('camera', {
            'camera--paused': pause,
            'camera--init': init,
            'camera--ar': isARMode
          })}
        >
          <p className='camera__description'>
            This app needs a permission of your camera &#x1f4f7;
          </p>
          {isARMode ? (
            <ARMode
              ref={(ref) => {
                this.ar = ref;
              }}
              data={data}
              getImage={this.getImage}
              isBlend={isBlend}
              shadeAngle={shadeAngle}
              offsetX={offsetX}
              offsetY={offsetY}
            />
          ) : null}
          <video
            ref={this.videoRef}
            className='camera__video'
            muted
            playsInline
            autoPlay
          />
          <PictureFrame
            ref={(ref) => {
              if (ref) {
                this.frame = ref;
              }
            }}
            width={width}
            height={height}
            clipSize={clipSize}
            clipRatio={clipRatio}
            clipVerticalPosition={clipVerticalPosition}
            thickness={matThickness}
            color={mat}
            frame={frame}
            frameRatio={frameRatio}
            frameBorderWidth={frameBorderWidth}
            base={base}
            margin={margin}
            frameType={frameType}
            pixelRatio={this.ratio}
          >
            <canvas
              ref={this.canvasRef}
              className='camera__viewer'
              width={videoWidth}
              height={videoHeight}
            />
          </PictureFrame>
        </div>
      </Hammer>
    );
  }
}

Camera.propTypes = {
  data: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  pause: PropTypes.bool.isRequired,
  isARMode: PropTypes.bool.isRequired,
  isBlend: PropTypes.bool.isRequired,
  shadeAngle: PropTypes.number.isRequired,
  offsetX: PropTypes.number.isRequired,
  offsetY: PropTypes.number.isRequired,
  init: PropTypes.bool
};
