import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import App from "./App";
import Register from './Register';
import Count2ten from './Count2ten';

export default class route extends Component {
    render() {
        return (
            <Router>
                <Switch>
                    {/* <Route exact path="/" component={App}/> */}
                    <Route path="/register" component={Register}/>
                    <Route path="/count2ten" component={Count2ten}/>
                </Switch>
            </Router>
        );
    }
}