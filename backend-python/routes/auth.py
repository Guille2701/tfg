from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from database import SessionLocal
from models.user import User
from auth.password import hash_password, verify_password
from utils.validators import validate_user_data

auth_bp = Blueprint('auth', __name__, url_prefix='/api')

@auth_bp.route('/register', methods=['POST'])
def register():
    """Registro de usuario - migrado de RegistrationController.php"""
    data = request.get_json()
    
    if not data:
        return jsonify({'message': 'No se recibieron datos'}), 400
    
    # Validar datos
    is_valid, error_message = validate_user_data(data)
    if not is_valid:
        return jsonify({'message': error_message}), 400
    
    db = SessionLocal()
    try:
        # Verificar si el usuario ya existe
        existing_user = db.query(User).filter(User.username == data['username']).first()
        if existing_user:
            return jsonify({'message': 'El usuario ya existe'}), 400
        
        # Verificar email si se proporciona
        if 'email' in data and data['email']:
            existing_email = db.query(User).filter(User.email == data['email']).first()
            if existing_email:
                return jsonify({'message': 'El email ya está registrado'}), 400
        
        # Crear nuevo usuario
        new_user = User(
            username=data['username'],
            nombre=data.get('nombre', data['username']),
            email=data.get('email', f"{data['username']}@example.com"),
            is_minor=data.get('is_minor', False),
            responsible_adult_email=data.get('responsible_adult_email', None),
            password=hash_password(data['password'])
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # Crear token JWT automáticamente
        access_token = create_access_token(identity=str(new_user.id))
        
        return jsonify({
            'access_token': access_token,
            'user': {
                'id': new_user.id,
                'username': new_user.username,
                'nombre': new_user.nombre,
                'email': new_user.email,
                'roles': new_user.get_roles()
            }
        }), 201
        
    except Exception as e:
        db.rollback()
        return jsonify({'message': f'Error al registrar usuario: {str(e)}'}), 500
    finally:
        db.close()

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login de usuario - migrado de SecurityController.php"""
    data = request.get_json()
    
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({'message': 'Username y password son requeridos'}), 400
    
    db = SessionLocal()
    try:
        # Buscar usuario
        user = db.query(User).filter(User.username == data['username']).first()
        
        if not user or not verify_password(user.password, data['password']):
            return jsonify({'message': 'Credenciales inválidas'}), 401
        
        # Crear token JWT
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'access_token': access_token,
            'user': {
                'id': user.id,
                'username': user.username,
                'nombre': user.nombre,
                'email': user.email,
                'roles': user.get_roles()
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Error al iniciar sesión: {str(e)}'}), 500
    finally:
        db.close()
