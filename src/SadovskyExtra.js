import React, { Component } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import "./App.css";
import axios from "axios";
import moment from "moment";

const liff = window.liff;
const API = "https://babykick-api-dev.herokuapp.com";
// const API = 'http://localhost:3001';


export default class SadovskyExtra extends Component {
  initialize() {
    this.setState({ loading: true });
    liff.init(async () => {
      let profile = await liff.getProfile();
      this.setState({
        line_id: profile.userId
      });
      // this.checkToday();
      this.verifyUID();
    });
  }

  // initialize() {
  //   // this.checkToday();
  //   this.verifyUID();
  // }

  checkToday() {
    this.setState({ loading: true });
    const { line_id } = this.state;
    axios // check if today is already count
      .post(API + "/check/today/" + line_id, this.state)
      .then(response => {
        console.log(response);
        this.verifyUID(); // go to this function if user hasn't count today
      })
      .catch(error => {
        console.log(error);
        document.getElementById("pageisload").style.display = "none";
        document.getElementById("failurePage").style.display = "block";
        console.log("Couldn't detect UID");
        setTimeout(() => {
          this.setState({ loading: false });
          liff.closeWindow();
        }, 2000);
      });
  }

  verifyUID() {
    axios //checktimer status and send user to new or continue count
      .post(API + "/timer/status", this.state)
      .then(response => {
        console.log(response);
        this.setState({ status: response.data.timer_status });
        this.setState({ sdk_status: response.data.sdk_status });
  
        if (
          this.state.status === "timeout" &&
          this.state.sdk_status === "enable"
        ) {
          console.log("state = timeout");
          document.getElementById("newCount").style.display = "block";
          document.getElementById("pageisload").style.display = "none";
          document.getElementById("continueCount").style.display = "none";
        } else if (this.state.status === "running") {
          console.log("state = running");
  
          const { dataUser } = this.state;
          axios
            .post(API + "/get/current", this.state)
            .then(response => {
              console.log(response.data);
  
              let data = response.data;
              dataUser.push({
                timestamp: data.timestamp,
                time: data.time,
                sdk_first_meal: data.sdk_first_meal,
                sdk_second_meal: data.sdk_second_meal,
                sdk_third_meal: data.sdk_third_meal,
                status: data.status
              });
              
              this.setState({ count_status: dataUser[0].status });
              console.log(this.state.count_status)
  
              this.setState({ apitime: dataUser[0].time }); // this is start time of count
              this.setState({ timeTillDate: dataUser[0].timestamp });
  
              if (this.state.count_status === '1st') {
                this.setState({ count: dataUser[0].sdk_first_meal });
              } else if (this.state.count_status === '2nd') {
                this.setState({ count: dataUser[0].sdk_second_meal });
              } else if (this.state.count_status === '3rd') {
                this.setState({ count: dataUser[0].sdk_third_meal });
              }
              
              console.log(this.state.count);
  
              document.getElementById("pageisload").style.display = "none";
              document.getElementById("continueCount").style.display = "none";
              document.getElementById("countPage").style.display = "block";
  
              setTimeout(() => {
                this.setState({ loading: false });
                document.getElementById("countdown-timer").style.display = "block";
                document.getElementById("countdown-timer-loading").style.display = "none";
      
                  if (this.state.count === 0) {
                    console.log("COUNT = 0");
                    document.getElementById("decButt").disabled = true;
                  } else {
                    document.getElementById("decButt").disabled = false;
                  }
              }, 1000);
            })
            .catch(error => {
              console.log(error);
            });
  
          // document.getElementById("newCount").style.display = "none";
          // document.getElementById("pageisload").style.display = "none";
          // document.getElementById("continueCount").style.display = "block";
        } else if (
          this.state.status === "timeout" &&
          this.state.sdk_status === "disable"
        ) {
          const { line_id } = this.state; 
          axios // check if user can count only in ctt
            .post(API + "/push/onlyctt/" + line_id, this.state)
            .then(response => {
              console.log(response);
              liff.closeWindow();
            })
            .catch(error => {
              console.log(error);
              liff.closeWindow();
            });
        }
        this.setState({ loading: false });
      })
      .catch(error => {
        console.log(error);
        liff.closeWindow();
      });
  }

  constructor(props) {
    super(props);
    this.state = {
      // line_id: "U50240c7e4d230739b2a4343c4a1da542",
      line_id: "",
      dataUser: [],
      count: 0,
      loading: false,
      status: "",
      apitime: "",
      timeTillDate: "",
      timestamp: "",
      endTime: "",
      leftTime: "",
      startTime: "",
      status_web: "exit"
    };
    this.initialize = this.initialize.bind(this);
  }

