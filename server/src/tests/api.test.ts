import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB, closeDB } from '../config/db';
import User from '../models/User';
import Issue from '../models/Issue';
import Department from '../models/Department';
import jwt from 'jsonwebtoken';

async function runTests() {
  console.log('\n======================================================');
  console.log('       CIVICCONNECT BACKEND API & MONGODB TEST SUITE  ');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Test MongoDB Connection
    console.log('[Test 1] Testing Database Connection...');
    const uri = await connectDB();
    assert(Boolean(uri && mongoose.connection.readyState === 1), 'MongoDB connection established');

    // 2. Test User Model & Password Hashing
    console.log('\n[Test 2] Testing User Creation & Password Hashing...');
    const testEmail = `test_${Date.now()}@civicconnect.test`;
    const user = await User.create({
      name: 'Test Citizen',
      email: testEmail,
      password: 'PlainPassword123!',
      role: 'citizen',
    });
    assert(user.password !== 'PlainPassword123!', 'Password hashed with bcrypt');
    const isMatch = await user.comparePassword('PlainPassword123!');
    assert(isMatch === true, 'comparePassword validates correct password');
    const isBadMatch = await user.comparePassword('WrongPassword');
    assert(isBadMatch === false, 'comparePassword rejects incorrect password');

    // 3. Test JWT Token Creation & Verification
    console.log('\n[Test 3] Testing JWT Authentication Token...');
    const secret = process.env.JWT_SECRET || 'civicconnect_super_secret_jwt_key_2026_academic_demo';
    const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, secret, { expiresIn: '1h' });
    const decoded: any = jwt.verify(token, secret);
    assert(decoded.id.toString() === user._id.toString(), 'JWT encodes user ID accurately');
    assert(decoded.role === 'citizen', 'JWT maintains user role');

    // 4. Test Department Creation
    console.log('\n[Test 4] Testing Department Creation...');
    const dept = await Department.create({
      name: `Test PWD ${Date.now()}`,
      description: 'Test Department Description',
      contactEmail: 'testdept@civicconnect.test',
      contactPhone: '+1 555-0192',
    });
    assert(Boolean(dept._id), 'Department saved to MongoDB');

    // 5. Test Issue Creation & GeoJSON 2dsphere indexing
    console.log('\n[Test 5] Testing Issue Creation with GeoJSON Point...');
    const issue = await Issue.create({
      title: 'Water Leak on Test Avenue',
      description: 'Test water pipe burst for automated unit testing',
      category: 'Water Leakage',
      priority: 'HIGH',
      status: 'REPORTED',
      location: {
        type: 'Point',
        coordinates: [77.5946, 12.9716], // [lng, lat]
      },
      address: 'Test Avenue 102',
      reportedBy: user._id,
      assignedDepartment: dept._id,
      statusHistory: [
        {
          status: 'REPORTED',
          changedBy: user._id,
          changedAt: new Date(),
          remarks: 'Initial report by test suite',
        },
      ],
    });

    assert(Boolean(issue._id), 'Issue created in MongoDB');
    assert(issue.location.type === 'Point', 'Location conforms to GeoJSON Point standard');
    assert(issue.location.coordinates[0] === 77.5946, 'Longitude stored at index 0');
    assert(issue.location.coordinates[1] === 12.9716, 'Latitude stored at index 1');

    // 6. Test Geospatial MongoDB Query
    console.log('\n[Test 6] Testing Geospatial $near Sphere Query...');
    const nearIssues = await Issue.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [77.5946, 12.9716],
          },
          $maxDistance: 5000, // 5km
        },
      },
    });
    assert(nearIssues.length > 0, 'Geospatial 2dsphere $near query successfully retrieves issue');

    // 7. Test Status Workflow Transition & Status History
    console.log('\n[Test 7] Testing Issue Workflow & Status History Transitions...');
    issue.status = 'IN_PROGRESS';
    issue.statusHistory.push({
      status: 'IN_PROGRESS',
      changedBy: user._id,
      changedAt: new Date(),
      remarks: 'Dispatched maintenance unit',
    });
    await issue.save();

    const reloadedIssue = await Issue.findById(issue._id);
    assert(reloadedIssue?.status === 'IN_PROGRESS', 'Issue status updated to IN_PROGRESS');
    assert(reloadedIssue?.statusHistory.length === 2, 'Status history array preserved sequential audit trail');
    assert(reloadedIssue?.statusHistory[1].status === 'IN_PROGRESS', 'Status history record has matching status');

    // 8. Clean up test records
    await Issue.deleteOne({ _id: issue._id });
    await Department.deleteOne({ _id: dept._id });
    await User.deleteOne({ _id: user._id });
    console.log('\n[Clean Up] Cleaned up temporary test artifacts.');

  } catch (error: any) {
    console.error('Unexpected error during test execution:', error);
    failed++;
  } finally {
    await closeDB();
  }

  console.log('\n======================================================');
  console.log(` RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
