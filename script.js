let calendarInitialized = false; // Flag to check if the calendar has been initialized

document.addEventListener('DOMContentLoaded', function() {
    initializeTimeSlots();
    // Delay the calendar initialization to when it's actually needed
});

function initializeTimeSlots() {
    const startHour = 9;
    const endHour = 20;
    const timeSlotsContainer = document.getElementById('timeSlots');
    timeSlotsContainer.innerHTML = ''; // Clear previous time slots

    for (let hour = startHour; hour < endHour; hour++) {
        const timeSlot = `${hour}:00 - ${hour + 1}:00`;
        const timeSlotButton = document.createElement('button');
        timeSlotButton.classList.add('time-slot');
        timeSlotButton.textContent = timeSlot;
        timeSlotButton.dataset.timeSlot = timeSlot;
        timeSlotButton.addEventListener('click', function() { selectTimeSlot(timeSlotButton); });
        timeSlotsContainer.appendChild(timeSlotButton);
    }
}

function initializeCalendar() {
    if (calendarInitialized) return; // Prevent re-initialization

    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        firstDay: 1,
        dateClick: function(info) {
            document.getElementById('selectedDate').value = info.dateStr; // Use a hidden input to store the selected date
            fetchBookedSlotsForDate(info.dateStr).then(showTimeSlotSelection)
                .catch(error => alert('Failed to fetch booked slots. Please try again.'));
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
    // Refresh time slots for the selected date
    const selectedDate = document.getElementById('selectedDate').value;
    fetchBookedSlotsForDate(selectedDate);
}

function selectTimeSlot(selectedButton) {
    document.querySelectorAll('.time-slot.selected').forEach(btn => btn.classList.remove('selected'));
    selectedButton.classList.add('selected');
}

function fetchBookedSlotsForDate(date) {
    return fetch(`http://localhost:3000/get-bookings?date=${date}`)
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch');
            return response.json();
        })
        .then(bookedSlots => updateBookedSlotsUI(bookedSlots))
        .catch(error => console.error('Error fetching booked slots:', error));
}

function updateBookedSlotsUI(bookedSlots) {
    const allSlots = document.querySelectorAll('.time-slot');
    allSlots.forEach(slot => {
        slot.classList.remove('booked', 'selected');
        slot.disabled = bookedSlots.includes(slot.dataset.timeSlot);
        if (slot.disabled) slot.classList.add('booked');
    });
}

document.getElementById('bookingForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const selectedDate = document.getElementById('selectedDate').value;
    const selectedTimeSlotButton = document.querySelector('.time-slot.selected');
    if (!selectedTimeSlotButton) { alert('Please select a time slot.'); return; }
    const timeSlot = selectedTimeSlotButton.dataset.timeSlot;

    bookSlot(selectedDate, timeSlot).then(() => {
        alert(`Booking confirmed for ${name} on ${selectedDate} at ${timeSlot}.`);
        document.getElementById('bookingForm').reset();
        showDateSelection(); // Optionally, redirect the user to the date selection for a new booking
    }).catch(error => alert('Error booking the slot. Please try again.'));
});

function bookSlot(date, timeSlot) {
    return fetch('http://localhost:3000/book-slot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, timeSlot })
    })
    .then(response => {
        if (!response.ok) throw new Error('Slot already booked or another error occurred');
    });
}
