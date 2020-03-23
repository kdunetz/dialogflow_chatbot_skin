'use strict';

var express = require('express'); // app server
var bodyParser = require('body-parser'); // parser for post requests
var extend = require('util')._extend; // KAD added
var stripTags = require('striptags'); // KAD added

var voice = "en-US-Wavenet-A"; //"es-ES-Standard-A";
var targetLanguage = "en";

var app = express();
var startConversation = true;

// Imports the Google Cloud client library
const textToSpeech = require('@google-cloud/text-to-speech');

// Creates a client
const client = new textToSpeech.TextToSpeechClient();

// Bootstrap application settings
app.use(express.static('./public')); // load UI from public folder
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

// Handle text to speech request from client
app.get('/synthesize', function(req, res) {
  var text2 = req.query.text;
  console.log('Text to Speech .... ' + text2);

  if (text2.indexOf("<!-- quiet") >= 0)
     text2 = text2.substring(0, text.indexOf("<!-- quiet"));

  // Construct the request
  const request = {
    input: {text: stripTags(text2)},
    // Select the language and SSML Voice Gender (optional)
    name: voice,
    voice: {languageCode: targetLanguage, ssmlGender: 'NEUTRAL'},
    // Select the type of audio encoding
    audioConfig: {audioEncoding: 'OGG_OPUS'},
  };
 
  // Performs the Text-to-Speech request
  client.synthesizeSpeech(request, (err, response) => {
    if (err) {
      console.error('ERROR:', err);
      return;
    }
    var ogg = response.audioContent;
    let bufferOriginal = Buffer.from(ogg, 'base64');
    res.writeHead(200, {'Content-Type': 'audio/ogg', 'Content-Transfer-Encoding': 'binary'})
    res.write(bufferOriginal);
//console.log(bufferOriginal);
    res.end();
  });

});

app.post('/speech_to_text', function(req, res, next) {
console.log("Received WAV file");
//console.log(req);
 var jsonString = "";
//console.log(req.body.webmasterfile);
//console.log(req.body);
var fs = require('fs');
      req.on('data', function (data) {
            jsonString += data;
        });

        req.on('end', function () {
            //console.log(jsonString);
//console.log(jsonString);

var bytes = Buffer.from(jsonString, 'base64');

var bytesalso = Buffer.from(jsonString, "utf-8");
var hexString = bytes.toString('hex');
for (var x= 0; x< 120;x =x + 2)
{
    console.log(x/2 + " - " + hexString[x] + hexString[x+1] + " - " + String.fromCharCode(parseInt(hexString[x] + hexString[x+1], 16)));
}
//console.log(bytes.toString('hex').substring(0,50));
//fs.writeFile("/Users/kevindunetz/file.wav", jsonString.toString('utf-8'), function(err){
if (false)
  fs.writeFileSync("/Users/kevindunetz/file.wav", bytes, function (err) { // write the blob to the server as a file

   if(err) console.error(err);
})
var filename = "/Users/kevindunetz/file.wav";
var encoding = "LINEAR16";
var languageCode = "en-US";
var sampleRateHertz = 44100;
asyncRecognize( bytes, encoding, sampleRateHertz, languageCode, res);

});
if (false)
  fs.writeFileSync("/Users/kevindunetz/file.wav", req.body.webmasterfile, function (err) { // write the blob to the server as a file

   if(err) console.error(err);
})

     }); /* end */

const {Translate} = require('@google-cloud/translate');
// Your Google Cloud Platform project ID
//const GCP_projectId = process.env.gcp_projectid ; //'another-project-213615';

// Instantiates a client
const translate = new Translate({
  projectId: process.env.dialogflow_projectid,
});

const projectId = process.env.dialogflow_projectid; //'kadrichtext'; //https://dialogflow.com/docs/agents#settings
const sessionId = 'quickstart-session-id';
const languageCode = 'en-US';
 
