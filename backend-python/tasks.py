from datetime import datetime, timedelta
from database import SessionLocal
from models.loan import Loan
from extensions import mail
from flask_mail import Message

def check_expiring_loans(app):
    """
    Función que revisa los préstamos próximos a vencer
    y notifica a los usuarios por correo.
    """
    with app.app_context():
        db = SessionLocal()
        try:
            now = datetime.utcnow()
            # Préstamos no devueltos y no notificados
            # Que vencen en los próximos 2 días
            target_date = now + timedelta(days=2)
            
            loans_to_notify = db.query(Loan).filter(
                Loan.return_date.is_(None),
                Loan.is_notified == False,
                Loan.expected_return_date <= target_date
            ).all()
            
            for loan in loans_to_notify:
                user = loan.user
                book = loan.book
                
                if not user or not user.email:
                    continue
                
                msg = Message(
                    subject="Recordatorio de devolución de libro",
                    recipients=[user.email]
                )
                
                msg.body = f"""Hola {user.nombre},

Te recordamos que la fecha estimada de devolución para el libro '{book.titulo}' es el {loan.expected_return_date.strftime('%Y-%m-%d')}.
Por favor, asegúrate de devolverlo a tiempo para evitar penalizaciones.

Gracias,
El equipo de la Biblioteca Alauxa
"""
                try:
                    mail.send(msg)
                    # Marcar como notificado
                    loan.is_notified = True
                    db.commit()
                    print(f"Notificación enviada a {user.email} por el libro '{book.titulo}'")
                except Exception as e:
                    print(f"Error al enviar correo a {user.email}: {str(e)}")
                    db.rollback()
                    
        except Exception as e:
            print(f"Error en tarea de revisión de préstamos: {str(e)}")
        finally:
            db.close()
