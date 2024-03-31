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