  handleLeavePage = e => {
    this.setState({ loading: true }); //set button state to loading (UX)
    axios
      .post(API + "/closeweb", this.state)
      .then(response => {
        console.log(response);
        liff.closeWindow();
      })
      .catch(error => {
        console.log(error);
      });
  };
  componentDidMount = async () => {
    window.addEventListener("load", this.initialize);
    document.title = "Sadovsky (Extra)";

    this.interval = setInterval(async () => { //get all time data
      const now = moment().unix() * 1000;
      const currentTime = moment(now).format("HH:mm:ss");
      const startTime = moment(this.state.apitime, "HH:mm:ss")
        .subtract(7, "hours")
        .format("HH:mm:ss"); // Real time of this.state.apitime - 7 hours (Local = minus 7, Server = minus 0)
      const endTime = moment(this.state.apitime, "HH:mm:ss")
        .add(60, "seconds")
        .format("HH:mm:ss"); // End time + 5 hours (Local = add 5, Server = add 12)

      const leftTime = moment
        .utc(moment(endTime, "HH:mm:ss").diff(moment(currentTime, "HH:mm:ss")))
        .format("HH:mm:ss");
      
      if (currentTime === endTime) {  // if time out
        document.getElementById("badEnding").style.display = "block";
        document.getElementById("countPage").style.display = "none";

        setTimeout(() => {
          this.setState({ loading: false });
          liff.closeWindow();
        }, 2000);
      }

      this.setState({ endTime, leftTime, startTime });
    }, 1000);
  };

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  changeHandler = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  beginHandler = e => {
    e.preventDefault();
    this.setState({ loading: true }); //set button state to loading (UX)
    axios
      .post(API + "/timer/sadovsky/extra", this.state)
      .then(response => {
        console.log(response);
        this.setState({ apitime: response.data.time }); // this is start time of count
        this.setState({ timeTillDate: response.data.timestamp });

        document.getElementById("newCount").style.display = "none";
        document.getElementById("countPage").style.display = "block";

        setTimeout(() => {
          this.setState({ loading: false });
          document.getElementById("countdown-timer").style.display = "block";
          document.getElementById("countdown-timer-loading").style.display = "none";

          if (this.state.count === 0) {
            console.log("COUNT = 0");
            document.getElementById("decButt").disabled = true;
          } else {
            document.getElementById("decButt").disabled = false;
          }
        }, 1000);
      })
      .catch(error => {
        console.log(error);
      });
  };

