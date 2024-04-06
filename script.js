let calendarInitialized = false; // Flag to ensure the calendar is only initialized once

// Initialize time slots upon DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    initializeTimeSlots();
});

// Function to dynamically create time slot buttons
function initializeTimeSlots() {
    const startHour = 9, endHour = 20;
    const timeSlotsContainer = document.getElementById('timeSlots');
    timeSlotsContainer.innerHTML = ''; // Clear any existing slots

    for (let hour = startHour; hour < endHour; hour++) {
        let timeSlot = `${hour}:00 - ${hour + 1}:00`;
        let button = document.createElement('button');
        button.className = 'time-slot';
        button.textContent = timeSlot;
        button.dataset.timeSlot = timeSlot;
        button.onclick = () => selectTimeSlot(button);
        timeSlotsContainer.appendChild(button);
    }
}

// Initialize the calendar when needed
function initializeCalendar() {
    if (calendarInitialized) return;
    let calendarEl = document.getElementById('calendar');
    let calendar = new FullCalendar.Calendar(calendarEl, {
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

// Show the date selection section
function showDateSelection() {
    document.getElementById('userDetailsSection').style.display = 'none';
    document.getElementById('dateSelectionSection').style.display = 'block';
    initializeCalendar();
}

// Show the time slot selection section
function showTimeSlotSelection() {
    document.getElementById('dateSelectionSection').style.display = 'none';
    document.getElementById('timeSlotSelectionSection').style.display = 'block';
}

// Highlight the selected time slot
function selectTimeSlot(button) {
    let selected = document.querySelector('.time-slot.selected');
    if (selected) selected.classList.remove('selected');
    button.classList.add('selected');
}

// Fetch booked slots for a specific date
function fetchBookedSlotsForDate(date) {
    return fetch(`http://localhost:3000/get-bookings?date=${date}`)
        .then(response => response.ok ? response.json() : Promise.reject('Failed to fetch'))
        .then(bookedSlots => updateBookedSlotsUI(bookedSlots))
        .catch(error => console.error('Error:', error));
}

// Update the UI based on booked slots
function updateBookedSlotsUI(bookedSlots) {
    document.querySelectorAll('.time-slot').forEach(slot => {
        let isBooked = bookedSlots.includes(slot.dataset.timeSlot);
        slot.classList.toggle('booked', isBooked);
        slot.disabled = isBooked;
    });
}

// Handle form submission for booking
document.getElementById('bookingForm').addEventListener('submit', function(event) {
    event.preventDefault();
    let name = document.getElementById('name').value;
    let email = document.getElementById('email').value;
    let phone = document.getElementById('phone').value;
    let date = document.getElementById('selectedDate').value;
    let selectedSlot = document.querySelector('.time-slot.selected');

    if (!selectedSlot) {
        alert('Please select a time slot.');
        return;
    }

    bookSlot(date, selectedSlot.dataset.timeSlot)
        .then(() => {
            alert(`Booking confirmed for ${name} on ${date} at ${selectedSlot.textContent}.`);
            this.reset();
            showDateSelection(); // Redirect to start a new booking
        })
        .catch(error => alert('Error booking the slot. Please try again.'));
});

// Send a booking request to the server
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
