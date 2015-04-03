/**
 * Copyright 2014 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    fs = require('fs'),
    bluemix = require('./config/bluemix'),
    watson = require('watson-developer-cloud'),
    extend = require('util')._extend,
    UAparser = require('ua-parser-js'),
    userAgentParser = new UAparser();

// setup express
require('./config/express')(app);


// Setup credentials - populate the url, username and password.
// if you're running on a local node.js environment
var QA_CREDENTIALS = {
    username: '<username question-and-answer>',
    password: '<password question-and-answer>',
    version: 'v1',
    dataset: 'healthcare'
};

var TTS_CREDENTIALS = {
    username: '<username texto-to-speech>',
    password: '<password texto-to-speech>',
    version:'v1'
};

var STT_CREDENTIALS = {
    username: '<username speech-to-text>',
    password: '<password speech-to-text>',
    version:'v1'
};

// setup watson services
var question_and_answer_healthcare = watson.question_and_answer(QA_CREDENTIALS);
var speechToText = watson.speech_to_text(STT_CREDENTIALS);
var textToSpeech = watson.text_to_speech(TTS_CREDENTIALS);

// setup sockets
require('./config/socket')(io, speechToText);

// render index page
app.get('/', function(req, res){
    res.render('index');
});

// Handle the form POST containing the question to ask Watson and reply with the answer
app.post('/ask', function(req, res){
    question_and_answer_healthcare.ask({ text: req.body.questionText}, function (err, response) {
        if (err){
            console.log('error:', err);
            return res.status(err.code || 500).json(response);
        } else {
            var response = extend({ 'answers': response[0] }, req.body);
            return res.render('response', response);
        }
    });
});

// Handle requests to synthesize speech from text
app.get('/synthesize', function(req, res) {
    var userAgent = userAgentParser.setUA(req.headers['user-agent']);
    var extension = 'wav';
    var accept ='audio/wav';

    if (supportOgg(userAgent)) {
        extension = 'ogg';
        accept = 'audio/ogg; codecs=opus';
    }

    var transcript = textToSpeech.synthesize(extend({ accept: accept}, req.query));
    transcript.on('response', function(response) {
        response.headers['content-disposition'] = 'inline; filename=transcript.' + extension;
    });
    transcript.pipe(res);

});

// Return true if the User Agent support ogg files
function supportOgg(userAgent) {
    var browserName = userAgent.getBrowser().name;
    var osName = userAgent.getOS().name;
    return (((browserName == 'Chrome' || browserName == 'Canary') & osName != 'Android') || browserName == 'Opera' || browserName == 'Firefox');
}

// Start server
var port = (process.env.VCAP_APP_PORT || 3000);
server.listen(port);
console.log('listening at:', port);