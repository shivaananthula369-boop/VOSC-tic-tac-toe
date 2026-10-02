/* =========================================
   ULTIMATE TIC-TAC-TOE
   VOSC ACTIVITY 1
   MASTER JAVASCRIPT
   ========================================= */


/* =========================================
   ELEMENTS
   ========================================= */

const boardElement =
    document.getElementById("board");

const cells =
    document.querySelectorAll(".cell");

const turnText =
    document.getElementById("turnText");

const thinking =
    document.getElementById("thinking");

const xScore =
    document.getElementById("xScore");

const oScore =
    document.getElementById("oScore");

const wins =
    document.getElementById("wins");

const losses =
    document.getElementById("losses");

const draws =
    document.getElementById("draws");

const winRate =
    document.getElementById("winRate");

const roundText =
    document.getElementById("roundText");

const playerOneName =
    document.getElementById("playerOneName");

const playerTwoName =
    document.getElementById("playerTwoName");

const difficulty =
    document.getElementById("difficulty");

const difficultyGroup =
    document.getElementById("difficultyGroup");

const themeSelect =
    document.getElementById("themeSelect");

const themeCycleBtn =
    document.getElementById("themeCycleBtn");

const soundBtn =
    document.getElementById("soundBtn");

const undoBtn =
    document.getElementById("undoBtn");

const newRoundBtn =
    document.getElementById("newRoundBtn");

const resetBtn =
    document.getElementById("resetBtn");

const modeButtons =
    document.querySelectorAll(".mode-btn");

const probabilityValue =
    document.getElementById(
        "probabilityValue"
    );

const probabilityBar =
    document.getElementById(
        "probabilityBar"
    );

const positionStatus =
    document.getElementById(
        "positionStatus"
    );

const bestMove =
    document.getElementById(
        "bestMove"
    );

const movesCount =
    document.getElementById(
        "movesCount"
    );

const analysisTitle =
    document.getElementById(
        "analysisTitle"
    );

const positionEmoji =
    document.getElementById(
        "positionEmoji"
    );

const resultModal =
    document.getElementById(
        "resultModal"
    );

const resultIcon =
    document.getElementById(
        "resultIcon"
    );

const resultTitle =
    document.getElementById(
        "resultTitle"
    );

const resultMessage =
    document.getElementById(
        "resultMessage"
    );

const modalNewRound =
    document.getElementById(
        "modalNewRound"
    );

const confetti =
    document.getElementById(
        "confetti"
    );


/* =========================================
   GAME STATE
   ========================================= */

let board = [
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    ""
];

let currentPlayer = "X";

let gameActive = true;

let gameMode = "ai";

let aiDifficulty = "hard";

let round = 1;

let aiThinking = false;

let soundEnabled = true;

let aiTimer = null;

let history = [];


/* =========================================
   SCORES
   ========================================= */

let scores = {

    x: 0,

    o: 0,

    wins: 0,

    losses: 0,

    draws: 0

};


/* =========================================
   WINNING PATTERNS
   ========================================= */

const winningPatterns = [

    [0, 1, 2],

    [3, 4, 5],

    [6, 7, 8],

    [0, 3, 6],

    [1, 4, 7],

    [2, 5, 8],

    [0, 4, 8],

    [2, 4, 6]

];


/* =========================================
   CELL NAMES
   ========================================= */

const cellNames = [

    "Top Left",

    "Top Center",

    "Top Right",

    "Middle Left",

    "Center",

    "Middle Right",

    "Bottom Left",

    "Bottom Center",

    "Bottom Right"

];


/* =========================================
   THEMES
   ========================================= */

const themes = [

    "neon",

    "ocean",

    "sunset",

    "emerald"

];

let currentThemeIndex = 0;


/* =========================================
   AUDIO
   ========================================= */

let audioContext = null;


