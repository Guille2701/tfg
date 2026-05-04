from flask import Blueprint, request, jsonify, current_app
import os
import uuid
from werkzeug.utils import secure_filename
from database import SessionLocal
from models.book import Book
from models.event import Event
from models.user import User
from auth.decorators import admin_required
from auth.password import hash_password
from utils.serializers import serialize_book, serialize_event, serialize_user

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@admin_bp.route('/upload', methods=['POST'])
@admin_required
def upload_file():
    """Subir una imagen al servidor"""
    if 'file' not in request.files:
        return jsonify({'message': 'No se encontró el archivo'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'message': 'No se seleccionó ningún archivo'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        # Añadir un UUID para evitar colisiones de nombres
        extension = filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4().hex}.{extension}"
        
        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(file_path)
        
        # Generar URL pública (asumiendo que Flask sirve /static)
        # El base URL se puede configurar, pero por ahora devolvemos la ruta relativa
        # que el frontend puede prefijar con la API_URL
        file_url = f"/static/uploads/{unique_filename}"
        
        return jsonify({
            'message': 'Imagen subida correctamente',
            'url': file_url
        }), 201
    
    return jsonify({'message': 'Tipo de archivo no permitido'}), 400


# ═══════════════════════════════════════════
#  LIBROS - CRUD Admin
# ═══════════════════════════════════════════

@admin_bp.route('/books', methods=['POST'])
@admin_required
def create_book():
    """Crear un nuevo libro"""
    data = request.get_json()
    if not data:
        return jsonify({'message': 'No se recibieron datos'}), 400

    required = ['nombre_libro', 'autor', 'estanteria', 'balda', 'cod_barras', 'sinopsis']
    for field in required:
        if field not in data or not data[field]:
            return jsonify({'message': f'El campo {field} es requerido'}), 400

    db = SessionLocal()
    try:
        book = Book(
            nombre_libro=data['nombre_libro'],
            autor=data['autor'],
            estanteria=data['estanteria'],
            balda=data['balda'],
            cod_barras=data['cod_barras'],
            sinopsis=data['sinopsis'],
            genero=data.get('genero', ''),
            prestado=data.get('prestado', False),
            image_url=data.get('image_url')
        )
        print(book)
        db.add(book)
        db.commit()
        db.refresh(book)
        return jsonify(serialize_book(book)), 201
    except Exception as e:
        db.rollback()
        return jsonify({'message': f'Error al crear libro: {str(e)}'}), 500
    finally:
        db.close()


@admin_bp.route('/books/<int:book_id>', methods=['PUT'])
@admin_required
def update_book(book_id):
    """Editar un libro existente"""
    data = request.get_json()
    if not data:
        return jsonify({'message': 'No se recibieron datos'}), 400

    db = SessionLocal()
    try:
        book = db.query(Book).filter(Book.id == book_id).first()
        if not book:
            return jsonify({'message': 'Libro no encontrado'}), 404

        # Actualizar campos proporcionados
        if 'nombre_libro' in data:
            book.nombre_libro = data['nombre_libro']
        if 'autor' in data:
            book.autor = data['autor']
        if 'estanteria' in data:
            book.estanteria = data['estanteria']
        if 'balda' in data:
            book.balda = data['balda']
        if 'cod_barras' in data:
            book.cod_barras = data['cod_barras']
        if 'sinopsis' in data:
            book.sinopsis = data['sinopsis']
        if 'genero' in data:
            book.genero = data['genero']
        if 'prestado' in data:
            book.prestado = data['prestado']
        if 'image_url' in data:
            book.image_url = data['image_url']

        db.commit()
        db.refresh(book)
        return jsonify(serialize_book(book)), 200
    except Exception as e:
        db.rollback()
        return jsonify({'message': f'Error al actualizar libro: {str(e)}'}), 500
    finally:
        db.close()


@admin_bp.route('/books/<int:book_id>', methods=['DELETE'])
@admin_required
def delete_book(book_id):
    """Ocultar un libro (soft delete) - marcar como hidden"""
    db = SessionLocal()
    try:
        book = db.query(Book).filter(Book.id == book_id).first()
        if not book:
            return jsonify({'message': 'Libro no encontrado'}), 404

        book.hidden = not book.hidden
        db.commit()
        
        status = 'oculto' if book.hidden else 'visible'
        return jsonify({'message': f'Libro marcado como {status}', 'hidden': book.hidden}), 200
    except Exception as e:
        db.rollback()
        return jsonify({'message': f'Error al actualizar libro: {str(e)}'}), 500
    finally:
        db.close()


# ═══════════════════════════════════════════
#  EVENTOS - CRUD Admin
# ═══════════════════════════════════════════

@admin_bp.route('/events', methods=['POST'])
@admin_required
def create_event():
    """Crear un nuevo evento"""
    data = request.get_json()
    if not data:
        return jsonify({'message': 'No se recibieron datos'}), 400

    required = ['title', 'category', 'description', 'event_date', 'time', 'location']
    for field in required:
        if field not in data or not data[field]:
            return jsonify({'message': f'El campo {field} es requerido'}), 400

    db = SessionLocal()
    try:
        from datetime import datetime
        event_date = datetime.strptime(data['event_date'], '%Y-%m-%d').date()

        event = Event(
            title=data['title'],
            category=data['category'],
            category_color=data.get('category_color', 'text-primary'),
            description=data['description'],
            event_date=event_date,
            time=data['time'],
            location=data['location'],
            image_url=data.get('image_url')
        )
        db.add(event)
        db.commit()
        db.refresh(event)
        return jsonify(serialize_event(event)), 201
    except ValueError:
        return jsonify({'message': 'Formato de fecha inválido. Use YYYY-MM-DD'}), 400
    except Exception as e:
        db.rollback()
        return jsonify({'message': f'Error al crear evento: {str(e)}'}), 500
    finally:
        db.close()


@admin_bp.route('/events/<int:event_id>', methods=['PUT'])
@admin_required
def update_event(event_id):
    """Editar un evento existente"""
    data = request.get_json()
    if not data:
        return jsonify({'message': 'No se recibieron datos'}), 400

    db = SessionLocal()
    try:
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            return jsonify({'message': 'Evento no encontrado'}), 404

        if 'title' in data:
            event.title = data['title']
        if 'category' in data:
            event.category = data['category']
        if 'category_color' in data:
            event.category_color = data['category_color']
        if 'description' in data:
            event.description = data['description']
        if 'event_date' in data:
            from datetime import datetime
            event.event_date = datetime.strptime(data['event_date'], '%Y-%m-%d').date()
        if 'time' in data:
            event.time = data['time']
        if 'location' in data:
            event.location = data['location']
        if 'image_url' in data:
            event.image_url = data['image_url']

        db.commit()
        db.refresh(event)
        return jsonify(serialize_event(event)), 200
    except ValueError:
        return jsonify({'message': 'Formato de fecha inválido. Use YYYY-MM-DD'}), 400
    except Exception as e:
        db.rollback()
        return jsonify({'message': f'Error al actualizar evento: {str(e)}'}), 500
    finally:
        db.close()


@admin_bp.route('/events/<int:event_id>', methods=['DELETE'])
@admin_required
def delete_event(event_id):
    """Eliminar un evento"""
    db = SessionLocal()
    try:
        event = db.query(Event).filter(Event.id == event_id).first()
        if not event:
            return jsonify({'message': 'Evento no encontrado'}), 404

        db.delete(event)
        db.commit()
        return jsonify({'message': 'Evento eliminado correctamente'}), 200
    except Exception as e:
        db.rollback()
        return jsonify({'message': f'Error al eliminar evento: {str(e)}'}), 500
    finally:
        db.close()


# ═══════════════════════════════════════════
#  USUARIOS - CRUD Admin
# ═══════════════════════════════════════════

@admin_bp.route('/users', methods=['GET'])
@admin_required
def list_users():
    """Listar todos los usuarios"""
    db = SessionLocal()
    try:
        users = db.query(User).all()
        data = [serialize_user(u) for u in users]
        return jsonify(data), 200
    except Exception as e:
        return jsonify({'message': f'Error al obtener usuarios: {str(e)}'}), 500
    finally:
        db.close()


@admin_bp.route('/users', methods=['POST'])
@admin_required
def create_user():
    """Crear un nuevo usuario (admin)"""
    data = request.get_json()
    if not data:
        return jsonify({'message': 'No se recibieron datos'}), 400

    required = ['username', 'password', 'email']
    for field in required:
        if field not in data or not data[field]:
            return jsonify({'message': f'El campo {field} es requerido'}), 400

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.username == data['username']).first()
        if existing:
            return jsonify({'message': 'El usuario ya existe'}), 400

        user = User(
            username=data['username'],
            nombre=data.get('nombre', data['username']),
            email=data['email'],
            is_minor=data.get('is_minor', False),
            password=hash_password(data['password'])
        )

        if 'roles' in data:
            user.set_roles(data['roles'])

        db.add(user)
        db.commit()
        db.refresh(user)
        return jsonify(serialize_user(user)), 201
    except Exception as e:
        db.rollback()
        return jsonify({'message': f'Error al crear usuario: {str(e)}'}), 500
    finally:
        db.close()


@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@admin_required
def update_user(user_id):
    """Editar un usuario existente"""
    data = request.get_json()
    if not data:
        return jsonify({'message': 'No se recibieron datos'}), 400

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return jsonify({'message': 'Usuario no encontrado'}), 404

        if 'username' in data:
            user.username = data['username']
        if 'nombre' in data:
            user.nombre = data['nombre']
        if 'email' in data:
            user.email = data['email']
        if 'is_minor' in data:
            user.is_minor = data['is_minor']
        if 'password' in data and data['password']:
            user.password = hash_password(data['password'])
        if 'roles' in data:
            user.set_roles(data['roles'])

        db.commit()
        db.refresh(user)
        return jsonify(serialize_user(user)), 200
    except Exception as e:
        db.rollback()
        return jsonify({'message': f'Error al actualizar usuario: {str(e)}'}), 500
    finally:
        db.close()


@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    """Eliminar un usuario"""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return jsonify({'message': 'Usuario no encontrado'}), 404

        db.delete(user)
        db.commit()
        return jsonify({'message': 'Usuario eliminado correctamente'}), 200
    except Exception as e:
        db.rollback()
        return jsonify({'message': f'Error al eliminar usuario: {str(e)}'}), 500
    finally:
        db.close()
