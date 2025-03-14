# Sistema-Votaci-n

Si desea ejecutar el programa debe tener instalada Python, estos comandos se deben ejecutar en la ruta absoluta del proyecto en Visual Studio Code. 

1. clonar el repositorio con el siguiente comando
git clone https://github.com/braianestrada2159/Sistema-Votaci-n.git

2. Crear el entorno virtual.
python -m venv venv

3. Activar entorno virtual.	
venv\Scripts\activate

4. Instalar dependencias.
pip install -r requirements.txt

5. Configurar las credenciales de la base de datos de la linea: 
	app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:dim@localhost:5432/sistema_votaciones'

El proyecto utiliza las siguientes credenciales para conectarse a la base de datos:

	Usuario: postgres

	Contraseña: dim (puedes cambiarla en el código si usas una contraseña diferente).

	Base de datos: sistema_votaciones

	Host: localhost

	Puerto: 5432 (puerto predeterminado de PostgreSQL).

6. Para ejecutarlo utilice el comando:
python app.py

Ejemplos de uso del API con curl:

1. Crear un votante
Ruta: POST /voters

curl -X POST http://localhost:5000/voters \
-H "Content-Type: application/json" \
-d '{
    "name": "Juan Perez",
    "email": "juan.perez@example.com"
}'

2. Crear un candidato
Ruta: POST /candidates

curl -X POST http://localhost:5000/candidates \
-H "Content-Type: application/json" \
-d '{
    "name": "Maria Gomez",
    "party": "Partido Verde"
}'
