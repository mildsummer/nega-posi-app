import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import find from 'lodash.find';
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
      const selectedElement = this.element.querySelector(`[data-color-name='${selected.name}']`);
      this.element.scrollLeft = selectedElement.getBoundingClientRect().left
        - this.element.getBoundingClientRect().left
        - this.element.offsetWidth / 2
        + selectedElement.offsetWidth / 2;
    }
  }

  onChange(e) {
    const { data, type, customColor, onChange } = this.props;
    const isCustom = e.target.getAttribute('data-is-custom') === 'true';
    const selectedColor = isCustom ? customColor : find(data, { name: e.target.getAttribute('data-color-name') });
    onChange(selectedColor, type);
  }

  scrollLeft() {
    this.element.scrollLeft = 0;
  }

  render() {
    const { data, customColor, selected, type } = this.props;
    return (
      <ul
        ref={(ref) => {
          if (ref) {
            this.element = ref;
          }
        }}
        className={`setting-menu__color-list setting-menu__color-list--${type}`}
      >
        {(customColor ? [customColor].concat(data) : data).map((color) => (
          <Tap
            component='li'
            key={color.name}
            className={classNames(`setting-menu__color setting-menu__color--${type}`, {
              'setting-menu__color--current': selected === color,
              'setting-menu__color--custom': color.isCustom
            })}
            style={{
              [type === 'base' ? 'backgroundColor' : 'color']: `rgb(${color.value.join(',')})`
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

ColorList.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  customColor: PropTypes.object,
  selected: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};
