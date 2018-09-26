'use strict';
import flatpickr from "flatpickr";
import Textfield from 'fin-hypergrid/src/cellEditors/Textfield';
var prototype = Textfield.parent('CellEditor').prototype;

let calendar;
var Date = Textfield.extend('Datetime', {
    initialize: function(grid) {
        var localizerName = 'date';
        this.template = 
`<div class="hypergrid-combobox" title="">
    <input type="text" lang="{{locale}}" style="{{style}}">
</div>`;
        this.selectAll = function() {
            var lastCharPlusOne = this.getEditorValue().length;
            this.input.setSelectionRange(0, lastCharPlusOne);
        };
    },
    showEditor: function() {
        prototype.showEditor.call(this);
        calendar = flatpickr(this.el, {});
    },
    hideEditor: function() {
        // this is where you would persist this.menuModes
        calendar.destroy();
        prototype.hideEditor.call(this);
    },
});


export default Date;