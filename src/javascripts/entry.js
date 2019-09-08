import React from 'react';
import ReactDOM from 'react-dom';
import '../stylesheets/entry.sass';
import App from './components/App';

ReactDOM.render(
  React.createElement(App),
  document.querySelector('#app')
);
