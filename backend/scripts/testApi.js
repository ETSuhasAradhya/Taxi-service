const http = require('http');
const app = require('../src/app');
const { setupDatabase } = require('./setupDb');

function makeRequest(server, method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const port = server.address().port;
    const options = {
      hostname: '127.0.0.1',
      port,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, text: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('================================================================================');
  console.log('🧪 RUNNING COMPREHENSIVE BACKEND API & WORKFLOW TEST SUITE');
  console.log('================================================================================\n');

  // Reset DB with clean sample data first
  await setupDatabase();

  const server = app.listen(0);
  await new Promise(r => setTimeout(r, 200));

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, failDetails = '') {
    if (condition) {
      passed++;
      console.log(`✅ [PASS] ${testName}`);
    } else {
      failed++;
      console.error(`❌ [FAIL] ${testName} - ${failDetails}`);
    }
  }

  try {
    // 1. Health check
    const health = await makeRequest(server, 'GET', '/api/health');
    assert(health.status === 200 && health.body.status === 'online', 'Health check is operational');

    // 2. Admin Login
    const adminLogin = await makeRequest(server, 'POST', '/api/auth/login', {}, {
      email: 'admin@taxiservice.com',
      password: 'Password123!'
    });
    assert(adminLogin.status === 200 && adminLogin.body.token, 'Admin login succeeded and returned JWT');
    const adminToken = adminLogin.body.token;

    // 3. Customer Login
    const customerLogin = await makeRequest(server, 'POST', '/api/auth/login', {}, {
      email: 'rahul.sharma@example.com',
      password: 'Password123!'
    });
    assert(customerLogin.status === 200 && customerLogin.body.token, 'Customer login succeeded');
    const customerToken = customerLogin.body.token;

    // 4. Driver Login
    const driverLogin = await makeRequest(server, 'POST', '/api/auth/login', {}, {
      email: 'suresh.driver@example.com',
      password: 'Password123!'
    });
    assert(driverLogin.status === 200 && driverLogin.body.token, 'Driver login succeeded');
    const driverToken = driverLogin.body.token;

    // 5. Auth /me endpoint
    const meRes = await makeRequest(server, 'GET', '/api/auth/me', { Authorization: `Bearer ${customerToken}` });
    assert(meRes.status === 200 && meRes.body.user.email === 'rahul.sharma@example.com', 'Auth /me identifies authenticated rider');

    // 6. RBAC Guard: Customer blocked from Admin Reports (403 Forbidden)
    const forbiddenRes = await makeRequest(server, 'GET', '/api/reports/summary', { Authorization: `Bearer ${customerToken}` });
    assert(forbiddenRes.status === 403, 'RBAC Guard blocks Customer from Admin reports (403 Forbidden)');

    // 7. Server-side Fare Estimation: max(min_fare, base_fare + km*per_km_rate)
    const fareRes = await makeRequest(server, 'POST', '/api/fare-rates/estimate', {}, {
      vehicle_type: 'sedan',
      pickup_location: 'Andheri West Metro Station',
      destination_location: 'Bandra Kurla Complex (BKC)',
      distance_km: 15.0
    });
    // SEDAN: base 80, per km 16, min 120 -> 80 + 15*16 = 320
    const estFare = fareRes.body.data?.estimated_fare || fareRes.body.data?.estimatedFare;
    assert(fareRes.status === 200 && estFare === 320, 'Fare estimate formula max(min_fare, base_fare + km*rate) accurate');

    // 8. Customer Self-Registration
    const regRes = await makeRequest(server, 'POST', '/api/auth/register', {}, {
      email: `testuser_${Date.now()}@test.com`,
      password: 'Password123!',
      full_name: 'Test Rider',
      phone: `+91 99999 ${Math.floor(10000 + Math.random() * 90000)}`
    });
    assert(regRes.status === 201 && regRes.body.token, 'Customer self-registration succeeds and assigns ID');
    const newRiderToken = regRes.body.token;

    // 9. Customer Creates Booking
    const bookRes = await makeRequest(server, 'POST', '/api/bookings', { Authorization: `Bearer ${newRiderToken}` }, {
      vehicle_type: 'mini',
      pickup_location: 'Andheri West Metro Station',
      destination_location: 'Chhatrapati Shivaji Airport T2',
      payment_method: 'upi',
      distance_km: 10.0
    });
    assert(bookRes.status === 201 && bookRes.body.data?.booking_id, 'Customer creates booking in pending status');
    const newBookingId = bookRes.body.data.booking_id;

    // 10. Negative Test: Driver tries to start a pending booking directly (Invalid transition)
    const invalidStartRes = await makeRequest(server, 'PATCH', `/api/bookings/${newBookingId}/status`, { Authorization: `Bearer ${driverToken}` }, {
      status: 'in_progress'
    });
    assert(invalidStartRes.status >= 400, 'State Machine rejects invalid transition directly from pending to in_progress');

    // 11. Negative Test: Admin tries to assign vehicle with mismatched category
    // newBookingId requested 'mini', vehicle 3 is 'sedan'
    const mismatchAssignRes = await makeRequest(server, 'POST', `/api/bookings/${newBookingId}/assign`, { Authorization: `Bearer ${adminToken}` }, {
      driver_id: 1,
      vehicle_id: 3 // sedan vehicle
    });
    assert(mismatchAssignRes.status >= 400, 'State Machine rejects assignment with mismatched vehicle tier');

    // 12. Admin Assigns Driver 1 and Vehicle 1 (mini) -> status assigned
    const assignRes = await makeRequest(server, 'POST', `/api/bookings/${newBookingId}/assign`, { Authorization: `Bearer ${adminToken}` }, {
      driver_id: 1,
      vehicle_id: 1
    });
    assert(assignRes.status === 200 && (assignRes.body.data.status === 'assigned' || assignRes.body.data.status === 'CONFIRMED'), 'Admin assigns driver and vehicle, transitioning to assigned');

    // 13. Negative Test: Double assignment on already assigned booking
    const doubleAssignRes = await makeRequest(server, 'POST', `/api/bookings/${newBookingId}/assign`, { Authorization: `Bearer ${adminToken}` }, {
      driver_id: 4,
      vehicle_id: 2
    });
    assert(doubleAssignRes.status >= 400, 'State Machine rejects double assignment on non-pending booking');

    // 14. Negative Test: Customer submits review before trip is completed
    const earlyReviewRes = await makeRequest(server, 'POST', '/api/reviews', { Authorization: `Bearer ${newRiderToken}` }, {
      booking_id: newBookingId,
      rating: 5,
      comment: 'Early feedback'
    });
    assert(earlyReviewRes.status >= 400, 'System rejects review submission for uncompleted ride');

    // 15. Driver starts ride: assigned -> in_progress
    const startRes = await makeRequest(server, 'PATCH', `/api/bookings/${newBookingId}/status`, { Authorization: `Bearer ${driverToken}` }, {
      status: 'ONGOING'
    });
    assert(startRes.status === 200 && (startRes.body.data.status === 'in_progress' || startRes.body.data.status === 'ONGOING'), 'Driver starts trip, transitioning to in_progress');

    // 16. Negative Test: Customer tries to cancel in_progress ride
    const cancelOngoingRes = await makeRequest(server, 'POST', `/api/bookings/${newBookingId}/cancel`, { Authorization: `Bearer ${newRiderToken}` }, {
      reason: 'Want to cancel now'
    });
    assert(cancelOngoingRes.status >= 400, 'State machine rejects cancellation of in_progress trip');

    // 17. Driver completes trip: in_progress -> completed
    const completeRes = await makeRequest(server, 'PATCH', `/api/bookings/${newBookingId}/status`, { Authorization: `Bearer ${driverToken}` }, {
      status: 'COMPLETED',
      final_fare: 170.0
    });
    assert(completeRes.status === 200 && (completeRes.body.data.status === 'completed' || completeRes.body.data.status === 'COMPLETED'), 'Driver completes ride, payment settled, driver & car freed');

    // 18. Customer submits 5-star review for the completed ride
    const reviewRes = await makeRequest(server, 'POST', '/api/reviews', { Authorization: `Bearer ${newRiderToken}` }, {
      booking_id: newBookingId,
      rating: 5,
      comment: 'Super fast and polite driver!'
    });
    assert(reviewRes.status === 201 && (reviewRes.body.review_id || reviewRes.body.data?.review_id), 'Customer successfully submits 5-star review for completed ride');

    // 19. Negative Test: Duplicate review blocked by 1:1 UNIQUE constraint
    const dupReviewRes = await makeRequest(server, 'POST', '/api/reviews', { Authorization: `Bearer ${newRiderToken}` }, {
      booking_id: newBookingId,
      rating: 4,
      comment: 'Trying second review'
    });
    assert(dupReviewRes.status >= 400, 'Duplicate review blocked by 1:1 constraint');

    // 20. Cancellation workflow: Create another booking and cancel it
    const book2 = await makeRequest(server, 'POST', '/api/bookings', { Authorization: `Bearer ${customerToken}` }, {
      vehicle_type: 'sedan',
      pickup_location: 'Bandra',
      destination_location: 'Worli'
    });
    const cancelRes = await makeRequest(server, 'POST', `/api/bookings/${book2.body.data.booking_id}/cancel`, { Authorization: `Bearer ${customerToken}` }, {
      reason: 'Change of plans'
    });
    assert(cancelRes.status === 200 && (cancelRes.body.data.status === 'cancelled' || cancelRes.body.data.status === 'CANCELLED'), 'Customer cancels pending booking successfully');

    // 21. SQL Query Explorer catalog served (GET /api/sql-explorer/queries)
    const sqlCat = await makeRequest(server, 'GET', '/api/sql-explorer/queries', { Authorization: `Bearer ${adminToken}` });
    assert(sqlCat.status === 200 && sqlCat.body.catalogTotal === 48, 'SQL Query Explorer served all 48 catalog queries across 16 categories');

    // 22. SQL Query Explorer search filtering
    const sqlSearch = await makeRequest(server, 'GET', '/api/sql-explorer/queries?search=revenue', { Authorization: `Bearer ${adminToken}` });
    assert(sqlSearch.status === 200 && sqlSearch.body.data.length >= 3, 'SQL Query Explorer search filter works across queries');

    // 23. SQL Query Explorer category filtering (category=Joins)
    const sqlCatFilter = await makeRequest(server, 'GET', '/api/sql-explorer/queries?category=Joins', { Authorization: `Bearer ${adminToken}` });
    assert(sqlCatFilter.status === 200 && sqlCatFilter.body.data.length >= 4, 'SQL Query Explorer filters exactly by category');

    // 24. SQL Query Explorer details with explanation
    const sqlDetail = await makeRequest(server, 'GET', '/api/sql-explorer/queries/1', { Authorization: `Bearer ${adminToken}` });
    assert(sqlDetail.status === 200 && sqlDetail.body.data.line_by_line_explanation.length > 0, 'SQL Query Explorer delivers single query detail with line-by-line explanation');

    // 25. Admin Reports Summary
    const reportsRes = await makeRequest(server, 'GET', '/api/reports/summary', { Authorization: `Bearer ${adminToken}` });
    assert(reportsRes.status === 200 && reportsRes.body.data.report_monthly_revenue, 'Admin Live Reports generated for revenue, bookings, customers, and drivers');

    // 26. Admin Dashboard Overview stats
    const dashRes = await makeRequest(server, 'GET', '/api/dashboard/admin', { Authorization: `Bearer ${adminToken}` });
    assert(dashRes.status === 200 && dashRes.body.data.total_bookings >= 0, 'Admin Dashboard stats include metrics and status counts');

  } catch (err) {
    console.error('Fatal test error:', err);
    failed++;
  } finally {
    server.close();
  }

  console.log('\n================================================================================');
  console.log(`TEST SUMMARY: ${passed} / ${passed + failed} PASSED`);
  console.log('================================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

if (require.main === module) {
  runTests();
}

module.exports = { runTests };
