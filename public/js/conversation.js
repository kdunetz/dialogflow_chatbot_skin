// The ConversationPanel module is designed to handle
// all display and behaviors of the conversation column of the app.
/* eslint no-unused-vars: "off" */
/* global Api: true, Common: true*/

var ConversationPanel = (function() {

  var settings = {
    selectors: {
      chatBox: '#scrollingChat',
      fromUser: '.from-user',
      fromDialogflow: '.from-dialogflow',
      latest: '.latest'
    },
    authorTypes: {
      user: 'user',
      dialogflow: 'dialogflow'
    }
  };

  // Publicly accessible methods defined
  return {
    init: init,
    inputKeyDown: inputKeyDown
  };

  // Initialize the module

  function init() {
    if (false)
    {
       document.getElementById('payload-column').style.visibility = 'hidden'; // KAD added to hide the payload
       document.getElementById('view-change-button').style.visibility = 'hidden'; // KAD added to hide the payload
    }
    chatUpdateSetup();
    Api.sendRequest( '', null );
    setupInputBox();
  }
  // Set up callbacks on payload setters in Api module
  // This causes the displayMessage function to be called when messages are sent / received
  function chatUpdateSetup() {
    var currentRequestPayloadSetter = Api.setRequestPayload;
    Api.setRequestPayload = function(newPayloadStr) {
      currentRequestPayloadSetter.call(Api, newPayloadStr);
      displayMessage(JSON.parse(newPayloadStr), settings.authorTypes.user);
    };

    var currentResponsePayloadSetter = Api.setResponsePayload;
    Api.setResponsePayload = function(newPayloadStr) {
      currentResponsePayloadSetter.call(Api, newPayloadStr);
      displayMessage(JSON.parse(newPayloadStr), settings.authorTypes.dialogflow);
    };
  }

// Set up the input box to underline text as it is typed
  // This is done by creating a hidden dummy version of the input box that
  // is used to determine what the width of the input text should be.
  // This value is then used to set the new width of the visible input box.
  function setupInputBox() {
    var input = document.getElementById('textInput');
    var dummy = document.getElementById('textInputDummy');
    var minFontSize = 14;
    var maxFontSize = 16;
    var minPadding = 4;
    var maxPadding = 6;

    // If no dummy input box exists, create one
    if (dummy === null) {
      var dummyJson = {
        'tagName': 'div',
        'attributes': [{
          'name': 'id',
          'value': 'textInputDummy'
        }]
      };

      dummy = Common.buildDomElement(dummyJson);
      document.body.appendChild(dummy);
    }

    function adjustInput() {
      if (input.value === '') {
        // If the input box is empty, remove the underline
        input.classList.remove('underline');
        input.setAttribute('style', 'width:' + '100%');
        input.style.width = '100%';
      } else {
        // otherwise, adjust the dummy text to match, and then set the width of
        // the visible input box to match it (thus extending the underline)
        input.classList.add('underline');
        var txtNode = document.createTextNode(input.value);
        ['font-size', 'font-style', 'font-weight', 'font-family', 'line-height',
          'text-transform', 'letter-spacing'].forEach(function(index) {
            dummy.style[index] = window.getComputedStyle(input, null).getPropertyValue(index);
          });
        dummy.textContent = txtNode.textContent;

        var padding = 0;
        var htmlElem = document.getElementsByTagName('html')[0];
        var currentFontSize = parseInt(window.getComputedStyle(htmlElem, null).getPropertyValue('font-size'), 10);
        if (currentFontSize) {
          padding = Math.floor((currentFontSize - minFontSize) / (maxFontSize - minFontSize)
            * (maxPadding - minPadding) + minPadding);
        } else {
          padding = maxPadding;
        }

        var widthValue = ( dummy.offsetWidth + padding) + 'px';
        input.setAttribute('style', 'width:' + widthValue);
        input.style.width = widthValue;
      }
    }

    // Any time the input changes, or the window resizes, adjust the size of the input box
    input.addEventListener('input', adjustInput);
    window.addEventListener('resize', adjustInput);

    // Trigger the input event once to set up the input box and dummy element
    Common.fireEvent(input, 'input');
  }

  // Display a user or Dialogflow message that has just been sent/received
  function displayMessage(newPayload, typeValue) {
    var isUser = isUserMessage(typeValue);
    var textExists = (newPayload.input && newPayload.input.text)
      || (newPayload.output && newPayload.output.text);
if (newPayload.output && newPayload.output.text)
{
console.log("IN HERE KEVIN 1 " + newPayload.output.text);
        var theText = newPayload.output.text.toString();
        theText = theText.replace(/\./g,' ');
        var streamingURL = '/synthesize?text=' + encodeURIComponent(theText);
        var audio = document.getElementById('audio');
        //var audio = $('.audio').get(0);
        audio.src = streamingURL;
        audio.play();
}
    if (isUser !== null && textExists) {
      // Create new message DOM element
      var messageDivs = buildMessageDomElements(newPayload, isUser);
      var chatBoxElement = document.querySelector(settings.selectors.chatBox);
      var previousLatest = chatBoxElement.querySelectorAll((isUser
              ? settings.selectors.fromUser : settings.selectors.fromDialogflow)
              + settings.selectors.latest);
      // Previous "latest" message is no longer the most recent
      if (previousLatest) {
        Common.listForEach(previousLatest, function(element) {
          element.classList.remove('latest');
        });
      }

      messageDivs.forEach(function(currentDiv) {
        chatBoxElement.appendChild(currentDiv);
        // Class to start fade in animation
        currentDiv.classList.add('load');
      });
      // Move chat to the most recent messages when new messages are added
      scrollToChatBottom();
    }
  }

  // Checks if the given typeValue matches with the user "name", the Dialogflow "name", or neither
  // Returns true if user, false if Dialogflow, and null if neither
  // Used to keep track of whether a message was from the user or Dialogflow
  function isUserMessage(typeValue) {
    if (typeValue === settings.authorTypes.user) {
      return true;
    } else if (typeValue === settings.authorTypes.dialogflow) {
      return false;
    }
    return null;
  }

  // Constructs new DOM element from a message payload
  function buildMessageDomElements(newPayload, isUser) {
    var textArray = isUser ? newPayload.input.text : newPayload.output.text;
    if (Object.prototype.toString.call( textArray ) !== '[object Array]') {
      textArray = [textArray];
    }
    var messageArray = [];
// KAD console.log(JSON.stringify(newPayload, ' ', 2));
    var buttons = "";
    var href = "";
    var image = "";
    var title = "";
    var subtitle = "";
    var cardImage = "";
    var image2 = "";
if (newPayload.output && newPayload.output.result.fulfillmentMessages)
    for (var a = 1;a<newPayload.output.result.fulfillmentMessages.length;a++)
    {
       if (newPayload.output && newPayload.output.result.fulfillmentMessages.length > 1 && newPayload.output.result.fulfillmentMessages[a].card)
       {
          console.log("KAD " + newPayload.output.result.fulfillmentMessages[a].card.buttons[0].text)
          buttons = newPayload.output.result.fulfillmentMessages[a].card.buttons[0].text;
          href = newPayload.output.result.fulfillmentMessages[a].card.buttons[0].postback;
          cardImage = newPayload.output.result.fulfillmentMessages[a].card.imageUri;
          title = newPayload.output.result.fulfillmentMessages[a].card.title;
          subtitle = newPayload.output.result.fulfillmentMessages[a].card.subtitle;
       }
       if (newPayload.output.result.fulfillmentMessages[a].image)
       {
          image2 = newPayload.output.result.fulfillmentMessages[a].image.imageUri;
       } 
       var quickreplies = [];
       if (newPayload.output && newPayload.output.result.fulfillmentMessages.length > 1 && newPayload.output.result.fulfillmentMessages[a].quickReplies)
       {
          for (var x=0;x<newPayload.output.result.fulfillmentMessages[a].quickReplies.quickReplies.length;x++)
          {
             quickreplies.push(newPayload.output.result.fulfillmentMessages[a].quickReplies.quickReplies[x]);
          }
       }
    }

    textArray.forEach(function(currentText) {
      var array = [
         {
                // <p>{messageText}</p>
                'tagName': 'p',
                'text': currentText 
         }];
         if (cardImage)
            array.push(
            {
                'tagName': 'img',
                'text': "image1",
                    'attributes': [{
                      'name': 'src',
                      'value': cardImage 
                    }
                    ,{
                      'name': 'width',
                      'value': "100%" 
                    }
                    ]
            });
         if (image2)
            array.push(
            {
                'tagName': 'img',
                'text': "image2",
                    'attributes': [{
                      'name': 'src',
                      'value': image2 
                    }
                    ,{
                      'name': 'width',
                      'value': "100%" 
                    }
                    ]
            });
         if (href)
            array.push(
            {
                'tagName': 'a',
                'text': buttons,
                    'attributes': [{
                      'name': 'href',
                      'value': href 
                    }]
            }
         );
         if (false && title)
            array.push(
            {
                // <p>{messageText}</p>
                'tagName': 'p',
                'text': title 
            }
         );

         if (subtitle)
            array.push(
            {
                // <p>{messageText}</p>
                'tagName': 'p',
                'text': subtitle 
            }
         )

         if (newPayload.output)
         {
            if (quickreplies)
               for (var x=0;x< quickreplies.length;x++)
               {
                  array.push(
                  {
                      'tagName': 'a',
                      'text': quickreplies[x],
                      'attributes': [
                         {
                            'name': 'class',
                            'value': 'btn btn-primary' 
                         },
                         {
                            'name': 'onClick',
                            'value': 'javascript: document.getElementById("textInput").value = "' + quickreplies[x] + '"; event.keyCode = 13; ConversationPanel.inputKeyDown(event, document.getElementById("textInput"));'
                         }
                      ]
                  });
               }
         }
      
      if (currentText) {
        var messageJson = {
          // <div class='segments'>
          'tagName': 'div',
          'classNames': ['segments'],
          'children': [{
            // <div class='from-user/from-dialogflow latest'>
            'tagName': 'div',
            'classNames': [(isUser ? 'from-user' : 'from-dialogflow'), 'latest', ((messageArray.length === 0) ? 'top' : 'sub')],
            'children': [{
              // <div class='message-inner'>
              'tagName': 'div',
              'classNames': ['message-inner'],
              'children': array
            }]
          }]
        };
        messageArray.push(Common.buildDomElement(messageJson));
      }
    });

    return messageArray;
  }

  // Scroll to the bottom of the chat window (to the most recent messages)
  // Note: this method will bring the most recent user message into view,
  //   even if the most recent message is from Dialogflow.
  //   This is done so that the "context" of the conversation is maintained in the view,
  //   even if the Dialogflow message is long.
  function scrollToChatBottom() {
    var scrollingChat = document.querySelector('#scrollingChat');

    // Scroll to the latest message sent by the user
    var scrollEl = scrollingChat.querySelector(settings.selectors.fromUser
            + settings.selectors.latest);
    if (scrollEl) {
      scrollingChat.scrollTop = scrollEl.offsetTop;
    }
  }

  // Handles the submission of input
  function inputKeyDown(event, inputBox) {
    // Submit on enter key, dis-allowing blank messages
    if (event.keyCode === 13 && inputBox.value) {
      // Retrieve the context from the previous server response
      var context;
      var latestResponse = Api.getResponsePayload();
      if (latestResponse) {
        context = latestResponse.context;
      }

      // Send the user message
      Api.sendRequest(inputBox.value, context);

      // Clear input box for further messages
      inputBox.value = '';
      Common.fireEvent(inputBox, 'input');
    }
  }
}());
