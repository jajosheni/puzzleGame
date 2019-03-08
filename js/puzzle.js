let state = { //Keep the state in javascript not in DOM
    img : new Image(),
    ROWS : 4,
    piecesArray : [],
    shuffled : [],
    clickedPiece : null,
};

function startGame(inputImg){ //After getting the image, start the game.
    state.img.addEventListener('load', splitImage,false); // call function splitImage
                                                               // false-> loads bubbling in the end
    state.img.src = inputImg.files[0].name;
    $('.uploadform').remove();
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
    checkPuzzle();
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
        let temp = e.src;
        e.src = state.clickedPiece.src;
        state.clickedPiece.src = temp;
        $(state.clickedPiece).removeClass('clicked-puzzle');
        state.clickedPiece=null;
        checkPuzzle(state);
    }
}

function checkPuzzle(state){
    let win = true;
    let shuffle=false;
    let gameContainer = $('.game-container .piece-container');
    for(let i=0; i<gameContainer.length; i++){
        if(gameContainer[i].childNodes[1].src === gameContainer[i].childNodes[3].src){
            $(gameContainer[i].childNodes[3]).addClass('true-place');
            shuffle=true;
        }else{
            win=false;
            $(gameContainer[i].childNodes[3]).removeClass('true-place');
        }
    }
    if(shuffle){
        $('.shuffleButton').remove();
    }

    if(win){
        alert('YOU WON');
        $('.true-place').removeClass('true-place');
    }
}

function waitGame(){
    $('#fileName').on('change', function() { // Listen for changes on image Input
        startGame(this);
    });
}

$(waitGame);