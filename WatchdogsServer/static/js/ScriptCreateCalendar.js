var events = [
    {id: "_xy1z2abc",date: "2024-01-05",eventtype: "", veranstaltung:"Test",from:"12:20",till: "12:30",waspause: "yes",pausetime: "4:30" },
];

function calculateTimeSpent(event) {
    // Convert start and end times to Date objects
    const startTime = parseTime(event.from);
    const endTime = parseTime(event.till);
    const pauseTime = parseTime(event.pausetime);

    // Calculate the time difference in milliseconds
    let timeDifference = endTime - startTime - pauseTime;

    // Convert time difference to minutes
    const timeSpentMinutes = Math.floor(timeDifference / (1000 * 60));

    return timeSpentMinutes;
}

// Helper function to parse time string and return time in milliseconds
function parseTime(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 * 60 * 1000 + minutes * 60 * 1000;
}

document.addEventListener("DOMContentLoaded", function () {
    const calendarTable = document.getElementById('calendarTable');
    const currentMonthYear = document.getElementById('currentMonthYear');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const eventListContainer = document.getElementById('eventListContainer');
    const addEventBtn = document.getElementById('addEventBtn');
    const plusButton = document.getElementById('plus-button');
    const todayBtn = document.getElementById('TodayBtn');
    let EventPopup = document.getElementById('popupMenu');
    let selectedDate = null;
    let selectedCell = null;
    let currentDay = null;

    fetchVeranstaltungen(); //add saved veranstaltungen from the csv file
    fetchEvents(); //add saved events from the csv file


    function generateUniqueId() {
        return '_' + Math.random().toString(36).substring(2, 9);
    } 

    //CALENDAR STUFF--------------------------
    function getDayMON(date) {
        // Converting days 
        let day = date.getDay();
        if (day == 0) day = 7;
        return day - 1;
    }


    // Get the current date
    const currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();

    function initCalendar(currentMonth, currentYear) {

        // Initial rendering
        renderCalendar(currentMonth, currentYear);

        // Update the month and year in the header
        currentMonthYear.textContent = getMonthName(currentMonth) + ' ' + currentYear;

        // Event listeners for next and previous buttons
        prevMonthBtn.addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderCalendar(currentMonth, currentYear);
            currentMonthYear.textContent = getMonthName(currentMonth) + ' ' + currentYear;
            updateProgressBarForAllVeranstaltungen();
        });

        nextMonthBtn.addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCalendar(currentMonth, currentYear);
            currentMonthYear.textContent = getMonthName(currentMonth) + ' ' + currentYear;
            updateProgressBarForAllVeranstaltungen();
        });
    }

    // resize Calendar
    window.addEventListener('resize', function() {
        renderCalendar(currentMonth, currentYear);
    });

    let navbarButton = document.getElementById('Sidebar_button');
    navbarButton.addEventListener('click', function() {
        renderCalendar(currentMonth, currentYear);
    });


    function renderCalendar(month, year) {
        // Clear the existing calendar
        calendarTable.innerHTML = '';

        // Get the first day and last day of the month
        const firstDay = getDayMON(new Date(year, month, 1));
        const lastDay = new Date(year, month + 1, 0).getDate();

        // Create the header row with day names
        const headerRow = calendarTable.insertRow();
        let daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        let media_width = window.matchMedia("(max-width: 1120px)");
        let navbar = document.getElementById('Sidebar');
        if (navbar.style.display == 'block'){
            media_width = window.matchMedia("(max-width: 1300px)");
        }
        if (media_width.matches) { // for smaller Windows
            daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        }
        daysOfWeek.forEach(day => {
            const th = document.createElement('th');
            th.textContent = day;
            headerRow.appendChild(th);
        });

        // Create the calendar cells
        let date = 1;
        for (let i = 0; i < 6; i++) {
            const row = calendarTable.insertRow();
            let isEmptyRow = true;

            for (let j = 0; j < 7; j++) {
                if (i === 0 && j < firstDay) {
                    // Add empty cells before the first day of the month
                    const cell = row.insertCell();
                    cell.textContent = '';
                } else if (date > lastDay) {
                    // Add empty cells after the last day of the month
                    const cell = row.insertCell();
                    cell.textContent = '';
                } else {
                    // Add cells with the date
                    const cell = row.insertCell();
                    cell.innerHTML = "<span>" +  date + "</span>";
                    // cell.textContent = date;
                    const formattedDate = formatDate(year, month, date);
                    cell.dataset.date = formattedDate;
                    cell.classList.add('day');

                    if (isCurrentDay(year, month, date)) {
                        currentDay = formatDate(year, month, date);
                        cell.classList.add('current-day');
                    }

                    date++;
                    isEmptyRow = false;
                }
            }

            if (isEmptyRow) {
                calendarTable.deleteRow(-1); // Remove the last row
            }
        }

        // Render events for the selected date
        if (selectedDate) {
            renderEventsForDate(selectedDate);
        }
        let darkmodeToggle = document.getElementById('darkmodeToggle').checked;
        console.log(darkmodeToggle);
        if (darkmodeToggle != true && colorScheme == 'dark'){
            //change darkmode from table elements
            let element = document.querySelectorAll('#calendarTable span');
            element.forEach(function(span) {
                span.classList.toggle("darkmode");},)
        }
    }

    var isHeatmapEnabled = false;
    // Event listener for the heatmap button
