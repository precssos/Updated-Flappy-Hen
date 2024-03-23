// Increase canvas size
myCanvas.width = 366;
myCanvas.height = 606;


var ctx = myCanvas.getContext('2d');
var FPS = 40;
var jump_amount = -10;
var max_fall_speed = +10;
var acceleration = 0.9;
var pipe_speed = -2;
var game_mode = 'prestart';
var bottom_bar_offset = 0;
var pipes = [];
var score = 0; // Adding score variable
var highScore = 0; // Adding high score variable
var backgroundMusic = document.getElementById("backgroundMusic"); // Get background music element
var gameOverMusic = document.getElementById("gameOverMusic"); // Get game over music element
var gameOverSoundPlayed = false; // Variable to track if game over sound has been played


// Function to play background music
function playBackgroundMusic() {
  backgroundMusic.play();
}

// Function to pause background music
function pauseBackgroundMusic() {
  backgroundMusic.pause();
}

// Function to restart background music
function restartBackgroundMusic() {
  backgroundMusic.currentTime = 0; // Reset the background music to the beginning
  playBackgroundMusic(); // Start playing background music
}

// Function to play game over music
function playGameOverMusic() {
  if (!gameOverSoundPlayed) {
    gameOverMusic.play();
    gameOverSoundPlayed = true;
  }
}

// Function to pause game over music
function pauseGameOverMusic() {
  gameOverMusic.pause();
}

// Play background music when page loads
playBackgroundMusic();

// Increase background image height
var backgroundImage = new Image();
backgroundImage.src = 'https://i.postimg.cc/W4yHFkBt/backg.png'; // Replace 'background_image_url.jpg' with your background image URL
backgroundImage.onload = function () {
  ctx.drawImage(backgroundImage, 0, 0, myCanvas.width, myCanvas.height);
};

function MySprite(img_url) {
  this.x = 0;
  this.y = 0;
  this.visible = true;
  this.velocity_x = 0;
  this.velocity_y = 0;
  this.MyImg = new Image();
  this.MyImg.src = img_url || '';
  this.angle = 0;
  this.flipV = false;
  this.flipH = false;
  
}

MySprite.prototype.Do_Frame_Things = function () {
  ctx.save();
  ctx.translate(this.x + this.MyImg.width / 2, this.y + this.MyImg.height / 2);
  ctx.rotate((this.angle * Math.PI) / 180);
  if (this.flipV) ctx.scale(1, -1);
  if (this.flipH) ctx.scale(-1, 1);
  if (this.visible)
    ctx.drawImage(this.MyImg, -this.MyImg.width / 2, -this.MyImg.height / 2);
  this.x = this.x + this.velocity_x;
  this.y = this.y + this.velocity_y;
  ctx.restore();
};

function ImagesTouching(thing1, thing2) {
  if (!thing1.visible || !thing2.visible) return false;
  if (
    thing1.x >= thing2.x + thing2.MyImg.width ||
    thing1.x + thing1.MyImg.width <= thing2.x
  )
    return false;
  if (
    thing1.y >= thing2.y + thing2.MyImg.height ||
    thing1.y + thing1.MyImg.height <= thing2.y
  )
    return false;
  return true;
}

function Got_Player_Input(MyEvent) {
  switch (game_mode) {
    case 'prestart': {
      game_mode = 'running';
      restartBackgroundMusic(); // Restart background music on game start
      score = 0; // Reset score to 0 on game start
      break;
    }
    case 'running': {
      bird.velocity_y = jump_amount;
      break;
    }
    case 'over':
      if (new Date() - time_game_last_running > 1000) {
        reset_game();
        game_mode = 'running';
        break;
      }
  }
  MyEvent.preventDefault();
}

addEventListener('touchstart', Got_Player_Input);
addEventListener('mousedown', Got_Player_Input);
addEventListener('keydown', Got_Player_Input);

