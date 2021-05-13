//import * as comlink from "https://unpkg.com/comlink/dist/esm/comlink.mjs";
import * as comlink from "comlink";
import * as tf from '@tensorflow/tfjs';
import * as posenet from '@tensorflow-models/posenet';

let net: posenet.PoseNet | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let canvasSizeX = 320
let canvasSizeY = 240

//image buffer
const imageBufferCanvas = new OffscreenCanvas(canvasSizeX, canvasSizeY);
const imageBufferContext = (imageBufferCanvas.getContext(
    "2d"
  ) as any) as CanvasRenderingContext2D;
  console.time("[worker] start alie");

comlink.expose({})