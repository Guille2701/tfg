"""
Script para inicializar la base de datos
Crea todas las tablas definidas en los modelos SQLAlchemy
"""

from database import Base, engine
from models import User, Book, Loan, SuggestionHistory

def init_db():
    """Crea todas las tablas en la base de datos"""
    print("Creando tablas en la base de datos...")
    
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Tablas creadas exitosamente:")
        print("   - user")
        print("   - book")
        print("   - loan")
        print("   - suggestion_history")
    except Exception as e:
        print(f"❌ Error al crear tablas: {e}")
        return False
    
    return True

if __name__ == '__main__':
    init_db()
