/* Downrush JavaScript */

/*

TODO:
- down arrow or spacebar makes letter fall all the way down
- show next letter coming up
- show letter value on letter
- bombs to explode a bunch of letters

*/

var PIECE_WIDTH = 50;
var PIECE_HEIGHT = 50;
var BOARD_WIDTH = 9;
var BOARD_HEIGHT = 10;
var DOWN_STEP = 2;
var MIN_WORD_LENGTH = 3;
var BUTTON_DELAY = 150;
var WORDS = null;

// Scrabble letter distribution
var LETTERS = "AAAAAAAAABBCCDDDDEEEEEEEEEEEEFFGGGHHIIIIIIIIIJKLLLLMMNNNNNNOOOOOOOOPPQRRRRRRSSSSTTTTTTUUUUVVWWXYYZ";
var SCORES = {
    'E': 1, 'A': 1, 'I': 1, 'O': 1, 'N': 1, 'R': 1, 'T': 1, 'L': 1, 'S': 1, 'U': 1,
    'D': 2, 'G': 2,
    'B': 3, 'C': 3, 'M': 3, 'P': 3,
    'F': 4, 'H': 4, 'V': 4, 'W': 4, 'Y': 4,
    'K': 5,
    'J': 8, 'X': 8,
    'Q': 10, 'Z': 10
};

var currentPiece;
var board;  // null when empty, uppercase letter when placed, lowercase letter when used in a word
var leftPressed = false;
var rightPressed = false;

