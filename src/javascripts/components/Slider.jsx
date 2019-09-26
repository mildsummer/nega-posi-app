import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Hammer from 'react-hammerjs';
import throttle from 'lodash.throttle';
import Histogram from './Histogram';

export default class Slider extends Component {
  constructor(props) {
    super(props);
    this.onPanStart = this.onPanStart.bind(this);
    this.onPan = throttle(this.onPan.bind(this), 50);
    this.onPanEnd = this.onPanEnd.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.state = {
      panning: false
    };
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.value !== this.props.value;
  }

  onPanStart(e) {
    e.preventDefault();
    const { value } = this.props;
    this.panStartValue = value;
    this.setState({
      panning: true
    });
  }

  onPan(e) {
    e.preventDefault();
    if (e.center.x && e.center.y) {
      const { onChange, max, min } = this.props;
      onChange(
        Math.min(max,
          Math.max(min, this.panStartValue + (e.deltaX / this.base.clientWidth) * (max - min)))
      );
    }
  }

  onPanEnd() {
    this.setState({
      panning: false
    });
  }

  onTouchStart(e) {
    const { onChange, max, min } = this.props;
    const x = e.nativeEvent.clientX || e.nativeEvent.touches[0].clientX || 0;
    e.nativeEvent.preventDefault();
    onChange(
      Math.min(max,
        Math.max(min,
          (x - this.base.getBoundingClientRect().left) / this.base.clientWidth * (max - min) + min))
    );
    this.setState({
      panning: true
    });
  }

  onTouchEnd() {
    this.setState({
      panning: false
    });
  }

  render() {
    const { panning } = this.state;
    const { value, max, min, histogram } = this.props;
    return (
      <div className='slider__wrapper'>
        <Hammer
          onPan={this.onPan}
          onPanStart={this.onPanStart}
          onPanEnd={this.onPanEnd}
          onPanCancel={this.onPanEnd}
          // onTouchStart={this.onTouchStart}
          onMouseDown={this.onTouchStart}
          onTouchEnd={this.onTouchEnd}
          onMouseUp={this.onTouchEnd}
          options={
            {
              recognizers: {
                pan: {
                  threshold: 10
                }
              }
            }
          }
        >
          <div
            className={classNames('slider', {
              'slider--active': panning,
              'slider--origin': max > 0 && min < 0
            })}
            role='slider'
          >
            {max > 0 && min < 0 ? (
              <p className='slider__direction'>
                <span className='slider__direction-item'>-</span>
                <span className='slider__direction-item'>+</span>
              </p>
            ) : null}
            <div className='slider__inner'>
              <div
                className='slider__base'
                ref={(ref) => {
                  if (ref) {
                    this.base = ref;
                  }
                }}
              />
              <div className='slider__origin' />
              <div
                className='slider__value'
                style={{
                  width: `${100 * (value - min) / (max - min)}%`
                }}
              />
              {histogram ? <Histogram /> : null}
            </div>
          </div>
        </Hammer>
      </div>
    );
  }
}

Slider.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  min: PropTypes.number.isRequired,
  histogram: PropTypes.bool
};
