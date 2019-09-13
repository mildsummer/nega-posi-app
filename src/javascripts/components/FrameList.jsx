import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import find from 'lodash.find';
import Tap from './Tap';

export default class FrameList extends Component {
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
      const selectedElement = selected && this.element.querySelector(`[data-frame-type-name='${selected.name}']`);
      if (selectedElement) {
        this.element.scrollLeft = selectedElement.getBoundingClientRect().left
          - this.element.getBoundingClientRect().left
          - this.element.offsetWidth / 2
          + selectedElement.offsetWidth / 2;
      }
    }
  }

  onChange(e) {
    const { data, onChange } = this.props;
    const name = e.target.getAttribute('data-frame-type-name');
    onChange(find(data, { name }) || null);
  }

  scrollLeft() {
    this.element.scrollLeft = 0;
  }

  render() {
    const { data, selected } = this.props;
    return (
      <ul
        ref={(ref) => {
          if (ref) {
            this.element = ref;
          }
        }}
        className='setting-menu__frame-list'
      >
        {data.map((type) => (
          <Tap
            component='li'
            key={type.name}
            className={classNames(`setting-menu__frame setting-menu__frame--${type}`, {
              'setting-menu__frame--current': selected === type
            })}
            data-frame-type-name={type.name}
            title={type.name}
            onClick={this.onChange}
          >
            {type.name}
          </Tap>
        ))}
      </ul>
    );
  }
}

FrameList.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  selected: PropTypes.object,
  onChange: PropTypes.func.isRequired
};
