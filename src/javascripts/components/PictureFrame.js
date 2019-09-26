import React, { Component } from 'react';
import PropTypes from 'prop-types';
import find from 'lodash.find';
import { LUMINANCE_COEFFICIENT } from '../constants/General';

const BORDER_COLORS = {
  light: ['rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.15)', 'rgba(0, 0, 0, 0.03)', 'rgba(0, 0, 0, 0.15)'],
  dark: ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.13)', 'rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.13)']
};

export default class PictureFrame extends Component {
  shouldComponentUpdate(nextProps) {
    return nextProps.width !== this.props.width
      || nextProps.height !== this.props.height
      || nextProps.clipSize !== this.props.clipSize
      || nextProps.clipRatio !== this.props.clipRatio
      || nextProps.clipVerticalPosition !== this.props.clipVerticalPosition
      || nextProps.frameRatio !== this.props.frameRatio
      || nextProps.frameType !== this.props.frameType
      || nextProps.frame !== this.props.frame
      || nextProps.frameBorderWidth !== this.props.frameBorderWidth
      || nextProps.thickness !== this.props.thickness
      || nextProps.color !== this.props.color
      || nextProps.base !== this.props.base
      || nextProps.margin !== this.props.margin;
  }

  componentDidMount() {
    this.draw();
  }

