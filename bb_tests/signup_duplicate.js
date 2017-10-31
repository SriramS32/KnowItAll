module.exports = {
  'Duplicate signup test' : function (browser) {
    browser
      .url('http://localhost:8080/landing')
      .waitForElementVisible('body', 1000)
      .waitForElementVisible('#intro-wrapper', 1000)
      .assert.containsText('#intro-wrapper', 'KNOW IT ALL')

      .assert.containsText('#nav', 'SIGNUP')
      .click('a[id=signup]')
      .setValue('input[id=username]', 'nikkangh')
      .setValue('input[id=password]', 'test')
      .setValue('input[id=confirmPassword]', 'test')
      .pause(1000)

      .click('button[type=submit]')

      .assert.containsText('#page-wrapper', 'SIGN UP')
      .setValue('input[id=username]', 'nikkangh')
      .setValue('input[id=password]', 'test')
      .click('button[type=submit]')

      .assert.containsText('#page-wrapper', 'SIGN UP')
      .assert.containsText('#page-wrapper', 'Error')

      .pause(1000)
      .end();
  }
};