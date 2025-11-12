
const captureBtn = document.getElementById('captureBtn');
const video = document.getElementById('video');
let filledSlotIndex;
let retakeInfo = null;

// Generate sessionId
const sessionId = Date.now().toString();
localStorage.setItem("poseSession", sessionId);

const params = new URLSearchParams(window.location.search);
const totalPoses = parseInt(params.get('count')) || 1;
const currentPoseType = `pose-${totalPoses}`;

// webRTC ------
navigator.mediaDevices.getUserMedia({ video : true })
.then(stream => {
  video.srcObject = stream;
})
.catch(err => {
  alert('Camera access denied : ', err);
})

// setInterval ------
let photoTaken = 0;
function startcountdownAndCapture(index = null, isRetake = false) {
  let countdownTimer = timer;
  const countdownEL = document.getElementById('countdown');
  countdownEL.textContent = countdownTimer;

  const countdown = setInterval(() => {
    countdownTimer--;
    if(countdownTimer > 0){
      countdownEL.textContent = countdownTimer;
    } else {
      clearInterval(countdown);
      countdownEL.textContent = '';
      
      if(index !== null && isRetake){
        takePhoto(index);
      } else {
        takePhoto();
        photoTaken++;

        if(photoTaken < totalPoses){
        startcountdownAndCapture();
      }
      }
    }
  }, 1000)
}
    
// capturing for the first time  
captureBtn.addEventListener('click', () => {
  timer = parseInt(document.getElementById('timerSelect').value);
  photoTaken = 0;
  startcountdownAndCapture();
})

// takePhoto logic ------
let capturedImg = 0;

document.querySelectorAll("[id^='pose-']").forEach(div => div.classList.add("hidden"));
const selectedPose = document.getElementById(`pose-${totalPoses}`);
if(selectedPose){
    selectedPose.classList.remove("hidden");
}

const photoSlot = selectedPose.querySelectorAll('.pose-image');
let currentSlot = 0;   
let targetIndex;

// dblclick ----
photoSlot.forEach((slot, index) => {
  slot.addEventListener('dblclick', async() => {
    const photoId = slot.dataset.id;
    if(!photoId){
      console.warn('photoId not found');
      return;
    }
    slot.src = "";
    retakeInfo = { id : photoId, index }
    startcountdownAndCapture(index, true);
  })
})

function takePhoto(slotIndex = null){

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext('2d');
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const photo = canvas.toDataURL("image/png");

    // retake
    if(slotIndex !== null){
      photoSlot[slotIndex].src = photo;
    } 
    else if(currentSlot < photoSlot.length) {
        photoSlot[currentSlot].src = photo;
        slotIndex = currentSlot;
        currentSlot++;
    }
    
  capturedImg++;

  if(capturedImg === totalPoses){
    captureBtn.innerHTML = 'All poses captured✅';
    captureBtn.disabled = true;
  }
    
// Uploading images to backend.
    
const isRetake = retakeInfo && retakeInfo.index === slotIndex;
const method = retakeInfo ? "PUT" : "POST";

const baseURL = typeof window !== "undefined" && window.location.origin
? window.location.origin
: "http://localhost:3000";

const url = retakeInfo
  ? `${baseURL}/api/photos/${retakeInfo.id}`
  : `${baseURL}/api/photos`;

fetch(url, {
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    image: photo,
    poseType: currentPoseType,
    sessionId,
  }),
})
.then(res => res.json())
.then(data => {
  console.log("Uploaded:", data);
  const targetIndex = retakeInfo ? retakeInfo.index : slotIndex;

  // Update slot with latest info
  const updatedPhoto = data.updatePhoto || data.savedPhoto;
  if (updatedPhoto) {
    photoSlot[targetIndex].src = updatedPhoto.url;
    photoSlot[targetIndex].dataset.id = updatedPhoto._id;
  }

  if (isRetake) retakeInfo = null;
})
.catch(err => console.error("Uploading error:", err));
}

