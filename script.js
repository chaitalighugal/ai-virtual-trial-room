let selectedCloth = null;
let video = document.getElementById('webcam');
let canvas = document.getElementById('outputCanvas');
let ctx = canvas.getContext('2d');

async function setupCamera() {
    video.width = 600;
    video.height = 450;

    const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
    });
    video.srcObject = stream;

    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            resolve(video);
        };
    });
}

function selectCloth(imageName) {
    selectedCloth = new Image();
    selectedCloth.src = 'clothes/' + imageName;
}

async function main() {
    await setupCamera();
    video.play();

    const pose = new Pose.Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
    });
    
    pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    pose.onResults(drawPose);

    const camera = new Pose.Camera(video, {
        onFrame: async () => {
            await pose.send({image: video});
        },
        width: 600,
        height: 450
    });
    camera.start();
}

function drawPose(results) {
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    if (selectedCloth && results.poseLandmarks) {
        let leftShoulder = results.poseLandmarks[11];
        let rightShoulder = results.poseLandmarks[12];

        let clothWidth = Math.abs(rightShoulder.x - leftShoulder.x) * canvas.width * 1.7; // Adjusted
        let clothHeight = clothWidth * 1.3; // Adjusted ratio

        let clothX = leftShoulder.x * canvas.width - (clothWidth / 4);
        let clothY = leftShoulder.y * canvas.height - 20; // Slightly shifted up

        ctx.drawImage(selectedCloth, clothX, clothY, clothWidth, clothHeight);
    }

    ctx.restore();
}

let currentFilter = 'none';

function setFilter(filterType) {
    currentFilter = filterType;
}

function drawPose(results) {
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (currentFilter === 'grayscale') {
        ctx.filter = 'grayscale(100%)';
    } else if (currentFilter === 'brightness') {
        ctx.filter = 'brightness(1.5)';
    } else {
        ctx.filter = 'none';
    }

    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

    if (selectedCloth && results.poseLandmarks) {
        let leftShoulder = results.poseLandmarks[11];
        let rightShoulder = results.poseLandmarks[12];

        let clothWidth = Math.abs(rightShoulder.x - leftShoulder.x) * canvas.width * 1.7;
        let clothHeight = clothWidth * 1.3;

        let clothX = leftShoulder.x * canvas.width - (clothWidth / 4);
        let clothY = leftShoulder.y * canvas.height - 20;

        ctx.drawImage(selectedCloth, clothX, clothY, clothWidth, clothHeight);
    }

    ctx.restore();
}

function uploadCloth(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            selectedCloth = new Image();
            selectedCloth.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}


main();
