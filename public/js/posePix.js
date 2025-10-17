const sessionId = localStorage.getItem("poseSession");
let poseCount = null;
let poseCard = null;

    async function loadGallery(){
        try{
            const res = await fetch(`http://localhost:3000/api/photos?sessionId=${sessionId}`)
            const data = await res.json();

            if(data.Success && data.photos.length > 0){

                poseCount = data.photos[0].poseType;
                poseCard = document.getElementById(poseCount);
                poseCard.classList.remove('hidden');

                const slots = poseCard.querySelectorAll('.pose-image')
                data.photos.forEach((photo, i) => {
                    if(slots[i]){
                        slots[i].src = photo.url;
                    }
                })
                const dateElement = document.getElementById(`dateText-${poseCount.split("-")[1]}`);
                if(dateElement){
                    const today = new Date();
                    dateElement.textContent = today.toDateString();
                }
                
            }
        } catch(err){
            console.error('Error saving poseCard: ', err);
        }
    }
    loadGallery();

// background logic
const bgButtons = document.querySelectorAll('#bg-btns button');

bgButtons.forEach(button => {
    button.addEventListener('click', () => {
        const addColor = button.getAttribute('data-color');
        poseCard.style.backgroundColor = addColor;
    })
})
// Random color logic
const colorPicker = document.getElementById('custom-color');

colorPicker.addEventListener('input', () => {
    const customColor = colorPicker.value;
    poseCard.style.backgroundColor = customColor
})

// Sticker on poseCard
// let sticker;
const stickerBtns = document.querySelectorAll('#stickerBtns button');

stickerBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const stickerSrc = btn.querySelector('img').src;

        const sticker = document.createElement('img');
        sticker.src = stickerSrc;
        sticker.classList.add('absolute', 'w-20', 'h-20', 'cursor-move');

        sticker.style.top = '50%'
        sticker.style.left = '50%'

        poseCard.appendChild(sticker)

        makeDraggable(sticker)

        sticker.addEventListener('dblclick', () => {
            sticker.remove();
        })
    })
})

function makeDraggable(element){
    let isDragging = false;
    let offsetX, offsetY;

    element.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.offsetX;
        offsetY = e.offsetY;
        element.style.zIndex = 1000;
    })

    document.addEventListener('mousemove', (e) => {
        if(!isDragging) return;

        const rect = poseCard.getBoundingClientRect();
        element.style.left = `${e.clientX - rect.left - offsetX}px`;
        element.style.top = `${e.clientY - rect.top - offsetY}px`;
    })

    document.addEventListener('mouseup', () => {
        isDragging = false;
        element.style.zIndex = 1;
    })
}

const downloadBtn = document.getElementById('downloadBtn');

downloadBtn.addEventListener('click', () => {
    html2canvas(poseCard, { useCORS : true })
    .then(canvas => {
        const link = document.createElement('a');
        link.download = 'posePix.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    })
})