// extend one object with another object's property's (default is deep extend)
// this works with circular references and is faster than other deep extend methods
// http://jsperf.com/comparing-custom-deep-extend-to-jquery-deep-extend/2
// source: https://gist.github.com/fshost/4146993
module.exports = function extend(target, source, shallow) {
    var array = '[object Array]',
        object = '[object Object]',
        targetMeta, sourceMeta,
        setMeta = function (value) {
            var meta,
            jclass = {}.toString.call(value);
            if (value === undefined) return 0;
            if (typeof value !== 'object') return false;
            if (jclass === array) {
                return 1;
            }
            if (jclass === object) return 2;
        };
    for (var key in source) {
        if (source.hasOwnProperty(key)) {
            targetMeta = setMeta(target[key]);
            sourceMeta = setMeta(source[key]);
            if (source[key] !== target[key]) {
                if (!shallow && sourceMeta && targetMeta && targetMeta === sourceMeta) {
                    target[key] = extend(target[key], source[key], true);
                } else if (sourceMeta !== 0) {
                    target[key] = source[key];
                }
            }
        }
        else break; // ownProperties are always first (see jQuery's isPlainObject function)
    }
    return target;
}
