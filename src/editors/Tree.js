'use strict';
import InspireTree from 'inspire-tree';
import InspireTreeDOM from 'inspire-tree-dom';
import Textfield from 'fin-hypergrid/src/cellEditors/Textfield';
var prototype = Textfield.parent('CellEditor').prototype;

let calendar;
var Date = Textfield.extend('Datetime', {
    initialize: function(grid) {
        var localizerName = 'date';
        this.template = 
        '<div class="hypergrid-combobox" title="">',
        '    <input type="text" lang="{{locale}}" style="{{style}}">',
        '    <span title="Click for options"></span>',
        '    <div>',
        '        <div id="tree"></div>',
        '    </div>',
        '</div>'
        this.selectAll = function() {
            var lastCharPlusOne = this.getEditorValue().length;
            this.input.setSelectionRange(0, lastCharPlusOne);
        };
    },
    showEditor: function() {
        this.dropdown = this.options.getElementById('tree');
        var tree = new InspireTree({
            data: [{
                text: 'A node'
            }]
        });

        new InspireTreeDOM(tree, {
            target: this.dropdown
        });
        
        prototype.showEditor.call(this);
    },
    hideEditor: function() {
        // this is where you would persist this.menuModes
        prototype.hideEditor.call(this);
    },
});


export default Date;