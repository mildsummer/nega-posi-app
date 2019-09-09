import React, { Component } from 'react';
import PropTypes from 'prop-types';
import max from 'lodash.max';

export default class Histogram extends Component {
  constructor(props) {
    super(props);
    this.update = this.update.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.data !== this.props.data;
  }

  componentDidUpdate() {
    this.update();
  }

  update() {
    const { data } = this.props;
    const context = this.canvas.getContext('2d');
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    context.fillStyle = '#eeeeee';
    const maxValue = max(data);
    data.forEach((value, index) => {
      if (value) {
        const length = this.canvas.height * value / maxValue;
        context.fillRect(index, this.canvas.height - length, 1, length);
      }
    });
  }

  render() {
    const { data } = this.props;
    return (
      <canvas
        ref={(ref) => {
          if (ref) {
            this.canvas = ref;
          }
        }}
        className='histogram'
        width={data.length}
        height={40}
      />
    );
  }
}

Histogram.propTypes = {
  data: PropTypes.arrayOf(PropTypes.number).isRequired
};
