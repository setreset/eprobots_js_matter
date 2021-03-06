// liefert ganzzahlen von 0 bis max-1
function tools_random(max){
    return Math.floor(Math.random()*max);
}

// liefert ganzzahlen von min bis max-1
function tools_random2(min, max){
    var delta = max - min;
    return Math.floor(Math.random()*delta)+min;
}

// subleq: https://en.wikipedia.org/wiki/One_instruction_set_computer
function tools_compute(program, data, PS) {
    var program_counter = 0;
    var step_counter = 0;
    var a, b, c;

    while (program_counter >= 0 && (program_counter + 2) < program.length && step_counter < PS) {
        a = program[program_counter];
        b = program[program_counter + 1];
        c = program[program_counter + 2];

        a = a % data.length;
        b = b % data.length;
        c = c % program.length;

        //a = Math.abs(a % memory.length);
        //b = Math.abs(b % memory.length);
        //c = Math.abs(c % memory.length);

        if (a < 0 || b < 0) {
            program_counter = -1;
        }else{
            data[b] = data[b] - data[a];
            if (data[b] > 0) {
                program_counter = program_counter + 3;
            } else {
                //c = memory[program_counter + 2];
                //c = c % memory.length;
                program_counter = c;
            }
        }
        step_counter++;
    }

    return step_counter;
}

function tools_mutate(mutate_possibility, mutate_strength, memory) {
    var new_memory = [];
    for (var i=0;i<memory.length;i++){
        if (i < (memory.length - 2)){
            var copyval = memory[i];
            if (Math.random() < mutate_possibility) {
                copyval = copyval + tools_random(mutate_strength) - (mutate_strength / 2);
            }
            new_memory.push(copyval);
        }else{
            new_memory.push(memory[i]);
        }
    }

    // control_vals
    //new_memory[memory.length-1] = tools_random(10);
    //new_memory[memory.length-2] = tools_random(2);

    return new_memory;
}

// Converts from degrees to radians.
Math.radians = function(degrees) {
    return degrees * Math.PI / 180;
};

// Converts from radians to degrees.
Math.degrees = function(radians) {
    return radians * 180 / Math.PI;
};

var stats = {};

function stats_incr(key){
    if (key in stats){
        stats[key]++;
    }else{
        stats[key] = 1;
    }
}


Date.prototype.timeNow = function () {
    return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
};

Date.prototype.today = function () {
    let part_date = ((this.getDate() < 10)?"0":"") + this.getDate();
    let part_month = (((this.getMonth()+1) < 10)?"0":"") + (this.getMonth()+1);

    return part_date+"."+part_month+"."+this.getFullYear();
};


function get_current_datetime_str(){
    var newDate = new Date();
    return newDate.today() + " " + newDate.timeNow();
}

function log(msg){
    console.log(get_current_datetime_str()+" " + msg);
}