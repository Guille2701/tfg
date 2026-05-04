from werkzeug.security import generate_password_hash, check_password_hash

def hash_password(password):
    """
    Hashea una contraseña usando werkzeug.security (compatible con Symfony)
    
    Args:
        password (str): Contraseña en texto plano
        
    Returns:
        str: Contraseña hasheada
    """
    return generate_password_hash(password, method='pbkdf2:sha256')

def verify_password(hashed_password, password):
    """
    Verifica una contraseña contra su hash
    
    Args:
        hashed_password (str): Contraseña hasheada
        password (str): Contraseña en texto plano a verificar
        
    Returns:
        bool: True si la contraseña es correcta, False si no
    """
    return check_password_hash(hashed_password, password)
