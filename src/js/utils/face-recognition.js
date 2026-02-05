/**
 * Face Recognition Utility
 * Handles face detection and recognition using face-api.js or TensorFlow.js
 */

import { RECOGNITION_DEFAULTS } from './constants.js';

class FaceRecognition {
  constructor() {
    this.modelsLoaded = false;
    this.faceDescriptors = [];
    this.studentMap = new Map();
    this.confidenceThreshold = RECOGNITION_DEFAULTS.confidence_threshold;
    this.maxDistance = RECOGNITION_DEFAULTS.max_distance;
  }

  /**
   * Load face-api.js models
   * Models should be placed in /assets/models/
   */
  async loadModels() {
    if (this.modelsLoaded) return true;

    try {
      // Note: This assumes face-api.js is loaded via CDN or npm
      // Models should be in public/assets/models/ directory
      const MODEL_URL = './assets/models';

      // For now, we'll simulate model loading
      // In production, use face-api.js:
      // await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
      // await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      // await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

      console.log('Face recognition models loaded');
      this.modelsLoaded = true;
      return true;
    } catch (error) {
      console.error('Model loading error:', error);
      return false;
    }
  }

  /**
   * Detect faces in image/video frame
   * @param {HTMLVideoElement|HTMLImageElement|HTMLCanvasElement} input
   */
  async detectFaces(input) {
    if (!this.modelsLoaded) {
      console.warn('Models not loaded yet');
      return [];
    }

    try {
      // In production, use face-api.js:
      // const detections = await faceapi
      //   .detectAllFaces(input)
      //   .withFaceLandmarks()
      //   .withFaceDescriptors();
      
      // For now, return mock data
      return [];
    } catch (error) {
      console.error('Face detection error:', error);
      return [];
    }
  }

  /**
   * Extract face encoding from image
   * @param {string} imageData - Base64 image data
   */
  async extractFaceEncoding(imageData) {
    try {
      const img = await this.loadImage(imageData);
      const detections = await this.detectFaces(img);
      
      if (detections.length === 0) {
        return { success: false, error: 'No face detected' };
      }

      if (detections.length > 1) {
        return { success: false, error: 'Multiple faces detected' };
      }

      const encoding = detections[0].descriptor;
      return { success: true, encoding: Array.from(encoding) };
    } catch (error) {
      console.error('Face encoding error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Load student face descriptors from database
   */
  async loadStudentDescriptors(students) {
    this.faceDescriptors = [];
    this.studentMap.clear();

    students.forEach(student => {
      if (student.face_encoding) {
        try {
          const encoding = JSON.parse(student.face_encoding);
          this.faceDescriptors.push({
            studentId: student.id,
            descriptor: new Float32Array(encoding)
          });
          this.studentMap.set(student.id, student);
        } catch (error) {
          console.error(`Failed to load encoding for student ${student.id}:`, error);
        }
      }
    });

    console.log(`Loaded ${this.faceDescriptors.length} student face descriptors`);
  }

  /**
   * Recognize face from detection
   */
  async recognizeFace(detection) {
    if (this.faceDescriptors.length === 0) {
      return { success: false, error: 'No student descriptors loaded' };
    }

    let bestMatch = null;
    let bestDistance = this.maxDistance;

    // Compare with all stored descriptors
    this.faceDescriptors.forEach(({ studentId, descriptor }) => {
      const distance = this.euclideanDistance(detection.descriptor, descriptor);
      
      if (distance < bestDistance) {
        bestDistance = distance;
        bestMatch = studentId;
      }
    });

    if (bestMatch) {
      const confidence = 1 - (bestDistance / this.maxDistance);
      const student = this.studentMap.get(bestMatch);
      
      return {
        success: true,
        studentId: bestMatch,
        student: student,
        confidence: confidence,
        distance: bestDistance
      };
    }

    return { success: false, error: 'No match found' };
  }

  /**
   * Calculate Euclidean distance between two descriptors
   */
  euclideanDistance(desc1, desc2) {
    if (desc1.length !== desc2.length) {
      throw new Error('Descriptor lengths do not match');
    }

    let sum = 0;
    for (let i = 0; i < desc1.length; i++) {
      const diff = desc1[i] - desc2[i];
      sum += diff * diff;
    }

    return Math.sqrt(sum);
  }

  /**
   * Load image from data URL
   */
  loadImage(dataUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = dataUrl;
    });
  }

  /**
   * Set confidence threshold
   */
  setConfidenceThreshold(threshold) {
    this.confidenceThreshold = threshold;
  }

  /**
   * Set max distance for matching
   */
  setMaxDistance(distance) {
    this.maxDistance = distance;
  }

  /**
   * Draw face detection boxes on canvas
   */
  drawDetections(canvas, detections) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    detections.forEach(detection => {
      const { box } = detection.detection;
      
      // Draw bounding box
      ctx.strokeStyle = '#4CAF50';
      ctx.lineWidth = 3;
      ctx.strokeRect(box.x, box.y, box.width, box.height);
      
      // Draw landmarks if available
      if (detection.landmarks) {
        ctx.fillStyle = '#4CAF50';
        detection.landmarks.positions.forEach(point => {
          ctx.fillRect(point.x - 2, point.y - 2, 4, 4);
        });
      }
    });
  }

  /**
   * Draw recognition result on canvas
   */
  drawRecognition(canvas, detection, recognitionResult) {
    const ctx = canvas.getContext('2d');
    const { box } = detection.detection;

    if (recognitionResult.success) {
      const { student, confidence } = recognitionResult;
      const label = `${student.first_name} ${student.last_name}`;
      const confidenceText = `${(confidence * 100).toFixed(1)}%`;

      // Draw box
      ctx.strokeStyle = '#4CAF50';
      ctx.lineWidth = 3;
      ctx.strokeRect(box.x, box.y, box.width, box.height);

      // Draw label background
      const fontSize = 16;
      ctx.font = `${fontSize}px Arial`;
      const textWidth = ctx.measureText(label).width;
      const textHeight = fontSize + 10;

      ctx.fillStyle = 'rgba(76, 175, 80, 0.9)';
      ctx.fillRect(box.x, box.y - textHeight, textWidth + 20, textHeight);

      // Draw label text
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(label, box.x + 10, box.y - fontSize / 2);

      // Draw confidence
      ctx.fillStyle = 'rgba(76, 175, 80, 0.9)';
      ctx.fillRect(box.x + box.width - 60, box.y, 60, 25);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '14px Arial';
      ctx.fillText(confidenceText, box.x + box.width - 55, box.y + 17);
    } else {
      // Unknown face
      ctx.strokeStyle = '#FF5722';
      ctx.lineWidth = 3;
      ctx.strokeRect(box.x, box.y, box.width, box.height);

      ctx.fillStyle = 'rgba(255, 87, 34, 0.9)';
      ctx.fillRect(box.x, box.y - 30, 100, 30);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '16px Arial';
      ctx.fillText('Unknown', box.x + 10, box.y - 10);
    }
  }
}

// Export singleton instance
const faceRecognition = new FaceRecognition();
export default faceRecognition;
