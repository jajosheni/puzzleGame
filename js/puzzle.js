let state = { //Keep the state in javascript not in DOM
    img : new Image(),
    ROWS : 4,
    piecesArray : [],
    shuffled : [],
    clickedPiece : null,
    score : 0,
    highScore: 0,
    truePuzzles: 0,
    minMoves: 0,
    points: 0.0,
};

function loadScore(state){
    let scores = [];
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            scores = xmlhttp.responseText.split('\r\n');
            state.highScore = Math.max.apply(Math, scores);
            $('#highscore').text(`Highscore: ${state.highScore}`);
            scores.forEach(function(s){
                if(s==='')
                    return;
                $('#js-score').append(
                    `<span class="button-text leftScore" >${s}</span>`
                );
            });
        }
    };
    xmlhttp.open("GET", "score.txt", true);
    xmlhttp.send();
}

function waitGame(){
    $('#fileName').on('change', function() { // Listen for changes on image Input
        if (this.files && this.files[0]) {
            let reader = new FileReader();
            reader.onload = startGame;
            reader.readAsDataURL(this.files[0]);
        }
    });
}

function startGame(inputImg){ //After getting the image, start the game.
    state.img.addEventListener('load', splitImage,false); // call function splitImage
                                                               // false-> loads bubbling in the end
    state.img.src = inputImg.target.result;

    if(state.img.src.includes('data:image'))
        $('#uploadform').remove();
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
    $('#shuffle').on('click touch', function(){
        clearHTML(state);
        shuffleArray(state);
        createPuzzle(state);
    });
}

function clearHTML(){
    $('.row').empty();
}

function shuffleArray(state){
    $('#js-score').remove();
    $('#currentScore').removeClass('hidden');
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
        let temp = `<div class="piece-container" onclick="swapPieces(this, state);">
                        <img src="${state.piecesArray[i]}" class="hidden-puzzle-piece">
                        <img src="${state.shuffled[i]}" class="puzzle-piece">
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

function checkPuzzle(state){
    let tPuzzles = 0;
    let win = true;

    let gameContainer = $('.game-container .piece-container');
    for(let i=0; i<gameContainer.length; i++){
        if(gameContainer[i].childNodes[1].src === gameContainer[i].childNodes[3].src){ //childnode[1] hidden img
            $(gameContainer[i].childNodes[3]).addClass('true-place');// childnode[3] shuffled piece
            tPuzzles++;
        }else{
            win=false;
            $(gameContainer[i].childNodes[3]).removeClass('true-place');
        }
    }

    if($('#shuffle').length && tPuzzles>0){
        $('#shuffle').remove();
        $('#shuffleStage').remove();
        state.truePuzzles = tPuzzles;
        state.minMoves = state.ROWS**2 - state.truePuzzles;
        state.points = 100.0/state.minMoves;
    }

    if(win){
        gameWon(state);
    }
}

function gameWon(state){
    $('.true-place').removeClass('true-place');

    saveScore(state);

    $('<iframe id="winGame" class="iframes"></iframe>').appendTo('body');
    alert('YOU WON!\n Score:' + Math.floor(state.score));
}

function swapPieces(e, state){
    if(!state.clickedPiece){
        state.clickedPiece = e;
        $(state.clickedPiece.lastElementChild).addClass('clicked-puzzle');
    }else{
        if(e.lastElementChild.src === state.clickedPiece.lastElementChild.src){
            $(state.clickedPiece.lastElementChild).removeClass('clicked-puzzle');
            state.clickedPiece=null; //if the click is on the same image don't check for validation
            return;
        }

        let temp = e.lastElementChild.src;
        e.lastElementChild.src = state.clickedPiece.lastElementChild.src; //swap puzzle pieces
        state.clickedPiece.lastElementChild.src = temp;

        let rightMove = checkPieces(state.clickedPiece, e);

        $(state.clickedPiece.lastElementChild).removeClass('clicked-puzzle');
        state.clickedPiece=null;

        fireScore(state, rightMove);
    }
}

function checkPieces(firstPiece, secondPiece){
    let rightMove=0;
    if(firstPiece.firstElementChild.src === firstPiece.lastElementChild.src){
        $(firstPiece.lastElementChild).addClass('true-place');
        rightMove++;
    }else{
        $(firstPiece.lastElementChild).removeClass('true-place');
    }

    if(secondPiece.firstElementChild.src === secondPiece.lastElementChild.src){
        $(secondPiece.lastElementChild).addClass('true-place');
        rightMove++;
    }else{
        $(secondPiece.lastElementChild).removeClass('true-place');
    }

    return rightMove;
}

function fireScore(state, rightMove){
    if(rightMove===0){
        state.minMoves++;
        state.points=100/state.minMoves;
        reducePoints(state);
    }else if(rightMove===1){
        state.score += state.points;
    }else if(rightMove===2){
        state.score += (state.points * 2);
        glowScore();
    }

    $('#currentScore').text(`Score: ${Math.floor(state.score)}`);
    checkPuzzle(state);
}

function glowScore(){
    setTimeout(function(){
        $('#currentScore').addClass('js-animation');
    },800);
    $('#currentScore').removeClass('js-animation');
}

function reducePoints(state){
    if(state.score < 1){
        return;
    }else if(state.score < 15){
        state.score -= 1;
    }else if(state.score < 35){
        state.score -= 4;
    }else if(state.score < 60){
        state.score -= 7;
    }else if(state.score < 90) {
        state.score -= 9;
    }
}

function saveScore(state){
    let xmlhttp;
    xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            console.log(xmlhttp.responseText);
        }
    };

    let serverURL = 'http://localhost:80';

    xmlhttp.open("POST", serverURL, true);
    xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xmlhttp.send("score=" + Math.floor(state.score));

}

$(function(){
    loadScore(state);
    waitGame();
});