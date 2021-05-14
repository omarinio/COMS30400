// ml5.js: Pose Estimation with PoseNet
// The Coding Train / Daniel Shiffman
// https://thecodingtrain.com/Courses/ml5-beginners-guide/7.1-posenet.html
// https://youtu.be/OIo-DIOkNVg
// https://editor.p5js.org/codingtrain/sketches/ULA97pJXR

//import * as comlink from "https://unpkg.com/comlink/dist/esm/comlink.mjs";

//think this is fine
import * as comlink from "comlink";
var canvas

let textSiz = 20;

let video;

let poseNet;
let skeleton;

let poseSet = false;
let pose1;
let pose2;
let pose3;

let poseSentence = "";
let poseLag = 0;


//should be done here and transferred as a fake canvas
function setup() {
    // init canvas
    canvas = p5.createCanvas(320, 240);
    canvas.parent('unityContainer');
    canvas.position(0, 0);

    // init video
    video = p5.createCapture(VIDEO);
    video.hide();

    // init overlay
    overlay = loadImage('overlays/new.png');

    main();
}

async function main() {
    console.time("[main] worker setup");
    const worker = new Worker("./poseWorker.js");
    const api = await comlink.wrap(worker);
    await api.init(comlink.transfer(offscreenCanvas, [offscreenCanvas]));
    console.timeEnd("[main] worker setup");

    async function mainloop() {
        offCtx.drawImage(video, 0, 0);
        const bitmap = offscreen.transferToImageBitmap();

        //data is pose label
        const data = await api.update(comlink.transfer(bitmap, [bitmap]));
        requestAnimationFrame(mainloop);
    }
    mainloop();
}



// Called by Unity
// Loads overlay
function loadOverlay(path) {
    if (!poseOff) {
        overlay = loadImage(path);
    }
}

// Called by Unity
// Clears overlay
function clearOverlay() {
    if (!poseOff) {
        // alert("Clear Overlay");
        overlay = loadImage('');
    }
}

function turnOffPose() {
    if (!poseOff) {
        poseOff = true;
        remove();
    }
}

let n = 30;

// Draws to  canvas
// Called once per frame
function draw() {
    if (canvas) {
        push();
        translate(video.width / 2, 0);
        scale(-1 / 2, 1 / 2);
        image(video, 0, 0, video.width, video.height);

        if (pose) {
            // console.log(pose.leftWrist);
            let eyeR = pose.rightEye;
            let eyeL = pose.leftEye;
            let d = dist(eyeR.x, eyeR.y, eyeL.x, eyeL.y);
            fill(255, 0, 0);
            ellipse(pose.nose.x, pose.nose.y, d);
            fill(0, 0, 255);
            ellipse(pose.rightWrist.x, pose.rightWrist.y, 32);
            ellipse(pose.leftWrist.x, pose.leftWrist.y, 32);

            for (let i = 0; i < pose.keypoints.length; i++) {
                let x = pose.keypoints[i].position.x;
                let y = pose.keypoints[i].position.y;
                fill(0, 255, 0);
                ellipse(x, y, 16, 16);
            }

            for (let i = 0; i < skeleton.length; i++) {
                let a = skeleton[i][0];
                let b = skeleton[i][1];
                strokeWeight(2);
                stroke(255);
                line(a.position.x, a.position.y, b.position.x, b.position.y);
            }
        }
        pop();

        // |N|N|N|
        // |O|N|I|
        // |Q|C|W|

        // fill(255, 0, 255);
        // noStroke();
        // textSize(256);
        // textAlign(CENTER, CENTER);
        // text(poseLabel, width / 2, height / 2);

        fill(255, 255, 255);
        rect(0, 0, canvas.width, textSiz);

        fill(0, 0, 0);
        textSize(textSiz);
        textAlign(LEFT, TOP);
        text(poseSentence, 0, 0);

        image(overlay, 0, 0, canvas.width, canvas.height);
        // console.log(n);
        // n--;
        // if (n < 0) {
        //   turnOffPose();
        // }
    }
}


// Move canvas around on mouse click
let onCanv = false;
let xOrigin = 0;
let yOrigin = 0;
let xCanvOrigin = 0;
let yCanvOrigin = 0;

// Returns true if mouse is within bounds of canvas
function mouseOnCanvas() {
    return mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height;
}

// Sets all necessary variables when canvas is clicked on
function mousePressed() {
    if (mouseOnCanvas() && canvas) {
        onCanv = true;
        xOrigin = winMouseX; // - bx;
        yOrigin = winMouseY; // - by;
        xCanvOrigin = canvas.position().x;
        yCanvOrigin = canvas.position().y;
    }
}

// Updates canvas position by amount the mouse has moved since clicked
function mouseDragged() {
    if (onCanv && canvas) {
        canvas.position(xCanvOrigin + (winMouseX - xOrigin), yCanvOrigin + (winMouseY - yOrigin))
    }
}


function mouseReleased() {
    onCanv = false;
}