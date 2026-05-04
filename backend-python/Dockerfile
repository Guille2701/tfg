FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema para PyMySQL
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements e instalar dependencias Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código fuente
COPY . .

# Crear directorio de uploads
RUN mkdir -p static/uploads

EXPOSE 5000

CMD ["python", "app.py"]
