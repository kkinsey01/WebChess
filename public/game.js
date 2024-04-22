let gameId = 0;
let socket;
let mymove = true;
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
            console.log(event.data);
            if(typeof event.data === 'string')
            {
                gameId = event.data;
                console.log('gameID: ' + gameId);
            }
            else
            {
                mymove = false;
                const reader = new FileReader();

                reader.onload = function() {
                    const jsonString = reader.result;
                    const newMove = JSON.parse(jsonString);
                    if(newMove.method === 'update')
                    {
                        updatePieces(newMove.oldP , newMove.newP);
                    }
                    else if(newMove.method === 'move')
                    {
                        movePiece(newMove.oldP , newMove.newP);
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
        moves = activePiece.getMoves();
        if (hasPiece) 
        {
            if (activePiece.getColor() === pieces[squareId].getColor()) // MAYBE COME BACK TO THIS
            {
                activePiece = pieces[squareId];
            }
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
        console.log(chessboard.kings);
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
        console.log(square.classList);
    }
    else {
        if (hasPiece) {
            activePiece = pieces[squareId];
            showMoves(activePiece);
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
        activePiece = null;
    }
}

function updatePieces(oldPosition, newPosition) {
    delete pieces[oldPosition.column + oldPosition.row];
    pieces[newPosition] = activePiece;
    if(mymove)
    {
        let move = new ChessMove('update', oldPosition , newPosition);
        let jsonString = JSON.stringify(move);
        socket.send(jsonString);
    }
    
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
    if(mymove)
    {
        let move = new ChessMove('move', oldPosition , newPosition);
        let jsonString = JSON.stringify(move);
        socket.send(jsonString);
    }
    else
    {
        mymove = true;
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
    delete pieces[newPosition];
    const squareDiv = document.getElementById(newPosition);
    const pieceDiv = squareDiv.querySelector('.piece');
    if (pieceDiv) {
        pieceDiv.remove();
    }
    if(mymove)
    {
        let move = new ChessMove('capture', null , newPosition);
        let jsonString = JSON.stringify(move);
        socket.send(jsonString);
    }
    else{
        mymove = true;
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
    constructor(meth , op , np) {
        this.method = meth;
        this.oldP = op;
        this.newP = np;
        };
    }