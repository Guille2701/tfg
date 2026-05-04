"""
Sistema de recomendación de libros usando Ollama (Mistral LLM)
Envía el catálogo de libros y el historial de préstamos del usuario
al modelo Mistral para obtener recomendaciones personalizadas con
explicación en lenguaje natural.
"""

import json
import re
import requests
from database import SessionLocal
from models.book import Book
from models.loan import Loan
from config import Config


OLLAMA_URL = Config.OLLAMA_URL
OLLAMA_MODEL = Config.OLLAMA_MODEL


def _build_catalog_text(books):
    """Construye una descripción textual del catálogo de libros disponibles."""
    lines = []
    for book in books:
        sinopsis = (book.sinopsis or "Sin sinopsis")[:200]
        lines.append(
            f"- ID:{book.id} | \"{book.nombre_libro}\" de {book.autor} "
            f"| Género: {book.genero or 'N/A'} | Sinopsis: {sinopsis}"
        )
    return "\n".join(lines)


def _build_history_text(loans, db):
    """Construye una descripción del historial de préstamos del usuario."""
    if not loans:
        return "El usuario no tiene historial de préstamos."
    
    lines = []
    for loan in loans:
        book = db.query(Book).filter(Book.id == loan.book_id).first()
        if book:
            lines.append(
                f"- \"{book.nombre_libro}\" de {book.autor} (Género: {book.genero or 'N/A'})"
            )
    return "Libros que el usuario ya ha leído:\n" + "\n".join(lines)


def _parse_book_ids(response_text, valid_ids):
    """
    Extrae IDs de libros de la respuesta del LLM.
    Busca patrones como ID:123, id:123, o simplemente números que coincidan
    con IDs válidos del catálogo.
    """
    # Buscar patrones ID:número
    id_pattern = re.findall(r'ID[:\s]*(\d+)', response_text, re.IGNORECASE)
    found_ids = [int(x) for x in id_pattern if int(x) in valid_ids]

    # Si no encontró con patrón ID:, buscar todos los números y filtrar válidos
    if not found_ids:
        all_numbers = re.findall(r'\b(\d+)\b', response_text)
        found_ids = [int(x) for x in all_numbers if int(x) in valid_ids]

    # Eliminar duplicados manteniendo orden
    seen = set()
    unique_ids = []
    for book_id in found_ids:
        if book_id not in seen:
            seen.add(book_id)
            unique_ids.append(book_id)

    return unique_ids


def get_recommendations(user_id, n=5, preferred_genre=None, skip_history=False):
    """
    Obtiene recomendaciones personalizadas usando Ollama/Mistral.

    Args:
        user_id: ID del usuario
        n: Número de recomendaciones
        preferred_genre: Género que el usuario prefiere (opcional)
        skip_history: Si es True, no se tiene en cuenta el historial del usuario (opcional)

    Returns:
        dict: { 'book_ids': list[int], 'explanation': str }
    """
    db = SessionLocal()
    try:
        # Obtener libros disponibles (no prestados)
        available_books = db.query(Book).filter(Book.prestado == False).all()
        if not available_books:
            return {'book_ids': [], 'explanation': 'No hay libros disponibles actualmente.'}

        valid_ids = {book.id for book in available_books}

        # Obtener historial del usuario (a menos que se pida omitir)
        user_loans = []
        if not skip_history:
            user_loans = db.query(Loan).filter(Loan.user_id == user_id).all()
        
        read_book_ids = {loan.book_id for loan in user_loans}

        # Filtrar libros ya leídos del catálogo disponible
        candidates = [b for b in available_books if b.id not in read_book_ids]
        if not candidates:
            return {
                'book_ids': [],
                'explanation': 'Ya has leído todos los libros disponibles. ¡Vuelve pronto para nuevas incorporaciones!'
            }

        catalog_text = _build_catalog_text(candidates)
        history_text = _build_history_text(user_loans, db) if not skip_history else "El usuario no tiene historial o ha solicitado una búsqueda temática nueva."
        candidate_ids = {b.id for b in candidates}

        genre_instruction = ""
        if preferred_genre:
            genre_instruction = f"\nEL USUARIO HA SELECCIONADO UNA PREFERENCIA: Quiere leer algo de este género: **{preferred_genre}**. Prioriza libros de este género en tus recomendaciones."
            if skip_history:
                genre_instruction += " IMPORTANTE: Ignora cualquier preferencia pasada del usuario y céntrate ÚNICAMENTE en este género."

        prompt = f"""Eres un bibliotecario experto de la Biblioteca Alauxa. Tu trabajo es recomendar libros personalizados.

{history_text}{genre_instruction}

Catálogo de libros disponibles:
{catalog_text}

Basándote en los gustos del usuario (y su preferencia de género si se indicó), recomienda exactamente {n} libros del catálogo disponible.

IMPORTANTE:
- Responde SOLO con libros del catálogo proporcionado
- Usa exactamente el formato ID:número para cada libro recomendado
- Da una breve explicación personalizada de por qué recomiendas cada libro
- Si el usuario no tiene historial o se ignora, usa su preferencia de género o recomienda los más variados

Formato de respuesta:
1. ID:XX - "Título" - Razón de la recomendación
2. ID:XX - "Título" - Razón de la recomendación
...

Al final, escribe un párrafo breve resumiendo por qué estas recomendaciones encajan con el perfil del usuario."""

        # Llamar a Ollama
        try:
            response = requests.post(
                f"{OLLAMA_URL}/api/generate",
                json={
                    "model": OLLAMA_MODEL,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "num_predict": 1024
                    }
                },
                timeout=300
            )
            response.raise_for_status()
            result = response.json()
            llm_text = result.get("response", "")
            
            # Eliminar el bloque de pensamiento <think> de la IA para mostrar solo el resultado
            llm_text = re.sub(r'<think>.*?</think>', '', llm_text, flags=re.DOTALL).strip()
        except requests.exceptions.RequestException as e:
            print(f"Error conectando con Ollama: {e}")
            # Fallback: devolver libros del género preferido o aleatorios
            if preferred_genre:
                fallback_candidates = [b for b in candidates if b.genero and preferred_genre.lower() in b.genero.lower()]
                if len(fallback_candidates) < n:
                    others = [b for b in candidates if b.id not in {bc.id for bc in fallback_candidates}]
                    fallback_candidates.extend(others[:n - len(fallback_candidates)])
                fallback_ids = [b.id for b in fallback_candidates[:n]]
            else:
                fallback_ids = [b.id for b in candidates[:n]]
                
            return {
                'book_ids': fallback_ids,
                'explanation': 'No se pudo conectar con el servicio de IA. Se muestran recomendaciones basadas en tu género preferido.' if preferred_genre else 'No se pudo conectar con el servicio de IA. Se muestran recomendaciones generales.'
            }

        # Parsear IDs de la respuesta
        book_ids = _parse_book_ids(llm_text, candidate_ids)[:n]

        # Si el LLM no devolvió suficientes, completar con candidatos
        if len(book_ids) < n:
            remaining = [b.id for b in candidates if b.id not in set(book_ids)]
            book_ids.extend(remaining[:n - len(book_ids)])

        return {
            'book_ids': book_ids[:n],
            'explanation': llm_text
        }

    except Exception as e:
        print(f"Error en recomendaciones: {e}")
        return {'book_ids': [], 'explanation': f'Error al generar recomendaciones.'}
    finally:
        db.close()
