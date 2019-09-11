import React, { Component } from 'react';
import { Button, Form } from "react-bootstrap";
import './App.css';
import axios from 'axios';
import moment from 'moment';

const liff = window.liff;
const API = 'https://babykick-api-dev.herokuapp.com';
// const API = 'http://localhost:3001';

export default class Count2tenExtra extends Component {

    // initialize() {
    //     this.setState({ loading: true });
    //     liff.init(async () => {
    //         let profile = await liff.getProfile();
    //         this.setState({
    //             line_id: profile.userId
    //         });
    //         this.verifyUID();
    //     });
    // }

    initialize() {
        this.verifyUID();
    }

    verifyUID() {
        //checktimer status and send user to new or continue count
        axios
            .post(API + '/timer/status', this.state)
            .then(response => {
                console.log(response)
                this.setState({ status: response.data.timer_status })
                this.setState({ sdk_status: response.data.sdk_status })
                this.setState({ extra: response.data.extra })

                if (this.state.status === 'timeout' && this.state.sdk_status === 'enable' && this.state.extra === 'enable') {
                    console.log('state = timeout')
                    document.getElementById('newCount').style.display = "block";
                    document.getElementById('pageisload').style.display = "none";
                    document.getElementById('continueCount').style.display = "none";
                } else if (this.state.status === 'running') {
                    console.log('state = running')
                    document.getElementById('newCount').style.display = "none";
                    document.getElementById('pageisload').style.display = "none";
                    document.getElementById('continueCount').style.display = "block";
                } else if (this.state.status === 'timeout' && this.state.sdk_status === 'disable') {
                    const { line_id } = this.state;
                    axios
                        .post(API + '/push/onlyctt/' + line_id, this.state)
                        .then(response => {
                            console.log(response)

                        })
                        .catch(error => {
                            console.log(error)
                        })
                }
                this.setState({ loading: false });
            })
            .catch(error => {
                console.log(error)
                liff.closeWindow();
            })
    }

    // verifyUID() {
    //     // check if user id is still count
    //     axios
    //       .post(API + '/timer/status', this.state)
    //       .then(response => {
    //         console.log(response)
    //         this.setState({ status: response.data.timer_status })

    //         // check if this uid already count
    //         const { line_id } = this.state;
    //         axios
    //           .post(API + '/check/today/' + line_id, this.state)
    //           .then(response => {
    //             console.log(response)
    //             console.log('Today is not count')
    //             if (this.state.status === 'timeout') {
    //               console.log('state = timeout')
    //               document.getElementById('newCount').style.display = "block";
    //               document.getElementById('pageisload').style.display = "none";
    //               document.getElementById('continueCount').style.display = "none";
    //             } else if (this.state.status === 'running') {
    //               console.log('state = running')
    //               document.getElementById('newCount').style.display = "none";
    //               document.getElementById('pageisload').style.display = "none";
    //               document.getElementById('continueCount').style.display = "block";
    //             }

    //             this.setState({ loading: false });

    //           })
    //           .catch(error => {
    //             console.log(error)
    //             console.log('Today is already count')
    //             // liff.closeWindow();
    //           })

    //       })
    //       .catch(error => {
    //         console.log(error)
    //       })
    // }

    constructor(props) {
        super(props);
        this.state = {
            line_id: 'U50240c7e4d230739b2a4343c4a1da542',
            dataUser: [],
            count: 0,
            loading: false,
            status: '',
            apitime: '',
            timeTillDate: '',
            timestamp: '',
            endTime: '',
            leftTime: '',
            startTime: '',
            status_web: '',
            sdk_status: '',
            extra: ''
        };
        this.initialize = this.initialize.bind(this);
    }

    handleLeavePage(e) {
        e.preventDefault();
    }

    componentDidMount = async () => {
        window.addEventListener('load', this.initialize);
        window.addEventListener('beforeunload', this.handleLeavePage);

        //get all time data
        this.interval = setInterval(async () => {
            const now = moment().unix() * 1000;
            const currentTime = moment(now).format('HH:mm:ss')
            const startTime = moment(this.state.apitime, 'HH:mm:ss').subtract(0, "hours").format('HH:mm:ss') // Real time of this.state.apitime - 7 hours (Local = minus 7, Server = minus 0)
            const endTime = moment(this.state.apitime, 'HH:mm:ss').add(30, "seconds").format('HH:mm:ss') // End time + 5 hours (Local = add 5, Server = add 12)

            const leftTime = moment.utc(moment(endTime, "HH:mm:ss").diff(moment(currentTime, "HH:mm:ss"))).format('HH:mm:ss')

            // if time out
            if (currentTime === endTime) {
                // document.getElementById('badEnding').style.display = "block";
                // document.getElementById('countPage').style.display = "none";
                liff.closeWindow();
            }

            this.setState({ endTime, leftTime, startTime });
        }, 1000);

    }

