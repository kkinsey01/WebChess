let gameId = 0;//wait for server to assign
let socket;
let mymove = true; //if the move being executed origionated from input or message from server
let myturn = false; //if we are aloud to initiate a move
let mycolor = "gray"; //wait for server to assign color with first message


fetch('/port')
    .then(response => response.json())
    .then(data => {
        const port = data.port;
        socket = new WebSocket(`ws://localhost:${port}`);
        // Now you can use the WebSocket connection
        socket.onopen = function(e) 
        {
            console.log('connected!!');
        }
        socket.onmessage = (event) =>
        {
            // console.log('Recieved: ', event.data);
            // console.log('Data type: ', typeof event.data);
            if(typeof event.data === 'string')
            {
                try {
                    let timerData = JSON.parse(event.data);
                    if (timerData) {
                        // console.log('In the if');
                        if (timerData.color === 'whiteTimerUpdate') {
                            // console.log('Updating white timer');
                            whiteTimerUpdate(timerData.time);
                        }
                        else {
                            // console.log('Updating black timer');
                            blackTimerUpdate(timerData.time);
                        }
                    }
                }
                catch (err) {
                    console.log('Error parsing JSON', err);
                    //not timer data, must be initial message w/ GID and color
                    const GameidPlusColor = event.data.split(" ");
                    gameId = GameidPlusColor[0];
                    mycolor = GameidPlusColor[1];
                    if(mycolor === "white")
                    {
                        myturn = true;
                    }
                    else{
                        flipBoard();
                    }
                    console.log('gameID: ' + gameId + 'my color: ' + mycolor);

                }  
            }
            else
            {
                mymove = false; //tells methods not to send message
                const reader = new FileReader();

                reader.onload = function() {
                    const jsonString = reader.result;
                    const newMove = JSON.parse(jsonString);
                    console.log(newMove.position);
                    const refSquare = (newMove.position.column + newMove.position.row.toString());
                    console.log(refSquare);
 
                    activePiece = pieces[refSquare];
                    console.log(activePiece);
                    if(newMove.method === 'move')
                    {
                        moveFromMessageHelper(activePiece , newMove.newP)
                    }
                    else if(newMove.method === 'capture')
                    {
                        capture(newMove.newP);
                    }
                }
                reader.readAsText(event.data);
        }
            
            
        }
    });

function flipBoard(){
    //board
    const boardElement = document.getElementById('board');
    const squaresToFlip = Array.from(document.getElementById('board').children);
    console.log(squaresToFlip);
    squaresToFlip.reverse();
    boardElement.innerHTML = '';
    for(let i = 0; i < squaresToFlip.length; i++){
        boardElement.append(squaresToFlip[i]);
    }
    //clocks
    const blackclock = document.getElementById('blackTimerContainer');
    const whiteclock = document.getElementById('whiteTimerContainer');
    blackclock.remove();
    whiteclock.remove();
    document.body.prepend(whiteclock);
    document.body.append(blackclock);


}
    

function blackTimerUpdate(data) {
    document.getElementById('timerBlack').innerHTML = data;
}

function whiteTimerUpdate(data) {
    document.getElementById('timerWhite').innerHTML = data;
}

const chessboard = new Chessboard();

const pieces = {
    "a1": new Rook(chessboard, "white", 1, "a"),
    "b1": new Knight(chessboard, "white", 1, "b"),
    "c1": new Bishop(chessboard, "white", 1, "c"),
    "d1": new King(chessboard, "white", 1, "d"),
    "e1": new Queen(chessboard, "white", 1, "e"),
    "f1": new Bishop(chessboard, "white", 1, "f"),
    "g1": new Knight(chessboard, "white", 1, "g"),
    "h1": new Rook(chessboard, "white", 1, "h"),
    "a2": new Pawn(chessboard, "white", 2, "a"),
    "b2": new Pawn(chessboard, "white", 2, "b"),
    "c2": new Pawn(chessboard, "white", 2, "c"),
    "d2": new Pawn(chessboard, "white", 2, "d"),
    "e2": new Pawn(chessboard, "white", 2, "e"),
    "f2": new Pawn(chessboard, "white", 2, "f"),
    "g2": new Pawn(chessboard, "white", 2, "g"),
    "h2": new Pawn(chessboard, "white", 2, "h"),
    "a7": new Pawn(chessboard, "black", 7, "a"),
    "b7": new Pawn(chessboard, "black", 7, "b"),
    "c7": new Pawn(chessboard, "black", 7, "c"),
    "d7": new Pawn(chessboard, "black", 7, "d"),
    "e7": new Pawn(chessboard, "black", 7, "e"),
    "f7": new Pawn(chessboard, "black", 7, "f"),
    "g7": new Pawn(chessboard, "black", 7, "g"),
    "h7": new Pawn(chessboard, "black", 7, "h"),
    "a8": new Rook(chessboard, "black", 8, "a"),
    "b8": new Knight(chessboard, "black", 8, "b"),
    "c8": new Bishop(chessboard, "black", 8, "c"),
    "d8": new Queen(chessboard, "black", 8, "d"),
    "e8": new King(chessboard, "black", 8, "e"),
    "f8": new Bishop(chessboard, "black", 8, "f"),
    "g8": new Knight(chessboard, "black", 8, "g"),
    "h8": new Rook(chessboard, "black", 8, "h")
}
chessboard.setKing(pieces['d1']);
chessboard.setKing(pieces['e8']);

