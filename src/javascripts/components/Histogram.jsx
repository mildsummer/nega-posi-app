import React, { Component } from 'react';
import PropTypes from 'prop-types';
import max from 'lodash.max';
import { LUMINANCE_DATA_UNIT } from '../constants/General';

export default class Histogram extends Component {
  constructor(props) {
    super(props);
    this.update = this.update.bind(this);
    this.onResize = this.onResize.bind(this);
    this.state = {
      width: null,
      height: null
    };
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.data !== this.props.data;
  }

  componentDidMount() {
    window.setTimeout(() => {
      this.setState({ width: this.canvas.clientWidth, height: this.canvas.clientHeight }, this.update);
    });
    window.addEventListener('resize', this.onResize);
  }

  componentDidUpdate() {
    this.update();
  }

  update() {
    const { data } = this.props;
    const context = this.canvas.getContext('2d');
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const maxValue = max(data);
    const size = this.canvas.width / (255 / LUMINANCE_DATA_UNIT);
    data.forEach((value, index) => {
      if (value) {
        const length = this.canvas.height * value / maxValue;
        context.fillRect(index * size, this.canvas.height - length, size, length);
      }
    });
  }

  onResize() {
    this.setState({ width: this.canvas.clientWidth, height: this.canvas.clientHeight });
  }

  render() {
    const { width, height } = this.state;
    return (
      <canvas
        ref={(ref) => {
          if (ref) {
            this.canvas = ref;
          }
        }}
        className='histogram'
        width={width} height={height}
      />
    );
  }
}

Histogram.propTypes = {
  data: PropTypes.arrayOf(PropTypes.number).isRequired
};
