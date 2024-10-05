const INITIAL_BALL_SPEED = 7; // Velocidad inicial de la pelota
const MAX_BALL_SPEED = 50;

const Game = {
    mode: null,
    canvas: null,
    context: null,
    player1: null,
    player2: null,
    ball: null,
    running: false,
    over: false,
    particles: [],
    goalAnimation: false,
    isKeyListenerActive: false,

    initialize: function () {
        this.canvas = document.querySelector('#pongCanvas');
        if (!this.canvas) {
            console.error("No se encontró el elemento canvas.");
            return;
        }
        this.context = this.canvas.getContext('2d');
        this.canvas.width = 1400;
        this.canvas.height = 1000;
        this.canvas.style.width = (this.canvas.width / 2) + 'px';
        this.canvas.style.height = (this.canvas.height / 2) + 'px';
        this.menu();
    },
    

    menu: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.font = '50px Courier New';
        this.context.fillStyle = '#8c52ff';
        this.context.textAlign = 'center';
        this.context.fillText('Selecciona un modo de juego:', this.canvas.width / 2, this.canvas.height / 2 - 50);
        this.context.fillText('1. VS IA', this.canvas.width / 2, this.canvas.height / 2);
        this.context.fillText('2. VS JUGADOR', this.canvas.width / 2, this.canvas.height / 2 + 50);
        this.context.fillText('Presiona 1 o 2 para comenzar', this.canvas.width / 2, this.canvas.height / 2 + 100);

        if (!this.isKeyListenerActive) {
            document.addEventListener('keydown', this.selectMode.bind(this));
            this.isKeyListenerActive = true;
        }
    },    

    selectMode: function (event) {
        if (!this.running) { // Solo permite selección si no se está jugando
            if (event.key === '1') {
                this.mode = 'AI';
                this.startGame();
            } else if (event.key === '2') {
                this.mode = 'PLAYER';
                this.startGame();
            }
        }
    }, 


    movePlayer: function () {
        // Mueve la paleta izquierda según la dirección
        if (this.player1.move === DIRECTION.UP) {
            this.player1.y -= this.player1.speed; 
        } else if (this.player1.move === DIRECTION.DOWN) {
            this.player1.y += this.player1.speed; 
        }
    
        // Limitar el movimiento a los límites del canvas
        if (this.player1.y < 0) {
            this.player1.y = 0;
        } else if (this.player1.y > (this.canvas.height - this.player1.height)) {
            this.player1.y = (this.canvas.height - this.player1.height);
        }
    },

    movePlayer2: function () {
        // Mueve la paleta derecha según la dirección
        if (this.player2.move === DIRECTION.UP) {
            this.player2.y -= this.player2.speed; 
        } else if (this.player2.move === DIRECTION.DOWN) {
            this.player2.y += this.player2.speed; 
        }
    
        // Limitar el movimiento a los límites del canvas
        if (this.player2.y < 0) {
            this.player2.y = 0;
        } else if (this.player2.y > (this.canvas.height - this.player2.height)) {
            this.player2.y = (this.canvas.height - this.player2.height);
        }
    },
    
    moveBall: function () {
        this.ball.y += this.ball.moveY === DIRECTION.UP ? -(this.ball.speed / 1.5) : (this.ball.speed / 1.5);
        this.ball.x += this.ball.moveX === DIRECTION.LEFT ? -this.ball.speed : this.ball.speed;
    },


    startGame: function() {
        this.player1 = Paddle.new(this.canvas, 'left');
        this.player2 = (this.mode === 'AI') ? Ai.new(this.canvas) : Paddle.new(this.canvas, 'right');
        this.ball = Ball.new(this.canvas);
        this.running = true;  // Activar el juego
        this.over = false;
        this.timer = 0;
        this.particles = [];
        this.ball.speed = INITIAL_BALL_SPEED;
    
        // Inicializar la dirección de la pelota
        this.ball.moveX = Math.random() > 0.5 ? DIRECTION.LEFT : DIRECTION.RIGHT;
        this.ball.moveY = Math.random() > 0.5 ? DIRECTION.UP : DIRECTION.DOWN;
    
        this.listen();  // Llamar a listen para empezar a escuchar las teclas
        this.loop();
        this.draw();
    },    

    update: function () {
        console.log("Actualizando juego..."); // Para verificar que se está llamando correctamente
        if (!this.over && !this.goalAnimation) {
            this.checkBoundaries();
            this.movePlayer();  // Mueve la paleta del jugador 1
            this.moveBall();
            if (this.mode === 'AI') {
                this.player2.update(this.ball); // Actualiza la IA
            } else {
                this.movePlayer2(); // Mueve la paleta del jugador 2
            }
            this.checkCollisions();
            this.checkGameOver();
        }
        if (this.goalAnimation) {
            this.updateParticles();
        }
    },    

    checkBoundaries: function () {
        if (this.ball.x <= 0) {
            this.resetTurn(this.player2, this.player1);
        }
        if (this.ball.x >= this.canvas.width - this.ball.width) {
            this.resetTurn(this.player1, this.player2);
        }
        if (this.ball.y <= 0 || this.ball.y >= this.canvas.height - this.ball.height) {
            this.ball.moveY = this.ball.moveY === DIRECTION.UP ? DIRECTION.DOWN : DIRECTION.UP;
        }
    },


    resetTurn: function(victor, loser) {
        this.ball = Ball.new(this.canvas);
        this.ball.speed = INITIAL_BALL_SPEED;
        victor.score++;
        this.goalAnimation = true;
        this.goalSide = victor === this.player1 ? 'right' : 'left';
        Sound.playGoal();
        this.createConfetti();

        if (loser === this.player1) {
            this.ball.moveX = DIRECTION.LEFT;  
        } else {
            this.ball.moveX = DIRECTION.RIGHT;  
        }
        
        this.ball.moveY = Math.random() > 0.5 ? DIRECTION.UP : DIRECTION.DOWN;

        setTimeout(() => {
            this.goalAnimation = false;
            if (victor.score >= 5) {
                this.showVictory(victor); 
            }
        }, 3000);  
    },        

    createConfetti: function() {
        const confettiCount = 100;
        this.particles = [];
        for (let i = 0; i < confettiCount; i++) {
            this.particles.push({
                x: this.goalSide === 'right' ? this.canvas.width - Math.random() * 100 : Math.random() * 100,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 5 + 5,
                speedX: (Math.random() - 0.5) * 2,
                speedY: Math.random() * 2 + 1,
                color: `hsl(${Math.random() * 360}, 100%, 50%)`,
                life: Math.random() * 100 + 50
            });
        }
    },

    updateParticles: function() {
        for (let i = 0; i < this.particles.length; i++) {
            const piece = this.particles[i];
            piece.x += piece.speedX;
            piece.y -= piece.speedY;
            piece.life--;

            const alpha = piece.life > 0 ? piece.life / 100 : 0;
            this.context.fillStyle = `rgba(${parseInt(piece.color.slice(4, 7))}, ${parseInt(piece.color.slice(9, 12))}, ${parseInt(piece.color.slice(14, 17))}, ${alpha})`;

            this.context.beginPath();
            this.context.arc(piece.x, piece.y, piece.size, 0, Math.PI * 2);
            this.context.fill();

            if (piece.life <= 0) {
                this.particles.splice(i, 1);
                i--;
            }
        }
    },

    checkCollisions: function () {
        const paddleCollision = (paddle) => {
            if (this.ball.x <= paddle.x + paddle.width && this.ball.x + this.ball.width >= paddle.x &&
                this.ball.y <= paddle.y + paddle.height && this.ball.y + this.ball.height >= paddle.y) {
                if ((this.ball.moveX === DIRECTION.LEFT && paddle === this.player1) || 
                    (this.ball.moveX === DIRECTION.RIGHT && paddle === this.player2)) {
                    this.ball.moveX = paddle === this.player1 ? DIRECTION.RIGHT : DIRECTION.LEFT;
                    this.ball.speed = Math.min(this.ball.speed + 0.5, MAX_BALL_SPEED);
                    paddle.color = paddle === this.player1 ? '#1abc9c' : '#e74c3c';
                    setTimeout(() => { paddle.color = '#ffffff'; }, 100);
                    this.ball.x = paddle === this.player1 ? (paddle.x + paddle.width) : (paddle.x - this.ball.width);
                    Sound.hit.play();
                }
            }
        };
    
        paddleCollision(this.player1);
        paddleCollision(this.player2);
    },

    checkGameOver: function () {
        if (this.player1.score >= 5 || this.player2.score >= 5) {
            this.running = false;
            this.resetGame();
        }
    },

    resetGame: function() {
        cancelAnimationFrame(this.animationFrameId);
    
        let message;
        if (this.player1.score >= 5) {
            message = `¡HA GANADO EL JUGADOR 1! \n ${this.player1.score} - ${this.player2.score}`;
        } else if (this.mode === 'AI' && this.player2.score >= 5) {
            message = `¡HA GANADO LA IA! \n ${this.player2.score} - ${this.player1.score}`;
        } else {
            message = `¡HA GANADO EL JUGADOR 2! \n ${this.player2.score} - ${this.player1.score}`;
        }
    
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.font = '60px Courier New';
        this.context.fillStyle = '#ffffff';
        this.context.textAlign = 'center';
        this.context.fillText(message, this.canvas.width / 2, this.canvas.height / 2);
        this.context.fillText(`${this.player1.score} - ${this.player2.score}`, this.canvas.width / 2, this.canvas.height / 2 + 60);
    
        setTimeout(() => {
            this.endGame();
        }, 5000);
    },

    showVictory: function(victor) {
        this.running = false;
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        let message;
        if (victor === this.player1) {
            message = `¡HA GANADO EL JUGADOR 1!`;
        } else if (this.mode === 'AI') {
            message = `¡HA GANADO LA IA!`;
        } else {
            message = `¡HA GANADO EL JUGADOR 2!`;
        }
        this.context.font = '60px Courier New';
        this.context.fillStyle = '#ffffff';
        this.context.textAlign = 'center';
        this.context.fillText(message, this.canvas.width / 2, this.canvas.height / 2 - 40);
        this.context.fillText(`${this.player1.score} - ${this.player2.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
    
        setTimeout(() => {
            this.endGame(); 
        }, 5000);
    },

    endGame: function () {
        this.over = true;
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.player1 = null;
        this.player2 = null;
        this.ball = null;
        this.running = false;
        this.menu();
    },    

    listen: function () {
        this.isKeyListenerActive = true;
    
        document.addEventListener('keydown', (event) => {
            if (this.running) { // Si el juego está corriendo
                // Movimiento Jugador 1 (paleta izquierda)
                if (event.key === 'w') {
                    this.player1.move = DIRECTION.UP;
                }
                if (event.key === 's') {
                    this.player1.move = DIRECTION.DOWN;
                }
    
                // Movimiento Jugador 2 (paleta derecha) solo en modo jugador
                if (this.mode === 'PLAYER') {
                    if (event.key === 'ArrowUp') {
                        this.player2.move = DIRECTION.UP;
                    }
                    if (event.key === 'ArrowDown') {
                        this.player2.move = DIRECTION.DOWN;
                    }
                }
    
                // Permitir que ESCAPE termine el juego
                if (event.key === 'Escape') {
                    this.endGame(); // Terminar el juego
                }
            } else {
                // Si el juego NO está corriendo, permitir que 1 y 2 funcionen para seleccionar el modo de juego
                if (event.key === '1' || event.key === '2') {
                    // Permitir que estas teclas seleccionen el modo
                    return;
                }
            }
        });
    
        document.addEventListener('keyup', (event) => {
            // Detener el movimiento de los jugadores al soltar la tecla
            if (event.key === 'w' || event.key === 's') {
                this.player1.move = DIRECTION.IDLE; // Detener movimiento del jugador 1
            }
            if (this.mode === 'PLAYER') {
                if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                    this.player2.move = DIRECTION.IDLE; // Detener movimiento del jugador 2
                }
            }
        });
    },

    loop: function () {
        if (!this.running) return;
        this.update();
        this.draw();
        window.requestAnimationFrame(this.loop.bind(this));
    },    

    draw: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
        if (this.player1) {
            this.player1.draw(); 
        }
        if (this.player2) {
            this.player2.draw(); 
        }
        if (this.ball) {
            this.ball.draw(); 
        }
    
        this.particles.forEach((particle) => {
            this.context.fillStyle = particle.color;
            this.context.beginPath();
            this.context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.context.fill();
        });
    
        this.drawScores();
    },
    
    drawScores: function () {
        this.context.font = '100px Courier New';
        this.context.fillStyle = '#ffffff';
        this.context.textAlign = 'left';
        this.context.fillText(this.player1.score, 300, 100);
        this.context.textAlign = 'right';
        this.context.fillText(this.player2.score, this.canvas.width - 300, 100);
    },
    
    setup: function () {
        this.initialize(); 
    }
};

// Inicializar el juego
document.addEventListener('DOMContentLoaded', () => {
    Game.setup();
});