const heatmapBtn = document.getElementById('heatmapBtn');
heatmapBtn.addEventListener('click', toggleHeatmap);

    // Function to toggle heatmap
    function toggleHeatmap() {
        isHeatmapEnabled = !isHeatmapEnabled;

        if(isHeatmapEnabled){
            // heatmapBtn.textContent = 'Disable Heatmap';
            updateHeatmap();
        } else {

            // If heatmap is disabled, remove all heatmap colors
        const days = document.querySelectorAll('.day');
        days.forEach(dayElement => {
            dayElement.classList.remove('yellow', 'orange', 'red');
        });
            // heatmapBtn.textContent =  'Enable Heatmap';
        }
        
    }

    function updateHeatmap() {
        
        const days = document.querySelectorAll('.day');
        console.log(days);
    
        days.forEach(dayElement => {
            const numberOfEvents = events.filter(event => event.date == dayElement.dataset.date).length;  
            console.log(numberOfEvents);  
            // Remove previous heatmap colors
            dayElement.classList.remove('yellow', 'orange', 'red');
    
            // Apply new heatmap color based on the number of events
            if (numberOfEvents >= 1 && numberOfEvents < 3) {
                dayElement.classList.add('yellow');
            } else if (numberOfEvents >= 3 && numberOfEvents < 5) {
                dayElement.classList.add('orange');
            } else if (numberOfEvents >= 5) {
                dayElement.classList.add('red');
            }
        });
    } 
         
    

    function isCurrentDay(year, month, day) {
        // Marks current day 
        const currentDate = new Date();
        return (
            currentDate.getFullYear() === year &&
            currentDate.getMonth() === month &&
            currentDate.getDate() === day
        );
    }

    function formatDate(year, month, day) {
        return year + '-' + (month + 1).toString().padStart(2, '0') + '-' + day.toString().padStart(2, '0');  // Returns for example '2023-12-15'
    }

    function getMonthName(month) {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return monthNames[month];
    }

    initCalendar(currentMonth, currentYear);

// --------------------------------------------------------------------------------------------------CALENDAR STUFF--------------------------------------------------------------------------------------

// <------------------------------------------------------RENDER EVENT LIST FOR DATE------------------------------------------------------------------------------------------------------------------------------

function renderEventsForDate(date) {
    const eventsForDate = events.filter(event => event.date === date);
    const dayEventList = document.createElement('ul');
    dayEventList.classList.add('day-event-list');
    console.log(date);

    eventsForDate.forEach(event => {

        var filterContainer = document.getElementById("dropdown-content-display");
        // Select all checkboxes within the container
        var checkboxes = filterContainer.querySelectorAll('input[type="checkbox"]');

        let eventTypeDiv = document.getElementById("eventType");
        let eventTypesSelected = eventTypeDiv.querySelectorAll("option");
        console.log(eventTypesSelected);

        let shouldDisplayEvent = true;

        checkboxes.forEach(function(checkbox) {
            // Check if the checkbox is ticked i.e. checked √
            if (checkbox.checked) {
                console.log(checkbox.id + " is checked");
                console.log(checkbox.id);

                // if chosen filter option corresponds with the type of the event, display
                eventTypesSelected.forEach(function(option) {
                    if (option.id === checkbox.id) {
                        shouldDisplayEvent = true;
                    }
                });
            }
        });

        if (shouldDisplayEvent) {
            const li = document.createElement('li');
            li.className = 'event';  // Add the class 'event'
            li.dataset.eventVeranstaltung = event.name;  // Set the event name as a dataset attribute
            li.innerHTML = `[${event.from} - ${event.till}] - ${event.veranstaltung} <button class="editEventBtn">Edit</button> <button class="deleteEventBtn" data-event-date="${event.date}">Delete</button>`;
            const editBtn = li.querySelector('.editEventBtn');

            dayEventList.appendChild(li);

            // Edit event function
            editBtn.addEventListener('click', () => {
                // Call the editEvent function with the clicked event
                editEvent(event)
            });

            const deleteBtn = li.querySelector('.deleteEventBtn');
            // Add click event listener to delete button
            deleteBtn.addEventListener('click', () => {
                // Show confirmation alert
                const confirmDelete = confirm("Are you sure you want to delete this event?");
                const timeSpent = calculateTimeSpent(event);
                if (confirmDelete) {
                    if (veranstaltungenMap.has(event.veranstaltung)) {
                        // If the veranstaltung already exists, update its timeSpent value
                        const existingEvent = veranstaltungenMap.get(event.veranstaltung);
                        existingEvent.timespent -= timeSpent;
                    }
                    updateProgressBar(veranstaltungenMap.get(event.veranstaltung).name,
                        veranstaltungenMap.get(event.veranstaltung).timespent,
                        veranstaltungenMap.get(event.veranstaltung).maxtime);
                    // Delete the event
                    deleteEvent(event.id)
                    // Re-render the event list and the calendar
                    renderEventsForDate(event.date);
                }
            });
        }
    });

    eventListContainer.innerHTML = '';
    eventListContainer.appendChild(dayEventList);
}


