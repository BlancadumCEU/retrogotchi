# Documentación del Proyecto: Retrogotchi POO

Este directorio contiene las guías paso a paso del desarrollo y escalación del juego Retrogotchi, desde su concepción inicial en un cuaderno de Gemini hasta su arquitectura hexagonal definitiva.

---

## 📚 Fases del Proyecto

* **[Fase 1: Prototipo POO en 3 Capas (Backend PHP, Comunicación y Frontend LCD)](fase-1/README.md)**  
  Implementación actual: Creación de la clase `Tamagotchi.php` con énfasis en el constructor (`__construct`), comunicación HTTP mediante `api.php` y sesiones (`$_SESSION`), renderizado LCD retro con Tailwind y animación de fotogramas (a - b).

* **Fase 2: Persistencia Desacoplada y Tiempo Real** *(Próximamente)*  
  Migración de sesiones a archivo JSON local (`tamagotchi.json`) y cálculo de envejecimiento por Timestamp real en servidor.

* **Fase 3: Arquitectura Hexagonal Completa (/goal)** *(Próximamente)*  
  Estructuración en capas puras: Dominio (Value Objects e interfaces de puertos), Aplicación (Casos de uso) e Infraestructura (Base de datos MySQL/SQLite con PDO).
