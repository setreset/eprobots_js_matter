var engine;
var eprobots;
var mousestate=1;

window.onload = function() {

    Matter.use(
      'matter-wrap' // PLUGIN_NAME
    );

    var myCanvas = document.getElementById('world');

    // create an engine
    engine = Matter.Engine.create();
    //engine.timing.timeScale=0.1;

    // turn gravity off
    engine.world.gravity.y = 0;

    // create a renderer
    var render = Matter.Render.create({
        canvas: myCanvas,
        engine: engine,
        options: {
            width: WORLD_WIDTH,
            height: WORLD_HEIGHT,
            background: '#eeeeee',
            wireframes: false,
            showAngleIndicator: false
        }
    });

    // run the engine
    //Engine.run(engine);

    //(function run() {
    //    window.requestAnimationFrame(run);
    //    Engine.update(engine, 1000 / 60);
    //})();

    // run the renderer
    Matter.Render.run(render);

    var runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    // ====================================================== //

    // create two boxes and a ground

    //var ballA = Bodies.circle(450, 50, 40, balloptions);

    //var boxA = Bodies.rectangle(400, 200, 80, 80, balloptions);
    //var boxB = Bodies.rectangle(450, 50, 80, 80, balloptions);
    //var ground = Bodies.rectangle(400, 610, 810, 60, {isStatic: true});

    for (var i=0;i<simsettings.ENERGY_COUNT;i++){
        var energy = new Energy(tools_random(WORLD_WIDTH), tools_random(WORLD_HEIGHT));
        Matter.World.add(engine.world, energy.body);
    }

    let thickness = 100;


    function addBorders(){
        Matter.World.add(engine.world, [
            // walls

            // top
            Matter.Bodies.rectangle(WORLD_WIDTH/2, -thickness/2, WORLD_WIDTH*1.5, thickness, { isStatic: true }),
            // bottom
            Matter.Bodies.rectangle(WORLD_WIDTH/2, WORLD_HEIGHT+thickness/2, WORLD_WIDTH*1.5, thickness, { isStatic: true }),
            // right
            Matter.Bodies.rectangle(WORLD_WIDTH+thickness/2, WORLD_HEIGHT/2, thickness, WORLD_HEIGHT*1.5, { isStatic: true }),
            // left
            Matter.Bodies.rectangle(-thickness/2, WORLD_HEIGHT/2, thickness, WORLD_HEIGHT*1.5, { isStatic: true })
        ]);
    }

    function initEprobots(kind){
        log("init eprobots ("+kind+")");

        for (var i=0;i<simsettings.EPROBOTS_INIT/simsettings.EPROBOT_CONCURRENCY;i++){

            var program = [];
            for (var pi = 0; pi < simsettings.PROGRAM_LENGTH; pi++) {
                var val = tools_random(simsettings.PROGRAM_LENGTH * 10) - simsettings.PROGRAM_LENGTH;
                program.push(val);
            }

            var init_data = [];
            for (var di = 0; di < simsettings.DATA_LENGTH; di++) {
                var val = tools_random2(-720, 720);
                init_data.push(val);
            }

            var eprobot = new Eprobot(kind, tools_random(WORLD_WIDTH), tools_random(WORLD_HEIGHT), program, init_data, simsettings.BODY_RADIUS);
            eprobots[kind].push(eprobot);
            Matter.World.add(engine.world, eprobot.body);
        }
    }

    function initEproboteaters(){
        log("init eproboteaters");

        for (var i=0;i<simsettings.EPROBOTS_INIT;i++){

            var program = [];
            for (var pi = 0; pi < simsettings.PROGRAM_LENGTH; pi++) {
                var val = tools_random(simsettings.PROGRAM_LENGTH * 10) - simsettings.PROGRAM_LENGTH;
                program.push(val);
            }

            var init_data = [];
            for (var di = 0; di < simsettings.DATA_LENGTH; di++) {
                var val = tools_random2(-720, 720);
                init_data.push(val);
            }

            var hue = 45;//tools_random(360);
            var eproboteater = new EprobotEater(tools_random(WORLD_WIDTH), tools_random(WORLD_HEIGHT), program, init_data, hue, simsettings.BODY_RADIUS);
            eproboteaters.push(eproboteater);
            Matter.World.add(engine.world, eproboteater.body);
        }
    }

    if (simsettings.BORDERS){
        addBorders();
    }

    // add mouse control
    var mouse = Matter.Mouse.create(render.canvas),
        mouseConstraint = Matter.MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false
                }
            }
        });

    Matter.World.add(engine.world, mouseConstraint);

    Matter.Events.on(mouseConstraint, 'mousedown', function (event) {
        log("mousedown called");
        var body = mouseConstraint.body;
        if (body && body.hasOwnProperty("my_energycount")){
            log(body.my_energycount);
        }

        if (mousestate==1){
            var mousePosition = event.mouse.position;
            //log(mousePosition);
            //mp = mousePosition;
            //mouseIsDown = true;
            // neues Energyobjekt
            var energy = new Energy(mousePosition.x, mousePosition.y);
            Matter.World.add(engine.world, energy.body);
        }
    });

    // keep the mouse in sync with rendering
    render.mouse = mouse;

    var steps = 0;
    var fitness=0;
    eprobots = [];
    var eprobots_ate = [];
    for (let i=0;i<simsettings.EPROBOT_CONCURRENCY;i++){
        eprobots.push([]);
        initEprobots(i);
    }
    var eproboteaters = [];

    Matter.Events.on(engine, 'beforeUpdate', function(event) {
        if (steps%1000==0){
            log("fitness: "+fitness);
            fitness=0;
        }
        // init wenn keine eprobots vorhanden
        for (let kind=0;kind<simsettings.EPROBOT_CONCURRENCY;kind++) {
            let eprobot_list = eprobots[kind];
            if (eprobot_list.length == 0) {
                //initEprobots(kind);
            }

            var eprobots_new = [];
            for (var i=0;i<eprobot_list.length;i++){
                var eprobot = eprobot_list[i];

                if (eprobot.isAlive()){
                    eprobot.update();
                    eprobots_new.push(eprobot);
                }else{
                    Matter.Body.setStatic(eprobot.body, true);
                    eprobots_ate.push({"expire": steps+simsettings.FOSSILTIME, "eprobot":eprobot});
                }

            }
            eprobots[kind] = eprobots_new;
        }

        /*if (eprobots.length>=200 && eproboteaters.length==0){
            //initEproboteaters();
        }

        var eproboteaters_new = [];
        for (var i=0;i<eproboteaters.length;i++){
            var eproboteater = eproboteaters[i];

            if (eproboteater.isExistent()){
                eproboteater.update();
                eproboteaters_new.push(eproboteater);
            }else{
                Matter.World.remove(engine.world, eproboteater.body);
            }

        }
        eproboteaters = eproboteaters_new;*/

        var c = 0;
        for (let eprobot_ate of eprobots_ate){
            if (steps>=eprobot_ate.expire){
                Matter.World.remove(engine.world, eprobot_ate.eprobot.body);
                c++;
            }
        }

        eprobots_ate = eprobots_ate.slice(c);

        steps++;
    });

    function eproboteaterEprobotCollision(body_eproboteater, body_eprobot){
        // a entfernen
        if (body_eprobot.my_active === false){
            return;
        }

        body_eprobot.my_active = false;
        Matter.World.remove(engine.world, body_eprobot);

        eproboteaterProcreation(body_eproboteater);
    }

    function eprobotEnergyDetection(body_eprobot, offset){
        body_eprobot.my_parent.detected_energy += offset;
        //console.log(body_eprobot.my_parent.detected_energy);
    }

    function eprobotEprobotDetection(body_eprobot, offset){
        body_eprobot.my_parent.detected_eprobots += offset;
        //console.log(body_eprobot.my_parent.detected_eprobots);
    }

    Matter.Events.on(engine, 'collisionStart', function(event) {
        let pairs = event.pairs;

        // change object colours to show those starting a collision
        //console.log(pairs.length);
        for (var i = 0; i < pairs.length; i++) {
            let pair = pairs[i];
            let a = pair.bodyA;
            let b = pair.bodyB;

            //console.log(a);
            //console.log(pair.bodyA.label);

            if (a.my_label == "Eprobot Body" && b.my_label == "Energy"){
                //console.log("Bang");
                a.my_parent.energy_collision(b);
                fitness++;
            }else if(a.my_label == "Energy" && b.my_label == "Eprobot Body"){
                //console.log("Bang2");
                b.my_parent.energy_collision(a);
                fitness++;
            }

            else if (a.my_label == "Eproboteater Body" && b.my_label == "Eprobot Body"){
                //console.log("Bang");
                eproboteaterEprobotCollision(a, b);
            }else if(a.my_label == "Eprobot Body" && b.my_label == "Eproboteater Body"){
                //console.log("Bang2");
                eproboteaterEprobotCollision(b, a);
            }

            /*else if(a.my_label == "Eprobot Sensor" && b.my_label == "Energy"){
                console.log("collisionStart sensor->energy");
                eprobotEnergyDetection(a, 1);
            }else if(a.my_label == "Energy" && b.my_label == "Eprobot Sensor"){
                console.log("collisionStart energy->sensor");
                eprobotEnergyDetection(b, 1);
            }else if(a.my_label == "Eprobot Sensor" && b.my_label == "Eprobot Body"){
                //console.log("collisionStart sensor->energy");
                eprobotEprobotDetection(a, 1);
            }else if(a.my_label == "Eprobot Body" && b.my_label == "Eprobot Sensor"){
                //console.log("collisionStart energy->sensor");
                eprobotEprobotDetection(b, 1);
            }*/
            //pair.bodyA.render.fillStyle = '#333';
            //pair.bodyB.render.fillStyle = '#333';
        }
    });

    /*Matter.Events.on(engine, 'collisionEnd', function(event) {
        return;
        let pairs = event.pairs;

        // change object colours to show those starting a collision
        //console.log(pairs.length);
        for (var i = 0; i < pairs.length; i++) {
            let pair = pairs[i];
            let a = pair.bodyA;
            let b = pair.bodyB;

            //console.log(a);
            //console.log(pair.bodyA.label);

            if(a.my_label == "Eprobot Sensor" && b.my_label == "Energy"){
                //console.log("collisionEnd sensor->energy");
                eprobotEnergyDetection(a, -1);
            }else if(a.my_label == "Energy" && b.my_label == "Eprobot Sensor"){
                //console.log("collisionEnd energy->sensor");
                eprobotEnergyDetection(b, -1);
            }else if(a.my_label == "Eprobot Sensor" && b.my_label == "Eprobot Body"){
                //console.log("collisionEnd sensor->energy");
                eprobotEprobotDetection(a, -1);
            }else if(a.my_label == "Eprobot Body" && b.my_label == "Eprobot Sensor"){
                //console.log("collisionEnd energy->sensor");
                eprobotEprobotDetection(b, -1);
            }
        }
    });*/

    function toggleFullscreen() {
        var elem = myCanvas;
        if (!document.fullscreenElement && !document.mozFullScreenElement &&
            !document.webkitFullscreenElement && !document.msFullscreenElement) {
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
            } else if (elem.mozRequestFullScreen) {
                elem.mozRequestFullScreen();
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    }

    function toggle_run(){
        log("click");
        if (runner.enabled){
            log("stop");
            runner.enabled=false;
        }else{
            log("start");
            runner.enabled=true;
        }

    }

    document.getElementById("toggle_run").addEventListener("click", toggle_run);
    //document.getElementById("toggle_fullscreen").addEventListener("click", toggleFullscreen);
};