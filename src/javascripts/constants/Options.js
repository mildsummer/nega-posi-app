import Colors from './Colors';
import { CONTRAST_LENGTH, CONTRAST_THRESHOLD_LENGTH } from './General';

export const OPTION_TYPE_TOGGLE = 'toggle';
export const OPTION_TYPE_COLOR = 'color';
export const OPTION_TYPE_NUMBER = 'number';

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
        defaultValue: CONTRAST_THRESHOLD_LENGTH / 2
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
    name: 'Mat size / ratio / thickness',
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
        max: 1,
        min: -1,
        required: true,
        defaultValue: 0
      },
      {
        name: 'matThickness',
        type: OPTION_TYPE_NUMBER,
        max: 20,
        min: 0,
        required: true,
        defaultValue: 10
      }
    ],
    reset: true
  },
];
