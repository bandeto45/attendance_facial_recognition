// Import model binary files as base64 strings
import tinyDetectorBin from '../../assets/models/tiny_face_detector_model.bin.js';
import faceLandmark68Bin from '../../assets/models/face_landmark_68_model.bin.js';
import faceRecognitionBin from '../../assets/models/face_recognition_model.bin.js';

// Import weights manifests
import tinyManifest from '../../assets/models/tiny_face_detector_model-weights_manifest.json';
import landmarkManifest from '../../assets/models/face_landmark_68_model-weights_manifest.json';
import recognitionManifest from '../../assets/models/face_recognition_model-weights_manifest.json';

// Create a map of model files to base64 data
export const modelData = {
  'tiny_face_detector_model.bin': tinyDetectorBin,
  'face_landmark_68_model.bin': faceLandmark68Bin,
  'face_recognition_model.bin': faceRecognitionBin,
  'tiny_face_detector_model-weights_manifest.json': JSON.stringify(tinyManifest),
  'face_landmark_68_model-weights_manifest.json': JSON.stringify(landmarkManifest),
  'face_recognition_model-weights_manifest.json': JSON.stringify(recognitionManifest)
};

// Helper to convert base64 to ArrayBuffer
export const base64ToArrayBuffer = (base64) => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

// Install fetch override IMMEDIATELY when this module loads
console.log('Installing fetch override for model loading...');

// Polyfill fetch with custom handler
const originalFetch = window.fetch;
window.fetch = function(url, options = {}) {
  console.log('Custom fetch called with URL:', url);
  
  // Check if this is a model file request
  const fileName = url.split('/').pop().split('?')[0];
  console.log('Extracted fileName:', fileName);
  
  if (modelData[fileName]) {
    console.log('Serving model file from imported data:', fileName);
    const data = modelData[fileName];
    
    // Return different response types based on file extension
    if (fileName.endsWith('.json')) {
      return Promise.resolve(new Response(data, {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }));
    } else if (fileName.endsWith('.bin')) {
      console.log('Converting base64 to ArrayBuffer for:', fileName);
      const arrayBuffer = base64ToArrayBuffer(data);
      console.log('ArrayBuffer size:', arrayBuffer.byteLength);
      return Promise.resolve(new Response(arrayBuffer, {
        status: 200,
        headers: { 'Content-Type': 'application/octet-stream' }
      }));
    }
  }
  
  // For other URLs, use XMLHttpRequest as fallback (better for Cordova)
  console.log('Using XMLHttpRequest fallback for:', url);
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(options.method || 'GET', url, true);
    
    if (options.headers) {
      Object.keys(options.headers).forEach(key => {
        xhr.setRequestHeader(key, options.headers[key]);
      });
    }
    
    xhr.responseType = 'arraybuffer';
    
    xhr.onload = () => {
      const response = new Response(xhr.response, {
        status: xhr.status,
        statusText: xhr.statusText,
        headers: {}
      });
      resolve(response);
    };
    
    xhr.onerror = () => reject(new TypeError('Network request failed'));
    xhr.ontimeout = () => reject(new TypeError('Network request timed out'));
    
    xhr.send(options.body || null);
  });
};

console.log('Fetch override installed successfully');
