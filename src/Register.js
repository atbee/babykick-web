import React, { Component } from "react";
import { Form, Button } from "react-bootstrap";
import "./App.css";
import axios from "axios";

const liff = window.liff;

const API = "https://babykick-api-dev.herokuapp.com";
// const API = 'http://localhost:3001';


export default class Register extends Component {
  initialize() {
    console.log('Entering initialize state...')
    liff.init(async () => {
      let profile = await liff.getProfile();
      this.setState({
        line_id: profile.userId
      });
      this.verifyUID();
    });
  }

  verifyUID() {
    axios
      .post(API + "/verify", this.state)
      .then(response => {
        console.log(response);
        console.log("ไอดีใหม่!");
        this.setState({ loading: false });
        document.getElementById("regisForm").style.display = "block";
        document.getElementById("pageisload").style.display = "none";
      })
      .catch(error => {
        console.log(error);
        console.log("มีไอดีนี้แล้ว!");
        this.setState({ loading: false });
        liff.closeWindow();
      });
  }

  constructor(props) {
    super(props);
    this.state = {
      line_id: "",
      mom_age: "",
      ges_age_week: "",
      loading: false
    };
    this.initialize = this.initialize.bind(this);
  }

  componentDidMount() {
    window.addEventListener("load", this.initialize);
    document.title = "Register";
  }

  changeHandler = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  submitHandler = e => {
    e.preventDefault();
    this.setState({ loading: true });
    axios
      .post(API + "/register", this.state)
      .then(response => {
        console.log(response);
        console.log("ลงทะเบียนสำเร็จ!");

        document.getElementById("regisSuccess").style.display = "block";
        document.getElementById("regisForm").style.display = "none";

        // delay before close
        setTimeout(() => {
          this.setState({ loading: false });
          liff.closeWindow();
        }, 2000);
      })
      .catch(error => {
        console.log(error);
        console.log("ลงทะเบียนไม่สำเร็จ!");

        document.getElementById("regisFailed").style.display = "block";
        document.getElementById("regisForm").style.display = "none";

        setTimeout(() => {
          this.setState({ loading: false });
          document.getElementById("regisFailed").style.display = "none";
          document.getElementById("regisForm").style.display = "inline";
        }, 2000);
      });
  };

  render() {
    const { line_id, mom_age, ges_age_week, loading } = this.state;
    return (
      <div className="App">
        <header className="App-header">
          <div id="pageisload">
              <img
                src="./loading.gif"
                alt="loading"
                className="loading"
              ></img>
            {/* {loading ? "กำลังโหลด…" : "กำลังโหลด..."} */}
          </div>
          <div id="regisForm" className="form" style={{display:'none'}}>
            <Form onSubmit={this.submitHandler}>
              <Form.Group>
                <Form.Control
                  required
                  className="hide"
                  name="line_id"
                  type="text"
                  placeholder="Line ID"
                  value={line_id}
                  onChange={this.changeHandler}
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>อายุคุณแม่ (ปี)</Form.Label>
                <Form.Control
                  required
                  name="mom_age"
                  type="number"
                  placeholder="คุณแม่อายุกี่ปีคะ?"
                  min="10"
                  max="50"
                  value={mom_age}
                  onChange={this.changeHandler}
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>อายุครรภ์ (สัปดาห์)</Form.Label>
                <Form.Control
                  required
                  name="ges_age_week"
                  type="number"
                  placeholder="อายุครรภ์กี่สัปดาห์คะ?"
                  min="1"
                  max="50"
                  value={ges_age_week}
                  onChange={this.changeHandler}
                />
              </Form.Group>

              <Button variant="danger" type="submit" disabled={loading}>
                {loading ? "กำลังโหลด…" : "ยืนยันข้อมูล"}
              </Button>
            </Form>
          </div>

          <div id="regisSuccess" style={{ display: "none"}}>
            <img
              src="./register_success.png"
              alt="reg"
              className="reg"
            ></img>
          </div>

          <div id="regisFailed" style={{ display: "none"}}>
            <img
              src="./register_success.png"
              alt="reg"
              className="reg"
            ></img>
          </div>
        </header>
      </div>
    );
  }
}
