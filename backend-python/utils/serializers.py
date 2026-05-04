def serialize_user(user):
    """Convierte un objeto User a diccionario (sin password)"""
    return {
        'id': user.id,
        'username': user.username,
        'nombre': user.nombre,
        'email': user.email,
        'is_minor': user.is_minor,  # snake_case para consistencia
        'responsible_adult_id': user.responsible_adult_id,  # snake_case
        'roles': user.get_roles()
    }


def serialize_book(book):
    """Convierte un objeto Book a diccionario"""
    return {
        'id': book.id,
        'nombreLibro': book.nombre_libro,
        'autor': book.autor,
        'estanteria': book.estanteria,
        'balda': book.balda,
        'codBarras': book.cod_barras,
        'prestado': book.prestado,
        'genero': book.genero or '',
        'sinopsis': book.sinopsis,
        'imageUrl': book.image_url,
        'hidden': book.hidden
    }


def serialize_loan(loan):
    """Convierte un objeto Loan a diccionario"""
    return {
        'id': loan.id,
        'user_id': loan.user_id,
        'book_id': loan.book_id,
        'book': serialize_book(loan.book) if loan.book else None,
        'loan_date': loan.loan_date.isoformat() if loan.loan_date else None,
        'expected_return_date': loan.expected_return_date.isoformat() if loan.expected_return_date else None,
        'return_date': loan.return_date.isoformat() if loan.return_date else None,
        'is_notified': loan.is_notified,
        'penalty_days': loan.penalty_days
    }



def serialize_event(event):
    """Convierte un objeto Event a diccionario"""
    return {
        'id': event.id,
        'title': event.title,
        'category': event.category,
        'categoryColor': event.category_color,
        'description': event.description,
        'eventDate': event.event_date.strftime('%Y-%m-%d') if event.event_date else None,
        'day': str(event.event_date.day) if event.event_date else '',
        'month': event.event_date.strftime('%b') if event.event_date else '',
        'time': event.time,
        'location': event.location,
        'imageUrl': event.image_url
    }
