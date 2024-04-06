let calendarInitialized = false;

document.addEventListener('DOMContentLoaded', initializeTimeSlots);

function initializeTimeSlots() {
    const startHour = 9;
    const endHour = 20;
    const timeSlotsContainer = document.getElementById('timeSlots');
    timeSlotsContainer.innerHTML = '';

    for (let hour = startHour; hour < endHour; hour++) {
        const timeSlot = `${hour}:00 - ${hour + 1}:00`;
        const button = document.createElement('button');
        button.className = 'time-slot';
        button.textContent = timeSlot;
        button.dataset.timeSlot = timeSlot;
        button.addEventListener('click', () => selectTimeSlot(button));
        timeSlotsContainer.appendChild(button);
    }
}

function initializeCalendar() {
    if (calendarInitialized) return;
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        firstDay: 1,
        dateClick: function(info) {
            document.getElementById('selectedDate').value = info.dateStr;
            showTimeSlotSelection();
        }
    });
    calendar.render();
    calendarInitialized = true;
}

function showDateSelection() {
    document.getElementById('userDetailsSection').style.display = 'none';
    document.getElementById('dateSelectionSection').style.display = 'block';
    if (!calendarInitialized) initializeCalendar();
}

function showTimeSlotSelection() {
    document.getElementById('dateSelectionSection').style.display = 'none';
    document.getElementById('timeSlotSelectionSection').style.display = 'block';
}

function selectTimeSlot(button) {
    const selected = document.querySelector('.time-slot.selected');
    if (selected) selected.classList.remove('selected');
    button.classList.add('selected');
}

function fetchBookedSlotsForDate(date) {
    return fetch(`http://localhost:3000/get-bookings?date=${date}`)
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch');
            return response.json();
        })
        .then(updateBookedSlotsUI)
        .catch(error => console.error('Error:', error));
}

function updateBookedSlotsUI(bookedSlots) {
    document.querySelectorAll('.time-slot').forEach(slot => {
        const isBooked = bookedSlots.includes(slot.dataset.timeSlot);
        slot.classList.toggle('booked', isBooked);
        slot.disabled = isBooked;
    });
}

document.getElementById('bookingForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const date = document.getElementById('selectedDate').value;
    const selectedSlot = document.querySelector('.time-slot.selected');

    if (!selectedSlot) {
        alert('Please select a time slot.');
        return;
    }

    bookSlot(date, selectedSlot.dataset.timeSlot)
        .then(() => {
            alert(`Booking confirmed for ${name} on ${date} at ${selectedSlot.textContent}.`);
            this.reset();
            showDateSelection();
        })
        .catch(error => alert('Error booking the slot. Please try again.'));
});

function bookSlot(date, timeSlot) {
    return fetch('http://localhost:3000/book-slot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, timeSlot })
    })
    .then(response => {
        if (!response.ok) throw new Error('Slot already booked or an error occurred');
    });
}
