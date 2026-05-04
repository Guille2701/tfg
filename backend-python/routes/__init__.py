from .auth import auth_bp
from .books import books_bp
from .loans import loans_bp
from .suggestions import suggestions_bp
from .admin import admin_bp
from .events import events_bp

__all__ = ['auth_bp', 'books_bp', 'loans_bp', 'suggestions_bp', 'admin_bp', 'events_bp']
