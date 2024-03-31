document.addEventListener('DOMContentLoaded', function() {
    const startHour = 9;
    const endHour = 20;
    const timeSlotsContainer = document.getElementById('timeSlots');

    for (let hour = startHour; hour < endHour; hour++) {
        const timeSlotButton = document.createElement('button');
        timeSlotButton.classList.add('time-slot');
        timeSlotButton.textContent = `${hour}:00 - ${hour + 1}:00`;
        timeSlotButton.dataset.timeSlot = `${hour}:00 - ${hour + 1}:00`;
        timeSlotButton.onclick = selectTimeSlot;
        timeSlotsContainer.appendChild(timeSlotButton);
    }
});

function selectTimeSlot(event) {
    const selectedButton = event.target;
    if (selectedButton.classList.contains('booked')) {
        alert('This time slot is already booked.');
        return;
    }

    const allButtons = document.querySelectorAll('.time-slot');
    allButtons.forEach(button => button.classList.remove('selected'));
    selectedButton.classList.add('selected');
}

document.getElementById('bookingForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const selectedTimeSlotButton = document.querySelector('.time-slot.selected');
    if (!selectedTimeSlotButton) {
        alert('Please select a time slot.');
        return;
    }

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const timeSlot = selectedTimeSlotButton.dataset.timeSlot;

    selectedTimeSlotButton.classList.add('booked');
    selectedTimeSlotButton.classList.remove('selected');
    selectedTimeSlotButton.onclick = null;

    alert(`Booking confirmed for ${name} at ${timeSlot}. Details will be sent to ${email} and ${phone}.`);

    this.reset();
    selectedTimeSlotButton.classList.remove('selected');
});
