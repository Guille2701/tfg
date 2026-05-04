"""
Script de migración para añadir columnas:
- book.hidden (BOOLEAN, default FALSE) - Soft delete de libros
- loan.penalty_days (INTEGER, default 0) - Penalización por retraso

Ejecutar: python migrate_add_hidden_penalty.py
"""

from database import engine
from sqlalchemy import text

def migrate():
    with engine.connect() as conn:
        # Añadir columna 'hidden' a la tabla 'book'
        try:
            conn.execute(text("ALTER TABLE book ADD COLUMN hidden BOOLEAN NOT NULL DEFAULT FALSE"))
            print("✅ Columna 'hidden' añadida a la tabla 'book'")
        except Exception as e:
            if 'Duplicate column' in str(e) or 'already exists' in str(e):
                print("ℹ️  La columna 'hidden' ya existe en 'book'")
            else:
                print(f"❌ Error al añadir 'hidden': {e}")

        # Añadir columna 'penalty_days' a la tabla 'loan'
        try:
            conn.execute(text("ALTER TABLE loan ADD COLUMN penalty_days INTEGER NOT NULL DEFAULT 0"))
            print("✅ Columna 'penalty_days' añadida a la tabla 'loan'")
        except Exception as e:
            if 'Duplicate column' in str(e) or 'already exists' in str(e):
                print("ℹ️  La columna 'penalty_days' ya existe en 'loan'")
            else:
                print(f"❌ Error al añadir 'penalty_days': {e}")

        conn.commit()
        print("\n🎉 Migración completada")

if __name__ == '__main__':
    migrate()
