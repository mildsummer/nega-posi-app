import React, { Component } from 'react';
import classNames from 'classnames';
import find from 'lodash.find';
import assign from 'lodash.assign';
import Camera from './Camera';
import SettingMenu from './SettingMenu';
import Tap from './Tap';
import ColorPicker from './ColorPicker';
import Colors from '../constants/Colors';
import Options, { OPTION_TYPE_TOGGLE, OPTION_TYPE_NUMBER, OPTION_TYPE_COLOR } from '../constants/Options';
import Storage from '../utils/Storage';
import { createCustomColor } from '../utils/Utils';

const defaultData = (() => {
  const data = {};
  try {
    data.customColor = Storage.getItem('customColor') ? JSON.parse(Storage.getItem('customColor')) : {};
  } catch (error) {
    console.error(error);
    data.customColor = {};
  }
  Options.forEach((option) => {
    option.items.forEach((item) => {
      switch (item.type) {
        case OPTION_TYPE_COLOR:
          data[item.name] = (Storage.getItem(item.name) ?
            find(Colors[item.name].concat(data.customColor[item.name]), { name: Storage.getItem(item.name) })
            : item.defaultValue) || item.defaultValue;
          break;
        case OPTION_TYPE_NUMBER:
          data[item.name] = Storage.getItem(item.name) * 1 || item.defaultValue;
          break;
        case OPTION_TYPE_TOGGLE:
          data[item.name] = Storage.getItem(item.name) || item.defaultValue
      }
    });
  });
  return data;
})();

export default class App extends Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.toggleSettingMenu = this.toggleSettingMenu.bind(this);
    this.hideSettingMenu = this.hideSettingMenu.bind(this);
    this.takePhoto = this.takePhoto.bind(this);
    this.togglePause = this.togglePause.bind(this);
    this.onClickCamera = this.onClickCamera.bind(this);
    this.onEditCustomColor = this.onEditCustomColor.bind(this);
    this.onChangeCustomColor = this.onChangeCustomColor.bind(this);
    this.onCancelCustomColor = this.onCancelCustomColor.bind(this);
    this.state = {
      data: defaultData,
      showSettingMenu: false,
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

  onChange(value, optionItem) {
    const { data } = this.state;
    const isColor = optionItem.type === OPTION_TYPE_COLOR;
    this.setState({ data: assign({}, data, { [optionItem.name]: value }) });
    if (isColor) {
      if (value) {
        Storage.setItem(optionItem.name, value.name);
      } else {
        Storage.removeItem(optionItem.name);
      }
    } else {
      Storage.setItem(optionItem.name, value);
    }
  }

  toggleSettingMenu() {
    const { showSettingMenu } = this.state;
    this.setState({ showSettingMenu: !showSettingMenu });
  }

  hideSettingMenu() {
    this.setState({ showSettingMenu: false });
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

  onEditCustomColor(optionItem) {
    this.setState({ colorPickerType: optionItem });
  }

  onChangeCustomColor(hsv) {
    const { data, colorPickerType } = this.state;
    if (hsv) {
      const newCustomColor = assign({}, data.customColor, {
        [colorPickerType.name]: createCustomColor(hsv)
      });
      this.setState({
        colorPickerType: null
      });
      this.setState({
        data: assign({}, data, {
          [colorPickerType.name]: newCustomColor[colorPickerType.name],
          customColor: newCustomColor
        })
      });
      Storage.setItem('customColor', JSON.stringify(newCustomColor));
      Storage.setItem(colorPickerType.name, newCustomColor[colorPickerType.name].name);
    } else {
      const newCustomColor = assign({}, data.customColor);
      delete newCustomColor[colorPickerType.name];
      this.setState({
        colorPickerType: null,
        data: assign({}, data, {
          [colorPickerType.name]: colorPickerType.defaultValue,
          customColor: newCustomColor
        })
      });
    }
  }

  onCancelCustomColor() {
    this.setState({ colorPickerType: null });
  }

  render() {
    const { showSettingMenu, colorPickerType, data, pause } = this.state;
    const { customColor } = data;
    return (
      <div className='app-container'>
        <ColorPicker
          visible={!!colorPickerType}
          onChange={this.onChangeCustomColor}
          onCancel={this.onCancelCustomColor}
          {...(colorPickerType && customColor[colorPickerType.name] ? {
            value: customColor[colorPickerType.name].value
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
            data={data}
          />
        </div>
        <Camera
          ref={(ref) => {
            if (ref) {
              this.camera = ref;
            }
          }}
          data={data}
          pause={pause}
          onClick={this.onClickCamera}
        />
      </div>
    );
  }
}
