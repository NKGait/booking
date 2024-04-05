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

app.get('/get-bookings', (req, res) => {
    const { date } = req.query; // Assuming the date is passed as a query parameter
    const bookingsForDate = bookings.filter(booking => booking.date === date);
    const bookedSlots = bookingsForDate.map(booking => booking.timeSlot);
    res.json(bookedSlots);
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

function fetchBookedSlotsForDate(date) {
    fetch(`http://localhost:3000/get-bookings?date=${date}`)
        .then(response => response.json())
        .then(bookedSlots => {
            const allSlots = document.querySelectorAll('.time-slot');
            allSlots.forEach(slot => {
                // Reset all slots to unbooked state initially
                slot.classList.remove('booked');
                slot.disabled = false;

                // Mark slot as booked if it's in the bookedSlots array
                if (bookedSlots.includes(slot.dataset.timeSlot)) {
                    slot.classList.add('booked');
                    slot.disabled = true;
                }
            });
        })
        .catch(error => console.error('Error fetching booked slots:', error));
}

// FullCalendar initialization and other necessary setup...
var calendar = new FullCalendar.Calendar(calendarEl, {
    // Your FullCalendar configuration...
    dateClick: function(info) {
        // Fetch and display booked slots for the selected date
        fetchBookedSlotsForDate(info.dateStr);
    }
});

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
