const Sound = {
    goal: new Audio('sounds/goal.wav'), // Cambia la ruta al sonido de gol
    hit: new Audio('sounds/impact.wav'),   // Cambia la ruta al sonido de impacto

    init: function() {
        this.goal.volume = 0.5; // Ajusta el volumen de gol (0.0 a 1.0)
        this.hit.volume = 0.5; // Ajusta el volumen del sonido de impacto
    },

    playGoal: function() {
        this.goal.currentTime = 0; // Reinicia el sonido para que se reproduzca desde el principio
        this.goal.play().catch(error => console.error("Error al reproducir el sonido de gol:", error));
    },

    playHit: function() {
        this.hit.currentTime = 0; // Reinicia el sonido para que se reproduzca desde el principio
        this.hit.play().catch(error => console.error("Error al reproducir el sonido de impacto:", error));
    }
};

// Llama a Sound.init() para inicializar los sonidos
Sound.init();
