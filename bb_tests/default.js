module.exports = {
  'Landing test' : function (browser) {
    browser
      .url('http://localhost:8080/')
      .waitForElementVisible('body', 1000)
      .waitForElementVisible('input[type=text]', 1000)
      .waitForElementVisible('input[type=submit', 1000)
      .waitForElementVisible('input[type=checkbox', 1000)

      .assert.containsText('#intro-wrapper', 'KNOW IT ALL')
      .assert.containsText('.wrapper.style2', 'YOUR VOTE COUNTS')
      .assert.containsText('.wrapper.style2', 'Get the most out of your campus')
      .assert.containsText('.wrapper.style2 #intro.container', 'SIGN UP')

      .pause(1000)
      .end();
  }
};