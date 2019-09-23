import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Tap from './Tap';

const OFFSET_UNIT = 10;

export default class OffsetController extends Component {
  constructor(props) {
    super(props);
    this.up = this.up.bind(this);
    this.right = this.right.bind(this);
    this.down = this.down.bind(this);
    this.left = this.left.bind(this);
  }

  up() {
    const { x, y, onChange } = this.props;
    onChange(x, y - OFFSET_UNIT);
  }

  right() {
    const { x, y, onChange } = this.props;
    onChange(x + OFFSET_UNIT, y);
  }

  down() {
    const { x, y, onChange } = this.props;
    onChange(x, y + OFFSET_UNIT);
  }

  left() {
    const { x, y, onChange } = this.props;
    onChange(x - OFFSET_UNIT, y);
  }

  render() {
    return (
      <div className='offset-controller'>
        <Tap
          className='offset-controller__button'
          onClick={this.up}
          draggable={false}
        />
        <Tap
          className='offset-controller__button'
          onClick={this.right}
          draggable={false}
        />
        <Tap
          className='offset-controller__button'
          onClick={this.down}
          draggable={false}
        />
        <Tap
          className='offset-controller__button'
          onClick={this.left}
          draggable={false}
        />
      </div>
    );
  }
}

OffsetController.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired
};
