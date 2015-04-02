# IBMWatson-QA-Speech
Demo application for for Node.js (built using IBM Bluemix) that leverages IBM Watson for Speech Synthesis, IBM Watson Speech Recognition, and the IBM Watson QA Service (for natural language processing).  

You can interact with a live version of this application at:
https://watsonhealthqa.mybluemix.net/

Note: This requires HTML5 Audio tag and getUserMedia API.  Mileage will vary if your browser does not support either one of these features.  Most mobile browsers have issues with both of these.

You can see if your browser supports either of these features at:
http://caniuse.com/#feat=stream
http://caniuse.com/#feat=audio

# Original Demo
This is an updated demo assembled for IBM QA service.  Original Demo available at: 
www.tricedesigns.com/2014/11/26/ibm-watson-cognitive-computing-speech-apis/

Additional details and video showing sample in action available at 
http://www.tricedesigns.com/2015/04/01/ibm-watson-qa-speech-recognition-speech-synthesis-a-conversation-with-your-computer/


## Files

The Question Answer Node.js starter application has files as below:


*   app.js

    This file contains the server side JavaScript code for your application written using the Node.js API

*   views/

    This directory contains the views of the application. It is required by the express framework and jade template engine in this sample application.

*   public/

    This directory contains public resources of the application. It is required by the express framework in this sample application.

*   package.json

    This file is required by the Node.js environment. It specifies this Node.js project name, dependencies, and other configurations of your Node.js application.