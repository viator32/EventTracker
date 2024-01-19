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
    toggle('veranstaltungDropdownContent');
}

function toggle_new_veranstaltung(){
    toggle('newVeranstaltung');
}

function toggle_progress_popup(){
    toggle('progress-popup');
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
    dropdown.innerHTML += "<p class=\"toggle-settings\" id=\"" + name + "\"><i " +
        "class=\"label-icon sidebar-icon\"></i>" + name +
        "<button class=\"settings-icon\" onclick=\"toggle_edit_veranstaltung_popup(\'" + name +
        "\')\"></button></p>";

}


    function addProgressBar(veranstaltungName, timeSpent, maxTime) {
        const progressContainer = document.getElementById('progress-popup-content');

        // Create elements for the progress bar
        const progressDiv = document.createElement('div');
        progressDiv.classList.add('veranstaltung-progress');
        progressDiv.dataset.veranstaltung = veranstaltungName;
        console.log(veranstaltungName);

        const label = document.createElement('label');
        label.classList.add('progresslabel');
        label.textContent = veranstaltungName;

        const progressNumbers = document.createElement('p');
        progressNumbers.classList.add('progress-numbers');
        let percentage = (timeSpent / maxTime) * 100;         // (timeSpent minutes / maxTime minutes ) * 100%
        progressNumbers.textContent = `${percentage}/100`;


        const progressBar = document.createElement('progress');
        progressBar.classList.add('progress-bar');
        progressBar.id = `progress-${veranstaltungName}`;
        progressBar.value = timeSpent;
        progressBar.max = maxTime;

        // Append elements to the container
        progressContainer.appendChild(progressDiv);
        progressDiv.appendChild(label);
        progressDiv.appendChild(progressNumbers);
        progressDiv.appendChild(progressBar);

    }


    function updateProgressBar(veranstaltungName, timeSpent, maxTime) {
        const progressContainer = document.getElementById('progress-popup-content');
        const veranstaltungProgress = progressContainer.querySelector(`.veranstaltung-progress[data-veranstaltung="${veranstaltungName}"]`);

        if (veranstaltungProgress) {
            const progressNumbers = veranstaltungProgress.querySelector('.progress-numbers');
            const progressBar = veranstaltungProgress.querySelector('.progress-bar');
            progressBar.value = timeSpent;
            progressBar.max = maxTime;
            let percentage = (timeSpent / maxTime) * 100;
            progressNumbers.textContent = `${percentage}/100`;

        } else {
            // If progress bar doesn't exist, add a new one
            addProgressBar(veranstaltungName, timeSpent, maxTime);
        }
    }



function addEventViaInput(){
    let inputVeranstaltung = document.getElementById('inputVeranstaltung').value;
    if (!veranstaltungenMap.has(inputVeranstaltung)){
        addEvent(inputVeranstaltung);
        veranstaltungenMap.set(inputVeranstaltung, { timeSpent: 0, maxTime: 0 }); //evtl. stimmen typen nicht mehr
        console.log(veranstaltungenMap);
        updateCache();
        //if dropdown closed it opens
        document.getElementById("veranstaltungDropdownContent").style.display = "block";

        // Update the dropdown options
        updateDropdown(inputVeranstaltung);
    }
    else {
        alert("Veranstaltung existiert bereits");
    }
}

// Senden einer Nachricht an den Service Worker
function updateCache(){
    if (navigator.serviceWorker.controller) {
        console.log("message sent");
        navigator.serviceWorker.controller.postMessage({
            command: 'updateCache'
        });
    }
}

function updateDropdown(inputVeranstaltung){
const eventTypeDropdown = document.getElementById('eventVeranstaltung');
        const option = document.createElement('option');
        option.value = inputVeranstaltung;
        option.text = inputVeranstaltung;
        eventTypeDropdown.add(option);
}

let currentEvent;
function toggle_edit_veranstaltung_popup (event){
    currentEvent = event;
    toggle('editVeranstaltung');
}

//Veranstaltungen löschen
function deleteEvent() {
    const e1 = document.getElementById(currentEvent);
    veranstaltungenMap.delete(currentEvent);
    console.log(veranstaltungenMap);
    e1.remove();
    toggle('editVeranstaltung');
}

