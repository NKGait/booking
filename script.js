document.addEventListener('DOMContentLoaded', initializeTimeSlots);

async function initializeTimeSlots() {
    const startHour = 9;
    const endHour = 20;
    const timeSlotsContainer = document.getElementById('timeSlots');
    timeSlotsContainer.innerHTML = '';

    for (let hour = startHour; hour < endHour; hour++) {
        const timeSlot = `${formatHour(hour)} - ${formatHour(hour + 1)}`;
        const button = document.createElement('button');
        button.className = 'time-slot';
        button.textContent = timeSlot;
        button.dataset.timeSlot = timeSlot;
        button.setAttribute('aria-label', `Book slot from ${timeSlot}`);
        button.addEventListener('click', () => selectTimeSlot(button));
        timeSlotsContainer.appendChild(button);
    }
}

function formatHour(hour) {
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:00 ${suffix}`;
}

// The initialization of the calendar and other UI-related functions remain the same

document.getElementById('bookingForm').addEventListener('submit', async function(event) {
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

    try {
        await bookSlot(date, selectedSlot.dataset.timeSlot);
        alert(`Booking confirmed for ${name} on ${date} at ${selectedSlot.textContent}.`);
        this.reset();
        showDateSelection();
    } catch (error) {
        alert(`Error booking the slot: ${error.message}. Please try again.`);
    }
});

async function bookSlot(date, timeSlot) {
    const response = await fetch('http://localhost:3000/book-slot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, timeSlot })
    });

    if (!response.ok) {
        throw new Error('Slot already booked or an error occurred');
    }
}