function playSound(type) {

    if (!soundEnabled) {
        return;
    }


    try {

        if (!audioContext) {

            audioContext =
                new (
                    window.AudioContext ||
                    window.webkitAudioContext
                )();

        }


        const oscillator =
            audioContext.createOscillator();

        const gain =
            audioContext.createGain();


        oscillator.connect(gain);

        gain.connect(
            audioContext.destination
        );


        let frequency = 440;

        let duration = 0.12;


        if (type === "click") {

            frequency = 520;

            duration = 0.08;

        }


        if (type === "win") {

            frequency = 760;

            duration = 0.22;

        }


        if (type === "lose") {

            frequency = 180;

            duration = 0.25;

        }


        if (type === "draw") {

            frequency = 340;

            duration = 0.18;

        }


        oscillator.frequency.value =
            frequency;


        oscillator.type =
            type === "win"
                ? "sine"
                : "triangle";


        gain.gain.setValueAtTime(

            0.0001,

            audioContext.currentTime

        );


        gain.gain.exponentialRampToValueAtTime(

            0.12,

            audioContext.currentTime + 0.02

        );


        gain.gain.exponentialRampToValueAtTime(

            0.0001,

            audioContext.currentTime +
            duration

        );


        oscillator.start();


        oscillator.stop(

            audioContext.currentTime +
            duration

        );

    }

    catch (error) {

        console.log(
            "Audio not available."
        );

    }

}


/* =========================================
   SAVE DATA
   ========================================= */

function saveData() {

    localStorage.setItem(

        "voscTicTacToeScores",

        JSON.stringify(scores)

    );


    localStorage.setItem(

        "voscTicTacToeTheme",

        document.body.dataset.theme

    );

}


/* =========================================
   LOAD DATA
   ========================================= */

function loadData() {

    try {

        const savedScores =
            localStorage.getItem(
                "voscTicTacToeScores"
            );


        if (savedScores) {

            const parsed =
                JSON.parse(savedScores);


            scores = {

                x: parsed.x || 0,

                o: parsed.o || 0,

                wins: parsed.wins || 0,

                losses: parsed.losses || 0,

                draws: parsed.draws || 0

            };

        }


        const savedTheme =
            localStorage.getItem(
                "voscTicTacToeTheme"
            );


        if (savedTheme &&
            themes.includes(savedTheme)) {

            document.body.dataset.theme =
                savedTheme;

            themeSelect.value =
                savedTheme;

            currentThemeIndex =
                themes.indexOf(
                    savedTheme
                );

        }

    }

    catch (error) {

        console.log(
            "Saved data could not be loaded."
        );

    }


    updateScoreboard();

}


/* =========================================
   BOARD CLICK
   ========================================= */

/*
   IMPORTANT:
   We use ONE listener on the board.

   This prevents individual-cell
   linking/clicking problems.
*/

boardElement.addEventListener(
    "click",
    function (event) {

        const cell =
            event.target.closest(".cell");


        if (!cell) {
            return;
        }


        if (!boardElement.contains(cell)) {
            return;
        }


        const index =
            Number(
                cell.dataset.index
            );


        makePlayerMove(index);

    }
);


/* =========================================
   PLAYER MOVE
   ========================================= */

function makePlayerMove(index) {

    if (!gameActive) {
        return;
    }


    if (aiThinking) {
        return;
    }


    if (board[index] !== "") {
        return;
    }


    /*
       Store state BEFORE move.
       This powers Undo.
    */

    history.push({

        board: [...board],

        player: currentPlayer

    });


    board[index] =
        currentPlayer;


    playSound("click");


    renderBoard();


    const result =
        checkGame(board);


    if (result) {

        finishGame(result);

        return;

    }


    updateAnalysis();


    /*
       AI MODE
    */

    if (
        gameMode === "ai"
    ) {

        currentPlayer = "O";

        updateTurn();

        startAI();

        return;

    }


    /*
       PLAYER VS PLAYER
    */

    currentPlayer =
        currentPlayer === "X"
            ? "O"
            : "X";


    updateTurn();

}


/* =========================================
   START AI
   ========================================= */

