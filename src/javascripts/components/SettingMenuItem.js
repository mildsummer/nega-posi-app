import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import colorConvert from 'color-convert';
import find from 'lodash.find';
import isEqual from 'lodash.isequal';
import ColorList from './ColorList';
import FrameList from './FrameList';
import Slider from './Slider';
import Tap from './Tap';
import { OPTION_TYPE_TOGGLE, OPTION_TYPE_COLOR, OPTION_TYPE_NUMBER, OPTION_TYPE_FRAME } from '../constants/Options';

export default class SettingMenuItem extends Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.reset = this.reset.bind(this);
    this.renderItem = this.renderItem.bind(this);
    this.onEditCustomColor = this.onEditCustomColor.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    return !isEqual(nextProps.values, this.props.values)
      || nextProps.customValue !== this.props.customValue
      || nextProps.frameColor !== this.props.frameColor;
  }

  onChange(item) {
    const { onChange } = this.props;
    return (value) => {
      onChange(item.type === OPTION_TYPE_TOGGLE ? value.target.checked : value, item);
    };
  }

  reset() {
    const { data, onChange } = this.props;
    onChange(data.items.map((item) => ({ value: item.defaultValue, optionItem: item })));
  }

  onEditCustomColor() {
    const { data, onEditCustomColor } = this.props;
    const item = find(data.items, { type: OPTION_TYPE_COLOR });
    if (item) {
      onEditCustomColor(item);
    }
  }

  renderItem(item) {
    const { data, values, customValue, frameColor } = this.props;
    let element = null;
    const value = values[data.items.indexOf(item)];
    switch (item.type) {
      case OPTION_TYPE_COLOR:
        element = (
          <Fragment key={item.name}>
            <ColorList
              data={item.options}
              customColor={customValue}
              selected={value}
              type={item.name}
              onChange={this.onChange(item)}
              required={item.required}
            />
            <p className='setting-menu__selected'>
              {value ? value.name : 'NONE'}
              {value && value.isCustom ? ` / rgb(${value.value.join(', ')}) / #${colorConvert.rgb.hex(value.value)}` : ''}
            </p>
          </Fragment>
        );
        break;
      case OPTION_TYPE_NUMBER:
        element = (
          <Slider
            key={item.name}
            value={value}
            max={item.max}
            min={item.min}
            onChange={this.onChange(item)}
            histogram={item.histogram}
          />
        );
        break;
      case OPTION_TYPE_TOGGLE:
        element = (
          <Fragment key={item.name}>
            <input
              type='checkbox'
              onChange={this.onChange(item)}
              checked={value}
              id={item.name}
            />
            <Tap component='label' className={`setting-menu__toggle setting-menu__toggle--${item.name}`} htmlFor={item.name}>
              {value ? `disable ${item.name}` : item.name}
            </Tap>
          </Fragment>
        );
        break;
      case OPTION_TYPE_FRAME:
        element = (
          <Fragment key={item.name}>
            <FrameList
              data={item.options}
              frameColor={frameColor}
              selected={value}
              onChange={this.onChange(item)}
            />
            <p className='setting-menu__selected'>
              {value ? value.name : 'NONE'}
            </p>
          </Fragment>
        );
        break;
      default:
        element = null;
    }
    return element;
  }

  render() {
    const { data, onEditCustomColor, customValue } = this.props;
    const firstItem = data.items[0];
    const isHorizontal = !find(data.items, (item) => (item.type !== OPTION_TYPE_TOGGLE));
    return (
      <section className='setting-menu__item'>
        <div className='setting-menu__header'>
          <p className='setting-menu__item-title'>
            {data.name}
          </p>
          {data.reset ? (
            <button
              type='button'
              className='setting-menu__sub'
              onClick={this.reset}
            >
              Reset
            </button>
          ) : null}
          {data.customColor && onEditCustomColor ? (
            <button
              type='button'
              className='setting-menu__sub'
              data-color-type={firstItem.name}
              onClick={this.onEditCustomColor}
            >
              {customValue ? 'Edit': 'Custom'}
            </button>
          ) : null}
        </div>
        {isHorizontal ? (
          <div className='setting-menu__horizontal'>
            {data.items.map(this.renderItem)}
          </div>
        ) : data.items.map(this.renderItem)}
      </section>
    );
  }
}

SettingMenuItem.propTypes = {
  data: PropTypes.object.isRequired,
  values: PropTypes.arrayOf(PropTypes.any).isRequired,
  customValue: PropTypes.any,
  frameColor: PropTypes.object,
  onChange: PropTypes.func,
  onEditCustomColor: PropTypes.func
};
