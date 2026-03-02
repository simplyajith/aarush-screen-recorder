
const shareScreen = async() =>{
    console.log("Sharing my screen here")
    changeButtons(['blue','green','grey','grey','blue','grey','red','purple']);
    const options = {
        video:true,
        audio:false,
        surfaceSwitching: 'include',
        cursorSwitching:true,
        video: {
            cursor: 'always'
        }
    }
    try{
    shareStream = await navigator.mediaDevices.getDisplayMedia(options);
    }
    catch(ex){
        console.log(ex);
    }

}