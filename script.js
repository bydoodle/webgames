function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12;
    minutes = minutes.toString().padStart(2, "0");

    document.getElementById("clock").textContent = `${hours}:${minutes} ${ampm}`;
}

let timer;
let seconds = 0;

updateClock();
setInterval(updateClock, 1000);

const windowStates = new WeakMap();
draggableWindow = document.getElementById('draggable-window');

function initDrag(windowElement, titleBar) {
    const state = {
        offsetX: 0,
        offsetY: 0,
        isDragging: false,
        clicked: false,
        initialLeft: 0,
        initialTop: 0,
        handlers: {}
    };

    state.handlers.mouseDown = (event) => handleMouseDown(event, windowElement, state);
    state.handlers.mouseMove = (event) => handleMouseMove(event, windowElement, state);
    state.handlers.mouseUp = (event) => handleMouseUp(event, windowElement, state);

    titleBar.addEventListener('mousedown', state.handlers.mouseDown);
    document.addEventListener('mousemove', state.handlers.mouseMove);
    document.addEventListener('mouseup', state.handlers.mouseUp);

    windowStates.set(windowElement, state);
}

function removeDrag(windowElement, titleBar) {
    const state = windowStates.get(windowElement);

    titleBar.removeEventListener('mousedown', state.handlers.mouseDown);
    document.removeEventListener('mousemove', state.handlers.mouseMove);
    document.removeEventListener('mouseup', state.handlers.mouseUp);

    windowStates.delete(windowElement);
}

function dragWindow(windowElement, titleBar) {
    mouseDownHandler = (event) => handleMouseDown(event, windowElement);
    mouseMoveHandler = (event) => handleMouseMove(event, windowElement);
    mouseUpHandler = (event) => handleMouseUp(event, windowElement);

    titleBar.addEventListener("mousedown", mouseDownHandler);
    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mouseup", mouseUpHandler);
}

// function dragWindowRemove(windowElement, titleBar) {
//     titleBar.removeEventListener("mousedown", (event) => handleMouseDown(event, windowElement));

//     document.removeEventListener("mousemove", (event) => handleMouseMove(event, windowElement));

//     document.removeEventListener("mouseup", (event) => handleMouseUp(event, windowElement));
// }

function handleMouseDown(event, windowElement, state) {
    document.body.style.userSelect = 'none';

    [...document.getElementsByClassName('game__container')].forEach(elem => {
        elem.style.zIndex = 5;
    });

    [...document.getElementsByClassName('program__header')].forEach(elem => {
        elem.style.backgroundColor = '#7f7f7f';
    });

    windowElement.getElementsByClassName('program__header')[0].style.backgroundColor = '';

    windowElement.style.zIndex = 6;

    state.isDragging = true;
    state.clicked = true;

    state.offsetX = event.clientX - windowElement.offsetLeft;
    state.offsetY = event.clientY - windowElement.offsetTop;

    state.initialLeft = windowElement.offsetLeft;
    state.initialTop = windowElement.offsetTop;

    draggableWindow.style.display = 'block';
    draggableWindow.style.width = windowElement.offsetWidth - 4 + 'px';
    draggableWindow.style.height = windowElement.offsetHeight - 4 + 'px';

    draggableWindow.style.left = `${state.initialLeft}px`;
    draggableWindow.style.top = `${state.initialTop}px`;
}

function handleMouseMove(event, windowElement, state) {
    if(state.isDragging) {
        state.clicked = false;

        let newTop = event.clientY - state.offsetY;

        newTop = Math.max(newTop, 0);
        newTop = Math.min(newTop, windowElement.offsetHeight + 400);

        draggableWindow.style.left = `${event.clientX - state.offsetX}px`;
        draggableWindow.style.top = `${newTop}px`;
    }
}

function handleMouseUp(event, windowElement, state) {
    document.body.style.userSelect = '';

    if (state.isDragging && !state.clicked) {
        console.log(draggableWindow.style.left, draggableWindow.style.top)
        windowElement.style.left = draggableWindow.style.left;
        windowElement.style.top = draggableWindow.style.top;
    }

    if (state.clicked) {
        draggableWindow.style.display = 'none';
    }
    
    state.isDragging = false;
    state.clicked = false;

    draggableWindow.style.display = 'none';
}

function loadMinesweeper() {
    initDrag(document.getElementById("minesweeper"), document.getElementsByClassName('minesweeper__header')[0])

    const minesweeper = document.getElementById('minesweeper');

    if (minesweeper.style.display == 'none') {
        createGameField(64);

        minesweeper.style.display = 'flex';

        const openMenuBtn = document.getElementById('minesweeper-game-menu');
        const gameMenu = document.getElementById('ms-game-menu-active');

        openMenuBtn.addEventListener("click", (event) => {
            gameMenu.style.display = 'inline-block'

            openMenuBtn.style.color = 'white';
            openMenuBtn.style.backgroundColor = '#000082';
        });

        document.addEventListener("click", (event) => {
            if (!openMenuBtn.contains(event.target)) {
                gameMenu.style.display = 'none';

                openMenuBtn.style.color = '';
                openMenuBtn.style.backgroundColor = '';
            }
        });

        document.getElementById('draggable-window').style.left = document.getElementById('minesweeper').offsetLeft + 'px';
        document.getElementById('draggable-window').style.top = document.getElementById('minesweeper').offsetTop + 'px';
    }
}

minesCount = 10;

