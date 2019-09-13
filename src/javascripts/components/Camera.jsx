import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import throttle from 'lodash.throttle';
import { CONTRAST_LENGTH, CONTRAST_THRESHOLD_LENGTH, LUMINANCE_DATA_UNIT,
  LUMINANCE_COEFFICIENT, LUMINANCE_DATA_INTERVAL } from '../constants/General';
import { getDevice, getMediaManifest } from '../utils/Utils';
import HistogramManager from '../utils/HistogramManager';
import CameraWorker from 'worker-loader?inline&name=worker.js!../worker';
import PictureFrame from './PictureFrame';

const INTERVAL = 80;

export default class Camera extends Component {
  constructor(props) {
    super(props);
    this.update = this.update.bind(this);
    this.onResize = this.onResize.bind(this);
    this.start = this.start.bind(this);
    this.isSP = getDevice() === 'sp';
    window.addEventListener('resize', throttle(this.onResize, 500));
    this.ratio = this.isSP ? window.devicePixelRatio : 1;
    if (window.Worker) {
      this.worker = new CameraWorker;
      this.worker.onmessage = this.onWorkerMessage.bind(this);
      this.hasPostedToWorker = false;
    }
    this.state = {
      init: false,
      width: window.innerWidth * this.ratio,
      height: window.innerHeight * this.ratio
    };
  }

  shouldUpdate(nextProps, nextState) {
    return nextProps.data !== this.props.data
    || nextProps.pause !== this.props.pause
    || nextState.width !== this.state.width
    || nextState.height !== this.state.height
    || nextState.init !== this.state.init;
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.shouldUpdate(nextProps, nextState);
  }

  componentDidMount() {
    this.init();
  }

  componentDidUpdate() {
    const { pause } = this.props;
    if (pause && this.tick) {
      this.pause();
    } else if (!pause && !this.tick) {
      this.start();
    } else {
      this.update();
    }
  }

  init() {
    window.navigator.mediaDevices.getUserMedia(getMediaManifest())
      .then((stream) => {
        this.video.srcObject = stream;
        this.setState({ init: true });
      })
      .catch((error) => {
        console.error(error);
      });
    this.video.onloadedmetadata = this.start;
  }

  update() {
    if (!this.worker || !this.hasPostedToWorker) {
      const { width, height } = this.state;
      const { base, drawing, contrast, contrastThreshold, inversion } = this.props.data;
      const videoWidth = this.video.videoWidth;
      const videoHeight = this.video.videoHeight;
      const context = (this.dummyCanvas || this.canvas).getContext('2d');
      if (videoWidth / videoHeight > width / height) {
        const w = videoWidth * (height / videoHeight);
        context.drawImage(this.video, (width - w) / 2, 0, w, height);
      } else {
        const h = videoHeight * (width / videoWidth);
        context.drawImage(this.video, 0, (height - h) / 2, width, h);
      }
      const imageData = context.getImageData(0, 0, this.canvas.width, this.canvas.height);
      if (this.worker) {
        this.hasPostedToWorker = true;
        this.worker.postMessage({
          imageData,
          base,
          drawing,
          inversion,
          contrast,
          contrastThreshold,
          CONTRAST_LENGTH,
          CONTRAST_THRESHOLD_LENGTH,
          LUMINANCE_COEFFICIENT,
          LUMINANCE_DATA_INTERVAL,
          LUMINANCE_DATA_UNIT
        // }, [imageData.data.buffer]);
        });
      } else {
        const data = imageData.data;
        const luminanceData = [];
        const contrastThresholdValue = 255 * contrastThreshold / CONTRAST_THRESHOLD_LENGTH;
        for (let i = 0; i < data.length; i += 4) {
          let luminance = (data[i] * LUMINANCE_COEFFICIENT[0]
            + data[i + 1] * LUMINANCE_COEFFICIENT[1]
            + data[i + 2] * LUMINANCE_COEFFICIENT[2]);
          if (i / 4 % LUMINANCE_DATA_INTERVAL === 0) {
            const luminanceIndex = Math.round(luminance / LUMINANCE_DATA_UNIT);
            luminanceData[luminanceIndex] = (luminanceData[luminanceIndex] || 0) + 1;
          }
          luminance = (luminance - contrastThresholdValue)
            * (CONTRAST_LENGTH + contrast) / CONTRAST_LENGTH + contrastThresholdValue;
          luminance /= 255;
          luminance = Math.max(0, Math.min(1, luminance));
          luminance = inversion ? (1 - luminance) : luminance;
          data[i] = Math.round(luminance * base.value[0] + (1 - luminance) * drawing.value[0]);
          data[i + 1] = Math.round(luminance * base.value[1] + (1 - luminance) * drawing.value[1]);
          data[i + 2] = Math.round(luminance * base.value[2] + (1 - luminance) * drawing.value[2]);
        }
        context.putImageData(imageData, 0, 0);
        HistogramManager.update(luminanceData);
      }
    }
  }