// Instantiate a DialogFlow client.
const dialogflow = require('dialogflow');
const sessionClient = new dialogflow.SessionsClient();
 
// Define session path
const sessionPath = sessionClient.sessionPath(projectId, sessionId);
 
// Endpoint to be call from the client side
app.post('/api/message', function(req, res) {

//console.log(JSON.stringify(req.body, ' ', 2));
var query = "";

if (req.body !== undefined && req.body.input !== undefined)
   query = req.body.input.text;

console.log(query);
// The text query request.
  var request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: query,
        languageCode: languageCode,
      },
    },
  };
  if (req.body.input == undefined || (req.body !== undefined && req.body.input !== undefined && req.body.input.text == 'restart'))
  {
     console.log("STARTING CONVERSATION");
     request= {
        session: sessionPath,
        queryInput: {
          event: {
            name: 'WELCOME',
            languageCode: 'en'
          }
        }
     };
     startConversation = false;
  }
// FIRST CHECK FOR BAD LANGUAGE 

// Imports the Google Cloud client library
const language = require('@google-cloud/language');

// Instantiates a client
const client = new language.LanguageServiceClient();

// The text to analyze
//const text = 'Hello, world!';
if (query === 'restart') query = 'happy';
var text = query;

const document = {
  content: text,
  type: 'PLAIN_TEXT',
};

// Detects the sentiment of the text
client
  .analyzeSentiment({document: document})
  .then(results => {
    const sentiment = results[0].documentSentiment;

    console.log(`Text: ${text}`);
    console.log(`Sentiment score: ${sentiment.score}`);
    console.log(`Sentiment magnitude: ${sentiment.magnitude}`);
  if (sentiment.score < -.3)
  {
      var payload = {};
      payload.input = {};
      payload.input.text = query;
      var data = {};
      data.output = {}; 
      data.output.text = "I take it you are not happy";
      data.output.result = {};
      return res.json(updateMessage(payload, data));
  } 
  else
  {
 
// Send request and log result
sessionClient
  .detectIntent(request)
  .then(responses => {
    console.log('Detected intent');
    var result = responses[0].queryResult;
    console.log(JSON.stringify(result, ' ', 2));
    console.log(`  Query: ${result.queryText}`);
    console.log(`  Response: ${result.fulfillmentMessages[0].text.text}`);
    if (result.intent) {
      console.log(`  Intent: ${result.intent.displayName}`);
    } else {
      console.log(`  No intent matched.`);
    }
      var payload = {};
      payload.input = {};
      payload.input.text = query;
      var data = {};
      data.output = {}; 
      data.output.text = result.fulfillmentMessages[0].text.text;
      data.output.result = result;
      if (result.fulfillmentMessages.length > 1 && result.fulfillmentMessages[1].card)
         console.log(result.fulfillmentMessages[1].card.buttons[0].text);

      if (targetLanguage != "en")
      {
         var textContent = data.output.text;
         translate
           .translate(textContent, targetLanguage)
           .then(results => {
             const translation = results[0];
         
             console.log(`Text: ${textContent}`);
             console.log(`Translation: ${translation}`);
             data.output.text = translation;
             return res.json(updateMessage(payload, data));
           })
           .catch(err => {
             console.error('ERROR:', err);
           });
      }
      else
         return res.json(updateMessage(payload, data));
  })
  .catch(err => {
    console.error('ERROR:', err);
  })
  }
  }) // end of sentiment analysis
  .catch(err => {
    console.error('ERROR:', err);
    return results;
  });
});

/**
 * Updates the response text using the intent confidence
 * @param  {Object} input The request to the Conversation service
 * @param  {Object} response The response from the Conversation service
 * @return {Object}          The response with the updated message
 */