function createGameField(fieldCount) {
    if (document.getElementsByClassName('minesweeper__single--field').length !== fieldCount) {
        const gameContainer = document.getElementById('minesweeper-game');
        const msGame = document.getElementById('minesweeper');

        gameContainer.innerHTML = '';

        for (let i = 0; i < fieldCount; i++) {
            const button = document.createElement('button');
            button.classList.add('minesweeper__single--field');
            button.setAttribute('onclick', 'createField(this)');
            button.setAttribute('data-id', i + 1);

            gameContainer.appendChild(button);
        }

        gameContainer.classList.remove(
            'minesweeper__small--field',
            'minesweeper__mid--field',
            'minesweeper__big--field'
        );

        document.querySelectorAll(`[data-ms-size]`).forEach(elem => {
            elem.querySelector('img').style.visibility = 'hidden';
        });

        if (fieldCount == 64) {
            minesCount = 10;
            gameContainer.classList.add('minesweeper__small--field');
            
            document.querySelector('[data-ms-size="64"]').querySelector('img').style.visibility = 'visible';
        } else if (fieldCount == 256) {
            minesCount = 40;
            gameContainer.classList.add('minesweeper__mid--field');

            document.querySelector('[data-ms-size="256"]').querySelector('img').style.visibility = 'visible';
        } else if (fieldCount == 480) {
            minesCount = 99;
            gameContainer.classList.add('minesweeper__big--field');

            document.querySelector('[data-ms-size="480"]').querySelector('img').style.visibility = 'visible';
        }

        document.getElementById('minesweeper-restart-button').style.backgroundImage = 'url(../images/ms-default.png)';

        minesCounter();
        minesweeperResetTimer();

        const minesweeperFields = document.querySelectorAll('.minesweeper__single--field');
        const minesweeperResetButton = document.getElementById('minesweeper-restart-button');

        minesweeperFields.forEach(field => {
            field.addEventListener('mousedown', (event) => {
                if (!minesweeperGameover && event.button === 0 && !field.classList.contains('minesweeper__destroyed--field')) minesweeperResetButton.style.backgroundImage = 'url(../images/ms-move.png)';
            });

            field.addEventListener('mouseup', (event) => {
                if (!minesweeperGameover && event.button === 0 && !field.classList.contains('minesweeper__destroyed--field')) minesweeperResetButton.style.backgroundImage = '';
            });
        });
    }
}

minesweeperField = [];
minesPositions = [];
minesweeperFieldDivider = 0;
minesweeperDirections = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],         [0, 1],
    [1, -1], [1, 0], [1, 1]
  ];
minesweeperGameover = false;

function createField(elem) {
    const invulnerableFieldId = elem.getAttribute('data-id');
    const fieldCount = document.querySelectorAll('*[data-id]').length;

    minesweeperGameover = false;

    minesPositions = getRandomNumbers(fieldCount, [+invulnerableFieldId], minesCount);

    console.log(invulnerableFieldId, minesPositions)

    const field = document.querySelectorAll('.minesweeper__single--field');
    field.forEach(singleField => {
        singleField.setAttribute('onclick', 'destroyField(this)');
    })

    tempField = [];
    if (fieldCount == 64) {
        minesweeperFieldDivider = 8;
    } else if (fieldCount == 256) {
        minesweeperFieldDivider = 16;
    } else {
        minesweeperFieldDivider = 30;
    }

    for (let i = 1; i < fieldCount + 1; i++) {
        if (minesPositions.includes(i)) {
            tempField.push(9);
        } else {
            tempField.push(0);
        }
    }

    currentField = tempField.reduce((result, value, index) => {
        if (index % minesweeperFieldDivider === 0) result.push([]);
        result[result.length - 1].push(value);
        return result;
    }, []);

      for (let i = 0; i < currentField.length; i++) {
        for (let j = 0; j < currentField[i].length; j++) {
          if (currentField[i][j] !== 9) {
            for (const [dx, dy] of minesweeperDirections) {
              const ni = i + dx;
              const nj = j + dy;
              if (currentField[ni]?.[nj] === 9) {
                currentField[i][j]++;
              }
            }
          }
        }
      }

    minesweeperField = currentField.flat();

    destroyField(elem);
    minesweeperStartTimer();
}

function minesweeperStartTimer() {
    if (timer) return; 

    timer = setInterval(() => {
        if (seconds < 999) {
            seconds++;
            updateDisplay();
        } else {
            return;
        }
    }, 1000);
}

function minesweeperStopTimer() {
    if (!timer) return;

    clearInterval(timer);
    timer = null;
}

function minesweeperResetTimer() {
    minesweeperStopTimer();
    seconds = 0;
    updateDisplay();
}

function updateDisplay() {
    document.getElementById("minesweeper-timer").textContent = String(seconds).padStart(3, '0');
}

function destroyField(field) {
    if (!field.classList.contains('minesweeper__flagged') && !field.classList.contains('minesweeper__destroyed--field')) {
        field.setAttribute('onclick', '');
        field.classList.add('minesweeper__destroyed--field');
        field.classList.add('minesweeper__' + minesweeperField[field.getAttribute('data-id') - 1]);

        if (minesweeperField[field.getAttribute('data-id') - 1] !== 0 && minesweeperField[field.getAttribute('data-id') - 1] !== 9) {
            field.innerHTML = minesweeperField[field.getAttribute('data-id') - 1];
        } else if (minesweeperField[field.getAttribute('data-id') - 1] == 9) {
            field.innerHTML = `<img src="images/mine.png" alt="">`;
            minesweeperGameOver();
        } else {
            revealCells(field);
        }
    }

    if (document.getElementsByClassName('minesweeper__destroyed--field').length == minesweeperField.length - minesCount) {
        minesweeperWin();
    }
}

function revealCells(field) {
    const fieldId = field.getAttribute('data-id');
    const fy = Math.floor((fieldId - 1) / minesweeperFieldDivider);
    const fx = fieldId - fy * minesweeperFieldDivider - 1;

    for (const [dx, dy] of minesweeperDirections) {
        const ni = fy + dx;
        const nj = fx + dy;
        if (currentField[ni] !== undefined && currentField[ni][nj] !== undefined) {
            const field = ni * minesweeperFieldDivider + nj + 1;
            const nextField = document.querySelector('[data-id="' + field + '"]');

            if (!nextField.classList.contains('minesweeper__destroyed--field')) {
                destroyField(nextField);
            }
        }
    }
}

function minesweeperRestartGame() {
    const allFields = document.getElementsByClassName('minesweeper__single--field');
    const gameContainer = document.getElementById('minesweeper-game');

    const fieldCount = allFields.length;

    gameContainer.innerHTML = '';

    createGameField(fieldCount);
    document.getElementById('minesweeper-restart-button').style.backgroundImage = 'url(../images/ms-default.png)';
}

function minesweeperGameOver() {
    const allMines = document.querySelectorAll('*[data-id]');

    allMines.forEach(elem => {
        if (minesPositions.includes(Number(elem.getAttribute('data-id'))) && !elem.classList.contains('minesweeper__flagged')) {
            elem.innerHTML = `<img src="images/mine.png" alt="">`;
            elem.classList.add('minesweeper__9add');
        }
    });

    [...document.getElementsByClassName('minesweeper__single--field')].forEach(elem => {
        elem.setAttribute('onclick', '');
    });

    minesweeperStopTimer();
    minesweeperGameover = true;

    document.getElementById('minesweeper-restart-button').style.backgroundImage = 'url(../images/ms-lose.png)';
}

