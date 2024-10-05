const Paddle = {
    new: function (canvas, side) {
        return {
            canvas: canvas,
            width: 18, // Ancho de la paleta
            height: 180, // Altura de la paleta
            x: side === 'left' ? 100 : canvas.width - 100, // Posición en el eje X
            y: (canvas.height / 2) - 90, // Centrado verticalmente
            score: 0,
            move: DIRECTION.IDLE,
            speed: 10,
            color: '#1abc9c', // Color inicial
            draw: function() {
                const context = this.canvas.getContext('2d');
                context.fillStyle = this.color;
                context.fillRect(this.x, this.y, this.width, this.height);
            },
            update: function() {
                // Lógica de movimiento
                if (this.move === DIRECTION.UP) {
                    this.y -= this.speed;
                } else if (this.move === DIRECTION.DOWN) {
                    this.y += this.speed;
                }

                // Limitar movimiento dentro del canvas
                if (this.y < 0) {
                    this.y = 0;
                } else if (this.y > (this.canvas.height - this.height)) {
                    this.y = (this.canvas.height - this.height);
                }
            }
        };
    }
};
