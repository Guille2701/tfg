from sqlalchemy import Column, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class Loan(Base):
    """Modelo de préstamo - migrado de Loan.php"""
    __tablename__ = 'loan'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('user.id'), nullable=False)
    book_id = Column(Integer, ForeignKey('book.id'), nullable=False)
    loan_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    expected_return_date = Column(DateTime, nullable=False)
    return_date = Column(DateTime, nullable=True)
    is_notified = Column(Boolean, nullable=False, default=False)
    penalty_days = Column(Integer, nullable=False, default=0)
    
    # Relaciones
    user = relationship('User', backref='loans')
    book = relationship('Book', backref='loans')
    
    def __repr__(self):
        return f'<Loan user_id={self.user_id} book_id={self.book_id}>'