$(document).ready(function() {
    function initWords() {
        WORDS = {};
        for (var i = 0; i < WORDLIST.length; i++) {
            WORDS[WORDLIST[i]] = true;
        }
    }

    function initBoard() {
        currentPiece = null;
        board = [];
        for (var y = 0; y < BOARD_HEIGHT; y++) {
            var row = [];
            for (var x = 0; x < BOARD_WIDTH; x++) {
                row.push(null);
                $('#' + makeId(x, y)).remove();
            }
            board.push(row);
        }
    }

    function addToScore(n) {
        var scoreSpan = $('#score');
        var score = parseInt(scoreSpan.text(), 10);
        scoreSpan.text((score + n).toString());
    }

    function resetScore() {
        $('#score').text('0');
    }

    function makeId(x, y) {
        return 'piece_' + x.toString() + '_' + y.toString();
    }

    function createNewPiece() {
        var x = Math.floor(BOARD_WIDTH / 2);
        if (board[0][x]) {
            return false;
        }
        var letter = LETTERS.charAt(Math.floor(Math.random() * LETTERS.length));
        currentPiece = $('<div class="piece">' + letter + '</div>');
        currentPiece.css('left', (x * PIECE_WIDTH).toString() + 'px');
        currentPiece.show();
        $('#content').append(currentPiece);
        return true;
    }

    function getLetter() {
        return currentPiece.text();
    }

    function getY() {
        var top = parseInt(currentPiece.css('top'), 10);
        return Math.floor((top - 1 + PIECE_HEIGHT) / PIECE_HEIGHT);
    }

    function getX() {
        var left = parseInt(currentPiece.css('left'), 10);
        return Math.floor(left / PIECE_WIDTH);
    }

    function setX(x) {
        currentPiece.css('left', (x * PIECE_WIDTH).toString() + 'px');
    }

    function moveDown() {
        var top = parseInt(currentPiece.css('top'), 10);
        currentPiece.css('top', (top + DOWN_STEP).toString() + 'px');
    }

    function moveLeft() {
        var x = getX();
        var y = getY();
        if (x > 0 && !board[y][x - 1]) {
            setX(x - 1);
        }
    }

    function moveRight() {
        var x = getX();
        var y = getY();
        if (x < BOARD_WIDTH - 1 && !board[y][x + 1]) {
            setX(x + 1);
        }
    }

    function calculateScore(word) {
        var score = 0;
        for (var i = 0; i < word.length; i++) {
            score += SCORES[word[i].toUpperCase()];
        }
        return score;
    }

    function compareWords(a, b) {
        if (a.score > b.score) {
            return -1;
        } else if (a.score < b.score) {
            return 1;
        } else {
            return a.start - b.start;
        }
    }

    function colorWord(x, y, xdir, ydir, word) {
        var i;

        for (i = 0; i < word.length; i++) {
            board[y][x] = board[y][x].toLowerCase();
            $('#' + makeId(x, y)).addClass('used');
            x += xdir;
            y += ydir;
        }
    }

    function checkRow(y) {
        var i;
        var words;
        var start;
        var end;
        var letters;
        var hasUnused;

        words = [];
        for (start = 0; start < BOARD_WIDTH - 1; start++) {
            if (!board[y][start]) {
                continue;
            }
            for (end = start + 1; end < BOARD_WIDTH; end++) {
                if (!board[y][end]) {
                    break;
                }
            }

            letters = '';
            hasUnused = false;
            for (i = start; i < end; i++) {
                if (board[y][i] == board[y][i].toUpperCase()) {
                    hasUnused = true;
                }
                letters += board[y][i].toLowerCase();
                if (hasUnused && letters.length >= MIN_WORD_LENGTH && letters in WORDS) {
                    var word = {
                        score: calculateScore(letters),
                        start: start,
                        word: letters
                    };
                    words.push(word);
                }
            }
        }
        if (words.length == 0) {
            return false;
        }
        words.sort(compareWords);
        colorWord(words[0].start, y, 1, 0, words[0].word);
        addToScore(words[0].score);
        return true;
    }

    function checkColumn(x) {
        var i;
        var words;
        var start;
        var end;
        var letters;
        var hasUnused;

        words = [];
        for (start = 0; start < BOARD_HEIGHT - 1; start++) {
            if (!board[start][x]) {
                continue;
            }
            for (end = start + 1; end < BOARD_HEIGHT; end++) {
                if (!board[end][x]) {
                    break;
                }
            }

            letters = '';
            hasUnused = false;
            for (i = start; i < end; i++) {
                if (board[i][x] == board[i][x].toUpperCase()) {
                    hasUnused = true;
                }
                letters += board[i][x].toLowerCase();
                if (hasUnused && letters.length >= MIN_WORD_LENGTH && letters in WORDS) {
                    var word = {
                        score: calculateScore(letters),
                        start: start,
                        word: letters
                    };
                    words.push(word);
                }
            }
        }
        if (words.length == 0) {
            return false;
        }
        words.sort(compareWords);
        colorWord(x, words[0].start, 0, 1, words[0].word);
        addToScore(words[0].score);
        return true;
    }

    function placePiece(x, y) {
        currentPiece.attr('id', makeId(x, y));
        board[y][x] = getLetter();
        checkRow(y);
        checkColumn(x);
    }

    $(document).keydown(function(e) {
        switch(e.which) {
            case 37:
                moveLeft();
                break;
            case 39:
                moveRight();
                break;
            default:
                return;
        }
        e.preventDefault();
    });

    $('#left').on('touchstart click', function() {
        if (leftPressed) {
            // Don't do anything if left button just pressed
            return;
        }
        leftPressed = true;
        window.setTimeout(function() {
            leftPressed = false;
        }, BUTTON_DELAY);

        moveLeft();
    });

    $('#right').on('touchstart click', function() {
        if (rightPressed) {
            // Don't do anything if right button just pressed
            return;
        }
        rightPressed = true;
        window.setTimeout(function() {
            rightPressed = false;
        }, BUTTON_DELAY);

        moveRight();
    });

    function update(timestamp) {
        var gameOver = false;

        moveDown();

        var top = parseInt(currentPiece.css('top'), 10);
        var x = getX();
        var y = getY();

        if (top >= BOARD_HEIGHT * PIECE_HEIGHT - PIECE_HEIGHT) {
            placePiece(x, y);
            gameOver = !createNewPiece();
        } else if (top % PIECE_HEIGHT == 0) {
            if (board[y + 1][x]) {
                placePiece(x, y);
                gameOver = !createNewPiece();
            }
        }

        if (gameOver) {
            $('#game-over').show();
            return;
        }
        window.requestAnimationFrame(update);
    }

    function play() {
        resetScore();
        initBoard();
        createNewPiece();
        window.requestAnimationFrame(update);
    }

    $('#start').click(function() {
        $('#intro').remove();
        play();
    });

    $('#play-again').click(function() {
        $('#game-over').remove();
        play();
    });

    initWords();
});
