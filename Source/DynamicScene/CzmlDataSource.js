/*global define*/
define(['../Core/DeveloperError',
        '../Core/loadJson',
        '../DynamicScene/DynamicObjectCollection',
        '../DynamicScene/processCzml'
        ], function(
                DeveloperError,
                loadJson,
                processCzml,
                DynamicObjectCollection) {
    "use strict";

    var CzmlDataSource = function(czml) {
        this._dynamicObjectCollection = new DynamicObjectCollection();
        this._clock = undefined;

        if (typeof czml !== 'undefined') {
            processCzml(czml, this._dynamicObjectCollection);
        }
    };

    CzmlDataSource.fromString = function(string) {
        return new CzmlDataSource(JSON.parse(string));
    };

    CzmlDataSource.fromUrl = function(url) {
        var that = new CzmlDataSource();
        loadJson(url).then(function(czml) {
            processCzml(czml, that._dynamicObjectCollection, url);
        }, function(error) {
            //TODO
        });
        return that;
    };

    CzmlDataSource.prototype.getClock = function() {
        return this._clock;
    };

    CzmlDataSource.prototype.getDynamicObjectCollection = function() {
        return this._dynamicObjectCollection;
    };

    return CzmlDataSource;
});