const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const moongoose = require('mongoose');

const postsRoutes = require('./routes/posts');
const userRoutes = require('./routes/user');
const markerRoutes = require('./routes/marker');

const app = express();

moongoose.connect(`mongodb+srv://yanolsh:${process.env.MONGO_ATLAS_PW}@cluster0-5h4nx.mongodb.net/node-angular?retryWrites=true&w=majority`)
  .then(() => {
    console.log('Connected to database')
  })
  .catch(() => {
    console.log('Connection failed');
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:false }));
app.use('/images', express.static(path.join('backend/images')));

app.use((req, res, next)=>{
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-Width, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  next();
});

app.use('/api/posts', postsRoutes);
app.use('/api/user', userRoutes);
app.use('/api/markers', markerRoutes)
module.exports = app;
