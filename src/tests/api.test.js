const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');

chai.use(chaiHttp);
const expect = chai.expect;

let agentToken = '';
let adminToken = '';
let propertyId = '';

describe('Authentication Tests', () => {
  it('should register a new agent', (done) => {
    chai
      .request(app)
      .post('/api/auth/register')
      .send({
        name: 'John Agent',
        email: 'agent@test.com',
        password: 'password123',
        role: 'agent'
      })
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.have.property('user');
        expect(res.body.user.role).to.equal('agent');
        done();
      });
  });

  it('should register a new admin', (done) => {
    chai
      .request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jane Admin',
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin'
      })
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body.user.role).to.equal('admin');
        done();
      });
  });

  it('should login agent and get token', (done) => {
    chai
      .request(app)
      .post('/api/auth/login')
      .send({
        email: 'agent@test.com',
        password: 'password123'
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('token');
        agentToken = res.body.token;
        done();
      });
  });

  it('should login admin and get token', (done) => {
    chai
      .request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'password123'
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('token');
        adminToken = res.body.token;
        done();
      });
  });

  it('should reject login with wrong password', (done) => {
    chai
      .request(app)
      .post('/api/auth/login')
      .send({
        email: 'agent@test.com',
        password: 'wrongpassword'
      })
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });
});

describe('Property Creation Tests', () => {
  it('agent should create a property', (done) => {
    chai
      .request(app)
      .post('/api/properties')
      .set('Authorization', `Bearer ${agentToken}`)
      .send({
        title: 'Beachfront House',
        description: 'Beautiful house near beach',
        price: 500000,
        location: 'Miami',
        status: 'available'
      })
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body).to.have.property('property');
        expect(res.body.property.title).to.equal('Beachfront House');
        propertyId = res.body.property._id;
        done();
      });
  });

  it('admin should not be able to create a property', (done) => {
    chai
      .request(app)
      .post('/api/properties')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Another House',
        price: 300000,
        location: 'New York'
      })
      .end((err, res) => {
        expect(res).to.have.status(403);
        done();
      });
  });

  it('should get all properties without authentication', (done) => {
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

  it('should get a single property', (done) => {
    chai
      .request(app)
      .get(`/api/properties/${propertyId}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.property.title).to.equal('Beachfront House');
        done();
      });
  });
});

describe('Access Control Tests', () => {
  it('agent should update own property', (done) => {
    chai
      .request(app)
      .put(`/api/properties/${propertyId}`)
      .set('Authorization', `Bearer ${agentToken}`)
      .send({
        price: 550000
      })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.property.price).to.equal(550000);
        done();
      });
  });

  it('endpoint should require authentication for create', (done) => {
    chai
      .request(app)
      .post('/api/properties')
      .send({
        title: 'Test Property',
        price: 100000,
        location: 'Chicago'
      })
      .end((err, res) => {
        expect(res).to.have.status(401);
        done();
      });
  });
});
