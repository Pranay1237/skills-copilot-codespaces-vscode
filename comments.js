// create web server
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { randomBytes } = require('crypto')
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const commentsByPostId = {};

// get comments by post id
app.get('/posts/:id/comments', (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});

// create comment by post id
app.post('/posts/:id/comments', async (req, res) => {
  const commentId = randomBytes(4).toString('hex');
  const { content } = req.body;

  // get comments by post id
  const comments = commentsByPostId[req.params.id] || [];

  // push new comment to comments array
  comments.push({ id: commentId, content, status: 'pending' });

  // set comments by post id
  commentsByPostId[req.params.id] = comments;

  // emit event to event bus
  await axios.post('http://event-bus-srv:4005/events', {
    type: 'CommentCreated',
    data: { id: commentId, content, postId: req.params.id, status: 'pending' }
  });

  res.status(201).send(comments);
});

// handle event from event bus
app.post('/events', async (req, res) => {
  console.log('Event Received:', req.body.type);

  const { type, data } = req.body;

  // handle event
  if (type === 'CommentModerated') {
    const { id, postId, status, content } = data;

    // get comments by post id
    const comments = commentsByPostId[postId];

    // find comment by id
    const comment = comments.find(comment => comment.id === id);

    // set status
    comment.status = status;

    // emit event to event bus
    await axios.post('http://event-bus-srv:4005/events', {
      type: 'CommentUpdated',
      data: { id, postId, status, content }
    });
  }

  res.send({});
});

// listen port
app.listen(4001, () => {
  console.log('Listening on 4001');
});