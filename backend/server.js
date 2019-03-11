const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors');
const path = require('path');

const app = express();
const port = 1696;

app.options('*', cors());
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(__dirname));

app.post('/', function(request, response) {
    console.log(request.body);
    response.send('Score Saved!');

    const fs = require('fs');

    let stream = fs.createWriteStream(path.join(__dirname + "/score.txt"), {flags:'a'});
    stream.write(`${request.body.score}` + "\r\n");
    stream.end();
});

app.get('/', function(request, response) {
    console.log(__dirname);
    response.sendFile(path.join(__dirname + '/index.html'));
});

app.listen(port, () => console.log(`App listening on port ${port}!`));