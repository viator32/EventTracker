'use strict';

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration =>
                console.log('Service Worker Registered'))
            .catch((error) => {
                console.log('Something went wrong during registration. ', error)
            })
    })
}


//map in der Veranstaltungen gespeichert werden
//Key ist die Veranstaltung, als value liegt ein array vor mit inputTime an erster Stelle und dann inputSemester
let veranstaltungenMap = new Map();

function toggle(elementId){
    let element = document.getElementById(elementId);
    element.style.display = (element.style.display === 'none' || element.style.display === '') ? 'block' : 'none';
}

function toggle_sidebar() {
    toggle('Sidebar');
    document.getElementById("Sidebar_button").style.display = "inline";
}

function toggle_veranstaltung_dropdown() {
    toggle_new_veranstaltung();
    toggle('veranstaltungDropdownContent');
}

function toggle_new_veranstaltung(){
    toggle('newVeranstaltung');
}

function toggle_progress_popup(){
    toggle('progress-popup');
}

function toggle_monthly_progress_popup(){
    toggle('monthly-progress-popup');
}


document.addEventListener("DOMContentLoaded", function () {
    //Add Event when Enter is pressed
    let input = document.getElementById("inputVeranstaltung");
    input.addEventListener("keypress", function (event) {
        // If "Enter" key is pressed on keyboard
        if (event.key === "Enter") {
            // Cancel the default action, if needed
            event.preventDefault();
            addEventViaInput();
        }
    });

});

//Veranstaltung hinzufügen
function addEvent(name){
    let dropdown = document.getElementById('veranstaltungDropdownContent');
    // <p className="toggle-settings"><i className="label-icon sidebar-icon"></i>Statistik
    // <button className="settings-icon" onClick="toggle_edit_veranstaltung_popup()"></button></p>

    dropdown.innerHTML += "<p class=\"toggle-settings\" id=\"" + name + "\"><i " +
        "class=\"label-icon sidebar-icon\"></i>" + name +
        "<button class=\"settings-icon\" onclick=\"toggle_edit_veranstaltung_popup(\'" + name +
        "\')\"></button></p>";
        veranstaltungenMap.set(name, {name: name, timespent: 0, maxtime: 0, semester : '0'});
        addProgressBar(veranstaltungenMap.get(name).name, veranstaltungenMap.get(name).timespent, veranstaltungenMap.get(name).maxtime);
        updateProgressBar(veranstaltungenMap.get(name).name, veranstaltungenMap.get(name).timespent, veranstaltungenMap.get(name).maxtime);
         // Update the dropdown options
         updateDropdown(name);
        console.log(veranstaltungenMap);
        saveVeranstaltungen(veranstaltungenMap);

}





function addProgressBar(veranstaltungName, timespent, maxtime) {
    // Get the progress containers
    const progressContainer = document.getElementById('progress-popup-content');
    const monthlyProgressContainer = document.getElementById('monthly-progress-popup-content');

    // Create elements for the progress bar for each container
    const progressDiv = createProgressDiv(veranstaltungName, timespent, maxtime);
    const monthlyProgressDiv = createProgressDiv(veranstaltungName, timespent, maxtime);

    // Append elements to their respective containers
    progressContainer.appendChild(progressDiv);
    monthlyProgressContainer.appendChild(monthlyProgressDiv);

    updateProgressBar(veranstaltungName, timespent, maxtime);
}

function createProgressDiv(veranstaltungName, timespent, maxtime) {
    // Create elements for the progress bar
    const progressDiv = document.createElement('div');
    progressDiv.classList.add('veranstaltung-progress');
    progressDiv.dataset.veranstaltung = veranstaltungName;

    const label = document.createElement('label');
    label.classList.add('progresslabel');
    label.textContent = veranstaltungName;

    const progressNumbers = document.createElement('p');
    progressNumbers.classList.add('progress-numbers');
    progressNumbers.textContent = `${timespent}/${maxtime}`;

    const progressBar = document.createElement('progress');
    progressBar.classList.add('progress-bar');
    progressBar.id = `progress-${veranstaltungName}`;
    progressBar.value = timespent;
    progressBar.max = maxtime;

    // Append elements to the progressDiv
    progressDiv.appendChild(label);
    progressDiv.appendChild(progressNumbers);
    progressDiv.appendChild(progressBar);

    return progressDiv;
}


