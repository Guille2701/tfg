from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    """Modelo de usuario - migrado de User.php"""
    __tablename__ = 'user'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(180), unique=True, nullable=False, index=True)
    nombre = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    is_minor = Column(Boolean, nullable=False, default=False)
    responsible_adult_id = Column(Integer, ForeignKey('user.id'), nullable=True)
    responsible_adult_email = Column(String(255), nullable=True)
    roles = Column(String(500), nullable=False, default='["ROLE_USER"]')  # JSON stored as string
    password = Column(String(255), nullable=False)  # hashed password
    
    # Relación auto-referencial para adulto responsable
    responsible_adult = relationship('User', remote_side=[id], backref='minors')
    
    def __repr__(self):
        return f'<User {self.username}>'
    
    def get_roles(self):
        """Obtener roles como lista"""
        import json
        roles_list = json.loads(self.roles) if self.roles else []
        if 'ROLE_USER' not in roles_list:
            roles_list.append('ROLE_USER')
        return list(set(roles_list))
    
    def set_roles(self, roles_list):
        """Establecer roles desde lista"""
        import json
        self.roles = json.dumps(roles_list)
