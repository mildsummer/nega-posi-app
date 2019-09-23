import React, { Component } from 'react';
import Hammer from 'react-hammerjs';
import PropTypes from 'prop-types';

export default class AngleSlider extends Component {
  constructor(props) {
    super(props);
    this.onPan = this.onPan.bind(this);
    this.onPanEnd = this.onPanEnd.bind(this);
  }

  onPan(e) {
    if (e.center.x && e.center.y) {
      const { onChange } = this.props;
      const node = e.target;
      const rect = node.getBoundingClientRect();
      const center = [rect.left + rect.width / 2, rect.top + rect.height / 2];
      const current = [(e.center.x - center[0]), center[1] - e.center.y];
      let angle = Math.atan2(current[1], current[0]);
      if (angle < 0) {
        angle = Math.PI * 2 + angle;
      }
      onChange((Math.PI + angle) % (Math.PI * 2));
    }
  }

  onPanEnd() {
    delete this.panStartValue;
  }

  render() {
    const { value } = this.props;
    return (
      <Hammer
        onPanStart={this.onPan}
        onPan={this.onPan}
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
          className='angle-slider'
          style={{
            transform: `rotate(${-Math.round(value * 180 / Math.PI)}deg)`
          }}
          draggable={false}
        />
      </Hammer>
    );
  }
}

AngleSlider.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired
};
