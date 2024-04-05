document.addEventListener('DOMContentLoaded', function() {
    const startHour = 9;
    const endHour = 20;
    const timeSlotsContainer = document.getElementById('timeSlots');

    // Clear previous time slots
    timeSlotsContainer.innerHTML = '';

    // Generate and append time slot buttons
    for (let hour = startHour; hour < endHour; hour++) {
        const timeSlot = `${hour}:00 - ${hour + 1}:00`;
        const timeSlotButton = document.createElement('button');
        timeSlotButton.classList.add('time-slot');
        timeSlotButton.textContent = timeSlot;
        timeSlotButton.dataset.timeSlot = timeSlot;

        timeSlotButton.addEventListener('click', function() {
            selectTimeSlot(timeSlotButton);
        });

        timeSlotsContainer.appendChild(timeSlotButton);
    }
});


// FullCalendar setup
document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        firstDay: 1, // Monday as the first day of the week
        dateClick: function(info) {
            fetchBookedSlotsForDate(info.dateStr);
        }
    });
    calendar.render();
});

function selectTimeSlot(event) {
    // Remove 'selected' class from any previously selected time slot
    const previouslySelected = document.querySelector('.time-slot.selected');
    if (previouslySelected) {
        previouslySelected.classList.remove('selected');
    }

    const selectedButton = event.target;

    // Add 'selected' class to the clicked time slot button
    selectedButton.classList.add('selected');
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
        // Refresh the time slots to reflect the new booking
        fetchBookedSlotsForDate(date);
    })
    .catch(error => console.error('Error booking slot:', error));
}

function fetchBookedSlotsForDate(date) {
    // Clear previous states
    const allSlots = document.querySelectorAll('.time-slot');
    allSlots.forEach(slot => {
        slot.classList.remove('booked');
        slot.disabled = false;
    });

    // Fetch new states
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

    // Retrieve form data
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;

    // Get the selected date from FullCalendar
    const selectedDate = calendar.getDate().toISOString().split('T')[0];

    // Find the selected time slot button
    const selectedTimeSlotButton = document.querySelector('.time-slot.selected');

    if (!selectedTimeSlotButton) {
        alert('Please select a time slot.');
        return;
    }

    // Extract the time slot from the selected button
    const timeSlot = selectedTimeSlotButton.dataset.timeSlot;

    // Call bookSlot to send the booking details to the server
    bookSlot(selectedDate, timeSlot).then(() => {
        // Handle successful booking, such as resetting the form and updating UI
    }).catch(error => {
        // Handle booking error
        console.error('Error booking slot:', error);
    });
});
