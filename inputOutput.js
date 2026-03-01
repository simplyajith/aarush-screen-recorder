const audioInputSelect = document.getElementById('audio-input');
const audioOutputSelect = document.getElementById('audio-output');
const videoInputSelect = document.getElementById('video-input');

const getDevices = async() => {
    try{
        const devices = await navigator.mediaDevices.enumerateDevices();
        console.log(devices);
        devices.forEach(device => {
            const option =document.createElement('option')
            option.value = device.deviceId
            option.textContent = device.label
            if(device.kind === 'audioinput'){
                audioInputSelect.appendChild(option);
            }else if(device.kind === 'audiooutput'){
                             audioOutputSelect.appendChild(option);
                         }else if(device.kind === 'videoinput'){
                             videoInputSelect.appendChild(option);
                         }

        })
    }catch(ex){
        console.log(ex);
    }
}
const changeAudioInput = () =>{

}

const changeAudioOutput = () =>{

}

const changeVideoInput = () =>{

}

