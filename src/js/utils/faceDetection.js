import * as faceapi from '@vladmandic/face-api';

// Fetch override is installed in modelLoader.js which is imported first in app.js

// Simple wrapper around face-api.js model loading and recognition
class FaceDetectionService {
  constructor() {
    this.modelsLoaded = false;
    this.studentDescriptors = [];
    this.studentById = new Map();
    this.confidenceThreshold = 0.6;
  }

  async loadModels() {
    if (this.modelsLoaded) return true;
    
    console.log('Loading face-api models from imported modules...');
    
    try {
      console.log('Loading tinyFaceDetector model...');
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');

      console.log('Loading faceLandmark68Net model...');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');

      console.log('Loading faceRecognitionNet model...');
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');

      this.modelsLoaded = true;
      console.log('Face-api models loaded successfully from imports');
      return true;
    } catch (err) {
      console.error('face-api model load failed:', err);
      console.error('Error details:', err.message, err.stack);
      return false;
    }
  }

  async setStudents(students = []) {
    this.studentDescriptors = [];
    this.studentById.clear();
    students.forEach((s) => {
      if (!s.face_encoding) return;
      try {
        const enc = JSON.parse(s.face_encoding);
        this.studentDescriptors.push({
          studentId: s.id,
          descriptor: new Float32Array(enc),
        });
        this.studentById.set(s.id, s);
      } catch (err) {
        console.error('Failed to parse encoding for student', s.id, err);
      }
    });
  }

  async detectAndRecognize({ image, confidenceThreshold = this.confidenceThreshold }) {
    if (!this.modelsLoaded) return { detections: [], matches: [] };
    if (!image) return { detections: [], matches: [] };

    const options = new faceapi.TinyFaceDetectorOptions({
      inputSize: 320,
      scoreThreshold: 0.5,
    });

    const detections = await faceapi
      .detectAllFaces(image, options)
      .withFaceLandmarks()
      .withFaceDescriptors();

    const matches = detections.map((det) => {
      const best = this.matchDescriptor(det.descriptor, confidenceThreshold);
      return { ...best, box: det.detection.box, descriptor: det.descriptor };
    });

    return { detections, matches };
  }

  matchDescriptor(descriptor, confidenceThreshold) {
    if (!this.studentDescriptors.length) return { matched: false };

    let best = null;
    let bestDistance = Infinity;
    this.studentDescriptors.forEach(({ studentId, descriptor: stored }) => {
      const dist = this.euclidean(descriptor, stored);
      if (dist < bestDistance) {
        bestDistance = dist;
        best = studentId;
      }
    });

    // Convert distance to confidence (approx)
    const confidence = 1 - bestDistance;
    if (confidence >= confidenceThreshold) {
      return {
        matched: true,
        studentId: best,
        student: this.studentById.get(best) || null,
        confidence,
        distance: bestDistance,
      };
    }
    return { matched: false, confidence, distance: bestDistance };
  }

  euclidean(a, b) {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      const d = a[i] - b[i];
      sum += d * d;
    }
    return Math.sqrt(sum);
  }

  async detectSingleFace(image) {
    if (!this.modelsLoaded) {
      throw new Error('Face detection models not loaded');
    }
    if (!image) {
      throw new Error('No image provided');
    }

    const options = new faceapi.TinyFaceDetectorOptions({
      inputSize: 320,
      scoreThreshold: 0.5,
    });

    const detection = await faceapi
      .detectSingleFace(image, options)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      return null;
    }

    return {
      detection: detection.detection,
      landmarks: detection.landmarks,
      descriptor: Array.from(detection.descriptor),
      box: detection.detection.box,
    };
  }
}

const faceDetectionService = new FaceDetectionService();
export default faceDetectionService;
