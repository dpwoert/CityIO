module.exports = function(inputs) {
    return {
        type: 'FeatureCollection',
        features: inputs.reduce(function(memo, input) {
            return memo.concat(input.features);
        }, [])
    };
};
