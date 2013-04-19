/*global define*/
define(['./TableOfContentsViewModel',
        '../../Core/DeveloperError',
        '../../Core/destroyObject',
        '../../ThirdParty/knockout'
        ], function(
                TableOfContentsViewModel,
                DeveloperError,
                destroyObject,
                knockout) {
    "use strict";

    /**
     * A table of contents for managing data sources.
     *
     * @alias TableOfContentsWidget
     * @constructor
     *
     * @param {Element|String} container The DOM element or ID that will contain the widget.
     * @param {DataSourceDisplay} [dataSourceDisplay=new DataSourceDisplay()] The DataSourceDisplay instance to manage.
     *
     * @exception {DeveloperError} container is required.
     * @exception {DeveloperError} Element with id "container" does not exist in the document.
     *
     * @see TableOfContents
     */
    var TableOfContentsWidget = function(container, dataSourceDisplay) {
        if (typeof container === 'undefined') {
            throw new DeveloperError('container is required.');
        }

        if (typeof container === 'string') {
            var tmp = document.getElementById(container);
            if (tmp === null) {
                throw new DeveloperError('Element with id "' + container + '" does not exist in the document.');
            }
            container = tmp;
        }

        /**
         * Gets the parent container.
         * @memberof TableOfContentsWidget
         * @type {Element}
         */
        this.container = container;

        /**
         * Gets the viewModel being used by the widget.
         * @memberof TableOfContentsWidget
         * @type {TableOfContentsViewModel}
         */
        this.viewModel = new TableOfContentsViewModel(dataSourceDisplay);

        /**
         * Gets the container element for the widget.
         * @memberof TableOfContentsWidget
         * @type {Element}
         */
        this.container = container;

        this.element = document.createElement('div');
        this.element.className = '.cesium-tableOfContents';
//        this.element.setAttribute('data-bind', 'attr: { title: tooltip }, css: { "cesium-fullscreen-exit": toggled }, click: command, enable: isTableOfContentsEnabled');
        container.appendChild(this.element);

//        knockout.applyBindings(this.viewModel, this.element);
    };

    /**
     * Destroys the  widget.  Should be called if permanently
     * removing the widget from layout.
     * @memberof TableOfContentsWidget
     */
    TableOfContentsWidget.prototype.destroy = function() {
        var container = this.container;
        knockout.cleanNode(container);
        container.removeChild(this.element);
        return destroyObject(this);
    };

    return TableOfContentsWidget;
});
