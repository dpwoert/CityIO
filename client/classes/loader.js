module.exports = function(world){

    //defer object needed in promises
    var self = this;

    var list = [];
    var q = require('q');
    var objects = 0;
    var rendered = 0;

    //amount of objects to render at once
    this.throttle = 15;

    this.add = function(_list){

        if(_list instanceof Array){
            list = list.concat(_list);
        } else {
            list.push(_list);
        }

        //chainable
        return this;

    };

    this.start = function(){

        //collection of promised
        var loadList = [];

        for( var i = 0 ; i < list.length ; i++ ){
            loadList.push( list[i].fetch() );
        }

        //show we're now downloading
        world.events.dispatchEvent({ type: 'preloader', state: 'downloading' });
        this.state = 'downloading';

        //create grouped promise
        var loadPromise = q.all(loadList);
        var renderPromise = q.defer();

        //on finished start rendering
        loadPromise.then(function(){
            self.render(renderPromise);
        });

        return renderPromise.promise;

    };

    var finish = function(){

        //clear cached data
        for( var i = 0 ; i < list.length ; i++ ){
            list[i].clearCache();
        };

        //reset list
        list = [];
    };

    this.render = function(defer){

        var self = this;

        //we're now rendering
        world.events.dispatchEvent({ type: 'preloader', state: 'rendering' });
        this.state = 'rendering';

        //determine how many objects to render
        for( var i = 0 ; i < list.length ; i++ ){

            if(list[i].needsRendering){
                objects += list[i].needsRendering;
            }

        }

        //render all objects
        for( var i = 0 ; i < list.length ; i++ ){

            for( var j = 0 ; j < list[i].needsRendering ; j+=this.throttle ){

                //throttle to prevent CPU overload
                setTimeout(function(){

                    //determine end
                    var end = this.start + self.throttle;
                    if(end > list[this.current].needsRendering){
                        end = list[this.current].needsRendering;
                    }

                    //do rendering
                    try{
                        list[this.current].render(this.start, end);
                    } catch(e){
                        console.log('err', e);
                    }

                    //determine progress
                    rendered += end - this.start;
                    var progress = rendered / objects;

                    //update hook
                    world.events.dispatchEvent({ type: 'preloader-update', progress: progress });

                    //finished?
                    if(rendered === objects){
                        finish();
                        world.events.dispatchEvent({ type: 'preloader', state: 'loaded' });
                        self.state = 'loaded';
                        defer.resolve();
                    }

                }.bind({ 'start': j, 'current': i }), 0);

            }

        }

        //create as promise
        return defer.promise;

    };

    //set initial state to idle
    world.events.dispatchEvent({ type: 'preloader', state: 'idle' });
    this.state = 'idle';

};
