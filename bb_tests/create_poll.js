module.exports = {
  'Create Poll test' : function (browser) {
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
      .assert.containsText('#nav', 'PROFILE')


      .assert.containsText('#nav', 'CREATE ENTRY')
      .click('a[id=create]')

      .pause(1000)
      .waitForElementVisible('body', 1000)

      .assert.containsText('#page-wrapper', 'CREATE SOMETHING NEW')
      .assert.containsText('#content', 'Poll')
      .assert.containsText('#content', 'Rating')

      .setValue('textarea[name=question]', 'test?')
      .setValue('input[name=option1', '1')
      .setValue('input[name=option2', '2')
      .setValue('input[name=option3', '3')
      .setValue('input[name=option4', '4')
      .setValue('input[name=tags]', 't, est, test, testy')
      .setValue('input[name=duration]', '3')
      .click('input[id=createPoll')

      .waitForElementVisible('body', 1000)
      .assert.containsText('#page-wrapper', 'POLL')

      .pause(1000)
      .end();
  }
};