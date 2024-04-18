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

let activePiece = null;
let whiteTurn = true;

async function squareClick(event) {
    const square = event.target.closest('.square');
    const squareId = square.id;
    const hasPiece = square.querySelector('.piece') !== null;
    var moves;
    console.log(`Clicked on square ${squareId}`);
    if (activePiece) {
        moves = activePiece.getMoves();
        await movement(activePiece, squareId);
    }
    if (hasPiece) {
        console.log('Square has a piece', squareId);
        if (activePiece) {
            for (let move of moves) {
                let moveString = move.column + move.row.toString();
                console.log(moveString);
                if (moveString === squareId) {
                    capture(squareId);
                }
            }
        }
        else {
            activePiece = pieces[squareId];
            console.log(activePiece.getType());
        }
    }
    else {
        console.log('Square does not have a piece');
        activePiece = null;
    }
}

async function movement(activePiece, squareId)
{
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
                if (pieces[updatedPosition]) {
                    console.log('Piece exists in location');
                    await capture(updatedPosition);
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
    console.log('squarediv', squareDiv);
    const pieceDiv = squareDiv.querySelector('.piece');
    console.log('piece div', pieceDiv);
    if (pieceDiv)
    {
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