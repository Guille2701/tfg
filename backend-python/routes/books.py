from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from database import SessionLocal
from models.book import Book
from models.user import User
from utils.serializers import serialize_book

books_bp = Blueprint('books', __name__, url_prefix='/api/books')


@books_bp.route('/genres', methods=['GET'])
def get_genres():
    """Obtener lista de géneros únicos presentes en la base de datos"""
    db = SessionLocal()
    try:
        # Obtener géneros únicos no nulos ni vacíos (solo de libros visibles)
        genres = db.query(Book.genero).filter(
            Book.genero != None,
            Book.genero != '',
            Book.hidden == False
        ).distinct().all()
        
        # Aplanar lista de tuplas y limpiar
        genre_list = sorted([g[0].strip() for g in genres if g[0]])
        return jsonify(genre_list), 200
    except Exception as e:
        return jsonify({'message': f'Error al obtener géneros: {str(e)}'}), 500
    finally:
        db.close()


@books_bp.route('', methods=['GET'])
def list_books():
    """
    Listar libros con filtros opcionales por query params.
    - ?q=texto → filtra por título (LIKE)
    - ?genero=ficcion → filtra por género (exact)
    - ?show_hidden=true → muestra libros ocultos (solo admin)
    """
    db = SessionLocal()
    try:
        query = db.query(Book)

        # Comprobar si el usuario es admin para mostrar libros ocultos
        show_hidden = request.args.get('show_hidden', 'false').lower() == 'true'
        if show_hidden:
            try:
                verify_jwt_in_request()
                user_id = get_jwt_identity()
                user = db.query(User).filter(User.id == user_id).first()
                is_admin = user and 'ROLE_ADMIN' in user.get_roles()
                if not is_admin:
                    show_hidden = False
            except Exception:
                show_hidden = False
        
        if not show_hidden:
            query = query.filter(Book.hidden == False)

        # Filtro por título
        search_q = request.args.get('q', '').strip()
        if search_q:
            query = query.filter(Book.nombre_libro.ilike(f'%{search_q}%'))

        # Filtro por género
        genero = request.args.get('genero', '').strip()
        if genero:
            query = query.filter(Book.genero.ilike(f'%{genero}%'))

        books = query.all()
        data = [serialize_book(book) for book in books]
        return jsonify(data), 200
    except Exception as e:
        return jsonify({'message': f'Error al obtener libros: {str(e)}'}), 500
    finally:
        db.close()


@books_bp.route('/<nombre_libro>', methods=['GET'])
def filter_books(nombre_libro):
    """Filtrar libros por nombre (legacy endpoint)"""
    db = SessionLocal()
    try:
        books = db.query(Book).filter(
            Book.nombre_libro.ilike(f'%{nombre_libro}%')
        ).all()

        if not books:
            return jsonify({'message': 'No se encontraron libros que coincidan'}), 404

        data = [serialize_book(book) for book in books]
        return jsonify(data), 200

    except Exception as e:
        return jsonify({'message': f'Error al filtrar libros: {str(e)}'}), 500
    finally:
        db.close()