    componentWillUnmount() {
        window.removeEventListener('beforeunload', this.handleLeavePage);

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
        this.setState({ loading: true });  //set button state to loading (UX)
        axios
            .post(API + '/timer/sadovsky/extra', this.state)
            .then(response => {
                console.log(response)
                this.setState({ apitime: response.data.time }) // this is start time of count
                this.setState({ timeTillDate: response.data.timestamp })

                document.getElementById('newCount').style.display = "none";
                document.getElementById('countPage').style.display = "block";
                this.setState({ loading: false });

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
        this.setState({ loading: true });  //set button state to loading (UX)
        const { dataUser } = this.state;

        axios
            .post(API + '/get/current', this.state)
            .then(response => {
                console.log(response.data)

                let data = response.data
                dataUser.push({
                    timestamp: data.timestamp,
                    time: data.time,
                    ctt_amount: data.ctt_amount
                })

                this.setState({ apitime: dataUser[0].time }) // this is start time of count
                this.setState({ timeTillDate: dataUser[0].timestamp })
                this.setState({ count: dataUser[0].ctt_amount })
                console.log(this.state.count)

                document.getElementById('continueCount').style.display = "none";
                document.getElementById('countPage').style.display = "block";
                this.setState({ loading: false });

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
        this.setState({ loading: true });  //set button state to loading (UX)
        const { line_id } = this.state;

        axios
            .post(API + '/sdk/increasing/extra/' + line_id, this.state)
            .then(response => {
                console.log(response)
                this.setState({ data: response.data })

                this.setState({ count: this.state.count + 1 })
                this.setState({ loading: false });

                if (this.state.count === 0) {
                    console.log('COUNT = 0')
                    document.getElementById('decButt').disabled = true;
                } else {
                    document.getElementById('decButt').disabled = false;
                }

                if (this.state.count === 3) {
                    console.log('count complete!')
                    document.getElementById('decButt').disabled = true;
                    document.getElementById('incButt').disabled = true;
                    // document.getElementById('goodEnding').style.display = "block";
                    // document.getElementById('countPage').style.display = "none";
                    setTimeout(() => {
                        this.setState({ loading: false });
                        liff.closeWindow();
                    }, 1000)
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
        this.setState({ loading: true });  //set button state to loading (UX)
        const { line_id } = this.state;
        axios
            .post(API + '/sdk/decreasing/extra/' + line_id, this.state)
            .then(response => {
                console.log(response)
                this.setState({ data: response.data })
                this.setState({ count: this.state.count - 1 })
                this.setState({ loading: false });

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
        const { endTime, leftTime } = this.state;
        return (
            <div className="App">
                <header className="App-header">

                    <div className="form count-score">

                        <div id="pageisload">
                            {loading ? 'กำลังโหลด…' : ''}
                        </div>
                        
                        {/* User enter count page (First time of day) */}
                        <div id="newCount" style={{ display: 'none' }}>

                            {/* {this.state.line_id} */}

                            <div className="count-header">
                                นับลูกดิ้นแบบ Sadovsky (นับช่วงเย็นเพิ่ม)
                            </div>
                            <div className="end-time">
                                "นับให้ถึง 3 ภายใน 1 ชั่วโมง"
                            </div>
                            <div className="end-time">
                                คุณแม่นับลูกดิ้นในเวลา 1 ชั่วโมง หลังอาหาร 3 เวลา
                            </div>
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
                                    onChange={this.changeHandler} />
                            </Form.Group>

                            <Button variant="danger" type="submit" onClick={this.beginHandler} disabled={loading}>
                                {loading ? 'กำลังโหลด…' : 'เริ่มนับใหม่'}
                            </Button>

                        </div>

                        {/* User comeback to count again. */}
                        <div id="continueCount" style={{ display: 'none' }}>

                            {/* {this.state.line_id} */}

                            <div className="count-header">
                                นับลูกดิ้นแบบ Sadovsky (นับต่อจากเดิม)
                            </div>
                            <div className="end-time">
                                "นับให้ถึง 3 ภายใน 1 ชั่วโมง"
                            </div>
                            <div className="end-time">
                                คุณแม่นับลูกดิ้นในเวลา 1 ชั่วโมง หลังอาหาร 3 เวลา
                            </div>
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
                                    onChange={this.changeHandler} />
                            </Form.Group>

                            <Button variant="danger" type="submit" onClick={this.continueHandler} disabled={loading}>
                                {loading ? 'กำลังโหลด…' : 'นับต่อจากเดิม'}
                            </Button>

                        </div>

                        {/* ---------------------------------------------------------------------------------------------------------------------------- */}
                        {/* ---------------------------------------------------------------------------------------------------------------------------- */}

                        {/* Countpage (obviously...) */}
                        <div id="countPage" style={{ display: 'none' }}>
                            <Form>
                                <Form.Group>
                                    <Form.Label className="">

                                        <div className="end-time">
                                            นับถอยหลัง (1 ชั่วโมง)
                                        </div>

                                        <div className="countdown-time">
                                            {leftTime}
                                        </div>

                                        <div className="end-time">
                                            เวลาสิ้นสุด <span></span>🤖 {endTime}
                                        </div>

                                    </Form.Label>
                                </Form.Group>

                                <Button id="decButt" variant="danger" type="submit" className="count-btn dec-margin" onClick={this.decHandler} disabled={loading}>
                                    {loading ? 'ลด' : 'ลด'}
                                </Button>

                                {this.state.count}/3

                                <Button id="incButt" variant="danger" type="submit" className="count-btn inc-margin" onClick={this.incHandler} disabled={loading}>
                                    {loading ? 'เพิ่ม' : 'เพิ่ม'}
                                </Button>

                            </Form>
                        </div>

                        {/* ---------------------------------------------------------------------------------------------------------------------------- */}
                        {/* ---------------------------------------------------------------------------------------------------------------------------- */}

                        {/* finished count (good) */}
                        <div id="goodEnding" style={{ display: 'none' }}>
                            คุณแม่นับลูกดิ้นครบ 3 ครั้งแล้วค่ะ
                        </div>

                        {/* finished count (bad) */}
                        <div id="badEnding" style={{ display: 'none' }}>
                            คุณแม่นับลูกดิ้นไม่ครบ 3 ครั้งนะคะ
                        </div>

                    </div>
                </header>
            </div>
        );
    }
}
