import re

def validate_email(email):
    """
    Valida formato de email
    
    Args:
        email (str): Email a validar
        
    Returns:
        bool: True si el email es válido, False si no
    """
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_user_data(data):
    """
    Valida datos de usuario para registro
    
    Args:
        data (dict): Diccionario con datos del usuario
        
    Returns:
        tuple: (bool, str) - (es_valido, mensaje_error)
    """
    # Validar campos requeridos
    required_fields = ['username', 'password']
    for field in required_fields:
        if field not in data or not data[field]:
            return False, f'El campo {field} es requerido'
    
    # Validar longitud de username
    if len(data['username']) < 3:
        return False, 'El username debe tener al menos 3 caracteres'
    
    # Validar longitud de password
    if len(data['password']) < 6:
        return False, 'La contraseña debe tener al menos 6 caracteres'
    
    # Validar email si está presente
    if 'email' in data and data['email']:
        if not validate_email(data['email']):
            return False, 'El formato del email no es válido'
    
    return True, ''
