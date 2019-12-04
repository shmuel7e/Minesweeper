'use strict'
var gGame = {
    isOn: true,
};
var MARK = '🚩';
var MINE = '💣';
var LIVES = '🖤';
var HINTS = '💡';
var gElSafeClick;
var gElCurrentGameMode;
var gElLives;
var gElHints;
var gElMark;
var gElBoard;
var gElBestTime;
var gElResetGame;
var gElWatch;
var gHintFlag;
var gSafeClickFlag;
var gLives;
var gHints;
var gSafeClick;
var gMinutes;
var gSeconds;
var gMilliseconds;
var gTimeInterval;
var gMark;
var gCurrDifficulty;
var gSize;
var gMineAmount;
var gBoard;
var gFirstClick;
var gUnOpenedCells;
var gSafeCells;
var gGameMode;
var gGameModeFlag;
var gManualFlag;
var gPrevBoard;
var gPrevFirstClick;
var gPrevUnOpenedCells;
var gPrevLives;
var gPrevHints;
var gPrevMark;

function init() {
    gElLives = document.querySelector('.lives');
    gElHints = document.querySelector('.hints');
    gElSafeClick = document.querySelector('.safe-click-text');
    gElMark = document.querySelector('.score');
    gElBoard = document.getElementById("board");
    gElResetGame = document.querySelector('.game-over');
    gElWatch = document.querySelector('.watch');
    gElBestTime = document.querySelector('.best-time');
    gElCurrentGameMode = document.querySelector('.current-game-mode');
    localStorage.setItem('BestTime', Infinity);
    gCurrDifficulty = 'begginer';
    gGameMode = false; //true for Manual false for Auto
    gMinutes = 0;
    gSeconds = 0;
    gMilliseconds = 0;
    gTimeInterval = 0;
    gManualFlag = false;
    gFirstClick = true;
    gPrevFirstClick = gFirstClick;
    gHintFlag = false;
    gSafeClickFlag = false;
    gGameModeFlag = false;
    gSafeCells = [];
    setDifficulty(gCurrDifficulty);
    getSmiley('default');
    gBoard = createBoard();
    gPrevBoard = savePrevBoard();
    renderBoard();
}

function createBoard() {
    var board = [];
    for (var i = 0; i < gSize; i++) {
        board[i] = [];
        for (var j = 0; j < gSize; j++) {
            var cell = {
                id: { i, j },
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
                isHinted: false,
                isBeen: false,
                isSafe: false,
                isActive: false,
            }
            board[i][j] = cell;
        }
    }
    return board;
}

function renderBoard() {
    var strHTML = '';
    var content;
    var className;
    for (var i = 0; i < gSize; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < gSize; j++) {
            var cell = gBoard[i][j];
            cell.minesAroundCount = setMinesNegsCount(i, j);
            if (cell.isMarked) {
                content = MARK;
            } else if (cell.isMine) {
                cell.minesAroundCount = 0;
                content = MINE;
            } else if (!cell.minesAroundCount) {
                content = '';
            } else {
                content = cell.minesAroundCount;
            }
            className = (cell.isShown) ? 'shown ' : '';
            className += (cell.isMine) ? 'mine ' : '';
            className += (cell.isMarked) ? 'marked' : '';
            className += (cell.isSafe) ? 'safe' : '';
            className += `color${cell.minesAroundCount}" `;
            strHTML += `<td
            data-i=${i} data-j=${j}
            class="${className}" oncontextmenu="flagCell(event,${i},${j})" onclick="cellClicked(${i},${j})">${content}</td>\n`
        }
        strHTML += `</tr>\n`
    }
    gElMark.innerText = gMark;
    gElBoard.innerHTML = strHTML;
    renderGameMode();
    renderHints();
    renderLives();
    renderSafeClick();
}

function renderHints() {
    var hints = '';
    for (var i = 0; i < gHints; i++) {
        hints += HINTS;
    }
    gElHints.innerText = hints;
}

function renderLives() {
    var hearts = '';
    for (var i = 0; i < gLives; i++) {
        hearts += LIVES;
    }
    gElLives.innerText = hearts;
}

function renderSafeClick() {
    if (gSafeClick < 0) return;
    gElSafeClick.innerText = gSafeClick;
}

function renderTime() {
    gElWatch.innerText = (`0:0:00`);
}

