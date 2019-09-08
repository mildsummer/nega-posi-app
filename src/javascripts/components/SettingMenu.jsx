import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import find from 'lodash.find';
import Colors from '../constants/Colors';
import {CONTRAST_LENGTH, CONTRAST_THRESHOLD_LENGTH} from '../constants/General';

export default class SettingMenu extends Component {
  constructor(props) {
    super(props);
    this.onChangeColor = this.onChangeColor.bind(this);
    this.onChangeContrast = this.onChangeContrast.bind(this);
    this.onChangeContrastThreshold = this.onChangeContrastThreshold.bind(this);
    this.onChangeInversion = this.onChangeInversion.bind(this);
  }

  onChangeColor(e) {
    const { onChange } = this.props;
    const selectedColor = find(Colors, { id: e.target.getAttribute('data-color-id') });
    const type = e.target.getAttribute('data-color-type');
    onChange(`${type}Color`, selectedColor);
  }

  onChangeContrast(e) {
    const { onChange } = this.props;
    onChange('contrast', e.target.value * 1);
  }

  onChangeContrastThreshold(e) {
    const { onChange } = this.props;
    onChange('contrastThreshold', e.target.value * 1);
  }

  onChangeInversion(e) {
    const { onChange } = this.props;
    onChange('inversion', e.target.checked);
  }

  render() {
    const { visible, baseColor, drawingColor, contrast, contrastThreshold, inversion } = this.props;
    return (
      <div
        className={classNames('setting-menu', {
          'setting-menu--visible': visible
        })}
      >
        <button type='button' className='setting-menu__toggle'>
          {visible ? 'Hide' : 'Show'} setting menu
        </button>
        <section className='setting-menu__item'>
          <p className='setting-menu__item-title'>
            Inversion
          </p>
          <label className='setting-menu__inversion'>
            {inversion ? 'disable inversion' : 'inversion'}
            <input
              type='checkbox'
              onChange={this.onChangeInversion}
              checked={inversion}
              value='inversion'
            />
          </label>
        </section>
        <section className='setting-menu__item'>
          <p className='setting-menu__item-title'>
            Base color
          </p>
          <ul className='setting-menu__color-list setting-menu__color-list--base'>
            {Colors.map((color) => (
              <li
                key={color.id}
                className={classNames('setting-menu__color setting-menu__color--base', {
                  'setting-menu__color--current': baseColor.id === color.id
                })}
                style={{
                  backgroundColor: `rgb(${color.value.join(',')})`
                }}
                data-color-type='base'
                data-color-id={color.id}
                onClick={this.onChangeColor}
              >
                {color.name}
              </li>
            ))}
          </ul>
        </section>
        <section className='setting-menu__item'>
          <p className='setting-menu__item-title'>
            Drawing color
          </p>
          <ul className='setting-menu__color-list setting-menu__color-list--drawing'>
            {Colors.map((color) => (
              <li
                key={color.id}
                className={classNames('setting-menu__color setting-menu__color--drawing', {
                  'setting-menu__color--current': drawingColor.id === color.id
                })}
                style={{
                  backgroundColor: `rgb(${color.value.join(',')})`
                }}
                data-color-type='drawing'
                data-color-id={color.id}
                onClick={this.onChangeColor}
              >
                {color.name}
              </li>
            ))}
          </ul>
        </section>
        <section className='setting-menu__item'>
          <div className='setting-menu__item-section'>
            <p className='setting-menu__item-title'>
              Contrast
            </p>
            <input
              type='number'
              max={CONTRAST_LENGTH}
              min={-CONTRAST_LENGTH}
              value={contrast}
              onChange={this.onChangeContrast}
            />
          </div>
          <div className='setting-menu__item-section'>
            <p className='setting-menu__item-title setting-menu__item-title--sub'>
              Contrast threshold
            </p>
            <input
              type='number'
              max={CONTRAST_THRESHOLD_LENGTH}
              min={0}
              value={contrastThreshold}
              onChange={this.onChangeContrastThreshold}
            />
          </div>
        </section>
      </div>
    );
  }
}

SettingMenu.propTypes = {
  visible: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  baseColor: PropTypes.object.isRequired,
  drawingColor: PropTypes.object.isRequired,
  contrast: PropTypes.number.isRequired,
  contrastThreshold: PropTypes.number.isRequired,
  inversion: PropTypes.bool.isRequired
};
