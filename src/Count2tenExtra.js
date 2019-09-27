import React, { Component } from 'react';
import { Button, Form } from "react-bootstrap";
import './App.css';
import axios from 'axios';
import moment from 'moment';

const liff = window.liff;
const API = 'https://babykick-api.herokuapp.com';
//const API = 'http://localhost:3001';

export default class Count2tenExtra extends Component {

    initialize() {
        this.setState({ loading: true });
        liff.init(async () => {
            let profile = await liff.getProfile();
            this.setState({
                line_id: profile.userId
            });
            this.verifyUID();
        });
    }

    verifyUID() {
        //checktimer status and send user to new or continue count
        axios
            .post(API + '/timer/status', this.state)
            .then(response => {
                console.log(response)
                this.setState({ status: response.data.timer_status })

                if (this.state.status === 'timeout') {
                    console.log('state = timeout')
                    document.getElementById('newCount').style.display = "block";
                    document.getElementById('pageisload').style.display = "none";
                    document.getElementById('continueCount').style.display = "none";
                    document.getElementById('extraCount').style.display = "none";
                } else if (this.state.status === 'running') {
                    console.log('state = running')
                    document.getElementById('newCount').style.display = "none";
                    document.getElementById('pageisload').style.display = "none";
                    document.getElementById('continueCount').style.display = "block";
                    document.getElementById('extraCount').style.display = "none";
                }

                this.setState({ loading: false });

            })
            .catch(error => {
                console.log(error)
            })
    }

    constructor(props) {
        super(props);
        this.state = {
            line_id: '',
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
            status_web: ''
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
            .post(API + '/timer/counttoten/second', this.state)
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
            .post(API + '/ctt/increasing/' + line_id, this.state)
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

                if (this.state.count === 10) {
                    console.log('count complete!')
                    document.getElementById('incButt').disabled = true;
                    document.getElementById('goodEnding').style.display = "block";
                    document.getElementById('countPage').style.display = "none";
                    liff.closeWindow();
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
            .post(API + '/ctt/decreasing/' + line_id, this.state)
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

                    <div className="form countdown-time">

                        <div id="pageisload">
                            {loading ? 'กำลังโหลด…' : ''}
                        </div>

                        {/* User already count in this day. */}
                        <div id="alreadyCount">

                        </div>

                        {/* User enter count page (First time of day) */}
                        <div id="newCount" style={{ display: 'none' }}>

                            {/* {this.state.line_id} */}
                            
                            <div className="end-time">
                                นับลูกดิ้นแบบ Count to ten ต่อ (6ชม.)
                            </div>

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
                        <div id="continueCount" style={{ display: 'none' }}>

                            {/* {this.state.line_id} */}

                            <div className="end-time">
                                นับลูกดิ้นแบบ Count to ten ต่อ (6ชม.)
                            </div>

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
                        <div id="countPage" style={{ display: 'none' }}>
                            <Form>
                                <Form.Group>
                                    <Form.Label className="">

                                        <div className="end-time">
                                            นับถอยหลัง (6 ชั่วโมง)
                                        </div>

                                        <div className="countdown-time">
                                            {leftTime}
                                        </div>

                                        <div className="end-time">
                                            เวลาสิ้นสุด <span></span>🤖 {endTime}
                                        </div>

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
                        <div id="goodEnding" style={{ display: 'none' }}>
                            คุณแม่นับครบ 10 ครั้งแล้วค่ะ
                        </div>

                        {/* finished count (bad) */}
                        <div id="badEnding" style={{ display: 'none' }}>
                            คุณแม่นับลูกดิ้นไม่ครบ 10 ครั้งนะคะ
                        </div>

                    </div>
                </header>
            </div>
        );
    }
}