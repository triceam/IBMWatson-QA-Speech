window.speech = {
    audio:undefined,
    recognizer:new SpeechRecognizer({
      ws: '',
      model: 'WatsonModel'
    })
};


window.speech.speak = function( message ) {
    
    if ( this.audio == undefined) {
        this.audio = $("<audio controls autoplay></audio>");
        $("#audio").append(this.audio);
    }
    
    this.recognizeAbort();
    setButtonState("default");
    
    var cleaned = message.replace(/['"\[\]]+/g, '');
    
    this.audio.attr('src','/synthesize?text=' + message);
    this.audio.get(0).play();
}

window.speech.stop = function() {
    if ( this.audio != undefined) {
        this.audio.get(0).pause();
    }
    
    //remove button styles in the demo
    $(".playAnswer").removeClass("playing");
}


window.speech.recognizer.onstart = function() {
    console.log('speech.recognizer.onstart');
  };

window.speech.recognizer.onerror = function(error) {
    console.log('speech.recognizer.onerror:', error);
    alert(error);
}

window.speech.recognizer.onresult = function(data) {
    
    var result = data.results[data.results.length-1];
    var transcript = result.alternatives[0].transcript;

    search( transcript, result.final );

    if ( result.final ) {
        window.speech.recognizer.stop();
    }
}

window.speech.recognize = function () {
    this.stop();
    this.recognizer.start();
}

window.speech.recognizeAbort = function () {
    this.recognizer.stop();
}


