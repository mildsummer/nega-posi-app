import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { LUMINANCE_COEFFICIENT } from '../constants/General';

const { min } = Math;

export default class Frame extends Component {
  render() {
    const { width, height, clipSize, clipRatio, thickness, color, children } = this.props;
    const luminance = color ? (color.value[0] * LUMINANCE_COEFFICIENT[0]
      + color.value[1] * LUMINANCE_COEFFICIENT[1]
      + color.value[2] * LUMINANCE_COEFFICIENT[2]) : 255;
    return (
      <div
        className={classNames('frame', {
          'frame--dark': luminance < 50
        })}
        style={{
          backgroundColor: color ? `rgb(${color.value.join(',')})` : null
        }}
      >
        {color ? (
          <div
            className='frame__clip'
            style={{
              width: `${min(width, height) * clipSize}px`,
              borderWidth: `${thickness}px`
            }}
          >
            <div
              className='frame__inner'
              style={{
                paddingTop: clipRatio > 0 ? `${(1 - clipRatio) * 50 + 50}%` : `${(-clipRatio + 1) * 100}%`
              }}
            >
              {children}
            </div>
          </div>
        ) : children}
      </div>
    );
  }
}

Frame.defaultProps = {
  clipSize: null,
  clipRatio: 1,
  thickness: 10,
  color: null
};

Frame.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  clipSize: PropTypes.number,
  clipRatio: PropTypes.number,
  thickness: PropTypes.number,
  color: PropTypes.object,
  children: PropTypes.any.isRequired
};
