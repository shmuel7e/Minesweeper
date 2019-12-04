// STOPWATCH FUNCTION // 
function myTimer() {
    if (gMilliseconds < 10)
        gMilliseconds = "0" + gMilliseconds;
    document.querySelector('.watch').innerHTML = gMinutes + ":" + gSeconds + ":" + gMilliseconds;
    gMilliseconds++;
    if (gMilliseconds == 60) {
        gSeconds++;
        if (gSeconds == 60) {
            gMinutes++;
            if (gMinutes == 24) {
                gMinutes = 0;
            }
            gSeconds = 0;
        }
        gMilliseconds = 0;
    }
}
// START THE STOPWATCH // 
function timeStart() {
    gTimeInterval = setInterval(function() { myTimer() }, 10);
}
// Reset the STOPWATCH// 
function reset_stop() { // setting the stopwatch back to 0 when needed
    gMilliseconds = 0;
    gSeconds = 0;
    gMinutes = 0;
}


function shuffleArray(array) {
    var currentIndex = array.length,
        temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}