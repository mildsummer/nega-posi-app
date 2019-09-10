import React, { Component } from 'react';
import Hammer from 'react-hammerjs';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import color from 'color-convert';
import Tap from './Tap';

const { min, max } = Math;
const rgbToHsv = color.rgb.hsv;
const hsvToRgb = color.hsv.rgb;
const zeroToOne = (value) => (min(1, max(0, value)));

export default class ColorPicker extends Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.onTouchStartSV = this.onTouchStartSV.bind(this);
    this.onPanStartSV = this.onPanStartSV.bind(this);
    this.onPanSV = this.onPanSV.bind(this);
    this.onPanEndSV = this.onPanEndSV.bind(this);
    this.onTouchStartHue = this.onTouchStartHue.bind(this);
    this.onPanStartHue = this.onPanStartHue.bind(this);
    this.onPanHue = this.onPanHue.bind(this);
    this.onPanEndHue = this.onPanEndHue.bind(this);
    const hsv = rgbToHsv(props.rgb);
    this.state = {
      h: zeroToOne(hsv[0]),
      s: zeroToOne(hsv[1]),
      v: zeroToOne(hsv[2])
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.visible && !this.props.visible) {
      const hsv = rgbToHsv(nextProps.rgb);
      this.setState({
        h: zeroToOne(hsv[0] / 360),
        s: zeroToOne(hsv[1] / 100),
        v: zeroToOne(hsv[2] / 100)
      });
    }
  }

  onChange() {
    const { onChange } = this.props;
    const { h, s, v } = this.state;
    onChange([h, s, v]);
  }

  onTouchStartSV(e) {
    const s = zeroToOne(((e.nativeEvent.clientX || e.nativeEvent.touches[0].clientX || 0)
      - this.svField.getBoundingClientRect().left) / this.svField.clientWidth);
    const v = 1 - zeroToOne(((e.nativeEvent.clientY || e.nativeEvent.touches[0].clientY || 0)
      - this.svField.getBoundingClientRect().top) / this.svField.clientHeight);
    this.setState({ s, v });
  }

  onPanStartSV() {
    const { s, v } = this.state;
    this.panStartS = s;
    this.panStartV = v;
  }

  onPanSV(e) {
    const s = zeroToOne(this.panStartS + e.deltaX / this.svField.clientWidth);
    const v = zeroToOne(this.panStartV - e.deltaY / this.svField.clientHeight);
    this.setState({ s, v });
  }

  onPanEndSV() {
    console.log('sv end');
  }

  onTouchStartHue(e) {
    const h = zeroToOne(((e.nativeEvent.clientY || e.nativeEvent.touches[0].clientY || 0)
      - this.hueField.getBoundingClientRect().top) / this.hueField.clientHeight);
    this.setState({ h });
  }

  onPanStartHue() {
    const { h } = this.state;
    this.panStartHue = h;
  }

  onPanHue(e) {
    const h = zeroToOne(this.panStartHue + e.deltaY / this.hueField.clientHeight);
    this.setState({ h });
  }

  onPanEndHue() {
    console.log('Hue end');
  }

  render() {
    const { visible, onCancel } = this.props;
    const { h, s, v } = this.state;
    const rgb = hsvToRgb(h === 1 ? 0 : h * 360, s * 100, v * 100);
    return (
      <div
        className={classNames('color-picker', {
          'color-picker--visible': visible
        })}
      >
        <div className='color-picker__bg' />
        <div className='color-picker__inner'>
          <div className='color-picker__field'>
            <div
              className='color-picker__sv'
              ref={(ref) => {
                if (ref) {
                  this.svField = ref;
                }
              }}
              style={{
                backgroundColor: `hsl(${h * 360}, 100%, 50%)`
              }}
              draggable={false}
            >
              <Hammer
                onTouchStart={this.onTouchStartSV}
                onMouseDown={this.onTouchStartSV}
                onPanStart={this.onPanStartSV}
                onPan={this.onPanSV}
                onPanEnd={this.onPanEndSV}
                onPanCancel={this.onPanEndSV}
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
                <div className='color-picker__hammer'>
                  <div
                    className='color-picker__sv-current'
                    style={{
                      top: `${(1 - v) * 100}%`,
                      left: `${s * 100}%`,
                      backgroundColor: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
                    }}
                    draggable={false}
                  />
                </div>
              </Hammer>
            </div>
            <div
              className='color-picker__hue'
              ref={(ref) => {
                if (ref) {
                  this.hueField = ref;
                }
              }}
              draggable={false}
            >
              <Hammer
                onTouchStart={this.onTouchStartHue}
                onMouseDown={this.onTouchStartHue}
                onPanStart={this.onPanStartHue}
                onPan={this.onPanHue}
                onPanEnd={this.onPanEndHue}
                onPanCancel={this.onPanEndHue}
                options={
                  {
                    recognizers: {
                      pan: {
                        threshold: 0
                      }
                    }
                  }
                }
                direction='DIRECTION_VERTICAL'
                draggable={false}
              >
                <div className='color-picker__hammer'>
                  <div
                    className='color-picker__hue-current'
                    style={{
                      top: `${h * 100}%`
                    }}
                    draggable={false}
                  />
                </div>
              </Hammer>
            </div>
          </div>
          <div className='color-picker__button-wrapper'>
            <Tap
              component='button'
              type='button'
              className='color-picker__button'
              onClick={this.onChange}
            >
              OK
            </Tap>
            <Tap
              component='button'
              type='button'
              className='color-picker__button'
              onClick={onCancel}
            >
              Cancel
            </Tap>
          </div>
        </div>
      </div>
    );
  }
}

ColorPicker.defaultProps = {
  rgb: [0, 0, 0]
};

ColorPicker.propTypes = {
  rgb: PropTypes.arrayOf(PropTypes.number),
  visible: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};
