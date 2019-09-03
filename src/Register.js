import React, { Component } from 'react';
import { Form, Button} from "react-bootstrap";
// import Button from 'react-bootstrap-button-loader';
import './App.css';
import axios from 'axios';

const liff = window.liff;

export default class Register extends Component {

  initialize() {
    liff.init(async () => {
      let profile = await liff.getProfile();
      this.setState({
        line_id: profile.userId
      });
    });
  }

  constructor(props) {
    super(props);
    this.state = {
      line_id: '',
      mom_age: '',
      ges_age_week: '',
      loading: false
    };
    this.initialize = this.initialize.bind(this);
    this.closeApp = this.closeApp.bind(this);
  }

  componentDidMount() {
    window.addEventListener('load', this.initialize);
  }

  closeApp(event) {
    event.preventDefault();
    liff.sendMessages([{
      type: 'text',
      text: "ลงทะเบียนเรียบร้อย"
    }]).then(() => {
      liff.closeWindow();
    });
  }

  changeHandler = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  submitHandler = e => {
    e.preventDefault()
    this.setState({ loading : true });
    axios
      .post('http://103.74.254.168:3000//register', this.state)
      .then(response => {
        console.log(response)
        console.log('ลงทะเบียนสำเร็จ!')

        document.getElementById('regisSuccess').style.display = "block";
        document.getElementById('regisForm').style.display = "none";

        // delay before close
        setTimeout(()=> {
          this.setState({ loading : false });
          liff.closeWindow();
        }, 1000)
      })
      .catch(error => {
        console.log(error)
        console.log('ลงทะเบียนไม่สำเร็จ!')

        document.getElementById('regisFailed').style.display = "block";
        document.getElementById('regisForm').style.display = "none";

        setTimeout(()=> {
          this.setState({ loading : false });
          document.getElementById('regisFailed').style.display = "none";
          document.getElementById('regisForm').style.display = "block";
        }, 2000)

      })
  }

  render() {
    const { line_id, mom_age, ges_age_week } = this.state;
    const { loading } = this.state;
    return (
      <div className="App">
        <header className="App-header">

          {/* <div className="Show-data">
            {this.state.line_id}
          </div> */}

          <div id="regisForm" className="form">
            <Form onSubmit={this.submitHandler}>

              <Form.Group>
                <Form.Control
                  required
                  className="hide"
                  name="line_id"
                  type="text"
                  placeholder="Line ID"
                  value={line_id}
                  onChange={this.changeHandler}/>
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
                  onChange={this.changeHandler}/>
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
                  onChange={this.changeHandler}/>
              </Form.Group>

              <Button className="" variant="danger" type="submit" disabled={loading}>
                {loading ? 'กำลังโหลด…' : 'ยืนยันข้อมูล'}
              </Button>

            </Form>
          </div>

          <div id="regisSuccess" style={{ display: 'none', marginTop : '50px' }}> 
          ลงทะเบียนเสร็จเรียบร้อยค่ะ
          </div>

          <div id="regisFailed" style={{ display: 'none', marginTop : '50px' }}> 
          ลงทะเบียนไม่สำเร็จ! กรุณาลองใหม่อีกครั้งค่ะ
          </div>

        </header>
      </div>
    );
  }
}