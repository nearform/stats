'use strict'

const inherits = require('util').inherits
const EE = require('events').EventEmitter
const process = require('process')
const os = require('os')
const reInterval = require('reinterval')
const loopbench = require('loopbench')
const gcProfiler = require('gc-profiler')

function StatsProducer (optsArg) {
  if (!(this instanceof StatsProducer)) {
    return new StatsProducer(optsArg)
  }
  const opts = optsArg || {}
  this._opts = {
    loopbench: {
      sampleInterval: opts.eventLoopSampleInterval || 500,
      limit: opts.eventLoopLimit || 50
    },
    sampleInterval: opts.sampleInterval || 5
  }
  this._probing = false
  this._loopbench = undefined
  this._gcProfiler = gcProfiler
  this._gcs = []

  this._emitInterval = reInterval(() => this.emit('stats', this._regenerateStats()), this._opts.sampleInterval * 1000)
  this._emitInterval.clear()

  this.stats = {
    timestamp: new Date(),
    process: {
      title: process.title,
      pid: process.pid,
      release: process.release,
      versions: process.versions,
      argv: process.argv,
      execArgv: process.execArgv,
      execPath: process.execPath,
      mainModule: process.mainModule,
      uptime: process.uptime()
    },
    system: {
      cpus: os.cpus(),
      uptime: os.uptime(),
      freemem: os.freemem(),
      loadavg: os.loadavg(),
      platform: process.platform,
      arch: process.arch
    },
    eventLoop: {},
    gcRuns: []
  }
}

inherits(StatsProducer, EE)

StatsProducer.prototype.start = function () {
  if (this._probing) return

  this._probing = true

  this._loopbench = loopbench(this._opts.loopbench)

  this._gcProfiler.on('gc', (stats) => this._gcs.push(stats))

  this._emitInterval.reschedule(this._opts.sampleInterval * 1000)
}

StatsProducer.prototype.stop = function () {
  if (!this._probing) return

  // emit final stats
  this.emit('stats', this._regenerateStats())

  this._probing = false

  this._loopbench.stop()
  this._loopbench.removeAllListeners()
  this._loopbench = undefined

  this._gcProfiler.removeAllListeners()

  this._emitInterval.clear()
}

StatsProducer.prototype._regenerateStats = function () {
  // update meta
  this.stats.timestamp = new Date()

  this.stats.process.uptime = process.uptime()
  this.stats.system.uptime = os.uptime()
  this.stats.system.freemem = os.freemem()
  this.stats.system.loadavg = os.loadavg()

  this.stats.eventLoop = {
    delay: this._loopbench.delay,
    limit: this._loopbench.limit,
    overLimit: this._loopbench.overLimit
  }

  this.stats.gc = this._gcs.splice(0)

  return this.stats
}

module.exports = StatsProducer