function make_bird_slow_and_fall() {
  if (bird.velocity_y < max_fall_speed) {
    bird.velocity_y = bird.velocity_y + acceleration;
  }
  if (bird.y > myCanvas.height - bird.MyImg.height) {
    bird.velocity_y = 0;
    game_mode = 'over';
    pauseBackgroundMusic(); // Pause background music on game over
    playGameOverMusic(); // Play game over sound immediately
  }
  if (bird.y < 0 - bird.MyImg.height) {
    bird.velocity_y = 0;
    game_mode = 'over';
    pauseBackgroundMusic(); // Pause background music on game over
    playGameOverMusic(); // Play game over sound immediately
  }
}

function add_pipe(x_pos, top_of_gap, gap_width) {
  var top_pipe = new MySprite();
  top_pipe.MyImg = pipe_piece;
  top_pipe.x = x_pos;
  top_pipe.y = top_of_gap - pipe_piece.height;
  top_pipe.velocity_x = pipe_speed;
  pipes.push(top_pipe);
  var bottom_pipe = new MySprite();
  bottom_pipe.MyImg = pipe_piece;
  bottom_pipe.flipV = true;
  bottom_pipe.x = x_pos;
  bottom_pipe.y = top_of_gap + gap_width;
  bottom_pipe.velocity_x = pipe_speed;
  pipes.push(bottom_pipe);
}

function make_bird_tilt_appropriately() {
  if (bird.velocity_y < 0) {
    bird.angle = -15;
  } else if (bird.angle < 70) {
    bird.angle = bird.angle + 4;
  }
}

function show_the_pipes() {
  for (var i = 0; i < pipes.length; i++) {
    pipes[i].Do_Frame_Things();
  }
}

function check_for_end_game() {
  for (var i = 0; i < pipes.length; i++)
    if (ImagesTouching(bird, pipes[i])) {
      game_mode = 'over';
    }
}

function display_intro_instructions() {
 
  ctx.font = '30px Arial, Alice';
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.fillText(
    'FLAPPY HEN',
    myCanvas.width / 2,
    myCanvas.height / 4
  );
  ctx.font = '23px Arial, Alice';
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.fillText(
    'Touch to start the Game',
    myCanvas.width / 2,
    myCanvas.height / 3
  );
}

// Call functions to increment score and update high score
setInterval(function () {
  if (game_mode === 'running') {
    incrementScore();
    updateHighScore();
  }
}, 1000 / FPS);

function display_game_over() {
  var localScore = score; // local score variable to avoid global score reset
  ctx.font = '28px Arial';
  ctx.fillStyle = 'red';
  ctx.textAlign = 'center';
  ctx.fillText('Game Over', myCanvas.width / 2, 190);
  ctx.fillStyle = 'purple';
  ctx.textAlign = 'center';
  ctx.fillText('Score: ' + localScore, myCanvas.width / 2, 240); // display local score
  ctx.fillText('High Score: ' + highScore, myCanvas.width / 2, 290);
  ctx.font = '25px Arial';
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.fillText('Touch to play again', myCanvas.width / 2, 370);
  playGameOverMusic(); // Play game over sound immediately
}

function display_bar_running_along_bottom() {
  if (bottom_bar_offset < -23) bottom_bar_offset = 0;
  ctx.drawImage(
    bottom_bar,
    bottom_bar_offset,
    myCanvas.height - bottom_bar.height
  );
}


var jump_amount = -8; // Decreased jump height of the bird
var max_fall_speed = +6; // Decreased maximum fall speed of the bird


function reset_game() {
  bird.y = myCanvas.height / 2;
  bird.angle = 0;
  pipes = []; // erase all the pipes from the array
  add_all_my_pipes(); // and load them back in their starting positions
  resetPassedPipes(); // Reset passed pipes
  score = 0; // Reset score to 0
  game_mode = 'prestart'; // Reset game mode
  restartBackgroundMusic(); // Restart background music
  gameOverSoundPlayed = false; // Reset game over sound flag
}