let activePiece = null;
let whiteTurn = true;
let lastSquare = null;
let color = null;

let moveClassContainer = document.createElement('div');
moveClassContainer.className = "move w-1/4 h-1/4 rounded-full bg-gray-500";

let captureClassContainer = document.createElement('div');
captureClassContainer.className = "capture absolute inset-0 flex justify-center items-center";
let captureClassInnerDiv = document.createElement('div');
captureClassInnerDiv.className = "w-4/5 h-4/5 rounded-full border-8 border-gray-400";
captureClassContainer.appendChild(captureClassInnerDiv);

async function squareClick(event) {
    const square = event.target.closest('.square');
    const squareId = square.id;
    const hasPiece = square.querySelector('.piece') !== null;
    const classes = square.classList;
    var classesArray = Array.from(classes);
    var moves;
    if (activePiece) {
        if(!myturn){       
            console.log("not my turn....cant move");
            activePiece = null;
            return;
        }
        moves = activePiece.getMoves();
        if (hasPiece) 
        {
            for (let move of moves) 
            {
                let moveString = move.column + move.row.toString();
                console.log(moveString);
                if (moveString === squareId) {
                    if (activePiece.getColor() !== pieces[squareId].getColor())
                        await capture(squareId);
                    break;
                }
            }
        }
        console.log(activePiece.getType() + " all moves: ", activePiece.getMoves());
        await movement(activePiece, squareId);
        removeShowMoves();
        // console.log(chessboard.kings);
        if (activePiece.getColor() === 'white')
        {
            if (chessboard.kings.black.isChecked()) 
            {
                alert('Black King is in check!');
            }
        }
        else {
            if (chessboard.kings.white.isChecked())
            {
                alert('White King is in check!');
            }
        }
        if (hasPiece) {
            console.log(pieces);
        }
        activePiece = null;
        classesArray.splice(1, 1);
        classesArray.splice(1, 0, color);
        lastSquare.className = classesArray.join(" ");
        // console.log(square.classList);
    }
    else {
        if (hasPiece) {
            //cant make opposite color active piece, can never move them, so return
            if(pieces[squareId].color !== mycolor || !myturn){
                return;
            }
            activePiece = pieces[squareId];
            if (activePiece && myturn) {
                showMoves(activePiece); //only show moves if my turn
            }
            color = square.classList.item(1);
            var removedClass = classesArray.splice(1, 1);
            classesArray.splice(1, 0, "bg-yellow-200");
            square.className = classesArray.join(" ");
            lastSquare = square;
        }
        else {
            console.log('Square does not have a piece');
            activePiece = null;
        }
    }     
}


async function moveFromMessageHelper(actPiece, sqId){
    activePiece = actPiece;
    squareId = sqId;
    await movement(activePiece, squareId);
    removeShowMoves();
    // console.log(chessboard.kings);
    if (activePiece.getColor() === 'white')
    {
        if (chessboard.kings.black.isChecked()) 
        {
            alert('Black King is in check!');
        }
    }
    else {
        if (chessboard.kings.white.isChecked())
        {
            alert('White King is in check!');
        }
    }
    activePiece = null;
}

async function movement(activePiece, squareId) {
    let column = squareId.charAt(0);
    let row = parseInt(squareId.charAt(1));
    let oldPosition = activePiece.getPosition();
    var updatedPosition;
    if (activePiece.move(row, column)) { 
        updatedPosition = activePiece.getPosition();
        // Check if the piece moved to a new position
        if (!comparePositions(oldPosition, updatedPosition)) {
            // Check if there are obstacles on the path
            const obstacles = checkObstacles(oldPosition, updatedPosition, activePiece);
            if (obstacles.length === 0) {
                console.log('No obstacles');
                if(mymove){
                    let move = new ChessMove('move', null , squareId, oldPosition);
                    let jsonString = JSON.stringify(move);
                    socket.send(jsonString);
                }
                // Move the piece on the board
                updatePieces(oldPosition, squareId);
                movePiece(oldPosition, squareId);
                
            } else {
                console.log(`Move failed due to obstacles.`);
            }
            console.log(chessboard);
            console.log(pieces);
        } else {
            console.log(`Move failed. Positions are equal.`);
        }
        
    }  
}

