import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import find from 'lodash.find';
import Tap from './Tap';
import { LUMINANCE_COEFFICIENT } from '../constants/General';

export default class FrameList extends Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.canvasArray = [];
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.selected !== this.props.selected
      || nextProps.frameColor !== this.props.frameColor;
  }

  componentDidMount() {
    const { selected } = this.props;
    if (this.element) {
      const selectedElement = selected && this.element.querySelector(`[data-frame-type-name='${selected.name}']`);
      if (selectedElement) {
        this.element.scrollLeft = selectedElement.getBoundingClientRect().left
          - this.element.getBoundingClientRect().left
          - this.element.offsetWidth / 2
          + selectedElement.offsetWidth / 2;
      }
    }
    this.drawFrames();
  }

  componentDidUpdate() {
    this.drawFrames();
  }

  onChange(e) {
    const { data, onChange } = this.props;
    const name = e.target.getAttribute('data-frame-type-name');
    onChange(find(data, { name }) || null);
  }

  scrollLeft() {
    this.element.scrollLeft = 0;
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

  drawFrames() {
    const { data } = this.props;
    this.canvasArray.forEach((canvas, index) => {
      this.drawFrame(data[index], canvas);
    });
  }

  drawFrame(type, canvas) {
    const { frameColor } = this.props;
    const frame = frameColor || { value: [255, 255, 255] };
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    const luminance = (frame.value[0] * LUMINANCE_COEFFICIENT[0]
      + frame.value[1] * LUMINANCE_COEFFICIENT[1]
      + frame.value[2] * LUMINANCE_COEFFICIENT[2]);
    const frameWidth = 50;
    const frameHeight = 50;
    const frameBorderWidth = 15;
    let bezel = null;
    if (type.bezels) {
      bezel = find(type.bezels, (item) => (item.max >= luminance && item.min < luminance));
    }
    let gradientItem = null;
    if (type.gradients) {
      gradientItem = find(type.gradients, (item) => (item.max >= luminance && item.min < luminance));
    }
    for (let i = 0; i < 2; i++) {
      this.drawBorder(
        context,
        i,
        frameBorderWidth, frameBorderWidth,
        frameWidth - frameBorderWidth * 2, frameHeight - frameBorderWidth * 2,
        frameBorderWidth,
        `rgb(${frame.value.join(',')})`,
        1
      );
    }
    if (bezel) {
      context.globalCompositeOperation = bezel.composite || 'source-over';
      for (let i = 0; i < 2; i++) {
        const bezelGradient = context.createLinearGradient(
          [0, frameWidth][i],
          [0, 0][i],
          [0, frameWidth - frameBorderWidth][i],
          [frameBorderWidth, 0][i]
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
      for (let i = 0; i < 2; i++) {
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
  }

  render() {
    const { data, selected } = this.props;
    return (
      <ul
        ref={(ref) => {
          if (ref) {
            this.element = ref;
          }
        }}
        className='setting-menu__frame-list'
      >
        {data.map((type, index) => (
          <Tap
            component='li'
            key={type.name}
            className={classNames(`setting-menu__frame setting-menu__frame--${type}`, {
              'setting-menu__frame--current': selected === type
            })}
            data-frame-type-name={type.name}
            title={type.name}
            onClick={this.onChange}
          >
            {type.name}
            <canvas
              className='setting-menu__frame-canvas'
              ref={(ref) => {
                if (ref) {
                  this.canvasArray[index] = ref;
                }
              }}
              width={50} height={50}
            />
          </Tap>
        ))}
      </ul>
    );
  }
}

FrameList.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  selected: PropTypes.object,
  frameColor: PropTypes.object,
  onChange: PropTypes.func.isRequired
};
