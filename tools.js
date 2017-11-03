// liefert ganzzahlen von 0 bis max-1
function tools_random(max){
    return Math.floor(Math.random()*max);
}

// liefert ganzzahlen von min bis max-1
function tools_random2(min, max){
    var delta = max-min;
    return Math.floor(Math.random()*delta)+min;
}