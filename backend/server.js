const express = require('express');
const bodyParser = require("body-parser");
const cors = require('cors');

const app = express();
const port = 1696;

app.options('*', cors());
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/', function(request, response) {
    console.log(request.body);
    response.send('Score Saved!');

    const fs = require('fs');

    let stream = fs.createWriteStream("puzzleGame/backend/score.txt", {flags:'a'});
    stream.write(`${request.body.score}` + "\r\n");
    stream.end();
});

app.listen(port, () => console.log(`App listening on port ${port}!`));