// <------------------------------------------------------RENDER EVENT LIST FOR DATE---------------------------------------------

 // -------------------------------------------------------------SELECT THE DAY-----------------------------------------------


// Event listeners for calendar cells
calendarTable.addEventListener("click", function (event){ 

    
    // Remove the selected-day class from the previously selected cell
    if(selectedCell != null){
    selectedCell.classList.remove('selected-day');
}

    const cell = event.target.closest('td');

    if (cell && cell.dataset.date) {
        const date = cell.dataset.date;
        cell.classList.add('selected-day');
        selectedDate = date;
        selectedCell = cell;
        renderEventsForDate(date);
        showEventPopup(date);
    }
});

 // -------------------------------------------------------------SELECT THE DAY-----------------------------------------------


function deleteEvent(eventId) {
    // Find the index of the event with the specified date
    const index = events.findIndex(event => event.id === eventId);
    const timeSpent = calculateTimeSpent(index);
        
    // If the event is found, remove it from the events array
    if (index !== -1) {
        events.splice(index, 1);
    } else {
        console.error('Event not found for ID:', eventId);
    }
}

plusButton.addEventListener('click',function (){
    const hasStyle = plusButton.classList.contains('rotate-cross');
    if(hasStyle){
        console.log("close");
        hideEventPopup();
    }else
    showEventPopup(selectedDate);
});

function showEventPopup(date) {
    document.getElementById('eventDate').value = date;
    EventPopup.style.display = 'block';
    plusButton.classList.add('rotate-cross');
}

function hideEventPopup() {
    // document.getElementById('eventVeranstaltung').value = '';
    EventPopup.style.display = 'none';
      plusButton.classList.remove('rotate-cross');
}


todayBtn.addEventListener("click", () => {
    removeClassFromAll("selected-day");

    

    const currentDate = new Date();
    const todayYear = currentDate.getFullYear();
    const todayMonth = currentDate.getMonth();
    const todayDay = currentDate.getDate();

    currentMonth = todayMonth;
    currentYear = todayYear;

    initCalendar(currentMonth, currentYear);
    const todayCell = document.querySelector(`[data-date="${formatDate(todayYear, todayMonth, todayDay)}"]`);
    if (todayCell) {
        todayCell.classList.add('selected-day');
        selectedCell = todayCell;
        selectedDate = formatDate(todayYear, todayMonth, todayDay);
        renderEventsForDate(selectedDate);
    }
});
          
          
          function removeClassFromAll(className) {
            const elements = document.querySelectorAll(className);
            elements.forEach(element => {
                element.classList.remove(className); 
            });
        }



          // Event listener for "Add Event" button


addEventBtn.addEventListener('click', addEvent);