function updateProgressBar(veranstaltungName, timeSpent, maxTime) {
    const progressContainer = document.getElementById('progress-popup-content');
    const veranstaltungProgress = progressContainer.querySelector(`.veranstaltung-progress[data-veranstaltung="${veranstaltungName}"]`);

    const monthlyProgressContainer = document.getElementById('monthly-progress-popup-content');
    const monthlyVeranstaltungProgress = monthlyProgressContainer.querySelector(`.veranstaltung-progress[data-veranstaltung="${veranstaltungName}"]`);

    if (veranstaltungProgress) {
        const progressNumbers = veranstaltungProgress.querySelector('.progress-numbers');
        const progressBar = veranstaltungProgress.querySelector('.progress-bar');
        progressBar.value = timeSpent;
        progressBar.max = maxTime;
        progressNumbers.textContent = `${timeSpent}/${maxTime}`;

    } else {
        // If progress bar doesn't exist, add a new one
        addProgressBar(veranstaltungName, timeSpent, maxTime);
    }

    if (monthlyVeranstaltungProgress) {
        // Update the progress bar in the monthly progress container
        const monthlyProgressNumbers = monthlyVeranstaltungProgress.querySelector('.progress-numbers');
        const monthlyProgressBar = monthlyVeranstaltungProgress.querySelector('.progress-bar');
        const currentMonthYear = document.getElementById('currentMonthYear');
        let monthlytimeSpend = filterAndCalculateTimeSpent(getYearNumber(currentMonthYear.textContent), veranstaltungName);
        console.log(monthlytimeSpend);
        console.log(getYearNumber(currentMonthYear.textContent));
        monthlyProgressBar.value = monthlytimeSpend;
        monthlyProgressBar.max = Math.round(maxTime/6);
        monthlyProgressNumbers.textContent = `${monthlytimeSpend}/${Math.round(maxTime/6)}`;
    } else {
        // If progress bar doesn't exist in the monthly container, add a new one
        addProgressBar(veranstaltungName, timeSpent, maxTime);
    }
}

function updateProgressBarForAllVeranstaltungen() {
    veranstaltungenMap.forEach(veranstaltung => {
        updateProgressBar(veranstaltung.name, veranstaltung.timespent, veranstaltung.maxtime);
    });
}

function filterAndCalculateTimeSpent(month, veranstaltung) {
    // Filter events for the specified month and Veranstaltung
    const filteredEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getMonth() === month && event.veranstaltung === veranstaltung;
    });

    // Calculate the total time spent for the filtered events
    console.log(filteredEvents);
    let totalTimeSpent = 0;
    filteredEvents.forEach(event => {
        totalTimeSpent += calculateTimeSpent(event);
    });

    // Return the total time spent
    return totalTimeSpent;
}

function getYearNumber(yearName) {
    const yearMap = {
        'January': 0,
        'February': 1,
        'March': 2,
        'April': 3,
        'May': 4,
        'June': 5,
        'July': 6,
        'August': 7,
        'September': 8,
        'October': 9,
        'November': 10,
        'December': 11
    };
    // Extract the first word from the input
    const firstWord = yearName.split(' ')[0];
    // Convert yearName to title case for case-insensitivity
    const formattedYearName = firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();

    // Check if the yearName is a key in the yearMap
    if (yearMap.hasOwnProperty(formattedYearName)) {
        return yearMap[formattedYearName];
    } else {
        // Handle the case where the input is not a valid month name
        console.error('Invalid month name:', yearName);
        return null;
    }
}


function addEventViaInput(){
    let inputVeranstaltung = document.getElementById('inputVeranstaltung').value;
    if (!veranstaltungenMap.has(inputVeranstaltung)){
        addEvent(inputVeranstaltung);
        updateCache();
        //if dropdown closed it opens
        document.getElementById("veranstaltungDropdownContent").style.display = "block";
        //add the lecture name as a filteroption
        addVeranstaltungToFilter(inputVeranstaltung);
        if (colorScheme == 'dark') mode_switch_lectures(inputVeranstaltung);
    }
    else {
        alert("Veranstaltung existiert bereits");
    }
}

