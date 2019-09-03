import React, { Component } from 'react';
import './App.css';
import Register from './Register'
import Count2ten from './Count2ten'

export default class App extends Component {

  render() {
    return (
      <div>
        <div>
          <Count2ten/>
          {/* <Register/> */}
        </div>
      </div>
    );
  }
}
