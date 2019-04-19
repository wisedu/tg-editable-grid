'use strict';
import Popper from 'popper.js/dist/umd/popper.js';
import Queueless from './queueless.js';
import InspireTree from 'inspire-tree';
import InspireTreeDOM from 'inspire-tree-dom';
import Textfield from 'bh-fin-hypergrid/src/cellEditors/Textfield';
var prototype = Textfield.parent('CellEditor').prototype;

var stateToActionMap = {
    hidden: slideDown,
    visible: slideUp
};

var Date = Textfield.extend('Tree', {

    template: ['<div class="hypergrid-combobox" title="">',
        '    <input type="text" lang="{{locale}}" style="{{style}}">',
        '    <span title="Click for options"></span>',
        '    <div class="hypergrid-combobox-container">',
        '       <div id="dataContainer"></div>',
        '    </div>',
        '</div>'
    ].join('\n'),

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
        // if (checkIsIe9()) {
        //     // this.input.attachEvent("onmousedown", this.slideUpBound = slideUp.bind(this));
        //     this.dropper.attachEvent('onmousedown', this.toggleDropDown.bind(this));
        //     this.dropdown.attachEvent('onmousewheel', function(e) {
        //         window.event.returnValue = fale;
        //         return false;
        //     });
        // } else {
        this.dropper.addEventListener('mousedown', this.toggleDropDown.bind(this));
        this.dropdown.addEventListener('mousewheel', function(e) {
            e.stopPropagation();
        });
        // }
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

        new Popper(this.input, this.dropdown.parentElement, {
            modifiers: {
                computeStyle: {
                    gpuAcceleration: false
                },
                preventOverflow: {
                    boundariesElement: 'window'
                }
            }
        });

        function callback(datas) {
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
        // console.log('insertText~~~~~~~~~~')
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
        style.width = px(cellBounds.width - 16);
        style.height = px(cellBounds.height - 20);
    },
});

function px(n) {
    return n + 'px';
}

function slideDown() {
    // preserve the text box's current text selection, which is about to be lost
    this.selectionStart = this.input.selectionStart;
    this.selectionEnd = this.input.selectionEnd;

    // clean up the select list from last usage
    this.dropdown.selectedIndex = -1; // be kind (remove previous selection)
    this.dropdown.style.scrollTop = 0; // rewind

    // show the drop-down slide down effect
    this.options.style.visibility = 'visible';
    var OlLi = this.dropdown.querySelectorAll('#dataContainer>ol>li');
    var dropDownTopMargin = getFloat(this.dropdown, 'marginTop'),
        dropDownRows = 8,
        optionHeight = 25; //Math.ceil((OlLi.length && getFloat(OlLi[0], 'height') || 13.1875) * 2) / 2 + 1;
    this.options.style.height = dropDownTopMargin + optionHeight * dropDownRows + 2 + 'px'; // starts the slide down effect
    this.dropdown.style.height = dropDownTopMargin + optionHeight * dropDownRows + 'px';

    // while in drop-down, listen for clicks in text box which means abprt
    // if (checkIsIe9()) {
    //     this.input.attachEvent("onmousedown", this.slideUpBound = slideUp.bind(this));
    // } else {
    this.input.addEventListener('mousedown', this.slideUpBound = slideUp.bind(this));
    // }



    // wait for transition to end
    this.optionsTransition.begin();
}

function slideUp() {
    // stop listening to input clicks
    // if (checkIsIe9()) {
    //     this.input.detachEvent('onmousedown', this.slideUpBound);
    // this.input.attachEvent("onmousedown", this.slideUpBound = slideUp.bind(this));
    // } else {
    this.input.removeEventListener('mousedown', this.slideUpBound);
    // }


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

function checkIsIe9() {
    var isIe9 = false;
    var browser = navigator.appName;
    var b_version = navigator.appVersion;
    var version = b_version.split(';');
    var trim_Version = version[1].replace(/[ ]/g, '');
    if (browser === 'Microsoft Internet Explorer' && trim_Version === 'MSIE9.0') {
        isIe9 = true;
    }
    return isIe9;
}
export default Date;