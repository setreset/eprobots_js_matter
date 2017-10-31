window.onload = function() {
    Matter.use(
      'matter-wrap' // PLUGIN_NAME
    );

    var myCanvas = document.getElementById('world');
    var WORLD_WIDTH = 1200;
    var WORLD_HEIGHT = 600;

    // module aliases
    var Engine = Matter.Engine,
        Render = Matter.Render,
        World = Matter.World,
        Body = Matter.Body,
        Events = Matter.Events,
        Bodies = Matter.Bodies,
        MouseConstraint = Matter.MouseConstraint,
        Mouse = Matter.Mouse;

    // create an engine
    var engine = Engine.create();
    engine.world.gravity.y = 0;

    // create a renderer
    var render = Render.create({
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
    Engine.run(engine);

    //(function run() {
    //    window.requestAnimationFrame(run);
    //    Engine.update(engine, 1000 / 60);
    //})();

    // run the renderer
    Render.run(render);

    // ====================================================== //

    // create two boxes and a ground
    var balloptions = {
        render: {
            fillStyle: '#F35e66',
            //strokeStyle: 'black',
            //lineWidth: 1
        },
        plugin: {
            wrap: {
                min: {
                    x: 0,
                    y: 0
                },
                max: {
                    x: WORLD_WIDTH,
                    y: WORLD_HEIGHT
                }
            }
        }
    }
    var boxA = Bodies.rectangle(400, 200, 80, 80, balloptions);
    var boxB = Bodies.rectangle(450, 50, 80, 80, balloptions);
    var ballA = Bodies.circle(450, 50, 40, balloptions);
    var ground = Bodies.rectangle(400, 610, 810, 60, {isStatic: true});

    // add all of the bodies to the world
    World.add(engine.world, [ballA]);

    var counter = 0;
    Events.on(engine, 'beforeUpdate', function(event) {
        counter += 1;

        // every 1.5 sec
        //if (counter >= 60 * 1.5) {
            //Body.setVelocity(ballA, { x: 0, y: -10 });
            //Body.setAngle(bodyC, -Math.PI * 0.26);
            //Body.setAngularVelocity(bodyD, 0.2);

            // reset counter
            counter = 0;
        //}
    });

    // add mouse control
    var mouse = Mouse.create(render.canvas),
        mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false
                }
            }
        });

    World.add(engine.world, mouseConstraint);

    // keep the mouse in sync with rendering
    render.mouse = mouse;

}