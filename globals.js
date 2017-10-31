
var chromedriver = require('chromedriver');
var path = require('path');
var driverInstanceCI;

function isRunningInCI() {
  return this.test_settings.globals.integration;
}

function startChromeDriver() {
  if (isRunningInCI.call(this)) {
    var location = path.join(__dirname, '../bin/chromedriver-linux64-2.17');
    driverInstanceCI = require('child_process').execFile(location, []);
    return;
  }

  chromedriver.start();
}

function stopChromeDriver() {
  if (isRunningInCI.call(this)) {
    driverInstanceCI && driverInstanceCI.kill();
    return;
  }

  chromedriver.stop();
}

module.exports = {
  'ci-server' : {
    integration : true
  },

  before : function(done) {
    startChromeDriver.call(this);

    done();
  },

  after : function(done) {
    stopChromeDriver.call(this);

    done();
  }
};