
const supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
//console.log(supportedConstraints);
const changeVideoSize = () => {
    stream.getVideoTracks().forEach(track =>{
        const capabilities = track.getCapabilities();
        console.log(capabilities);
        const height = document.getElementById('vid-height').value;
        const width = document.getElementById('vid-width').value;
        const vConstraints = {
            height:{exact: height < capabilities.height.max ? height : capabilities.height.max},
            width:{exact: width < capabilities.width.max ? width : capabilities.width.max}
        }
        track.applyConstraints(vConstraints);
    }

//    stream.getTracks().foreach(track =>{
//    const capabilities = track.getCapabilities();
//    console.log(capabilities);
//    }
  )
}