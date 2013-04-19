/*global define*/
define(['../createCommand',
        '../../Core/defaultValue',
        '../../ThirdParty/knockout'
        ], function(
                createCommand,
                defaultValue,
                knockout) {
    "use strict";

    /**
     * The ViewModel for {@link TableOfContents}.
     * @alias TableOfContentsViewModel
     * @constructor
     *
     * @see TableOfContents
     */
    var TableOfContentsViewModel = function(dataSourceDisplay) {
        this.dataSourceDisplay = dataSourceDisplay;
    };

    return TableOfContentsViewModel;
});
