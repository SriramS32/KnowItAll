module.exports = {
  'Create (logged in) test' : function (browser) {
    browser
      .url('http://localhost:8080/landing')
      .waitForElementVisible('body', 1000)
      .waitForElementVisible('#intro-wrapper', 10000)
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

      .assert.containsText('#nav', 'CREATE ENTRY')
      .click('a[id=create]')

      .pause(1000)
      .waitForElementVisible('body', 1000)

      .assert.containsText('#page-wrapper', 'CREATE SOMETHING NEW')
      .assert.containsText('#content', 'Poll')
      .assert.containsText('#content', 'Rating')

      .pause(1000)
      .end();
  }
};