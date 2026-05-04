from sqlalchemy import Column, Integer, String, Boolean, Text
from database import Base

class Book(Base):
    """Modelo de libro - migrado de Book.php"""
    __tablename__ = 'book'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre_libro = Column(String(255), nullable=False)
    autor = Column(String(255), nullable=False)
    estanteria = Column(String(255), nullable=False)
    balda = Column(String(255), nullable=False)
    cod_barras = Column(String(255), nullable=False)
    prestado = Column(Boolean, nullable=False, default=False)
    genero = Column(String(100), nullable=True)
    sinopsis = Column(Text, nullable=False)
    image_url = Column(String(255), nullable=True)
    hidden = Column(Boolean, nullable=False, default=False)
    
    def __repr__(self):
        return f'<Book {self.nombre_libro} by {self.autor}>'
