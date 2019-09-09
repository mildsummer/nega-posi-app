import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import find from 'lodash.find';
import Colors from '../constants/Colors';
import ContrastSlider from './ContrastSlider';
import Tap from './Tap';
import { CONTRAST_THRESHOLD_LENGTH } from '../constants/General';

window.colors = Colors;
export default class SettingMenu extends Component {
  constructor(props) {
    super(props);
    this.onChangeColor = this.onChangeColor.bind(this);
    this.onChangeContrast = this.onChangeContrast.bind(this);
    this.onChangeContrastThreshold = this.onChangeContrastThreshold.bind(this);
    this.onChangeInversion = this.onChangeInversion.bind(this);
    this.resetContrast = this.resetContrast.bind(this);
  }

  onChangeColor(e) {
    const { onChange } = this.props;
    const type = e.target.getAttribute('data-color-type');
    const selectedColor = find(Colors[type], { name: e.target.getAttribute('data-color-name') });
    onChange(`${type}Color`, selectedColor);
  }

  onChangeContrast(value) {
    const { onChange } = this.props;
    onChange('contrast', value);
  }

  onChangeContrastThreshold(value) {
    const { onChange } = this.props;
    onChange('contrastThreshold', value);
  }

  resetContrast() {
    const { onChange } = this.props;
    onChange('contrast', 0);
    onChange('contrastThreshold', CONTRAST_THRESHOLD_LENGTH / 2);
  }

  onChangeInversion(e) {
    const { onChange } = this.props;
    onChange('inversion', e.target.checked);
  }

  render() {
    const { visible, baseColor, drawingColor, contrast, contrastThreshold, inversion, onToggle, luminanceData } = this.props;
    return (
      <div
        className={classNames('setting-menu', {
          'setting-menu--visible': visible
        })}
      >
        <button
          type='button'
          className='setting-menu__toggle'
          onClick={onToggle}
        >
          {visible ? 'Hide' : 'Show'} setting menu
        </button>
        <div className='setting-menu__container'>
          <div className='setting-menu__inner'>
            <div className='setting-menu__main'>
              <section className='setting-menu__item'>
                <p className='setting-menu__item-title'>
                  Inversion
                </p>
                <input
                  type='checkbox'
                  onChange={this.onChangeInversion}
                  checked={inversion}
                  id='inversion'
                />
                <Tap component='label' className='setting-menu__inversion' htmlFor='inversion'>
                  {inversion ? 'disable inversion' : 'inversion'}
                </Tap>
              </section>
              <section className='setting-menu__item'>
                <p className='setting-menu__item-title'>
                  Base color
                </p>
                <ul className='setting-menu__color-list setting-menu__color-list--base'>
                  {Colors.base.map((color) => (
                    <Tap
                      component='li'
                      key={color.name}
                      className={classNames('setting-menu__color setting-menu__color--base', {
                        'setting-menu__color--current': baseColor === color
                      })}
                      style={{
                        backgroundColor: `rgb(${color.value.join(',')})`
                      }}
                      data-color-type='base'
                      data-color-name={color.name}
                      title={color.name}
                      onClick={this.onChangeColor}
                    >
                      {color.name}
                    </Tap>
                  ))}
                </ul>
                <p className='setting-menu__selected'>
                  {baseColor.name}
                </p>
              </section>
              <section className='setting-menu__item'>
                <p className='setting-menu__item-title'>
                  Drawing color
                </p>
                <ul className='setting-menu__color-list setting-menu__color-list--drawing'>
                  {Colors.drawing.map((color) => (
                    <Tap
                      component='li'
                      key={color.name}
                      className={classNames('setting-menu__color setting-menu__color--drawing', {
                        'setting-menu__color--current': drawingColor === color
                      })}
                      style={{
                        color: `rgb(${color.value.join(',')})`
                      }}
                      data-color-type='drawing'
                      data-color-name={color.name}
                      title={color.name}
                      onClick={this.onChangeColor}
                    >
                      {color.name}
                    </Tap>
                  ))}
                </ul>
                <p className='setting-menu__selected'>
                  {drawingColor.name}
                </p>
              </section>
              <section className='setting-menu__item'>
                <div className='setting-menu__item-section'>
                  <div className='setting-menu__header'>
                    <p className='setting-menu__item-title'>
                      Contrast
                    </p>
                    <button
                      type='button'
                      className='setting-menu__reset'
                      onClick={this.resetContrast}
                    >Reset</button>
                  </div>
                  <ContrastSlider
                    value={contrast}
                    onChange={this.onChangeContrast}
                  />
                  <ContrastSlider
                    value={contrastThreshold}
                    onChange={this.onChangeContrastThreshold}
                    threshold
                    luminanceData={luminanceData}
                  />
                </div>
              </section>
            </div>
            <footer className='footer'>
              Intaglio Simulator
              <small
                className='footer__copy-right'
              >&copy; Nodoka Yamamoto</small>
            </footer>
          </div>
        </div>
      </div>
    );
  }
}

SettingMenu.propTypes = {
  visible: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  onToggle: PropTypes.func.isRequired,
  baseColor: PropTypes.object.isRequired,
  drawingColor: PropTypes.object.isRequired,
  contrast: PropTypes.number.isRequired,
  contrastThreshold: PropTypes.number.isRequired,
  inversion: PropTypes.bool.isRequired,
  luminanceData: PropTypes.arrayOf(PropTypes.number)
};
