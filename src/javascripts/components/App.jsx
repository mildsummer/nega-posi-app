import React, { Component } from 'react';
import classNames from 'classnames';
import find from 'lodash.find';
import Camera from './Camera';
import SettingMenu from './SettingMenu';
import Tap from './Tap';
import Colors from '../constants/Colors';
import Storage from '../utils/Storage';
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
      showSettingMenu: false,
      baseColor: Storage.getItem('baseColor') ? find(Colors.base, { name: Storage.getItem('baseColor') })
        : Colors.base[0],
      drawingColor: Storage.getItem('drawingColor') ? find(Colors.drawing, { name: Storage.getItem('drawingColor') })
        : Colors.drawing[0],
      contrast: Storage.getItem('contrast') * 1 || 0,
      contrastThreshold: Storage.getItem('contrastThreshold') * 1 || CONTRAST_THRESHOLD_LENGTH / 2,
      inversion: Storage.getItem('inversion') || false,
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
    if (key === 'baseColor' || key === 'drawingColor') {
      Storage.setItem(key, value.name);
    } else {
      Storage.setItem(key, value);
    }
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
          <Tap
            component='button'
            type='button'
            className='tools__photo-button'
            onClick={this.takePhoto}
          >
            Take a photo
          </Tap>
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
