let state = { //Keep the state in javascript not in DOM
    img : new Image(),
    ROWS : 4,
    piecesArray : [],
    shuffled : [],
    clickedPiece : null,
    score : 100,
    prevPuzzles: 0,
    highScore: 0,
};

function loadScore(state){
    let scores = [];
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            scores = xmlhttp.responseText.split('\r\n');
            state.highScore = Math.max.apply(Math, scores);
            $('#highscore').text(`Highscore: ${state.highScore}`);
        }
    };
    xmlhttp.open("GET", "backend/score.txt", true);
    xmlhttp.send();
}

function waitGame(){
    $('#fileName').on('change', function() { // Listen for changes on image Input
        startGame(this);
    });
}

function startGame(inputImg){ //After getting the image, start the game.
    state.img.addEventListener('load', splitImage,false); // call function splitImage
                                                               // false-> loads bubbling in the end
    state.img.src = inputImg.files[0].name;

    let imageTypes = ['.gif', '.jpeg', '.jpg', '.png', '.bmp'];
    imageTypes.forEach(function(imageExt){
        if(state.img.src.includes(imageExt))
        $('.uploadform').remove();
    });
}

function splitImage(){ // Split the image into 16 equal parts
    let ctx = $('#js-canvas-dynamic')[0];
    let puzzle = ctx.getContext('2d');

    let pieceWidth = Math.floor(state.img.width / state.ROWS);
    let pieceHeight = Math.floor(state.img.height / state.ROWS);

    ctx.width = pieceWidth;
    ctx.height = pieceHeight;



    for(let j=0; j<state.ROWS; j++){
        for(let i=0; i<state.ROWS; i++){
            let sx = i * pieceWidth;
            let sy = j * pieceHeight;

            //UPDATE STATE
            puzzle.drawImage(this, sx, sy, pieceWidth, pieceHeight, 0, 0, ctx.width, ctx.height);
            state.piecesArray.push(ctx.toDataURL());
            state.shuffled.push(ctx.toDataURL());
            puzzle.clearRect(0,0, ctx.width,ctx.height);
        }
    }
    //Remove Canvas & make a button eventListener
    $(ctx).remove();
    $('.shuffleButton').click(function(){
        clearHTML(state);
        shuffleArray(state);
        createPuzzle(state);
    });
}

function clearHTML(){
    $('.row').empty();
}

function shuffleArray(state){
    let j, temp, i;
    for (i = state.shuffled.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1)); // randomize a number between 0 and 15
        temp = state.shuffled[i];
        state.shuffled[i] = state.shuffled[j];
        state.shuffled[j] = temp;
    }
}

function createPuzzle(state){
    let piecesHTML;
    piecesHTML=[];
    for(let i=0; i < state.piecesArray.length; i++){
        let temp = `<div class="piece-container">
                        <img src="${state.piecesArray[i]}" class="hidden-puzzle-piece">
                        <img src="${state.shuffled[i]}" class="puzzle-piece" onclick="swapPieces(this, state);">
                    </div>`;
        piecesHTML.push(temp);
    }
    renderPuzzle(piecesHTML, state);
    checkPuzzle(state);
}

function renderPuzzle(piecesHTML, state){
    $('.row.one').append(piecesHTML.slice(0,state.ROWS));
    $('.row.two').append(piecesHTML.slice(state.ROWS , state.ROWS*2));
    $('.row.three').append(piecesHTML.slice(state.ROWS*2 , state.ROWS*3));
    $('.row.four').append(piecesHTML.slice(state.ROWS*3 , state.ROWS*4));
}

function swapPieces(e, state){
    if(!state.clickedPiece){
        state.clickedPiece = e;
        $(state.clickedPiece).addClass('clicked-puzzle');
    }else{
        if(e.src === state.clickedPiece.src){
            $(state.clickedPiece).removeClass('clicked-puzzle'); //if the click is on the same image
            state.clickedPiece=null;                             //don't check for validation
            return;
        }
        let temp = e.src;
        e.src = state.clickedPiece.src;
        state.clickedPiece.src = temp;
        $(state.clickedPiece).removeClass('clicked-puzzle');
        state.clickedPiece=null;
        checkPuzzle(state);
    }
}

function checkPuzzle(state){
    let truePuzzles = 0;
    let win = true;

    let gameContainer = $('.game-container .piece-container');
    for(let i=0; i<gameContainer.length; i++){
        if(gameContainer[i].childNodes[1].src === gameContainer[i].childNodes[3].src){ //childnode[1] hidden img
            $(gameContainer[i].childNodes[3]).addClass('true-place');// childnode[3] shuffled piece
            truePuzzles++;
        }else{
            win=false;
            $(gameContainer[i].childNodes[3]).removeClass('true-place');
        }
    }

    if($('.shuffleButton').length===0){
        //SCORING
        if(truePuzzles === state.prevPuzzles){
            state.score -= 6;
        }else if (truePuzzles < state.prevPuzzles){
            state.score -= 6;
        }
        if (state.score <0){
            state.score = 6;
        }

        state.prevPuzzles = truePuzzles;
    }

    if($('.shuffleButton').length && truePuzzles>0){
        $('.shuffleButton').remove();
        $('#shuffleStage').remove();
        state.prevPuzzles = truePuzzles;
    }
    console.log(`${state.score}`);

    if(win){

        $('.true-place').removeClass('true-place');

        saveScore(state);

        $('<iframe id="winGame"></iframe>').appendTo('body');
        alert('YOU WON!\n Score:' + state.score);
    }
}

function saveScore(state){
    let xmlhttp;
    xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function () {
        console.log(xmlhttp.readyState + ' ' + xmlhttp.status);
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            console.log(xmlhttp.responseText);
        }
    };

    let serverURL = 'http://localhost:1696';

    xmlhttp.open("POST", serverURL, true);
    xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xmlhttp.send("score=" + state.score);

}

$(function(){
    loadScore(state);
    waitGame();
});