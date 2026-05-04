# Alauxa - Sistema de Gestión de Biblioteca

## ¿Qué es el proyecto?
**Alauxa** es un sistema integral de gestión bibliotecaria de nueva generación. El proyecto está diseñado para administrar el catálogo de libros, préstamos, usuarios y sanciones (penalizaciones por retraso). Además de las operaciones clásicas de una biblioteca, incorpora un sistema de importación masiva de datos (archivos CSV), etiquetado inteligente de recursos (sistema de "Huella") y un asistente basado en Inteligencia Artificial para interactuar o generar recomendaciones sobre el catálogo.

## Tecnologías Utilizadas

La aplicación está completamente dockerizada, separando los servicios en distintos contenedores para asegurar su escalabilidad y fácil despliegue.

### Frontend
- **React 19 & TypeScript:** Biblioteca principal para la construcción de interfaces de usuario robustas y fuertemente tipadas.
- **Vite:** Empaquetador y servidor de desarrollo extremadamente rápido.
- **TailwindCSS v4:** Framework de estilos utilitarios para un diseño moderno, responsivo y adaptativo (incluyendo temas oscuro/verde).
- **React Router DOM:** Para la navegación y el enrutamiento de las distintas pantallas (Login, Dashboard, Catálogo, etc.).
- **Nginx:** Servidor web encargado de servir los archivos estáticos de React en producción de forma eficiente.

### Backend
- **Python 3 con Flask:** Framework ligero y versátil para desarrollar la API RESTful.
- **Flask-JWT-Extended:** Gestión de la autenticación de usuarios mediante tokens JWT.
- **SQLAlchemy & PyMySQL:** ORM (Mapeo Objeto-Relacional) y driver para facilitar las consultas a la base de datos de forma segura.
- **APScheduler:** Programador de tareas en segundo plano (útil para la asignación y cálculo automático de penalizaciones).
- **Flask-Mail:** Integración de envío de correos (ej. notificaciones a los usuarios).

### Base de Datos y Servicios Adicionales
- **MySQL 8.0:** Sistema gestor de bases de datos relacional primario.
- **phpMyAdmin:** Interfaz gráfica para la administración directa de la base de datos MySQL (accesible vía contenedor propio).
- **Ollama (Modelo Mistral):** Motor de Inteligencia Artificial ejecutado en local para proporcionar asistencia y análisis inteligente sin depender de APIs de terceros (privacidad total).
- **Docker Compose:** Orquestación de la arquitectura de todos los microservicios.

---

## ¿Cómo funciona?

1. **Ingesta de Datos:** Se pueden añadir libros manualmente o importar listados completos mediante **Archivos CSV**. Un proceso en el backend parsea estos archivos, normaliza las fechas y clasifica la procedencia de cada registro mediante el sistema de "Huella".
2. **Gestión de Préstamos y Sanciones:** Los usuarios pueden solicitar préstamos de libros físicos. Si un usuario se excede de la fecha límite, una tarea automatizada (cron job con APScheduler) actualiza su estado aplicando **Penalizaciones** dinámicas.
3. **Asistente de Inteligencia Artificial:** Gracias a la conexión interna con el contenedor de Ollama, el backend puede enviar *prompts* al modelo `mistral` analizando la base de datos y sugiriendo libros o resolviendo consultas del usuario final.

---

## Tipos de Usuario y Casos de Uso

### 1. Administrador (Bibliotecario)
**Posibilidades:**
- Tiene acceso total a los módulos de gestión.
- Puede subir e importar archivos CSV para actualizar el fondo de la biblioteca de manera masiva.
- Puede gestionar el estado de los préstamos, marcando las devoluciones o cancelando penalizaciones de forma manual si es necesario.
- Puede consultar las métricas y los errores técnicos (filtrados) en su Dashboard.
- Puede acceder al panel de *phpMyAdmin* para tareas de mantenimiento de la base de datos de bajo nivel.

**Comportamiento de la app ante sus acciones:**
- Si el Administrador sube un CSV con formatos de fecha diferentes, la herramienta de normalización procesará e identificará la "Huella" (origen) notificándole por pantalla cuántos registros se han añadido y si hubo fallos de formato, exceptuando errores comunes sin importancia.
- Si cancela una penalización, la tarjeta del usuario en el panel dejará de mostrarse con estado de alerta y el usuario recuperará sus privilegios instantáneamente.

### 2. Usuario Estándar (Lector)
**Posibilidades:**
- Puede registrarse y acceder al catálogo general de la biblioteca.
- Puede filtrar libros, ver disponibilidades reales y hacer uso del motor de recomendación inteligente.
- Tiene una pantalla personal para visualizar sus préstamos activos y su historial de lecturas.
- Visualización de posibles penalizaciones si tiene material caducado.

**Comportamiento de la app ante sus acciones:**
- Si el usuario tiene una penalización activa y trata de sacar un nuevo libro, la interfaz le denegará la acción mostrando un modal o notificación advirtiendo de la deuda.
- Al consultar por recomendaciones, el backend envía su historial al modelo local de IA, devolviéndole en pantalla sugerencias afines sin latencias elevadas ni compromiso de datos.

---

##  Aspectos de la Interfaz (UI/UX)
El diseño sigue unas directrices claras de accesibilidad y usabilidad:
- **Estructura:** Se hace uso de componentes modernos con estilos consistentes.
- **Iconografía y Formularios:** Corrección de la ubicación de los iconos dentro de los inputs de inicio de sesión y registro para que nunca se solapen con los textos del *placeholder* o del contenido escrito, garantizando una excelente legibilidad.
- **Temática:** Tema moderno (con posibilidad de modo oscuro/claro y acentos verdes) que favorece la lectura, con modales claros para notificaciones. Adaptado a dispositivos móviles para garantizar una visualización perfecta independientemente de la resolución de pantalla.
