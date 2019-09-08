import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Hammer from 'react-hammerjs';
import throttle from 'lodash.throttle';
import { CONTRAST_LENGTH, CONTRAST_THRESHOLD_LENGTH } from '../constants/General';
import Histogram from './Histogram';

export default class ContrastSlider extends Component {
  constructor(props) {
    super(props);
    this.onPanStart = this.onPanStart.bind(this);
    this.onPan = throttle(this.onPan.bind(this), 150);
    this.onPanEnd = this.onPanEnd.bind(this);
    this.onClick = this.onClick.bind(this);
    this.state = {
      panning: false
    };
  }

  onPanStart() {
    const { value } = this.props;
    this.panStartValue = value;
    this.setState({
      panning: true
    });
  }

  onPan(e) {
    const { onChange, threshold } = this.props;
    if (threshold) {
      onChange(
        Math.min(CONTRAST_THRESHOLD_LENGTH,
          Math.max(0, this.panStartValue + (e.deltaX / this.container.clientWidth) * CONTRAST_THRESHOLD_LENGTH))
      );
    } else {
      onChange(
        Math.min(CONTRAST_LENGTH,
          Math.max(-CONTRAST_LENGTH, this.panStartValue + (e.deltaX / this.container.clientWidth) * CONTRAST_LENGTH * 2))
      );
    }
  }

  onPanEnd() {
    this.setState({
      panning: true
    });
  }

  onClick(e) {
    const { onChange, threshold } = this.props;
    if (threshold) {
      onChange(
        Math.min(CONTRAST_THRESHOLD_LENGTH,
          Math.max(0,
            (e.clientX - this.container.getBoundingClientRect().left) / this.container.clientWidth * CONTRAST_THRESHOLD_LENGTH))
      );
    } else {
      onChange(
        Math.min(CONTRAST_LENGTH,
          Math.max(-CONTRAST_LENGTH,
            (e.clientX - this.container.getBoundingClientRect().left) / this.container.clientWidth * CONTRAST_LENGTH * 2 - CONTRAST_LENGTH))
      );
    }
  }

  render() {
    const { panning } = this.state;
    const { value, threshold, luminanceData } = this.props;
    return (
      <div
        ref={(ref) => {
          if (ref) {
            this.container = ref;
          }
        }}
        className='slider__wrapper'
      >
        <Hammer
          onPan={this.onPan}
          onPanStart={this.onPanStart}
          onPanEnd={this.onPanEnd}
          onPanCancel={this.onPanEnd}
          options={
            {
              recognizers: {
                pan: {
                  threshold: 0
                }
              }
            }
          }
        >
          <div
            className={classNames('slider', {
              'slider--active': panning,
              'slider--threshold': threshold
            })}
            onMouseDown={this.onClick}
            onTouchStart={this.onClick}
            role='slider'
          >
            {threshold ? null : (
              <p className='slider__direction'>
                <span className='slider__direction-item'>-</span>
                <span className='slider__direction-item'>+</span>
              </p>
            )}
            <div className='slider__inner'>
              <div className='slider__base' />
              {threshold ? null : <div className='slider__origin' />}
              <div
                className='slider__value'
                style={{
                  width: threshold ? `${100 * value / CONTRAST_THRESHOLD_LENGTH}%`
                    : `${100 * (value + CONTRAST_LENGTH) / (CONTRAST_LENGTH * 2)}%`
                }}
              />
              {luminanceData ? (
                <Histogram data={luminanceData} />
              ) : null}
            </div>
          </div>
        </Hammer>
      </div>
    );
  }
}

ContrastSlider.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.number.isRequired,
  threshold: PropTypes.bool,
  luminanceData: PropTypes.arrayOf(PropTypes.number)
};
