from sqlalchemy import Column, Integer, String, Text, Date
from database import Base


class Event(Base):
    """Modelo de evento cultural"""
    __tablename__ = 'event'

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    category_color = Column(String(50), nullable=False, default='text-primary')
    description = Column(Text, nullable=False)
    event_date = Column(Date, nullable=False)
    time = Column(String(50), nullable=False)
    location = Column(String(255), nullable=False)
    image_url = Column(String(500), nullable=True)

    def __repr__(self):
        return f'<Event {self.title}>'
