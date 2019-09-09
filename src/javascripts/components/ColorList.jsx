import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Tap from './Tap';
import find from "lodash.find";

export default class ColorList extends Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.selected !== this.props.selected;
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
    const { data, type, onChange } = this.props;
    const selectedColor = find(data, { name: e.target.getAttribute('data-color-name') });
    onChange(selectedColor, type);
  }

  render() {
    const { data, selected, type } = this.props;
    return (
      <ul
        ref={(ref) => {
          if (ref) {
            this.element = ref;
          }
        }}
        className={`setting-menu__color-list setting-menu__color-list--${type}`}
      >
        {data.map((color) => (
          <Tap
            component='li'
            key={color.name}
            className={classNames(`setting-menu__color setting-menu__color--${type}`, {
              'setting-menu__color--current': selected === color
            })}
            style={{
              [type === 'base' ? 'backgroundColor' : 'color']: `rgb(${color.value.join(',')})`
            }}
            data-color-name={color.name}
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
  selected: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};
