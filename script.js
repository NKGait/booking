document.addEventListener('DOMContentLoaded', function() {
    const startHour = 9;
    const endHour = 20;
    const timeSlotsContainer = document.getElementById('timeSlots');
    const bookedSlots = JSON.parse(localStorage.getItem('bookedSlots')) || [];

    for (let hour = startHour; hour < endHour; hour++) {
        const timeSlot = `${hour}:00 - ${hour + 1}:00`;
        const timeSlotButton = document.createElement('button');
        timeSlotButton.classList.add('time-slot');
        timeSlotButton.textContent = timeSlot;
        timeSlotButton.dataset.timeSlot = timeSlot;

        if (bookedSlots.includes(timeSlot)) {
            timeSlotButton.classList.add('booked');
            timeSlotButton.disabled = true; // Disable the button if it's booked
        } else {
            timeSlotButton.addEventListener('click', selectTimeSlot);
        }

        timeSlotsContainer.appendChild(timeSlotButton);
    }
});

function selectTimeSlot(event) {
    const selectedButton = event.target;
    selectedButton.classList.add('booked');
    selectedButton.disabled = true; // Disable the button
    saveBooking(selectedButton.dataset.timeSlot);
}

function saveBooking(timeSlot) {
    const bookedSlots = JSON.parse(localStorage.getItem('bookedSlots')) || [];
    bookedSlots.push(timeSlot);
    localStorage.setItem('bookedSlots', JSON.stringify(bookedSlots));
}
// Fetch booked slots and update the UI
function fetchBookedSlots() {
    fetch('http://localhost:3000/booked-slots')
        .then(response => response.json())
        .then(bookedSlots => {
            // Update your UI here to reflect the booked slots
            console.log(bookedSlots);
        })
        .catch(error => console.error('Error fetching booked slots:', error));
}

// Call this function when the page loads
fetchBookedSlots();

// Function to handle a new booking
function bookSlot(timeSlot) {
    fetch('http://localhost:3000/book-slot', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timeSlot }),
    })
    .then(response => {
        if (response.ok) {
            return response.text();
        } else {
            throw new Error('Slot already booked or another error occurred');
        }
    })
    .then(message => {
        console.log(message);
        // Update your UI here to reflect the new booking
    })
    .catch(error => console.error('Error booking slot:', error));
}

// Add an event listener or some way to call bookSlot when a user tries to book a slot

document.getElementById('bookingForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const selectedTimeSlotButton = document.querySelector('.time-slot.booked:not(.disabled)');

    if (!selectedTimeSlotButton) {
        alert('Please select a time slot.');
        return;
    }

    const timeSlot = selectedTimeSlotButton.dataset.timeSlot;

    alert(`Booking confirmed for ${name} at ${timeSlot}. Details will be sent to ${email} and ${phone}.`);

    this.reset();
    selectedTimeSlotButton.classList.remove('selected');
});

