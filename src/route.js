import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Register from './Register';
import Count2ten from './Count2ten';
import Count2tenEx from './Count2tenExtra';
import Sadovsky from './Sadovsky';


export default class route extends Component {
    render() {
        return (
            <Router>
                <Switch>
                    {/* <Route exact path="/" component={App}/> */}
                    <Route path="/register" component={Register}/>
                    <Route path="/count2ten" component={Count2ten}/>
                    <Route path="/count2tenExtra" component={Count2tenEx}/>
                    <Route path="/sadovsky" component={Sadovsky}/>

                </Switch>
            </Router>
        );
    }
}