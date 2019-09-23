import React, { Component } from 'react';
import max from 'lodash.max';
import HistogramManager from '../utils/HistogramManager';
import { LUMINANCE_DATA_UNIT } from '../constants/General';

export default class Histogram extends Component {
  constructor(props) {
    super(props);
    this.state = { data: HistogramManager.luminanceData };
    HistogramManager.on(this.update.bind(this));
  }

  shouldComponentUpdate() {
    return false;
  }

  update(data) {
    const context = this.canvas.getContext('2d');
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    context.fillStyle = 'rgba(0, 0, 0, 0.1)';
    const maxValue = max(data);
    data.forEach((value, index) => {
      if (value) {
        const length = this.canvas.height * value / maxValue;
        context.fillRect(index, this.canvas.height - length, 1, length);
      }
    });
  }

  render() {
    return (
      <canvas
        ref={(ref) => {
          if (ref) {
            this.canvas = ref;
            this.context = this.canvas.getContext('2d');
          }
        }}
        className='histogram'
        width={255 / LUMINANCE_DATA_UNIT}
        height={20}
      />
    );
  }
}
