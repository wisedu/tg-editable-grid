'use strict';
import Queueless from './queueless.js';
import InspireTree from 'inspire-tree';
import InspireTreeDOM from 'inspire-tree-dom';
import Textfield from 'fin-hypergrid/src/cellEditors/Textfield';
var prototype = Textfield.parent('CellEditor').prototype;

var stateToActionMap = {
    hidden: slideDown,
    visible: slideUp
};

var Date = Textfield.extend('Tree', {

    template:['<div class="hypergrid-combobox" title="">',
    '    <input type="text" lang="{{locale}}" style="{{style}}">',
    '    <span title="Click for options"></span>',
    '    <div>',
    '       <div id="dataContainer"></div>',
    '    </div>',
    '</div>'].join('\n'),

    initialize: function(grid) {
        var el = this.el;
        this.node = null;

        this.input = el.querySelector('input');
        this.dropper = el.querySelector('span');
        this.options = el.querySelector('div');
        this.dropdown = this.options.querySelector('#dataContainer');

        this.optionsTransition = new Queueless(this.options, this);

        this.selectAll = function() {
            var lastCharPlusOne = this.getEditorValue().length;
            this.input.setSelectionRange(0, lastCharPlusOne);
        };

        this.dropper.addEventListener('mousedown', this.toggleDropDown.bind(this));
        this.dropdown.addEventListener('mousewheel', function(e) { e.stopPropagation(); });
        // this.dropdown.addEventListener('change', this.insertText.bind(this));
    },
    showEditor: function() {
        prototype.showEditor.call(this);
    },
    stopEditing: function(feedback) {
        if (this.node !== null && this.node !== undefined) {
            this.grid.behavior.dataModel.data[this.event.dataCell.y][this.column.schema.code] = this.node.id;
        }
        prototype.stopEditing.call(this, feedback);
    },
    setBounds: function(cellBounds) {
        var style = this.el.style;

        style.left = px(cellBounds.x);
        style.top = px(cellBounds.y);
        style.width = px(cellBounds.width - 20);
        style.height = px(cellBounds.height - 20);
    },
    cancelEditing: function() {
        this.node = null;
        this.setEditorValue(this.initialValue);
        this.hideEditor();
        this.grid.cellEditor = null;
        this.el.remove();
        this.grid.takeFocus();

        return true;
    },
    toggleDropDown: function() {
        let that = this;
        function callback(datas){
            var tree = new InspireTree({
                data: datas
            });
    
            new InspireTreeDOM(tree, {
                target: that.dropdown
            });

            tree.on("node.selected", that.insertText.bind(that));
            //function(node, isLoadEvent){
            //    that.input.value = node.text;
            //})

            if (!that.optionsTransition.transitioning) {
                var state = window.getComputedStyle(that.dropdown).visibility;
                stateToActionMap[state].call(that);
            }
        }
        let loaddata = this.column.schema.loaddata;
        if (loaddata !== undefined) {
            loaddata(this.column.schema, this.input.value, callback)
        } else {
            callback();
        }
    },
    insertText: function(node, isLoadEvent) {
        this.node = node;
        this.input.focus();
        this.input.value = node.text;

        this.input.setSelectionRange(0, this.input.value.length);

        // close the drop-down
        this.toggleDropDown();
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

function slideDown() {
    // preserve the text box's current text selection, which is about to be lost
    this.selectionStart = this.input.selectionStart;
    this.selectionEnd = this.input.selectionEnd;

    // clean up the select list from last usage
    this.dropdown.selectedIndex = -1; // be kind (remove previous selection)
    this.dropdown.style.scrollTop = 0; // rewind

    // show the drop-down slide down effect
    this.options.style.visibility = 'visible';
    var dropDownTopMargin = getFloat(this.dropdown, 'marginTop'),
        dropDownRows = 20,
        optionHeight = Math.ceil((this.dropdown.length && getFloat(this.dropdown[0], 'height') || 13.1875) * 2) / 2 + 1;
    this.options.style.height = dropDownTopMargin + optionHeight * dropDownRows + 2 + 'px'; // starts the slide down effect
    this.dropdown.style.height = dropDownTopMargin + optionHeight * dropDownRows  + 'px';

    // while in drop-down, listen for clicks in text box which means abprt
    this.input.addEventListener('mousedown', this.slideUpBound = slideUp.bind(this));

    // wait for transition to end
    this.optionsTransition.begin();
}

function slideUp() {
    // stop listening to input clicks
    this.input.removeEventListener('mousedown', this.slideUpBound);

    // start the slide up effect
    this.options.style.height = 0;

    // schedule the hide to occur after the slide up effect
    this.optionsTransition.begin(function(event) {
        this.style.visibility = 'hidden';
    });
}

function getFloat(el, style) {
    return parseFloat(window.getComputedStyle(el)[style]);
}

export default Date;