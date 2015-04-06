var UUID = require('../../isomorphic/tools/uuid.js');

module.exports = function(){

    var events = [];
    var bounds = [];

    //settings
    this.playing = false;
    this.debounce = 1000; //ms
    this.interval = 1000 * 60 * 60; //ms | 1 hour standard
    this.current = undefined;

    var update = function(){

        var now = +Date.now();

        for( var i = 0 ; i < events.length ; i++ ){

            var evt = events[i];

            //point
            if(evt.type === 'point'){

                var boundLeft = now;
                var boundRight = now + this.interval;
                var time = evt.time.getTime();

                if( time > boundLeft && time < boundRight ){
                    evt.update(evt);
                }

            }

            //event
            if(evt.type === 'event' || evt.type === 'splitPoint'){

                var from, to;

                if(evt.type === 'event'){
                    from = evt.from.getTime();
                    to = evt.to.getTime();
                } else {

                    //calculate splitpoint
                    if(evt.before){
                        from = bounds[0];
                        to = evt.time.getTime();
                    } else {
                        from = evt.time.getTime();
                        to = bounds[1];
                    }

                }

                if( now > from && now < to ){

                    //active handler
                    if(!evt.active){
                        evt.enter(evt);
                    }

                    //calculate progress
                    var progress = (now - from) / (to - from);

                    //update function
                    evt.update(progress, now, evt)

                } else {

                    //inactive handler
                    if(evt.active){
                        evt.leave(evt);
                    }

                }

            }

        }

    };

    this.addPoint = function(fn, time){

        var id = UUID();

        events.push({
            'type': 'point',
            'id': id,
            'time': time,
            'update': fn
        });

        return id;
    };

    this.addSplitPoint = function(time, before, update, enter, leave){

        var id = UUID();

        events.push({
            'type': 'splitPoint',
            'id': id,
            'before': before
            'time': time,
            'update': update,
            'enter': enter,
            'leave' leave,
            'active': false
        });

        return id;

    };

    this.addEvent = function(from, to, update, enter, leave){

        var id = UUID();

        events.push({
            'type': 'event',
            'id': id,
            'from': from,
            'to': to,
            'update': update,
            'enter': enter,
            'leave' leave,
            'active': false
        });

        return id;
    };

    this.remove = function(id){

        for( var i = 0 ; i < events.length ; i++ ){

            if(events[i].id === id){

                //remove when found
                events.splice(i, 1);

            }

        }

    };

    this.setBounds = function(from, to){
        bounds = [from, to];

        //chainable
        return this;
    };

    var checkBound = function(time){

        if(time.getTime() < bounds[0]){
            bounds[0] = time;
        }

        if(time.getTime() > bounds[1]){
            bounds[1] = time;
        }

    };

    //calculate bounds by processing all events
    this.calculateBounds = function(){

        for( var i = 0 ; i < events.length ; i++ ){

            if(events[i].type === 'event'){
                checkBound()
            }

        }

        //chainable
        return this;

    };

    this.setTime = function(time){
        this.current = time;

        //chainable
        return this;
    };

    var debounce = this.debounce;
    this.render = function(delta, direction){

        debounce += delta;

        if(debounce > this.debounce && this.playing){

            update();
        }

    };

    this.forward = function(){
        //todo
    };

    this.backward = function(){
        //todo
    };

    this.start = function(){

        //bounds?
        if(bounds.length === 0){
            this.calculateBounds();
        }

        this.playing = true;

        //chainable
        return this;

    };

    this.pause = function(){
        this.playing = false;

        //chainable
        return this;
    };

    this.reset = function(){
        this.current = bounds[0];

        //chainable
        return this;
    };

}