function minesweeperWin() {
    [...document.getElementsByClassName('minesweeper__single--field')].forEach(elem => {
        elem.setAttribute('onclick', '');
    });

    minesweeperGameover = true;

    document.getElementById('minesweeper-restart-button').style.backgroundImage = 'url(../images/ms-win.png)';
    minesweeperStopTimer();
}

function getRandomNumbers(nMax, nInvulnerable, nSize) {
    const numbers = new Set();

    while (numbers.size < nSize) {
        let randomNum = Math.floor(Math.random() * nMax) + 1;
        console.log(nInvulnerable, randomNum, nInvulnerable.includes(randomNum))
        if (!nInvulnerable.includes(randomNum)) {
            numbers.add(randomNum);
        }
    }

    return [...numbers];
}

document.getElementById('minesweeper-game').addEventListener('contextmenu', (event) => {
    if (event.target.classList.contains('minesweeper__single--field') && !event.target.classList.contains('minesweeper__destroyed--field') && !minesweeperGameover) {
      event.preventDefault();
      event.target.classList.toggle('minesweeper__flagged'); // Добавляем или убираем флажок

      minesCounter();
    }
  });

function closeMinesweeper() {
    console.log(true)
    // dragWindowRemove(document.getElementById("minesweeper"), document.getElementsByClassName('minesweeper__header')[0]);

    const minesweeper = document.getElementById('minesweeper');
    const gameContainer = document.getElementById('minesweeper-game');

    minesweeper.style.display = 'none';
    gameContainer.innerHTML = '';

    minesweeperGameover = true;
}

function minesCounter() {
    let minesLeft = minesCount - document.getElementsByClassName('minesweeper__flagged').length > 0 ? minesCount - document.getElementsByClassName('minesweeper__flagged').length : 0;
    document.getElementById('minesweeper-mines-count').textContent = String(minesLeft).padStart(3, '0');
}

/* 2048 */

field2048 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
score2048 = 0;
colorScheme2048 = {
    2: ['#f0e3db', '3em'],
    4: ['#f1dec9', '3em'],
    8: ['#fbb37a', '3em'],
    16: ['#ff9a65', '3em'],
    32: ['#ff8661', '3em'],
    64: ['#ff6b3e', '3em'],
    128: ['#f3cb75', '3em'],
    256: ['#f3c863', '3em'],
    512: ['#f3c355', '3em'],
    1024: ['#f2bf42', '2.4em'],
    2048: ['#f5bd32', '2.4em'],
    4096: ['#fc746e', '2.4em'],
    8192: ['#fd5e5b', '2.4em'],
    16384: ['#f0513b', '2em'],
    32768: ['#69aed7', '2em'],
    65536: ['#579ce1', '2em'],
    131072: ['#0073be', '1.8em']
}

function load2048() {
    initDrag(document.getElementById("g2048"), document.getElementsByClassName('g2048__header')[0])

    const g2048 = document.getElementById('g2048');

    if (g2048.style.display == 'none') {
        g2048.style.display = 'flex';
    }

    createField2048();
}

