// Load schedule from CSV
async function loadSchedule() {
    console.log('Loading schedule');
    try {
        const response = await fetch('data/schedule.csv');
        const csvText = await response.text();
        console.log('Schedule CSV loaded:', csvText.substring(0, 100));
        const parsed = Papa.parse(csvText, { header: true });
        console.log('Parsed schedule:', parsed.data);
        const tbody = document.getElementById('schedule-body');
        tbody.innerHTML = '';
        parsed.data.forEach(row => {
            if (row.Day) {
                // Process Notes for magic links
                let notes = row.Notes || '';
                notes = notes.replace(/#(\d+)/g, (match, num) => `<a href="#card-${num}" onclick="expandCard(${num})">see more</a>`);

                const tr = document.createElement('tr');
                tr.innerHTML = `
          <td>${row.Day}</td>
          <td>${row.Event}</td>
          <td>${row.Time}</td>
          <td>${notes}</td>
        `;
                tbody.appendChild(tr);
            }
        });
        console.log('Schedule loaded');
    } catch (error) {
        console.error('Error loading schedule:', error);
    }
}

// Load cards from MD files
async function loadCards() {
    console.log('Loading cards');
    try {
        const response = await fetch('cards/cards.json');
        const cardFiles = await response.json();
        console.log('Card files:', cardFiles);
        const grid = document.getElementById('cards-grid');
        grid.innerHTML = '';

        for (let index = 0; index < cardFiles.length; index++) {
            const file = cardFiles[index];
            const cardId = `card-${index + 1}`;
            console.log('Loading card:', file);
            try {
                const mdResponse = await fetch(`cards/${file}`);
                const mdText = await mdResponse.text();
                console.log('MD text:', mdText);
                const htmlContent = marked.parse(mdText);
                console.log('HTML content:', htmlContent);
                const title = htmlContent.match(/<h1>(.*?)<\/h1>/)?.[1] || 'Card';
                const content = htmlContent.replace(/<h1>.*?<\/h1>/, '').trim();

                const card = document.createElement('article');
                card.className = 'info-card';
                card.id = cardId;
                card.setAttribute('data-expanded', 'false');
                card.innerHTML = `
            <button class="card-toggle" aria-expanded="false">
              <span>${title}</span>
              <span class="toggle-icon">+</span>
            </button>
            <div class="card-content">
              ${content}
            </div>
          `;
                grid.appendChild(card);
                console.log('Card added:', title);
            } catch (error) {
                console.error(`Error loading ${file}:`, error);
            }
        }
        console.log('Cards loaded');
    } catch (error) {
        console.error('Error loading cards.json:', error);
    }

    // Attach event listeners after cards are loaded
    attachCardListeners();
}

// Attach event listeners to cards
function attachCardListeners() {
    const cardButtons = document.querySelectorAll('.card-toggle');
    cardButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const card = button.closest('.info-card');
            const expanded = card.getAttribute('data-expanded') === 'true';
            card.setAttribute('data-expanded', String(!expanded));
            button.setAttribute('aria-expanded', String(!expanded));
        });
    });

    const expandAllButton = document.getElementById('expandAll');
    if (expandAllButton) {
        expandAllButton.addEventListener('click', () => {
            const anyClosed = Array.from(document.querySelectorAll('.info-card')).some(
                (card) => card.getAttribute('data-expanded') !== 'true'
            );

            document.querySelectorAll('.info-card').forEach((card) => {
                card.setAttribute('data-expanded', String(anyClosed));
                const toggle = card.querySelector('.card-toggle');
                if (toggle) {
                    toggle.setAttribute('aria-expanded', String(anyClosed));
                }
            });

            expandAllButton.textContent = anyClosed ? 'Collapse All' : 'Expand All';
        });
    }
}

// Function to expand a specific card
function expandCard(num) {
    const card = document.getElementById(`card-${num}`);
    if (card) {
        card.setAttribute('data-expanded', 'true');
        const toggle = card.querySelector('.card-toggle');
        if (toggle) toggle.setAttribute('aria-expanded', 'true');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, loading schedule and cards');
    loadSchedule();
    loadCards();
});