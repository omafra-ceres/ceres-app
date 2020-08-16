import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

// polyfill for IE and Edge browsers to use non-standard msElementsFromPoint
// must convert nodeList returned by ms func to array returned by standard func
if (!document.elementsFromPoint && document.msElementsFromPoint) {
	document.elementsFromPoint = (x, y) => {
  	return [].slice.call(document.msElementsFromPoint(x, y))
  }
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
