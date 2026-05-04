import mysql.connector
import requests

# 1. Configuración de la base de datos
db_config = {
    "host": "localhost",
    "user": "root",
    "password": "",  # Tu contraseña de MySQL
    "database": "biblioteca"
}

# Imagen de respaldo si no hay resultados en Internet
DEFAULT_IMG = "https://images.unsplash.com/photo-1543004218-ee141104638e?q=80&w=400"

def get_external_info(title, author):
    """Estructura de datos externa (Open Library + Google)"""
    clean_title = title.split('|')[0].strip()
    # Inicializamos la estructura vacía
    info = {"img": None, "sinopsis": "Sinopsis no disponible.", "genero": "Literatura"}

    # --- Consulta 1: Open Library (Portadas) ---
    try:
        ol_res = requests.get(f"https://openlibrary.org/search.json?title={clean_title}&author={author}&limit=1", timeout=5).json()
        if ol_res.get("docs"):
            cover_id = ol_res["docs"][0].get("cover_i")
            if cover_id:
                info["img"] = f"https://covers.openlibrary.org/b/id/{cover_id}-L.jpg"
    except: pass

    # --- Consulta 2: Google Books (Texto y Género) ---
    try:
        gb_res = requests.get(f"https://www.googleapis.com/books/v1/volumes?q=intitle:{clean_title}+inauthor:{author}&maxResults=1&langRestrict=es", timeout=5).json()
        if "items" in gb_res:
            vol = gb_res["items"][0]["volumeInfo"]
            info["sinopsis"] = vol.get("description", info["sinopsis"])[:1000]
            info["genero"] = vol.get("categories", [info["genero"]])[0]
            if not info["img"]:
                info["img"] = vol.get("imageLinks", {}).get("thumbnail", "").replace("http:", "https:")
    except: pass

    if not info["img"]: info["img"] = DEFAULT_IMG
    return info

def main():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)

        # ESTRUCTURA 1: Carga total de la base de datos en memoria
        print("Cargando registros actuales de la tabla 'book'...")
        cursor.execute("SELECT id, nombre_libro, autor FROM book")
        mis_libros = cursor.fetchall()
        
        # ESTRUCTURA 2: Recolección masiva de datos externos
        print(f"Iniciando descarga de datos para {len(mis_libros)} libros (Sin esperas)...")
        datos_actualizados = []
        
        for libro in mis_libros:
            print(f"Procesando: {libro['nombre_libro']}...", end=" ", flush=True)
            
            # Obtenemos la info y la guardamos en nuestra estructura temporal
            externo = get_external_info(libro['nombre_libro'], libro['autor'])
            
            datos_actualizados.append((
                externo['sinopsis'],
                externo['genero'],
                externo['image_url' if 'image_url' in externo else 'img'],
                libro['id']
            ))
            print("✓")

        # FASE FINAL: Una sola 'petición' de actualización a la DB
        print("\nSincronizando estructuras... Enviando actualización masiva a MySQL.")
        
        conn.start_transaction()
        sql = "UPDATE book SET sinopsis = %s, genero = %s, image_url = %s WHERE id = %s"
        cursor.executemany(sql, datos_actualizados)
        conn.commit()

        print(f"\n¡Listo! {len(datos_actualizados)} libros actualizados en un solo bloque.")

    except mysql.connector.Error as err:
        print(f"Error de base de datos: {err}")
        if 'conn' in locals(): conn.rollback()
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == "__main__":
    main()