  incHandler = e => {
    e.preventDefault();
    console.log(this.state);
    this.setState({ loading: true }); //set button state to loading (UX)
    const { line_id } = this.state;

    axios
      .post(API + "/sdk/increasing/extra/" + line_id, this.state)
      .then(response => {
        console.log(response);
        this.setState({ data: response.data });

        this.setState({ count: this.state.count + 1 });
        this.setState({ loading: false });

        if (this.state.count === 0) {
          console.log("COUNT = 0");
          document.getElementById("decButt").disabled = true;
        } else {
          document.getElementById("decButt").disabled = false;
        }

        if (this.state.count === 3) {
          console.log("count complete!");
          document.getElementById("decButt").disabled = true;
          document.getElementById("incButt").disabled = true;
          document.getElementById("goodEnding").style.display = "block";
          document.getElementById("countPage").style.display = "none";
          setTimeout(() => {
            this.setState({ loading: false });
            liff.closeWindow();
          }, 2000);
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  decHandler = e => {
    e.preventDefault();
    console.log(this.state);
    this.setState({ loading: true }); //set button state to loading (UX)
    const { line_id } = this.state;
    axios
      .post(API + "/sdk/decreasing/extra/" + line_id, this.state)
      .then(response => {
        console.log(response);
        this.setState({ data: response.data });
        this.setState({ count: this.state.count - 1 });
        this.setState({ loading: false });

        // test
        if (this.state.count === 0) {
          console.log("COUNT = 0");
          document.getElementById("decButt").disabled = true;
        } else {
          document.getElementById("decButt").disabled = false;
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  render() {
    const { line_id } = this.state;
    const { loading } = this.state;
    const { endTime, leftTime } = this.state;
    return (
      <div className="App">
        <header className="App-header">
          <div className="form count-score">
            <div id="pageisload">
              <img src="./loading.gif" alt="loading" className="loading"></img>
              {/* {loading ? "กำลังโหลด…" : ""} */}
            </div>

            <div id="newCount" style={{ display: "none" }}>
              {/* {this.state.line_id} */}

              <div className="count-header">
                นับลูกดิ้นแบบ Sadovsky (นับเพิ่ม)
              </div>
              <div className="end-time">"นับให้ถึง 3 ภายใน 1 ชั่วโมง"</div>
              <div className="end-time">คุณแม่นับลูกดิ้นในเวลา 1 ชั่วโมง</div>
              <div className="end-time">หลังอาหาร 3 เวลา</div>
              <div className="end-time">
                โดยในแต่ละครั้งต้องนับให้ได้ ​3 ครั้งขึ้นไป
              </div>

              <Form.Group>
                <Form.Control
                  className="hide"
                  name="line_id"
                  type="text"
                  placeholder="Line ID"
                  value={line_id}
                  onChange={this.changeHandler}
                />
              </Form.Group>

              <Button
                className="count-btn"
                variant="danger"
                type="submit"
                onClick={this.beginHandler}
                disabled={loading}
              >
                {loading && (
                  <Spinner
                    as="span"
                    animation="border"
                    size="lg"
                    role="status"
                  />
                )}
                {!loading && "เริ่ม"}
              </Button>
            </div>

            {/* User comeback to count again. */}
            <div id="continueCount" style={{ display: "none" }}>
              {/* {this.state.line_id} */}

              <div className="count-header">
                นับลูกดิ้นแบบ Sadovsky (นับต่อ)
              </div>
              <div className="end-time">"นับให้ถึง 3 ภายใน 1 ชั่วโมง"</div>
              <div className="end-time">คุณแม่นับลูกดิ้นในเวลา 1 ชั่วโมง</div>
              <div className="end-time">หลังอาหาร 3 เวลา</div>
              <div className="end-time">
                โดยในแต่ละครั้งต้องนับให้ได้ ​3 ครั้งขึ้นไป
              </div>

              <Form.Group>
                <Form.Control
                  className="hide"
                  name="line_id"
                  type="text"
                  placeholder="Line ID"
                  value={line_id}
                  onChange={this.changeHandler}
                />
              </Form.Group>

              <Button
                className="count-btn"
                variant="danger"
                type="submit"
                onClick={this.continueHandler}
                disabled={loading}
              >
                {loading && (
                  <Spinner
                    as="span"
                    animation="border"
                    size="lg"
                    role="status"
                  />
                )}
                {!loading && "ต่อ"}
              </Button>
            </div>

            {/* ---------------------------------------------------------------------------------------------------------------------------- */}
            {/* ---------------------------------------------------------------------------------------------------------------------------- */}

            {/* Countpage (obviously...) */}
            <div id="countPage" style={{ display: "none" }}>
              <Form>
                <Form.Group>
                  <Form.Label className="">
                    <div id="countdown-timer" style={{ display: "none" }}>
                      <div className="end-time">นับถอยหลัง (1 ชั่วโมง)</div>
                      <div className="countdown-time">{leftTime}</div>
                      <div className="end-time">
                        <span role="img" aria-label="time">
                          เวลาสิ้นสุด 🤖
                        </span>{" "}
                        {endTime}
                      </div>
                    </div>

                    <div id="countdown-timer-loading">
                      <div className="end-time">นับถอยหลัง (1 ชั่วโมง)</div>
                      <div className="countdown-time">คำนวนเวลา...</div>
                      <div className="end-time">
                        <span role="img" aria-label="time">
                          เวลาสิ้นสุด 🤖
                        </span>{" "}
                        คำนวนเวลา...
                      </div>
                    </div>
                  </Form.Label>
                </Form.Group>
                <Button
                  id="decButt"
                  variant="danger"
                  type="submit"
                  className="count-btn dec-margin"
                  onClick={this.decHandler}
                  disabled={loading}
                >
                  {loading ? "ลด" : "ลด"}
                </Button>
                {this.state.count}/3
                <Button
                  id="incButt"
                  variant="danger"
                  type="submit"
                  className="count-btn inc-margin"
                  onClick={this.incHandler}
                  disabled={loading}
                >
                  {loading ? "เพิ่ม" : "เพิ่ม"}
                </Button>
              </Form>
            </div>

            {/* ---------------------------------------------------------------------------------------------------------------------------- */}
            {/* ---------------------------------------------------------------------------------------------------------------------------- */}

            {/* finished count (good) */}
            <div id="goodEnding" style={{ display: "none" }}>
              <img src="./good_count.png" alt="good" className="good"></img>
            </div>

            {/* finished count (bad) */}
            <div id="badEnding" style={{ display: "none" }}>
              <img src="./bad.png" alt="bad" className="bad"></img>
            </div>
          </div>
        </header>
      </div>
    );
  }
}
