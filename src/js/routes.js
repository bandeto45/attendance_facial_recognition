/**
 * Attendance Facial Recognition - Routes Configuration
 * 
 * Route structure:
 * - Login (default/index)
 * - Recognition (main camera screen)
 * - Attendance Records
 * - Students Management
 */

// Pages
import LoginPage from '../pages/home.f7';
import RecognitionPage from '../pages/recognition.f7';
import CameraPage from '../pages/camera.f7';
import AttendanceRecordsPage from '../pages/attendance/records.f7';
import AttendanceDetailsPage from '../pages/attendance/details.f7';
import AttendanceReportsPage from '../pages/attendance/reports.f7';
import StudentsListPage from '../pages/students/list.f7';
import StudentAddPage from '../pages/students/add.f7';
import StudentDetailsPage from '../pages/students/details.f7';
import NotFoundPage from '../pages/404.f7';

const routes = [
  // Login/Auth
  {
    path: '/',
    component: LoginPage,
  },
  
  // Main Recognition Screen
  {
    path: '/recognition/',
    component: RecognitionPage,
  },
  
  // Camera for Face Recognition
  {
    path: '/camera/:mode/',
    component: CameraPage,
  },
  
  // Attendance Records
  {
    path: '/attendance/records/',
    component: AttendanceRecordsPage,
  },
  {
    path: '/attendance/details/:recordId/',
    component: AttendanceDetailsPage,
  },
  {
    path: '/attendance/reports/',
    component: AttendanceReportsPage,
  },
  
  // Students Management
  {
    path: '/students/',
    component: StudentsListPage,
  },
  {
    path: '/students/add/',
    component: StudentAddPage,
  },
  {
    path: '/students/:studentId/',
    component: StudentDetailsPage,
  },
  
  // 404
  {
    path: '(.*)',
    component: NotFoundPage,
  },
];

export default routes;