/// eventlistener for calling searched date 
document.getElementById("go-to-date-button").addEventListener("click", () =>{
    let searchedDay;
    let searchedMonth; 
    let searchedYear; 

    var searched_date = document.getElementById('date-input').value.split("-");
    var controlle = document.getElementById('date-input').value;
    console.log(searched_date, controlle);

    // Get the current date -> aus init calendar aber noch DRY code 
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    //counter for how many times the search request has been completed 
    let searchRequestCompleted = false
    

    if(searched_date[0]!=""){  // making sure that clicking the button without entering date input wont render anything
        do{
            searchedYear = searched_date[0];
            searchedMonth = searched_date[1]-1;

            // if-expression for cutting off the excess 0 digit that comes with the date input value for days 
            let searchedDayDigits= String(searched_date[2]).split('');
            if(searchedDayDigits[0]=='0'){
                searchedDay= searchedDayDigits[1];
            }
            else{
                searchedDay= searched_date[2];
            }

            let currentMonthPopup = currentMonth==searchedMonth && currentYear==searchedYear;

            //marking the Search request as completed for the eventlistner perhaps? 
            searchRequestCompleted=true;
            console.log(searchRequestCompleted);
            

            if(currentMonthPopup == false){
                removeClassFromAll("selected-day");
                
                // Funktion aus nextMonthBtn 
                initCalendar(searchedMonth, searchedYear);
                currentMonthYear.textContent = getMonthName(searchedMonth) + ' ' + searchedYear;

            }
            else{}

            // Remove the selected-day class from the previously selected cell
            if(selectedCell != null){
                selectedCell.classList.remove('selected-day');
            }


            function find_specific_cell_date(){
                for (var i = 0; row = calendarTable.rows[i]; i++) {
                    for (var j = 0; cell = row.cells[j]; j++) {
                        if (cell.textContent == searchedDay) {
                            return cell;
                        }
                    }
                }

            }

            // Funktion aus select date 
            find_specific_cell_date();
            cell.classList.add('selected-day');
            selectedDate = searched_date;
            selectedCell = cell;
            // renderEventsForDate(date);
            // showEventPopup(date);
            search_popup_close();
            document.getElementById('date-input').value = '';
            return searchRequestCompleted;
        }
        while(searchRequestCompleted=false)
    }
console.log(searchRequestCompleted);
},)

const pauseTimeContainer = document.querySelector('.pauseTime');
pauseTimeContainer.style.display = 'none';

wasPauseYes.addEventListener('change', function () {
    if (wasPauseYes.checked) {
        wasPauseNo.checked = false; // Uncheck wasPauseNo if wasPauseYes is checked
        pauseTimeContainer.style.display = 'flex';
    }

});

    wasPauseNo.addEventListener('change', function () {
        if (wasPauseNo.checked) {
            wasPauseYes.checked = false; // Uncheck wasPauseYes if wasPauseNo is checked
            pauseTimeContainer.style.display = 'none';
        }});

       

function editEvent(event) {
    // Populate the event popup with the data of the selected event
    document.getElementById('eventDate').value = event.date;
    document.getElementById('eventType').value = event.eventtype;
    document.getElementById('eventVeranstaltung').value = event.veranstaltung;
    document.getElementById('eventTimeFrom').value = event.from;
    document.getElementById('eventTimeTill').value = event.till;
    document.getElementById('wasPauseYes').checked = event.waspause === 'yes';
    document.getElementById('wasPauseNo').checked = event.waspause === 'no';
    document.getElementById('pauseTime').value = event.pausetime;

    // Display the event popup
    showEventPopup(event.date);

    // Set a flag to indicate that we are editing an existing event
    document.getElementById('addEventBtn').dataset.editMode = true;
    // Store the ID of the event being edited
    document.getElementById('addEventBtn').dataset.editEventId = event.id;
    localStorageEditEvent(event);
}


