const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const {Post} = require('./models');

router.get('/', (req, res) => {
  Post.find().exec().then(posts =>{
    res.json({
      posts: posts.map((post) => post.apiRepr())
    });
  }).catch(err => {
    console.error(err);
    res.status(500).json({message: 'Internal server error'});
  });
});

router.get('/:id', (req, res) => {
  Post.findById(req.params.id).exec().then(posts =>{
    res.json(post => post.apiRepr());
  }).catch(err => {
    console.error(err);
    res.status(500).json({message: 'Internal server error'});
  });
});

router.post('/', jsonParser, (req, res) => {
  const requiredFields = ['title', 'content', 'author'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }
  if (!(req.body.author.firstName && req.body.author.lastName)) {
    const message = `Missing author first and last name in request body`
    console.error(message);
    return res.status(400).send(message);
  }
  //title, content, author, created
  Post.create({
    title: req.body.title, 
    content: req.body.content, 
    author: req.body.author, 
    created: req.body.created
  }).then(
    post => res.status(201).json(post.apiRepr())
  ).catch(err => {
    console.error(err);
    res.status(500).json({message: 'Internal server error'});
  });
});

router.put('/:id', jsonParser, (req, res) => {
  const requiredFields = ['title', 'content', 'author', 'id'];
  for (let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }
  if (!(req.body.author.firstName && req.body.author.lastName)) {
    const message = `Missing author first and last name in request body`
    console.error(message);
    return res.status(400).send(message);
  }
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = (
      `Request path id (${req.params.id}) and request body id `
      `(${req.body.id}) must match`);
    console.error(message);
    return res.status(400).send(message);
  }
  console.log(`Updating blog post \`${req.params.id}\``);
  Post.findByIdAndUpdate(req.params.id, {$set: {
    id: req.params.id,
    title: req.body.title,
    content: req.body.content,
    author: req.body.author,
    created: req.body.created
  }}).exec().then(
    post => res.status(204).json(post)
  ).catch(err => {
    console.error(err);
    res.status(500).json({message: 'Internal server error'});
  });
});

router.delete('/:id', (req, res) => {
  Post.findByIdAndUpdate(req.params.id).exec().then(post => {
    console.log(`Deleted blog post \`${req.params.ID}\``);
    res.status(204).end();
  }).catch(err => {
    console.error(err);
    res.status(500).json({message: 'Internal server error'});
  });
});

// catch-all endpoint if client makes request to non-existent endpoint
app.use('*', function(req, res) {
  res.status(404).json({message: 'Not Found'});
});


module.exports = router;