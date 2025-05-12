/**
 * App.js
 * Hauptlogik für die Beziehungsblumen-Anwendung
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM-Elemente
    const dateInput = document.getElementById('relationship-date');
    const setDateBtn = document.getElementById('set-date');
    const resetDateBtn = document.getElementById('reset-date');
    const daysCountElement = document.getElementById('days-count');
    const milestoneMessage = document.getElementById('milestone-message');
    const flowerContainer = document.getElementById('flower-container');
    
    // Initialisiere die 3D-Blume
    const flower = new Flower(flowerContainer);
    
    // Setze das heutige Datum als Standardwert
    const today = new Date();
    const formattedDate = formatDate(today);
    dateInput.value = formattedDate;
    dateInput.max = formattedDate; // Verhindere zukünftige Daten
    
    // Lade gespeichertes Datum aus dem localStorage
    loadSavedDate();
    
    // Event-Listener
    setDateBtn.addEventListener('click', setRelationshipDate);
    resetDateBtn.addEventListener('click', resetDate);
    
    /**
     * Setzt das Beziehungsdatum und aktualisiert die Anzeige
     */
    function setRelationshipDate() {
        const selectedDate = dateInput.value;
        
        if (!selectedDate) {
            alert('Bitte wähle ein gültiges Datum aus.');
            return;
        }
        
        // Speichere das Datum im localStorage
        localStorage.setItem('relationshipDate', selectedDate);
        
        // Aktualisiere die Anzeige
        updateDisplay(selectedDate);
    }
    
    /**
     * Setzt das Datum zurück
     */
    function resetDate() {
        localStorage.removeItem('relationshipDate');
        dateInput.value = formattedDate;
        updateDisplay(formattedDate);
    }
    
    /**
     * Lädt das gespeicherte Datum aus dem localStorage
     */
    function loadSavedDate() {
        const savedDate = localStorage.getItem('relationshipDate');
        
        if (savedDate) {
            dateInput.value = savedDate;
            updateDisplay(savedDate);
        } else {
            updateDisplay(formattedDate);
        }
    }
    
    /**
     * Aktualisiert die Anzeige basierend auf dem ausgewählten Datum
     */
    function updateDisplay(selectedDate) {
        const days = calculateDays(selectedDate);
        daysCountElement.textContent = days;
        
        // Aktualisiere die Leuchtkraft der Blume
        flower.updateEmissiveIntensity(days);
        
        // Prüfe auf Meilensteine
        checkMilestones(days);
    }
    
    /**
     * Berechnet die Anzahl der Tage zwischen dem ausgewählten Datum und heute
     */
    function calculateDays(selectedDate) {
        const startDate = new Date(selectedDate);
        const currentDate = new Date();
        
        // Setze die Uhrzeiten auf Mitternacht, um genaue Tagesberechnung zu gewährleisten
        startDate.setHours(0, 0, 0, 0);
        currentDate.setHours(0, 0, 0, 0);
        
        // Berechne die Differenz in Millisekunden und konvertiere zu Tagen
        const diffTime = currentDate - startDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        return Math.max(0, diffDays); // Stelle sicher, dass die Anzahl nicht negativ ist
    }
    
    /**
     * Prüft auf Meilensteine und zeigt entsprechende Nachrichten an
     */
    function checkMilestones(days) {
        let message = '';
        
        if (days === 0) {
            message = 'Heute ist euer erster Tag! 💖';
        } else if (days === 7) {
            message = 'Eine Woche zusammen! 🎉';
        } else if (days === 30) {
            message = 'Ein Monat zusammen! 🥂';
        } else if (days === 100) {
            message = '100 Tage zusammen! 💯';
        } else if (days === 365) {
            message = 'Ein Jahr zusammen! 🎂';
        } else if (days === 730) {
            message = 'Zwei Jahre zusammen! 🎊';
        } else if (days % 365 === 0 && days > 0) {
            const years = days / 365;
            message = `${years} Jahre zusammen! 🎊`;
        }
        
        if (message) {
            milestoneMessage.textContent = message;
            milestoneMessage.classList.remove('hidden');
        } else {
            milestoneMessage.classList.add('hidden');
        }
    }
    
    /**
     * Formatiert ein Datum im Format YYYY-MM-DD für das Eingabefeld
     */
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    }
});