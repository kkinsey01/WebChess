const chessboard = new Chessboard();

function squareClick(event) {
    const squareId = event.target.id;
    console.log(`Clicked on square with id: ${squareId}`);
}

function addEventListeners() {
    const squares = document.querySelectorAll('.square');
    squares.forEach(square => {
        square.addEventListener('click', squareClick)
    })
}

addEventListeners();