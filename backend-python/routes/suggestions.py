from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import SessionLocal
from models.book import Book
from models.suggestion_history import SuggestionHistory
from ai.recommender import get_recommendations
from utils.serializers import serialize_book
from datetime import datetime

suggestions_bp = Blueprint('suggestions', __name__, url_prefix='/api/suggestions')

@suggestions_bp.route('', methods=['GET'])
@jwt_required()
def get_suggestions():
    """Obtener sugerencias de libros para el usuario autenticado (vía Ollama/Mistral)"""
    user_id = get_jwt_identity()
    
    db = SessionLocal()
    try:
        # Extraer parámetros de los query params
        from flask import request
        preferred_genre = request.args.get('genre', None)
        skip_history = request.args.get('skip_history', 'false').lower() == 'true'
        
        # Obtener recomendaciones del LLM
        result = get_recommendations(user_id, n=5, preferred_genre=preferred_genre, skip_history=skip_history)
        book_ids = result.get('book_ids', [])
        explanation = result.get('explanation', '')
        
        if not book_ids:
            return jsonify({
                'message': 'No hay suficientes datos para generar recomendaciones',
                'explanation': explanation
            }), 404
        
        # Obtener detalles de los libros recomendados
        books = db.query(Book).filter(Book.id.in_(book_ids)).all()
        # Mantener el orden del LLM
        books_dict = {book.id: book for book in books}
        ordered_books = [books_dict[bid] for bid in book_ids if bid in books_dict]
        recommendations = [serialize_book(book) for book in ordered_books]
        
        # Guardar en historial
        suggestion_history = SuggestionHistory(
            user_id=user_id,
            created_at=datetime.utcnow()
        )
        suggestion_history.set_suggested_book_ids(book_ids)
        db.add(suggestion_history)
        db.commit()
        
        return jsonify({
            'suggestions': recommendations,
            'explanation': explanation,
            'timestamp': suggestion_history.created_at.isoformat()
        }), 200
        
    except Exception as e:
        db.rollback()
        return jsonify({'message': f'Error al generar sugerencias: {str(e)}'}), 500
    finally:
        db.close()

@suggestions_bp.route('/history', methods=['GET'])
@jwt_required()
def get_suggestions_history():
    """Obtener historial de sugerencias del usuario"""
    user_id = get_jwt_identity()
    
    db = SessionLocal()
    try:
        history = db.query(SuggestionHistory).filter(
            SuggestionHistory.user_id == user_id
        ).order_by(SuggestionHistory.created_at.desc()).limit(10).all()
        
        result = []
        for entry in history:
            book_ids = entry.get_suggested_book_ids()
            books = db.query(Book).filter(Book.id.in_(book_ids)).all()
            result.append({
                'timestamp': entry.created_at.isoformat(),
                'suggestions': [serialize_book(book) for book in books]
            })
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({'message': f'Error al obtener historial: {str(e)}'}), 500
    finally:
        db.close()
