const express = require('express');
const app = express();

app.use('/auth', require('./auth'));

app.use(require('./users'));
app.use(require('./events'));
app.use(require('./grades'));
app.use(require('./units'));
app.use(require('./exceptions'));
app.use(require('./classes'));
app.use(require('./files'));
app.use(require('./establishments'));
app.use(require('./surveys'));
app.use(require('./topics'));
app.use(require('./404'));

module.exports = app;
