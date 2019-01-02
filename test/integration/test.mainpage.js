/* eslint no-undef: 0 */

casper.test.begin('Dialog simple Demo', 5, function suite(test) {
  var baseHost = 'http://localhost:3000';

  function testWelcomeMessageExists() {
    casper.waitForSelector('.from-watson', function () {
      test.assertExists('.message-inner', 'Welcome message received');
    });
  }

  function testEnterMessageClick() {
    casper.then(function () {
      this.sendKeys('#textInput', 'turn the wipers on');
      this.sendKeys('#textInput', casper.page.event.key.Enter);
    });
    casper.waitForSelector('.from-user', function () {
      test.assertExists('.message-inner', 'Message sent');
      test.assertTextExists('turn the wipers on', 'Message in bubble');
      casper.waitForText('Ok. Turning on the wipers');
    });
  }

  casper.start(baseHost, function () {
    casper.test.comment('Starting Testing');
    test.assertHttpStatus(200, 'conversation-simple is up');
    test.assertTitle('Dialog Chat App', 'Title is correct');

    testWelcomeMessageExists();
    testEnterMessageClick();
  });

  casper.run(function () {
    test.done();
  });
});
