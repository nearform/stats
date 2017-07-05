# stats

Collect stats about your node.js process

## Installation

```
npm i --save stats
```

### Usage

This module exports a function which instantiates an event emitter which emits a single event, `stats`. This event emitter has two functions which can be used to start and stop probing for statistics, `start()` and `stop()`. Listen to the `stats` event to get useful process statistics.

### Example:
```js
const StatsProducer = require('stats')
const statsProducer = new StatsProducer()
statsProducer.start()
statsProducer.on('stats', function (stats) {
  // so something with these stats
})

// some time later...
statsProducer.stop()
```

### API

`StatsProducer(opts)`

Returns an event emitter which emits a `stats` event containing useful stats.

- opts: an `object` which can contain the following properties to set for generating statistics
  - sampleInterval: a `number` representing the amount of seconds to take a sample when running. Defaults to 5 seconds.
  - loopbench: an `object` which is passed to [loopbench](http://npm.im/loopbench) to generate eventloop benchmark stats. Can contain the following properties:
    - sampleInterval: the interval at which the eventLoop should be sampled, defaults to 500.
    - limit: the maximum amount of delay that is tolerated before overLimit becomes true, and the load event is emitted, defaults to 50.

The StatsProducer event emitter which is returned has the following methods.

`statsProducer.start()` - starts the stats producer listening and producing stats.

`statsProducer.stop()` - stops producing stats.

### License

Apache 2.0
