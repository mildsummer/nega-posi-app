import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { find } from '../utils/Utils';
import Tap from './Tap';

export default class ColorList extends Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.selected !== this.props.selected ||
      nextProps.customColor !== this.props.customColor;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.customColor !== this.props.customColor) {
      this.scrollLeft();
    }
  }

  componentDidMount() {
    const { selected } = this.props;
    if (this.element) {
      const selectedElement = selected ? this.element.querySelector(`[data-color-name='${selected.name}']`)
        : this.element.querySelector('[title="NONE"]');
      this.element.scrollLeft = selectedElement.getBoundingClientRect().left
        - this.element.getBoundingClientRect().left
        - this.element.offsetWidth / 2
        + selectedElement.offsetWidth / 2;
    }
  }

  onChange(e) {
    const { data, customColor, onChange } = this.props;
    const isCustom = e.target.getAttribute('data-is-custom') === 'true';
    const name = e.target.getAttribute('data-color-name');
    if (!name) {
      onChange(null);
    } else {
      const selectedColor = isCustom ? customColor : find(data, { name });
      onChange(selectedColor);
    }
  }

  scrollLeft() {
    this.element.scrollLeft = 0;
  }

  render() {
    const { data, customColor, selected, type, required } = this.props;
    return (
      <ul
        ref={(ref) => {
          if (ref) {
            this.element = ref;
          }
        }}
        className={`setting-menu__color-list setting-menu__color-list--${type}`}
      >
        {required ? null : (
          <Tap
            component='li'
            className={classNames(`setting-menu__color setting-menu__color--${type} setting-menu__color--none`, {
              'setting-menu__color--current': !selected
            })}
            title='NONE'
            onClick={this.onChange}
          >
            NONE
          </Tap>
        )}
        {(customColor ? [customColor].concat(data) : data).map((color) => (
          <Tap
            component='li'
            key={color.name}
            className={classNames(`setting-menu__color setting-menu__color--${type}`, {
              'setting-menu__color--current': selected === color,
              'setting-menu__color--custom': color.isCustom
            })}
            style={{
              [type === 'drawing' ? 'color' : 'backgroundColor']: `rgb(${color.value.join(',')})`
            }}
            data-color-name={color.name}
            data-is-custom={color.isCustom}
            title={color.name}
            onClick={this.onChange}
          >
            {color.name}
          </Tap>
        ))}
      </ul>
    );
  }
}

ColorList.defaultProps = {
  required: true
};

ColorList.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  customColor: PropTypes.object,
  selected: PropTypes.object,
  type: PropTypes.string.isRequired,
  required: PropTypes.bool,
  onChange: PropTypes.func.isRequired
};
