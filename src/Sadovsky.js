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
    console.log('Entering initialize state...')
    this.setState({ loading: true });
    liff.init(async () => {
      let profile = await liff.getProfile();
      this.setState({
        line_id: profile.userId
      });
      this.checkToday();
      // this.verifyUID();
    });
  }

  // initialize() {
  //   this.checkToday();
  //   // this.verifyUID();
  // }

  checkToday() {
    this.setState({ loading: true });
    const { line_id } = this.state;
    axios // check if today is already count
      .post(API + "/check/today/" + line_id, this.state)
      .then(response => {
        if (response.data.message === "line id not found.") {
          document.getElementById("pageisload").style.display = "none";
          document.getElementById("failurePage").style.display = "block";
          setTimeout(() => {
            this.setState({ loading: false });
            liff.closeWindow();
          }, 2000);
        } else {
          console.log("User can count today");
          axios // check if user can use sdk count at this time
            .post(API + "/check/sdk/" + line_id, this.state)
            .then(response => {
              console.log(response);
              console.log("User can count sdk at this time");
              this.verifyUID();
            })
            .catch(error => {
              console.log(error);
              console.log("User can not count sdk at this time");
              liff.closeWindow();
            });
        }
      })
      .catch(error => {
        console.log(error);
        console.log("User can not count today");
        liff.closeWindow();
      });
  }

  verifyUID() {
    axios //checktimer status and send user to count
      .post(API + "/timer/status", this.state)
      .then(response => {
        console.log(response);
        this.setState({
          status: response.data.timer_status,
          sdk_status: response.data.sdk_status,
          countType: response.data.count_type
        });

        if (
          this.state.status === "timeout" &&
          this.state.sdk_status === "enable"
        ) {
          document.getElementById("newCount").style.display = "block";
          document.getElementById("pageisload").style.display = "none";
        } else if (
          this.state.status === "running" &&
          this.state.countType === "sdk"
        ) {
          console.log("User still in sdk");

          const { dataUser } = this.state;
          axios
            .post(API + "/get/current", this.state)
            .then(response => {
              let data = response.data;
              dataUser.push({
                timestamp: data.timestamp,
                time: data.time,
                sdk_first_meal: data.sdk_first_meal,
                sdk_second_meal: data.sdk_second_meal,
                sdk_third_meal: data.sdk_third_meal,
                sdk_all_meal: data.sdk_all_meal,
                sdk_extra_meal: data.sdk_extra_meal,
                status: data.status
              });

              this.setState({
                countAll: dataUser[0].sdk_all_meal,
                count_status: dataUser[0].status,
                apitime: dataUser[0].time,
                timeTillDate: dataUser[0].timestamp
              });

              console.log("SDK_all_meal value = " + this.state.countAll);

              if (this.state.count_status === "1st") {
                this.setState({ count: dataUser[0].sdk_first_meal });
              } else if (this.state.count_status === "2nd") {
                this.setState({ count: dataUser[0].sdk_second_meal });
              } else if (this.state.count_status === "3rd") {
                this.setState({ count: dataUser[0].sdk_third_meal });
              } else if (this.state.count_status === "extra") {
                this.setState({ count: dataUser[0].sdk_extra_meal });
              }

              document.getElementById("pageisload").style.display = "none";
              document.getElementById("countPage").style.display = "block";

              setTimeout(() => {
                this.setState({ loading: false });
                document.getElementById("countdown-timer").style.display =
                  "block";
                document.getElementById(
                  "countdown-timer-loading"
                ).style.display = "none";

                if (this.state.count === 0) {
                  document.getElementById("decButt").disabled = true;
                } else {
                  document.getElementById("decButt").disabled = false;
                }
              }, 1000);
            })
            .catch(error => {
              console.log(error);
            });
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
        } else if (
          this.state.status === "running" &&
          this.state.countType === "ctt"
        ) {
          console.log("User still in ctt!");
          axios
            .post(API + "/check/btn/", this.state)
            .then(response => {
              console.log(response);
              liff.closeWindow();
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
      countAll: 0,
      count_sdk: 0,
      loading: false,
      status: "",
      apitime: "",
      timeTillDate: "",
      timestamp: "",
      endTime: "",
      leftTime: "",
      startTime: "",
      status_web: "exit",
      count_status: "",
      countType: ""
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
        .add(1, "hours")
        .format("HH:mm:ss"); // End time + 5 hours (Local = add 5, Server = add 12)

      const leftTime = moment
        .utc(moment(endTime, "HH:mm:ss").diff(moment(currentTime, "HH:mm:ss")))
        .format("HH:mm:ss");

      // if time out
      if (currentTime === endTime && this.state.count >= 3) {
        document.getElementById("goodEnding").style.display = "block";
        document.getElementById("countPage").style.display = "none";
        setTimeout(() => {
          this.setState({ loading: false });
          liff.closeWindow();
        }, 2000);
      } else if (currentTime === endTime && this.state.count < 3) {
        document.getElementById("badEnding").style.display = "block";
        document.getElementById("countPage").style.display = "none";
        setTimeout(() => {
          this.setState({ loading: false });
          liff.closeWindow();
        }, 2000);
      } else if (
        currentTime === endTime &&
        this.state.count < 3 &&
        this.state.count_status === "3rd"
      ) {
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
      .post(API + "/timer/sadovsky", this.state)
      .then(response => {
        console.log(response);
        this.setState({ apitime: response.data.time }); // this is start time of count
        this.setState({ timeTillDate: response.data.timestamp });

        const { dataUser } = this.state;
        axios
          .post(API + "/get/current", this.state)
          .then(response => {
            let data = response.data;
            dataUser.push({
              sdk_all_meal: data.sdk_all_meal,
              status: data.status
            });
            this.setState({ countAll: dataUser[0].sdk_all_meal });
            this.setState({ count_status: dataUser[0].status });
            console.log("SDK_all_meal value = " + this.state.countAll);
          })
          .catch(error => {
            console.log(error);
          });

        document.getElementById("newCount").style.display = "none";
        document.getElementById("countPage").style.display = "block";

        setTimeout(() => {
          // this is a time out for loading time (UX)
          this.setState({ loading: false });
          document.getElementById("countdown-timer").style.display = "block";
          document.getElementById("countdown-timer-loading").style.display = "none";

          if (this.state.count === 0) {
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
    this.setState({ loading: true }); //set button state to loading (UX)
    const { line_id } = this.state;

    axios
      .post(API + "/sdk/increasing/" + line_id, this.state)
      .then(response => {
        console.log(response);
        this.setState({ data: response.data });
        this.setState({ loading: false });

        this.setState({ count: this.state.count + 1 });
        this.setState({ countAll: this.state.countAll + 1 });
        console.log("All time count = " + this.state.countAll);

        if (this.state.count === 3) {
          document.getElementById("finishcount").style.display = "block";
          document.getElementById("goalcount").style.display = "none";
        }

        if (this.state.count === 3 && this.state.count_status === "3rd") {
          document.getElementById("decButt").disabled = true;
          document.getElementById("incButt").disabled = true;
          document.getElementById("goodEnding").style.display = "block";
          document.getElementById("countPage").style.display = "none";
          setTimeout(() => {
            this.setState({ loading: false });
            liff.closeWindow();
          }, 2000);
        }

        if (this.state.count === 10) {
          document.getElementById("decButt").disabled = true;
          document.getElementById("incButt").disabled = true;
          document.getElementById("goodEnding").style.display = "block";
          document.getElementById("countPage").style.display = "none";
          setTimeout(() => {
            this.setState({ loading: false });
            liff.closeWindow();
          }, 2000);
        }

        if (this.state.countAll > 9 && this.state.count_status === "3rd") {
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
    this.setState({ loading: true }); //set button state to loading (UX)
    const { line_id } = this.state;
    axios
      .post(API + "/sdk/decreasing/" + line_id, this.state)
      .then(response => {
        console.log(response);
        this.setState({ data: response.data });
        this.setState({ loading: false });

        this.setState({ count: this.state.count - 1 });
        this.setState({ countAll: this.state.countAll - 1 });
        console.log("All time count = " + this.state.countAll);

        if (this.state.count === 0) {
          console.log("Count is zero: lock decrease button");
          document.getElementById("decButt").disabled = true;
        } else {
          document.getElementById("decButt").disabled = false;
        }

        if (this.state.count < 3) {
          document.getElementById("finishcount").style.display = "none";
          document.getElementById("goalcount").style.display = "block";
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
              <img src="./baby-love.png" alt="bg-right-down" className="failed bg-right-down"></img>
              <div className="count-header">การนับแบบ Sadovsky<span></span>🚀</div>
              <div className="end-time">การนับให้ถึง 3 ครั้ง ภายในเวลา 1 ชั่วโมง</div>
              <div className="end-time">หลังมื้อโดยในแต่ละมื้อต้องนับให้ได้ 3 ครั้งขึ้นไป</div>

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

            {/* ---------------------------------------------------------------------------------------------------------------------------- */}
            {/* ---------------------------------------------------------------------------------------------------------------------------- */}

            {/* Countpage (obviously...) */}
            <div id="countPage" style={{ display: "none" }}>
            <img src="./baby-left.png" alt="bg-left" className="bg-left"></img>
              <Form>
                <Form.Group className="time-form">
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

                <div
                  id="goalcount"
                  className="sadov-count"
                  style={{ display: "block" }}
                >
                  <span role="img" aria-label="time">
                    เป้าหมายการนับครั้งนี้คือ
                  </span>{" "}
                  3 ครั้ง🚩
                </div>
                <div
                  id="finishcount"
                  className="sadov-count"
                  style={{ display: "none" }}
                >
                  <span role="img" aria-label="time">
                    คุณแม่นับครบ
                  </span>{" "}
                  3 ครั้งแล้วค่ะ🚩
                </div>

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
                {this.state.count}
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
                  <img
                    src="./quit.png"
                    alt="quit"
                    className="quit"
                    onClick={this.handleLeavePage}
                    disabled={loading}
                  ></img>
                </div>
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
              <img src="./bad_count.png" alt="bad" className="bad"></img>
            </div>

            <div id="failurePage" style={{ display: "none" }}>
              <img src="./failure.png" alt="failed" className="failed"></img>
              <br></br>
              <div className="end-time"> ไม่พบ UID นี้ในระบบ! </div>
              <div className="end-time"> กรุณาลงทะเบียนค่ะ </div>
            </div>
          </div>
        </header>
      </div>
    );
  }
}