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

function squareClick(event) {
    const square = event.target.closest('.square');
    const squareId = square.id;
    const hasPiece = square.querySelector('.piece') !== null;

    console.log(`Clicked on square ${squareId}`);
    if (activePiece) {
        let column = squareId.charAt(0);
        let row = parseInt(squareId.charAt(1));
        let oldPosition = activePiece.getPosition();
        var updatedPosition;
        if (activePiece.move(row, column))
        {
            updatedPosition = activePiece.getPosition();
            console.log(updatedPosition);
            const obstacles = checkObstacles(oldPosition, updatedPosition);
            if (updatedPosition === oldPosition || obstacles.length > 0) {
                console.log('Move failed');
                return;
            }
            updatePieces(oldPosition, squareId);
            movePiece(oldPosition, squareId);
            activePiece.move(row, column);
            console.log(activePiece.getPosition());
            /*
            for (const piece in pieces) {
                console.log(`Key: ${piece}, Piece: ${pieces[piece]}`)
            }
            */
            activePiece = null;
        }
    }
    if (hasPiece) {
        console.log('Square has a piece');
        activePiece = pieces[squareId];
        console.log(activePiece.getType());
    }
    else {
        console.log('Square does not have a piece');
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
        console.log('pieceDiv:', pieceDiv);
        if (pieceDiv) {
            pieceDiv.parentElement.id = newPosition;
            toSquare.appendChild(pieceDiv);
        }
    }
}

function checkObstacles(currentPosition, newPosition) {
    const obstacles = [];

    const deltaRow = Math.sign(newPosition.row - currentPosition.row);
    const deltaColumn = Math.sign(newPosition.column.charCodeAt(0) - currentPosition.column.charCodeAt(0));

    for (let row = currentPosition.row + deltaRow, columnCode = currentPosition.column.charCodeAt(0) + deltaColumn;
        row !== newPosition.row || columnCode !== newPosition.column.charCodeAt(0);
        row += deltaRow, columnCode += deltaColumn) {

        const column = String.fromCharCode(columnCode);
        const squareId = column + row;

        if (pieces[squareId]) {
            obstacles.push(squareId);
        }
    }

    return obstacles;
}

function addEventListeners() {
    const squares = document.querySelectorAll('.square');
    squares.forEach(square => {
        square.addEventListener('click', squareClick)
    });
}

addEventListeners();