function add_all_my_pipes() {
  // Add initial pipes
  add_pipe(500, 100, 140);
  add_pipe(800, 50, 140);
  add_pipe(1000, 250, 140);
  add_pipe(1200, 150, 120);
  add_pipe(1600, 100, 120);
  add_pipe(1800, 150, 120);
  add_pipe(2000, 200, 120);
  add_pipe(2200, 250, 120);
  add_pipe(2400, 30, 100);
  add_pipe(2700, 300, 100);
  add_pipe(3000, 100, 80);
  add_pipe(3300, 250, 80);
  add_pipe(3600, 50, 60);

  // Add additional pipes using a loop
  var xOffset = 3900; // Initial x position for additional pipes
  var gapWidth = 120; // Initial gap width
  var minHeight = 20; // Minimum height of pipes
  var maxHeight = myCanvas.height - gapWidth - minHeight; // Maximum height of pipes

  for (var i = 0; i < 1000; i++) {
    // Generate random values for pipe position and gap height
    var x = xOffset + i * 300;
    var topOfGap =
      Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
    var gapWidth = Math.floor(Math.random() * 80) + 80; // Random gap width between 80 and 160
    add_pipe(x, topOfGap, gapWidth);
  }

  // Add finish line
  var finish_line = new MySprite(
    'https://i.postimg.cc/3rv3hPW5/finish.png'
  );
  finish_line.x = xOffset + 1000 * 300 + 300; // Place finish line after additional pipes
  finish_line.velocity_x = pipe_speed;
  pipes.push(finish_line);
}

var pipe_piece = new Image();
pipe_piece.onload = add_all_my_pipes;
pipe_piece.src = 'https://i.postimg.cc/BQNmY3r5/pipe1-1-2.png';

// Increment score when bird successfully passes the pipe
function incrementScore() {
  for (var i = 0; i < pipes.length; i++) {
    if (pipes[i].x + pipes[i].MyImg.width < bird.x && !pipes[i].passed) {
      score++; // Increase score by 1 when passing a pipe
      pipes[i].passed = true;
      console.log('Score incremented:', score); // Add a log to check score increment

      break; // Exit loop after incrementing score for this pipe
    }
  }
}

// Reset the score to 0 at the beginning
// of each game
function resetPassedPipes() {
  for (var i = 0; i < pipes.length; i++) {
    pipes[i].passed = false;
  }
}

// Update high score if current score exceeds high score
function updateHighScore() {
  if (score > highScore) {
    highScore = score;
  }
}

// Display score and high score
function displayScore() {
  ctx.font = '24px Arial';
  ctx.textAlign = 'right'; // Align score to the right
  ctx.fillStyle = 'brown';
  ctx.fillText('Score: ' + score, myCanvas.width - 20, 30); // Adjusted position
  ctx.fillText('High Score: ' + highScore, myCanvas.width - 20, 60); // Adjusted position
}


// Main game loop
function Do_a_Frame() {
  ctx.clearRect(0, 0, myCanvas.width, myCanvas.height); // Clear the canvas
  bird.Do_Frame_Things();
  display_bar_running_along_bottom();
  switch (game_mode) {
    case 'prestart': {
      display_intro_instructions();
      break;
    }
    case 'running': {
      time_game_last_running = new Date();
      bottom_bar_offset = bottom_bar_offset + pipe_speed;
      make_bird_tilt_appropriately();
      make_bird_slow_and_fall();
      check_for_end_game();
      displayScore(); // Display score and high score in front of pipes
      show_the_pipes(); // Render pipes after displaying score
      break;
    }
    case 'over': {
      make_bird_slow_and_fall();
      display_game_over();
      break;
    }
  }
  handleGameOver(); // Call function to handle game over state
}



var bottom_bar = new Image();
bottom_bar.src = 'https://i.postimg.cc/PqTmSRTD/bottomb.png';

var bird = new MySprite('https://i.postimg.cc/xd8gKRLY/bird-1.png');
bird.x = myCanvas.width / 2.5;
bird.y = myCanvas.height / 2;
bird.velocity_y = -0.2; // Decreased bird's initial falling speed


setInterval(Do_a_Frame, 1000 / FPS);
