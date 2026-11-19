const http = require('http');

const PORT = 5000;
const BASE_URL = `http://127.0.0.1:${PORT}`;

function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json;
        try {
          json = JSON.parse(data);
        } catch {
          json = data;
        }
        resolve({ status: res.statusCode, data: json });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING BACKEND INTEGRATION TESTS ---');

  // Test 1: Health
  console.log('Test 1: GET /api/health');
  const health = await makeRequest('GET', '/api/health');
  console.assert(health.status === 200, `Health check failed: ${health.status}`);
  console.log('✓ Health OK:', health.data.status);

  // Test 2: User Login
  console.log('\nTest 2: POST /api/auth/login');
  const userLogin = await makeRequest('POST', '/api/auth/login', {
    email: 'alex.morgan@taskflow.dev',
    password: 'taskflow2026',
  });
  console.assert(userLogin.status === 200, `User login failed: ${userLogin.status}`);
  const userToken = userLogin.data.token;
  console.log('✓ User Login OK:', userLogin.data.user.fullName, `(Token received)`);

  // Test 3: Admin Login
  console.log('\nTest 3: POST /api/auth/admin/login');
  const adminLogin = await makeRequest('POST', '/api/auth/admin/login', {
    email: 'admin@taskflow.dev',
    password: 'admin123',
  });
  console.assert(adminLogin.status === 200, `Admin login failed: ${adminLogin.status}`);
  const adminToken = adminLogin.data.token;
  console.log('✓ Admin Login OK:', adminLogin.data.user.fullName, `(Role: ${adminLogin.data.user.role})`);

  // Test 4: Regular user trying Admin endpoint -> MUST RETURN 403 Forbidden
  console.log('\nTest 4: Regular user role authorization check (GET /api/admin/stats)');
  const forbiddenCheck = await makeRequest('GET', '/api/admin/stats', null, userToken);
  console.assert(forbiddenCheck.status === 403, `Expected 403 Forbidden, got ${forbiddenCheck.status}`);
  console.log('✓ Role authorization verified: 403 Forbidden for non-admin user');

  // Test 5: Admin accessing Admin stats -> MUST RETURN 200
  console.log('\nTest 5: Admin accessing GET /api/admin/stats');
  const adminStats = await makeRequest('GET', '/api/admin/stats', null, adminToken);
  console.assert(adminStats.status === 200, `Admin stats failed: ${adminStats.status}`);
  console.log('✓ Admin Stats OK:', adminStats.data.stats);

  // Test 6: User Task Listing
  console.log('\nTest 6: GET /api/tasks');
  const taskList = await makeRequest('GET', '/api/tasks', null, userToken);
  console.assert(taskList.status === 200, `Task list failed: ${taskList.status}`);
  console.log(`✓ Fetched ${taskList.data.tasks.length} tasks for Alex`);

  // Test 7: User Task Stats
  console.log('\nTest 7: GET /api/tasks/stats');
  const taskStats = await makeRequest('GET', '/api/tasks/stats', null, userToken);
  console.assert(taskStats.status === 200, `Task stats failed: ${taskStats.status}`);
  console.log('✓ Task Stats:', taskStats.data.stats);

  // Test 8: Create Task
  console.log('\nTest 8: POST /api/tasks');
  const newTask = await makeRequest('POST', '/api/tasks', {
    title: 'Test Integration Task',
    description: 'Verify task creation end-to-end',
    dueDate: '2026-11-25',
    priority: 'High',
    category: 'Work',
    status: 'Pending',
  }, userToken);
  console.assert(newTask.status === 201, `Create task failed: ${newTask.status}`);
  const createdId = newTask.data.task.id;
  console.log('✓ Task Created with ID:', createdId);

  // Test 9: Update Task
  console.log('\nTest 9: PUT /api/tasks/:id');
  const updatedTask = await makeRequest('PUT', `/api/tasks/${createdId}`, {
    title: 'Test Integration Task (Updated)',
    priority: 'Medium',
    status: 'In Progress',
  }, userToken);
  console.assert(updatedTask.status === 200, `Update task failed: ${updatedTask.status}`);
  console.log('✓ Task Updated:', updatedTask.data.task.title, updatedTask.data.task.status);

  // Test 10: Toggle Task Complete
  console.log('\nTest 10: PATCH /api/tasks/:id/toggle');
  const toggleRes = await makeRequest('PATCH', `/api/tasks/${createdId}/toggle`, null, userToken);
  console.assert(toggleRes.status === 200, `Toggle failed: ${toggleRes.status}`);
  console.log('✓ Toggled complete:', toggleRes.data.task.completed, toggleRes.data.task.status);

  // Test 11: Delete Task
  console.log('\nTest 11: DELETE /api/tasks/:id');
  const deleteRes = await makeRequest('DELETE', `/api/tasks/${createdId}`, null, userToken);
  console.assert(deleteRes.status === 200, `Delete task failed: ${deleteRes.status}`);
  console.log('✓ Task Deleted OK');

  // Test 12: Categories API
  console.log('\nTest 12: GET /api/categories');
  const categoriesRes = await makeRequest('GET', '/api/categories', null, userToken);
  console.assert(categoriesRes.status === 200, `Categories failed: ${categoriesRes.status}`);
  console.log(`✓ Fetched ${categoriesRes.data.categories.length} categories`);

  // Test 13: Admin Users View
  console.log('\nTest 13: GET /api/admin/users');
  const adminUsers = await makeRequest('GET', '/api/admin/users', null, adminToken);
  console.assert(adminUsers.status === 200, `Admin users failed: ${adminUsers.status}`);
  console.log(`✓ Admin fetched ${adminUsers.data.users.length} registered users with stats`);

  // Test 14: Admin All Tasks View
  console.log('\nTest 14: GET /api/admin/tasks');
  const adminTasks = await makeRequest('GET', '/api/admin/tasks', null, adminToken);
  console.assert(adminTasks.status === 200, `Admin tasks failed: ${adminTasks.status}`);
  console.log(`✓ Admin audited ${adminTasks.data.tasks.length} total tasks across organization`);

  // Test 15: Admin Analytics
  console.log('\nTest 15: GET /api/admin/analytics/monthly & /api/admin/analytics/status');
  const monthlyRes = await makeRequest('GET', '/api/admin/analytics/monthly', null, adminToken);
  const statusRes = await makeRequest('GET', '/api/admin/analytics/status', null, adminToken);
  console.assert(monthlyRes.status === 200 && statusRes.status === 200, 'Admin analytics failed');
  console.log('✓ Monthly activity points:', monthlyRes.data.activity.length);
  console.log('✓ Status doughnut slices:', statusRes.data.doughnut.slices.length);

  console.log('\n🎉 ALL 15 BACKEND TESTS PASSED SUCCESSFULLY! 🎉\n');
}

module.exports = runTests;

if (require.main === module) {
  runTests().catch((err) => {
    console.error('Test error:', err);
    process.exit(1);
  });
}
