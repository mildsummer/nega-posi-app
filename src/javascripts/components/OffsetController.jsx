import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Hammer from 'react-hammerjs';

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
    const isTouch = window.ontouchstart === null;
    return (
      <div className='offset-controller'>
        <Hammer
          {...{ [isTouch ? 'onTouchStart' : 'onMouseDown'] :this.up}}
          draggable={false}
        >
          <div
            className='offset-controller__button'
            draggable={false}
          />
        </Hammer>
        <Hammer
          className='offset-controller__button'
          {...{ [isTouch ? 'onTouchStart' : 'onMouseDown'] :this.right}}
        >
          <div
            className='offset-controller__button'
            draggable={false}
          />
        </Hammer>
        <Hammer
          className='offset-controller__button'
          {...{ [isTouch ? 'onTouchStart' : 'onMouseDown'] :this.down}}
        >
          <div
            className='offset-controller__button'
            draggable={false}
          />
        </Hammer>
        <Hammer
          className='offset-controller__button'
          {...{ [isTouch ? 'onTouchStart' : 'onMouseDown'] :this.left}}
        >
          <div
            className='offset-controller__button'
            draggable={false}
          />
        </Hammer>
      </div>
    );
  }
}

OffsetController.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired
};