function updatePieces(oldPosition, newPosition) {
    delete pieces[oldPosition.column + oldPosition.row];
    pieces[newPosition] = activePiece;
    
}


function movePiece(oldPosition, newPosition) {
    
    const fromSquare = document.getElementById(oldPosition.column + oldPosition.row);
    const toSquare = document.getElementById(newPosition);

    if (fromSquare && toSquare) {
        const pieceDiv = fromSquare.querySelector('.piece');
        if (pieceDiv) {
            toSquare.appendChild(pieceDiv);
        }
    }
    if(mymove)//if we made the move --- not a messaged move
    {
        myturn = false; // end our turn after move sent
    }
    else//messeged move --- opponent made move
    {
        myturn = true;//start our turn
        mymove = true;//reset flag ---- mymove set to false when message received
    }
    
}

function comparePositions(pos1, pos2) {
    return pos1.row === pos2.row && pos1.column === pos2.column;
}
function checkObstacles(currentPosition, newPosition, piece) {
    let obstacles = [];

    if (piece.getType() === 'Knight') {
        return obstacles;
    }
    const deltaRow = Math.sign(newPosition.row - currentPosition.row);
    const deltaColumn = Math.sign(newPosition.column.charCodeAt(0) - currentPosition.column.charCodeAt(0));

    for (let row = currentPosition.row + deltaRow, columnCode = currentPosition.column.charCodeAt(0) + deltaColumn;
        row !== newPosition.row || columnCode !== newPosition.column.charCodeAt(0);
        row += deltaRow, columnCode += deltaColumn) {

        const column = String.fromCharCode(columnCode);
        const squareId = column + row;

        if (pieces[squareId]) {
            obstacles.push(squareId);
            break;
        }
    }

    return obstacles;
}

async function capture(newPosition) {
    console.log('capturing!');
    pieces[newPosition] = null;
    const squareDiv = document.getElementById(newPosition);
    const pieceDiv = squareDiv.querySelector('.piece');
    if (pieceDiv) {
        pieceDiv.remove();
    }
    if(mymove)
    {
        let move = new ChessMove('capture', null , newPosition, activePiece.position);
        let jsonString = JSON.stringify(move);
        socket.send(jsonString);
    }
    
}


let alteredDivs = [];
async function showMoves(piece) {
    let moves = piece.getMoves();
    let squareDiv = "";
    let pieceDiv = "";
    let movePosition = {
        row: 0,
        column: 'a'
    };
    for (let move of moves) 
    {
        movePosition = {
            row: move.row,
            column: move.column
        }
        let squareDiv = document.getElementById(movePosition.column + movePosition.row);
        let obstacles = checkObstacles(piece.getPosition(), movePosition, piece);
        if (obstacles.length > 0)
        {
            console.log('Obstacles!');
        }
        else {
            if (squareDiv) {
                alteredDivs.push(squareDiv);
                pieceDiv = squareDiv.querySelector('.piece');
                console.log('square div', squareDiv);
                console.log('piece div', pieceDiv);
                if (pieceDiv) 
                {
                    if (piece.getColor() === 'white')
                    {
                        colorDiv = pieceDiv.querySelector('.black');
                        if (colorDiv) 
                        {
                            console.log('Capture move');
                            squareDiv.appendChild(captureClassContainer.cloneNode(true));
                        }
                    }
                    else {
                        colorDiv = pieceDiv.querySelector('.white');
                        if (colorDiv)
                        {
                            squareDiv.appendChild(captureClassContainer.cloneNode(true));
                        }
                    }
                }
                else {
                    console.log('Show move');
                    squareDiv.appendChild(moveClassContainer.cloneNode(true));
                } 
                pieceDiv = "";
            }
        }
    }
}

async function removeShowMoves() {
    for (let div of alteredDivs)
    {
        const captureDiv = div.querySelector('.capture');
        if (captureDiv) 
        {
            captureDiv.remove();
        }
        const move = div.querySelector('.move');
        if (move) {
            move.remove();
        }
    }
    alteredDivs = [];
}

function addEventListeners() {
    const squares = document.querySelectorAll('.square');
    squares.forEach(square => {
        square.addEventListener('click', squareClick)
    });
}

addEventListeners();



class ChessMove {
    constructor(meth , op , np, pos) {
        this.method = meth;
        this.oldP = op;
        this.newP = np;
        this.position = pos
        };
    }