// // Senden einer Nachricht an den Service Worker
// function updateCache(){
//     if (navigator.serviceWorker.controller) {
//         console.log("message sent");
//         navigator.serviceWorker.controller.postMessage({
//             command: 'updateCache'
//         });
//     }
// }

function updateDropdown(inputVeranstaltung){
const eventTypeDropdown = document.getElementById('eventVeranstaltung');
        const option = document.createElement('option');
        option.value = inputVeranstaltung;
        option.text = inputVeranstaltung;
        eventTypeDropdown.add(option);
}

function deleteFromDropdown(inputVeranstaltung) {
    const eventTypeDropdown = document.getElementById('eventVeranstaltung');

    // Find the index of the option with the specified value
    for (let i = 0; i < eventTypeDropdown.options.length; i++) {
        if (eventTypeDropdown.options[i].value === inputVeranstaltung) {
            // Remove the option from the dropdown
            eventTypeDropdown.remove(i);
            break; // Exit the loop once the option is removed
        }
    }
}

let currentEvent;
function toggle_edit_veranstaltung_popup (event){
    currentEvent = event;
    console.log(currentEvent);
    console.log(veranstaltungenMap.get(currentEvent));
    toggle('editVeranstaltung');
}

function clearInput() {
    // Get the input elements by their IDs
    const inputName = document.getElementById('inputName');
    const inputTime = document.getElementById('inputTime');
    const inputSemester = document.getElementById('inputSemester');

    // Clear the values of the input fields
    inputName.value = '';
    inputTime.value = '';
    inputSemester.value = '';
}

//Veranstaltungen löschen
function deleteEvent() {
    const e1 = document.getElementById(currentEvent);

    // Remove progress bar from progress-popup-content
    const progressContainer = document.getElementById('progress-popup-content');
    const progressDiv = progressContainer.querySelector(`.veranstaltung-progress[data-veranstaltung="${currentEvent}"]`);
    if (progressDiv) {
        progressDiv.remove();
    }

    // Remove progress bar from monthly-progress-popup-content
    const monthlyProgressContainer = document.getElementById('monthly-progress-popup-content');
    const monthlyProgressDiv = monthlyProgressContainer.querySelector(`.veranstaltung-progress[data-veranstaltung="${currentEvent}"]`);
    if (monthlyProgressDiv) {
        monthlyProgressDiv.remove();
    }
    // Remove the veranstaltung from the map
    deleteFromDropdown(currentEvent);
    veranstaltungenMap.delete(currentEvent);
    console.log(veranstaltungenMap);
    e1.remove();
    //delete veranstaltung in the filter dropdown also
    removeVeranstaltungFromFilter(currentEvent);
    toggle('editVeranstaltung');
    
   
}

function deleteVeranstaltung(){
    // Show confirmation alert
    const confirmDelete = confirm("Sind Sie sicher die Veranstaltung und alle zugehörigen Events löschen zu wollen?");
    if (confirmDelete) {
        deleteEvent();
    }
    
}

function editVeranstaltungElement(name, inputname) {
    let elementToEdit = document.getElementById(name);

    // Check if the element exists
    if (elementToEdit) {
        // Example: Change the id and textContent
        elementToEdit.id = `${inputname}`;
        elementToEdit.textContent = `${inputname}`;
    } else {
        console.error("Element not found for editing");
    }
}

