import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import SettingMenuItem from './SettingMenuItem';
import Options, { OPTION_TYPE_FRAME } from '../constants/Options';

export default class SettingMenu extends PureComponent {
  render() {
    const { visible, data, onToggle, onChange, onEditCustomColor } = this.props;
    return (
      <div
        className={classNames('setting-menu', {
          'setting-menu--visible': visible
        })}
      >
        <button
          type='button'
          className='setting-menu__button'
          onClick={onToggle}
        >
          {visible ? 'Hide' : 'Show'} setting menu
        </button>
        <div className='setting-menu__container'>
          <div className='setting-menu__inner'>
            <div className='setting-menu__main'>
              {Options.map((option) => (
                <SettingMenuItem
                  key={option.name}
                  data={option}
                  values={option.items.map((item) => (data[item.name]))}
                  customValue={option.customColor ? data.customColor[option.items[0].name] : null}
                  onEditCustomColor={option.customColor ? onEditCustomColor : null}
                  onChange={onChange}
                  frameColor={option.items[0].type === OPTION_TYPE_FRAME ? data.frame : null}
                />
              ))}
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
  data: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onToggle: PropTypes.func.isRequired,
  onEditCustomColor: PropTypes.func.isRequired
};
