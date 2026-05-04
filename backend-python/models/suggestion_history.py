from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class SuggestionHistory(Base):
    """Modelo de historial de sugerencias - migrado de SuggestionHistory.php"""
    __tablename__ = 'suggestion_history'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('user.id'), nullable=False)
    suggested_book_ids = Column(String(1000), nullable=False, default='[]')  # JSON stored as string
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    # Relación
    user = relationship('User', backref='suggestion_history')
    
    def __repr__(self):
        return f'<SuggestionHistory user_id={self.user_id} created_at={self.created_at}>'
    
    def get_suggested_book_ids(self):
        """Obtener IDs de libros sugeridos como lista"""
        import json
        return json.loads(self.suggested_book_ids) if self.suggested_book_ids else []
    
    def set_suggested_book_ids(self, book_ids_list):
        """Establecer IDs de libros sugeridos desde lista"""
        import json
        self.suggested_book_ids = json.dumps(book_ids_list)
