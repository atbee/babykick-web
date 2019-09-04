import React, { Component } from 'react';
import { Button, Form } from "react-bootstrap";
import './App.css';
import axios from 'axios';
import moment from 'moment';
// import Timer from 'react-compound-timer';

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
      line_id: 'test',
      dataUser: [],
      count: 0,
      loading: false,
      status: '',
      apitime: '',
      curtime: '',
      days: undefined,
      hours: undefined,
      minutes: undefined,
      seconds: undefined,
      timeTillDate: '',
      timestamp:''
    };
    this.initialize = this.initialize.bind(this);
  }

  componentDidMount() {
    window.addEventListener('load', this.initialize);

    //checktimer status and send user to new or continue count
    axios
      .post('http://localhost:3001/timer/status', this.state)
      .then(response => {
        console.log(response)
        this.setState({ status : response.data.timer_status})

        if (this.state.status === 'timeout') {
          console.log('state = timeout')
          document.getElementById('newCount').style.display = "block";
          document.getElementById('continueCount').style.display = "none";
        } else if (this.state.status === 'running') {
          console.log('state = running')
          document.getElementById('newCount').style.display = "none";
          document.getElementById('continueCount').style.display = "block";
        }

      })
      .catch(error => {
        console.log(error)
      })

      //get all time data
      this.interval = setInterval(() => {
        const { timeTillDate } = this.state;
        const timeFormat = "x";
        const then = moment(timeTillDate, timeFormat);
        const now = moment().unix()*1000;
        const countdown = moment(then + 60000 + (then - now), timeFormat);

        const days = countdown.format('D');
        const hours = countdown.format('HH');
        const minutes = countdown.format('mm');
        const seconds = countdown.format('ss');

        // if time out
        if(moment(then).isSame(countdown, 'second')) {
          document.getElementById('badEnding').style.display = "block";
          document.getElementById('countPage').style.display = "none";
          // liff.closeWindow();
        }

        this.setState({ days, hours, minutes, seconds });
    }, 1000);

  }

  componentWillUnmount() {
    if (this.interval) {
        clearInterval(this.interval);
    }
  }

  // handle change in form (UID)
  changeHandler = e => {
    this.setState({ [e.target.name]: e.target.value })
  }

  // Function to begin to count
  beginHandler = e => {
    e.preventDefault()
    this.setState({ loading : true });  //set button state to loading (UX)
    axios
      .post('http://localhost:3001/timer/counttoten', this.state)
      .then(response => {
        console.log(response)
        this.setState({ apitime : response.data.time}) // this is start time of count
        this.setState({ timeTillDate : response.data.timestamp})

        document.getElementById('newCount').style.display = "none";
        document.getElementById('countPage').style.display = "block";
        this.setState({ loading : false });
        
        this.setState.count = 0;
        document.getElementById('decButt').disabled = true;

      })
      .catch(error => {
        console.log(error)
      })
  }

  // Function to continue to count
  continueHandler = e => {
    e.preventDefault()
    this.setState({ loading : true });  //set button state to loading (UX)
    const { line_id } = this.state;
    const { dataUser } = this.state;
    axios
      .post('http://localhost:3001/ctt/increasing/' + line_id, this.state)
      .then(response => {
        console.log(response.data)

        
        this.setState({ apitime : response.data.time}) // this is start time of count
        this.setState({ timeTillDate : response.data.timestamp})

        document.getElementById('continueCount').style.display = "none";
        document.getElementById('countPage').style.display = "block";
        this.setState({ loading : false });
        
        this.setState.count = 0;
        document.getElementById('decButt').disabled = true;

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
      .post('http://localhost:3001/ctt/increasing/' + line_id, this.state)
      .then(response => {
        console.log(response)
        this.setState({ data: response.data })

        this.setState({ count: this.state.count + 1 })
        this.setState({ loading : false });
        
        // test
        if (this.state.count === 0) {
          console.log('COUNT = 0')
          document.getElementById('decButt').disabled = true;
        } else {
          document.getElementById('decButt').disabled = false;
        }

        if (this.state.count === 10) {
          console.log('count complete!')
          document.getElementById('incButt').disabled = true;
          document.getElementById('goodEnding').style.display = "block";
          document.getElementById('countPage').style.display = "none";
          // liff.closeWindow();
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
      .post('http://localhost:3001/ctt/decreasing/' + line_id, this.state)
      .then(response => {
        console.log(response)
        this.setState({ data: response.data })
        this.setState({ count: this.state.count - 1 })
        this.setState({ loading : false });
        
        // test
        if (this.state.count === 0) {
          console.log('COUNT = 0')
          document.getElementById('decButt').disabled = true;
        } else {
          document.getElementById('decButt').disabled = false;
        }

      })
      .catch(error => {
        console.log(error)
      })
  }

  render() {
    const { line_id } = this.state;
    const { loading } = this.state;
    const { hours, minutes, seconds } = this.state;
    return (
      <div className="App">
        <header className="App-header">

          <div className="form Count-ctt">

            {/* User already count in this day. */}
            <div id="alreadyCount">

            </div>

            {/* User enter count page (First time of day) */}
            <div id="newCount" style={{ display: 'none'}}>

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
            <div id="continueCount" style={{ display: 'none'}}>

              {this.state.line_id}

              <Form.Group>
                <Form.Control
                  name="line_id"
                  type="text"
                  placeholder="Line ID" 
                  value={line_id}
                  onChange={this.changeHandler} />
              </Form.Group>

              <Button variant="danger" type="submit" onClick={this.continueHandler} disabled={loading}>
                {loading ? 'กำลังโหลด…' : 'นับต่อจากเดิม'}
              </Button>
        
            </div>

            {/* ---------------------------------------------------------------------------------------------------------------------------- */}
            {/* ---------------------------------------------------------------------------------------------------------------------------- */}
            
            {/* Countpage (obviously...) */}
            <div id="countPage" style={{ display: 'none'}}>
              <Form>
                <Form.Group>
                  <Form.Label className="">

                    {this.state.apitime}
                    <br></br>
                    {hours}:
                    {minutes}:
                    {seconds}

                    {this.state.dataUser.map ((data) => <a key={data._id} > {data.timestamp} </a> )}

                  </Form.Label>
                </Form.Group>

                <Button id="decButt" variant="danger" type="submit" className="dec-margin" onClick={this.decHandler} disabled={loading}>
                {loading ? 'ลด' : 'ลด'}
                </Button>

                {this.state.count}

                <Button id="incButt" variant="danger" type="submit" className="inc-margin" onClick={this.incHandler} disabled={loading}>
                  {loading ? 'เพิ่ม' : 'เพิ่ม'}
                </Button>

              </Form>
            </div>

            {/* ---------------------------------------------------------------------------------------------------------------------------- */}
            {/* ---------------------------------------------------------------------------------------------------------------------------- */}

            {/* finished count (good) */}
            <div id="goodEnding" style={{ display: 'none'}}>
              ยินดีด้วยค่ะ 
              <br></br>
              คุณแม่นับครบ 10 ครั้งแล้วค่ะ
            </div>

            {/* finished count (bad) */}
            <div id="badEnding" style={{ display: 'none'}}>
              คุณแม่นับลูกดิ้นไม่ครบ 10 ครั้งนะคะ
              <br></br>
              แนะนำให้ทำการ... ต่อค่ะ
            </div>

          </div>
        </header>
      </div>
    );
  }
}
