# Sistema de Votación
from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)

# Configuración de la base de datos
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:dim@localhost:5432/sistema_votaciones'
db = SQLAlchemy(app)

# Definir modelos
# Modelo para Votante, Candidato y Voto
class Voter(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    has_voted = db.Column(db.Boolean, default=False)

class Candidate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    party = db.Column(db.String(100))
    votes = db.Column(db.Integer, default=0)

class Vote(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    voter_id = db.Column(db.Integer, db.ForeignKey('voter.id'), unique=True)
    candidate_id = db.Column(db.Integer, db.ForeignKey('candidate.id'))

# Ruta para servir el archivo HTML
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

# Ruta para crear un votante
@app.route('/voters', methods=['POST'])
def create_voter():
    data = request.get_json()

    # Verificar si el nombre ya existe en la tabla de candidatos
    if Candidate.query.filter_by(name=data['name']).first():
        return jsonify({"message": "El nombre ya está registrado como candidato."}), 400

    # Verificar si el nombre ya existe en la tabla de votantes
    if Voter.query.filter_by(name=data['name']).first():
        return jsonify({"message": "El votante con este nombre ya existe."}), 400

    new_voter = Voter(name=data['name'], email=data['email'])
    db.session.add(new_voter)
    db.session.commit()

    # Verificar si el correo electrónico ya está registrado
    return jsonify({"message": "Votante creado correctamente.", "id": new_voter.id}), 201

# Ruta para crear un candidato
@app.route('/candidates', methods=['POST'])
def create_candidate():
    data = request.get_json()

    # Verificar si el nombre ya existe en la tabla de votantes
    if Voter.query.filter_by(name=data['name']).first():
        return jsonify({"message": "El nombre ya está registrado como votante."}), 400

    # Verificar si el nombre ya existe en la tabla de candidatos
    if Candidate.query.filter_by(name=data['name']).first():
        return jsonify({"message": "Ya existe un candidato con este nombre."}), 400

    # Verificar si el partido ya existe
    new_candidate = Candidate(name=data['name'], party=data.get('party'))
    db.session.add(new_candidate)
    db.session.commit()

    # Verificar si el candidato se creó correctamente
    return jsonify({"message": "Candidato creado correctamente.", "id": new_candidate.id}), 201

# Ruta para emitir un voto
@app.route('/vote', methods=['POST'])
def vote():
    data = request.get_json()
    voter = Voter.query.get(data['voter_id'])
    candidate = Candidate.query.get(data['candidate_id'])

    # Verificar si el votante y el candidato existen
    if not voter or not candidate:
        return jsonify({"message": "Votante o candidato no encontrado."}), 404

    # Verificar si el votante ya ha votado
    if voter.has_voted:
        return jsonify({"message": "El votante ya ha votado."}), 400

    # Registrar el voto
    voter.has_voted = True
    candidate.votes += 1
    new_vote = Vote(voter_id=voter.id, candidate_id=candidate.id)
    db.session.add(new_vote)
    db.session.commit()

    # Verificar si el voto se registró correctamente
    return jsonify({"message": "Votación registrada."}), 201

# Ruta para obtener los resultados en formato JSON
@app.route('/results', methods=['GET'])
def get_results():
    candidates = Candidate.query.all()
    total_votes = sum(candidate.votes for candidate in candidates)
    # Calcular el porcentaje de votos de cada candidato
    results = []
    # Verificar si hay candidatos
    for candidate in candidates:
        vote_percentage = (candidate.votes / total_votes * 100) if total_votes > 0 else 0
        results.append({
            "name": candidate.name,
            "votes": candidate.votes,
            "party": candidate.party,
            "vote_percentage": round(vote_percentage, 2)  # Redondeamos a 2 decimales
        })
    
    # Ordenar los resultados por votos de mayor a menor
    return jsonify({"results": results})

# Ruta para obtener estadísticas de la votación
@app.route('/statistics', methods=['GET'])
def get_statistics():
    candidates = Candidate.query.all()
    total_votes = sum(candidate.votes for candidate in candidates)
    max_votes = max(candidate.votes for candidate in candidates) if candidates else 0
    winning_candidates = [candidate.name for candidate in candidates if candidate.votes == max_votes] if candidates else []
    
    # Calcular el porcentaje de votos de cada candidato
    candidates_statistics = []
    for candidate in candidates:
        vote_percentage = (candidate.votes / total_votes * 100) if total_votes > 0 else 0
        candidates_statistics.append({
            "name": candidate.name,
            "votes": candidate.votes,
            "vote_percentage": round(vote_percentage, 2)
        })
    
    # Calcular el porcentaje de votos del candidato ganador
    winning_percentage = (max_votes / total_votes * 100) if total_votes > 0 else 0
    
    statistics = {
        "total_votes": total_votes,
        "winning_candidates": winning_candidates,
        "max_votes": max_votes,
        "winning_percentage": round(winning_percentage, 2),
        "candidates_statistics": candidates_statistics
    }
    
    # Verificar si las estadísticas se generaron correctamente
    return jsonify({"statistics": statistics})

# Ruta para obtener la lista de candidatos
@app.route('/candidates', methods=['GET'])
def get_candidates():
    candidates = Candidate.query.all()
    candidates_list = [{"id": candidate.id, "name": candidate.name} for candidate in candidates]
    return jsonify({"candidates": candidates_list})

# Ruta para obtener la lista de votantes
if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Crear las tablas dentro del contexto de la aplicación
    app.run(debug=True)



