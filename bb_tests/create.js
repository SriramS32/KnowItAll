module.exports = {
  'Create test' : function (browser) {
    browser
      .url('http://localhost:8080/landing')
      .waitForElementVisible('body', 1000)
      .waitForElementVisible('#intro-wrapper', 1000)

      .assert.containsText('#intro-wrapper', 'KNOW IT ALL')

      .assert.containsText('#nav', 'CREATE ENTRY')
      .click('a[href="/new_entry"]')

      .pause(1000)
      .end();
  }
};