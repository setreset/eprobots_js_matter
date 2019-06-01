log(window.screen.width);
var WORLD_WIDTH = window.innerWidth; //window.screen.width; //1800;
var WORLD_HEIGHT = window.innerHeight; //window.screen.height; //800

let CONCURRENCY = 1;

var simsettings = {
    LIFETIME_BASE: 500,
    PROGRAM_LENGTH: 1000,
    DATA_LENGTH: 20,
    PROGRAM_STEPS: 1000,
    MUTATE_POSSIBILITY: 0.01,
    MUTATE_STRENGTH: 400,
    VELOCITY_MAX: 10,
    IMPULSE_MAX: 7,
    EPROBOTS_MAX: 500/CONCURRENCY,
    BORDERS: true,
    FOSSILTIME: 250,
    EPROBOTS_INIT: 50,
    BODY_RADIUS: 3,
    ENERGY_COUNT: 4, //(WORLD_WIDTH * WORLD_HEIGHT) / 50000,
    UPDATE_RATE: 10,
    EPROBOT_CONCURRENCY: CONCURRENCY
};