module.exports = {
  'Create (not logged in) test' : function (browser) {
    browser
      .url('http://localhost:8080/landing')
      .waitForElementVisible('body', 1000)
      .waitForElementVisible('#intro-wrapper', 1000)

      .assert.containsText('#intro-wrapper', 'KNOW IT ALL')

      .assert.containsText('#nav', 'CREATE ENTRY')
      .click('a[id=create]')
      
      .waitForElementVisible('body', 1000)
      .assert.containsText('#page-wrapper', 'CREATE SOMETHING NEW')
      .assert.containsText('#content', 'Sorry')
      .assert.containsText('#content', 'Sign up')

      .pause(1000)
      .end();
  }
};