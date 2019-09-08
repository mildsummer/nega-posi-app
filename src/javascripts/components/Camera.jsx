import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { CONTRAST_LENGTH, CONTRAST_THRESHOLD_LENGTH, LUMINANCE_DATA_UNIT } from '../constants/General';

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

  shouldComponentUpdate(nextProps) {
    return nextProps.baseColor !== this.props.baseColor
      || nextProps.drawingColor !== this.props.drawingColor
      || nextProps.contrast !== this.props.contrast
      || nextProps.contrastThreshold !== this.props.contrastThreshold
      || nextProps.inversion !== this.props.inversion;
  }

  componentDidMount() {
    this.init();
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
    const { baseColor, drawingColor, contrast, contrastThreshold, inversion, onUpdate } = this.props;
    const videoWidth = this.video.videoWidth;
    const videoHeight = this.video.videoHeight;
    const context = this.canvas.getContext('2d');
    if (videoWidth / videoHeight > width / height) {
      const w = videoWidth * (height / videoHeight);
      context.drawImage(this.video, (width - w) / 2, 0, w, height);
    } else {
      const h = videoHeight * (width / videoWidth);
      context.drawImage(this.video, 0, (height - h) / 2, width, h);
    }
    const imageData = context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    const luminanceData = [];
    const contrastThresholdValue = 255 * contrastThreshold / CONTRAST_THRESHOLD_LENGTH;
      for (let i = 0; i < data.length; i += 4) {
      let luminance = (data[i] * LUMINANCE_COEFFICIENT[0]
        + data[i + 1] * LUMINANCE_COEFFICIENT[1]
        + data[i + 2] * LUMINANCE_COEFFICIENT[2]);
      const luminanceIndex = Math.round(luminance / LUMINANCE_DATA_UNIT);
      luminanceData[luminanceIndex] = (luminanceData[luminanceIndex] || 0) + 1;
      luminance = (luminance - contrastThresholdValue)
        * (CONTRAST_LENGTH + contrast) / CONTRAST_LENGTH + contrastThresholdValue;
      luminance /= 255;
      luminance = Math.max(0, Math.min(1, luminance));
      luminance = inversion ? (1 - luminance) : luminance;
      data[i] = Math.round(luminance * baseColor.value[0] + (1 - luminance) * drawingColor.value[0]);
      data[i + 1] = Math.round(luminance * baseColor.value[1] + (1 - luminance) * drawingColor.value[1]);
      data[i + 2] = Math.round(luminance * baseColor.value[2] + (1 - luminance) * drawingColor.value[2]);
    }
    context.putImageData(imageData, 0, 0);
    onUpdate(luminanceData);
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
          key='canvas'
          ref={(ref) => {
            if (ref) {
              this.canvas = ref;
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
  onClick: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired
};
