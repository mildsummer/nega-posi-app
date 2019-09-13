import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { LUMINANCE_COEFFICIENT } from '../constants/General';

const BORDER_COLORS = {
  light: ['rgba(0, 0, 0, 0.45)', 'rgba(0, 0, 0, 0.25)', 'rgba(0, 0, 0, 0.1)', 'rgba(0, 0, 0, 0.25)'],
  dark: ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.13)', 'rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.13)']
};

export default class PictureFrame extends Component {
  shouldComponentUpdate(nextProps) {
    return nextProps.width !== this.props.width
      || nextProps.height !== this.props.height
      || nextProps.clipWidth !== this.props.clipWidth
      || nextProps.clipHeight !== this.props.clipHeight
      || nextProps.frameRatio !== this.props.frameRatio
      || nextProps.frame !== this.props.frame
      || nextProps.thickness !== this.props.thickness
      || nextProps.color !== this.props.color;
  }

  get color() {
    const { color } = this.props;
    return {
      colorString: color ? `rgb(${color.value.join(',')})` : null,
      luminance: (color && (color.value[0] * LUMINANCE_COEFFICIENT[0]
        + color.value[1] * LUMINANCE_COEFFICIENT[1]
        + color.value[2] * LUMINANCE_COEFFICIENT[2])) < 50 ? 'dark' : 'light'
    };
  }

  get clipSize() {
    const { frameWidth, frameHeight } = this.frameSize;
    const { color, clipWidth, clipHeight } = this.props;
    return {
      clipWidth: color ? frameWidth * clipWidth : frameWidth,
      clipHeight: color ? frameHeight * clipHeight : frameHeight
    };
  }

  get frameSize() {
    const { width, height, frameRatio } = this.props;
    const frameWidth = frameRatio > height / width ? height / frameRatio : width;
    const frameHeight = frameRatio < height / width ? width * frameRatio : height;
    return { frameWidth, frameHeight };
  }

  get canvas() {
    const { thickness, color } = this.props;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const { colorString, luminance } = this.color;
    const { frameWidth, frameHeight } = this.frameSize;
    const { clipWidth, clipHeight } = this.clipSize;
    canvas.width = frameWidth;
    canvas.height = frameHeight;
    if (color) {
      const leftTop = [(frameWidth - clipWidth) / 2, (frameHeight - clipHeight) / 2];
      const rightTop = [(frameWidth - clipWidth) / 2 + clipWidth, (frameHeight - clipHeight) / 2];
      const rightBottom = [(frameWidth - clipWidth) / 2 + clipWidth, (frameHeight - clipHeight) / 2 + clipHeight];
      const leftBottom = [(frameWidth - clipWidth) / 2, (frameHeight - clipHeight) / 2 + clipHeight];
      context.fillStyle = colorString;
      context.fillRect(0, 0, frameWidth, frameHeight);
      context.fillStyle = BORDER_COLORS[luminance][0];
      context.beginPath();
      context.moveTo(leftTop[0] - thickness, leftTop[1] - thickness);
      context.lineTo(rightTop[0] + thickness, rightTop[1] - thickness);
      context.lineTo(rightTop[0] - 1, rightTop[1] + 1);
      context.lineTo(leftTop[0] + 1, leftTop[1] + 1);
      context.closePath();
      context.fill();
      context.fillStyle = BORDER_COLORS[luminance][1];
      context.beginPath();
      context.moveTo(rightTop[0] + thickness, rightTop[1] - thickness);
      context.lineTo(rightBottom[0] + thickness, rightBottom[1] + thickness);
      context.lineTo(rightBottom[0] - 1, rightBottom[1] - 1);
      context.lineTo(rightTop[0] - 1, rightTop[1] + 1);
      context.closePath();
      context.fill();
      context.fillStyle = BORDER_COLORS[luminance][2];
      context.beginPath();
      context.moveTo(rightBottom[0] + thickness, rightBottom[1] + thickness);
      context.lineTo(leftBottom[0] - thickness, leftBottom[1] + thickness);
      context.lineTo(leftBottom[0] + 1, leftBottom[1] - 1);
      context.lineTo(rightBottom[0] - thickness, rightBottom[1] - thickness);
      context.closePath();
      context.fill();
      context.fillStyle = BORDER_COLORS[luminance][3];
      context.beginPath();
      context.moveTo(leftBottom[0] - thickness, leftBottom[1] + thickness);
      context.lineTo(leftBottom[0] + 1, leftBottom[1] - 1);
      context.lineTo(leftTop[0] + 1, leftTop[1] + 1);
      context.lineTo(leftTop[0] - thickness, leftTop[1] - thickness);
      context.closePath();
      context.fill();
      context.clearRect(leftTop[0], leftTop[1], clipWidth, clipHeight);
    // } else {
    }
    return canvas;
  }

  render() {
    const { thickness, color, frame, children } = this.props;
    const { colorString, luminance } = this.color;
    const { clipWidth, clipHeight } = this.clipSize;
    const { frameWidth, frameHeight } = this.frameSize;
    return (
      <div className='frame__wrapper'>
        <div
          className='frame'
          style={{
            width: `${frameWidth}px`,
            height: `${frameHeight}px`,
            backgroundColor: colorString
          }}
        >
          {color || frame ? (
            <div
              className='frame__clip'
              style={{
                width: `${clipWidth}px`,
                height: `${clipHeight}px`,
                borderWidth: `${thickness}px`,
                borderTopColor: BORDER_COLORS[luminance][0],
                borderRightColor: BORDER_COLORS[luminance][1],
                borderBottomColor: BORDER_COLORS[luminance][2],
                borderLeftColor: BORDER_COLORS[luminance][3],
                border: color ? null : 'none'
              }}
            >
              <div className='frame__inner'>
                {children}
              </div>
            </div>
          ) : children}
        </div>
      </div>
    );
  }
}

PictureFrame.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  clipWidth: PropTypes.number,
  clipHeight: PropTypes.number,
  frame: PropTypes.object,
  frameRatio: PropTypes.number,
  thickness: PropTypes.number,
  color: PropTypes.object,
  children: PropTypes.any.isRequired
};
