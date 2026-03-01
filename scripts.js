const videoEl = document.querySelector('#my-video');

let stream = null;
let shareStream = null;
const constraints = {
    video:true,
    audio:true
}

// Update status indicators
const updateStatusIndicators = (hasCamera, hasMic) => {
    const cameraStatus = document.getElementById('camera-status');
    const micStatus = document.getElementById('mic-status');
    
    if (hasCamera) {
        cameraStatus.className = 'badge bg-success me-2';
        cameraStatus.innerHTML = '<i class="fas fa-video"></i> Camera On';
    } else {
        cameraStatus.className = 'badge bg-danger me-2';
        cameraStatus.innerHTML = '<i class="fas fa-video-slash"></i> Camera Off';
    }
    
    if (hasMic) {
        micStatus.className = 'badge bg-success';
        micStatus.innerHTML = '<i class="fas fa-microphone"></i> Mic On';
    } else {
        micStatus.className = 'badge bg-danger';
        micStatus.innerHTML = '<i class="fas fa-microphone-slash"></i> Mic Off';
    }
};

// Update video placeholder visibility
const updateVideoPlaceholder = (showVideo) => {
    const placeholder = document.getElementById('my-video-placeholder');
    if (placeholder) {
        placeholder.style.display = showVideo ? 'none' : 'flex';
    }
};
const getMicAndCamera = async(e)=>{
try{
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    getDevices();
    console.log(stream);
    changeButtons(['blue','green','grey','grey','grey','grey','grey','purple']);
    // Update status indicators to show camera and mic are on
    updateStatusIndicators(true, true);

}catch(ex){
    // user denied access to constraints
    console.log(ex);
    changeButtons(['red','red','red','red','red','red','red','red']);
    // Update status indicators to show camera and mic are off
    updateStatusIndicators(false, false);
}
};
const showMyFeed = e =>{
    if(!stream){
    alert("No feed allowed");
    return;
    }
    console.log("showMyFeed is working")
    videoEl.srcObject = stream;
    const tracks = stream.getTracks();
    console.log(tracks);
    changeButtons(['blue','green','green','green','green','grey','grey','purple']);
    // Hide the placeholder when video is active
    updateVideoPlaceholder(true);
};

const stopVideo = e => {
    if(!stream){
    alert("No current feed");
    return;
    }
    console.log("stopVideo is working");
    const tracks = stream.getTracks();
    tracks.forEach(
//    track => console.log(track)
    track => track.stop()
    );
    changeButtons(['grey','grey','grey','grey','grey','grey','grey','purple']);
    // Update status indicators to show camera and mic are off
    updateStatusIndicators(false, false);
    // Show the placeholder when video is stopped
    updateVideoPlaceholder(false);
//    videoEl.srcObject = null;

};
document.querySelector('#share').addEventListener('click',e =>getMicAndCamera(e));
document.querySelector('#show-video').addEventListener('click',e =>showMyFeed(e));
document.querySelector('#stop-video').addEventListener('click',e =>stopVideo(e));
document.querySelector('#change-size').addEventListener('click',e =>changeVideoSize(e));
document.querySelector('#start-record').addEventListener('click',e =>startRecording(e));
document.querySelector('#stop-record').addEventListener('click',e =>stopRecording(e));
document.querySelector('#play-record').addEventListener('click',e =>playRecording(e));
document.querySelector('#share-screen').addEventListener('click',e =>shareScreen(e));
document.querySelector('#audio-input').addEventListener('change',e =>changeAudioInput(e));
document.querySelector('#audio-output').addEventListener('change',e =>changeAudioOutput(e));
document.querySelector('#video-input').addEventListener('change',e =>changeVideoInput(e));

