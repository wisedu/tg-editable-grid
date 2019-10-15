'use strict';

import Textfield from 'bh-fin-hypergrid/src/cellEditors/Textfield';
var Localization = require('bh-fin-hypergrid/src/lib/Localization');

/**
 * As of spring 2016:
 * Functions well in Chrome, Safari, Firefox, and Internet Explorer.
 * @constructor
 * @extends CellEditor
 */
var Text = Textfield.extend('Text', {

    template: '<input type="text" lang="{{locale}}" class="hypergrid-textfield" style="{{style}}">',

    initialize: function() {
        this.input.style.textAlign = this.event.properties.halign;
        this.input.style.font = this.event.properties.font;
    },

    localizer: Localization.prototype.string,
    setBounds: function(cellBounds) {
        var style = this.el.style;

        style.left = px(cellBounds.x);
        style.top = px(cellBounds.y);
        style.width = px(cellBounds.width - 20);
        style.height = px(cellBounds.height - 20);
    },
    selectAll: function() {
        this.input.setSelectionRange(0, this.input.value.length);
    },
    showEditor: function () {
        if(this.input.value === 'null' || this.input.value === 'undefined') this.input.value = '';
    }
});

function px(n) {
    return n + 'px';
}
export default Text;