function updateMessage(input, response) {
  var responseText = null;
  if (!response.output) {
    response.output = {};
  } else {
    console.log(input);
    if (input && input.input && input.input.text)
    {
       var inp = input.input.text.toLowerCase();
       if (input.input.text.toLowerCase() === 'help')
       {
       }
    }

    var text = input.input.text; 
    if (text === "Spanish language" || text === "Do you speak Spanish" || text === "Do you speak in Spanish" || text === "Please speak Spanish" || text === 'Please speak in Spanish' || text === "You speak Spanish" || text === "spanish" || text === "Spanish" || 
(text.toLowerCase().indexOf("speak") >= 0 && text.toLowerCase().indexOf("spanish") >= 0))
       {
          voice = "es-ES-Standard-A";
          targetLanguage = "es";
          response.output.text = "Si";
       }
       else
       if (text === "French language" || text === "Do you speak French" || text === "Do you speak in French" || text === "Please speak French" || text === 'Please speak in French' || text === "You speak French" || text === "french" || text === "French" || (text.toLowerCase().indexOf("speak") >= 0 && text.toLowerCase().indexOf("french") >= 0))
       {
          voice = "fr-FR-Standard-B";
          targetLanguage = "fr";
          response.output.text = "Oui";
       }
       else if (text === "English language" || text === "Do you speak English" || text === "Do you speak in English" || text === "Please speak English" || text === 'Please speak in English' || text === "You speak English" || text === "english" || text === "English" || (text.toLowerCase().indexOf("speak") >= 0 && text.toLowerCase().indexOf("english") >= 0))
       {
          voice = "en-US-Wavenet-A"; 
          targetLanguage = "en";
          response.output.text = "Yes";
       }
       return response;
  }

  response.output.text = responseText;
  return response;
}

async function asyncRecognize(
  bytes,
  encoding,
  sampleRateHertz,
  languageCode,
  res
) {
  // [START speech_transcribe_async]
  // Imports the Google Cloud client library
  const speech = require('@google-cloud/speech');
  const fs = require('fs');

  // Creates a client
  const client = new speech.SpeechClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const filename = 'Local path to audio file, e.g. /path/to/audio.raw';
  // const encoding = 'Encoding of the audio file, e.g. LINEAR16';
  // const sampleRateHertz = 16000;
  // const languageCode = 'BCP-47 language code, e.g. en-US';

  const config = {
    encoding: encoding,
    sampleRateHertz: sampleRateHertz,
    languageCode: languageCode,
  };
  const audio = {
    //content: fs.readFileSync(filename).toString('base64'),
    //content: fs.readFileSync(filename) KAD BEFORE CHANGING TO bytes Jan 2, 2018
    content: bytes // KAD added this to take bytes directly from incoming bytes from Webpage versus writing file then reading
  };

  const request = {
    config: config,
    audio: audio,
  };

  // Detects speech in the audio file. This creates a recognition job that you
  // can wait for now, or get its result later.
  const [operation] = await client.longRunningRecognize(request);

  // Get a Promise representation of the final result of the job
  const [response] = await operation.promise();
  const transcription = response.results
    .map(result => result.alternatives[0].transcript)
    .join('\n');
  console.log(`Transcription: ${transcription}`);
  // [END speech_transcribe_async]
  res.header('Access-Control-Allow-Origin', '*');
  res.send(transcription);
}

async function naturalLanguage(text)
{
// Imports the Google Cloud client library
const language = require('@google-cloud/language');

// Instantiates a client
const client = new language.LanguageServiceClient();

// The text to analyze
//const text = 'Hello, world!';

const document = {
  content: text,
  type: 'PLAIN_TEXT',
};

// Detects the sentiment of the text
await client
  .analyzeSentiment({document: document})
  .then(results => {
    const sentiment = results[0].documentSentiment;

    console.log(`Text: ${text}`);
    console.log(`Sentiment score: ${sentiment.score}`);
    console.log(`Sentiment magnitude: ${sentiment.magnitude}`);
    //res.send(sentiment.score);
    return results;
  })
  .catch(err => {
    console.error('ERROR:', err);
    return results;
  });
}
module.exports = app;
