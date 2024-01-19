function switch_between_modes(){
    var element1 = document.body;
    var element2 = document.querySelector('.main-header');
    var element3 = document.querySelector('.sidebar-menu');
    var element4 = document.querySelector('.calendar-header');
    var element5 = document.querySelectorAll('h2');
    var element6 = document.querySelectorAll('p');
    var element7 = document.querySelectorAll('h4');
    var element8 = document.querySelectorAll('button');
    element1.classList.toggle("darkmode");
    element2.classList.toggle("darkmode");
    element3.classList.toggle("darkmode");
    element4.classList.toggle("darkmode");
    // Iterieren der toggle Funktion über alle ausgewählten h2-Elemente; notwendig bei querySelectorAll
    element5.forEach(function(h2) {
            h2.classList.toggle("darkmode");},)
    element6.forEach(function(p) {
            p.classList.toggle("darkmode");},)
    element7.forEach(function(h4) {
            h4.classList.toggle("darkmode");},)
    element8.forEach(function(button) {
            button.classList.toggle("darkmode");},)
}