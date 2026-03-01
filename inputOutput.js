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

const changeAudioInput = async (e) => {
    const audioDeviceId = e.target.value;
    const videoDeviceId = videoInputSelect.value;

    const newConstraints = {
        audio: { deviceId: { exact: audioDeviceId } },
        video: videoDeviceId ? { deviceId: { exact: videoDeviceId } } : true
    };

    try {
        stream = await navigator.mediaDevices.getUserMedia(newConstraints);
        console.log(stream);
        const videoEl = document.querySelector('#my-video');
        videoEl.srcObject = stream;
    } catch (error) {
        console.log(error);
    }
}

const changeAudioOutput = async (e) => {
    const deviceId = e.target.value;
    const videoEl = document.querySelector('#other-video');

    if (typeof videoEl.setSinkId !== 'undefined') {
        try {
            await videoEl.setSinkId(deviceId);
            console.log(`Success, audio output device attached: ${deviceId}`);
        } catch (error) {
            console.error('Error setting audio output:', error);
        }
    } else {
        console.warn('Browser does not support output device selection.');
    }
}

const changeVideoInput = async (e) => {
    const videoDeviceId = e.target.value;
    const audioDeviceId = audioInputSelect.value;

    const newConstraints = {
        audio: audioDeviceId ? { deviceId: { exact: audioDeviceId } } : true,
        video: { deviceId: { exact: videoDeviceId } }
    };

    try {
        stream = await navigator.mediaDevices.getUserMedia(newConstraints);
        console.log(stream);
        const videoEl = document.querySelector('#my-video');
        videoEl.srcObject = stream;
    } catch (error) {
        console.log(error);
    }
}
