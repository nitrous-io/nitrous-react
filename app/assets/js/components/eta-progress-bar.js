import React, { PropTypes } from 'react';
import { ProgressBar } from 'react-bootstrap';
import classNames from 'classnames';

export default class EtaProgressBar extends React.Component {
  displayName = 'EtaProgressBar';
  _timer = null;

  static propTypes = {
    eta: PropTypes.number.isRequired,
    done: PropTypes.bool.isRequired
  };

  static defaultProps = {
    done: false
  };

  state = {
    animated: false,
    now: 0
  };

  constructor(props, context) {
    super(props, context);

    if (props.done) {
      this.state = { animated: true, now: 100 };
    } else {
      this.state = { animated: false, now: 0 };
      this.startTimer();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.done) {
      window.clearInterval(this._timer);
      this.setState({ now: 100, animated: true });
    } else {
      this.setState({ now: 0, animated: false });
      this.startTimer(nextProps.eta);
    }
  }

  componentWillUnmount() {
    window.clearInterval(this._timer);
  }

  startTimer(eta=this.props.eta) {
    const percentagePerTick = 100 / eta;

    window.clearInterval(this._timer);
    this._timer = window.setInterval(() => {
      let { now } = this.state;

      now += percentagePerTick;
      if (now >= 80) {
        now = 80;
        window.clearInterval(this._timer);
      }

      this.setState({ now, animated: true });
    }, 1000);
  }

  render() {
    const { eta, done, ...transferredProps } = this.props;

    return (
      <div className={classNames('eta-progress-bar-component', { animated: this.state.animated })}>
        <ProgressBar {...transferredProps} ref='progressBar' now={this.state.now} active />
      </div>
    );
  }
}
