const chai = require('chai');
const chaiHttp = require('chai-http');

const {Post} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

// this lets us use *should* style syntax in our tests
// so we can do things like `(1 + 1).should.equal(2);`
// http://chaijs.com/api/bdd/
const should = chai.should();

// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);

function seedPostData() {
  console.info('seeding post data');
  const seedData = [];

  for (let i=1; i<=10; i++) {
    seedData.push(generatePostData());
  }
  // this will return a promise
  return Post.insertMany(seedData);
}

function generatePostData() {
  return {
    title: faker.lorem.words,
    content: faker.lorem.sentences,
    author: {firstName:faker.name.firstName(), lastName:faker.name.lastName()},
    created: faker.date.recent
  }
}

function tearDownDb() {
    console.warn('Deleting database');
    return mongoose.connection.dropDatabase();
}

describe('Blog Posts', function() {

  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return seedPostData();
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });

  it('should list blog posts on GET', function() {
    return chai.request(app)
      .get('/posts')
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('array');
        res.body.length.should.be.at.least(1);
        const expectedKeys = ['title', 'content', 'author', 'created'];
        res.body.forEach(function(item) {
          item.should.be.a('object');
          item.should.include.keys(expectedKeys);
        });
      });
  });

  it('should add a blog post on POST', function() {
    const newItemToSend = {
      title: 'my fun post title',
      content: 'some fun content',
      author: {firstName:'fun', lastName:'dowder'},
      created: '02/15/17'
    };
    const newItemToEqual = {
      title: 'my fun post title',
      content: 'some fun content',
      author: 'fun dowder',
      created: '02/15/17'
    };
    return chai.request(app)
      .post('/posts')
      .send(newItemToSend)
      .then(function(res) {
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.include.keys('id', 'title', 'content', 'author', 'created');
        res.body.id.should.not.be.null;
        res.body.should.deep.equal(Object.assign(newItemToEqual, {id: res.body.id}));
      });
  });

  it('should update a blog post on PUT', function() {
    const updateDataToSend = {
      title: 'milkshake',
      content: '200 tbsp cocoa',
      author: {firstName:'coffee', lastName:'mcmilkshake'},
      created: '02/15/17'
    };
    const updateDataToEqual = {
      title: 'milkshake',
      content: '200 tbsp cocoa',
      author: 'coffee mcmilkshake',
      created: '02/15/17'
    };

    return chai.request(app)
      .get('/posts')
      .then(function(res) {
        updateDataToSend.id = res.body[0].id;
        return chai.request(app)
          .put(`/posts/${updateDataToSend.id}`)
          .send(updateDataToSend);
      })
      .then(function(res) {
        res.should.have.status(204);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.deep.equal(updateDataToEqual);
      });
  });

  it('should delete a blog post on DELETE', function() {
    return chai.request(app)
      .get('/posts')
      .then(function(res) {
        return chai.request(app)
          .delete(`/posts/${res.body[0].id}`);
      })
      .then(function(res) {
        res.should.have.status(204);
      });
  });
});