  componentDidUpdate() {
    this.draw();
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

  get frameColor() {
    const { frame } = this.props;
    return {
      colorString: frame ? `rgb(${frame.value.join(',')})` : null,
      luminance: frame && (frame.value[0] * LUMINANCE_COEFFICIENT[0]
        + frame.value[1] * LUMINANCE_COEFFICIENT[1]
        + frame.value[2] * LUMINANCE_COEFFICIENT[2])
    };
  }

  get clipRect() {
    const { frameWidth, frameHeight } = this.frameSize;
    const { color, clipSize, clipRatio, clipVerticalPosition } = this.props;
    const clipMax = Math.min(frameWidth, frameHeight) * clipSize;
    const clipWidth = clipRatio > 0 ? clipMax / (clipRatio + 1) : clipMax;
    const clipHeight = clipRatio > 0 ? clipMax : clipMax / (-clipRatio + 1);
    const clipTop = (frameHeight - clipHeight) / 2 * (1 - clipVerticalPosition);
    const clipLeft = (frameWidth - clipWidth) / 2;
    return {
      clipTop: color ? clipTop : 0,
      clipLeft : color ? clipLeft : 0,
      clipWidth: color ? clipWidth : frameWidth,
      clipHeight: color ? clipHeight : frameHeight
    };
  }

  get marginedRect() {
    const { margin } = this.props;
    const { clipWidth, clipHeight, clipTop, clipLeft } = this.clipRect;
    return {
      clipTop: clipTop + margin,
      clipLeft: clipLeft + margin,
      clipWidth: clipWidth - margin * 2,
      clipHeight: clipHeight - margin * 2
    };
  }

  get frameSize() {
    const { width, height, frameRatio } = this.props;
    const ratio = frameRatio > 0 ? frameRatio + 1 : 1 / (-frameRatio + 1);
    const frameWidth = ratio > height / width ? height / ratio : width;
    const frameHeight = ratio < height / width ? width * ratio : height;
    return { frameWidth, frameHeight };
  }

  drawBorder(context, position, x, y, width, height, borderWidth, borderStyle, inset) {
    const leftTop = [x, y];
    const rightTop = [x + width, y];
    const rightBottom = [x + width, y + height];
    const leftBottom = [x, y + height];
    context.fillStyle = borderStyle;
    context.beginPath();
    switch (position) {
      case 0:
        context.moveTo(leftTop[0] - borderWidth, leftTop[1] - borderWidth);
        context.lineTo(rightTop[0] + borderWidth, rightTop[1] - borderWidth);
        context.lineTo(rightTop[0] - inset, rightTop[1] + inset);
        context.lineTo(leftTop[0] + inset, leftTop[1] + inset);
        break;
      case 1:
        context.moveTo(rightTop[0] + borderWidth, rightTop[1] - borderWidth);
        context.lineTo(rightBottom[0] + borderWidth, rightBottom[1] + borderWidth);
        context.lineTo(rightBottom[0] - inset, rightBottom[1] - inset);
        context.lineTo(rightTop[0] - inset, rightTop[1] + inset);
        break;
      case 2:
        context.moveTo(rightBottom[0] + borderWidth, rightBottom[1] + borderWidth);
        context.lineTo(leftBottom[0] - borderWidth, leftBottom[1] + borderWidth);
        context.lineTo(leftBottom[0] + inset, leftBottom[1] - inset);
        context.lineTo(rightBottom[0] - inset, rightBottom[1] - inset);
        break;
      case 3:
        context.moveTo(leftBottom[0] - borderWidth, leftBottom[1] + borderWidth);
        context.lineTo(leftBottom[0] + inset, leftBottom[1] - inset);
        context.lineTo(leftTop[0] + inset, leftTop[1] + inset);
        context.lineTo(leftTop[0] - borderWidth, leftTop[1] - borderWidth);
        break;
    }
    context.closePath();
    context.fill();
  }

  draw() {
    const { thickness, color, frame, base, margin, frameType, frameBorderWidth } = this.props;
    const canvas = this.canvas;
    const context = canvas.getContext('2d');
    const { colorString, luminance } = this.color;
    const { frameWidth, frameHeight } = this.frameSize;
    const { clipWidth, clipHeight, clipTop, clipLeft } = this.clipRect;
    canvas.width = frameWidth;
    canvas.height = frameHeight;
    if (color) {
      context.fillStyle = colorString;
      context.fillRect(0, 0, frameWidth, frameHeight);
      for (let i = 0; i < 4; i++) {
        this.drawBorder(
          context,
          i,
          clipLeft, clipTop,
          clipWidth, clipHeight,
          thickness,
          BORDER_COLORS[luminance][i],
          1
        );
      }
      if (margin) {
        context.fillStyle = `rgb(${base.value.join(',')})`;
        context.fillRect(clipLeft, clipTop, clipWidth, clipHeight);

        ///// plate mark
        if (margin > 8) {
          context.shadowOffsetX = 0;
          context.shadowOffsetY = 0;
          context.shadowBlur = 3;
          context.shadowColor = 'rgba(0, 0, 0, 0.08)';
          const gradient = context.createLinearGradient(
            clipLeft + margin - 3,
            clipTop + margin - 3,
            clipLeft + margin - 6 + clipWidth - margin * 2 + 6,
            clipTop + margin - 6 + clipHeight - margin * 2 + 6
          );
          context.fillRect(
            clipLeft + margin - 3,
            clipTop + margin - 3,
            clipWidth - margin * 2 + 6,
            clipHeight - margin * 2 + 6
          );
          gradient.addColorStop(0, 'rgba(0, 0, 0, 0.02)');
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
          context.strokeStyle = gradient;
          context.lineWidth = 2;
          context.lineJoin = 'round';
          context.strokeRect(
            clipLeft + margin - 3,
            clipTop + margin - 3,
            clipWidth - margin * 2 + 6,
            clipHeight - margin * 2 + 6
          );
          context.fillStyle = 'rgb(0, 0, 0, 0.02)';
          context.fillRect(
            clipLeft + margin - 3,
            clipTop + margin - 3,
            clipWidth - margin * 2 + 6,
            clipHeight - margin * 2 + 6
          );
        }
        /////

        context.clearRect(
          clipLeft + margin,
          clipTop + margin,
          clipWidth - margin * 2,
          clipHeight - margin * 2
        );
      } else {
        context.clearRect(clipLeft, clipTop, clipWidth, clipHeight);
      }
    }

    // frame
    if (frame) {
      const frameColor = this.frameColor;
      context.strokeStyle = frameColor.colorString;
      context.lineWidth = frameBorderWidth;
      context.shadowOffsetX = 3;
      context.shadowOffsetY = 5;
      context.shadowBlur = 2;
      context.shadowColor = 'rgba(20, 10, 0, 0.2)';
      context.strokeRect(frameBorderWidth / 2, frameBorderWidth / 2, frameWidth - frameBorderWidth, frameHeight - frameBorderWidth);
      context.shadowOffsetX = 0;
      context.shadowOffsetY = 10;
      context.shadowBlur = 5;
      context.shadowColor = 'rgba(20, 10, 0, 0.1)';
      context.strokeRect(frameBorderWidth / 2, frameBorderWidth / 2, frameWidth - frameBorderWidth, frameHeight - frameBorderWidth);
      context.shadowOffsetX = 0;
      context.shadowOffsetY = 0;
      context.shadowBlur = 0;
      context.shadowColor = '';
      let bezel = null;
      if (frameType.bezels) {
        bezel = find(frameType.bezels, (item) => (item.max >= frameColor.luminance && item.min < frameColor.luminance));
      }
      let gradientItem = null;
      if (frameType.gradients) {
        gradientItem = find(frameType.gradients, (item) => (item.max >= frameColor.luminance && item.min < frameColor.luminance));
      }
      for (let i = 0; i < 4; i++) {
        this.drawBorder(
          context,
          i,
          frameBorderWidth, frameBorderWidth,
          frameWidth - frameBorderWidth * 2, frameHeight - frameBorderWidth * 2,
          frameBorderWidth,
          frameColor.colorString,
          1
        );
      }
      if (bezel) {
        context.globalCompositeOperation = bezel.composite || 'source-over';
        for (let i = 0; i < 4; i++) {
          const bezelGradient = context.createLinearGradient(
            [500, frameWidth, 0, 0][i],
            [0, 0, frameHeight, 0][i],
            [500, frameWidth - frameBorderWidth, 0, frameBorderWidth][i],
            [frameBorderWidth, 0, frameHeight - frameBorderWidth, 0][i]
          );
          bezel.value[i].forEach((stopColor, index) => {
            bezelGradient.addColorStop(index / (bezel.value[i].length - 1), stopColor);
          });
          this.drawBorder(
            context,
            i,
            frameBorderWidth, frameBorderWidth,
            frameWidth - frameBorderWidth * 2, frameHeight - frameBorderWidth * 2,
            frameBorderWidth,
            bezelGradient,
            1
          );
        }
      }
      if (gradientItem) {
        context.globalCompositeOperation = gradientItem.composite || 'source-over';
        for (let i = 0; i < 4; i++) {
          const isVertical = i === 1 || i === 3;
          const gradient = context.createLinearGradient(0, 0, isVertical ? 0 : frameWidth, isVertical ? frameHeight : 0);
          gradientItem.value[i].forEach((stopColor, index) => {
            gradient.addColorStop(index / (gradientItem.value[i].length - 1), stopColor);
          });
          this.drawBorder(
            context,
            i,
            frameBorderWidth, frameBorderWidth,
            frameWidth - frameBorderWidth * 2, frameHeight - frameBorderWidth * 2,
            frameBorderWidth,
            gradient,
            1
          );
        }
      }
      context.globalCompositeOperation = 'source-over';
    }
  }

  render() {
    const { color, frame, children, margin, pixelRatio, base } = this.props;
    const { clipWidth, clipHeight, clipTop, clipLeft } = this.clipRect;
    const { frameWidth, frameHeight } = this.frameSize;
    return (
      <div className='frame__wrapper'>
        <div
          className='frame'
          style={{
            width: frameWidth / pixelRatio,
            height: frameHeight / pixelRatio,
            backgroundColor: `rgb(${base.value.join(',')})`
          }}
        >
          <div className='frame__shadow' />
          <canvas
            ref={(ref) => {
              if (ref) {
                this.canvas = ref;
              }
            }}
            className='frame__canvas'
            width={frameWidth}
            height={frameHeight}
          />
          {color || frame ? (
            <div
              className='frame__clip'
              style={{
                width: `${clipWidth / pixelRatio}px`,
                height: `${clipHeight / pixelRatio}px`,
                top: clipTop,
                left: clipLeft,
                padding: margin / pixelRatio
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
  clipSize: PropTypes.number,
  clipRatio: PropTypes.number,
  clipVerticalPosition: PropTypes.number,
  frame: PropTypes.object,
  frameRatio: PropTypes.number,
  frameType: PropTypes.object,
  frameBorderWidth: PropTypes.number,
  thickness: PropTypes.number,
  color: PropTypes.object,
  base: PropTypes.object,
  margin: PropTypes.number.isRequired,
  children: PropTypes.any.isRequired,
  pixelRatio: PropTypes.number.isRequired
};
