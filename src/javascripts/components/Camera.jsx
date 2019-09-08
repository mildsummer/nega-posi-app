import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { CONTRAST_LENGTH, CONTRAST_THRESHOLD_LENGTH } from '../constants/General';

const INTERVAL = 800;
const LUMINANCE_COEFFICIENT = [0.298912, 0.586611, 0.114478];

export default class Camera extends Component {
  constructor(props) {
    super(props);
    this.update = this.update.bind(this);
    this.onResize = this.onResize.bind(this);
    window.addEventListener('resize', this.onResize);
    this.state = {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  componentDidMount() {
    // this.init();
  }

  componentDidUpdate() {
    this.update();
  }

  init() {
    window.navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: 'environment' } } })
      .then((stream) => {
        this.video.srcObject = stream;
      })
      .catch(() => {
        window.navigator.mediaDevices.getUserMedia({ video: true })
          .then((stream) => {
            this.video.srcObject = stream;
          })
          .catch((error) => {
            console.error(error);
          });
      });
    this.video.onloadedmetadata = () => {
      this.video.play().catch((error) => {
        console.error(error);
      });
      this.update();
      this.tick = window.setInterval(this.update, INTERVAL);
      // window.setTimeout(() => {
      //   window.clearInterval(this.tick);
      // }, 2000);
    };
  }

  update() {
    const { width, height } = this.state;
    const { baseColor, drawingColor, contrast, contrastThreshold, inversion } = this.props;
    const videoWidth = this.video.videoWidth;
    const videoHeight = this.video.videoHeight;
    if (videoWidth / videoHeight > width / height) {
      const w = videoWidth * (height / videoHeight);
      this.context.drawImage(this.video, (width - w) / 2, 0, w, height);
    } else {
      const h = videoHeight * (width / videoWidth);
      this.context.drawImage(this.video, 0, (height - h) / 2, width, h);
    }
    const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    const contrastThresholdValue = 255 * contrastThreshold / CONTRAST_THRESHOLD_LENGTH;
      for (let i = 0; i < data.length; i += 4) {
      let lightness = (data[i] * LUMINANCE_COEFFICIENT[0]
        + data[i + 1] * LUMINANCE_COEFFICIENT[1]
        + data[i + 2] * LUMINANCE_COEFFICIENT[2]);
      lightness = (lightness - contrastThresholdValue)
        * (CONTRAST_LENGTH + contrast) / CONTRAST_LENGTH + contrastThresholdValue;
      lightness /= 255;
      lightness = Math.max(0, Math.min(1, lightness));
      lightness = inversion ? (1 - lightness) : lightness;
      data[i] = Math.round(lightness * baseColor.value[0] + (1 - lightness) * drawingColor.value[0]);
      data[i + 1] = Math.round(lightness * baseColor.value[1] + (1 - lightness) * drawingColor.value[1]);
      data[i + 2] = Math.round(lightness * baseColor.value[2] + (1 - lightness) * drawingColor.value[2]);
    }
    this.context.putImageData(imageData, 0, 0);
  }

  onResize() {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight
    }, this.update);
  }

  render() {
    const { width, height } = this.state;
    const { onClick } = this.props;
    return (
      <div className='camera' onClick={onClick}>
        <video
          ref={(ref) => {
            this.video = ref;
          }}
          className='camera__video'
          muted
          playsInline
          autoPlay
        />
        <canvas
          ref={(ref) => {
            if (ref) {
              this.canvas = ref;
              this.context = ref.getContext('2d');
            }
          }}
          className='camera__viewer'
          width={width}
          height={height}
        />
      </div>
    );
  }
}

Camera.propTypes = {
  baseColor: PropTypes.object.isRequired,
  drawingColor: PropTypes.object.isRequired,
  contrast: PropTypes.number.isRequired,
  contrastThreshold: PropTypes.number.isRequired,
  inversion: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired
};