function createField2048() {
    const field = document.getElementById('g2048-game');
    field2048 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    field.innerHTML = '';

    let randomFields = getRandomNumbers(16, [-1], 2);
    console.log(randomFields)

    for (let i = 0; i < field2048.length; i++) {
        if (randomFields.includes(i + 1)) {
            field2048[i] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    drawField2048(field);

    document.addEventListener("keydown", handleKeyDown2048);
}

function handleKeyDown2048(event) {
    if (event.key === "ArrowUp") {
        moveUp2048();
        event.preventDefault();
    } else if (event.key === "ArrowDown") {
        moveDown2048();
        event.preventDefault();
    } else if (event.key === "ArrowLeft") {
        moveLeft2048();
        event.preventDefault();
    } else if (event.key === "ArrowRight") {
        moveRight2048();
        event.preventDefault();
    }
}

function drawField2048(field) {
    for (let i = 0; i < field2048.length; i++) {
        const elem = document.createElement('div');

        if (field2048[i] != 0) {
            elem.textContent = field2048[i];
            elem.style.backgroundColor = colorScheme2048[+elem.textContent][0];
        }
        field.appendChild(elem);
    }
}

function moveCell2048(index, neighbour) {
    field2048[index + neighbour] = field2048[index];
    field2048[index] = 0;
}

function connectCells2048(index, neighbour) {
    field2048[index + neighbour] *= 2;
    field2048[index] = 0;

    score2048 += field2048[index + neighbour];

    document.getElementById('score-2048').textContent = 'Score: ' + score2048;
}

function moveUp2048() {
    let isMoved = false;

    console.log(true)

    for (let i = 4; i < field2048.length; i++) {
        if (field2048[i]) {
            let j = i;
            while (j >= 4) {
                if (field2048[j - 4] == 0) {
                    moveCell2048(j, -4)
                    isMoved = true;
                } else if (field2048[j - 4] == field2048[j]) {
                    connectCells2048(j, -4)
                    isMoved = true;
                    break;
                } else {
                    break;
                }
                j -= 4;
            }
        }
    }

    if (isMoved) {
        spawnNewElem2048();
        redrawField2048();
    }
}

function moveDown2048() {
    let isMoved = false;

    for (let i = field2048.length - 1; i >= 0; i--) {
        if (field2048[i]) {
            let j = i;
            while (j < field2048.length - 4) {
                if (field2048[j + 4] == 0) {
                    moveCell2048(j, 4)
                    isMoved = true;
                    j += 4;
                } else if (field2048[j + 4] == field2048[j]) {
                    connectCells2048(j, 4)
                    isMoved = true;
                    break;
                } else {
                    break;
                }
            }
        }
    }

    if (isMoved) {
        spawnNewElem2048();
        redrawField2048();
    }
}

function moveRight2048() {
    let isMoved = false;

    for (let row = 0; row < 4; row++) {
        for (let col = 2; col >= 0; col--) {
            let i = row * 4 + col;

            if (field2048[i] !== 0) {
                let j = i;
                while (j % 4 !== 3 && field2048[j + 1] === 0) {
                    moveCell2048(j, 1)
                    j++;
                    isMoved = true;
                }
                if (j % 4 !== 3 && field2048[j + 1] === field2048[j]) {
                    connectCells2048(j, 1)
                    isMoved = true;
                }
            }
        }
    }

    if (isMoved) {
        spawnNewElem2048();
        redrawField2048();
    }
}

function moveLeft2048() {
    let isMoved = false;

    for (let row = 0; row < 4; row++) {
        for (let col = 1; col <= 3; col++) {
            let i = row * 4 + col;

            if (field2048[i] !== 0) {
                let j = i;
                while (j % 4 !== 0 && field2048[j - 1] === 0) {
                    moveCell2048(j, -1)
                    j--;
                    isMoved = true;
                }
                if (j % 4 !== 0 && field2048[j - 1] === field2048[j]) {
                    connectCells2048(j, -1)
                    isMoved = true;
                }
            }
        }
    }

    if (isMoved) {
        spawnNewElem2048();
        redrawField2048();
    }
}

function spawnNewElem2048() {
    let temp = getNonZeroIndices(field2048);
    field2048[getRandomNumbers(field2048.length, temp, 1)[0] - 1] = Math.random() < 0.9 ? 2 : 4;
}

function getNonZeroIndices(arr) {
    return arr
        .map((value, index) => (value !== 0 ? index + 1 : -1))
        .filter(index => index !== -1);
}

function redrawField2048() {
    const field = document.getElementById('g2048-game').querySelectorAll('div');

    for (let i = 0; i < field2048.length; i++) {
        if (field2048[i] != 0) {
            field[i].textContent = field2048[i];
            field[i].style.backgroundColor = colorScheme2048[+field[i].textContent][0];
            field[i].style.fontSize = colorScheme2048[+field[i].textContent][1];
        } else {
            field[i].textContent = '';
            field[i].style.backgroundColor = '';
        }
    }
}

function close2048() {
    // dragWindowRemove(document.getElementById("g2048"), document.getElementsByClassName('g2048__header')[0])
    document.removeEventListener("keydown", handleKeyDown2048);

    const g2048 = document.getElementById('g2048');
    const gameContainer = document.getElementById('g2048-game');

    g2048.style.display = 'none';
    gameContainer.innerHTML = '';
}

/* Chess */

chessBoard = [
    ['rb', 'kb', 'bb', 'qb', 'Knb', 'bb', 'kb', 'rb'],
    ['pb', 'pb', 'pb', 'pb', 'pb', 'pb', 'pb', 'pb'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['pw', 'pw', 'pw', 'pw', 'pw', 'pw', 'pw', 'pw'],
    ['rw', 'kw', 'bw', 'qw', 'Knw', 'bw', 'kw', 'rw']
];

activeChessPiece = [];
let activeCell;
let color;
currentColor = 'w';

function loadChess() {
    document.getElementById('chess').style.display = 'flex';

    const gameContainer = document.getElementById('chess-game');

    gameContainer.innerHTML = '';

    isWhiteKingMoved = false;
    isBlackKingMoved = false;
    isRookA8Moved = false;
    isRookH8Moved = false;
    isRookA1Moved = false;
    isRookH1Moved = false;

    blackKingPos = [0, 4];
    whiteKingPos = [7, 4];

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const cell = document.createElement('div');
            const img = document.createElement('img');
            cell.classList.add('chess__cell');
            cell.dataset.row = i;
            cell.dataset.col = j;

            if (i % 2 == 0 && j % 2 == 0 || i % 2 != 0 && j % 2 != 0) {
                cell.classList.add('light__cell');
            } else {
                cell.classList.add('dark__cell');
            }
            gameContainer.appendChild(cell);

            if (chessBoard[i][j]) {
                img.src = `images/Chess/${chessBoard[i][j]}.png`
                img.setAttribute('onclick', 'activateChessPiece(this)');
                img.dataset.cellPiece = chessBoard[i][j];
                cell.appendChild(img);
            }
        }
    }
}

function activateChessPiece(cell) {
    if (cell.dataset.cellPiece.slice(cell.dataset.cellPiece.slice(0, -1).length) != currentColor) return;
    else color = cell.dataset.cellPiece.slice(cell.dataset.cellPiece.slice(0, -1).length)

    let row = +cell.parentElement.dataset.row;
    let col = +cell.parentElement.dataset.col;

    activeChessPiece = [row, col]
    activeCell = cell;
    
    switch (cell.dataset.cellPiece.slice(0, -1)) {
        case 'p': {
            let cellsToMove = [];
            let cellsToBeat = [];
            let directions = [
                [-1, 0]
            ];

            if (row == 6 || row == 1) {
                directions.push([-2, 0]);
            }
            let step = 1;

            for (const [dx, dy] of directions) {
                let i = 1;
                if (color == 'b') i = -1;

                let newRow = row + dx * i;
                let newCol = col + dy * i;

                let cellToCheck = chessBoard[newRow]?.[newCol];

                if (cellToCheck === undefined) break;

                if (step === 1) {
                    if (chessBoard[newRow][newCol - 1] && chessBoard[newRow][newCol - 1] !== '' && chessBoard[newRow][newCol - 1].slice(-1) !== cell.dataset.cellPiece.slice(-1)) {
                        cellsToBeat.push([[newRow],[newCol - 1]]);
                    }
                    if (chessBoard[newRow][newCol + 1] && chessBoard[newRow][newCol + 1] !== '' && chessBoard[newRow][newCol + 1].slice(-1) !== cell.dataset.cellPiece.slice(-1)) {
                        cellsToBeat.push([[newRow],[newCol + 1]]);
                    }
                }

                step++;

                if (cellToCheck === '') {
                    cellsToMove.push([[newRow],[newCol]]);
                } else {
                    break;
                }
            }

            drawPossibleChessMoves(cellsToMove, cellsToBeat);
            break;
        }
        case 'r': {
            let cellsToMove = [];
            let cellsToBeat = [];
            let directions = [
                [-1, 0],
                [1, 0],
                [0, -1],
                [0, 1]
            ];

            for (const [dx, dy] of directions) {
                let i = 1;

                while (true) {
                    let newRow = row + dx * i;
                    let newCol = col + dy * i;

                    let cellToCheck = chessBoard[newRow]?.[newCol];

                    if (cellToCheck === undefined) break;

                    if (cellToCheck === '') {
                        cellsToMove.push([[newRow],[newCol]]);
                    } else {
                        if (chessBoard[newRow][newCol].slice(-1) !== cell.dataset.cellPiece.slice(-1)) {
                            cellsToBeat.push([[newRow],[newCol]]);
                        }
                        break;
                    }

                    i++;
                }
            }

            drawPossibleChessMoves(cellsToMove, cellsToBeat);
            break;
        }
        case 'b': {
            let cellsToMove = [];
            let cellsToBeat = [];
            let directions = [
                [-1, -1],
                [-1, 1],
                [1, -1],
                [1, 1]
            ];

            for (const [dx, dy] of directions) {
                let i = 1;

                while (true) {
                    let newRow = row + dx * i;
                    let newCol = col + dy * i;

                    let cellToCheck = chessBoard[newRow]?.[newCol];

                    if (cellToCheck === undefined) break;

                    if (cellToCheck === '') {
                        cellsToMove.push([[newRow], [newCol]]);
                    } else {
                        if (chessBoard[newRow][newCol].slice(-1) !== cell.dataset.cellPiece.slice(-1)) {
                            cellsToBeat.push([[newRow],[newCol]]);
                        }
                        break;
                    }
                    i++;
                }
            }

            drawPossibleChessMoves(cellsToMove, cellsToBeat);
            break;
        }
        case 'k': {
            let cellsToMove = [];
            let cellsToBeat = [];
            let directions = [
                [row - 1, col - 2],
                [row - 1, col + 2],
                [row + 1, col - 2],
                [row + 1, col + 2],
                [row - 2, col - 1],
                [row - 2, col + 1],
                [row + 2, col - 1],
                [row + 2, col + 1]
            ];

            directions.forEach(elem => {
                if (chessBoard[elem[0]]?.[elem[1]] === '') {
                    cellsToMove.push([[elem[0]],[elem[1]]]);
                } else if (chessBoard[elem[0]]?.[elem[1]]) {
                    if (chessBoard[elem[0]]?.[elem[1]].slice(-1) !== cell.dataset.cellPiece.slice(-1)) {
                        cellsToBeat.push([[elem[0]],[elem[1]]]);
                    }
                }
            });

            drawPossibleChessMoves(cellsToMove, cellsToBeat);
            break;
        }
        case 'Kn': {
            let cellsToMove = [];
            let cellsToBeat = [];
            let directions = [
                [row - 1, col - 1],
                [row - 1, col],
                [row - 1, col + 1],
                [row, col - 1],
                [row, col + 1],
                [row + 1, col - 1],
                [row + 1, col],
                [row + 1, col + 1]
            ];

            if (!isWhiteKingMoved && activeCell.dataset.cellPiece == 'Knw') {
                if (!isRookH1Moved && chessBoard[7][5] == '' && chessBoard[7][6] == '') {
                    cellsToMove.push([[7],[6]]);
                }
                if (!isRookA1Moved && chessBoard[7][3] == '' && chessBoard[7][2] == '' && chessBoard[7][1] == '') {
                    cellsToMove.push([[7],[2]]);
                }
            }

            if (!isBlackKingMoved && activeCell.dataset.cellPiece == 'Knb') {
                if (!isRookH8Moved && chessBoard[0][5] == '' && chessBoard[0][6] == '') {
                    cellsToMove.push([[0], [6]]);
                }
                if (!isRookA8Moved && chessBoard[0][3] == '' && chessBoard[0][2] == '' && chessBoard[0][1] == '') {
                    cellsToMove.push([[0], [2]]);
                }
            }

            directions.forEach(elem => {
                if (chessBoard[elem[0]]?.[elem[1]] === '') {
                    cellsToMove.push([[elem[0]],[elem[1]]]);
                } else if (chessBoard[elem[0]]?.[elem[1]]) {
                    if (chessBoard[elem[0]]?.[elem[1]].slice(-1) !== cell.dataset.cellPiece.slice(-1)) {
                        cellsToBeat.push([[elem[0]],[elem[1]]]);
                    }
                }
            });

            drawPossibleChessMoves(cellsToMove, cellsToBeat);
            break;
        }
        case 'q': {
            let cellsToMove = [];
            let cellsToBeat = [];
            let directions = [
                [-1, 0],
                [1, 0],
                [0, -1],
                [0, 1],
                [-1, -1],
                [-1, 1],
                [1, -1],
                [1, 1]
            ];

            for (const [dx, dy] of directions) {
                let i = 1;

                while (true) {
                    let newRow = row + dx * i;
                    let newCol = col + dy * i;

                    let cellToCheck = chessBoard[newRow]?.[newCol];

                    if (cellToCheck === undefined) break;

                    if (cellToCheck === '') {
                        cellsToMove.push([[newRow], [newCol]]);
                    } else {
                        if (chessBoard[newRow][newCol].slice(-1) !== cell.dataset.cellPiece.slice(-1)) {
                            cellsToBeat.push([[newRow],[newCol]]);
                        }
                        break;
                    }
                    i++;
                }
            }
            drawPossibleChessMoves(cellsToMove, cellsToBeat);
            break;
        }
    }
}

function drawPossibleChessMoves(positionsToCheck, positionsToBeat) {
    removePossibleMoves();
    console.log(positionsToCheck)

    positionsToCheck.forEach(elem => {
        let row = elem[0];
        let col = elem[1];

        let selectedCell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);

        if (isCheck(row, col)) {
            selectedCell.classList.add('chess__possible--move');
            selectedCell.setAttribute('onclick', 'moveChessPiece(this)')
        }
    });

    positionsToBeat.forEach(elem => {
        let row = elem[0];
        let col = elem[1];
        let selectedCell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);

        selectedCell.classList.add('chess__possible--beat');
        selectedCell.firstElementChild.setAttribute('onclick', 'beatChessPiece(this)');
    })
};

