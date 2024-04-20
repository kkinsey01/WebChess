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
        await movement(activePiece, squareId);
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
    if (activePiece.move(row, column)) { // WHEN CAPTURING, KNIGHT NEVER GOES INTO THIS IF
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
}
function addEventListeners() {
    const squares = document.querySelectorAll('.square');
    squares.forEach(square => {
        square.addEventListener('click', squareClick)
    });
}

addEventListeners();