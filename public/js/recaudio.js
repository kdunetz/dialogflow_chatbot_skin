//http://typedarray.org/wp-content/projects/WebAudioRecorder/  
var recorder =(function (){



// variables
var leftchannel=[],rightchannel=[],recorder=null,recording=!1,recordingLength=0,volume=null,audioInput=null,sampleRate=44100,audioContext=null,context=null,outputElement={},outputString;

// feature detection 
if (!navigator.getUserMedia)
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
                  navigator.mozGetUserMedia || navigator.msGetUserMedia;

if (navigator.getUserMedia){
    navigator.getUserMedia({audio:true}, success, function(e) {
    alert('Error capturing audio.');
    });
} else alert('getUserMedia not supported in this browser.');

function startRecording(){
        recording = true;
        // reset the buffers for the new recording
        leftchannel.length = rightchannel.length = 0;
        recordingLength = 0;
        recordingBlocks = 0;
   } // end startRecording()

function stopRecording(callBack){
        
        // we stop recording
        recording = false;
        
console.log("Building wav file");

        // we flat the left and right channels down
        var leftBuffer = mergeBuffers ( leftchannel, recordingLength );
        var rightBuffer = mergeBuffers ( rightchannel, recordingLength );
        // we interleave both channels together
        var interleaved = interleave ( leftBuffer, rightBuffer );
        
        // we create our wav file
        var buffer = new ArrayBuffer(44 + interleaved.length * 2);
        var view = new DataView(buffer);
        
        // RIFF chunk descriptor
        writeUTFBytes(view, 0, 'RIFF');
        view.setUint32(4, 44 + interleaved.length * 2, true);
        writeUTFBytes(view, 8, 'WAVE');
        // FMT sub-chunk
        writeUTFBytes(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true); // KAD 1 = PCM
        // stereo (2 channels)
        view.setUint16(22, 1, true); // KAD changed to 1
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true); // KAD changed to 2 because I changed from stereo to mono
        view.setUint16(32, 2, true); // KAD changedto 2 because I changed from stereo to mono...
        view.setUint16(34, 16, true);
        // data sub-chunk
        writeUTFBytes(view, 36, 'data');
        view.setUint32(40, interleaved.length * 2, true);
        
        // write the PCM samples
        var lng = interleaved.length;
        var index = 44;
        var volume = 1;
        for (var i = 0; i < lng; i++){
            view.setInt16(index, interleaved[i] * (0x7FFF * volume), true);
            index += 2;
        }

var viewLength = view.byteLength
if (viewLength > 80) viewLength = 80;
for (var i=0;i<viewLength;i++)
   console.log(i + " - " + view.getUint8(i) + " - " + String.fromCharCode(view.getUint8(i)) + " - " + view.getUint8(i).toString(16));

if (false)
{
var u16 = new Uint16Array(view.byteLength)
// Copy over all the values
for(var i=0;i<view.byteLength;i++){
  u16[i] = view.getUint8(i);
}
}
        
        // our final binary blob
        var blob = new Blob ( [ view ], { type : 'audio/wav' } ); // view

console.log(view);
        
        // let's save it locally
        var url = (window.URL || window.webkitURL).createObjectURL(blob);
		
console.log(url);
url = window.URL.toString().substring(0, window.URL.toString().indexOf("function")) + "speech_to_text";
	//	callBack(url);

var oReq = new XMLHttpRequest();
oReq.open("POST", url, true);
oReq.onload = function (oEvent) {
  // Response from server received
   console.log("IN HERE - " + oReq.response);
   document.getElementById("textInput").value = oReq.response;
   event.keyCode = 13; 
   ConversationPanel.inputKeyDown(event, document.getElementById("textInput")); /* hit enter like somebody would on console manually */
};

//blob = new Blob(['abc123'], {type: 'text/plain'});
console.log(blob);
if (false)
{
   var formData = new FormData();
   oReq.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
   formData.append("webmasterfile", blob);
}
var reader = new FileReader();
 reader.readAsDataURL(blob); 
 reader.onloadend = function() {
     //base64data = reader.result;                
   var dataUrl = reader.result;
    var base64 = dataUrl.split(',')[1];
     //console.log(base64data);
     oReq.send(base64);
 }
console.log("SEND BLOB");


		
		
    }//end stopRecording()
	
	
function interleave(leftChannel, rightChannel){
  var length = leftChannel.length + rightChannel.length;
  var result = new Float32Array(length);

  var inputIndex = 0;

  for (var index = 0; index < length; ){
    result[index++] = leftChannel[inputIndex];
    //result[index++] = rightChannel[inputIndex]; // KAD took out to make mono
    inputIndex++;
  }
  return result;
}

function mergeBuffers(channelBuffer, recordingLength){
  var result = new Float32Array(recordingLength);
  var offset = 0;
  var lng = channelBuffer.length;
  for (var i = 0; i < lng; i++){
    var buffer = channelBuffer[i];
    result.set(buffer, offset);
    offset += buffer.length;
  }
  return result;
}

function writeUTFBytes(view, offset, string){ 
  var lng = string.length;
  for (var i = 0; i < lng; i++){
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function success(e){
    // creates the audio context
    audioContext = window.AudioContext || window.webkitAudioContext;
    context = new audioContext();

    console.log('success');
    
    // creates a gain node
    volume = context.createGain();

    // creates an audio node from the microphone incoming stream
    audioInput = context.createMediaStreamSource(e);

    // connect the stream to the gain node
    audioInput.connect(volume);

    /* From the spec: This value controls how frequently the audioprocess event is 
    dispatched and how many sample-frames need to be processed each call. 
    Lower values for buffer size will result in a lower (better) latency. 
    Higher values will be necessary to avoid audio breakup and glitches */
    var bufferSize = 2048;
    recorder = context.createScriptProcessor(bufferSize, 2, 2);


    recorder.onaudioprocess = function(e){
        if (!recording) return;
        var left = e.inputBuffer.getChannelData (0);
        var right = e.inputBuffer.getChannelData (1);
        // we clone the samples
        leftchannel.push (new Float32Array (left));
        rightchannel.push (new Float32Array (right));
        recordingLength += bufferSize;
        console.log('recording');
        if (recordingBlocks++ > 125) // about 5 seconds
        {
           stopRecording();
           resetRecordButton();
        }
    }

    // we connect the recorder
    volume.connect (recorder);
    recorder.connect (context.destination); 
}




	return {
		start: startRecording,
		stop: stopRecording	
	};
	
}());