  onWorkerMessage(e) {
    const context = this.canvas.getContext('2d');
    context.putImageData(e.data.imageData, 0, 0);
    HistogramManager.update(e.data.luminanceData);
    this.hasPostedToWorker = false;
  }

  onResize() {
    this.setState({
      width: window.innerWidth * this.ratio,
      height: window.innerHeight * this.ratio
    });
  }

  pause() {
    window.clearInterval(this.tick);
    delete this.tick;
    this.video.pause();
  }

  start() {
    if (!this.tick && this.video.paused) {
      this.video.play().catch((error) => {
        console.error(error);
      });
      this.tick = window.setInterval(this.update, INTERVAL);
      this.update();
    }
    window.setTimeout(() => {
      this.pause();
    }, 2000);
  }

  getImage(callback) {
    const { width, height } = this.state;
    const { data } = this.props;
    const { flip, mat } = data;
    const { clipWidth, clipHeight } = this.frame.clipSize;
    if (flip || mat) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = width;
      canvas.height = height;
      const imageObject = new Image();
      imageObject.onload = () => {
        if (flip) {
          context.translate(width, 0);
          context.scale(-1, 1);
        }
        if (width / height > clipWidth / clipHeight) {
          const clipSize = width * (clipHeight / height);
          context.drawImage(
            imageObject,
            (width - clipWidth) / 2 - (clipSize - clipWidth) / 2,
            (height - clipHeight) / 2,
            clipSize,
            clipHeight
          );
        } else {
          const clipSize = height * (clipWidth / width);
          context.drawImage(
            imageObject,
            (width - clipWidth) / 2,
            (height - clipHeight) / 2 - (clipSize - clipHeight) / 2,
            clipWidth,
            clipSize
          );
        }
        context.resetTransform();
        context.drawImage(this.frame.canvas, 0, 0);
        callback(canvas.toDataURL('image/jpeg'));
      };
      imageObject.src = this.canvas.toDataURL();
    } else {
      callback(this.canvas.toDataURL('image/jpeg'));
    }
  }

  render() {
    const { init, width, height } = this.state;
    const { data, onClick, pause } = this.props;
    const { flip, mat, clipWidth, clipHeight, matThickness } = data;
    return (
      <div
        className={classNames('camera', {
          'camera--paused': pause,
          'camera--init': init,
          'camera--flip': flip
        })}
        onClick={onClick}
      >
        <p className='camera__description'>
          This app needs a permission of your camera &#x1f4f7;
        </p>
        <video
          ref={(ref) => {
            this.video = ref;
          }}
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
          clipWidth={clipWidth}
          clipHeight={clipHeight}
          thickness={matThickness}
          color={mat}
        >
          <canvas
            ref={(ref) => {
              if (ref) {
                this.canvas = ref;
              }
            }}
            className='camera__viewer'
            width={width}
            height={height}
          />
        </PictureFrame>
        {this.worker ? (
          <canvas
            ref={(ref) => {
              if (ref) {
                this.dummyCanvas = ref;
              }
            }}
            className='camera__dummy'
            width={width}
            height={height}
          />
        ) : null}
      </div>
    );
  }
}

Camera.propTypes = {
  data: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  pause: PropTypes.bool.isRequired,
  init: PropTypes.bool
};
