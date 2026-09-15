<?php

declare(strict_types=1);

/**
 * Clase Tamagotchi
 * 
 * Representa a la mascota virtual con sus métricas vitales,
 * cálculo de etapas de crecimiento y estados emocionales.
 * 
 * Concepto clave de POO: EL CONSTRUCTOR (__construct)
 * Es el método mágico que se ejecuta automáticamente al instanciar
 * la clase con 'new Tamagotchi()'. Su función es dar un estado inicial
 * válido y coherente a todas las propiedades de nuestro objeto.
 */
class Tamagotchi
{
    private string $name;
    private int $age;
    private int $hunger;
    private int $happiness;
    private string $stage;  // 'baby' | 'teen' | 'adult'
    private string $mood;   // 'happy' | 'meh' | 'sick'
    private bool $isAlive;

    /**
     * Constructor de la clase
     * 
     * @param string $name Nombre de la mascota (por defecto "Tama")
     * @param int $age Edad o ticks de vida iniciales (por defecto 0)
     * @param int $hunger Nivel inicial de saciedad 0-100 (por defecto 80)
     * @param int $happiness Nivel inicial de felicidad 0-100 (por defecto 80)
     */
    public function __construct(
        string $name = "Tama",
        int $age = 0,
        int $hunger = 80,
        int $happiness = 80
    ) {
        $this->name = $name;
        $this->age = max(0, $age);
        $this->hunger = $this->clamp($hunger, 0, 100);
        $this->happiness = $this->clamp($happiness, 0, 100);
        $this->isAlive = true;

        // Calculamos la etapa y el ánimo según los valores iniciales recibidos
        $this->actualizarEstado();
    }

    /**
     * Alimentar a la mascota (+20 de hambre/saciedad)
     */
    public function feed(int $amount = 20): void
    {
        if (!$this->isAlive) {
            return;
        }

        $this->hunger = $this->clamp($this->hunger + $amount, 0, 100);
        $this->actualizarEstado();
    }

    /**
     * Jugar con la mascota (+20 de felicidad)
     */
    public function play(int $amount = 20): void
    {
        if (!$this->isAlive) {
            return;
        }

        $this->happiness = $this->clamp($this->happiness + $amount, 0, 100);
        $this->actualizarEstado();
    }

    /**
     * Avanzar un ciclo de tiempo (Tick del reloj de juego)
     * Envejece la mascota y consume gradualmente sus energías.
     */
    public function tick(int $hungerCost = 2, int $happinessCost = 2): void
    {
        if (!$this->isAlive) {
            return;
        }

        $this->age++;
        $this->hunger = $this->clamp($this->hunger - $hungerCost, 0, 100);
        $this->happiness = $this->clamp($this->happiness - $happinessCost, 0, 100);

        // Si el hambre y felicidad llegan a cero absoluto durante demasiado tiempo:
        if ($this->hunger <= 0 && $this->happiness <= 0) {
            $this->isAlive = false;
        }

        $this->actualizarEstado();
    }

    /**
     * Evalúa y actualiza la etapa y el humor en base a las reglas de negocio
     */
    public function actualizarEstado(): void
    {
        $this->calcularEtapa();
        $this->calcularMood();
    }

    /**
     * Determina la etapa de crecimiento según la edad:
     * - Bebé (< 30 ticks)
     * - Adolescente (< 70 ticks)
     * - Adulto (>= 70 ticks)
     */
    private function calcularEtapa(): void
    {
        if ($this->age < 30) {
            $this->stage = 'baby';
        } elseif ($this->age < 70) {
            $this->stage = 'teen';
        } else {
            $this->stage = 'adult';
        }
    }

    /**
     * Determina el estado emocional según las métricas vitales:
     * - 'sick' : Si hambre o felicidad bajan de 30
     * - 'meh'  : Si hambre o felicidad están entre 30 y 70
     * - 'happy': Si ambas métricas superan 70
     */
    private function calcularMood(): void
    {
        if (!$this->isAlive) {
            $this->mood = 'sick';
            return;
        }

        if ($this->hunger < 30 || $this->happiness < 30) {
            $this->mood = 'sick';
        } elseif ($this->hunger < 70 || $this->happiness < 70) {
            $this->mood = 'meh';
        } else {
            $this->mood = 'happy';
        }
    }

    /**
     * Restringe un valor numérico entre un mínimo y un máximo
     */
    private function clamp(int $value, int $min, int $max): int
    {
        return max($min, min($max, $value));
    }

    // --- MÉTODOS GETTERS ---
    public function getName(): string { return $this->name; }
    public function getAge(): int { return $this->age; }
    public function getHunger(): int { return $this->hunger; }
    public function getHappiness(): int { return $this->happiness; }
    public function getStage(): string { return $this->stage; }
    public function getMood(): string { return $this->mood; }
    public function isAlive(): bool { return $this->isAlive; }

    /**
     * Devuelve la ruta base para los sprites de la mascota
     */
    public function getSpritePrefix(): string
    {
        return "assets/sprites/{$this->stage}/{$this->mood}";
    }

    /**
     * Convierte el estado de la mascota a un array asociativo listo para JSON
     */
    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'age' => $this->age,
            'hunger' => $this->hunger,
            'happiness' => $this->happiness,
            'stage' => $this->stage,
            'mood' => $this->mood,
            'isAlive' => $this->isAlive,
            'spritePrefix' => $this->getSpritePrefix(),
        ];
    }

    /**
     * Método fábrica para reconstruir una instancia desde datos guardados (Rehidratación)
     */
    public static function fromArray(array $data): self
    {
        $pet = new self(
            (string)($data['name'] ?? 'Tama'),
            (int)($data['age'] ?? 0),
            (int)($data['hunger'] ?? 80),
            (int)($data['happiness'] ?? 80)
        );

        if (isset($data['isAlive'])) {
            $pet->isAlive = (bool)$data['isAlive'];
        }

        return $pet;
    }
}
