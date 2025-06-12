// Configurações
const UPDATE_INTERVAL = 10000; // 10 segundos
const PHOTOS_BASE_URL = 'src/fotos/';
const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1VRGKiAprqok8cCch0SslrDHRimgdFqutbQRvZTyBKto/gviz/tq?tqx=out:json&sheet=Ranking';

async function loadRanking() {
    try {
        document.getElementById('update-time').textContent = new Date().toLocaleString();

        const response = await fetch(GOOGLE_SHEET_URL);
        const text = await response.text();

        const json = JSON.parse(text.substring(47).slice(0, -2));
        const rows = json.table.rows;

        const data = rows.map(row => {
            return {
                'CONSULTOR': row.c[0]?.v || '',
                'TOTAL VENDIDO': Number(row.c[1]?.v || 0)
            };
        });

        const sortedData = data.sort((a, b) => b['TOTAL VENDIDO'] - a['TOTAL VENDIDO']);

        updatePodium(sortedData);
        updateOtherPositions(sortedData);
    } catch (error) {
        console.error('Erro ao carregar dados do Google Sheets:', error);
    }
}

function updatePodium(data) {
    for (let i = 0; i < 3; i++) {
        if (data[i]) {
            const position = i + 1;
            document.getElementById(`name-${position}`).textContent = data[i]['CONSULTOR'];
            document.getElementById(`score-${position}`).textContent = `R$ ${data[i]['TOTAL VENDIDO'].toFixed(2)} vendidos`;
            const img = document.getElementById(`photo-${position}`);
            img.onerror = () => img.src = 'src/fotos/default.png';
            img.src = `${PHOTOS_BASE_URL}${data[i]['CONSULTOR'].replace(/\s/g, '_')}.png`;
        }
    }
}

function updateOtherPositions(data) {
    const container = document.getElementById('other-positions');
    container.innerHTML = '';

    for (let i = 3; i < data.length; i++) {
        const position = i + 1;
        const person = data[i];

        const div = document.createElement('div');
        div.className = 'other-position';
        div.innerHTML = `
            <div class="position-number">${position}</div>
            <img class="other-photo" onerror="this.src='src/fotos/default.png'" src="${PHOTOS_BASE_URL}${person['CONSULTOR'].replace(/\s/g, '_')}.png" alt="${position}º lugar">
            <div class="other-name">${person['CONSULTOR']}</div>
            <div class="other-score">R$ ${person['TOTAL VENDIDO'].toFixed(2)} vendidos</div>
        `;

        container.appendChild(div);
    }
}

loadRanking();
setInterval(loadRanking, UPDATE_INTERVAL);