function deleteVeranstaltung(){
    // Show confirmation alert
    const confirmDelete = confirm("Sind Sie sicher die Veranstaltung und alle zugehörigen Events löschen zu wollen?");
    if (confirmDelete) {
        deleteEvent();
    }
}

//Veranstaltungen bearbeiten...
function editEvent(){
    console.log(currentEvent);
    let inputName = document.getElementById('inputName').value;
    console.log(inputName);
    let inputTime = document.getElementById('inputTime').value;
    inputTime *= 60;// Stunden * 60 = minuten
    let inputSemester = document.getElementById('inputSemester').value;
    if (inputName == '' && inputTime == '') {
        console.log("1")
        veranstaltungenMap.set(currentEvent, [undefined, inputSemester])
    }
    else if (inputName == '' && inputSemester == ''){
        console.log("2")
        veranstaltungenMap.set(currentEvent, [inputTime, undefined])
    }
    else if (inputName == ''){
        console.log("3")
        veranstaltungenMap.set(currentEvent, [inputTime, inputSemester])
    }
    else{
        console.log("4")
        deleteEvent();
        addEvent(inputName);
        veranstaltungenMap.set(inputName, {name: inputName, timeSpent: 0, maxTime: inputTime, semester : inputSemester });
        console.log(veranstaltungenMap);
        addProgressBar(veranstaltungenMap.get(inputName).name, veranstaltungenMap.get(inputName).timeSpent, veranstaltungenMap.get(inputName).maxTime);
        updateProgressBar(veranstaltungenMap.get(inputName).name, veranstaltungenMap.get(inputName).timeSpent, veranstaltungenMap.get(inputName).maxTime);
        updateDropdown(inputName);
        saveVeranstaltungen();
        return;
    }
    console.log(veranstaltungenMap);
    toggle('editVeranstaltung');
}


function cancel_edit_event(){
    toggle('editVeranstaltung');
}

function saveVeranstaltungen(veranstaltungenMap){
const veranstaltungenArray = Array.from(veranstaltungenMap.entries());
const veranstaltungenJSON = JSON.stringify(veranstaltungenArray);

fetch('api/veranstaltungen/post', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: veranstaltungenJSON,
})
.then(response => response.json())
.then(data => {
    // Handle the response from the backend if needed
    console.log('Response from server:', data);
})
.catch(error => {
    console.error('Error sending data to server:', error);
});
}

function fetchVeranstaltungen(){
    console.log("fetch Veranstaltungen");
// Make a GET request to your backend to get the JSON data
fetch('/api/veranstaltungen/json')
    .then(response => response.json())
    .then(veranstaltungenData => {
        // Assuming veranstaltungenData is the JSON data received from the backend

        // Iterate through the received JSON array and update the veranstaltungenMap
        veranstaltungenData.forEach(veranstaltungData => {
            const veranstaltungName = veranstaltungData.veranstaltung;

            // Check if the veranstaltung exists in the map
            if (veranstaltungenMap.has(veranstaltungName)) {
                // Update the values for the existing veranstaltung
                const existingVeranstaltung = veranstaltungenMap.get(veranstaltungName);
                existingVeranstaltung.timeSpent = veranstaltungData.timeSpent;
                existingVeranstaltung.maxTime = veranstaltungData.maxTime;
                existingVeranstaltung.semester = veranstaltungData.semester;
            } else {
                // If the veranstaltung does not exist, add it to the map
                veranstaltungenMap.set(veranstaltungName, {
                    veranstaltung: veranstaltungName,
                    timeSpent: veranstaltungData.timeSpent,
                    maxTime: veranstaltungData.maxTime,
                    semester: veranstaltungData.semester,
                });
            }
        });

        // Now veranstaltungenMap is updated with the data from the backend
    })
    .catch(error => console.error('Error fetching veranstaltungen data:', error));
    console.log('fetch Veranstaltungen end');
}



/////opening and closing the Search & Filter pop-ups
function search_pop_up_date() {
    document.getElementById("popup_datum_search").style.display = 'block';
  }

function search_pop_up_event() {
    document.getElementById("popup_event_search").style.display = 'block';
}

function search_popup_close() {
  document.getElementById("popup_datum_search").style.display = 'none';
  document.getElementById("popup_event_search").style.display = 'none';
}