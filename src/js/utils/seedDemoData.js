/**
 * Seed demo students for testing
 * Call this once from app initialization or settings
 */

import db from './database.js';

export async function seedDemoStudents() {
  try {
    await db.init();
    
    // Check if already seeded
    const existing = await db.getAllStudents();
    if (existing.length > 0) {
      console.log('Demo students already exist');
      return { success: true, message: 'Already seeded' };
    }

    // Demo students (without face encodings - need to add via photo capture)
    const demoStudents = [
      {
        student_id: '2024-00001',
        first_name: 'John',
        last_name: 'Doe',
        course: 'Computer Science',
        year_level: 3,
        photo_blob: null,
        face_encoding: null
      },
      {
        student_id: '2024-00002',
        first_name: 'Jane',
        last_name: 'Smith',
        course: 'Information Technology',
        year_level: 2,
        photo_blob: null,
        face_encoding: null
      },
      {
        student_id: '2024-00003',
        first_name: 'Mike',
        last_name: 'Johnson',
        course: 'Computer Science',
        year_level: 4,
        photo_blob: null,
        face_encoding: null
      }
    ];

    for (const student of demoStudents) {
      await db.addStudent(student);
    }

    console.log('Demo students seeded successfully');
    return { success: true, message: 'Demo students added', count: demoStudents.length };
  } catch (error) {
    console.error('Seed demo data error:', error);
    return { success: false, error: error.message };
  }
}

export async function clearAllData() {
  try {
    await db.init();
    await db.query('DELETE FROM attendance');
    await db.query('DELETE FROM students');
    return { success: true, message: 'All data cleared' };
  } catch (error) {
    console.error('Clear data error:', error);
    return { success: false, error: error.message };
  }
}