function startAI() {

    if (!gameActive) {
        return;
    }


    aiThinking = true;


    thinking.classList.remove(
        "hidden"
    );


    updateTurn();


    aiTimer = setTimeout(
        function () {

            if (!gameActive) {
                return;
            }


            const move =
                getAIMove();


            if (move !== -1) {

                /*
                   AI does NOT create a
                   separate undo state.
                */

                board[move] = "O";


                playSound("click");


                renderBoard();

            }


            aiThinking = false;


            thinking.classList.add(
                "hidden"
            );


            const result =
                checkGame(board);


            if (result) {

                finishGame(result);

                return;

            }


            currentPlayer = "X";


            updateTurn();


            updateAnalysis();

        },

        500

    );

}


/* =========================================
   AI MOVE SELECTOR
   ========================================= */

function getAIMove() {

    const available =
        getAvailableMoves(board);


    if (
        available.length === 0
    ) {

        return -1;

    }


    if (
        aiDifficulty === "easy"
    ) {

        return randomMove();

    }


    if (
        aiDifficulty === "medium"
    ) {

        return mediumMove();

    }


    /*
       HARD and IMPOSSIBLE
       use minimax.

       Impossible also uses optimal
       play with center/corner priority.
    */

    return minimaxRoot(
        [...board]
    );

}


/* =========================================
   EASY AI
   ========================================= */

function randomMove() {

    const available =
        getAvailableMoves(board);


    if (
        available.length === 0
    ) {

        return -1;

    }


    return available[
        Math.floor(
            Math.random() *
            available.length
        )
    ];

}


/* =========================================
   MEDIUM AI
   ========================================= */

function mediumMove() {

    /*
       First try to win.
    */

    const winningMove =
        findWinningMove(
            board,
            "O"
        );


    if (
        winningMove !== -1
    ) {

        return winningMove;

    }


    /*
       Then block player.
    */

    const blockingMove =
        findWinningMove(
            board,
            "X"
        );


    if (
        blockingMove !== -1
    ) {

        return blockingMove;

    }


    /*
       Take center.
    */

    if (
        board[4] === ""
    ) {

        return 4;

    }


    /*
       Otherwise random.
    */

    return randomMove();

}


/* =========================================
   MINIMAX ROOT
   ========================================= */

function minimaxRoot(position) {

    const available =
        getAvailableMoves(position);


    let bestScore =
        -Infinity;


    let bestMoves = [];


    for (
        const index
        of available
    ) {

        position[index] =
            "O";


        const score =
            minimax(
                position,
                0,
                false
            );


        position[index] =
            "";


        if (
            score > bestScore
        ) {

            bestScore =
                score;

            bestMoves = [
                index
            ];

        }

        else if (
            score === bestScore
        ) {

            bestMoves.push(
                index
            );

        }

    }


    /*
       Impossible mode uses deterministic
       priority where possible.
    */

    if (
        aiDifficulty === "impossible"
    ) {

        const priority =
            [
                4,
                0,
                2,
                6,
                8,
                1,
                3,
                5,
                7
            ];


        for (
            const index
            of priority
        ) {

            if (
                bestMoves.includes(
                    index
                )
            ) {

                return index;

            }

        }

    }


    return bestMoves[
        Math.floor(
            Math.random() *
            bestMoves.length
        )
    ];

}


/* =========================================
   MINIMAX
   ========================================= */

function minimax(
    position,
    depth,
    maximizing
) {

    const result =
        evaluatePosition(
            position
        );


    if (
        result !== null
    ) {

        if (
            result === 10
        ) {

            return 10 - depth;

        }


        if (
            result === -10
        ) {

            return -10 + depth;

        }


        return 0;

    }


    if (maximizing) {

        let bestScore =
            -Infinity;


        for (
            const index
            of getAvailableMoves(
                position
            )
        ) {

            position[index] =
                "O";


            const score =
                minimax(
                    position,
                    depth + 1,
                    false
                );


            position[index] =
                "";


            bestScore =
                Math.max(
                    bestScore,
                    score
                );

        }


        return bestScore;

    }


    else {

        let bestScore =
            Infinity;


        for (
            const index
            of getAvailableMoves(
                position
            )
        ) {

            position[index] =
                "X";


            const score =
                minimax(
                    position,
                    depth + 1,
                    true
                );


            position[index] =
                "";


            bestScore =
                Math.min(
                    bestScore,
                    score
                );

        }


        return bestScore;

    }

}


