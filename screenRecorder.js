let mediaRecorder;
let recordedBlobs;

const startRecording = () => {
    if(!stream && !shareStream){
    alert("No current feed");
    return;
    }
    console.log("Started Recording");
    changeButtons(['blue','green','grey','grey','green','red','grey','purple']);
    recordedBlobs = [];
    if(stream){mediaRecorder = new MediaRecorder(stream);}
    if(shareStream){mediaRecorder = new MediaRecorder(shareStream);}
    mediaRecorder.ondataavailable = event =>{
    console.log("Data is available for the media recorder!");
    recordedBlobs.push(event.data);
    }
    mediaRecorder.start();
}

const stopRecording = () => {
    if(!mediaRecorder){
        alert("Please record before stopping");
        return;
    }
    console.log("Stopped Recording");
    changeButtons(['blue','green','grey','grey','blue','purple','red','grey'])
    mediaRecorder.stop();

}

const playRecording = () => {
    if(!recordedBlobs){
    alert("No recording saved");
    return;
    }
    console.log("Playing Recording");
    changeButtons(['blue','green','red','grey','green','green','red','grey'])
    const superBuffer = new Blob(recordedBlobs, { type: 'video/webm' });
    const recordedVideoEl = document.querySelector('#other-video');
    recordedVideoEl.src = URL.createObjectURL(superBuffer);
    recordedVideoEl.controls = true;
    recordedVideoEl.play();
    changeButtons(['blue','green','grey','grey','blue','grey','red','grey'])


}