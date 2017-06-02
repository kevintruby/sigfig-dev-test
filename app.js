const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');

// defined API routes/handlers
const api = require('./routes/api');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'static')));
app.use('/api', api);

// redirect all non-API traffic to the /static dir
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'static/index.html'));
});

const port = process.env.PORT || 3000;
app.set('port', port);

const server = http.createServer(app);

server.listen(port, () => console.log(`API running on localhost:${port}`));