/* =========================================
   EVALUATE POSITION
   ========================================= */

function evaluatePosition(
    position
) {

    for (
        const pattern
        of winningPatterns
    ) {

        const [a, b, c] =
            pattern;


        if (
            position[a] !== "" &&
            position[a] === position[b] &&
            position[a] === position[c]
        ) {

            return position[a] === "O"
                ? 10
                : -10;

        }

    }


    if (
        position.every(
            value =>
                value !== ""
        )
    ) {

        return 0;

    }


    return null;

}


/* =========================================
   GET AVAILABLE MOVES
   ========================================= */

function getAvailableMoves(
    position
) {

    const moves = [];


    position.forEach(
        function (value, index) {

            if (
                value === ""
            ) {

                moves.push(index);

            }

        }
    );


    return moves;

}


/* =========================================
   FIND WINNING MOVE
   ========================================= */

function findWinningMove(
    position,
    player
) {

    const available =
        getAvailableMoves(
            position
        );


    for (
        const index
        of available
    ) {

        const copy =
            [...position];


        copy[index] =
            player;


        const result =
            evaluatePosition(
                copy
            );


        if (
            player === "O" &&
            result === 10
        ) {

            return index;

        }


        if (
            player === "X" &&
            result === -10
        ) {

            return index;

        }

    }


    return -1;

}


/* =========================================
   CHECK GAME
   ========================================= */

function checkGame(
    position
) {

    for (
        const pattern
        of winningPatterns
    ) {

        const [a, b, c] =
            pattern;


        if (
            position[a] !== "" &&
            position[a] === position[b] &&
            position[a] === position[c]
        ) {

            return {

                winner:
                    position[a],

                pattern:
                    pattern

            };

        }

    }


    if (
        position.every(
            value =>
                value !== ""
        )
    ) {

        return {

            winner:
                "draw",

            pattern:
                []

        };

    }


    return null;

}


/* =========================================
   FINISH GAME
   ========================================= */

function finishGame(
    result
) {

    gameActive = false;

    aiThinking = false;


    clearTimeout(
        aiTimer
    );


    thinking.classList.add(
        "hidden"
    );


    if (
        result.winner === "draw"
    ) {

        scores.draws++;


        playSound(
            "draw"
        );


        resultIcon.textContent =
            "🤝";


        resultTitle.textContent =
            "It's a Draw!";


        resultMessage.textContent =
            "Perfectly balanced. Another round?";


        analysisTitle.textContent =
            "Dead even";

        positionStatus.textContent =
            "Draw";

        positionEmoji.textContent =
            "🤝";

    }


    else {

        highlightWinner(
            result.pattern
        );


        if (
            gameMode === "ai"
        ) {

            if (
                result.winner === "X"
            ) {

                scores.x++;

                scores.wins++;


                playSound(
                    "win"
                );


                resultIcon.textContent =
                    "🏆";


                resultTitle.textContent =
                    "You Win!";


                resultMessage.textContent =
                    "Brilliant! You outplayed the AI.";


                analysisTitle.textContent =
                    "Victory";

                positionStatus.textContent =
                    "Winning";

                positionEmoji.textContent =
                    "🔥";


                createConfetti();

            }


            else {

                scores.o++;

                scores.losses++;


                playSound(
                    "lose"
                );


                resultIcon.textContent =
                    "🤖";


                resultTitle.textContent =
                    "AI Wins!";


                resultMessage.textContent =
                    "Good game. Try another round!";


                analysisTitle.textContent =
                    "AI victory";

                positionStatus.textContent =
                    "Defeated";

                positionEmoji.textContent =
                    "🤖";

            }

        }


        else {

            if (
                result.winner === "X"
            ) {

                scores.x++;

            }

            else {

                scores.o++;

            }


            playSound(
                "win"
            );


            resultIcon.textContent =
                "🏆";


            resultTitle.textContent =
                `Player ${result.winner} Wins!`;


            resultMessage.textContent =
                "What a finish!";


            createConfetti();

        }

    }


    saveData();


    updateScoreboard();


    updateAnalysis();


    setTimeout(
        function () {

            resultModal.classList.remove(
                "hidden"
            );

        },

        450

    );

}


