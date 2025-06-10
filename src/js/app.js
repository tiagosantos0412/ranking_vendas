// Configurações
const EXCEL_FILE_URL = 'src/planilhas/ranking.xlsx'; // Caminho relativo para o arquivo
const UPDATE_INTERVAL = 30000; // 30 segundos
const PHOTOS_BASE_URL = 'https://seuservidor.com/fotos/'; // Caminho base para as fotos

// Função para carregar e processar o Excel
async function loadRanking() {
    try {
        // Atualiza o horário da última atualização
        document.getElementById('update-time').textContent = new Date().toLocaleString();
        
        // Busca e processa o arquivo Excel
        const response = await fetch(EXCEL_FILE_URL);
        const arrayBuffer = await response.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Acessa a primeira planilha
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Ordena os dados pela diferença (decrescente)
        const sortedData = jsonData.sort((a, b) => b['DIFERENÇA P/ O PROXIMO'] - a['DIFERENÇA P/ O PROXIMO']);
        
        // Atualiza o pódio
        updatePodium(sortedData);
        
        // Atualiza outras posições
        updateOtherPositions(sortedData);
        
    } catch (error) {
        console.error('Erro ao carregar o ranking:', error);
    }
}

// Atualiza as posições do pódio (1º, 2º e 3º)
function updatePodium(data) {
    for (let i = 0; i < 3; i++) {
        if (data[i]) {
            const position = i + 1;
            document.getElementById(`name-${position}`).textContent = data[i]['CONSULTOR'];
            document.getElementById(`score-${position}`).textContent = `${data[i]['DIFERENÇA P/ O PROXIMO']} pts`;
            // Assumindo que o ID do consultor está no nome do arquivo da foto
            document.getElementById(`photo-${position}`).src = `${PHOTOS_BASE_URL}${data[i]['CONSULTOR'].replace(/\s/g, '_')}.jpg`;
        }
    }
}

// Atualiza as outras posições (4º em diante)
function updateOtherPositions(data) {
    const container = document.getElementById('other-positions');
    container.innerHTML = '';
    
    for (let i = 3; i < data.length && i < 9; i++) { // Mostra até 9 posições
        const position = i + 1;
        const person = data[i];
        
        const div = document.createElement('div');
        div.className = 'other-position';
        div.innerHTML = `
            <div class="position-number">${position}</div>
            <img class="other-photo" src="${PHOTOS_BASE_URL}${person['CONSULTOR'].replace(/\s/g, '_')}.jpg" alt="${position}º lugar">
            <div class="other-name">${person['CONSULTOR']}</div>
            <div class="other-score">${person['DIFERENÇA P/ O PROXIMO']} pts</div>
        `;
        
        container.appendChild(div);
    }
}

// Carrega os dados inicialmente
loadRanking();

// Atualiza periodicamente
setInterval(loadRanking, UPDATE_INTERVAL);