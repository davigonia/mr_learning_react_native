import React from 'react';
import { AppRegistry } from 'react-native-web';
import App from './App';
import './styles.css';

// Make sure to import the DOM bundle
import { render } from 'react-dom';

// Register the app
AppRegistry.registerComponent('MrLearning', () => App);

// Mount the app
document.addEventListener('DOMContentLoaded', () => {
  const rootTag = document.getElementById('root');
  
  if (rootTag) {
    const { getApplication } = AppRegistry;
    const { element, getStyleElement } = getApplication('MrLearning');
    
    // Insert the styles
    const styleElement = getStyleElement();
    document.head.appendChild(styleElement);
    
    // Render the app
    render(element, rootTag);
  } else {
    console.error('Root element not found');
  }
});
