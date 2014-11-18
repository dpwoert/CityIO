Package.describe({
    summary: "cityIO - VR support for Oculus Rift"
});

Package.on_use(function (api) {

    // use dependencies
    api.use(['three','cityio'], 'client');

    // load front-end
    api.add_files([

        'lib/StereoEffect.js',
        'lib/VRControls.js',
        'lib/VREffect.js',

        'VR.js'

    ], 'client');


});
