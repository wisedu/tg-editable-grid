'use strict';
import flatpickr from "flatpickr";
import Textfield from 'fin-hypergrid/src/cellEditors/Textfield';
var prototype = Textfield.parent('CellEditor').prototype;

let calendar;
var Date = Textfield.extend('Datetime', {
    template:  `<div class="hypergrid-combobox" title="">
    <input type="text" lang="{{locale}}" style="{{style}}">
    <span title="Click for datepicker"></span>
</div>`,
    initialize: function(grid) {
        var el = this.el;
        this.input = el.querySelector('input');
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
    setBounds: function(cellBounds) {
        var style = this.el.style;

        style.left = px(cellBounds.x);
        style.top = px(cellBounds.y);
        style.width = px(cellBounds.width - 20);
        style.height = px(cellBounds.height - 20);
    },
});
function px(n) { return n + 'px'; }

export default Date;