function isCheck(row, col) {
    let tempChessField = chessBoard.map(row => [...row]);
    tempChessField[row][col] = chessBoard[activeChessPiece[0]][activeChessPiece[1]];
    tempChessField[activeChessPiece[0]][activeChessPiece[1]] = '';

    let kingPos = currentColor == 'w' ? whiteKingPos : blackKingPos;
    
    let directionsB = [
        [-1, 1],
        [1, -1],
        [1, 1],
        [-1, -1]
    ];

    let directionsR = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
    ];

    let directionsK = [
        [kingPos[0] - 1, kingPos[1] - 2],
        [kingPos[0] - 1, kingPos[1] + 2],
        [kingPos[0] + 1, kingPos[1] - 2],
        [kingPos[0] + 1, kingPos[1] + 2],
        [kingPos[0] - 2, kingPos[1] - 1],
        [kingPos[0] - 2, kingPos[1] + 1],
        [kingPos[0] + 2, kingPos[1] - 1],
        [kingPos[0] + 2, kingPos[1] + 1]
    ];

    console.log(directionsK)

    for (const [dx, dy] of directionsB) {
        let i = 1;

        while (true) {
            let newRow = kingPos[0] + dx * i;
            let newCol = kingPos[1] + dy * i;

            let cellToCheck = tempChessField[newRow]?.[newCol];

            if (cellToCheck === undefined) break;

            if (cellToCheck != '') {
                if (cellToCheck.slice(-1) != currentColor && (cellToCheck.slice(0, cellToCheck.length - 1) == 'b' || cellToCheck.slice(0, cellToCheck.length - 1) == 'q')) {
                    return false;
                } else {
                    break;
                }
            }
            i++;
        }
    }

    for (const [dx, dy] of directionsR) {
        let i = 1;

        while (true) {
            let newRow = kingPos[0] + dx * i;
            let newCol = kingPos[1] + dy * i;

            let cellToCheck = tempChessField[newRow]?.[newCol];

            if (cellToCheck === undefined) break;

            if (cellToCheck != '') {
                if (cellToCheck.slice(-1) != currentColor) {
                    return false;
                } else {
                    break;
                }
            }
            i++;
        }
    }

    // directionsK.forEach(elem => {
    //     if (tempChessField[elem[0]]?.[elem[1]] != '') {
    //         if (tempChessField[elem[0]][elem[1]].slice(-1) != currentColor) {
    //             return false;
    //         }
    //     }
    // });

    return true;
}

