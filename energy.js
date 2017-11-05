class Energy {

    constructor(x_pos, y_pos) {
        this.body = Matter.Bodies.circle(x_pos, y_pos, 20, {
            isStatic: true,
            render: {
                fillStyle: '#0bcb11',
                //strokeStyle: 'black',
                //lineWidth: 1
            }
        });

        this.body.label = "Energy";
    }
}