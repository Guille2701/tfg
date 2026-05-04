from functools import wraps
from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import SessionLocal
from models.user import User


def admin_required(fn):
    """
    Decorador que protege un endpoint para que solo sea accesible
    por usuarios con ROLE_ADMIN.
    Combina @jwt_required() con verificación de rol.
    """
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user_id = int(get_jwt_identity())  # Convertir de string a int
        db = SessionLocal()
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                return jsonify({'message': 'Usuario no encontrado'}), 404

            roles = user.get_roles()
            if 'ROLE_ADMIN' not in roles:
                return jsonify({'message': 'Acceso denegado. Se requiere rol de administrador'}), 403

            return fn(*args, **kwargs)
        finally:
            db.close()

    return wrapper