function moveChessPiece(elem) {
    const img = document.createElement('img');

    img.src = `images/Chess/${chessBoard[activeChessPiece[0]][activeChessPiece[1]]}.png`;
    chessBoard[elem.dataset.row][elem.dataset.col] = chessBoard[activeChessPiece[0]][activeChessPiece[1]];
    img.dataset.cellPiece = chessBoard[activeChessPiece[0]][activeChessPiece[1]];
    if (chessBoard[activeChessPiece[0]][activeChessPiece[1]] == 'Knw') {
        whiteKingPos = [+elem.dataset.row, +elem.dataset.col];
    } else if (chessBoard[activeChessPiece[0]][activeChessPiece[1]] == 'Knb') {
        blackKingPos = [+elem.dataset.row, +elem.dataset.col];
    }
    console.log(whiteKingPos, blackKingPos)
    if (chessBoard[activeChessPiece[0]][activeChessPiece[1]] == 'Knw' && !isWhiteKingMoved) {
        isWhiteKingMoved = true;
        if (elem.dataset.row == 7 && elem.dataset.col == 6) {
            let rook = document.querySelector(`[data-row="7"][data-col="7"]`).firstElementChild;
            document.querySelector(`[data-row="7"][data-col="7"]`).firstElementChild.remove();
            chessBoard[7][7] = '';

            chessBoard[7][5] = 'rw';

            document.querySelector(`[data-row="7"][data-col="5"]`).appendChild(rook);
        } else if (elem.dataset.row == 7 && elem.dataset.col == 2) {
            let rook = document.querySelector(`[data-row="7"][data-col="0"]`).firstElementChild;
            document.querySelector(`[data-row="7"][data-col="0"]`).firstElementChild.remove();
            chessBoard[7][0] = '';

            chessBoard[7][3] = 'rw';

            document.querySelector(`[data-row="7"][data-col="3"]`).appendChild(rook);
        }
    }
    if (chessBoard[activeChessPiece[0]][activeChessPiece[1]] == 'Knb' && !isBlackKingMoved) {
        isBlackKingMoved = true;
        if (elem.dataset.row == 0 && elem.dataset.col == 6) {
            let rook = document.querySelector(`[data-row="0"][data-col="7"]`).firstElementChild;
            document.querySelector(`[data-row="0"][data-col="7"]`).firstElementChild.remove();
            chessBoard[0][7] = '';

            chessBoard[0][5] = 'rb';

            document.querySelector(`[data-row="0"][data-col="5"]`).appendChild(rook);
        } else if (elem.dataset.row == 0 && elem.dataset.col == 2) {
            let rook = document.querySelector(`[data-row="0"][data-col="0"]`).firstElementChild;
            document.querySelector(`[data-row="0"][data-col="0"]`).firstElementChild.remove();
            chessBoard[0][0] = '';

            chessBoard[0][3] = 'rb';

            document.querySelector(`[data-row="0"][data-col="3"]`).appendChild(rook);
        }
    }
    chessBoard[activeChessPiece[0]][activeChessPiece[1]] = '';
    activeCell.remove();
    img.setAttribute('onclick', 'activateChessPiece(this)');

    elem.appendChild(img);

    removePossibleMoves();

    changeCurrentColor();

    console.log(chessBoard)
}

function beatChessPiece(elem) {
    elem.src = `images/Chess/${chessBoard[activeChessPiece[0]][activeChessPiece[1]]}.png`;

    chessBoard[elem.parentElement.dataset.row][elem.parentElement.dataset.col] = chessBoard[activeChessPiece[0]][activeChessPiece[1]];
    elem.dataset.cellPiece = chessBoard[activeChessPiece[0]][activeChessPiece[1]];
    chessBoard[activeChessPiece[0]][activeChessPiece[1]] = '';
    activeCell.remove();

    removePossibleMoves();

    elem.setAttribute('onclick', 'activateChessPiece(this)');

    changeCurrentColor();
}

document.getElementById('chess-game').addEventListener('contextmenu', (event) => {
    if (event.target.classList.contains('chess__cell')) {
      event.preventDefault();
      event.target.classList.toggle('chess__cell--marked');
    }
  });

function removePossibleMoves() {
    document.querySelectorAll('.chess__possible--move').forEach(elem => {
        elem.classList.toggle('chess__possible--move');
        elem.setAttribute('onclick', '');
    })

    document.querySelectorAll('.chess__possible--beat').forEach(elem => {
        elem.classList.toggle('chess__possible--beat');
        elem.firstElementChild.setAttribute('onclick', 'activateChessPiece(this)');
    })
}

function changeCurrentColor() {
    if (color == 'w') currentColor = 'b';
    else currentColor = 'w';
}

/* Sollitaire */

