"""
Backend de Biblioteca - Flask API
Migrado desde Symfony/PHP a Python/Flask
"""

from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config


def _seed_admin():
    """Crea un usuario administrador por defecto si no existe ninguno. Sin output."""
    import json
    import os
    from database import SessionLocal
    from models.user import User
    from auth.password import hash_password

    db = SessionLocal()
    try:
        # Comprobar si ya existe algún usuario con rol ROLE_ADMIN
        admins = db.query(User).all()
        has_admin = any('ROLE_ADMIN' in (json.loads(u.roles) if u.roles else []) for u in admins)
        if has_admin:
            return

        username = os.environ.get('ADMIN_USERNAME', 'admin')
        password = os.environ.get('ADMIN_PASSWORD', 'admin1234')
        email    = os.environ.get('ADMIN_EMAIL', 'admin@alauxa.com')

        admin = User(
            username=username,
            nombre='Administrador',
            email=email,
            is_minor=False,
            password=hash_password(password),
            roles=json.dumps(['ROLE_ADMIN', 'ROLE_USER']),
        )
        db.add(admin)
        db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()


def create_app():
    """Factory para crear la aplicación Flask"""
    app = Flask(__name__)
    
    # Cargar configuración
    app.config.from_object(Config)
    
    # Asegurar que el directorio de uploads existe
    import os
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Configurar CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Inicializar Flask-Mail
    from extensions import mail
    mail.init_app(app)
    
    # Inicializar Scheduler
    from apscheduler.schedulers.background import BackgroundScheduler
    from tasks import check_expiring_loans
    
    scheduler = BackgroundScheduler()
    # Ejecuta la revisión todos los días a las 09:00 AM (por ejemplo)
    # Para probar ahora, se puede poner interval: scheduler.add_job(func=lambda: check_expiring_loans(app), trigger="interval", minutes=60)
    scheduler.add_job(func=lambda: check_expiring_loans(app), trigger="cron", hour=9, minute=0)
    scheduler.start()

    
    # Configurar JWT
    jwt = JWTManager(app)
    
    # Registrar blueprints (rutas)
    from routes import auth_bp, books_bp, loans_bp, suggestions_bp, admin_bp, events_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(books_bp)
    app.register_blueprint(loans_bp)
    app.register_blueprint(suggestions_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(events_bp)

    # Crear tablas si no existen (importar todos los modelos primero)
    from database import Base, engine, SessionLocal
    from models import book, event, loan, suggestion_history, user  # noqa: F401
    Base.metadata.create_all(bind=engine)

    # Crear usuario administrador por defecto si no existe ninguno
    _seed_admin()
    
    # Ruta de prueba
    @app.route('/')
    def index():
        return {
            'message': 'API de Biblioteca - Backend Python/Flask',
            'status': 'running',
            'endpoints': {
                'auth': '/api/register, /api/login',
                'books': '/api/books, /api/books?q=titulo&genero=ficcion',
                'loans': '/api/loans/my',
                'suggestions': '/api/suggestions, /api/suggestions/history',
                'events': '/api/events',
                'admin': '/api/admin/books, /api/admin/events, /api/admin/users'
            }
        }
    
    return app

if __name__ == '__main__':
    import os
    app = create_app()
    port = int(os.environ.get('PORT', 5000))
    print(f"🚀 Servidor Flask iniciado en puerto {port}")
    print("📚 API de Biblioteca lista para usar")
    app.run(host='0.0.0.0', port=port, debug=True)
