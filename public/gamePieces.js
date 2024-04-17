board = 
[
    'a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8',
    'a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7',
    'a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6',
    'a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5',
    'a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4',
    'a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3',
    'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2',
    'a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1',
]

// HAVE TO CHECK IF PIECE IS BLOCKED TOO!

class Chessboard {
    constructor() {
        this.board = Array(9).fill(null).map(() => Array(9).fill(null));
    }

    placePiece(piece, row, column) {
        if (this.isValidPosition(row, column)) {
            this.board[row][column] = piece;
            piece.setPosition(row, column);
            return true;
        } else {
            console.log('Invalid position');
            return false;
        }
    }
    removePiece(row, column) {
        this.board[row][column] = null;
    }
    isOccupied(row, column) {
        return !!this.board[row][column];
    }

    isValidPosition(row, column) {
        const columnCharCode = column.charCodeAt(0);
        return row > 0 && row <= 8 && columnCharCode >= 'a'.charCodeAt(0) && columnCharCode <= 'h'.charCodeAt(0);
    }
}


class Piece {
    constructor(typeName, color, row, column, chessboard) {
        this.typeName = typeName;
        this.color = color;
        this.position = {
            row: row,
            column: column
        };
        this.chessboard = chessboard;
    }
    getType() { return this.typeName }
    getColor() { return this.color }
    getPosition() {
        return this.position;
    }
    setPosition(row, column) {
        let oldPosition = this.position;
        this.chessboard.removePiece(oldPosition.row, oldPosition.column);
        this.position = {
            row: row,
            column: column
        };
        this.chessboard.board[row][column] = this;
    }
    getMoves() {
        return []; 
    }
    move(row, column) {
        const moves = this.getMoves();
        const targetMove = { row: row, column: column };

        const isValidMove = moves.some(move => move.row === targetMove.row && move.column === targetMove.column);
        if (isValidMove) {
            if (this.chessboard.isOccupied(row, column) || !this.chessboard.isValidPosition(row, column)) {
                console.log("Invalid move");
            }
            else {
                this.setPosition(row, column);
                console.log("Move successful");
            }
        } else {
            console.log("Invalid move");
        }
        return this.position;
    }
}

class Pawn extends Piece {
    constructor(chessboard, color, row, column) {
        super('Pawn', color, row, column, chessboard);
    }
    getMoves() {
        if (this.getColor() === 'white') 
        {
            if (this.position.row === 2) {
                return [{ row: this.position.row + 1, column: this.position.column }, { row: this.position.row + 2, column: this.position.column }];
            } else {
                return [{ row: this.position.row + 1, column: this.position.column }];
            }
        }
        else {
            if (this.position.row === 2) {
                return [{ row: this.position.row - 1, column: this.position.column }, { row: this.position.row - 1, column: this.position.column }];
            } else {
                return [{ row: this.position.row - 1, column: this.position.column }];
            }
        }
    }
    capture(row, column) {

    }
}

class King extends Piece {
    constructor(chessboard, color, row, column) {
        super('King', color, row, column, chessboard);
    }
    getMoves() {
        let moves = []
        let column = this.position.column;
        let row = this.position.row;
        moves.push({ row: row, column: String.fromCharCode(column.charCodeAt(0) + 1) });
        moves.push({ row: row, column: String.fromCharCode(column.charCodeAt(0) - 1) });
        moves.push({ row: row + 1, column: column });
        moves.push({ row: row - 1, column: column });
        moves.push({ row: row + 1, column: String.fromCharCode(column.charCodeAt(0) - 1) });
        moves.push({ row: row + 1, column: String.fromCharCode(column.charCodeAt(0) + 1) });
        moves.push({ row: row - 1, column: String.fromCharCode(column.charCodeAt(0) - 1) });
        moves.push({ row: row - 1, column: String.fromCharCode(column.charCodeAt(0) + 1) });
        return moves;
    }
}