/* =========================================
   HIGHLIGHT WINNER
   ========================================= */

function highlightWinner(
    pattern
) {

    pattern.forEach(
        function (index) {

            cells[index]
                .classList.add(
                    "winner"
                );

        }
    );

}


/* =========================================
   RENDER BOARD
   ========================================= */

function renderBoard() {

    cells.forEach(
        function (cell, index) {

            const value =
                board[index];


            cell.textContent =
                value;


            cell.classList.remove(
                "x",
                "o",
                "filled",
                "winner"
            );


            if (
                value === "X"
            ) {

                cell.classList.add(
                    "x",
                    "filled"
                );

            }


            if (
                value === "O"
            ) {

                cell.classList.add(
                    "o",
                    "filled"
                );

            }

        }
    );


    const moveCount =
        board.filter(
            Boolean
        ).length;


    movesCount.textContent =
        `${moveCount} / 9`;

}


/* =========================================
   TURN DISPLAY
   ========================================= */

function updateTurn() {

    if (
        !gameActive
    ) {

        return;

    }


    if (
        aiThinking
    ) {

        turnText.textContent =
            "AI is thinking...";

        return;

    }


    if (
        gameMode === "pvp"
    ) {

        turnText.textContent =
            currentPlayer === "X"
                ? "Player X's turn"
                : "Player O's turn";

        return;

    }


    turnText.textContent =
        currentPlayer === "X"
            ? "Your turn"
            : "AI's turn";

}


/* =========================================
   NEW ROUND
   ========================================= */

function newRound() {

    clearTimeout(
        aiTimer
    );


    resultModal.classList.add(
        "hidden"
    );


    confetti.innerHTML =
        "";


    board = [
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        ""
    ];


    currentPlayer =
        "X";


    gameActive =
        true;


    aiThinking =
        false;


    history = [];


    thinking.classList.add(
        "hidden"
    );


    round++;


    renderBoard();


    updateTurn();


    updateScoreboard();


    updateAnalysis();

}


/* =========================================
   UNDO
   ========================================= */

function undoMove() {

    if (
        history.length === 0
    ) {

        return;

    }


    clearTimeout(
        aiTimer
    );


    aiThinking =
        false;


    thinking.classList.add(
        "hidden"
    );


    /*
       In AI mode, one Undo removes
       the human move and the AI move.

       We restore the last saved state.
    */

    const previous =
        history.pop();


    board =
        [...previous.board];


    currentPlayer =
        previous.player;


    gameActive =
        true;


    renderBoard();


    updateTurn();


    updateAnalysis();


    playSound(
        "click"
    );

}


/* =========================================
   RESET SCORE
   ========================================= */

function resetScore() {

    const confirmed =
        confirm(
            "Reset all scores and statistics?"
        );


    if (!confirmed) {
        return;
    }


    scores = {

        x: 0,

        o: 0,

        wins: 0,

        losses: 0,

        draws: 0

    };


    saveData();


    updateScoreboard();


    newRound();

}


/* =========================================
   SCOREBOARD
   ========================================= */

