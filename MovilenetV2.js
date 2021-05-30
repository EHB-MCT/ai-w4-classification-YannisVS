"use strict";

const video = document.getElementById('webcam');
const liveView = document.getElementById('liveView');
const demosSection = document.getElementById('demos');
const enableWebcamButton = document.getElementById('webcamButton');
const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
var vidWidth = 0;
var vidHeight = 0;
var xStart = 0;
var yStart = 0;
// webcam support
function getUserMediaSupported() {
    console.log("degug log 1");
    return !!(navigator.mediaDevices &&
        navigator.mediaDevices.getUserMedia);
}

if (getUserMediaSupported()) {
    console.log("degug log 2");
    enableWebcamButton.addEventListener('click', enableCam);
} else {
    console.warn('getUserMedia() is not supported by your browser');
}

function enableCam(event) {
    let background = document.getElementById('webcam');
    background.classList.remove('VideoBackground');
    console.log("degug log 3");
    if (!model) {
        return;
    }

    enableWebcamButton.classList.add('removed');

    const constraints = {
        video: true
    };
    navigator.mediaDevices.getUserMedia({
        video: {
            facingMode: "environment"
        },
    }).then(stream => {
        let $video = document.querySelector('video');
        $video.srcObject = stream;
        $video.onloadedmetadata = () => {
            vidWidth = $video.videoHeight;
            vidHeight = $video.videoWidth;
            xStart = Math.floor((vw - vidWidth) / 2);
            yStart = (Math.floor((vh - vidHeight) / 2) >= 0) ? (Math.floor((vh - vidHeight) / 2)) : 0;
            $video.play();
            $video.addEventListener('loadeddata', predictWebcamTF);
        }
    });
}

var model = undefined;
let model_url;
model_url = 'https://raw.githubusercontent.com/KostaMalsev/ImageRecognition/master/model/mobile_netv2/web_model2/model.json';

asyncLoadModel(model_url);
async function asyncLoadModel(model_url) {
    model = await tf.loadGraphModel(model_url);
    console.log('Model got loaded');
    //Enable start button:
    enableWebcamButton.classList.remove('invisible');
    enableWebcamButton.innerHTML = 'Start camera';
}

var children = [];

function predictWebcamTF() {
    detectTFMOBILE(video).then(function () {
        window.requestAnimationFrame(predictWebcamTF);
    });
}
const imageSize = 512;

var classProbThreshold = 0.4; //40%
async function detectTFMOBILE(imgToPredict) {

    await tf.nextFrame();
    const tfImg = tf.browser.fromPixels(imgToPredict);
    const smallImg = tf.image.resizeBilinear(tfImg, [vidHeight, vidWidth]);
    const resized = tf.cast(smallImg, 'int32');

    var tf4d_ = tf.tensor4d(Array.from(resized.dataSync()), [1, vidHeight, vidWidth, 3]);
    const tf4d = tf.cast(tf4d_, 'int32');

    let predictions = await model.executeAsync(tf4d);

    renderPredictionBoxes(predictions[4].dataSync(), predictions[1].dataSync(), predictions[2].dataSync());

    tfImg.dispose();
    smallImg.dispose();
    resized.dispose();
    tf4d.dispose();
}

function renderPredictionBoxes(predictionBoxes, predictionClasses, predictionScores) {
    for (let i = 0; i < children.length; i++) {
        liveView.removeChild(children[i]);
    }
    children.splice(0);
    for (let i = 0; i < 99; i++) {
        const minY = (predictionBoxes[i * 4] * vidHeight + yStart).toFixed(0);
        const minX = (predictionBoxes[i * 4 + 1] * vidWidth + xStart).toFixed(0);
        const maxY = (predictionBoxes[i * 4 + 2] * vidHeight + yStart).toFixed(0);
        const maxX = (predictionBoxes[i * 4 + 3] * vidWidth + xStart).toFixed(0);
        const score = predictionScores[i * 3] * 100;
        const width_ = (maxX - minX).toFixed(0);
        const height_ = (maxY - minY).toFixed(0);
        let preditcionName = "mcdo";


        if (score > 85 && score < 100) {
            const highlighter = document.createElement('div');
            highlighter.setAttribute('class', 'highlighter');
            highlighter.style = 'left: ' + minX + 'px; ' +
                'top: ' + minY + 'px; ' +
                'width: ' + width_ + 'px; ' +
                'height: ' + height_ + 'px;';

            if (preditcionName == "cola" || preditcionName == "bottle" || preditcionName == "aluminium") {
                highlighter.innerHTML = '<p>' + Math.round(score) + '% ' + `${preditcionName}` + '<br>' + 'categorie: pmd' + '</p>';
            } else if (preditcionName == "mcdo") {
                highlighter.innerHTML = '<p>' + Math.round(score) + '% ' + `${preditcionName}` + '<br>' + 'categorie: papier' + '</p>';
            } else if (preditcionName == "snickers") {
                highlighter.innerHTML = '<p>' + Math.round(score) + '% ' + `${preditcionName}` + '<br>' + 'categorie: restafval' + '</p>';
            } else if (preditcionName == "banana" || preditcionName == "apple") {
                highlighter.innerHTML = '<p>' + Math.round(score) + '% ' + `${preditcionName}` + '<br>' + 'categorie: gft' + '</p>';
            }

            liveView.appendChild(highlighter);
            children.push(highlighter);
        }
    }
}