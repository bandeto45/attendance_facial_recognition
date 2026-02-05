/**
 * Application Constants
 */

export const APP_CONFIG = {
  name: 'Attendance Facial Recognition',
  version: '1.0.0',
  database: 'attendance.db'
};

export const USER_ROLES = {
  ADMIN: 'admin',
  OPERATOR: 'operator'
};

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  LATE: 'late',
  ABSENT: 'absent'
};

export const STUDENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive'
};

export const RECOGNITION_DEFAULTS = {
  confidence_threshold: 0.6,
  duplicate_time_window: 300, // 5 minutes in seconds
  face_detection_interval: 100, // milliseconds
  max_distance: 0.6
};

export const CAMERA_DEFAULTS = {
  resolution: 'high',
  frame_rate: 30,
  default_camera: 'front',
  flash: false
};

export const EXPORT_FORMATS = {
  EXCEL: 'xlsx',
  PDF: 'pdf',
  CSV: 'csv'
};
