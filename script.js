let currentVoterId = null; // Almacenará el ID del votante registrado

// Función para mostrar una sección específica
function showSection(sectionId) {
    document.querySelectorAll('div[id$="Section"]').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(sectionId).classList.remove('hidden');
}

// Función para mostrar mensajes de éxito o error
function showMessage(element, message, isError = false) {
    element.textContent = message;
    element.className = `message ${isError ? 'error' : 'success'}`;
    element.style.display = 'block';
    setTimeout(() => element.style.display = 'none', 3000);
}

// Cargar los candidatos al iniciar la aplicación
async function loadCandidates() {
    const response = await fetch('/candidates'); // Obtener candidatos
    const data = await response.json();
    console.log("Candidatos cargados:", data.candidates); // Depuración
    const candidates = data.candidates || [];
    const select = document.getElementById('candidateSelect');
    select.innerHTML = '<option value="">Seleccione un candidato</option>';
    candidates.forEach(candidate => {
        const option = document.createElement('option');
        option.value = candidate.id;
        option.textContent = candidate.name;
        select.appendChild(option);
    });
}

// Mostrar la sección de votación al cargar la página
async function showResults() {
    const response = await fetch('/results'); // Obtener resultados
    const data = await response.json();
    const results = data.results || [];
    const resultsDiv = document.getElementById('results');
    let tableHtml = '<table><tr><th>Candidato</th><th>Partido</th><th>Votos</th><th>Porcentaje de Votos</th></tr>';
    results.forEach(result => {
        tableHtml += `<tr><td>${result.name}</td><td>${result.party}</td><td>${result.votes}</td><td>${result.vote_percentage}%</td></tr>`;
    });
    tableHtml += '</table>';
    resultsDiv.innerHTML = tableHtml;
}

// Mostrar estadísticas al cargar la página
async function showStatistics() {
    const response = await fetch('/statistics'); // Obtener estadísticas
    const data = await response.json();
    const statistics = data.statistics || {};
    const statisticsDiv = document.getElementById('statistics');
    let statisticsHtml = `
        <p>Total de votos: ${statistics.total_votes}</p>
        <p>Candidato(s) con más votos: ${statistics.winning_candidates.join(', ')}</p>
        <p>Máximo de votos: ${statistics.max_votes}</p>
        <p>Porcentaje de votos del candidato ganador: ${statistics.winning_percentage}%</p>
        <h3>Estadísticas por Candidato</h3>
        <table>
            <tr>
                <th>Candidato</th>
                <th>Votos</th>
                <th>Porcentaje de Votos</th>
            </tr>
    `;
    // Agregar estadísticas de cada candidato
    statistics.candidates_statistics.forEach(candidate => {
        statisticsHtml += `
            <tr>
                <td>${candidate.name}</td>
                <td>${candidate.votes}</td>
                <td>${candidate.vote_percentage}%</td>
            </tr>
        `;
    });
    statisticsHtml += '</table>';
    statisticsDiv.innerHTML = statisticsHtml;
}

// Mostrar la sección de votación al cargar la página
document.getElementById('voterForm').onsubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('/voters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: document.getElementById('voterName').value,
            email: document.getElementById('voterEmail').value
        })
    });
    // Verificar si la respuesta es exitosa
    const data = await response.json();
    if (response.ok) {
        showMessage(document.getElementById('voterMessage'), `Votante registrado con ID: ${data.id}`);
        currentVoterId = data.id; // Guardamos el ID del votante
        document.getElementById('voteForm').classList.remove('hidden'); // Mostramos el formulario de voto
        await loadCandidates(); // Cargamos los candidatos disponibles
    } else {
        showMessage(document.getElementById('voterMessage'), data.message, true);
    }
};

// Manejar el envío del formulario de voto
document.getElementById('voteForm').onsubmit = async (e) => {
    e.preventDefault();
    const candidateId = document.getElementById('candidateSelect').value;
    // Verificar si se ha seleccionado un candidato
    if (!candidateId) {
        showMessage(document.getElementById('voteMessage'), 'Seleccione un candidato', true);
        return;
    }
    // Enviar el voto al servidor
    const response = await fetch('/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            voter_id: currentVoterId,
            candidate_id: candidateId
        })
    });
    // Verificar si la respuesta es exitosa
    const data = await response.json();
    if (response.ok) {
        showMessage(document.getElementById('voteMessage'), 'Voto registrado exitosamente');
        document.getElementById('voteForm').classList.add('hidden'); // Ocultamos el formulario de voto
        await showResults(); // Actualizamos la tabla de resultados
    } else {
        showMessage(document.getElementById('voteMessage'), data.message, true);
    }
};

// Manejar el envío del formulario de candidato
document.getElementById('candidateForm').onsubmit = async (e) => {
    e.preventDefault();
    // Enviar el nuevo candidato al servidor
    const response = await fetch('/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: document.getElementById('candidateName').value,
            party: document.getElementById('candidateParty').value
        })
    });
    // Verificar si la respuesta es exitosa
    const data = await response.json();
    if (response.ok) {
        showMessage(document.getElementById('candidateMessage'), `Candidato registrado con ID: ${data.id}`);
        await loadCandidates(); // Recargar la lista de candidatos
        await showResults(); // Actualizar la tabla de resultados
    } else {
        showMessage(document.getElementById('candidateMessage'), data.message, true);
    }
};

// Mostrar la sección de votación al cargar la página
document.getElementById('viewResults').onclick = async () => {
    await showResults(); // Mostrar resultados al hacer clic en el botón
};

// Mostrar estadísticas al hacer clic en el botón
document.getElementById('viewStatistics').onclick = async () => {
    await showStatistics(); // Mostrar estadísticas al hacer clic en el botón
};

// Mostrar resultados al cargar la sección de resultados
document.getElementById('resultsSection').onclick = async () => {
    await showResults();
};