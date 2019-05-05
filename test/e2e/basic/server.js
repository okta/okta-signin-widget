const PORT = process.env.PORT || 3000;

const express = require('express');

const path = require('path');
const ROOT_DIR = path.resolve(__dirname, '..', '..', '..');
const TARGET_DIR = path.resolve(ROOT_DIR, 'target');

var app = express();
app.use(express.static(TARGET_DIR, {
  extensions: ['html']
}));

app.listen(PORT);
