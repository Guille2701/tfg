from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import SessionLocal
from models.loan import Loan
from models.book import Book
from models.user import User
from utils.serializers import serialize_loan
from datetime import datetime, timedelta

loans_bp = Blueprint('loans', __name__, url_prefix='/api/loans')


def get_suspension_info(db, user_id):
    """Calcula si el usuario está suspendido por retrasos previos o actuales."""
    try:
        user_id = int(user_id)
    except (ValueError, TypeError):
        return {'suspended': False, 'suspension_until': None, 'total_penalty_days': 0, 'days_remaining': 0}

    now = datetime.utcnow()
    
    # 1. Bloqueo inmediato si tiene algún libro actualmente vencido (no devuelto)
    overdue_loan = db.query(Loan).filter(
        Loan.user_id == user_id,
        Loan.return_date.is_(None),
        Loan.expected_return_date < now
    ).first()
    
    if overdue_loan:
        return {
            'suspended': True,
            'suspension_until': overdue_loan.expected_return_date + timedelta(days=1), # Sanción simbólica mientras no devuelva
            'total_penalty_days': 0,
            'days_remaining': 1,
            'reason': 'Tienes libros vencidos pendientes de devolución'
        }

    # 2. Buscar préstamos ya devueltos con penalización activa
    late_loans = (
        db.query(Loan)
        .filter(
            Loan.user_id == user_id,
            Loan.return_date.isnot(None),
            Loan.penalty_days > 0,
        )
        .all()
    )

    suspension_until = None
    for loan in late_loans:
        candidate = loan.return_date + timedelta(days=loan.penalty_days)
        if suspension_until is None or candidate > suspension_until:
            suspension_until = candidate

    total_penalty_days = sum(l.penalty_days for l in late_loans)
    suspended = suspension_until is not None and suspension_until > now

    return {
        'suspended': suspended,
        'suspension_until': suspension_until,
        'total_penalty_days': total_penalty_days,
        'days_remaining': max(0, (suspension_until - now).days + 1) if suspended else 0,
    }

@loans_bp.route('/status', methods=['GET'])
@jwt_required()
def loan_status():
    """Devuelve el estado de sanción del usuario autenticado"""
    user_id = int(get_jwt_identity())
    db = SessionLocal()
    try:
        info = get_suspension_info(db, user_id)
        return jsonify({
            'suspended': info['suspended'],
            'suspension_until': info['suspension_until'].isoformat() if info['suspension_until'] else None,
            'days_remaining': info['days_remaining'],
            'total_penalty_days': info['total_penalty_days'],
        }), 200
    except Exception as e:
        return jsonify({'message': f'Error al obtener estado: {str(e)}'}), 500
    finally:
        db.close()


@loans_bp.route('/my', methods=['GET'])
@jwt_required()
def my_loans():
    """Obtener préstamos del usuario autenticado - migrado de LoanController.php"""
    user_id = int(get_jwt_identity())
    
    db = SessionLocal()
    try:
        loans = db.query(Loan).filter(Loan.user_id == user_id).order_by(Loan.loan_date.desc()).all()
        data = [serialize_loan(loan) for loan in loans]
        return jsonify(data), 200
        
    except Exception as e:
        return jsonify({'message': f'Error al obtener préstamos: {str(e)}'}), 500
    finally:
        db.close()

@loans_bp.route('/all', methods=['GET'])
@jwt_required()
def all_loans():
    """Obtener todos los préstamos (solo administradores)"""
    user_id = int(get_jwt_identity())
    
    db = SessionLocal()
    try:
        # Verificar que el usuario es administrador
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return jsonify({'message': 'Usuario no encontrado'}), 404
        
        # Verificar si tiene el rol de administrador
        user_roles = user.get_roles()
        if 'ROLE_ADMIN' not in user_roles:
            return jsonify({'message': 'Acceso denegado. Solo administradores.'}), 403
        
        # Obtener todos los préstamos con información del usuario (ordenados por fecha descendente)
        loans = db.query(Loan).order_by(Loan.loan_date.desc()).all()
        
        # Serializar con información adicional del usuario
        data = []
        for loan in loans:
            loan_data = serialize_loan(loan)
            # Añadir información del usuario
            if loan.user:
                loan_data['user'] = {
                    'id': loan.user.id,
                    'username': loan.user.username,
                    'nombre': loan.user.nombre,
                    'email': loan.user.email
                }
            data.append(loan_data)
        
        return jsonify(data), 200
        
    except Exception as e:
        return jsonify({'message': f'Error al obtener préstamos: {str(e)}'}), 500
    finally:
        db.close()

