const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors');
const path = require('path');

const app = express();
const port = 80;

app.options('*', cors());
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname + '/css')));
app.use(express.static(path.join(__dirname + '/js')));
app.use(express.static(path.join(__dirname + '/score')));

app.post('/', function(request, response) {
    console.log(request.body);
    response.send('Score Saved!');

    const fs = require('fs');

    let stream = fs.createWriteStream(path.join(__dirname + "/score/score.txt"), {flags:'a'});
    stream.write(`${request.body.score}` + "\r\n");
    stream.end();
});

app.get('/', function(request, response) {
    response.sendFile(path.join(__dirname + '/index.html'));
});

app.listen(port, () => console.log(`Puzzle running on port ${port}!`));