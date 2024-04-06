document.addEventListener('DOMContentLoaded', function() {
    initializeTimeSlots();
    initializeCalendar();
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

        timeSlotButton.addEventListener('click', function() {
            selectTimeSlot(timeSlotButton); // Pass the button itself
        });

        timeSlotsContainer.appendChild(timeSlotButton);
    }
}

function initializeCalendar() {
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        firstDay: 1, // Monday as the first day of the week
        dateClick: function(info) {
            fetchBookedSlotsForDate(info.dateStr);
        }
    });
    calendar.render();
}

function showDateSelection() {
    // Validate user details if necessary
    document.getElementById('userDetailsSection').style.display = 'none';
    document.getElementById('dateSelectionSection').style.display = 'block';
}

function showTimeSlotSelection() {
    document.getElementById('dateSelectionSection').style.display = 'none';
    document.getElementById('timeSlotSelectionSection').style.display = 'block';
    // Trigger fetching of time slots for the selected date here
}


function bookSlot(date, timeSlot) {
    fetch('http://localhost:3000/book-slot', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date, timeSlot }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Slot already booked or another error occurred');
        }
        fetchBookedSlotsForDate(date); // Refresh the time slots to reflect the new booking
    })
    .catch(error => console.error('Error booking slot:', error));
}

function fetchBookedSlotsForDate(date) {
    const allSlots = document.querySelectorAll('.time-slot');
    allSlots.forEach(slot => slot.classList.remove('booked', 'selected')); // Reset

    fetch(`http://localhost:3000/get-bookings?date=${date}`)
        .then(response => response.json())
        .then(bookedSlots => {
            bookedSlots.forEach(slot => {
                const slotElement = document.querySelector(`[data-time-slot="${slot}"]`);
                if (slotElement) {
                    slotElement.classList.add('booked');
                    slotElement.disabled = true;
                }
            });
        })
        .catch(error => console.error('Error fetching booked slots:', error));
}

document.getElementById('bookingForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const selectedDate = calendar.getDate().toISOString().split('T')[0];
    const selectedTimeSlotButton = document.querySelector('.time-slot.selected');

    if (!selectedTimeSlotButton) {
        alert('Please select a time slot.');
        return;
    }

    const timeSlot = selectedTimeSlotButton.dataset.timeSlot;
    bookSlot(selectedDate, timeSlot).then(() => {
        alert(`Booking confirmed for ${name} on ${selectedDate} at ${timeSlot}.`);
        document.getElementById('bookingForm').reset(); // Reset form
        fetchBookedSlotsForDate(selectedDate); // Refresh time slots
    }).catch(error => {
        console.error('Error booking slot:', error);
        alert('Error booking the slot. Please try again.');
    });
});
