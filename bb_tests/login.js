module.exports = {
  'Log in test' : function (browser) {
    browser
      .url('http://localhost:8080/landing')
      .waitForElementVisible('body', 1000)
      .waitForElementVisible('#intro-wrapper', 1000)
      .assert.containsText('#intro-wrapper', 'KNOW IT ALL')

      .assert.containsText('#nav', 'SIGNUP')
      .click('a[id=signup]')
      .assert.containsText('#page-wrapper', 'SIGN UP')
      .click('a[id=login]')

      .assert.containsText('#page-wrapper', 'LOG IN')
      .setValue('input[id=username]', 'nikkangh')
      .setValue('input[id=password]', 'test')
      .click('button[type=submit]')

      .waitForElementVisible('body', 1000)
      .assert.containsText('#nav', 'PROFILE')
      .assert.containsText('#intro-wrapper', 'KNOW IT ALL')

      .pause(1000)
      .end();
  }
};