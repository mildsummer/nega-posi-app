import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Hammer from 'react-hammerjs';

const OFFSET_UNIT = 10;
const directionMap = [
  { x: 0, y: -OFFSET_UNIT },
  { x: OFFSET_UNIT, y: 0 },
  { x: 0, y: OFFSET_UNIT },
  { x: -OFFSET_UNIT, y: 0 }
];

export default class OffsetController extends Component {
  constructor(props) {
    super(props);
    this.onTouch = this.onTouch.bind(this);
    this.onPress = this.onPress.bind(this);
    this.onPressUp = this.onPressUp.bind(this);
  }

  shouldComponentUpdate() {
    return false;
  }

  move(direction) {
    const { x, y, onChange } = this.props;
    onChange(x + directionMap[direction].x, y + directionMap[direction].y);
  }

  onTouch(e) {
    this.move(e.target.getAttribute('data-direction') * 1);
  }

  onPress(e) {
    window.clearInterval(this.tick);
    const direction = e.target.getAttribute('data-direction') * 1;
    this.tick = window.setInterval(() => {
      this.move(direction);
    }, 100);
  }

  onPressUp() {
    window.clearInterval(this.tick);
  }

  render() {
    const isTouch = window.ontouchstart === null;
    return (
      <div className='offset-controller'>
        <Hammer
          {...{ [isTouch ? 'onTouchStart' : 'onMouseDown']: this.onTouch }}
          onPress={this.onPress}
          onPressUp={this.onPressUp}
          onTouchEnd={this.onPressUp}
          onClick={this.onPressUp}
          onMouseUp={this.onPressUp}
          onMouseOut={this.onPressUp}
          onTouchCancel={this.onPressUp}
          draggable={false}
        >
          <div
            className='offset-controller__button'
            draggable={false}
            data-direction={0}
          />
        </Hammer>
        <Hammer
          className='offset-controller__button'
          {...{ [isTouch ? 'onTouchStart' : 'onMouseDown']: this.onTouch }}
          onPress={this.onPress}
          onPressUp={this.onPressUp}
          onTouchEnd={this.onPressUp}
        >
          <div
            className='offset-controller__button'
            draggable={false}
            data-direction={1}
          />
        </Hammer>
        <Hammer
          className='offset-controller__button'
          {...{ [isTouch ? 'onTouchStart' : 'onMouseDown']: this.onTouch }}
          onPress={this.onPress}
          onPressUp={this.onPressUp}
          onTouchEnd={this.onPressUp}
        >
          <div
            className='offset-controller__button'
            draggable={false}
            data-direction={2}
          />
        </Hammer>
        <Hammer
          className='offset-controller__button'
          {...{ [isTouch ? 'onTouchStart' : 'onMouseDown']: this.onTouch }}
          onPress={this.onPress}
          onPressUp={this.onPressUp}
          onTouchEnd={this.onPressUp}
        >
          <div
            className='offset-controller__button'
            draggable={false}
            data-direction={3}
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
