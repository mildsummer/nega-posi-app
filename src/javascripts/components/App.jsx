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
    this.takePhoto = this.takePhoto.bind(this);
    this.togglePause = this.togglePause.bind(this);
    this.onClickCamera = this.onClickCamera.bind(this);
    this.state = {
      showSettingMenu: true,
      baseColor: Colors.base[0],
      drawingColor: Colors.drawing[0],
      contrast: 0,
      contrastThreshold: CONTRAST_THRESHOLD_LENGTH / 2,
      inversion: false,
      luminanceData: null,
      pause: false
    };
  }

  onClickCamera() {
    const { showSettingMenu } = this.state;
    if (showSettingMenu) {
      this.hideSettingMenu();
    } else {
      this.togglePause();
    }
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

  takePhoto() {
    const date = new Date();
    const a = document.createElement('a');
    a.href = this.camera.canvas.toDataURL('image/jpeg');
    a.download = `nega-posi_${date.toLocaleDateString()}_${date.toLocaleTimeString()}.jpg`;
    a.target = '_blank';
    a.click();
  }

  togglePause() {
    const { pause } = this.state;
    this.setState({ pause: !pause });
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
          <button
            type='button'
            className='tools__photo-button'
            onClick={this.takePhoto}
          >
            Take a photo
          </button>
          <SettingMenu
            visible={showSettingMenu}
            onChange={this.onChange}
            onToggle={this.toggleSettingMenu}
            {...this.state}
          />
        </div>
        <Camera
          ref={(ref) => {
            if (ref) {
              this.camera = ref;
            }
          }}
          {...this.state}
          onClick={this.onClickCamera}
          onUpdate={this.onUpdate}
        />
      </div>
    );
  }
}
