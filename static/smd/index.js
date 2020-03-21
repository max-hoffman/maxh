/* global
Vue,
validWordTrie,
now,
getFormattedTime,
possibleWords,
*/

const WIN = 'win';
const BEFORE = 'before';
const AFTER = 'after';
let vueApp;

Vue.directive('focus', {
    inserted: (el) => {
        el.focus();
    },
});

document.addEventListener('DOMContentLoaded', () => {
    if (getElement('container')) {
        vueApp = new Vue({
            el: '#container',
            data: {
                startTime: null,
                winTime: null,
                gaveUpTime: null,
                submitTime: null,
                difficulty: "nightmare",
                word: undefined,
                lastGuess: '',
                guessValue: '',
                guessError: '',
                afterGuesses: [],
                beforeGuesses: [],
            },
            methods: {
                reset,
                setGuess,
                setBackgroundColor,
                setDifficulty,
                getInvalidReason,
                makeGuess,
                giveUp,
                numberGuesses,
            },
        });
    }

    if (vueApp) {
        vueApp.reset();
    }
});

function setBackgroundColor(event) {
    document.body.style.backgroundColor = event.target.value;
}

function setDifficulty(event) {
  console.log(this.difficulty)
  this.reset()
}

function reset() {
    setEmptyStats(this);
    Vue.nextTick(() => {
        getElement('new-guess').focus();
    });
}

function setEmptyStats(app) {
    app.word = getWord(app.difficulty);
    app.guessValue = '';
    app.afterGuesses = [];
    app.beforeGuesses = [];
    app.startTime = now();
    app.winTime = null;
    app.gaveUpTime = null;
}

function getWord(difficulty) {
    const list = possibleWords[difficulty];
    const word = list[Math.floor(Math.random() * list.length)];
    console.log("Word is: ", word);
    return word;
}

function setGuess(event) {
    this.guessValue = event.target.value;
    if (this.guessError !== '') {
        this.guessError = '';
    }
}

function makeGuess() {
    const guess = sanitizeGuess(this.guessValue);
    this.guessError = this.getInvalidReason(guess);
    if (this.guessError) {
        return;
    }
    if (guess > this.word) {
        insertIntoSortedArray(this.beforeGuesses, guess);
    } else if (guess < this.word) {
        insertIntoSortedArray(this.afterGuesses, guess);
    } else {
        this.winTime = now();
        return;
    }
    this.lastGuess = guess;
    this.guessValue = ''; // clear input to get ready for next guess
}

function sanitizeGuess(guess) {
    return guess.toLowerCase().trim().replace(/[^a-z]/g, '');
}

function getInvalidReason(guess) {
    if (!guess) {
        return "Guess can't be empty.";
    }
    if (!isAValidWord(guess)) {
        return 'Guess must be an English word. (Scrabble-acceptable)';
    }
    if (this.beforeGuesses.includes(guess) || this.afterGuesses.includes(guess)) {
        return "Oops, you've already guessed that word.";
    }
    return '';
}

function isAValidWord(guess) {
    let level = validWordTrie;
    for (const letter of guess) {
        level = level[letter];
        if (!level) return false;
    }
    return '' in level;
}

function insertIntoSortedArray(array, newElement) {
    for (let i = 0; i <= array.length; i += 1) {
        const thisElement = array[i];
        if (newElement < thisElement) {
            array.splice(i, 0, newElement);
            return;
        }
    }
    array.push(newElement);
}

function giveUp() {
    if (!confirm('Really give up?')) {
        return;
    }
    this.guessValue = this.word;
    this.gaveUpTime = now();
}

function getElement(id) {
    return document.getElementById(id);
}

function numberGuesses() {
    return this.afterGuesses.length + this.beforeGuesses.length;
}
