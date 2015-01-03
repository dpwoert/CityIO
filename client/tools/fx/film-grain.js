var FilmPass = require('../../lib/film-pass.js')

module.exports = function(){

    //check
    if(!this.composer){
        console.warn('composer not found');
        return false;
    }

    //film grain
    var effectFilm = new FilmPass(0.1, 0, 100, false);
    this.composer.addPass(effectFilm);

};