class Rook extends Piece {
    constructor(chessboard, color, row, column) {
        super('Rook', color, row, column, chessboard);
    }
    getMoves() {
        let moves = [];
        let column = this.position.column;
        let row = this.position.row;
        for (let i = row + 1; i <= 8; i++) {
            moves.push({row: row + (i - row), column: column });
            moves.push({row: row, column: String.fromCharCode(column.charCodeAt(0) + (i - row)) });
        }
        for (let i = row - 1; i > 0; i--) {
            moves.push({row : row - (row - i), column: column});
            moves.push({ row: row, column: String.fromCharCode(column.charCodeAt(0) - (row - i)) });
        }
        return moves;
    }
}

class Bishop extends Piece {
    constructor(chessboard, color, row, column) 
    {
        super('Bishop', color, row, column, chessboard);
    }
    getMoves() {
        let moves = [];
        let column = this.position.column.charCodeAt(0);
        let row = this.position.row;

        // Up-right diagonal
        for (let i = 1; i <= 8; i++) {
            moves.push({ row: row + i, column: String.fromCharCode(column + i) });
        }

        // Up-left diagonal
        for (let i = 1; i <= 8; i++) {
            moves.push({ row: row + i, column: String.fromCharCode(column - i) });
        }

        // Down-right diagonal
        for (let i = 1; i <= 8; i++) {
            moves.push({ row: row - i, column: String.fromCharCode(column + i) });
        }

        // Down-left diagonal
        for (let i = 1; i <= 8; i++) {
            moves.push({ row: row - i, column: String.fromCharCode(column - i) });
        }

        return moves;
    }

}

class Queen extends Piece {
    constructor(chessboard, color, row, column) 
    {
        super('Queen', color, row, column, chessboard);
        this.king = new King(chessboard, color, row, column);
        this.rook = new Rook(chessboard, color, row, column);
        this.bishop = new Bishop(chessboard, color, row, column);
    }
    getMoves() {
        let kingMoves = this.king.getMoves();
        let rookMoves = this.rook.getMoves();
        let bishopMoves = this.rook.getMoves();
        let moves = [...kingMoves, ...rookMoves, ...bishopMoves];
        return moves;
    }
}
class Knight extends Piece 
{
    constructor(chessboard, color, row, column) {
        super('Knight', color, row, column, chessboard);
    }
    getMoves() {
        let moves = [];
        let column = this.position.column;
        let row = this.position.row;
        const charCode = column.charCodeAt(0);
        moves.push({ row: row + 2, column: String.fromCharCode(charCode + 1)}); // 2 up, 1 to the right
        moves.push({ row: row + 2, column: String.fromCharCode(charCode - 1)}); // 2 up, 1 to the left
        moves.push({ row: row - 2, column: String.fromCharCode(charCode + 1)}); // 2 down, 1 to the right
        moves.push({ row: row - 2, column: String.fromCharCode(charCode - 1)}); // 2 down, 1 to the left
        moves.push({ row: row - 1, column: String.fromCharCode(charCode + 2)}); // 2 to the right, 1 down
        moves.push({ row: row - 1, column: String.fromCharCode(charCode - 2)}); // 2 to the left, 1 down
        moves.push({ row: row + 1, column: String.fromCharCode(charCode + 2)}); // 2 to the right, 1 up
        moves.push({ row: row + 1, column: String.fromCharCode(charCode - 2)}); // 2 to the left, 1 up
        return moves;
    }
}
/*

for testing purposes, have to comment out game.js if you want to run 

const chessboard = new Chessboard();

const king1 = new King(chessboard, "white", 1, "d");
chessboard.placePiece(king1, king1.getPosition().row, king1.getPosition().column);

console.log(king1.getMoves());
console.log(king1.move(1, "e"));

const pawn1 = new Pawn(chessboard, "white", 2, "a");
chessboard.placePiece(pawn1, pawn1.getPosition().row, pawn1.getPosition().column);

const rook1 = new Rook(chessboard, "white", 1, "a");
chessboard.placePiece(rook1, rook1.getPosition().row, rook1.getPosition().column);

console.log(rook1.getMoves());

const bishop1 = new Bishop(chessboard, "white", 3, "c");
console.log(bishop1.getMoves());
console.log(bishop1.move(4, "d"));

const queen1 = new Queen(chessboard, "white", 5, "a");
console.log(queen1.getMoves());

const knight1 = new Knight(chessboard, "white", 1, "b");
console.log(knight1.getMoves());
*/