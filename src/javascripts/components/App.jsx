import React, { Component } from 'react';
import classNames from 'classnames';
import find from 'lodash.find';
import assign from 'lodash.assign';
import Camera from './Camera';
import SettingMenu from './SettingMenu';
import Tap from './Tap';
import ColorPicker from './ColorPicker';
import Colors from '../constants/Colors';
import Storage from '../utils/Storage';
import { createCustomColor } from '../utils/Utils';
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
    this.onEditCustomColor = this.onEditCustomColor.bind(this);
    this.onChangeCustomColor = this.onChangeCustomColor.bind(this);
    this.onCancelCustomColor = this.onCancelCustomColor.bind(this);
    let customColor = {};
    try {
      customColor = Storage.getItem('customColor') ? JSON.parse(Storage.getItem('customColor')) : {};
    } catch (error) {
      console.error(error);
    }
    this.state = {
      showSettingMenu: false,
      baseColor: (Storage.getItem('baseColor') ?
        find(Colors.base.concat(customColor.base), { name: Storage.getItem('baseColor') })
        : Colors.base[0]) || Colors.base[0],
      drawingColor: (Storage.getItem('drawingColor') ?
        find(Colors.drawing.concat(customColor.drawing), { name: Storage.getItem('drawingColor') })
        : Colors.drawing[0] || Colors.drawing[0]),
      customColor,
      contrast: Storage.getItem('contrast') * 1 || 0,
      contrastThreshold: Storage.getItem('contrastThreshold') * 1 || CONTRAST_THRESHOLD_LENGTH / 2,
      inversion: Storage.getItem('inversion') || false,
      flip: Storage.getItem('flip') || false,
      luminanceData: null,
      pause: false,
      colorPickerType: null
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
    } else if (key === 'customColor') {
      Storage.setItem(key, JSON.stringify(value));
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
    const { flip } = this.state;
    const date = new Date();
    const a = document.createElement('a');
    if (flip) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = this.camera.canvas.width;
      canvas.height = this.camera.canvas.height;
      const imageObject = new Image();
      imageObject.onload = () => {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(imageObject, 0, 0);
        a.href = canvas.toDataURL('image/jpeg');
        a.download = `intaglio-simulator_${date.toLocaleDateString()}_${date.toLocaleTimeString()}.jpg`;
        a.target = '_blank';
        a.click();
      };
      imageObject.src = this.camera.canvas.toDataURL();
    } else {
      a.href = this.camera.canvas.toDataURL('image/jpeg');
      a.download = `intaglio-simulator_${date.toLocaleDateString()}_${date.toLocaleTimeString()}.jpg`;
      a.target = '_blank';
      a.click();
    }
  }

  togglePause() {
    const { pause } = this.state;
    this.setState({ pause: !pause });
  }

  onEditCustomColor(type) {
    this.setState({ colorPickerType: type });
  }

  onChangeCustomColor(hsv) {
    const { customColor, colorPickerType } = this.state;
    const newCustomColor = assign({}, customColor, {
      [colorPickerType]: createCustomColor(hsv)
    });
    this.setState({
      colorPickerType: null
    });
    this.onChange(`${colorPickerType}Color`, newCustomColor[colorPickerType]);
    this.onChange('customColor', newCustomColor);
  }

  onCancelCustomColor() {
    this.setState({ colorPickerType: null });
  }

  render() {
    const { showSettingMenu, colorPickerType, customColor } = this.state;
    return (
      <div className='app-container'>
        <ColorPicker
          visible={!!colorPickerType}
          onChange={this.onChangeCustomColor}
          onCancel={this.onCancelCustomColor}
          {...(colorPickerType && customColor[colorPickerType] ? {
            rgb: customColor[colorPickerType].value
          } : null)}
        />
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
            onEditCustomColor={this.onEditCustomColor}
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
