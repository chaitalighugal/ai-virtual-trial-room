let selectedCloth = null;
let selectedColor = '#ffffff';
let currentFilter = 'none';

const video = document.getElementById('webcam');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Camera setup
async function setupCamera() {
  video.width = 640;
  video.height = 480;
  const stream = await navigator.mediaDevices.getUserMedia({video: true});
  video.srcObject = stream;
  return new Promise(r => video.onloadedmetadata = r);
}

// Select clothing
function selectCloth(file) {
  selectedCloth = new Image();
  selectedCloth.src = `clothes/${file}`;
}

// Upload user clothing
function uploadCloth(e) {
  const f = e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    selectedCloth = new Image();
    selectedCloth.src = r.result;
  };
  r.readAsDataURL(f);
}

// Color picker
function setColor(val) {
  selectedColor = val;
}

// Filters
function setFilter(val) {
  currentFilter = val;
}

// Drawing & pose detection
async function main() {
  await setupCamera();
  
  const pose = new Pose.Pose({
    locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${f}`
  });
  pose.setOptions({modelComplexity: 1,minDetectionConfidence:0.5,minTrackingConfidence:0.5});
  pose.onResults(drawResults);

  new Pose.Camera(video, {onFrame: async () => await pose.send({image: video}),
    width: 640, height: 480}).start();
}

function drawResults({image, poseLandmarks}) {
  ctx.filter = currentFilter === 'grayscale' ? 'grayscale(100%)'
               : currentFilter === 'sepia' ? 'sepia(50%)'
               : 'none';
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  if (selectedCloth && poseLandmarks) {
    const l = poseLandmarks[11], r = poseLandmarks[12];
    const w = Math.abs(r.x - l.x) * canvas.width * 1.6;
    const h = w * (selectedCloth.height/selectedCloth.width);
    const x = l.x * canvas.width - (w / 3);
    const y = l.y * canvas.height - (h / 2);
    ctx.drawImage(selectedCloth, x, y, w, h);

    if (selectedColor !== '#ffffff') {
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = selectedColor;
      ctx.fillRect(x, y, w, h);
      ctx.globalAlpha = 1.0;
    }
  }
}

main();
