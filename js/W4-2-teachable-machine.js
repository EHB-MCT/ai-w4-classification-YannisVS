"use strict";

let video;
let knnClassifier;
let featureExtractor;

function setup() {
    let canvas = createCanvas(640, 550);
    canvas.parent("container");
    video = createCapture(VIDEO);
    video.hide();
    background(0);
    initEvents();
}

function draw() {
    background(0);
    image(video, 0, 0);
}

function addImage(color) {
    console.log("Add image", color);
}

function initEvents() {
    document.getElementById("addGreen").addEventListener("click", function() {addImage("green");});
    document.getElementById("addRed").addEventListener("click", function() {addImage("red");});
}
