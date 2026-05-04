from flask import Blueprint, jsonify
from database import SessionLocal
from models.event import Event
from utils.serializers import serialize_event

events_bp = Blueprint('events', __name__, url_prefix='/api/events')


@events_bp.route('', methods=['GET'])
def list_events():
    """Listar todos los eventos (público)"""
    db = SessionLocal()
    try:
        events = db.query(Event).order_by(Event.event_date.asc()).all()
        data = [serialize_event(event) for event in events]
        return jsonify(data), 200
    except Exception as e:
        return jsonify({'message': f'Error al obtener eventos: {str(e)}'}), 500
    finally:
        db.close()
