window.onload = function() {

    Matter.use(
      'matter-wrap' // PLUGIN_NAME
    );

    var myCanvas = document.getElementById('world');

    // create an engine
    var engine = Matter.Engine.create();

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
            showAngleIndicator: true
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

    function initEprobots(){
        console.log("init eprobots");

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

            var hue = tools_random(360);
            var eprobot = new Eprobot(tools_random(WORLD_WIDTH), tools_random(WORLD_HEIGHT), program, init_data, hue, simsettings.BODY_RADIUS);
            eprobots.push(eprobot);
            Matter.World.add(engine.world, eprobot.body);
        }
    }

    function initEproboteaters(){
        console.log("init eproboteaters");

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

    // keep the mouse in sync with rendering
    render.mouse = mouse;

    var eprobots = [];
    var eproboteaters = [];

    Matter.Events.on(engine, 'beforeUpdate', function(event) {
        // init wenn keine eprobots vorhanden
        if (eprobots.length==0){
            initEprobots();
        }

        if (eprobots.length>=200 && eproboteaters.length==0){
            //initEproboteaters();
        }

        var eprobots_new = [];
        for (var i=0;i<eprobots.length;i++){
            var eprobot = eprobots[i];

            if (eprobot.isExistent()){
                eprobot.update();
                eprobots_new.push(eprobot);
            }else{
                Matter.World.remove(engine.world, eprobot.body);
            }

        }
        eprobots = eprobots_new;

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
        eproboteaters = eproboteaters_new;
     });

    function eprobotProcreation(body_eprobot){
        // b darf sich fortpflanzen!
        //console.log(b);
        let new_x = body_eprobot.position.x+tools_random2(-10,10);
        let new_y = body_eprobot.position.y+tools_random2(-10,10);
        //console.log(new_x,new_y);
        if (eprobots.length <= simsettings.EPROBOTS_MAX){
            var new_program = tools_mutate(simsettings.MUTATE_POSSIBILITY, simsettings.MUTATE_STRENGTH, body_eprobot.my_parent.program);
            var new_data = tools_mutate(simsettings.MUTATE_POSSIBILITY, simsettings.MUTATE_STRENGTH, body_eprobot.my_parent.init_data);

            //var new_hue = body_eprobot.my_parent.hue + tools_random2(-9, 10);
            //if (new_hue > 360){
            //    new_hue = new_hue - 360;
            //}else if (new_hue < 0){
            //    new_hue = 360 + new_hue;
            //}
            var new_hue = body_eprobot.my_parent.hue;
            var new_size = body_eprobot.my_parent.size + tools_random2(-2, 3);
            if (new_size<1){
                new_size=1;
            }else if (new_size>6){
                new_size=6;
            }

            var new_eprobot = new Eprobot(new_x, new_y, new_program, new_data, new_hue, new_size);
            eprobots.push(new_eprobot);
            Matter.World.add(engine.world, new_eprobot.body);
        }else{
            body_eprobot.my_parent.lifetime += 50;
            if (body_eprobot.my_parent.lifetime > simsettings.LIFETIME_BASE * 3){
                body_eprobot.my_parent.lifetime = simsettings.LIFETIME_BASE * 3;
            }
        }
    }

    function eproboteaterProcreation(body_eproboteater){
        // b darf sich fortpflanzen!
        //console.log(b);
        let new_x = body_eproboteater.position.x+tools_random2(-10,10);
        let new_y = body_eproboteater.position.y+tools_random2(-10,10);
        //console.log(new_x,new_y);
        if (eproboteaters.length <= simsettings.EPROBOTS_MAX){
            var new_program = tools_mutate(simsettings.MUTATE_POSSIBILITY, simsettings.MUTATE_STRENGTH, body_eproboteater.my_parent.program);
            var new_data = tools_mutate(simsettings.MUTATE_POSSIBILITY, simsettings.MUTATE_STRENGTH, body_eproboteater.my_parent.init_data);

            //var new_hue = body_eprobot.my_parent.hue + tools_random2(-9, 10);
            //if (new_hue > 360){
            //    new_hue = new_hue - 360;
            //}else if (new_hue < 0){
            //    new_hue = 360 + new_hue;
            //}
            var new_hue = body_eproboteater.my_parent.hue;
            var new_size = body_eproboteater.my_parent.size + tools_random2(-2, 3);
            if (new_size<1){
                new_size=1;
            }else if (new_size>6){
                new_size=6;
            }

            var new_eproboteater = new EprobotEater(new_x, new_y, new_program, new_data, new_hue, new_size);
            eproboteaters.push(new_eproboteater);
            Matter.World.add(engine.world, new_eproboteater.body);
        }else{
            body_eproboteater.my_parent.lifetime += 50;
            if (body_eproboteater.my_parent.lifetime > simsettings.LIFETIME_BASE * 3){
                body_eproboteater.my_parent.lifetime = simsettings.LIFETIME_BASE * 3;
            }
        }
    }

    function eprobotEnergyCollision(body_eprobot, body_energy){
        // a entfernen
        if (body_energy.my_active === false){
            return;
        }

        body_energy.my_energycount--;
        if (body_energy.my_energycount<=0){
            body_energy.my_active = false;
            Matter.World.remove(engine.world, body_energy);

            // neues Energyobjekt
            var energy = new Energy(tools_random(WORLD_WIDTH), tools_random(WORLD_HEIGHT));
            Matter.World.add(engine.world, energy.body);
        }

        eprobotProcreation(body_eprobot);
    }

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
                eprobotEnergyCollision(a, b);
            }else if(a.my_label == "Energy" && b.my_label == "Eprobot Body"){
                //console.log("Bang2");
                eprobotEnergyCollision(b, a);
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
        console.log("click");
        if (runner.enabled){
            console.log("stop");
            runner.enabled=false;
        }else{
            console.log("start");
            runner.enabled=true;
        }

    }

    document.getElementById("toggle_run").addEventListener("click", toggle_run);
    //document.getElementById("toggle_fullscreen").addEventListener("click", toggleFullscreen);
};