function addEvent() {

    let errorCode = 0;
    
    const eventId = document.getElementById('addEventBtn').dataset.editMode === 'true' ?
        document.getElementById('addEventBtn').dataset.editEventId :
        generateUniqueId();
    // Get values from input fields
    var eventDate = document.getElementById('eventDate').value;
    var eventType = document.getElementById('eventType').value;
    var eventVeranstaltung = document.getElementById('eventVeranstaltung').value;
    var eventTimeFrom = document.getElementById('eventTimeFrom').value;
    var eventTimeTill = document.getElementById('eventTimeTill').value;
    var wasPauseYes = document.getElementById('wasPauseYes').checked;
    var wasPauseNo = document.getElementById('wasPauseNo').checked;
    var pauseTime = document.getElementById('pauseTime').value;

    let wasPause = wasPauseYes ? "yes" : (wasPauseNo ? "no" : '');

    if (wasPause === "no" || wasPause===''){
        pauseTime = "00:00";
    }


    // Combine date and time strings
    var fromDateTime = new Date(eventDate + ' ' + eventTimeFrom);
    var tillDateTime = new Date(eventDate + ' ' + eventTimeTill);

     // Check if the date and time values are valid
     if (isNaN(fromDateTime) || isNaN(tillDateTime) || fromDateTime >= tillDateTime) {
        errorCode = 1;
        alert('Please enter a valid date and time range.');
    }

    // Check if a valid event type is selected
    if (eventType === 'default') {
        errorCode = 2;
        alert('Please select a valid event type.');
    }

    // Check if a valid veranstaltung is selected
    if (eventVeranstaltung === 'default') {
        errorCode = 3;
        alert('Please select a valid veranstaltung.');
    }

    // Check if pause time is valid
    if ((wasPauseYes || wasPauseNo) && isNaN(parseInt(pauseTime, 10))) {
        errorCode = 4;
        alert('Please enter a valid pause time.');
    }

    // Handle errors
    if (errorCode !== 0) {
        alert('Error adding event. Please fix the highlighted issues.');
        return;
    }

    // Create an event object
    var newEvent = {
        id: eventId,
        date: eventDate,
        eventtype: eventType,
        veranstaltung: eventVeranstaltung,
        from: eventTimeFrom,
        till: eventTimeTill,
        waspause: wasPause,
        pausetime: pauseTime,
    };
    localStorageSaveEvent(newEvent);

    const timeSpent = calculateTimeSpent(newEvent);
    
    // Display or use the calculated timeSpent value as needed
    console.log('Time spent on the event:', timeSpent, 'minutes');

    if (document.getElementById('addEventBtn').dataset.editMode === 'true') {
        // Find the index of the event with the specified ID
        const index = events.findIndex(event => event.id === eventId);

        // If the event is found, update it in the events array
        if (index !== -1) {
            if (veranstaltungenMap.has(events[index].veranstaltung)) {
                const timeSpentprev = calculateTimeSpent(events[index]);
                // If the veranstaltung already exists, update its timeSpent value
                const existingEvent = veranstaltungenMap.get(events[index].veranstaltung);
                existingEvent.timespent -= timeSpentprev;
            }
            events[index] = newEvent;
            document.getElementById('addEventBtn').dataset.editMode = false;
            document.getElementById('addEventBtn').dataset.editEventId = null;
            clearPopupinput();
            hideEventPopup();
        } else {
            console.error('Event not found for ID:', eventId);
        }
    } else {
        if (errorCode == 0) {
            events.push(newEvent);
            clearPopupinput();
            hideEventPopup();
        }
    }

    if(eventVeranstaltung.value !== 'default'){
        if (veranstaltungenMap.has(newEvent.veranstaltung)) {
            // If the veranstaltung already exists, update its timeSpent value
            const existingEvent = veranstaltungenMap.get(newEvent.veranstaltung);
            existingEvent.timespent += timeSpent;
        }
    
        updateProgressBar(veranstaltungenMap.get(newEvent.veranstaltung).name,
        veranstaltungenMap.get(newEvent.veranstaltung).timespent,
        veranstaltungenMap.get(newEvent.veranstaltung).maxtime);
            }else{return}

    postEvents();

    // Display events in the console
    console.log('Events:', events);
    console.log(veranstaltungenMap);

   

    renderEventsForDate(selectedDate);

    // Clear input fields
    function clearPopupinput(){
    document.getElementById('eventDate').value = '';
    document.getElementById('eventType').value = '';
    document.getElementById('eventVeranstaltung').value = '';
    document.getElementById('eventTimeFrom').value = '';
    document.getElementById('eventTimeTill').value = '';
    document.getElementById('wasPauseYes').checked = false;
    document.getElementById('wasPauseNo').checked = false;
    document.getElementById('pauseTime').value = '';
    }
    function postEvents() {
        try {
            const response = fetch('api/events/post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(events),
            });
    
        } catch (error) {
            console.error('Fetch error:', error);
        } 
    }

}

async function fetchEvents() {
    try {
        console.log("json request send");
        const response = await fetch('api/events/json'); // Await the fetch operation

        if (!response.ok) {
            console.error('Fetch error:', response.statusText);
            return;
        }

        let responseData;
        try {
            responseData = await response.text(); // Await the response text
        } catch (textError) {
            console.error('Error reading response text:', textError);
            return;
        }

        let data;
        try {
            data = JSON.parse(responseData);
        } catch (jsonError) {
            console.error('Error parsing JSON:', jsonError);
            return;
        }

        // Update the events array with the fetched data
        events.length = 0; // Clear existing events
        events = events.concat(data);

        // Render events for the selected date
    } catch (error) {
        console.error('Fetch error:', error);
    }

}


});

