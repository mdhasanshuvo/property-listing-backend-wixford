const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const User = require('../models/User');
const Property = require('../models/Property');
const { connectDB } = require('../config/db');

const expect = chai.expect;
chai.use(chaiHttp);

let agentToken;
let adminToken;
let agentUserId;
let propertyId;

describe('Property Listing API', () => {
  before(async () => {
    // Connect to database
    try {
      await connectDB();
    } catch (error) {
      console.log('Database already connected or connection failed');
    }

    // Clear collections
    await User.deleteMany({});
    await Property.deleteMany({});
  });

  describe('Auth Routes', () => {
    it('should register a new agent', (done) => {
      chai
        .request(app)
        .post('/api/auth/register')
        .send({
          name: 'John Agent',
          email: 'agent@example.com',
          password: 'password123',
          role: 'agent'
        })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('message');
          expect(res.body.user).to.have.property('email');
          agentUserId = res.body.user._id;
          done();
        });
    });

    it('should register a new admin', (done) => {
      chai
        .request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Admin',
          email: 'admin@example.com',
          password: 'password123',
          role: 'admin'
        })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('message');
          done();
        });
    });

    it('should not register duplicate email', (done) => {
      chai
        .request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate User',
          email: 'agent@example.com',
          password: 'password123',
          role: 'agent'
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('error');
          done();
        });
    });

    it('should login agent and return token', (done) => {
      chai
        .request(app)
        .post('/api/auth/login')
        .send({
          email: 'agent@example.com',
          password: 'password123'
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('token');
          agentToken = res.body.token;
          done();
        });
    });

    it('should login admin and return token', (done) => {
      chai
        .request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'password123'
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('token');
          adminToken = res.body.token;
          done();
        });
    });

    it('should not login with invalid password', (done) => {
      chai
        .request(app)
        .post('/api/auth/login')
        .send({
          email: 'agent@example.com',
          password: 'wrongpassword'
        })
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.have.property('error');
          done();
        });
    });
  });

  describe('Property Routes', () => {
    it('agent should create a property', (done) => {
      chai
        .request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${agentToken}`)
        .send({
          title: 'Beautiful House',
          description: 'A nice house in the city',
          price: 500000,
          location: 'New York',
          status: 'available'
        })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('message');
          expect(res.body.property).to.have.property('_id');
          propertyId = res.body.property._id;
          done();
        });
    });

    it('admin should not be able to create property', (done) => {
      chai
        .request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Admin Property',
          price: 100000,
          location: 'Boston'
        })
        .end((err, res) => {
          expect(res).to.have.status(403);
          expect(res.body).to.have.property('error');
          done();
        });
    });

    it('should get all properties without auth', (done) => {
      chai
        .request(app)
        .get('/api/properties')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('properties');
          expect(res.body).to.have.property('pagination');
          done();
        });
    });

    it('should filter properties by status', (done) => {
      chai
        .request(app)
        .get('/api/properties?status=available')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('properties');
          done();
        });
    });

    it('should search properties by title', (done) => {
      chai
        .request(app)
        .get('/api/properties?search=Beautiful')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('properties');
          done();
        });
    });

    it('should paginate properties', (done) => {
      chai
        .request(app)
        .get('/api/properties?page=1&limit=5')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.pagination).to.have.property('page');
          expect(res.body.pagination).to.have.property('limit');
          done();
        });
    });

    it('should get single property by id', (done) => {
      chai
        .request(app)
        .get(`/api/properties/${propertyId}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('property');
          done();
        });
    });

    it('agent should update own property', (done) => {
      chai
        .request(app)
        .put(`/api/properties/${propertyId}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .send({
          title: 'Updated House',
          price: 550000
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('message');
          done();
        });
    });

    it('agent should not update others property', (done) => {
      // Create another agent
      chai
        .request(app)
        .post('/api/auth/register')
        .send({
          name: 'Other Agent',
          email: 'other@example.com',
          password: 'password123',
          role: 'agent'
        })
        .end((err, res) => {
          const otherAgentEmail = res.body.user.email;

          // Login as other agent
          chai
            .request(app)
            .post('/api/auth/login')
            .send({
              email: otherAgentEmail,
              password: 'password123'
            })
            .end((err, res) => {
              const otherAgentToken = res.body.token;

              // Try to update agent's property
              chai
                .request(app)
                .put(`/api/properties/${propertyId}`)
                .set('Authorization', `Bearer ${otherAgentToken}`)
                .send({
                  title: 'Hacked House'
                })
                .end((err, res) => {
                  expect(res).to.have.status(403);
                  expect(res.body).to.have.property('error');
                  done();
                });
            });
        });
    });

    it('agent should soft delete own property', (done) => {
      chai
        .request(app)
        .delete(`/api/properties/${propertyId}`)
        .set('Authorization', `Bearer ${agentToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('message');
          done();
        });
    });

    it('admin should hard delete any property', (done) => {
      // Create a property first
      chai
        .request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${agentToken}`)
        .send({
          title: 'Property to be deleted by admin',
          price: 300000,
          location: 'Chicago'
        })
        .end((err, res) => {
          const adminDeletePropertyId = res.body.property._id;

          // Admin deletes it
          chai
            .request(app)
            .delete(`/api/properties/admin/${adminDeletePropertyId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .end((err, res) => {
              expect(res).to.have.status(200);
              expect(res.body).to.have.property('message');
              done();
            });
        });
    });
  });

  after(async () => {
    // Clean up
    await User.deleteMany({});
    await Property.deleteMany({});
  });
});
