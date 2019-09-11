import React, { Component } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import "./App.css";
import axios from "axios";
import moment from "moment";

const liff = window.liff;
const API = "https://babykick-api-dev.herokuapp.com";
// const API = 'http://localhost:3001';

export default class Sadovsky extends Component {

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
  const { line_id } = this.state;
  axios // check if today is already count
    .post(API + "/check/today/" + line_id, this.state)
    .then(response => {
      console.log(response);
      console.log("you can count today");
      this.verifyUID(); // go to this function if user hasn't count today
    })
    .catch(error => {
      console.log(error);
      console.log("TODAY IS ALREADY COUNT!");
      liff.closeWindow();
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
        document.getElementById("newCount").style.display = "none";
        document.getElementById("pageisload").style.display = "none";
        document.getElementById("continueCount").style.display = "block";
      } else if (
        this.state.status === "timeout" &&
        this.state.sdk_status === "disable"
      ) {
        const { line_id } = this.state; 
        axios // check if user can count only in ctt
          .post(API + "/push/onlyctt/" + line_id, this.state)
          .then(response => {
            console.log(response);
          })
          .catch(error => {
            console.log(error);
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
    document.title = "Sadovsky";

    //get all time data
    this.interval = setInterval(async () => {
      const now = moment().unix() * 1000;
      const currentTime = moment(now).format("HH:mm:ss");
      const startTime = moment(this.state.apitime, "HH:mm:ss")
        .subtract(0, "hours")
        .format("HH:mm:ss"); // Real time of this.state.apitime - 7 hours (Local = minus 7, Server = minus 0)
      const endTime = moment(this.state.apitime, "HH:mm:ss")
        .add(60, "seconds")
        .format("HH:mm:ss"); // End time + 5 hours (Local = add 5, Server = add 12)

      const leftTime = moment
        .utc(moment(endTime, "HH:mm:ss").diff(moment(currentTime, "HH:mm:ss")))
        .format("HH:mm:ss");

      // if time out
      if (currentTime === endTime) {
        // document.getElementById('badEnding').style.display = "block";
        // document.getElementById('countPage').style.display = "none";
        liff.closeWindow();
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
      .post(API + "/timer/sadovsky", this.state)
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
        }, 1000);

        this.setState.count = 0;
        document.getElementById("decButt").disabled = true;
      })
      .catch(error => {
        console.log(error);
      });
  };

  continueHandler = e => {
    e.preventDefault();
    this.setState({ loading: true }); //set button state to loading (UX)
    const { dataUser } = this.state;

    axios
      .post(API + "/get/current", this.state)
      .then(response => {
        console.log(response.data);
        console.log('this mean i fetch data success')

        let data = response.data;
        dataUser.push({
          timestamp: data.timestamp,
          time: data.time,
          ctt_amount: data.ctt_amount
        });

        this.setState({ apitime: dataUser[0].time }); // this is start time of count
        this.setState({ timeTillDate: dataUser[0].timestamp });
        this.setState({ count: dataUser[0].sdk_first_meal});
        console.log(this.state.count);

        document.getElementById("continueCount").style.display = "none";
        document.getElementById("countPage").style.display = "block";

        setTimeout(() => {
          this.setState({ loading: false });
          document.getElementById("countdown-timer").style.display = "block";
          document.getElementById("countdown-timer-loading").style.display = "none";
        }, 1000);

        this.setState.count = 0;
        document.getElementById("decButt").disabled = true;
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
      .post(API + "/sdk/increasing/" + line_id, this.state)
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
          // document.getElementById('goodEnding').style.display = "block";
          // document.getElementById('countPage').style.display = "none";
          setTimeout(() => {
            this.setState({ loading: false });
            liff.closeWindow();
          }, 1000);
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
      .post(API + "/sdk/decreasing/" + line_id, this.state)
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
              <img
                src="./register_success.png"
                alt="reg-success"
                className="reg-success"
              ></img>
              {/* {loading ? "กำลังโหลด…" : ""} */}
            </div>

            <div id="newCount" style={{ display: "none" }}>
              <div className="count-header">
                นับลูกดิ้นแบบ Sadovsky (เริ่มนับ)
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
              <div className="count-header">นับลูกดิ้นแบบ Sadovsky (นับต่อจากเดิม)</div>
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
                      <div className="end-time">นับถอยหลัง (12 ชั่วโมง)</div>
                      <div className="countdown-time">{leftTime}</div>
                      <div className="end-time">
                        <span role="img" aria-label="time">
                          เวลาสิ้นสุด 🤖
                        </span>{" "}
                        {endTime}
                      </div>
                    </div>

                    <div id="countdown-timer-loading">
                      <div className="end-time">นับถอยหลัง (12 ชั่วโมง)</div>
                      <div className="countdown-time">กำลังโหลด...</div>
                      <div className="end-time">
                        <span role="img" aria-label="time">
                          เวลาสิ้นสุด 🤖
                        </span>{" "}
                        กำลังโหลด...
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
                <div>
                  <Button
                    id="quitButt"
                    variant="danger"
                    type="submit"
                    // className="count-btn"
                    onClick={this.handleLeavePage}
                    disabled={loading}
                  >
                    {loading ? "ออก" : "ออก"}
                  </Button>
                </div>
              </Form>
            </div>

            {/* ---------------------------------------------------------------------------------------------------------------------------- */}
            {/* ---------------------------------------------------------------------------------------------------------------------------- */}

            {/* finished count (good) */}
            <div id="goodEnding" style={{ display: "none" }}>
              คุณแม่นับลูกดิ้นครบ 3 ครั้งแล้วค่ะ
            </div>

            {/* finished count (bad) */}
            <div id="badEnding" style={{ display: "none" }}>
              คุณแม่นับลูกดิ้นไม่ครบ 3 ครั้งนะคะ
            </div>
          </div>
        </header>
      </div>
    );
  }
}
