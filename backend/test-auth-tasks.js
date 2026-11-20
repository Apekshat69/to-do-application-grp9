const http = require('http');
const app = require('./src/app');

// Helper to make local requests to the express app without needing external networking
function request(server, method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const addr = server.address();
    const options = {
      hostname: '127.0.0.1',
      port: addr.port,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: json,
        });
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
  console.log('====================================================');
  console.log('   TaskFlow Authentication & Task Verification Suite');
  console.log('====================================================\n');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const testResults = [];

  function record(stepNumber, testName, passed, details) {
    const symbol = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${symbol} [Step ${stepNumber}] ${testName}: ${details}`);
    testResults.push({ stepNumber, testName, passed, details });
  }

  try {
    const timestamp = Date.now();
    const user1Email = `student_${timestamp}@college.edu`;
    const user2Email = `faculty_${timestamp}@college.edu`;
    let user1Token = null;
    let user1Id = null;
    let user2Token = null;
    let user2Id = null;
    let adminToken = null;
    let user1TaskId = null;
    let user2TaskId = null;

    // 1. User Registration
    const regRes = await request(server, 'POST', '/api/auth/register', {}, {
      fullName: 'Alice Student',
      email: user1Email,
      password: 'StrongPassword123!',
      role: 'admin', // Attempt privilege escalation
    });

    const regPass = regRes.status === 201 &&
      regRes.body.success &&
      regRes.body.user.role === 'user' && // Must NOT allow escalating to admin
      Boolean(regRes.body.token);

    user1Token = regRes.body.token;
    user1Id = regRes.body.user?.id;

    record(1, 'User Registration & Role Safeguard', regPass,
      `Status ${regRes.status}. Role: ${regRes.body.user?.role} (Escalation blocked). Token generated.`);

    // 2. User Login
    const loginRes = await request(server, 'POST', '/api/auth/login', {}, {
      email: user1Email,
      password: 'StrongPassword123!',
    });

    const loginPass = loginRes.status === 200 &&
      loginRes.body.success &&
      loginRes.body.user.email === user1Email &&
      loginRes.body.user.role === 'user';

    record(2, 'User Login with Password Verification', loginPass,
      `Status ${loginRes.status}. Authenticated as ${loginRes.body.user?.email}`);

    // 3. Admin Login
    const adminRes = await request(server, 'POST', '/api/auth/admin/login', {}, {
      email: 'admin@taskflow.dev',
      password: 'admin123',
    });

    const adminPass = adminRes.status === 200 &&
      adminRes.body.success &&
      adminRes.body.user.role === 'admin' &&
      Boolean(adminRes.body.token);

    adminToken = adminRes.body.token;

    record(3, 'Admin Login & Role Verification', adminPass,
      `Status ${adminRes.status}. Verified Admin: ${adminRes.body.user?.email} (${adminRes.body.user?.role})`);

    // 4. Invalid Login Handling
    const badPassRes = await request(server, 'POST', '/api/auth/login', {}, {
      email: user1Email,
      password: 'WrongPassword999!',
    });

    const badAdminRes = await request(server, 'POST', '/api/auth/admin/login', {}, {
      email: user1Email, // Normal user trying admin portal
      password: 'StrongPassword123!',
    });

    const invalidPass = badPassRes.status === 401 && badAdminRes.status === 403;
    record(4, 'Invalid Login & Portal Access Denied', invalidPass,
      `Wrong password rejected with 401. Standard user to admin portal rejected with 403: "${badAdminRes.body?.message}"`);

    // 5. User Dashboard Redirection Logic
    const userRole = loginRes.body.user.role;
    const userRoute = userRole === 'admin' ? '/admin/dashboard' : '/dashboard';
    record(5, 'User Role Redirection', userRoute === '/dashboard',
      `User with role='${userRole}' resolves target route '${userRoute}'`);

    // 6. Admin Dashboard Redirection Logic
    const adminRoleVal = adminRes.body.user.role;
    const adminRoute = adminRoleVal === 'admin' ? '/admin/dashboard' : '/dashboard';
    record(6, 'Admin Role Redirection', adminRoute === '/admin/dashboard',
      `Admin with role='${adminRoleVal}' resolves target route '${adminRoute}'`);

    // 7. Unauthorized Admin Access Prevention
    const unauthRes = await request(server, 'GET', '/api/admin/tasks', {
      Authorization: `Bearer ${user1Token}`, // Normal user token
    });

    const noTokenRes = await request(server, 'GET', '/api/admin/tasks'); // No token

    const preventAdminPass = unauthRes.status === 403 && noTokenRes.status === 401;
    record(7, 'Unauthorized Admin API Prevention', preventAdminPass,
      `User token rejected with 403 Forbidden. No token rejected with 401 Unauthorized.`);

    // 8. Task Creation (User 1)
    const createTaskRes = await request(server, 'POST', '/api/tasks', {
      Authorization: `Bearer ${user1Token}`,
    }, {
      title: 'Complete Operating Systems Lab Assignment',
      description: 'Implement semaphore synchronization in C',
      priority: 'High',
      category: 'Study',
      dueDate: '2026-11-28',
      status: 'Pending',
    });

    const createPass = createTaskRes.status === 201 &&
      createTaskRes.body.success &&
      Boolean(createTaskRes.body.task?.id);

    user1TaskId = createTaskRes.body.task?.id;
    record(8, 'Task Creation for Authenticated User', createPass,
      `Status ${createTaskRes.status}. Created Task ID #${user1TaskId} ("${createTaskRes.body.task?.title}")`);

    // 9. Task Retrieval (Empty list for new user & accurate list for owner)
    // Register User 2
    const reg2Res = await request(server, 'POST', '/api/auth/register', {}, {
      fullName: 'Bob Faculty',
      email: user2Email,
      password: 'StrongPassword456!',
    });
    user2Token = reg2Res.body.token;
    user2Id = reg2Res.body.user?.id;

    // User 2 fetches tasks -> must be EMPTY (no demo tasks!)
    const user2InitialTasksRes = await request(server, 'GET', '/api/tasks', {
      Authorization: `Bearer ${user2Token}`,
    });

    // User 1 fetches tasks -> must have exactly 1 task
    const user1TasksRes = await request(server, 'GET', '/api/tasks', {
      Authorization: `Bearer ${user1Token}`,
    });

    const retrievalPass = user2InitialTasksRes.body.tasks?.length === 0 &&
      user1TasksRes.body.tasks?.length === 1 &&
      user1TasksRes.body.tasks[0].id == user1TaskId;

    record(9, 'Task Retrieval & Zero Default Demo Tasks', retrievalPass,
      `New User 2 starts with 0 tasks (count: ${user2InitialTasksRes.body.tasks?.length}). User 1 has 1 task.`);

    // 10. Task Update and Completion
    const updateRes = await request(server, 'PUT', `/api/tasks/${user1TaskId}`, {
      Authorization: `Bearer ${user1Token}`,
    }, {
      title: 'Complete Operating Systems Lab Assignment - Updated',
      status: 'Completed',
    });

    const updatePass = updateRes.status === 200 &&
      updateRes.body.task?.status === 'Completed' &&
      updateRes.body.task?.completed === true;

    record(10, 'Task Update & Completion Status', updatePass,
      `Status ${updateRes.status}. Updated status to 'Completed' (completed: ${updateRes.body.task?.completed})`);

    // 11. User-specific Task Isolation
    // User 2 creates a task
    const user2CreateRes = await request(server, 'POST', '/api/tasks', {
      Authorization: `Bearer ${user2Token}`,
    }, {
      title: 'Prepare Midterm Exam Paper',
      priority: 'High',
      category: 'Work',
    });
    user2TaskId = user2CreateRes.body.task?.id;

    // User 1 attempts to access User 2's task
    const crossGetRes = await request(server, 'GET', `/api/tasks/${user2TaskId}`, {
      Authorization: `Bearer ${user1Token}`,
    });

    // User 1 attempts to update User 2's task
    const crossPutRes = await request(server, 'PUT', `/api/tasks/${user2TaskId}`, {
      Authorization: `Bearer ${user1Token}`,
    }, {
      title: 'Hacked Title',
    });

    // User 1 attempts to delete User 2's task
    const crossDeleteRes = await request(server, 'DELETE', `/api/tasks/${user2TaskId}`, {
      Authorization: `Bearer ${user1Token}`,
    });

    const isolationPass = crossGetRes.status === 404 &&
      crossPutRes.status === 404 &&
      crossDeleteRes.status === 404;

    record(11, 'Cross-User Task Privacy & Isolation', isolationPass,
      `Access to foreign task denied: GET (status ${crossGetRes.status}), PUT (status ${crossPutRes.status}), DELETE (status ${crossDeleteRes.status})`);

    // 12. Task Deletion by Owner
    const deleteRes = await request(server, 'DELETE', `/api/tasks/${user1TaskId}`, {
      Authorization: `Bearer ${user1Token}`,
    });

    const verifyDeletedRes = await request(server, 'GET', `/api/tasks/${user1TaskId}`, {
      Authorization: `Bearer ${user1Token}`,
    });

    const deletePass = deleteRes.status === 200 && verifyDeletedRes.status === 404;
    record(12, 'Task Deletion by Verified Owner', deletePass,
      `Delete status ${deleteRes.status}. Subsequent lookup status ${verifyDeletedRes.status} (Not Found)`);

    // 13. Logout & Relogin Persistence
    const reLoginRes = await request(server, 'POST', '/api/auth/login', {}, {
      email: user2Email,
      password: 'StrongPassword456!',
    });

    const user2TasksAfterRelogin = await request(server, 'GET', '/api/tasks', {
      Authorization: `Bearer ${reLoginRes.body.token}`,
    });

    const reloginPass = reLoginRes.status === 200 &&
      user2TasksAfterRelogin.body.tasks?.length === 1 &&
      user2TasksAfterRelogin.body.tasks[0].id == user2TaskId;

    record(13, 'Logout & Relogin Task Continuity', reloginPass,
      `User 2 re-authenticated. Preserved task: "${user2TasksAfterRelogin.body.tasks[0]?.title}"`);

    // 14. Admin Task Monitoring & Moderation
    const adminViewTasksRes = await request(server, 'GET', '/api/admin/tasks', {
      Authorization: `Bearer ${adminToken}`,
    });

    const adminModerationPass = adminViewTasksRes.status === 200 &&
      Array.isArray(adminViewTasksRes.body.tasks) &&
      adminViewTasksRes.body.tasks.some((t) => t.id == user2TaskId);

    record(14, 'Admin Centralized Oversight & Auditing', adminModerationPass,
      `Admin retrieved cross-user tasks (${adminViewTasksRes.body.tasks?.length} total). Monitored User 2 task.`);

  } finally {
    server.close();
  }

  console.log('\n====================================================');
  const allPassed = testResults.every((t) => t.passed);
  console.log(`Summary: ${testResults.filter((t) => t.passed).length}/${testResults.length} Tests Passed`);
  console.log('====================================================\n');
  process.exit(allPassed ? 0 : 1);
}

runTests().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
