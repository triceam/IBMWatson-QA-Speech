/*jshint node:true*/

// app.js
// This file contains the server side JavaScript code for your application.
// This sample application uses express as web application framework (http://expressjs.com/),
// and jade as template engine (http://jade-lang.com/).

var express = require('express'),
  app = express(),
  server = require('http').createServer(app),
  io = require('socket.io').listen(server),
  fs = require('fs'),
  bluemix = require('./config/bluemix'),
  watson = require('watson-developer-cloud'),
  extend = require('util')._extend,
  UAparser = require('ua-parser-js');

// setup middleware
app.use(express.errorHandler());
app.use(express.urlencoded()); // to support URL-encoded bodies
app.use(app.router);

app.use(express.static(__dirname + '/public')); //setup static public directory
app.set('view engine', 'jade');
app.set('views', __dirname + '/views'); //optional since express defaults to CWD/views

// There are many useful environment variables available in process.env.
// VCAP_APPLICATION contains useful information about a deployed application.
var appInfo = JSON.parse(process.env.VCAP_APPLICATION || "{}");


// setup credentials - populate the url, username and password if you're running on a local node.js environment

var QA_CREDENTIALS = extend({
    "url": "https://gateway.watsonplatform.net/qagw/service",
    "username": "<Watson QA Username>",
    "password": "<Watson QA Password>",
    version: 'v1',
    dataset: 'healthcare'
}, bluemix.getServiceCreds('question_and_answer')); 

var TTS_CREDENTIALS = extend({
    "url": "https://stream.watsonplatform.net/text-to-speech-beta/api",
    "username": "<Watson Text To Speech Username>",
    "password": "<Watson Text To Speech Password>"
}, bluemix.getServiceCreds('text_to_speech')); 

var STT_CREDENTIALS = extend({
    "version":'v1',
    "url": "https://stream.watsonplatform.net/speech-to-text-beta/api",
    "username": "<Watson Speech To Text Username>",
    "password": "<Watson Speech To Text Password>"
}, bluemix.getServiceCreds('speech_to_text')); 




// *****************************************************
//setup watson services
// *****************************************************

var watson = require('watson-developer-cloud');
var question_and_answer_healthcare = watson.question_and_answer(QA_CREDENTIALS);
var speechToText = watson.speech_to_text(STT_CREDENTIALS);


// setup sockets
require('./config/socket')(io, speechToText);




// *****************************************************
// setup url endpoints
// *****************************************************

// render index page
app.get('/', function(req, res){
    res.render('index');
});

// Handle the form POST containing the question to ask Watson and reply with the answer
app.post('/ask', function(req, res){
    question_and_answer_healthcare.ask({ text: req.body.questionText}, function (err, response) {
        if (err)
            console.log('error:', err);
        else {
          var response = extend({ 'answers': response[0] },req.body);
          return res.render('response', response);
        }
    });
});


// Handle requests to synthesize speech from text
app.get('/synthesize', function(req, res) {

    var parser = new UAparser();
    var ua = req.headers['user-agent'];
    ua = parser.setUA(ua);
    var browserName = ua.getBrowser().name;
    var os = ua.getOS().name;
    
    var extension = "wav";
    var headers = { 'Accept': 'audio/wav' };
    if (((browserName == 'Chrome' || browserName == 'Canary') & os != 'Android') || browserName == 'Opera' || browserName == 'Firefox' ) {
        extension = "ogg";   
        headers = { 'Accept': 'audio/ogg; codecs=opus' }
    }
    
    TTS_CREDENTIALS.version = "v1";
    TTS_CREDENTIALS.headers = headers;
    
    var textToSpeech = watson.text_to_speech(TTS_CREDENTIALS);
    var transcript = textToSpeech.synthesize(req.query);
    
    transcript.on('response', function(response) {
        if (req.query.download ) {
            response.headers['content-disposition'] = 'attachment; filename=transcript.' + extension;
        }
        else {
            response.headers['content-disposition'] = 'inline; filename=transcript.' + extension;
        }
    });

    transcript.pipe(res);
});



// Handle audio stream processing for speech recognition
app.post('/', function(req, res) {
    var audio;

    if(req.body.url && req.body.url.indexOf('audio/') === 0) {
        // sample audio
        audio = fs.createReadStream(__dirname + '/../public/' + req.body.url);
    } else {
        // malformed url
        return res.status(500).json({ error: 'Malformed URL' });
    }

    speechToText.recognize({audio: audio, content_type: 'audio/l16; rate=44100'}, function(err, transcript){
    if (err)
        return res.status(500).json({ error: err });
    else
        return res.json(transcript);
    });
});



// Start server
var port = (process.env.VCAP_APP_PORT || 3000);
server.listen(port);
console.log('listening at:', port);