function renderGameMode() {
    gElCurrentGameMode.innerText = (gGameModeFlag) ? 'Game Mode: Manual' : 'Game Mode: Auto';
}

function gameOver() {
    getSmiley('dead');
    revealAllMines();
    clearInterval(gTimeInterval);
    gGame.isOn = false;
}

function undo() {
    gBoard = gPrevBoard;
    gFirstClick = gPrevFirstClick;
    gUnOpenedCells = gPrevUnOpenedCells;
    gLives = gPrevLives;
    gHints = gPrevHints;
    gMark = gPrevMark;
    if (!gGame.isOn) {
        gGame.isOn = true;
        getSmiley('default');
    }
    renderBoard();
}

function resetGame() {
    clearInterval(gTimeInterval);
    setDifficulty(gCurrDifficulty);
    gSafeCells = [];
    gMinutes = 0;
    gSeconds = 0;
    gMilliseconds = 0;
    gTimeInterval = 0;
    gFirstClick = true;
    gGame.isOn = true;
    getSmiley('default');
    gBoard = createBoard();
    renderTime();
    renderBoard();
}

function autoBuildMode() {
    resetGame();
    renderGameMode();
    gGameModeFlag = false;
    gGameMode = false;
    renderBoard();
}

function manualBuildMode() {
    resetGame();
    renderGameMode();
    gGameModeFlag = true;
    gGameMode = true;
    renderBoard();

}

function checkDifficulty(elDifficulty) {
    var levelByUser = elDifficulty.id;
    switch (levelByUser) {
        case 'medium':
            setDifficulty(levelByUser);
        case 'expert':
            setDifficulty(levelByUser);
        default:
            setDifficulty(levelByUser);
    }
    resetGame();
}

function setDifficulty(levelByUser) {
    switch (levelByUser) {
        case 'medium':
            gSize = 8;
            gMineAmount = 12;
            gCurrDifficulty = 'medium';
            gMark = 12;
            gLives = 3;
            gHints = 3;
            gSafeClick = 3;
            gUnOpenedCells = 64;
            gGameMode = (gGameModeFlag) ? true : false;
            break;
        case 'expert':
            gSize = 12;
            gMineAmount = 30;
            gCurrDifficulty = 'expert';
            gMark = 30;
            gLives = 5;
            gHints = 5;
            gSafeClick = 5;
            gUnOpenedCells = 144;
            gGameMode = (gGameModeFlag) ? true : false;
            break;
        default:
            gSize = 4;
            gMineAmount = 2;
            gCurrDifficulty = 'begginer';
            gMark = 2;
            gLives = 2;
            gHints = 2;
            gSafeClick = 2;
            gUnOpenedCells = 16;
            gGameMode = (gGameModeFlag) ? true : false;
            break;
    }
    return;
}

function cellClicked(rowI, colJ) {
    var currCell = gBoard[rowI][colJ];
    gPrevBoard = savePrevBoard();
    if (!gGame.isOn) return;
    if (currCell.isMarked) return;
    if (gGameMode) { manualBuildBoard(currCell); return; }
    if (gFirstClick && gHintFlag) gameOn(currCell, rowI, colJ);
    if (gFirstClick && !gHintFlag) gameOn(currCell, rowI, colJ);
    if (gFirstClick && gManualFlag) gameOn(currCell, rowI, colJ);
    if (gHintFlag) useHint(rowI, colJ);
    else playMove(currCell, rowI, colJ);
}

function savePrevBoard() {
    var board = [];
    gPrevFirstClick = gFirstClick;
    gPrevLives = gLives;
    for (var i = 0; i < gBoard.length; i++) {
        board[i] = [];
        for (var j = 0; j < gBoard[i].length; j++) {
            board[i][j] = Object.assign({}, gBoard[i][j]);
        }
    }
    return board;
}

function manualBuildBoard(currCell) {
    if (gMineAmount > 0) {
        if (currCell.isMine) return;
        currCell.isMine = true;
        currCell.isShown = true;
        gMineAmount--;
        if (gMineAmount <= 0) {
            gGameMode = false;
            gManualFlag = true;
        }
        renderBoard();
        setTimeout(function() { hideManualSetBomb(currCell); }, 1200);
        renderBoard();
        return;
    }
}

