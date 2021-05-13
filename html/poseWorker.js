//import * as comlink from "https://unpkg.com/comlink/dist/esm/comlink.mjs";
import * as comlink from "comlink";
import * as tf from '@tensorflow/tfjs';
import * as posenet from '@tensorflow-models/posenet';
import * as p5 from './p5.min.js';

let canvasSizeX = 320
let canvasSizeY = 240

let poseOff = false;

let pose1;
let pose2;
let pose3;

let poseLag = 0;


//image buffer
const imageBufferCanvas = new OffscreenCanvas(canvasSizeX, canvasSizeY);
const imageBufferContext = (imageBufferCanvas.getContext(
    "2d"
  ));
  console.time("[worker] start alie");

// function setup() {
// // init canvas
//     canvas.parent('unityContainer');
//     canvas.position(0, 0);
//     // init posenet
//     var optionsPose = {
//         architecture: 'ResNet50',
//         imageScaleFactor: 1,
//         outputStride: 16,
//         // flipHorizontal: false,
//         minConfidence: 0.2,
//         maxPoseDetections: 1,
//         scoreThreshold: 0.2,
//         nmsRadius: 1,
//         // detectionType: 'single',
//         inputResolution: 257,
//         multiplier: 1.0,
//         quantBytes: 4,
//     };
  

//     // init overlay
//     //overlay = loadImage('overlays/new.png');
// }

function noseLabel() {
    if (!poseOff) {
        // normalise nose position e.g. 0<x,y<1
        var normNosePos = p5.createVector(pose1.nose.x / (2 * p5.width), pose1.nose.y / (2 * p5.height));
        if (normNosePos.x > 1 / 3 && normNosePos.x < 2 / 3 && normNosePos.y > 0.2 && normNosePos.y < 0.4) {
            return 'F';
        } else if (normNosePos.x > 0 && normNosePos.x < 0.37 && normNosePos.y > 1 / 3 && normNosePos.y < 2 / 3) {
            return 'I';
        } else if (normNosePos.x > 0.62 && normNosePos.x < 1 && normNosePos.y > 1 / 3 && normNosePos.y < 2 / 3) {
            return 'O';
        } else if (normNosePos.x > 0 && normNosePos.x < 1 / 3 && normNosePos.y > 2 / 3 && normNosePos.y < 1) {
            return 'W';
        } else if (normNosePos.x > 2 / 3 && normNosePos.x < 1 && normNosePos.y > 2 / 3 && normNosePos.y < 1) {
            return 'Q';
        } else if (normNosePos.x > 1 / 3 && normNosePos.x < 2 / 3 && normNosePos.y > 2 / 3 && normNosePos.y < 1) {
            return 'C';
        } else {
            return 'N';
        }
    }
    return 'N';
}

function handsLabel() {
    if (!poseOff) {
        if (pose1.leftWrist.x < p5.width * 2 && pose1.leftWrist.x > 0 && pose1.leftWrist.y < p5.height * 2 && pose1.leftWrist.y > 0) {
            //if(pose3.leftWrist.confidence>0.7 && pose3.rightWrist.confidence>0.7){
            // normalise wrist positions e.g. 0<x,y<1
            var normLeftWristVector = p5.createVector((pose3.leftWrist.x - pose1.leftWrist.x) / (2 * p5.width), (pose3.leftWrist.y - pose1.leftWrist.y) / (2 * p5.height));
            var normRightWristVector = p5.createVector((pose3.rightWrist.x - pose1.rightWrist.x) / (2 * p5.width), (pose3.rightWrist.y - pose1.rightWrist.y) / (2 * p5.width));
            var normLeftWristPos = p5.createVector(pose1.leftWrist.x / (2 * p5.width), pose1.leftWrist.y / (2 * p5.height));
            if (normLeftWristVector.x < -0.1) {
                // Pick up, both hands moving up
                poseLag = 3;
                return "B";
            } else if ((normLeftWristVector.x > 0.07 && normRightWristVector.x < -0.07)) {
                // Pull apart, both hands moving apart
                poseLag = 4;
                return 'P';
            } else if (normLeftWristVector.y > 0.07 && normRightWristVector.y > 0.07) {
                // Pull up, both hands moving down
                poseLag = 2;
                return "U";

                // }else if (normLeftWristPos.x>2/3 && normLeftWristPos.x<1 && normLeftWristPos.y>0.2 && normLeftWristPos.y<0.8) {
                //     // Move forward, left hand up
                //     return "F";
            } else if (normLeftWristVector.y > 0.4) {
                return "R";
            } else if ((normLeftWristVector.y > 0.1 && normRightWristVector.y < -0.1) || (normLeftWristVector.y < -0.1 && normRightWristVector.y > 0.1)) {
                // Ladder climb, hands moving in opposite directions
                poseLag = 12;
                return 'L';
            } else {
                return 'N';
            }
            //}
        }
    }
    return 'N';
}


comlink.expose({
    async init(canvas) {
        var optionsPose = {
            architecture: 'ResNet50',
            imageScaleFactor: 1,
            outputStride: 16,
            // flipHorizontal: false,
            minConfidence: 0.2,
            maxPoseDetections: 1,
            scoreThreshold: 0.2,
            nmsRadius: 1,
            // detectionType: 'single',
            inputResolution: 257,
            multiplier: 1.0,
            quantBytes: 4,
        };
        console.time("[worker] load-model");
        net = await posenet.load();
        console.timeEnd("[worker] load-model");
        ctx = canvas.getContext("2d");
        console.time("[worker] ready");
    },
    async update(bitmap) {
        if (net != null && ctx) {
        imageBufferContext.drawImage(bitmap, 0, 0);

        const t0 = performance.now();
        const data = await net.estimateSinglePose(imageBufferCanvas);
        console.log("classification: ", performance.now() - t0);
        console.log("data: ", data);
        return data;
        }
    },
});