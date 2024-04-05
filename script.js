const express = require('express');
const cors = require('cors');
const app = express();

let bookings = []; // Array to store booked time slots

app.use(cors());
app.use(express.json());

// Endpoint for booking a time slot
app.post('/book-slot', (req, res) => {
    const { timeSlot } = req.body;
    if (!bookings.includes(timeSlot)) {
        bookings.push(timeSlot);
        res.status(200).send('Booking successful');
    } else {
        res.status(400).send('Time slot already booked');
    }
});

// Endpoint to get all booked slots
app.get('/get-bookings', (req, res) => {
    res.json(bookings);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


document.addEventListener('DOMContentLoaded', function() {
    const startHour = 9;
    const endHour = 20;
    const timeSlotsContainer = document.getElementById('timeSlots');

    // Generate time slot buttons
    for (let hour = startHour; hour < endHour; hour++) {
        const timeSlot = `${hour}:00 - ${hour + 1}:00`;
        const timeSlotButton = document.createElement('button');
        timeSlotButton.classList.add('time-slot');
        timeSlotButton.textContent = timeSlot;
        timeSlotButton.dataset.timeSlot = timeSlot;

        timeSlotButton.addEventListener('click', selectTimeSlot);

        timeSlotsContainer.appendChild(timeSlotButton);
    }

    // Fetch booked slots from the server and update the UI
    fetchBookedSlots();
});

function selectTimeSlot(event) {
    const selectedButton = event.target;
    selectedButton.classList.add('booked');
    selectedButton.disabled = true; // Disable the button

    // Here, you would also send the booking to the server
    // For example, bookSlot(selectedButton.dataset.timeSlot);
}

// Function to send a booking to the server
function bookSlot(timeSlot) {
    fetch('http://localhost:3000/book-slot', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ timeSlot }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Slot already booked or another error occurred');
        }
        return response.text();
    })
    .then(message => {
        console.log(message);
        // Optionally, update your UI here to reflect the successful booking
    })
    .catch(error => {
        console.error('Error booking slot:', error);
        // Optionally, handle errors (e.g., by re-enabling the slot button and notifying the user)
    });
}

// Fetch booked slots and update the UI
function fetchBookedSlots() {
    fetch('http://localhost:3000/booked-slots')
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