function playMove(currCell, rowI, colJ) {
    if (!currCell.isShown) gUnOpenedCells--;
    currCell.isShown = true;
    renderBoard();
    if (!currCell.minesAroundCount && !currCell.isMine) revealOpenCells(rowI, colJ);
    renderBoard();
    if (currCell.isMine && !currCell.isActive) {
        giveLives();
        currCell.isActive = true;
        gPrevMark = gMark;
        gMark--;
    }
    renderBoard();
    if (checkIfGameWon()) winGame();
    if (currCell.isMine && !gLives) gameOver();
}


function gameOn(currCell, rowI, colJ) {
    if (gManualFlag && gHintFlag) {
        timeStart();
        useHint(rowI, colJ);
        return;
    }
    if (gManualFlag) {
        timeStart();
        gManualFlag = false;
        gFirstClick = false;
        return;
    }
    if (gHintFlag) {
        timeStart();
        addRandomMines(gBoard, rowI, colJ);
        useHint(rowI, colJ);
    } else {
        timeStart();
        gFirstClick = false;
        if (!currCell.isShown) gUnOpenedCells--;
        currCell.isShown = true;
        addRandomMines(gBoard, rowI, colJ);
        renderBoard();
        if (!currCell.minesAroundCount) revealOpenCells(rowI, colJ);
        renderBoard();
    }
}

function useHint(rowI, colJ) {
    gHintFlag = false;
    gFirstClick = false;
    gManualFlag = false;
    revealHint(rowI, colJ);
    renderBoard();
    setTimeout(function() { unRevealHint(rowI, colJ); }, 1500);
    renderBoard();
}

function useSafeClick() {
    if (gSafeClick < 0) return;
    gSafeCells = [];
    gSafeCells = findSafeCells();
    if (!gSafeCells.length) return;
    shuffleArray(gSafeCells);
    var currSafeCell = gSafeCells.pop();
    currSafeCell.isSafe = true;
    renderBoard();
    setTimeout(function() { hideSafeClick(currSafeCell); }, 1500);
    renderBoard();

}

function findSafeCells() {
    var safeCells = [];
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (!gBoard[i][j].isMine && !gBoard[i][j].isShown && !gBoard[i][j].isMarked) safeCells.push(gBoard[i][j]);
        }
    }
    return safeCells;
}


function hideSafeClick(currSafeCell) {
    currSafeCell.isSafe = false;
    renderBoard();
}

function hideManualSetBomb(currCell) {
    currCell.isShown = false;
    renderBoard();
}

function setMinesNegsCount(posI, posJ) {
    var counter = 0;
    for (var i = posI - 1; i <= posI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;

        for (var j = posJ - 1; j <= posJ + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue;
            if (i === posI && j === posJ) continue;

            if (gBoard[i][j].isMine)
                counter++
        }
    }
    return counter;
}

function revealOpenCells(posI, posJ) {
    if (gBoard[posI][posJ].minesAroundCount > 0) return;

    for (var i = posI - 1; i <= posI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = posJ - 1; j <= posJ + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue;
            if (i === posI && j === posJ) continue;
            if (!gBoard[i][j].isMine && !gBoard[i][j].isShown) {
                if (gBoard[i][j].isMarked) continue;
                gBoard[i][j].isShown = true;
                gUnOpenedCells--;
                revealOpenCells(i, j);
            }
        }
        renderBoard();
    }
}

function addRandomMines(board, rowI, colJ) {
    var size = board.length;
    var mineAmount = gMineAmount;

    for (var i = 0; i < size; i++) {
        while (mineAmount > 0) {
            var row = Math.floor(Math.random() * size);
            var col = Math.floor(Math.random() * size);
            while (board[row][col].isMine || board[row][col] === board[rowI][colJ]) {
                row = Math.floor(Math.random() * size);
                col = Math.floor(Math.random() * size);
            }
            board[row][col].isMine = true;
            mineAmount--;
        }
    }
    return board;
}

function revealAllMines() {
    for (var i = 0; i < gBoard.length; i++)
        for (var j = 0; j < gBoard.length; j++)
            if (gBoard[i][j].isMine && !gBoard[i][j].isMarked) gBoard[i][j].isShown = true;
    renderBoard();
}

