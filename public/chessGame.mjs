import uuid from 'uuid';
const { v4: uuidv4 } = uuid;

export default class ChessGame {
    constructor() {
        
        this.players = [];
        this.turn = 1; //player 1
        this.status = 0; // waiting for player
        this.gameId = uuidv4();
    }
        
}