@loans_bp.route('/', methods=['POST'])
@jwt_required()
def create_loan():
    """Crear un nuevo préstamo de libro"""
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    if not data or 'book_id' not in data:
        return jsonify({'message': 'El ID del libro es requerido'}), 400
    
    book_id = data['book_id']
    
    db = SessionLocal()
    try:
        # Verificar que el usuario no está suspendido por retrasos
        suspension = get_suspension_info(db, user_id)
        if suspension['suspended']:
            until_str = suspension['suspension_until'].strftime('%d/%m/%Y')
            return jsonify({
                'message': (
                    f'Tu cuenta está suspendida hasta el {until_str} '
                    f'({suspension["days_remaining"]} día(s) restante(s)) '
                    f'debido a retrasos en devoluciones anteriores.'
                ),
                'suspended': True,
                'suspension_until': suspension['suspension_until'].isoformat(),
                'days_remaining': suspension['days_remaining'],
            }), 403

        # Verificar que el libro existe
        book = db.query(Book).filter(Book.id == book_id).first()
        if not book:
            return jsonify({'message': 'Libro no encontrado'}), 404

        # Verificar que el libro está disponible (no tiene préstamos activos)
        active_loan = db.query(Loan).filter(
            Loan.book_id == book_id,
            Loan.return_date.is_(None)
        ).first()

        if active_loan:
            return jsonify({'message': 'El libro no está disponible actualmente'}), 400

        # Verificar que el libro no está marcado como prestado
        if book.prestado:
            return jsonify({'message': 'El libro ya está marcado como prestado'}), 400
        
        # Verificar que el usuario no tiene ya un préstamo activo de este libro
        user_active_loan = db.query(Loan).filter(
            Loan.book_id == book_id,
            Loan.user_id == user_id,
            Loan.return_date.is_(None)
        ).first()
        
        if user_active_loan:
            return jsonify({'message': 'Ya tienes un préstamo activo de este libro'}), 400
        
        # Crear el préstamo (2 minutos para la demo, 14 días en producción)
        loan = Loan(
            user_id=user_id,
            book_id=book_id,
            loan_date=datetime.utcnow(),
            expected_return_date=datetime.utcnow() + timedelta(minutes=2),
            is_notified=False
        )
        
        # Marcar el libro como prestado
        book.prestado = True
        
        db.add(loan)
        db.commit()
        db.refresh(loan)
        
        return jsonify({
            'message': 'Préstamo creado exitosamente',
            'loan': serialize_loan(loan)
        }), 201
        
    except Exception as e:
        db.rollback()
        return jsonify({'message': f'Error al crear préstamo: {str(e)}'}), 500
    finally:
        db.close()

@loans_bp.route('/<int:loan_id>/return', methods=['PUT'])
@jwt_required()
def return_loan(loan_id):
    """Devolver un libro prestado"""
    user_id = int(get_jwt_identity())
    
    db = SessionLocal()
    try:
        # Obtener el préstamo
        loan = db.query(Loan).filter(Loan.id == loan_id).first()
        if not loan:
            return jsonify({'message': 'Préstamo no encontrado'}), 404
        
        # Verificar que el préstamo pertenece al usuario (o es admin)
        user = db.query(User).filter(User.id == user_id).first()
        user_roles = user.get_roles() if user else []
        is_admin = 'ROLE_ADMIN' in user_roles
        
        if not is_admin and loan.user_id != user_id:
            return jsonify({'message': 'No tienes permiso para devolver este préstamo'}), 403
        
        # Verificar que el préstamo no ha sido devuelto ya
        if loan.return_date:
            return jsonify({'message': 'Este préstamo ya ha sido devuelto'}), 400
        
        # Marcar como devuelto
        loan.return_date = datetime.utcnow()
        
        # Calcular penalización si se devuelve tarde
        penalty_days = 0
        if loan.return_date > loan.expected_return_date:
            delta = loan.return_date - loan.expected_return_date
            # Para la demo: si hay cualquier retraso, al menos 1 día de penalización
            # (En producción real usaríamos solo delta.days)
            penalty_days = max(1, delta.days)
            loan.penalty_days = penalty_days
        
        # Marcar el libro como disponible
        book = db.query(Book).filter(Book.id == loan.book_id).first()
        if book:
            book.prestado = False
        
        db.commit()
        db.refresh(loan)
        
        response = {
            'message': 'Libro devuelto exitosamente',
            'loan': serialize_loan(loan)
        }
        
        if penalty_days > 0:
            response['message'] = f'Libro devuelto con {penalty_days} día(s) de retraso'
            response['penalty_days'] = penalty_days
        
        return jsonify(response), 200
        
    except Exception as e:
        db.rollback()
        return jsonify({'message': f'Error al devolver libro: {str(e)}'}), 500
    finally:
        db.close()