function loadSollitaire() {
    initDrag(document.getElementById("sollitaire"), document.getElementsByClassName('sollitaire__header')[0])

    const sollitaire = document.getElementById('sollitaire');

    const suits = ['c', 'd', 'h', 's'];
    const values = [
        { label: '2', rank: 2 },
        { label: '3', rank: 3 },
        { label: '4', rank: 4 },
        { label: '5', rank: 5 },
        { label: '6', rank: 6 },
        { label: '7', rank: 7 },
        { label: '8', rank: 8 },
        { label: '9', rank: 9 },
        { label: '10', rank: 10 },
        { label: 'j', rank: 11 },
        { label: 'q', rank: 12 },
        { label: 'k', rank: 13 },
        { label: 'a', rank: 1 }
    ];
    const deck = [];

    for (const suit of suits) {
        for (const { label, rank } of values) {
            deck.push({
                value: label,
                rank,
                suit,
                color: suit === 'd' || suit === 'h' ? 'red' : 'black'
            })
        }
    }
    console.log(deck)

    shuffledDeck = shuffleDeck([...deck]);
    console.log(shuffledDeck)

    if (sollitaire.style.display == 'none') {
        sollitaire.style.display = 'flex';

        createFieldSollitaire(shuffledDeck);

        // const openMenuBtn = document.getElementById('minesweeper-game-menu');
        // const gameMenu = document.getElementById('ms-game-menu-active');

        // openMenuBtn.addEventListener("click", (event) => {
        //     gameMenu.style.display = 'inline-block'

        //     openMenuBtn.style.color = 'white';
        //     openMenuBtn.style.backgroundColor = '#000082';
        // });

        // document.addEventListener("click", (event) => {
        //     if (!openMenuBtn.contains(event.target)) {
        //         gameMenu.style.display = 'none';

        //         openMenuBtn.style.color = '';
        //         openMenuBtn.style.backgroundColor = '';
        //     }
        // });

        // document.getElementById('draggable-window').style.left = document.getElementById('minesweeper').offsetLeft + 'px';
        // document.getElementById('draggable-window').style.top = document.getElementById('minesweeper').offsetTop + 'px';
    }
}

function createFieldSollitaire(deck) {
    const tableau = document.getElementsByClassName('sollitaire__tableau')[0];
    let count = 0;

    for (let i = 0; i < 7; i++) {
        let pile = tableau.querySelector(`#pile-${i + 1}`);
        let frontCard = document.createElement('div');
        for (let j = 0; j < i; j++) {
            let card = document.createElement('div');
            card.dataset.cardId = count;
            card.classList.add('card__back');
            card.style.transform = `translateY(${j * 22}px)`;
            pile.appendChild(card);
            console.log(count)
            count++;
        }
        frontCard.dataset.cardId = count;
        frontCard.dataset.cardValue = deck[count].value + deck[count].suit;
        frontCard.classList.add('card__front');
        frontCard.style.transform = `translateY(${i * 22}px)`;
        frontCard.style.background = `url(images/cards/${frontCard.dataset.cardValue}.png)`;

        pile.appendChild(frontCard);

        frontCard.addEventListener('mousedown', function(event) {
            draggedCard = getSelfAndLowerSiblings(frontCard);

            sollitaireWindowX = document.getElementById('sollitaire').offsetLeft;
            sollitaireWindowY = document.getElementById('sollitaire').offsetTop;

            frontCard.style.pointerEvents = 'none';
            document.body.style.userSelect = 'none';
        });

        count++;
    }

    const stock = document.getElementsByClassName('sollitaire__stock')[0];

    for (let i = count + 1; i < shuffledDeck.length; i++) {
        let card = document.createElement('div');

        card.dataset.cardId = i;
        card.classList.add('card__back');
        card.setAttribute('onclick', "openCardFromStock(this)");

        stock.appendChild(card);
    }
}

function getSelfAndLowerSiblings(element) {
    const siblings = [element];
    let current = element.nextElementSibling;

    while (current) {
        siblings.push(current);
        current = current.nextElementSibling;
    }

    return siblings;
}

function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

let draggedCard = null;

document.addEventListener('mousemove', function(event) {
    if (draggedCard) {
        for (let i = 0; i < draggedCard.length; i++) {
            draggedCard[i].style.left = event.clientX - sollitaireWindowX - 46 + 'px';
            draggedCard[i].style.top = event.clientY - sollitaireWindowY - 11 + 'px';
            
            draggedCard[i].style.transform = `translateY(${i * 22}px)`;
            draggedCard[i].style.zIndex = i+1;
        }
    }
});

document.addEventListener('mouseup', function(event) {
    if (draggedCard) {
        let hoveredCard = document.elementFromPoint(event.clientX, event.clientY);
        let cardToApply = draggedCard[0];

        const currentPos = cardToApply.parentElement.getElementsByTagName('div').length - draggedCard.length;

        if (hoveredCard.classList.contains('card__front') && hoveredCard.parentElement.classList.contains('pile') && hoveredCard.parentElement.id !== draggedCard[0].parentElement.id) {
            if (shuffledDeck[hoveredCard.dataset.cardId].rank == shuffledDeck[draggedCard[0].dataset.cardId].rank + 1 && shuffledDeck[hoveredCard.dataset.cardId].color !== shuffledDeck[draggedCard[0].dataset.cardId].color) {
                let cardToOpen = draggedCard[0].previousElementSibling;
                if (cardToOpen) {
                    openNewCard(cardToOpen);
                }
                
                draggedCard.forEach(elem => {
                    elem.style.transform = `translateY(${hoveredCard.parentElement.getElementsByTagName('div').length * 22}px)`;
                    hoveredCard.parentElement.appendChild(elem);
                });
            } else {
                for (let i = 0; i < draggedCard.length; i++) {
                    draggedCard[i].style.transform = `translateY(${ (currentPos * 22) + (i * 22) }px)`;
                    draggedCard[i].style.left = '';
                    draggedCard[i].style.top = '';
                    draggedCard[i].style.pointerEvents = '';
                    draggedCard[i].style.zIndex = '';
                }
            }
        } else if (hoveredCard.classList.contains('foundation') && draggedCard.length == 1 && hoveredCard.getElementsByTagName('div').length == 0 && shuffledDeck[draggedCard[0].dataset.cardId].value == 'a') {
            if (draggedCard[0].previousElementSibling) {
                openNewCard(draggedCard[0].previousElementSibling);
            }

            hoveredCard.appendChild(draggedCard[0]);
        } else if (hoveredCard.parentElement.classList.contains('foundation') && draggedCard.length == 1 && shuffledDeck[draggedCard[0].dataset.cardId].rank == shuffledDeck[hoveredCard.dataset.cardId].rank + 1 && shuffledDeck[draggedCard[0].dataset.cardId].suit == shuffledDeck[hoveredCard.dataset.cardId].suit) {
            if (draggedCard[0].previousElementSibling) {
                openNewCard(draggedCard[0].previousElementSibling);
            }
    
            hoveredCard.parentElement.appendChild(draggedCard[0]);
        } else if (hoveredCard.classList.contains('pile') && hoveredCard.querySelectorAll('div').length == 0) {
            if (shuffledDeck[draggedCard[0].dataset.cardId].value == 'k') {
                let cardToOpen = draggedCard[0].previousElementSibling;
                if (cardToOpen) {
                    openNewCard(cardToOpen);
                }
                
                draggedCard.forEach((elem, index) => {
                    elem.style.transform = `translateY(${index * 22}px)`;
                    hoveredCard.appendChild(elem);
                });
            }
        } else {
            for (let i = 0; i < draggedCard.length; i++) {
                draggedCard[i].style.transform = `translateY(${ (currentPos * 22) + (i * 22) }px)`;
                draggedCard[i].style.left = '';
                draggedCard[i].style.top = '';
                draggedCard[i].style.pointerEvents = '';
                draggedCard[i].style.zIndex = '';
            }
        }

        for (let i = 0; i < draggedCard.length; i++) {
            draggedCard[i].style.left = '';
            draggedCard[i].style.top = '';
            draggedCard[i].style.pointerEvents = '';
            draggedCard[i].style.zIndex = '';
        }

        if (draggedCard[0].parentElement.classList.contains('sollitaire__waste')) {
            draggedCard[0].style.transform = 'translateY(0)'
        }

        document.body.style.userSelect = '';
        draggedCard = null;
    }
});

