import React from 'react';
import { AppRegistry } from 'react-native';
import App from './App';
import './styles.css';

AppRegistry.registerComponent('MrLearning', () => App);
AppRegistry.runApplication('MrLearning', {
  rootTag: document.getElementById('root')
});