//Veranstaltungen bearbeiten...
function editEvent(){
    console.log(currentEvent);
    let inputName = document.getElementById('inputName').value;
    let inputTime = document.getElementById('inputTime').value;
    let inputSemester = document.getElementById('inputSemester').value;

    inputTime *= 60;// Stunden * 60 = minuten

    let timespentAttribut = veranstaltungenMap.get(currentEvent).timespent;
    let ExistingNameAttribut = veranstaltungenMap.get(currentEvent).name;
    let ExistingtMaxTimeAttribut = veranstaltungenMap.get(currentEvent).maxtime;
    let ExistingtSemesterAttribut = veranstaltungenMap.get(currentEvent).semester;

    let updateData = { name: currentEvent, timespent: timespentAttribut, maxtime: ExistingtMaxTimeAttribut, semester: ExistingtSemesterAttribut };

switch (true) {
    case inputName == '' && inputTime == '' && inputSemester !== '':
        console.log("1");
        updateData.semester = inputSemester;
        break;
    case inputName == '' && inputTime !== '' && inputSemester == '':
        console.log("2");
        updateData.maxtime = inputTime;
        break;
    case inputName !== '' && inputTime == '' && inputSemester == '':
        console.log("3");
        updateData.name = inputName;
        break;


    case inputName == '' && inputTime !== '' && inputSemester !== '':
        console.log("4");
        updateData.maxtime = inputTime;
        updateData.semester = inputSemester;
        break;
    case inputName !== '' && inputTime !== '' && inputSemester == '':
        console.log("5");
        updateData.name = inputName;
        updateData.maxtime = inputTime;
        break;
    case inputName !== '' && inputTime == '' && inputSemester !== '':
        console.log("5");
        updateData.name = inputName;
        updateData.semester = inputSemester;
        break;


    case inputName !== '' && inputTime !== '' && inputSemester !== '':
        console.log("6");
        updateData.name = inputName;
        updateData.maxtime = inputTime;
        updateData.semester = inputSemester;
        break;

    default:
        console.log("all is empty");
        updateData = {
            name: ExistingNameAttribut,
            timespent: timespentAttribut,
            maxtime: ExistingtMaxTimeAttribut,
            semester: ExistingtSemesterAttribut
        };

}
console.log(updateData);
    deleteEvent();
    addEvent(updateData.name);
    addVeranstaltungToFilter(updateData.name);
    veranstaltungenMap.set(updateData.name, {name: updateData.name, timespent: timespentAttribut, maxtime: updateData.maxtime, semester : updateData.semester});
    addProgressBar(updateData.name, updateData.timespent, updateData.maxtime);
    updateDropdown(updateData.name);
    saveVeranstaltungen(veranstaltungenMap);
    clearInput();
    localStorageEditVeranstaltung(veranstaltungenMap.get(inputName));
    toggle('editVeranstaltung');
    return;
}



function cancel_edit_event(){
    clearInput();
    toggle('editVeranstaltung');
}

async function saveVeranstaltungen(veranstaltungenMap){

const veranstaltungenArray = Array.from(veranstaltungenMap.values());

const veranstaltungenJSON = JSON.stringify(veranstaltungenArray);

 try {
        const response = await fetch('api/veranstaltungen/post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: veranstaltungenJSON,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseData = await response.json();

        console.log('Veranstaltungen updated successfully:', responseData);
    } catch (error) {
        console.error('Error updating Veranstaltungen:', error);
    }
}


async function fetchVeranstaltungen() {
    try {
        const response = await fetch('api/veranstaltungen/json');
        const veranstaltungenData = await response.json();

        veranstaltungenData.forEach(veranstaltungData => {
            const veranstaltungName = veranstaltungData.name;

            if (veranstaltungenMap.has(veranstaltungName)) {
                const existingVeranstaltung = veranstaltungenMap.get(veranstaltungName);
                existingVeranstaltung.timeSpent = veranstaltungData.timeSpent;
                existingVeranstaltung.maxTime = veranstaltungData.maxTime;
                existingVeranstaltung.semester = veranstaltungData.semester;

            } else {
                veranstaltungenMap.set(veranstaltungName, {
                    name: veranstaltungName,
                    timespent: veranstaltungData.timeSpent,
                    maxtime: veranstaltungData.maxTime,
                    semester: veranstaltungData.semester,
                });
            
            addEvent(veranstaltungName);
} 
        });

        // Now veranstaltungenMap is updated with the data from the backend
    } catch (error) {
        console.error('Error fetching veranstaltungen data:', error);
    }
}

// // extern File Import and fetch to backend
// document.addEventListener("DOMContentLoaded", function () {
//     const importButton = document.querySelector('#inputFile');
//
// // const preview = document.querySelector('.preview');
//
//     importButton.addEventListener('change', () => {
//         console.log("Event Listener input change triggered");
//         const file = document.getElementById('inputFile').files[0];
//
//         if (file) {
//             const formData = new FormData();
//             formData.append('file', file);
//
//             fetch('api/import', {
//                 method: 'POST',
//                 body: formData
//             })
//                 .then(response => response.json())
//                 .then(data => {
//                     console.log('Antwort:', data);
//                 })
//                 .catch(error => {
//                     console.error('Fehler beim file input Hochladen:', error);
//                 });
//         } else {
//             console.error('Keine Datei');
//         }
//         console.log(file);
//     });
// })


/////opening and closing the Search & Filter pop-ups
function search_pop_up_date() {
    document.getElementById("popup_datum_search").style.display = 'block';
}

function search_popup_close() {
  document.getElementById("popup_datum_search").style.display = 'none';
  document.getElementById("popup_event_search").style.display = 'none';
}




function search_pop_up_event() {
    document.getElementById("popup_event_search").style.display = 'block';
}


function open_dropdown_menu(){
    document.getElementById("dropdown-content").classList.toggle("show");
    console.log("yooohooo");
}

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
    var openDropdown = dropdowns[i];
    if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
    }
    }
}
}