function openNewCard(cardToOpen) {
    cardToOpen.dataset.cardValue = shuffledDeck[cardToOpen.dataset.cardId].value + shuffledDeck[cardToOpen.dataset.cardId].suit;
    cardToOpen.style.background = `url(images/cards/${cardToOpen.dataset.cardValue}.png)`;
    cardToOpen.classList.remove('card__back');
    cardToOpen.classList.add('card__front');

    cardToOpen.addEventListener('mousedown', function(event) {
        draggedCard = getSelfAndLowerSiblings(cardToOpen);

        sollitaireWindowX = document.getElementById('sollitaire').offsetLeft;
        sollitaireWindowY = document.getElementById('sollitaire').offsetTop;

        cardToOpen.style.pointerEvents = 'none';
        document.body.style.userSelect = 'none';
    });
}

function openCardFromStock(card) {
    let waste = document.getElementsByClassName('sollitaire__waste')[0];

    openNewCard(card)

    waste.appendChild(card);
}

// Lumbejack

function loadLumberjack() {
    document.getElementById('lumberjack').style.display = 'flex';
}

// initDrag(document.getElementById("sollitaire"), document.getElementsByClassName('sollitaire__header')[0])

// function initDrag(windowElement, titleBar) {
//     const state = {
//         offsetX: 0,
//         offsetY: 0,
//         isDragging: false,
//         clicked: false,
//         initialLeft: 0,
//         initialTop: 0,
//         handlers: {}
//     };

//     state.handlers.mouseDown = (event) => handleMouseDown(event, windowElement, state);
//     state.handlers.mouseMove = (event) => handleMouseMove(event, windowElement, state);
//     state.handlers.mouseUp = (event) => handleMouseUp(event, windowElement, state);

//     titleBar.addEventListener('mousedown', state.handlers.mouseDown);
//     document.addEventListener('mousemove', state.handlers.mouseMove);
//     document.addEventListener('mouseup', state.handlers.mouseUp);

//     windowStates.set(windowElement, state);
// }

// function removeDrag(windowElement, titleBar) {
//     const state = windowStates.get(windowElement);

//     titleBar.removeEventListener('mousedown', state.handlers.mouseDown);
//     document.removeEventListener('mousemove', state.handlers.mouseMove);
//     document.removeEventListener('mouseup', state.handlers.mouseUp);

//     windowStates.delete(windowElement);
// }

// function dragWindow(windowElement, titleBar) {
//     mouseDownHandler = (event) => handleMouseDown(event, windowElement);
//     mouseMoveHandler = (event) => handleMouseMove(event, windowElement);
//     mouseUpHandler = (event) => handleMouseUp(event, windowElement);

//     titleBar.addEventListener("mousedown", mouseDownHandler);
//     document.addEventListener("mousemove", mouseMoveHandler);
//     document.addEventListener("mouseup", mouseUpHandler);
// }

// function dragWindowRemove(windowElement, titleBar) {
//     titleBar.removeEventListener("mousedown", (event) => handleMouseDown(event, windowElement));

//     document.removeEventListener("mousemove", (event) => handleMouseMove(event, windowElement));

//     document.removeEventListener("mouseup", (event) => handleMouseUp(event, windowElement));
// }

// function moveCard(event, windowElement, state) {
//     state.isDragging = true;
//     state.clicked = true;

//     state.offsetX = event.clientX - windowElement.offsetLeft;
//     state.offsetY = event.clientY - windowElement.offsetTop;

//     state.initialLeft = windowElement.offsetLeft;
//     state.initialTop = windowElement.offsetTop;

//     draggableWindow.style.display = 'block';
//     draggableWindow.style.width = windowElement.offsetWidth - 4 + 'px';
//     draggableWindow.style.height = windowElement.offsetHeight - 4 + 'px';

//     draggableWindow.style.left = `${state.initialLeft}px`;
//     draggableWindow.style.top = `${state.initialTop}px`;
// }

//
// function handleMouseMove(event, windowElement, state) {
//     if(state.isDragging) {
//         state.clicked = false;

//         let newTop = event.clientY - state.offsetY;

//         newTop = Math.max(newTop, 0);
//         newTop = Math.min(newTop, windowElement.offsetHeight + 400);

//         draggableWindow.style.left = `${event.clientX - state.offsetX}px`;
//         draggableWindow.style.top = `${newTop}px`;
//     }
// }


// function handleMouseUp(event, windowElement, state) {
//     document.body.style.userSelect = '';

//     if (state.isDragging && !state.clicked) {
//         console.log(draggableWindow.style.left, draggableWindow.style.top)
//         windowElement.style.left = draggableWindow.style.left;
//         windowElement.style.top = draggableWindow.style.top;
//     }

//     if (state.clicked) {
//         draggableWindow.style.display = 'none';
//     }
    
//     state.isDragging = false;
//     state.clicked = false;

//     draggableWindow.style.display = 'none';
// }