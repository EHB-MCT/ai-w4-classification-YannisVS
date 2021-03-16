"use strict";

let mobilenet;
let video;
let label;

function modelReady() {
  console.log('Model is ready!');
}

function gotResults(error, results) {
    console.log('Prediction ready');
}

// function imageReady() {
//   image(puffin, 0, 0, width, height);
// }

function setup() {
  let canvas = createCanvas(640, 550);
  canvas.parent("container");
  video = createCapture(VIDEO);
  video.hide();
  background(0);
}

function draw() {
  background(0);
  image(video, 0, 0);
}