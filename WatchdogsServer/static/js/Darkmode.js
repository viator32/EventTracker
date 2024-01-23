let colorScheme;
document.addEventListener("DOMContentLoaded", function() {
    initialColorScheme();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', initialColorScheme);
});


// MediaQuery for automatic  color scheme preference setting */
function initialColorScheme(){
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        colorScheme = 'dark';
        switch_between_modes();
    }
    else colorScheme = 'light'
}


function switch_between_modes(){
    const elements = ['body', '.main-header', '.sidebar-menu', '.calendar-header', 'h2', 'p', 'h4', 'button',
        '.heatmap-icon', '.dropdown-arrow-icon', '.progress-icon', '#newVeranstaltung input', '.plus-icon'];
    toggle_mode(elements);
}

function mode_switch_without_initial(){
    colorScheme == 'dark' ? colorScheme = 'light' : colorScheme = 'dark';
    const elements = ['#calendarTable span', '.label-icon'];
    toggle_mode(elements);
}

function mode_switch_lectures(lecture){
    const elements = ['#veranstaltungDropdownContent #' + lecture, '#' + lecture + ' .label-icon', '#' + lecture + ' .settings-icon'];
    toggle_mode(elements);
}


// Iterieren der toggle Funktion über alle Elemente; notwendig bei querySelectorAll
function toggle_mode(elements){
    elements.forEach(function (element){
        document.querySelectorAll(element).forEach(function(element) {
            element.classList.toggle("darkmode");},)
    })
}


function toggleWithDelay(elements, className, delay) {
        elements.forEach(function(element, index) {
          setTimeout(function() {
            element.classList.toggle(className);
          }, index * delay);
        });
      }