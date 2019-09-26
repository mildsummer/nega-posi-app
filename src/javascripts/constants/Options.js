import Colors from './Colors';
import FrameTypes from './FrameTypes';
import { CONTRAST_LENGTH, CONTRAST_THRESHOLD_LENGTH } from './General';

export const OPTION_TYPE_TOGGLE = 'toggle';
export const OPTION_TYPE_COLOR = 'color';
export const OPTION_TYPE_NUMBER = 'number';
export const OPTION_TYPE_FRAME = 'frame';

export default [
  {
    name: 'Invert / Flip',
    items: [
      {
        name: 'inversion',
        type: OPTION_TYPE_TOGGLE,
        required: true,
        defaultValue: false
      },
      {
        name: 'flip',
        type: OPTION_TYPE_TOGGLE,
        required: true,
        defaultValue: false
      }
    ]
  },
  {
    name: 'Base color',
    items: [
      {
        name: 'base',
        type: OPTION_TYPE_COLOR,
        options: Colors.base,
        required: true,
        defaultValue: Colors.base[0]
      }
    ],
    customColor: true
  },
  {
    name: 'Drawing color',
    items: [
      {
        name: 'drawing',
        type: OPTION_TYPE_COLOR,
        options: Colors.drawing,
        required: true,
        defaultValue: Colors.drawing[0]
      }
    ],
    customColor: true
  },
  {
    name: 'Contrast',
    items: [
      {
        name: 'contrast',
        type: OPTION_TYPE_NUMBER,
        max: CONTRAST_LENGTH,
        min: -CONTRAST_LENGTH,
        required: true,
        defaultValue: 0
      },
      {
        name: 'contrastThreshold',
        type: OPTION_TYPE_NUMBER,
        max: CONTRAST_THRESHOLD_LENGTH,
        min: 0,
        required: true,
        defaultValue: CONTRAST_THRESHOLD_LENGTH / 2,
        histogram: true
      }
    ],
    reset: true
  },
  {
    name: 'Mat color',
    items: [
      {
        name: 'mat',
        type: OPTION_TYPE_COLOR,
        options: Colors.mat,
        required: false,
        defaultValue: null
      }
    ],
    customColor: true
  },
  {
    name: 'Clipping size / ratio',
    items: [
      {
        name: 'clipSize',
        type: OPTION_TYPE_NUMBER,
        max: 1,
        min: 0,
        required: true,
        defaultValue: 0.5
      },
      {
        name: 'clipRatio',
        type: OPTION_TYPE_NUMBER,
        max: 4,
        min: -4,
        required: true,
        defaultValue: 0,
        ratio: true
      }
    ],
    reset: true
  },
  {
    name: 'Mat thickness',
    items: [
      {
        name: 'matThickness',
        type: OPTION_TYPE_NUMBER,
        max: 10,
        min: 0,
        required: true,
        defaultValue: 10
      }
    ],
    reset: true
  },
  {
    name: 'Margin',
    items: [
      {
        name: 'margin',
        type: OPTION_TYPE_NUMBER,
        max: 100,
        min: 0,
        required: true,
        defaultValue: 0
      }
    ]
  },
  {
    name: 'Frame color',
    items: [
      {
        name: 'frame',
        type: OPTION_TYPE_COLOR,
        options: Colors.frame,
        required: false,
        defaultValue: null
      }
    ],
    customColor: true
  },
  {
    name: 'Frame type',
    items: [
      {
        name: 'frameType',
        type: OPTION_TYPE_FRAME,
        options: FrameTypes,
        required: true,
        defaultValue: FrameTypes[0]
      }
    ]
  },
  {
    name: 'Frame ratio / width',
    items: [
      {
        name: 'frameRatio',
        type: OPTION_TYPE_NUMBER,
        max: 1,
        min: -1,
        required: true,
        defaultValue: 0,
        ratio: true
      },
      {
        name: 'frameBorderWidth',
        type: OPTION_TYPE_NUMBER,
        max: 80,
        min: 5,
        required: true,
        defaultValue: 20
      }
    ],
    reset: true
  }
];
