import React, { PropTypes } from 'react';
import { Button } from 'react-bootstrap';
import Fa from 'components/fa';
import stringUtil from 'lib/string-util';

const adjectives = ['pink', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'white', 'violet', 'black', 'gray', 'silver', 'chrome', 'gold', 'carbon', 'fast', 'speedy', 'comfortable', 'quick', 'swift', 'rapid', 'turbo', 'sporty', 'blistering', 'hasty', 'zippy', 'supersonic', 'steady', 'unshakable', 'nitro', 'muscular', 'sturdy', 'robust', 'solid', 'beefy', 'forceful', 'mighty', 'intense', 'fierce', 'strong', 'overwhelming', 'dominant', 'formidable', 'tenacious', 'vigorous', 'wicked', 'sublime', 'confident', 'grandeur', 'majestic', 'glorious', 'grand', 'jolly good', 'grand theft'],
      nouns = ['auto', 'warrior', 'racer', 'wheels', 'pup', 'meteor', 'engine', 'tank', 'motor', 'wagon', 'comet', 'bolt', 'rascal', 'trigger', 'beast', 'ogre', 'horsepower', 'rottweiler', 'cheetah', 'dagger', 'bullet', 'missile', 'tornado', 'box', 'moustache', 'rambo', 'vroom', 'fireball', 'ghost', 'speeder', 'mothership', 'stallion', 'trucker', 'beauty', 'exploder', 'tires', 'baby', 'intercooler', 'tachyon', 'frog', 'firefly', 'wave', 'lightning', 'thunder', 'kings landing', 'winterfell', 'white harbor', 'riverrun', 'harrenhal', 'lannisport', 'casterly rock', 'kingswood', 'blackwater bay', 'dragonstone', 'highgarden', 'storms end'];

function randomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export default class GenerateRandomNameButton extends React.Component {
  displayName = 'GenerateRandomNameButton';

  static propTypes = {
    onGenerate: PropTypes.func
  };

  generate() {
    const name = stringUtil.titleize(`${randomElement(adjectives)} ${randomElement(nouns)}`);
    if (typeof this.props.onGenerate === 'function') {
      this.props.onGenerate(name);
    }
  }

  handleClick = () => {
    this.generate();
  };

  render() {
    return (
      <Button className='generate-random-name-button-component' onClick={this.handleClick}>
        <Fa icon='magic' />
      </Button>
    );
  }
}
