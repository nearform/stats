'use strict'

const test = require('tape')
const StatsProducer = require('../')

test('stats producer initialises with defaults as expected', (t) => {
  const statsProducer = new StatsProducer()

  t.false(statsProducer._probing)

  t.equal(statsProducer._opts.loopbench.sampleInterval, 500, 'Stats producer should initialise with the correct defaults')
  t.equal(statsProducer._opts.loopbench.limit, 50, 'Stats producer should initialise with the correct defaults')
  t.equal(statsProducer._opts.sampleInterval, 5, 'Stats producer should initialise with the correct defaults')
  t.end()
})

test('stats producer runs as expected with defaults', {timeout: 20000}, (t) => {
  const statsProducer = new StatsProducer()

  t.false(statsProducer._probing)

  statsProducer.start()

  t.true(statsProducer._probing)

  let numberOfGeneratedStats = 0
  statsProducer.on('stats', (stats) => {
    t.ok(stats.timestamp)
    t.ok(stats.process)
    t.ok(stats.system)
    t.ok(stats.eventLoop)

    numberOfGeneratedStats++
  })

  setTimeout(() => {
    t.true(statsProducer._probing, 'should be running')
    statsProducer.stop()
    t.false(statsProducer._probing, 'should no longer be running')
  }, 11000)

  setTimeout(() => {
    t.true(numberOfGeneratedStats === 3, 'stats producer only runs an expected amount of times')
    t.end()
  }, 16000)
})

test('stats producer runs as expected with with overwritten defaults', {timeout: 5000}, (t) => {
  const statsProducer = new StatsProducer({sampleInterval: 1})

  t.false(statsProducer._probing)

  statsProducer.start()

  t.true(statsProducer._probing)

  let numberOfGeneratedStats = 0
  statsProducer.on('stats', (stats) => {
    t.ok(stats.timestamp)
    t.ok(stats.process)
    t.ok(stats.system)
    t.ok(stats.eventLoop)

    numberOfGeneratedStats++
  })

  setTimeout(() => {
    t.true(statsProducer._probing, 'should be running')
    statsProducer.stop()
    t.false(statsProducer._probing, 'should no longer be running')
  }, 3500)

  setTimeout(() => {
    t.true(numberOfGeneratedStats === 4, 'stats producer only runs an expected amount of times')
    t.end()
  }, 4000)
})

test('stats producer shouldn\'t emit anything if never started', {timeout: 5000}, (t) => {
  const statsProducer = new StatsProducer({sampleInterval: 1})
  t.false(statsProducer._probing)
  setTimeout(() => {
    t.false(statsProducer._probing)
    t.end()
  }, 4000)
})
