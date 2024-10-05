const Ball = { 
    new: function (canvas) {
        return {
            x: canvas.width / 2,
            y: canvas.height / 2,
            width: 20,
            height: 20,
            speed: INITIAL_BALL_SPEED,
            moveX: DIRECTION.RIGHT,
            moveY: DIRECTION.UP,
            draw: function() {
                const context = canvas.getContext('2d');
                context.fillStyle = '#ffffff'; // Cambia el color si lo deseas
                context.beginPath();
                context.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
                context.fill();
            }
        };
    },
};