function addVeranstaltungToFilter(inputVeranstaltung){
        var label = document.createElement('label');
        label.textContent = " " +  inputVeranstaltung;
        var newElementDiv= document.createElement('div');
        newElementDiv.setAttribute("id", inputVeranstaltung + "dropdownFilter");
        var newElement= document.createElement('input');
        newElement.type= 'checkbox';
        console.log(newElement.textContent);
        var targetPlaceForFilter = document.getElementById("VeranstaltungFilter");
        targetPlaceForFilter.appendChild(newElementDiv);
        console.log(newElementDiv.id);
        targetPlaceForFilter = document.getElementById(newElementDiv.id);
        targetPlaceForFilter.setAttribute("id", inputVeranstaltung + "dropdownFilterChild");
        targetPlaceForFilter.appendChild(newElement);
        targetPlaceForFilter.appendChild(label);
}


function removeVeranstaltungFromFilter(currentEvent){
    //get Parent id 
    var removeTargetParent = document.getElementById("VeranstaltungFilter");
    var TargetToBeRemoved = document.getElementById(currentEvent+ "dropdownFilterChild");
    //remove certain child from parent 
    removeTargetParent.removeChild(TargetToBeRemoved);
}
//-> change child upon changing



//localStorage speicher
function localStorageSaveEvent(element){
    let id = element.id;
    let elementAsJson = JSON.stringify(element);
    localStorage.setItem(id, elementAsJson);
}

//localStorage editieren
function localStorageEditEvent(newElement){
    let id = newElement.id;
    LocalStorageDeleteEvent(id);
    localStorageSaveEvent(newElement);
}

function localStorageSaveVeranstaltung(veranstaltung){
    let veranstaltungAsJson = JSON.stringify(veranstaltung)
    localStorage.setItem(veranstaltung, veranstaltungAsJson);
}

function localStorageEditVeranstaltung(newVeranstaltung){
    console.log(newVeranstaltung + 'Hallo');
    let veranstaltungName = newVeranstaltung;
    LocalStorageDeleteEvent(veranstaltungName);
    localStorageSaveVeranstaltung(newVeranstaltung);
}

//localStorage abrufen beim Laden wenn nicht aus Backup
document.addEventListener("DOMContentLoaded", function() {
    for (let i = 0; i < localStorage.length; i++){
        const key = localStorage.key(i);
        const valueAsJson = localStorage.getItem(key);
        let value = JSON.parse(valueAsJson);
        if (key.charAt(0) != '_'){
            veranstaltungenMap.set(key, value);
            console.log(value);
            addEvent(value);
            if (colorScheme == 'dark') mode_switch_lectures(value);
        }
        else{
            events.push(value);
        }
    }

    console.log(veranstaltungenMap);
    console.log(events);
});

//localStorage daten entfernen
function LocalStorageDeleteEvent(key){
    localStorage.removeItem(key);
}