function flagCell(ev, rowI, colJ) {
    ev.preventDefault();
    var currCell = gBoard[rowI][colJ];

    if (!gGame.isOn) return;
    if (currCell.isShown) return;

    if (!currCell.isMarked) {
        currCell.isMarked = true;
        gPrevMark = gMark;
        gMark--;
        renderBoard();
    } else if (!currCell.isMarked && currCell.isMine) {
        currCell.isMarked = true;
        gPrevMark = gMark;
        gMark--;
        renderBoard();
        return;
    } else {
        currCell.isMarked = false;
        gPrevMark = gMark;
        gMark++;
        renderBoard();
    }
    if (checkIfGameWon()) winGame();
    renderBoard();
}

function winGame() {
    gGame.isOn = false;
    getSmiley('winner');
    clearInterval(gTimeInterval);
    getBestTime();
}

function getBestTime() {
    var highScore;
    var BestTime = gMinutes * 60000 + gSeconds * 1000 + gMilliseconds;
    highScore = localStorage.getItem('BestTime');
    highScore = Math.min(BestTime, highScore);
    localStorage.setItem('BestTime', highScore);
    var bestTimeMin = Math.floor(highScore / 60000);
    var bestTimeSec = Math.floor(highScore / 1000);
    var bestTimeMili = highScore % 100;
    gElBestTime.innerText = 'Best TIME IS: ' + bestTimeMin + ':' + bestTimeSec + ':' + bestTimeMili;
}

function checkIfGameWon() {
    var count = 0;
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (gBoard[i][j].isMine && gBoard[i][j].isMarked) {
                count++;
            }
        }
    }
    renderBoard();
    if (gUnOpenedCells === count && !gMark) return true;
    return false;
}

function revealHint(posI, posJ) {
    if (!gBoard[posI][posJ].isShown && !gBoard[posI][posJ].isHinted && !gBoard[posI][posJ].isMarked) {
        gBoard[posI][posJ].isShown = true;
        gBoard[posI][posJ].isHinted = true;
    }
    for (var i = posI - 1; i <= posI + 1; i++) {

        if (i < 0 || i >= gBoard.length) continue;

        for (var j = posJ - 1; j <= posJ + 1; j++) {

            if (j < 0 || j >= gBoard[i].length) continue;
            if (i === posI && j === posJ) continue;

            if (!gBoard[i][j].isShown && !gBoard[i][j].isHinted && !gBoard[i][j].isMarked) {
                gBoard[i][j].isShown = true;
                gBoard[i][j].isHinted = true;
            }
        }
        renderBoard();
    }
}

function unRevealHint(posI, posJ) {
    if (gBoard[posI][posJ].isShown && gBoard[posI][posJ].isHinted && !gBoard[posI][posJ].isMarked) {
        gBoard[posI][posJ].isShown = false;
        gBoard[posI][posJ].isHinted = false;
    }
    for (var i = posI - 1; i <= posI + 1; i++) {

        if (i < 0 || i >= gBoard.length) continue;

        for (var j = posJ - 1; j <= posJ + 1; j++) {

            if (j < 0 || j >= gBoard[i].length) continue;
            if (i === posI && j === posJ) continue;

            if (gBoard[i][j].isShown && gBoard[i][j].isHinted && !gBoard[i][j].isMarked) {
                gBoard[i][j].isShown = false;
                gBoard[i][j].isHinted = false;
            }
        }
        renderBoard();
    }
}

function giveHints() {
    if (!gGame.isOn) return;
    gPrevHints = gHints;
    gHintFlag = true;
    gHints--;
    renderBoard();
}

function giveLives() {
    if (!gGame.isOn) return;
    gLives--;
    renderBoard();
}

function giveSafeClick() {
    if (!gGame.isOn) return;
    gSafeClick--;
    gSafeClickFlag = true;
    useSafeClick();
    renderBoard();
}

function getSmiley(smileyCase) {
    switch (smileyCase) {
        case 'dead':
            gElResetGame.innerHTML = (`<div class="game-over">
                <button class="reset-game" onclick="resetGame()"> 😵 </button></div>`);
            break;
        case 'winner':
            gElResetGame.innerHTML = (`<div class="game-over">
                <button class="reset-game" onclick="resetGame()"> 😎 </button></div>`);
            break;
        default:
            gElResetGame.innerHTML = (`<div class="game-over">
                <button class="reset-game" onclick="resetGame()"> 🙃 </button></div>`);
            break;
    }
}