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

class Chessboard {
    constructor() {
        this.board = Array(9).fill(null).map(() => Array(9).fill(null));
        this.kings = {
            white: null,
            black: null
        };
    }
    placePiece(piece, row, column) {
        if (this.isValidPosition(row, column)) {
            this.board[row][column] = piece;
            piece.setPosition(row, column);
            if (piece.getType() === 'King')
            {
                this.kings[piece.getColor()] = piece;
            }
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
    getPiece(row, column) {
        return this.board[row][column];
    }
    capture(row, column) {
        const pieceElement = document.getElementById(column + row).querySelector('.piece');
        if (pieceElement) {
            pieceElement.remove();
        }
    }
    getKing(color) {
        return this.kings[color];
    }
    setKing(piece) {
        if (piece.getColor() === 'black')
        {
            this.kings.black = piece;
        }
        else {
            this.kings.white = piece;
        }
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
        this.chessboard.board[row][column] = this;
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
        const oldPositionRow = this.getPosition().row;
        const oldPositionCol = this.getPosition().column;
        const color = this.getColor();

        const isValidMove = moves.some(move => move.row === targetMove.row && move.column === targetMove.column);
        if (isValidMove) {
            if (this.chessboard.isOccupied(row, column) || !this.chessboard.isValidPosition(row, column)) {
                const targetPiece = this.chessboard.getPiece(row, column);
                console.log(targetPiece);
                if (targetPiece.getColor() !== this.getColor()) {
                    this.setPosition(row, column);
                    if (color === 'white') 
                    {
                        if (this.chessboard.kings.white.isChecked())
                        {
                            this.setPosition(oldPositionRow, oldPositionCol);
                            return false;
                        }
                    }
                    else {
                        if (this.chessboard.kings.black.isChecked())
                        {
                            this.setPosition(oldPositionRow, oldPositionCol);
                            return false;
                        }
                    }
                    return true;
                }
                return false;
            }
            else {
                this.setPosition(row, column);
                console.log("Move successful");
            }
        } else {
            return false;
        }
        return true;
    }


}

class Pawn extends Piece {
    constructor(chessboard, color, row, column) {
        super('Pawn', color, row, column, chessboard);
    }
    getMoves() {
        const moves = [];
        const currentRow = this.position.row;
        const currentColumn = this.position.column;
        const columnCode = currentColumn.charCodeAt(0);

        if (this.getColor() === 'white') {
            // White pawns move forward (row + 1)
            if (currentRow === 2) {
                // If pawn is on the second row, it can move one or two squares forward
                if (!this.chessboard.isOccupied(currentRow + 1, currentColumn))
                {
                    moves.push({ row: currentRow + 1, column: currentColumn });
                    if (!this.chessboard.isOccupied(currentRow + 2, currentColumn))
                    {
                        moves.push({ row: currentRow + 2, column: currentColumn });
                    }
                }
            } else {
                // Otherwise, it can only move one square forward
                if (!this.chessboard.isOccupied(currentRow + 1, currentColumn))
                {
                    moves.push({ row: currentRow + 1, column: currentColumn });
                }
            }
            if (this.chessboard.isOccupied(currentRow + 1, String.fromCharCode(columnCode - 1)))
            {
                moves.push({ row: currentRow + 1, column: String.fromCharCode(columnCode - 1)});
            }
            if (this.chessboard.isOccupied(currentRow + 1, String.fromCharCode(columnCode + 1)))
            {
                moves.push({row: currentRow + 1, column: String.fromCharCode(columnCode + 1)});
            }
        } else {
            // Black pawns move forward (row - 1)
            if (currentRow === 7) {
                // If pawn is on the seventh row, it can move one or two squares forward
                if (!this.chessboard.isOccupied(currentRow - 1, currentColumn)) {
                    moves.push({ row: currentRow - 1, column: currentColumn });
                    if (!this.chessboard.isOccupied(currentRow - 2, currentColumn)) {
                        moves.push({ row: currentRow - 2, column: currentColumn });
                    }
                }
            } else {
                // Otherwise, it can only move one square forward
                if (!this.chessboard.isOccupied(currentRow - 1, currentColumn)) {
                    moves.push({ row: currentRow - 1, column: currentColumn });
                }
            }
            if (this.chessboard.isOccupied(currentRow - 1, String.fromCharCode(columnCode - 1))) {
                moves.push({ row: currentRow - 1, column: String.fromCharCode(columnCode - 1) });
            }
            if (this.chessboard.isOccupied(currentRow - 1, String.fromCharCode(columnCode + 1))) {
                moves.push({ row: currentRow - 1, column: String.fromCharCode(columnCode + 1) });
            }
        }
        return moves;
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
    isChecked() {
        const startingPosition = this.position;
        const aCharcode = 'a'.charCodeAt(0);
        const startingColumn = startingPosition.column;
        const startingRow = startingPosition.row;
        const horizontalPieces = ['Rook', 'Queen'];
        const diagonalPieces = ['Bishop', 'Queen'];
        const checkDirection = (deltaRow, deltaCol) => {
            let row = startingRow + deltaRow;
            let col = startingColumn.charCodeAt(0) + deltaCol;
            while (row >= 1 && row <= 8 && col >= 97 && col <= 104) {
                if (this.chessboard.isOccupied(row, String.fromCharCode(col))) {
                    const piece = this.chessboard.getPiece(row, String.fromCharCode(col));
                    if (piece.getColor() !== this.getColor()) {
                        if (horizontalPieces.includes(piece.getType()) || diagonalPieces.includes(piece.getType())) {
                            return true;
                        }
                    }
                    break;
                }
                row += deltaRow;
                col += deltaCol;
            }
            return false;
        };

        // Check horizontal
        if (checkDirection(0, 1) || checkDirection(0, -1)) return true;

        // Check vertical
        if (checkDirection(1, 0) || checkDirection(-1, 0)) return true;

        // Check diagonal
        if (checkDirection(1, 1) || checkDirection(-1, 1) || checkDirection(1, -1) || checkDirection(-1, -1)) return true;

        let col = startingColumn.charCodeAt(0);
        const knightThreats = [
            { row: startingRow - 2, column: String.fromCharCode(col - 1)},
            { row: startingRow - 2, column: String.fromCharCode(col + 1)},
            { row: startingRow - 1, column: String.fromCharCode(col - 2) },
            { row: startingRow - 1, column: String.fromCharCode(col + 2) },
            { row: startingRow + 1, column: String.fromCharCode(col - 2) },
            { row: startingRow + 1, column: String.fromCharCode(col + 2) },
            { row: startingRow + 2, column: String.fromCharCode(col - 1) },
            { row: startingRow + 2, column: String.fromCharCode(col + 1) }
        ];
        for (const threat of knightThreats) {
            if (threat.row >= 1 && threat.row <= 8 && threat.column >= 'a' && threat.column <= 'h') {
                const piece = this.chessboard.getPiece(threat.row, threat.column);
                if (piece && piece.getColor() !== this.getColor() && piece.getType() === "Knight") {
                    return true;
                }
            }
        }
        let pawnThreats = [];
        if (this.getColor() === 'white')
        {
            pawnThreats = [
                { row: startingRow + 1, column: String.fromCharCode(col - 1)},
                { row: startingRow + 1, column: String.fromCharCode(col + 1)}
            ];
        }
        else {
            pawnThreats = [
                { row: startingRow - 1, column: String.fromCharCode(col - 1)},
                { row: startingRow - 1, column: String.fromCharCode(col + 1)}
            ];
        }
        for (const threat of pawnThreats) {
            if (threat.row >= 1 && threat.row <= 8 && threat.column >= 'a' && threat.column <= 'h')
            {
                const piece = this.chessboard.getPiece(threat.row, threat.column);
                if (piece && piece.getColor() !== this.getColor() && piece.getType() === "Pawn")
                {
                    return true;
                }
            }
        }
        return false;
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
            moves.push({ row: i, column: column });
        }
        for (let i = row - 1; i >= 1; i--) {
            moves.push({ row: i, column: column });
        }
        for (let charCode = column.charCodeAt(0) + 1; charCode <= 104; charCode++) {
            moves.push({ row: row, column: String.fromCharCode(charCode) });
        }
        for (let charCode = column.charCodeAt(0) - 1; charCode >= 97; charCode--) {
            moves.push({ row: row, column: String.fromCharCode(charCode) });
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

        column = this.position.column;
        for (let i = row + 1; i <= 8; i++) {
            moves.push({ row: i, column: column });
        }
        for (let i = row - 1; i >= 1; i--) {
            moves.push({ row: i, column: column });
        }
        for (let charCode = column.charCodeAt(0) + 1; charCode <= 104; charCode++) {
            moves.push({ row: row, column: String.fromCharCode(charCode) });
        }
        for (let charCode = column.charCodeAt(0) - 1; charCode >= 97; charCode--) {
            moves.push({ row: row, column: String.fromCharCode(charCode) });
        }
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