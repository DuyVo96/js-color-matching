import { GAME_STATUS, GAME_TIME, PAIRS_COUNT } from './constants.js';
import {
  getColorElementList,
  getColorListElement,
  getInActiveColorList,
  getPlayAgainButton,
} from './selectors.js';
import {
  createTimer,
  getRandomColorPairs,
  hidePlayAgainButton,
  setTimerText,
  showPlayAgainButton,
} from './utils.js';

// Global variables
let selections = [];
let gameStatus = GAME_STATUS.PLAYING;
let timer = createTimer({
  seconds: GAME_TIME,
  // onChange: (second) => console.log('change', second),
  // onFinish: () => {
  //   console.log('finished');
  // },
  onChange: handleTimerChange,
  onFinish: handleTimerFinish,
});

function handleTimerChange(second) {
  console.log('change', second);
  // show timer text

  const fullSecond = `0${second}`.slice(-2);
  setTimerText(fullSecond);
}
function handleTimerFinish() {
  console.log('finished');

  // end game
  gameStatus = GAME_STATUS.FINISHED;

  setTimerText('Game Over 🤣');
  showPlayAgainButton();
}

// TODOs
// 1. Gererating colors using .....
// 2. Attach item click for all li elements
// 3. Check win logic
// 4. Add timer
// 5. Handle replay click

function handleColorClick(liElement) {
  const shouldBlockClick = [GAME_STATUS.BLOCKING, GAME_STATUS.FINISHED].includes(gameStatus);
  const isClicked = liElement.classList.contains('active');

  if (!liElement || isClicked || shouldBlockClick) return;

  liElement.classList.add('active');

  // save clicked cell to selection = []
  selections.push(liElement);

  if (selections.length < 2) return;

  // check match
  const firstColor = selections[0].dataset.color;
  const secondColor = selections[1].dataset.color;
  const isMatch = firstColor === secondColor;

  if (isMatch) {
    // check win
    const isWin = getInActiveColorList().length === 0;

    if (isWin) {
      // show replay
      showPlayAgainButton();
      // show you win
      setTimerText('YOU WIN');
      timer.clear();

      gameStatus = GAME_STATUS.FINISHED;
    }
    selections = [];
    return;
  }

  // in case not match
  // remove "active" class for two element

  gameStatus = GAME_STATUS.BLOCKING;

  setTimeout(() => {
    selections[0].classList.remove('active');
    selections[1].classList.remove('active');

    // reset selections for the next selection
    selections = [];

    //race condition check with handleTimerFinish
    if (gameStatus !== GAME_STATUS.FINISHED) {
      gameStatus = GAME_STATUS.PLAYING;
    }

    gameStatus = GAME_STATUS.PLAYING;
  }, 500);
}

function initColor() {
  // random 8 pairs of color
  const colorList = getRandomColorPairs(PAIRS_COUNT);

  //  bind to li > div.overlay
  const liList = getColorElementList();

  liList.forEach((liElement, index) => {
    // set data-color
    liElement.dataset.color = colorList[index];

    const overlayElement = liElement.querySelector('.overlay');
    if (overlayElement) overlayElement.style.backgroundColor = colorList[index];
  });
}

function attachEventForColorList() {
  const ulElement = getColorListElement();
  if (!ulElement) return;

  ulElement.addEventListener('click', (event) => {
    if (event.target.tagName !== 'LI') return;

    handleColorClick(event.target);
  });
}

function resetGame() {
  // reset global variable
  gameStatus = GAME_STATUS.PLAYING;
  selections = [];
  // reset DOM elements
  //  - li active class from li
  //  - hide replay button
  //  - clear you win text

  const colorElementList = getColorElementList();
  for (const colorElement of colorElementList) {
    colorElement.classList.remove('active');
  }

  hidePlayAgainButton();

  setTimerText('');

  // re-generate game color
  initColor();

  // restart a new game
  startTimer();
}

function attachEventForPlayAgainButton() {
  const playAgainButton = getPlayAgainButton();
  if (!playAgainButton) return;

  playAgainButton.addEventListener('click', resetGame);
}

function startTimer() {
  timer.start();
}

// main
(() => {
  initColor();
  attachEventForColorList();
  attachEventForPlayAgainButton();
  startTimer();
})();
