import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const icons = {
  play: 'fa-solid fa-pause',
  pause: 'fa-solid fa-play',
  reset: 'fa-solid fa-arrow-rotate-left'
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      timerState: 'paused',
      time: 1500,
      break: 5,
      session: 25,
      timer: '',
      timerType: 'session'
    };
    this.handleLengthControl = this.handleLengthControl.bind(this);
    this.formatTime = this.formatTime.bind(this);
    this.handleStartStop = this.handleStartStop.bind(this);
    this.countdown = this.countdown.bind(this);
    this.updateTimer = this.updateTimer.bind(this);
    this.reset = this.reset.bind(this);
  }

  // This function handles changing the length of breaks and sessions.
  handleLengthControl(e) {
    if (this.state.timerState === 'running') {
      return;
    }
    const targetID = e.currentTarget.id;
    const targetValue = Number(e.currentTarget.value);
    console.log(targetValue);
    this.setState(state => {
      const stateValue = state[targetID.match(/(break|session)/)[1]]; // The value of the break/session state.
      if ((stateValue === 1 && targetValue === -1) || (stateValue === 60 && targetValue === 1)) {
        return null;
      }
      return {
        [targetID.match(/(break|session)/)[1]]: stateValue + targetValue,
        time: targetID.match(/(break|session)/)[1] === 'session' ? state.time + (targetValue * 60) : state.time
      }
    })
  }

  // This function updates the timer by decrementing the timer by 1 second. It changes the timer type if the timer reaches 0.
  updateTimer() {
    this.setState(state => {
      if (state.time === 0) {
        document.getElementById('beep').currentTime = 0;
        document.getElementById('beep').play();
        return {
          time: state.timerType === 'session' ? state.break * 60 : state.session * 60,
          timerType: state.timerType === 'session' ? 'break' : 'session'
        }
      }
      return {time: state.time - 1}
    })
  }

  // This function starts the timer and adds a clear function to it.
  countdown() {
    let initial, timeout, count, clear;
    this.setState({
      timer: (
        initial = Date.now() + 1000, 
        count = () => {
          initial += 1000;
          timeout = setTimeout(count, initial - Date.now());
          this.updateTimer();
        },
        timeout = setTimeout(count, initial - Date.now()),
        clear = () => {clearTimeout(timeout)},
        { clear: clear }
      )
    })
  }

  // This function starts and pauses the timer.
  handleStartStop() {
    if (this.state.timerState === 'running') {
      this.state.timer && this.state.timer.clear();
      this.setState({ timerState: 'paused' });
    } else {
      this.countdown();
      this.setState({ timerState: 'running' });
    }
  }

  // This function resets the timer to its initial state.
  reset() {
    document.getElementById('beep').pause();
    document.getElementById('beep').currentTime = 0;
    this.state.timer && this.state.timer.clear();
    this.setState({
      timerState: 'paused',
      time: 1500,
      break: 5,
      session: 25,
      timer: '',
      timerType: 'session'
    });
  }

  // This function formats time correctly in mm:ss format.
  formatTime(time) {
    let minutes = Math.floor(time / 60);
    let seconds = time % 60;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    return `${minutes}:${seconds}`;
  }

  render() {
    return (
      <div className='app'>
        <div className='controls'>
          <LengthControl
            label='Break Length'
            length={this.state.break}
            type='break'
            onClick={this.handleLengthControl}
          />
          <LengthControl
            label='Session Length'
            length={this.state.session}
            type='session'
            onClick={this.handleLengthControl}
          />
        </div>
        <Clock
          time={this.formatTime(this.state.time)}
          startStop={this.handleStartStop}
          type={this.state.timerType}
          reset={this.reset}
          playPause={this.state.timerState === 'running' ? icons.play : icons.pause}
        />
      </div>
    )
  }
}

// This component is responsible for changing the break/session length.
function LengthControl(props) {
  return (
    <div className='length'>
      <p id={`${props.type}-label`}>{props.label}</p>
      <div className='control-buttons'>
        <button id={`${props.type}-decrement`} onClick={props.onClick} value={-1}><i className="fa-solid fa-arrow-down"></i></button>
        <div id={`${props.type}-length`}>{props.length}</div>
        <button id={`${props.type}-increment`} onClick={props.onClick} value={1}><i className="fa-solid fa-arrow-up"></i></button>
      </div>
    </div>
  )
}

// This component is responsible for displaying the timer.
function Clock(props) {
  return (
    <div className='timer-container'>
      <div id='timer-label'>{props.type[0].toUpperCase() + props.type.slice(1)}</div>
      <div id='time-left'>
        {props.time}
        <audio id='beep' src='https://vgmsite.com/soundtracks/the-legend-of-zelda-nes/rbvqachdtq/05%20Discovery%20Jingle.mp3' />
      </div>
      <div>
        <button id='start_stop' onClick={props.startStop}><i className={props.playPause}></i></button>
        <button id='reset' onClick={props.reset}><i className={icons.reset}></i></button>
      </div>
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'));

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );
