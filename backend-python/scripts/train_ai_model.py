"""
Script para entrenar el modelo de IA de recomendación
"""

from ai.recommender import train_model

if __name__ == '__main__':
    print("Entrenando modelo de recomendación de libros...")
    train_model()
    print("✅ Modelo entrenado con éxito")
