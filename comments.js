// create web server
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const axios = require('axios');

// use body-parser middleware
app.use(bodyParser.json());

// handle post request
app.post('/events', async (req, res) => {
  const { type, data } = req.body;

  // handle comment moderation
  if (type === 'CommentCreated') {
    const status = data.content.includes('orange') ? 'rejected' : 'approved';

    // emit event
    await axios.post('http://event-bus-srv:4005/events', {
      type: 'CommentModerated',
      data: {
        id: data.id,
        postId: data.postId,
        status,
        content: data.content,
      },
    });
  }
  res.send({});
});

// listen to port 4003
app.listen(4003, () => {
  console.log('Listening on 4003');
});