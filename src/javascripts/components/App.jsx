import React, { Component } from 'react';
import classNames from 'classnames';
import find from 'lodash.find';
import assign from 'lodash.assign';
import Camera from './Camera';
import SettingMenu from './SettingMenu';
import Tap from './Tap';
import ColorPicker from './ColorPicker';
import AngleSlider from './AngleSlider';
import OffsetController from './OffsetController';
import Colors from '../constants/Colors';
import FrameTypes from '../constants/FrameTypes';
import Options, { OPTION_TYPE_TOGGLE, OPTION_TYPE_NUMBER, OPTION_TYPE_COLOR, OPTION_TYPE_FRAME } from '../constants/Options';
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
        case OPTION_TYPE_FRAME:
          data[item.name] = (Storage.getItem(item.name) ?
            find(FrameTypes, { name: Storage.getItem(item.name) })
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
    this.onChangeShadeAngle = this.onChangeShadeAngle.bind(this);
    this.onChangeOffset = this.onChangeOffset.bind(this);
    this.toggleARMode = this.toggleARMode.bind(this);
    this.toggleBlend = this.toggleBlend.bind(this);
    this.state = {
      data: defaultData,
      showSettingMenu: false,
      pause: false,
      colorPickerType: null,
      isARMode: false,
      isBlend: false,
      shadeAngle: Math.PI * 1.75,
      offsetX: 0,
      offsetY: 0
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
    const isName = optionItem.type === OPTION_TYPE_COLOR || optionItem.type === OPTION_TYPE_FRAME;
    this.setState({ data: assign({}, data, { [optionItem.name]: value }) });
    if (isName) {
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
    const { isARMode } = this.state;
    const date = new Date();
    const a = document.createElement('a');
    if (isARMode) {
      a.href = this.camera.getARImage();
      a.download = `intaglio-simulator_${date.toLocaleDateString()}_${date.toLocaleTimeString()}.jpg`;
      a.target = '_blank';
      a.click();
    } else {
      this.camera.getImage((imageURL) => {
        a.href = imageURL;
        a.download = `intaglio-simulator_${date.toLocaleDateString()}_${date.toLocaleTimeString()}.jpg`;
        a.target = '_blank';
        a.click();
      });
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

  toggleARMode() {
    const { isARMode } = this.state;
    this.setState({ isARMode: !isARMode });
  }

  toggleBlend() {
    const { isBlend } = this.state;
    this.setState({ isBlend: !isBlend });
  }

  onChangeShadeAngle(shadeAngle) {
    this.setState({ shadeAngle });
  }

  onChangeOffset(offsetX, offsetY) {
    this.setState({ offsetX, offsetY })
  }

  render() {
    const { showSettingMenu, colorPickerType, data, pause, isARMode, isBlend, shadeAngle, offsetX, offsetY } = this.state;
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
        {isARMode ? (
          <button
            type='button'
            className={classNames('blend-button', {
              'blend-button--checked': isBlend
            })}
            onClick={this.toggleBlend}
          >
            Blend
          </button>
        ) : null}
        {isARMode ? (
          <AngleSlider value={shadeAngle} onChange={this.onChangeShadeAngle} />
        ) : null}
        {isARMode ? (
          <OffsetController x={offsetX} y={offsetY} onChange={this.onChangeOffset} />
        ) : null}
        <div
          className={classNames('tools', {
            'tools--show-menu': showSettingMenu
          })}
        >
          <Tap
            component='button'
            type='button'
            className={classNames('tools__capture-button', {
              'tools__capture-button--disabled': !isARMode
            })}
            onClick={isARMode ? this.toggleARMode : null}
          >
            capture mode
          </Tap>
          <Tap
            component='button'
            type='button'
            className='tools__photo-button'
            onClick={this.takePhoto}
          >
            Take a photo
          </Tap>
          <Tap
            component='button'
            type='button'
            className={classNames('tools__ar-button', {
              'tools__ar-button--disabled': isARMode
            })}
            onClick={isARMode ? null : this.toggleARMode}
          >
            AR mode
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
          isARMode={isARMode}
          isBlend={isBlend}
          onClick={this.onClickCamera}
          shadeAngle={shadeAngle}
          offsetX={offsetX}
          offsetY={offsetY}
        />
      </div>
    );
  }
}
