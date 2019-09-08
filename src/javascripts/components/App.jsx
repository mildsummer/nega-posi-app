import React, { Component } from 'react';
import classNames from 'classnames';
import Camera from './Camera';
import SettingMenu from './SettingMenu';
import Colors from '../constants/Colors';
import { CONTRAST_THRESHOLD_LENGTH } from '../constants/General';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.toggleSettingMenu = this.toggleSettingMenu.bind(this);
    this.hideSettingMenu = this.hideSettingMenu.bind(this);
    this.onUpdate = this.onUpdate.bind(this);
    this.state = {
      showSettingMenu: true,
      baseColor: Colors[0],
      drawingColor: Colors[1],
      contrast: 0,
      contrastThreshold: CONTRAST_THRESHOLD_LENGTH / 2,
      inversion: false,
      luminanceData: null
    };
  }

  onChange(key, value) {
    this.setState({ [key]: value });
  }

  toggleSettingMenu() {
    const { showSettingMenu } = this.state;
    this.setState({ showSettingMenu: !showSettingMenu });
  }

  hideSettingMenu() {
    this.setState({ showSettingMenu: false });
  }

  onUpdate(luminanceData) {
    this.setState({ luminanceData });
  }

  render() {
    const { showSettingMenu } = this.state;
    return (
      <div className='app-container'>
        <div
          className={classNames('tools', {
            'tools--show-menu': showSettingMenu
          })}
        >
          <button type='button' className='tools__photo-button'>Take a photo</button>
          <SettingMenu
            visible={showSettingMenu}
            onChange={this.onChange}
            onToggle={this.toggleSettingMenu}
            {...this.state}
          />
        </div>
        <Camera
          {...this.state}
          onClick={this.hideSettingMenu}
          onUpdate={this.onUpdate}
        />
      </div>
    );
  }
}
