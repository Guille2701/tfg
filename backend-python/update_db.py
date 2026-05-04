from database import engine, Base
from models import User, Book, Loan, Event, SuggestionHistory
from sqlalchemy import create_engine, text
from config import Config

def update_database():
    print("🔄 Actualizando base de datos...")
    
    # 1. Crear nuevas tablas (como 'event')
    try:
        # Esto creará las tablas que no existan aún
        Base.metadata.create_all(bind=engine)
        print("✅ Tablas verificadas/creadas correctamente (incluyendo 'event').")
    except Exception as e:
        print(f"❌ Error al crear tablas: {e}")

    # 2. Añadir columnas faltantes de forma manual (como 'genero' en 'book')
    # SQL Alchemy Core no añade columnas automáticamente en create_all si la tabla ya existe
    db_uri = Config.SQLALCHEMY_DATABASE_URI
    temp_engine = create_engine(db_uri)
    
    with temp_engine.connect() as conn:
        print("Checking for 'genero' column in 'book' table...")
        try:
            # MySQL syntax to add column if not exists
            conn.execute(text("ALTER TABLE book ADD COLUMN genero VARCHAR(100) AFTER prestado"))
            conn.commit()
            print("✅ Columna 'genero' añadida a la tabla 'book'.")
        except Exception as e:
            if "Duplicate column name" in str(e):
                print("ℹ️ La columna 'genero' ya existe en la tabla 'book'.")
            else:
                print(f"⚠️ Nota: No se pudo añadir la columna 'genero' automáticamente: {e}")
                print("Asegúrate de añadirla manualmente: ALTER TABLE book ADD COLUMN genero VARCHAR(100);")

        print("\nChecking for 'responsible_adult_email' column in 'user' table...")
        try:
            # MySQL syntax to add column if not exists
            conn.execute(text("ALTER TABLE user ADD COLUMN responsible_adult_email VARCHAR(255) NULL"))
            conn.commit()
            print("✅ Columna 'responsible_adult_email' añadida a la tabla 'user'.")
        except Exception as e:
            if "Duplicate column name" in str(e):
                print("ℹ️ La columna 'responsible_adult_email' ya existe en la tabla 'user'.")
            else:
                print(f"⚠️ Nota: No se pudo añadir la columna 'responsible_adult_email' automáticamente: {e}")
                print("Asegúrate de añadirla manualmente: ALTER TABLE user ADD COLUMN responsible_adult_email VARCHAR(255) NULL;")

    print("\n🚀 Base de datos lista.")

if __name__ == "__main__":
    update_database()
