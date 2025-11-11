const express = require('express');
const path = require('path');
const app = express();
require('dotenv').config();
app.use(express.urlencoded({extended : true}));
app.use(express.json({ limit : "10mb" }));
const mongoose = require('mongoose');

app.use('/static', express.static(path.join(__dirname, 'img')));
app.use(express.static(path.join(__dirname, 'public')));

//Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
})


// route 
app.use('/api/photos', require('./routes/photoroute.js'))

// static file paths
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
})
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
})
app.get('/layout', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'layout.html'));
})
app.get('/demo', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'demo.html'));
})

if (process.env.VERCEL) {
  module.exports = app;
} else {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

