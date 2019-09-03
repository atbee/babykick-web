import React, { Component } from 'react';
import { Button, Form } from "react-bootstrap";
import './App.css';
import axios from 'axios';

const liff = window.liff;

export default class Countctt extends Component {

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
      data: [],
      count: 0,
      loading: false
    };
    this.initialize = this.initialize.bind(this);
  }

  componentDidMount() {
    window.addEventListener('load', this.initialize);
  }

  // handle change in form (UID)
  changeHandler = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  // Function to begin to count
  beginHandler = e => {
    e.preventDefault()
    console.log(this.state)
    this.setState({ loading : true });  //set button state to loading (UX)
    axios
      .post('https://babykick-api.herokuapp.com/timer/counttoten', this.state)
      .then(response => {
        console.log(response)

        document.getElementById('newCount').style.display = "none";
        document.getElementById('countPage').style.display = "block";
        this.setState({ loading : false });

        this.setState.count = 0;
      })
      .catch(error => {
        console.log(error)
      })
  }

  // Function to increase counting number value
  incHandler = e => {
    e.preventDefault()
    console.log(this.state)
    this.setState({ loading : true });  //set button state to loading (UX)
    const { line_id } = this.state;
    axios
      .post('https://babykick-api.herokuapp.com/ctt/increasing/' + line_id, this.state)
      .then(response => {
        console.log(response)
        this.setState({ data: response.data })
        this.setState({ count: this.state.count + 1 })
        this.setState({ loading : false });

        // if (this.state.data.timer_status === 'timeout') {
        //   console.log('timeout! cannot count now')
        //   document.getElementById('badEnding').style.display = "block";
        //   document.getElementById('countPage').style.display = "none";
        // }

        if (this.state.count === 10) {
          console.log('count complete!')
          document.getElementById('goodEnding').style.display = "block";
          document.getElementById('countPage').style.display = "none";
        }

      })
      .catch(error => {
        console.log(error)
      })
  }

  // Function to decrease counting number value
  decHandler = e => {
    e.preventDefault()
    console.log(this.state)
    this.setState({ loading : true });  //set button state to loading (UX)
    const { line_id } = this.state;
    axios
      .post('https://babykick-api.herokuapp.com/ctt/decreasing/' + line_id, this.state)
      .then(response => {
        console.log(response)
        this.setState({ data: response.data })
        this.setState({ count: this.state.count - 1 })
        this.setState({ loading : false });
      })
      .catch(error => {
        console.log(error)
      })
  }

  render() {
    const { line_id } = this.state;
    const { loading } = this.state;
    return (
      <div className="App">
        <header className="App-header">

          <div className="form Count-ctt">

            {/* User already count in this day. */}
            <div id="alreadyCount">

            </div>

            {/* User enter count page (First time of day) */}
            <div id="newCount">

              {this.state.line_id}

              <Form.Group>
                <Form.Control
                  name="line_id"
                  type="text"
                  placeholder="Line ID"
                  value={line_id}
                  onChange={this.changeHandler} />
              </Form.Group>

              <Button variant="danger" type="submit" onClick={this.beginHandler} disabled={loading}>
                {loading ? 'กำลังโหลด…' : 'เริ่มนับ'}
              </Button>

            </div>

            {/* User comeback to count again. */}
            <div id="continueCount">
        
            </div>

            {/* ---------------------------------------------------------------------------------------------------------------------------- */}
            
            {/* Countpage (obviously...) */}
            <div id="countPage" style={{ display: 'none'}}>
              <Form>

                <Form.Group>
                  <Form.Label className="">12:00:00</Form.Label>
                </Form.Group>

                <Button variant="danger" type="submit" className="dec-margin" onClick={this.decHandler} disabled={loading}>
                {loading ? 'ลด' : 'ลด'}
                </Button>

                {/* {this.state.data.map ((data) => <a key={data._id} > {data.ctt_amount} </a> )} */}
                {this.state.count}

                <Button variant="danger" type="submit" className="inc-margin" onClick={this.incHandler} disabled={loading}>
                  {loading ? 'เพิ่ม' : 'เพิ่ม'}
                </Button>

              </Form>
            </div>

            {/* ---------------------------------------------------------------------------------------------------------------------------- */}

            {/* finished count (good) */}
            <div id="goodEnding" style={{ display: 'none'}}>
              เย้ นับครบสิบครั้งแล้ว!
            </div>

            {/* finished count (bad) */}
            <div id="badEnding" style={{ display: 'none'}}>
              เวลาหมดจ้า
            </div>

          </div>
        </header>
      </div>
    );
  }
}
