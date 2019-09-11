import React, { Component } from 'react';
import PropTypes from 'prop-types';

const { min } = Math;

export default class Frame extends Component {
  render() {
    const { width, height, clipSize, clipRatio, thickness, color, children } = this.props;
    return (
      <div
        className='frame'
        style={{
          backgroundColor: color ? `rgb(${color.value.join(',')})` : null
        }}
      >
        {color && clipSize ? (
          <div
            className='frame__clip'
            style={{
              width: `${min(width, height) * clipSize}px`,
              borderWidth: thickness ? `${thickness}px` : null
            }}
          >
            <div
              className='frame__inner'
              style={{
                paddingTop: `${(1 / clipRatio) * 100}%`
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
