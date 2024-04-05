const express = require('express');
const cors = require('cors');
const app = express();

let bookings = []; // Array to store booked time slots

app.use(cors());
app.use(express.json());

// Endpoint for booking a time slot
app.post('/book-slot', (req, res) => {
    const { date, timeSlot } = req.body;
    const booking = { date, timeSlot };
    
    // Check if the slot on this date is already booked
    if (!bookings.some(b => b.date === date && b.timeSlot === timeSlot)) {
        bookings.push(booking);
        res.status(200).send('Booking successful');
    } else {
        res.status(400).send('Time slot already booked for this date');
    }
});


app.get('/get-bookings', (req, res) => {
    const { date } = req.query;
    const bookingsForDate = bookings.filter(booking => booking.date === date).map(booking => booking.timeSlot);
    res.json(bookingsForDate);
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

    // Retrieve input values
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const selectedTimeSlotButton = document.querySelector('.time-slot:not(.booked)');
    const selectedDate = calendar.getDate().toISOString().split('T')[0]; // Assuming you have a FullCalendar instance named 'calendar'

    // Check if a time slot is selected
    if (!selectedTimeSlotButton) {
        alert('Please select a time slot.');
        return;
    }

    // Extract the time slot from the selected button
    const timeSlot = selectedTimeSlotButton.dataset.timeSlot;

    // Send the booking details to the server
    bookSlot(selectedDate, timeSlot)
        .then(() => {
            alert(`Booking confirmed for ${name} on ${selectedDate} at ${timeSlot}. Details will be sent to ${email} and ${phone}.`);
            // Reset form and UI state as necessary
            this.reset();
            fetchBookedSlotsForDate(selectedDate); // Refresh the time slots to reflect the new booking
        })
        .catch(error => {
            console.error('Error booking slot:', error);
            alert('Error booking the slot. Please try again.');
        });
});

