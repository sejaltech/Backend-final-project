const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let app;

// Setup in-memory MongoDB before running tests
async function setup() {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_super_secret_jwt_key_12345';
  process.env.JWT_EXPIRES_IN = '1d';

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  app = require('../src/app');
}

async function teardown() {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
}

async function runAllTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING COMPREHENSIVE BACKEND VERIFICATION SUITE');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  async function assertTest(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
      if (err.response && err.response.body) {
        console.error(`     Response Body:`, JSON.stringify(err.response.body, null, 2));
      }
      failed++;
    }
  }

  await setup();

  try {
    let student1Token, student1Id;
    let student2Token, student2Id;
    let student3Token, student3Id;
    let ride1Id, ride2Id;
    let requestId1;

    // 1. Student 1 Registration
    await assertTest('1. Student 1 Registration (POST /api/auth/register)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Rahul Sharma',
          email: 'rahul@college.edu',
          password: 'Password123',
          phone: '+91 9876543210'
        })
        .expect(201);

      if (!res.body.success || !res.body.data.token) {
        throw new Error('Expected successful registration with JWT token');
      }
      student1Token = res.body.data.token;
      student1Id = res.body.data.student._id;
    });

    // 2. Duplicate Email Registration Prevention
    await assertTest('2. Duplicate Email Registration Prevention (409 Conflict)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Rahul Duplicate',
          email: 'rahul@college.edu',
          password: 'Password123',
          phone: '+91 9876543210'
        })
        .expect(409);

      if (res.body.success !== false) {
        throw new Error('Expected 409 Conflict on duplicate email');
      }
    });

    // 3. Student 2 Registration & Login
    await assertTest('3. Student 2 Registration & Login (POST /api/auth/login)', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Pooja Verma',
          email: 'pooja@college.edu',
          password: 'Password456',
          phone: '+91 9876500000'
        })
        .expect(201);

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'pooja@college.edu',
          password: 'Password456'
        })
        .expect(200);

      if (!loginRes.body.success || !loginRes.body.data.token) {
        throw new Error('Expected successful login with JWT token');
      }
      student2Token = loginRes.body.data.token;
      student2Id = loginRes.body.data.student._id;
    });

    // 4. Student 3 Registration
    await assertTest('4. Student 3 Registration', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Amit Patel',
          email: 'amit@college.edu',
          password: 'Password789',
          phone: '+91 9876511111'
        })
        .expect(201);

      student3Token = res.body.data.token;
      student3Id = res.body.data.student._id;
    });

    // 5. Invalid Login Credentials
    await assertTest('5. Invalid Login Credentials (401 Unauthorized)', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'rahul@college.edu',
          password: 'WrongPassword'
        })
        .expect(401);
    });

    // 6. Create Ride by Student 1 (Driver)
    await assertTest('6. Create Ride 1 with seatLimit=1 (POST /api/rides)', async () => {
      const res = await request(app)
        .post('/api/rides')
        .set('Authorization', `Bearer ${student1Token}`)
        .send({
          route: 'Kharghar Station to Campus Gate 1',
          departureTime: new Date(Date.now() + 3600000).toISOString(),
          seatLimit: 1
        })
        .expect(201);

      if (!res.body.success || res.body.data.seatsFilled !== 0 || res.body.data.seatLimit !== 1) {
        throw new Error('Expected ride created with seatsFilled=0 and seatLimit=1');
      }
      ride1Id = res.body.data._id;
    });

    // 7. Create Ride 2 by Student 1 (Multi-seat ride)
    await assertTest('7. Create Ride 2 with seatLimit=3 (POST /api/rides)', async () => {
      const res = await request(app)
        .post('/api/rides')
        .set('Authorization', `Bearer ${student1Token}`)
        .send({
          route: 'Vashi Plaza to Campus Gate 2',
          departureTime: new Date(Date.now() + 7200000).toISOString(),
          seatLimit: 3
        })
        .expect(201);

      ride2Id = res.body.data._id;
    });

    // 8. Get All Rides & Filter by Route
    await assertTest('8. Get All Rides with Route Filtering (GET /api/rides?route=Kharghar)', async () => {
      const res = await request(app)
        .get('/api/rides?route=Kharghar')
        .expect(200);

      if (res.body.count !== 1 || !res.body.data[0].route.includes('Kharghar')) {
        throw new Error('Expected 1 ride matching route Kharghar');
      }
      if (!res.body.data[0].driver.name) {
        throw new Error('Expected populated driver details');
      }
    });

    // 9. Get Single Ride by ID
    await assertTest('9. Get Single Ride by ID (GET /api/rides/:id)', async () => {
      const res = await request(app)
        .get(`/api/rides/${ride1Id}`)
        .expect(200);

      if (res.body.data._id !== ride1Id) {
        throw new Error('Expected retrieved ride ID to match');
      }
    });

    // 10. Update Own Ride (Driver 1 updates Ride 2 route)
    await assertTest('10. Update Own Ride (PUT /api/rides/:id by Driver)', async () => {
      const res = await request(app)
        .put(`/api/rides/${ride2Id}`)
        .set('Authorization', `Bearer ${student1Token}`)
        .send({
          route: 'Vashi Highway to Campus Gate 2 (Updated)'
        })
        .expect(200);

      if (!res.body.data.route.includes('(Updated)')) {
        throw new Error('Expected ride route to be updated');
      }
    });

    // 11. Unauthorized Ride Update (Student 2 tries to update Student 1's ride -> 403 Forbidden)
    await assertTest('11. Unauthorized Ride Update Protection (403 Forbidden)', async () => {
      const res = await request(app)
        .put(`/api/rides/${ride2Id}`)
        .set('Authorization', `Bearer ${student2Token}`)
        .send({
          route: 'Hacked Route'
        })
        .expect(403);

      if (res.body.success !== false) {
        throw new Error('Expected 403 Forbidden for non-owner');
      }
    });

    // 12. Driver cannot join their own ride
    await assertTest('12. Driver Cannot Join Own Ride (400 Bad Request)', async () => {
      const res = await request(app)
        .post(`/api/rides/${ride1Id}/join`)
        .set('Authorization', `Bearer ${student1Token}`)
        .expect(400);

      if (res.body.success !== false) {
        throw new Error('Expected 400 Bad Request when driver joins own ride');
      }
    });

    // 13. Student 2 Joins Ride 1 (Seat capacity = 1, seatsFilled becomes 1)
    await assertTest('13. Student 2 Joins Ride 1 (POST /api/rides/:id/join -> ACCEPTED & seatsFilled=1)', async () => {
      const res = await request(app)
        .post(`/api/rides/${ride1Id}/join`)
        .set('Authorization', `Bearer ${student2Token}`)
        .expect(201);

      if (!res.body.success || res.body.data.request.status !== 'ACCEPTED') {
        throw new Error('Expected request status ACCEPTED');
      }
      if (res.body.data.ride.seatsFilled !== 1) {
        throw new Error('Expected seatsFilled to increment to 1');
      }
      requestId1 = res.body.data.request._id;
    });

    // 14. Duplicate Join Request Prevention
    await assertTest('14. Duplicate Join Request Prevention (409 Conflict)', async () => {
      const res = await request(app)
        .post(`/api/rides/${ride1Id}/join`)
        .set('Authorization', `Bearer ${student2Token}`)
        .expect(409);

      if (res.body.success !== false) {
        throw new Error('Expected 409 Conflict when student tries duplicate join');
      }
    });

    // 15. Full Ride Rejection (Student 3 tries to join full Ride 1 -> 400 Bad Request)
    await assertTest('15. Full Ride Rejection (400 Bad Request: Ride is already full)', async () => {
      const res = await request(app)
        .post(`/api/rides/${ride1Id}/join`)
        .set('Authorization', `Bearer ${student3Token}`)
        .expect(400);

      if (!res.body.message.toLowerCase().includes('full')) {
        throw new Error(`Expected message about full ride, got: ${res.body.message}`);
      }
    });

    // 16. Get Ride Requests by Driver
    await assertTest('16. Get Ride Requests by Driver (GET /api/rides/:id/requests)', async () => {
      const res = await request(app)
        .get(`/api/rides/${ride1Id}/requests`)
        .set('Authorization', `Bearer ${student1Token}`)
        .expect(200);

      if (res.body.count !== 1 || res.body.data[0].student.email !== 'pooja@college.edu') {
        throw new Error('Expected 1 request with student details populated');
      }
    });

    // 17. Non-driver cannot view ride requests (403 Forbidden)
    await assertTest('17. Non-driver Cannot View Requests (403 Forbidden)', async () => {
      await request(app)
        .get(`/api/rides/${ride1Id}/requests`)
        .set('Authorization', `Bearer ${student2Token}`)
        .expect(403);
    });

    // 18. Driver Rejects Previously Accepted Request -> Frees up seat (seatsFilled becomes 0)
    await assertTest('18. Driver Rejects Request -> Frees Seat (PATCH .../requests/:requestId)', async () => {
      const res = await request(app)
        .patch(`/api/rides/${ride1Id}/requests/${requestId1}`)
        .set('Authorization', `Bearer ${student1Token}`)
        .send({ status: 'REJECTED' })
        .expect(200);

      if (res.body.data.request.status !== 'REJECTED') {
        throw new Error('Expected status REJECTED');
      }
      if (res.body.data.rideSeats.seatsFilled !== 0) {
        throw new Error(`Expected seatsFilled to decrement to 0, got: ${res.body.data.rideSeats.seatsFilled}`);
      }
    });

    // 19. Student 3 can now join since seat was freed up
    await assertTest('19. Student 3 Joins after Seat Freed (POST /api/rides/:id/join)', async () => {
      const res = await request(app)
        .post(`/api/rides/${ride1Id}/join`)
        .set('Authorization', `Bearer ${student3Token}`)
        .expect(201);

      if (res.body.data.ride.seatsFilled !== 1) {
        throw new Error('Expected seatsFilled to become 1 again');
      }
    });

    // 20. Cancel Ride by Driver (DELETE /api/rides/:id -> CANCELLED status)
    await assertTest('20. Cancel Ride (DELETE /api/rides/:id -> marks CANCELLED)', async () => {
      const res = await request(app)
        .delete(`/api/rides/${ride2Id}`)
        .set('Authorization', `Bearer ${student1Token}`)
        .expect(200);

      if (res.body.data.status !== 'CANCELLED') {
        throw new Error('Expected ride status to be CANCELLED');
      }
    });

    // 21. Non-driver cannot cancel ride (403 Forbidden)
    await assertTest('21. Non-driver Cannot Cancel Ride (403 Forbidden)', async () => {
      await request(app)
        .delete(`/api/rides/${ride1Id}`)
        .set('Authorization', `Bearer ${student3Token}`)
        .expect(403);
    });

    // 22. Unauthenticated request rejected (401 Unauthorized)
    await assertTest('22. Unauthenticated Request Protection (401 Unauthorized)', async () => {
      await request(app)
        .post('/api/rides')
        .send({
          route: 'Test Route',
          departureTime: new Date().toISOString(),
          seatLimit: 2
        })
        .expect(401);
    });

  } finally {
    await teardown();
  }

  console.log('\n======================================================');
  console.log(`🎉 TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests();