function updateScoreboard() {

    xScore.textContent =
        scores.x;


    oScore.textContent =
        scores.o;


    wins.textContent =
        scores.wins;


    losses.textContent =
        scores.losses;


    draws.textContent =
        scores.draws;


    const totalGames =
        scores.wins +
        scores.losses +
        scores.draws;


    let percentage = 0;


    if (
        totalGames > 0
    ) {

        percentage =
            Math.round(
                (
                    scores.wins /
                    totalGames
                ) * 100
            );

    }


    winRate.textContent =
        `${percentage}%`;


    roundText.textContent =
        `ROUND ${round}`;

}


/* =========================================
   ANALYSIS
   ========================================= */

function updateAnalysis() {

    const moveCount =
        board.filter(
            Boolean
        ).length;


    movesCount.textContent =
        `${moveCount} / 9`;


    if (
        !gameActive
    ) {

        probabilityValue.textContent =
            "—";


        probabilityBar.style.width =
            "50%";


        bestMove.textContent =
            "Finished";


        return;

    }


    if (
        moveCount === 0
    ) {

        probabilityValue.textContent =
            "50%";


        probabilityBar.style.width =
            "50%";


        positionStatus.textContent =
            "Balanced";


        bestMove.textContent =
            "Center";


        analysisTitle.textContent =
            "Balanced position";


        positionEmoji.textContent =
            "🎯";


        return;

    }


    let xThreats = 0;

    let oThreats = 0;


    for (
        const pattern
        of winningPatterns
    ) {

        const values =
            pattern.map(
                index =>
                    board[index]
            );


        const xCount =
            values.filter(
                value =>
                    value === "X"
            ).length;


        const oCount =
            values.filter(
                value =>
                    value === "O"
            ).length;


        const emptyCount =
            values.filter(
                value =>
                    value === ""
            ).length;


        if (
            xCount === 2 &&
            emptyCount === 1
        ) {

            xThreats++;

        }


        if (
            oCount === 2 &&
            emptyCount === 1
        ) {

            oThreats++;

        }

    }


    let probability =
        50;


    let status =
        "Balanced";


    let emoji =
        "🎯";


    if (
        xThreats > oThreats
    ) {

        probability =
            Math.min(
                92,
                50 +
                xThreats * 14
            );


        status =
            "You have the edge";


        emoji =
            "🔥";


        analysisTitle.textContent =
            "Favorable position";

    }


    else if (
        oThreats > xThreats
    ) {

        probability =
            Math.max(
                8,
                50 -
                oThreats * 14
            );


        status =
            "AI has the edge";


        emoji =
            "⚠️";


        analysisTitle.textContent =
            "Danger zone";

    }


    else {

        analysisTitle.textContent =
            "Balanced position";

    }


    probabilityValue.textContent =
        `${probability}%`;


    probabilityBar.style.width =
        `${probability}%`;


    positionStatus.textContent =
        status;


    positionEmoji.textContent =
        emoji;


    /*
       Best move.
    */

    if (
        gameMode === "ai"
    ) {

        const best =
            aiDifficulty === "easy"
                ? randomMoveForAnalysis()
                : aiDifficulty === "medium"
                    ? mediumMoveForAnalysis()
                    : minimaxRoot(
                        [...board]
                    );


        if (
            best !== -1 &&
            best !== undefined
        ) {

            bestMove.textContent =
                cellNames[best];

        }

    }

    else {

        bestMove.textContent =
            currentPlayer === "X"
                ? "Player X"
                : "Player O";

    }

}


/* =========================================
   ANALYSIS RANDOM MOVE
   ========================================= */

function randomMoveForAnalysis() {

    const available =
        getAvailableMoves(
            board
        );


    if (
        available.length === 0
    ) {

        return -1;

    }


    return available[0];

}


/* =========================================
   ANALYSIS MEDIUM MOVE
   ========================================= */

function mediumMoveForAnalysis() {

    const win =
        findWinningMove(
            board,
            "O"
        );


    if (
        win !== -1
    ) {

        return win;

    }


    const block =
        findWinningMove(
            board,
            "X"
        );


    if (
        block !== -1
    ) {

        return block;

    }


    if (
        board[4] === ""
    ) {

        return 4;

    }


    return randomMoveForAnalysis();

}


