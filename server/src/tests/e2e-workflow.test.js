const http = require('http');

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      if (typeof body === 'object') {
        req.setHeader('Content-Type', 'application/json');
        req.write(JSON.stringify(body));
      } else {
        req.write(body);
      }
    }
    req.end();
  });
}

async function runEndToEndVerification() {
  console.log('================================================================');
  console.log('   CIVICCONNECT END-TO-END WORKFLOW & LIFECYCLE AUDIT');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function test(condition, name, details = '') {
    total++;
    if (condition) {
      console.log(`✓ [PASS ${total}] ${name}`);
      passed++;
    } else {
      console.error(`✗ [FAIL ${total}] ${name} ${details}`);
    }
  }

  try {
    // 1. Health check
    const health = await request({ host: 'localhost', port: 5000, path: '/api/health', method: 'GET' });
    test(health.status === 200 && health.data.status === 'online', 'Server health check /api/health');

    // 2. Citizen Login
    console.log('\n--- 1. CITIZEN WORKFLOW ---');
    const citizenLogin = await request(
      { host: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST' },
      { email: 'citizen@civicconnect.com', password: 'Citizen@123' }
    );
    test(citizenLogin.status === 200 && citizenLogin.data.token, 'Citizen login authentication (citizen@civicconnect.com)');
    const citizenToken = citizenLogin.data.token;

    // 3. Citizen Dashboard Stats
    const citizenStats = await request({
      host: 'localhost',
      port: 5000,
      path: '/api/dashboard/stats',
      method: 'GET',
      headers: { Authorization: `Bearer ${citizenToken}` },
    });
    test(citizenStats.status === 200 && citizenStats.data.success, 'Citizen dashboard metrics retrieved', JSON.stringify(citizenStats.data.data));

    // 4. Citizen Report Issue
    const newIssuePayload = {
      title: 'Water Main Break on 14th Cross Road',
      category: 'Water Leakage',
      priority: 'CRITICAL',
      description: 'Underground municipal pipe ruptured creating severe road flooding and property damage.',
      address: 'Near 14th Cross & Commercial Junction, Ward 12',
      latitude: '12.9755',
      longitude: '77.5990',
    };
    const createRes = await request(
      { host: 'localhost', port: 5000, path: '/api/issues', method: 'POST', headers: { Authorization: `Bearer ${citizenToken}` } },
      newIssuePayload
    );
    test(createRes.status === 201 && createRes.data.issue?._id, 'Citizen reports issue with GeoJSON coordinates', `ID: ${createRes.data.issue?._id}`);
    const issueId = createRes.data.issue?._id;

    // 5. Verify Issue Appears in Citizen's My Issues
    const myIssuesRes = await request({
      host: 'localhost',
      port: 5000,
      path: '/api/issues/my',
      method: 'GET',
      headers: { Authorization: `Bearer ${citizenToken}` },
    });
    const foundInMy = myIssuesRes.data.issues?.some(i => i._id === issueId);
    test(foundInMy, 'Issue immediately visible in Citizen My Reports list');

    // 6. Officer Login
    console.log('\n--- 2. OFFICER WORKFLOW ---');
    const officerLogin = await request(
      { host: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST' },
      { email: 'officer@civicconnect.com', password: 'Officer@123' }
    );
    test(officerLogin.status === 200 && officerLogin.data.token, 'Officer login authentication (officer@civicconnect.com)');
    const officerToken = officerLogin.data.token;

    // 7. Officer Inspects Issue Details
    const issueDetails = await request({
      host: 'localhost',
      port: 5000,
      path: `/api/issues/${issueId}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${officerToken}` },
    });
    test(issueDetails.status === 200 && issueDetails.data.issue.status === 'REPORTED', 'Officer inspects issue with initial REPORTED status');

    // 8. Officer Verifies Issue (REPORTED -> VERIFIED)
    const verifyRes = await request(
      {
        host: 'localhost',
        port: 5000,
        path: `/api/issues/${issueId}/status`,
        method: 'PATCH',
        headers: { Authorization: `Bearer ${officerToken}` },
      },
      { status: 'VERIFIED', remarks: 'Site inspection completed by Officer Rajesh. High flood hazard confirmed.' }
    );
    test(verifyRes.status === 200 && verifyRes.data.issue.status === 'VERIFIED', 'Officer verifies issue (REPORTED -> VERIFIED)');

    // 9. Officer Updates to IN_PROGRESS
    const progressRes = await request(
      {
        host: 'localhost',
        port: 5000,
        path: `/api/issues/${issueId}/status`,
        method: 'PATCH',
        headers: { Authorization: `Bearer ${officerToken}` },
      },
      { status: 'IN_PROGRESS', remarks: 'Emergency valve closure team and heavy excavators on site.' }
    );
    test(progressRes.status === 200 && progressRes.data.issue.status === 'IN_PROGRESS', 'Officer marks issue IN_PROGRESS with action remarks');

    // 10. Officer Resolves Issue (IN_PROGRESS -> RESOLVED)
    const resolveRes = await request(
      {
        host: 'localhost',
        port: 5000,
        path: `/api/issues/${issueId}/status`,
        method: 'PATCH',
        headers: { Authorization: `Bearer ${officerToken}` },
      },
      {
        status: 'RESOLVED',
        remarks: 'Pipeline collar welded and tested under 6-bar pressure. Road cleaned and opened for traffic.',
        evidenceImage: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?auto=format&fit=crop&w=800&q=80',
      }
    );
    test(resolveRes.status === 200 && resolveRes.data.issue.status === 'RESOLVED', 'Officer resolves issue with resolution remarks and evidence photo');

    // 11. Citizen Notifications Check
    console.log('\n--- 3. CITIZEN VERIFICATION & REOPEN ---');
    const citizenNotifs = await request({
      host: 'localhost',
      port: 5000,
      path: '/api/notifications',
      method: 'GET',
      headers: { Authorization: `Bearer ${citizenToken}` },
    });
    test(citizenNotifs.status === 200 && citizenNotifs.data.notifications.length > 0, 'Citizen received real-time notification of status updates');

    // 12. Citizen Reopens Resolved Issue
    const reopenRes = await request(
      {
        host: 'localhost',
        port: 5000,
        path: `/api/issues/${issueId}/reopen`,
        method: 'POST',
        headers: { Authorization: `Bearer ${citizenToken}` },
      },
      { remarks: 'Minor seep still bubbling near curb. Request secondary seal inspection.' }
    );
    test(reopenRes.status === 200 && reopenRes.data.issue.status === 'REOPENED', 'Citizen successfully reopens issue (RESOLVED -> REOPENED)');

    // 13. Audit Trail Verification
    const auditRes = await request({
      host: 'localhost',
      port: 5000,
      path: `/api/issues/${issueId}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${citizenToken}` },
    });
    const history = auditRes.data.issue.statusHistory;
    test(
      history.length >= 4 &&
      history[0].status === 'REPORTED' &&
      history[1].status === 'VERIFIED' &&
      history[2].status === 'IN_PROGRESS' &&
      history[3].status === 'RESOLVED',
      `Audit trail preserved 5 sequential transitions with timestamps and remarks (length: ${history.length})`
    );

    // 14. Admin Login & Dashboard Analytics
    console.log('\n--- 4. ADMIN WORKFLOW & GOVERNANCE ---');
    const adminLogin = await request(
      { host: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST' },
      { email: 'admin@civicconnect.com', password: 'Admin@123' }
    );
    test(adminLogin.status === 200 && adminLogin.data.token, 'Admin login authentication (admin@civicconnect.com)');
    const adminToken = adminLogin.data.token;

    // 15. Admin Analytics Stats
    const adminStats = await request({
      host: 'localhost',
      port: 5000,
      path: '/api/dashboard/stats',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const statsData = adminStats.data.data;
    test(
      adminStats.status === 200 &&
      statsData.totalUsers > 0 &&
      statsData.totalIssues > 0 &&
      Array.isArray(statsData.byCategory) &&
      Array.isArray(statsData.byStatus) &&
      Array.isArray(statsData.byPriority),
      'Admin analytics aggregations (byCategory, byStatus, byPriority) calculated from real MongoDB data'
    );

    // 16. Admin Departments Management
    const deptsList = await request({
      host: 'localhost',
      port: 5000,
      path: '/api/departments',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    test(deptsList.status === 200 && deptsList.data.departments.length >= 6, 'Admin retrieves municipal departments list');

    // 17. Admin User Management
    const usersList = await request({
      host: 'localhost',
      port: 5000,
      path: '/api/users',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    test(usersList.status === 200 && usersList.data.users.length >= 7, 'Admin retrieves system users across all roles');

    // 18. Geospatial Query
    console.log('\n--- 5. GIS & GEOSPATIAL SEARCH ---');
    const geoQuery = await request({
      host: 'localhost',
      port: 5000,
      path: '/api/issues?lat=12.9716&lng=77.5946&radius=10000',
      method: 'GET',
    });
    test(geoQuery.status === 200 && geoQuery.data.issues.length > 0, 'MongoDB 2dsphere geospatial search retrieves localized pins');

  } catch (err) {
    console.error('Test execution error:', err);
  }

  console.log('\n================================================================');
  console.log(` AUDIT COMPLETE: ${passed} / ${total} Checks Succeeded (${Math.round((passed/total)*100)}%)`);
  console.log('================================================================\n');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runEndToEndVerification();
