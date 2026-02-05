/**
 * Attendance Facial Recognition - Global State Management
 * Framework7 Store for app-wide state
 */

import { createStore } from 'framework7';
import { USER_ROLES, ATTENDANCE_STATUS } from './utils/constants.js';

const store = createStore({
  state: {
    // Authentication
    user: null,
    isAuthenticated: false,
    userRole: null,

    // Students
    students: [],
    selectedStudent: null,
    studentsLoaded: false,

    // Attendance
    todayAttendance: [],
    attendanceHistory: [],
    selectedAttendance: null,
    
    // Recognition
    isRecognizing: false,
    recognitionStats: {
      totalScans: 0,
      successfulRecognitions: 0,
      failedRecognitions: 0
    },

    // Camera
    cameraActive: false,
    currentCamera: 'user', // 'user' (front) or 'environment' (back)
    flashEnabled: false,

    // Settings
    settings: {
      confidenceThreshold: 0.6,
      duplicateTimeWindow: 300,
      autoBackupEnabled: false,
      autoBackupInterval: 24,
      theme: 'auto'
    },

    // App State
    loading: false,
    error: null,
    lastBackupTime: null
  },

  getters: {
    // Authentication
    isAuthenticated({ state }) {
      return state.isAuthenticated;
    },
    isAdmin({ state }) {
      return state.userRole === USER_ROLES.ADMIN;
    },
    currentUser({ state }) {
      return state.user;
    },

    // Students
    students({ state }) {
      return state.students;
    },
    activeStudents({ state }) {
      return state.students.filter(s => s.status === 'active');
    },
    studentById: ({ state }) => (id) => {
      return state.students.find(s => s.id === id);
    },

    // Attendance
    todayAttendance({ state }) {
      return state.todayAttendance;
    },
    todayPresentCount({ state }) {
      return state.todayAttendance.filter(a => a.status === ATTENDANCE_STATUS.PRESENT).length;
    },
    todayLateCount({ state }) {
      return state.todayAttendance.filter(a => a.status === ATTENDANCE_STATUS.LATE).length;
    },
    todayAbsentCount({ state }) {
      const presentIds = state.todayAttendance.map(a => a.student_id);
      return state.students.filter(s => s.status === 'active' && !presentIds.includes(s.id)).length;
    },

    // Recognition
    isRecognizing({ state }) {
      return state.isRecognizing;
    },
    recognitionStats({ state }) {
      return state.recognitionStats;
    },

    // Settings
    settings({ state }) {
      return state.settings;
    }
  },

  actions: {
    // Authentication Actions
    login({ state }, { user, role }) {
      state.user = user;
      state.isAuthenticated = true;
      state.userRole = role;
      localStorage.setItem('currentUser', JSON.stringify({ user, role }));
    },

    logout({ state }) {
      state.user = null;
      state.isAuthenticated = false;
      state.userRole = null;
      localStorage.removeItem('currentUser');
    },

    restoreSession({ state }) {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        const { user, role } = JSON.parse(savedUser);
        state.user = user;
        state.isAuthenticated = true;
        state.userRole = role;
      }
    },

    // Student Actions
    setStudents({ state }, students) {
      state.students = students;
      state.studentsLoaded = true;
    },

    addStudent({ state }, student) {
      state.students = [...state.students, student];
    },

    updateStudent({ state }, { id, student }) {
      const index = state.students.findIndex(s => s.id === id);
      if (index !== -1) {
        state.students[index] = { ...state.students[index], ...student };
        state.students = [...state.students]; // Trigger reactivity
      }
    },

    deleteStudent({ state }, id) {
      const index = state.students.findIndex(s => s.id === id);
      if (index !== -1) {
        state.students[index].status = 'inactive';
        state.students = [...state.students]; // Trigger reactivity
      }
    },

    selectStudent({ state }, student) {
      state.selectedStudent = student;
    },

    // Attendance Actions
    setTodayAttendance({ state }, attendance) {
      state.todayAttendance = attendance;
    },

    addAttendanceRecord({ state }, record) {
      state.todayAttendance = [record, ...state.todayAttendance];
    },

    updateAttendanceRecord({ state }, { id, record }) {
      const index = state.todayAttendance.findIndex(a => a.id === id);
      if (index !== -1) {
        state.todayAttendance[index] = { ...state.todayAttendance[index], ...record };
        state.todayAttendance = [...state.todayAttendance]; // Trigger reactivity
      }
    },

    setAttendanceHistory({ state }, history) {
      state.attendanceHistory = history;
    },

    selectAttendance({ state }, attendance) {
      state.selectedAttendance = attendance;
    },

    // Recognition Actions
    startRecognition({ state }) {
      state.isRecognizing = true;
    },

    stopRecognition({ state }) {
      state.isRecognizing = false;
    },

    incrementRecognitionStat({ state }, type) {
      state.recognitionStats.totalScans++;
      if (type === 'success') {
        state.recognitionStats.successfulRecognitions++;
      } else {
        state.recognitionStats.failedRecognitions++;
      }
    },

    resetRecognitionStats({ state }) {
      state.recognitionStats = {
        totalScans: 0,
        successfulRecognitions: 0,
        failedRecognitions: 0
      };
    },

    // Camera Actions
    setCameraActive({ state }, active) {
      state.cameraActive = active;
    },

    toggleCamera({ state }) {
      state.currentCamera = state.currentCamera === 'user' ? 'environment' : 'user';
    },

    toggleFlash({ state }) {
      state.flashEnabled = !state.flashEnabled;
    },

    // Settings Actions
    updateSettings({ state }, settings) {
      state.settings = { ...state.settings, ...settings };
      localStorage.setItem('appSettings', JSON.stringify(state.settings));
    },

    loadSettings({ state }) {
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        state.settings = { ...state.settings, ...JSON.parse(savedSettings) };
      }
    },

    // App State Actions
    setLoading({ state }, loading) {
      state.loading = loading;
    },

    setError({ state }, error) {
      state.error = error;
    },

    clearError({ state }) {
      state.error = null;
    },

    setLastBackupTime({ state }, time) {
      state.lastBackupTime = time;
      localStorage.setItem('lastBackupTime', time);
    }
  }
});

export default store;