/* =========================================
   THEME
   ========================================= */

themeSelect.addEventListener(
    "change",
    function () {

        applyTheme(
            this.value
        );

    }
);


themeCycleBtn.addEventListener(
    "click",
    function () {

        currentThemeIndex++;


        if (
            currentThemeIndex >=
            themes.length
        ) {

            currentThemeIndex = 0;

        }


        const theme =
            themes[
                currentThemeIndex
            ];


        themeSelect.value =
            theme;


        applyTheme(
            theme
        );


        playSound(
            "click"
        );

    }
);


function applyTheme(theme) {

    if (
        !themes.includes(theme)
    ) {

        theme = "neon";

    }


    document.body.dataset.theme =
        theme;


    themeSelect.value =
        theme;


    currentThemeIndex =
        themes.indexOf(
            theme
        );


    saveData();

}


/* =========================================
   SOUND BUTTON
   ========================================= */

soundBtn.addEventListener(
    "click",
    function () {

        soundEnabled =
            !soundEnabled;


        soundBtn.textContent =
            soundEnabled
                ? "🔊"
                : "🔇";


        if (
            soundEnabled
        ) {

            playSound(
                "click"
            );

        }

    }
);


/* =========================================
   MODE BUTTONS
   ========================================= */

modeButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                modeButtons.forEach(
                    function (btn) {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                gameMode =
                    button.dataset.mode;


                if (
                    gameMode === "pvp"
                ) {

                    playerOneName.textContent =
                        "PLAYER X";


                    playerTwoName.textContent =
                        "PLAYER O";


                    difficultyGroup.style.display =
                        "none";

                }


                else {

                    playerOneName.textContent =
                        "YOU";


                    playerTwoName.textContent =
                        "AI";


                    difficultyGroup.style.display =
                        "block";

                }


                newRound();

            }
        );

    }
);


/* =========================================
   DIFFICULTY
   ========================================= */

difficulty.addEventListener(
    "change",
    function () {

        aiDifficulty =
            this.value;


        newRound();

    }
);


/* =========================================
   BUTTON EVENTS
   ========================================= */

newRoundBtn.addEventListener(
    "click",
    function () {

        newRound();

    }
);


undoBtn.addEventListener(
    "click",
    function () {

        undoMove();

    }
);


resetBtn.addEventListener(
    "click",
    function () {

        resetScore();

    }
);


modalNewRound.addEventListener(
    "click",
    function () {

        newRound();

    }
);


/* =========================================
   KEYBOARD SHORTCUTS
   ========================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "r" ||
            event.key === "R"
        ) {

            newRound();

        }


        if (
            event.key === "u" ||
            event.key === "U"
        ) {

            undoMove();

        }

    }
);


/* =========================================
   CONFETTI
   ========================================= */

function createConfetti() {

    confetti.innerHTML =
        "";


    const pieces =
        70;


    for (
        let i = 0;
        i < pieces;
        i++
    ) {

        const piece =
            document.createElement(
                "div"
            );


        piece.className =
            "confetti-piece";


        piece.style.left =
            `${Math.random() * 100}%`;


        piece.style.background =
            getConfettiColor();


        piece.style.animationDelay =
            `${Math.random() * 0.6}s`;


        piece.style.transform =
            `rotate(${Math.random() * 360}deg)`;


        confetti.appendChild(
            piece
        );

    }


    setTimeout(
        function () {

            confetti.innerHTML =
                "";

        },

        2800
    );

}


function getConfettiColor() {

    const colors = [

        "#55d9ff",

        "#ff69b7",

        "#785cff",

        "#23d5ab",

        "#ffd166",

        "#ffffff"

    ];


    return colors[
        Math.floor(
            Math.random() *
            colors.length
        )
    ];

}


/* =========================================
   INITIALIZE
   ========================================= */

loadData();


renderBoard();


updateTurn();


updateAnalysis();


updateScoreboard();