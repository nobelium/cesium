/*global define*/
define([
        '../Core/DeveloperError',
        '../Core/defaultValue',
        '../Core/destroyObject',
        '../Core/Event',
        '../Core/Math'
    ], function(
        DeveloperError,
        defaultValue,
        destroyObject,
        Event,
        CesiumMath) {
    "use strict";

    /**
     * An ordered collection of data sources.
     * @alias DataSourceCollection
     * @constructor
     */
    var DataSourceCollection = function DataSourceCollection() {
        this._dataSources = [];

        /**
         * An event that is raised when a data source is added to the collection.  Event handlers are passed the data source that
         * was added and the index at which it was added.
         * @type {Event}
         */
        this.dataSourceAdded = new Event();

        /**
         * An event that is raised when a data source is removed from the collection.  Event handlers are passed the data source that
         * was removed and the index from which it was removed.
         * @type {Event}
         */
        this.dataSourceRemoved = new Event();

        /**
         * An event that is raised when a data source changes position in the collection.  Event handlers are passed the data source that
         * was moved, its new index after the move, and its old index prior to the move.
         * @type {Event}
         */
        this.dataSourceMoved = new Event();

        /**
         * An event that is raised when a data source is shown or hidden by setting the
         * {@link DataSource#show} property.  Event handlers are passed a reference to this data source,
         * the index of the data source in the collection, and a flag that is true if the data source is now
         * shown or false if it is now hidden.
         *
         * @type {Event}
         */
        this.dataSourceShownOrHidden = new Event();
    };

    /**
     * Adds a data source to the collection.
     *
     * @memberof DataSourceCollection
     *
     * @param {DataSource} dataSource The data source to add.
     * @param {Number} [index] the index to add the data source at.  If omitted, the data source will
     *                         added on top of all existing data sources.
     *
     * @exception {DeveloperError} dataSource is required.
     * @exception {DeveloperError} index, if supplied, must be greater than or equal to zero and less than or equal to the number of the data sources.
     */
    DataSourceCollection.prototype.add = function(dataSource, index) {
        if (typeof dataSource === 'undefined') {
            throw new DeveloperError('dataSource is required.');
        }

        if (typeof index === 'undefined') {
            index = this._dataSources.length;
            this._dataSources.push(dataSource);
        } else {
            if (index < 0) {
                throw new DeveloperError('index must be greater than or equal to zero.');
            } else if (index > this._dataSources.length) {
                throw new DeveloperError('index must be less than or equal to the number of data sources.');
            }
            this._dataSources.splice(index, 0, dataSource);
        }

        this._update();

        this.dataSourceAdded.raiseEvent(dataSource, index);
    };

    /**
     * Removes a data source from this collection, if present.
     *
     * @memberof DataSourceCollection
     *
     * @param {DataSource} dataSource The data source to remove.
     * @param {Boolean} [destroy=true] whether to destroy the data sources in addition to removing them.
     *
     * @returns {Boolean} true if the data source was in the collection and was removed,
     *                    false if the data source was not in the collection.
     */
    DataSourceCollection.prototype.remove = function(dataSource, destroy) {
        destroy = defaultValue(destroy, true);

        var index = this._dataSources.indexOf(dataSource);
        if (index !== -1) {
            this._dataSources.splice(index, 1);

            this._update();

            this.dataSourceRemoved.raiseEvent(dataSource, index);

            if (destroy) {
                dataSource.destroy();
            }

            return true;
        }

        return false;
    };

    /**
     * Removes all data sources from this collection.
     *
     * @memberof DataSourceCollection
     *
     * @param {Boolean} [destroy=true] whether to destroy the data sources in addition to removing them.
     */
    DataSourceCollection.prototype.removeAll = function(destroy) {
        destroy = defaultValue(destroy, true);

        var dataSources = this._dataSources;
        for ( var i = 0, len = dataSources.length; i < len; i++) {
            var dataSource = dataSources[i];
            this.dataSourceRemoved.raiseEvent(dataSource, i);

            if (destroy) {
                dataSource.destroy();
            }
        }

        this._dataSources = [];
    };

    /**
     * Checks to see if the collection contains a given data source.
     *
     * @memberof DataSourceCollection
     *
     * @param {DataSource} dataSource The data source to check for.
     *
     * @returns {Boolean} true if the collection contains the data source, false otherwise.
     */
    DataSourceCollection.prototype.contains = function(dataSource) {
        return this.indexOf(dataSource) !== -1;
    };

    /**
     * Determines the index of a given data source in the collection.
     *
     * @memberof DataSourceCollection
     *
     * @param {DataSource} dataSource The data source to find the index of.
     *
     * @returns {Number} The index of the data source in the collection, or -1 if the data source does not exist in the collection.
     */
    DataSourceCollection.prototype.indexOf = function(dataSource) {
        return this._dataSources.indexOf(dataSource);
    };

    /**
     * Gets a data source by index from the collection.
     *
     * @memberof DataSourceCollection
     *
     * @param {Number} index the index to retrieve.
     *
     * @exception {DeveloperError} index is required.
     * @exception {DeveloperError} This object was destroyed, i.e., destroy() was called.
     */
    DataSourceCollection.prototype.get = function(index) {
        if (typeof index === 'undefined') {
            throw new DeveloperError('index is required.', 'index');
        }

        return this._dataSources[index];
    };

    /**
     * Gets the number of data sources in this collection.
     *
     * @memberof DataSourceCollection
     *
     * @exception {DeveloperError} This object was destroyed, i.e., destroy() was called.
     */
    DataSourceCollection.prototype.getLength = function() {
        return this._dataSources.length;
    };

    function getDataSourceIndex(dataSources, dataSource) {
        if (typeof dataSource === 'undefined') {
            throw new DeveloperError('dataSource is required.');
        }

        var index = dataSources.indexOf(dataSource);
        if (index === -1) {
            throw new DeveloperError('dataSource is not in this collection.');
        }

        return index;
    }

    function swapDataSources(collection, i, j) {
        var arr = collection._dataSources;
        i = CesiumMath.clamp(i, 0, arr.length - 1);
        j = CesiumMath.clamp(j, 0, arr.length - 1);

        if (i === j) {
            return;
        }

        var temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;

        collection._update();

        collection.dataSourceMoved.raiseEvent(temp, j, i);
    }

    /**
     * Raises a data source up one position in the collection.
     *
     * @memberof DataSourceCollection
     *
     * @param {DataSource} dataSource The data source to move.
     *
     * @exception {DeveloperError} dataSource is not in this collection.
     * @exception {DeveloperError} This object was destroyed, i.e., destroy() was called.
     */
    DataSourceCollection.prototype.raise = function(dataSource) {
        var index = getDataSourceIndex(this._dataSources, dataSource);
        swapDataSources(this, index, index + 1);
    };

    /**
     * Lowers a data source down one position in the collection.
     *
     * @memberof DataSourceCollection
     *
     * @param {DataSource} dataSource The data source to move.
     *
     * @exception {DeveloperError} dataSource is not in this collection.
     * @exception {DeveloperError} This object was destroyed, i.e., destroy() was called.
     */
    DataSourceCollection.prototype.lower = function(dataSource) {
        var index = getDataSourceIndex(this._dataSources, dataSource);
        swapDataSources(this, index, index - 1);
    };

    /**
     * Raises a data source to the top of the collection.
     *
     * @memberof DataSourceCollection
     *
     * @param {DataSource} dataSource The data source to move.
     *
     * @exception {DeveloperError} dataSource is not in this collection.
     * @exception {DeveloperError} This object was destroyed, i.e., destroy() was called.
     */
    DataSourceCollection.prototype.raiseToTop = function(dataSource) {
        var index = getDataSourceIndex(this._dataSources, dataSource);
        if (index === this._dataSources.length - 1) {
            return;
        }
        this._dataSources.splice(index, 1);
        this._dataSources.push(dataSource);

        this._update();

        this.dataSourceMoved.raiseEvent(dataSource, this._dataSources.length - 1, index);
    };

    /**
     * Lowers a data source to the bottom of the collection.
     *
     * @memberof DataSourceCollection
     *
     * @param {DataSource} dataSource The data source to move.
     *
     * @exception {DeveloperError} dataSource is not in this collection.
     * @exception {DeveloperError} This object was destroyed, i.e., destroy() was called.
     */
    DataSourceCollection.prototype.lowerToBottom = function(dataSource) {
        var index = getDataSourceIndex(this._dataSources, dataSource);
        if (index === 0) {
            return;
        }
        this._dataSources.splice(index, 1);
        this._dataSources.splice(0, 0, dataSource);

        this._update();

        this.dataSourceMoved.raiseEvent(dataSource, 0, index);
    };

    /**
     * Returns true if this object was destroyed; otherwise, false.
     * <br /><br />
     * If this object was destroyed, it should not be used; calling any function other than
     * <code>isDestroyed</code> will result in a {@link DeveloperError} exception.
     *
     * @memberof DataSourceCollection
     *
     * @return {Boolean} true if this object was destroyed; otherwise, false.
     *
     * @see DataSourceCollection#destroy
     */
    DataSourceCollection.prototype.isDestroyed = function() {
        return false;
    };

    /**
     * Destroys the WebGL resources held by all data sources in this collection.  Explicitly destroying this
     * object allows for deterministic release of WebGL resources, instead of relying on the garbage
     * collector.
     * <br /><br />
     * Once this object is destroyed, it should not be used; calling any function other than
     * <code>isDestroyed</code> will result in a {@link DeveloperError} exception.  Therefore,
     * assign the return value (<code>undefined</code>) to the object as done in the example.
     *
     * @memberof DataSourceCollection
     *
     * @return {undefined}
     *
     * @exception {DeveloperError} This object was destroyed, i.e., destroy() was called.
     *
     * @see DataSourceCollection#isDestroyed
     *
     * @example
     * dataSourceCollection = dataSourceCollection && dataSourceCollection.destroy();
     */
    DataSourceCollection.prototype.destroy = function() {
        this.removeAll(true);
        return destroyObject(this);
    };

    DataSourceCollection.prototype._update = function() {
        var dataSources = this._dataSources;
        var dataSourcesShownOrHidden;
        var dataSource;
        for ( var i = 0, len = dataSources.length; i < len; ++i) {
            dataSource = dataSources[i];

            dataSource._dataSourceIndex = i;

            if (dataSource.show !== dataSource._show) {
                if (typeof dataSource._show !== 'undefined') {
                    if (typeof dataSourcesShownOrHidden === 'undefined') {
                        dataSourcesShownOrHidden = [];
                    }
                    dataSourcesShownOrHidden.push(dataSource);
                }
                dataSource._show = dataSource.show;
            }
        }

        if (typeof dataSourcesShownOrHidden !== 'undefined') {
            for (i = 0, len = dataSourcesShownOrHidden.length; i < len; ++i) {
                dataSource = dataSourcesShownOrHidden[i];
                this.dataSourceShownOrHidden.raiseEvent(dataSource, dataSource._dataSourceIndex, dataSource.show);
            }
        }
    };

    return DataSourceCollection;
});