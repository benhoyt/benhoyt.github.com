/* Downrush JavaScript */

var PIECE_WIDTH = 50;
var PIECE_HEIGHT = 50;
var BOARD_WIDTH = 9;
var BOARD_HEIGHT = 10;
var UPDATE_DELAY = 10;
var DOWN_STEP = 2;
var WORDS = null;

// Scrabble letter distribution
var LETTERS = "AAAAAAAAABBCCDDDDEEEEEEEEEEEEFFGGGHHIIIIIIIIIJKLLLLMMNNNNNNOOOOOOOOPPQRRRRRRSSSSTTTTTTUUUUVVWWXYYZ";
var TODOs = "WEARTHATAAAAAAAAABBCCDDDDEEEEEEEEEEEEFFGGGHHIIIIIIIIIJKLLLLMMNNNNNNOOOOOOOOPPQRRRRRRSSSSTTTTTTUUUUVVWWXYYZ";
var TODOi = 0;

var currentPiece = null;
var board = [];

$(document).ready(function() {
    function initWords() {
        WORDS = {};
        for (var i = 0; i < WORDLIST.length; i++) {
            WORDS[WORDLIST[i]] = true;
        }
    }

    function initBoard() {
        for (var y = 0; y < BOARD_HEIGHT; y++) {
            var row = [];
            for (var x = 0; x < BOARD_WIDTH; x++) {
                row.push(null);
            }
            board.push(row);
        }
    }

    function addToScore(n) {
        var scoreSpan = $('#score');
        var score = parseInt(scoreSpan.text(), 10);
        scoreSpan.text((score + n).toString());
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
//        var letter = TODOs[TODOi]; TODOi++;
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
        return word.length;
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
            $('#' + makeId(x, y)).addClass('word-piece');
            x += xdir;
            y += ydir;
        }
    }

    function checkRow(y) {
        var x;
        var i;
        var words;
        var start;
        var end;
        var letters;
        var hasUnused;

        words = [];
        for (x = 0; x < BOARD_WIDTH - 1; x++) {
            for (start = x; start < BOARD_WIDTH; start++) {
                if (board[y][start]) {
                    break;
                }
            }
            for (end = start; end < BOARD_WIDTH; end++) {
                if (!board[y][end]) {
                    break;
                }
            }

            letters = '';
            hasUnused = false;
            for (i = start; i < end; i++) {
                letters += board[y][i].toLowerCase();
                if (letters in WORDS) {
                    words.push({
                        score: calculateScore(letters),
                        start: start,
                        word: letters
                    });
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

    function placePiece(x, y) {
        currentPiece.attr('id', makeId(x, y));
        board[y][x] = getLetter();
        addToScore(1);
        checkRow(y);
    }

    $(document).keydown(function(e) {
        switch(e.which) {
            case 37:
                moveLeft();
                break;
            case 38:
                // up
                break;
            case 39:
                moveRight();
                break;
            case 40:
                // down
                update();
                break;
            default:
                return;
        }
        e.preventDefault();
    });

    function update() {
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
            alert('Game over!');
            return;
        }
        window.setTimeout(update, UPDATE_DELAY);
    }

    initWords();
    initBoard();
    createNewPiece();
    update();
});
