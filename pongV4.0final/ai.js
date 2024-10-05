const Ai = {
    new: function (canvas) {
        return {
            canvas: canvas,
            width: 18,
            height: 180,
            x: canvas.width - 100, // Posición en el eje X
            y: (canvas.height / 2) - 90, // Centrado verticalmente
            move: DIRECTION.IDLE,
            speed: 5,
            color: '#e74c3c', // Color de la IA
            score: 0, // Añadir la propiedad score
            draw: function() {
                const context = this.canvas.getContext('2d');
                context.fillStyle = this.color;
                context.fillRect(this.x, this.y, this.width, this.height);
            },
            update: function(ball) {
                // Lógica simple de IA para seguir la pelota
                if (ball.y < this.y) {
                    this.y -= this.speed; // Mover hacia arriba
                } else if (ball.y > this.y + this.height) {
                    this.y += this.speed; // Mover hacia abajo
                }
                // Asegurarse de que la paleta no se salga del canvas
                if (this.y < 0) this.y = 0;
                if (this.y > this.canvas.height - this.height) this.y = this.canvas.height - this.height;   
            }
        };
    }
};
