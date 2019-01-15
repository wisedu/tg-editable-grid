// ComboBox.js - A combo-box is a combination of a text-box and a drop-down.
// User may type into it and/or select an item from the drop-down (by clicking on the triangle at the right).
// The drop-down has sections which are toggled from a control area between the text-box and the drop-down.

/* eslint-env browser */
import Popper from 'popper.js/dist/umd/popper.js';
import Textfield from 'fin-hypergrid/src/cellEditors/Textfield';
var prototype = Textfield.parent('CellEditor').prototype;
import Queueless from './queueless.js';

/*********************************/
/* eslint-disable no-unused-vars */
/*********************************/

var TOGGLE_MODE_PREFIX = 'toggle-mode-';

var stateToActionMap = {
    hidden: slideDown,
    visible: slideUp
};

/**
 * A combo box is a text box that also has a drop-down containing options. The drop-down consists of an actual drop-down list (a `<select>` list) plus a _control area_ above it containing toggles. The toggles control the visibility of the various "mode lists."
 *
 * Functions well in Chrome, Safari, Firefox, and Internet Explorer.
 * @constructor
 * @extends Textfield
 */
var ComboBox = Textfield.extend('ComboBox', {

    initialize: function() {
        var el = this.el;

        this.input = el.querySelector('input');
        this.dropper = el.querySelector('span');
        this.options = el.querySelector('div');
        this.search = this.options.querySelector('input');
        this.dropdown = this.options.querySelector('select');

        this.controllable = this.modes.length > 1;

        // set up a transition end controller
        this.optionsTransition = new Queueless(this.options, this);

        this.menuModesSource = this.column.menuModes || { schemaOptions: true };

        // wire-ups
        this.dropper.addEventListener('mousedown', this.toggleDropDown.bind(this));
        this.dropdown.addEventListener('mousewheel', function(e) { e.stopPropagation(); });
        this.dropdown.addEventListener('change', this.insertText.bind(this));
        this.search.addEventListener('input', this.searchText.bind(this));

    },

    template: [
'<div class="hypergrid-combobox" title="">',
'    <input type="text" lang="{{locale}}" style="{{style}}" readonly="readonly">',
'    <span title="Click for options"></span>',
'    <div class="hypergrid-combobox-container">',
'        <input type="text" name="search" lang="{{locale}}" style="{{style}}" autofocus placeholder="请输入关键词" autocomplete="off">',
'        <select id="dataContainer" size="8" lang="{{locale}}"></select>',
'    </div>',
'</div>'
    ].join('\n'),

    modes: [
        {
            name: 'distinctValues',
            appendOptions: function(optgroup) {
                // get the distinct column values and sort them
                var distinct = {},
                    d = [],
                    columnName = this.column.name,
                    formatter = this.column.getFormatter();

                this.grid.behavior.getData().forEach(function(dataRow) {
                    var val = formatter(dataRow[columnName]);
                    distinct[val] = (distinct[val] || 0) + 1;
                });

                for (var key in distinct) {
                    d.push(key);
                }

                while (optgroup.firstElementChild) {
                    optgroup.firstElementChild.remove();
                }

                d.sort().forEach(function(val) {
                    var option = new Option(val + ' (' + distinct[val] + ')', val);
                    optgroup.appendChild(option);
                });

                return d.length;
            }
        },{
            name: 'schemaOptions',
            appendOptions: function(optgroup) {
                var distinct = {},
                    d = [],
                    columnName = this.column.name,
                    formatter = this.column.getFormatter();

                while (optgroup.firstElementChild) {
                    optgroup.firstElementChild.remove();
                }

                
                // this.column.schema.options.map(item => {
                //     d.push(item);
                // })

                // d.sort().forEach(function(val) {
                //     var option = new Option(val, val);
                //     optgroup.appendChild(option);
                // });

                return d.length;
            }
        }
    ],

    showEditor: function() {
        // set the initial state of the mode toggles
        if (!this.built) {
            var menuModesSource = this.menuModesSource,
                menuModes = this.menuModes = {};

            // build the proxy
            this.modes.forEach(function(mode) {
                var modeName = mode.name;
                if (modeName in menuModesSource) {
                    menuModes[modeName] = menuModesSource[modeName];
                }
            });

            // wire-ups
            // if (this.controllable) {
            //     this.controls.addEventListener('click', onModeIconClick.bind(this));
            // }

            this.modes.forEach(function(mode) {
                // create a toggle
                var toggle = document.createElement('span');
                if (this.controllable) {
                    toggle.className = TOGGLE_MODE_PREFIX + mode.name;
                    toggle.title = 'Toggle ' + (mode.label || mode.name).toLowerCase();
                    if (mode.tooltip) {
                        toggle.title += '\n' + mode.tooltip;
                    }
                    toggle.textContent = mode.symbol;
                }

                // this.controls.appendChild(toggle);

                // create and label a new optgroup
                if (mode.selector) {
                    var optgroup = document.createElement('optgroup');
                    optgroup.label = mode.label;
                    optgroup.className = 'submenu-' + mode.name;
                    optgroup.style.backgroundColor = mode.backgroundColor;
                    this.dropdown.add(optgroup);
                }

                setModeIconAndOptgroup.call(this, toggle, mode.name, menuModes[mode.name]);
            }, this);

            this.built = true;
        }

        prototype.showEditor.call(this);
    },

    stopEditing: function(feedback) {
        if (this.input.value !== this.initialValue) {
            let selectValue = "";
            for (let i = 0; i < this.dropdown.options.length; i++){
                if (this.dropdown.options[i].text === this.input.value) {
                    selectValue = this.dropdown.options[i].value;
                }
            }
            this.grid.behavior.dataModel.data[this.event.dataCell.y][this.column.schema.code] = selectValue;
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
        this.input.value = this.initialValue;
        this.setEditorValue(this.initialValue);
        this.hideEditor();
        this.grid.cellEditor = null;
        this.el.remove();
        this.grid.takeFocus();

        return true;
    },
    toggleDropDown: function() {
        let that = this;
        let optgroup = this.dropdown;

        new Popper(this.input, this.dropdown.parentElement, {
            modifiers: {
                computeStyle:{
                    gpuAcceleration: false
                },
                preventOverflow :{
                    boundariesElement: 'window'
                }
            }
        });

        while (optgroup.firstElementChild) {
            optgroup.firstElementChild.remove();
        }

        function callback(datas){
            datas.map(item => {
                var option;
                if (typeof(item) === "string") {
                    option = new Option(item, item);
                } else {
                    option = new Option(item.label||item.text, item.value);
                }
                optgroup.appendChild(option);
            })
            if (!that.optionsTransition.transitioning) {
                var state = window.getComputedStyle(that.dropdown).visibility;
                stateToActionMap[state].call(that);
            }
        }
        
        let loaddata = this.column.schema.loaddata;
        this.search.value = '';
        if (loaddata !== undefined) {
            loaddata(this.column.schema, this.search.value, callback)
        } else {
            callback();
        }
    },

    insertText: function(e) {
        // replace the input text with the drop-down text
        this.input.focus();
        this.input.value = this.dropdown[this.dropdown.selectedIndex].label;
        
        this.input.setSelectionRange(0, this.input.value.length);

        // close the drop-down
        this.toggleDropDown();
    },

    searchText: function(){
        let that = this;
        let keyword = this.search.value;
        let loaddata = this.column.schema.loaddata;
        let optgroup = this.dropdown;
        let opts = this.dropdown.querySelectorAll('option');
        opts.forEach(function(opt){
            optgroup.removeChild(opt);
        });
        function callback(datas){
            if(keyword !== ''){
                datas = datas.filter(function(item){
                    return item.label.indexOf(keyword)>-1;
                });
            }
            datas.map(item => {
                var option;
                if (typeof(item) === "string") {
                    option = new Option(item, item);
                } else {
                    option = new Option(item.label, item.value);
                }
                optgroup.appendChild(option);
            });
        }
        loaddata(this.column.schema, keyword, callback);
    }
});

function onModeIconClick(e) {
    var ctrl = e.target;

    if (ctrl.tagName === 'SPAN') {
        // extra ct the mode name from the toggle control's class name
        var modeClassName = Array.prototype.find.call(ctrl.classList, function(className) {
                return className.indexOf(TOGGLE_MODE_PREFIX) === 0;
            }),
            modeName = modeClassName.substr(TOGGLE_MODE_PREFIX.length);

        // toggle mode in the filter
        var modeState = this.menuModes[modeName] ^= 1;

        setModeIconAndOptgroup.call(this, ctrl, modeName, modeState);
    }
}

function setModeIconAndOptgroup(ctrl, name, state) {
    var style, optgroup, sum, display,
        dropdown = this.dropdown,
        mode = this.modes.find(function(mode) { return mode.name === name; }), // eslint-disable-line no-shadow
        selector = mode.selector;

    // set icon state (color)
    ctrl.classList.toggle('active', !!state);

    // empty the optgroup if hiding; rebuild it if showing
    if (state) { // rebuild it
        // show progress cursor for (at least) 1/3 second
        style = this.el.style;
        style.cursor = 'progress';
        setTimeout(function() { style.cursor = null; }, 333);

        if (selector) {
            optgroup = dropdown.querySelector(selector);
            sum = mode.appendOptions.call(this, optgroup);

            // update sum
            optgroup.label = optgroup.label.replace(/ \(\d+\)$/, ''); // remove old sum
            optgroup.label += ' (' + sum + ')';
        } else {
            sum = mode.appendOptions.call(this, dropdown);
            if (!this.controllable) {
                ctrl.textContent = sum + ' values';
            }
        }

        display = null;
    } else {
        display = 'none';
    }

    // hide/show the group
    if (!selector) {
        selector = 'option,optgroup:not([class])';
        var mustBeChildren = true; // work-around for ':scope>option,...' not avail in IE11
    }
    Array.prototype.forEach.call(dropdown.querySelectorAll(selector), iteratee);

    function iteratee(el) {
        if (!mustBeChildren || el.parentElement === dropdown) {
            el.style.display = display;
        }
    }

    // TODO: Reset the width of this.options to the natural width of this.dropdown. To do this, we need to remove the latter's "width: 100%" from the CSS and then set an explicit this.options.style.width based on the computed width of this.dropdown. This is complicated by the fact that it cannot be done before it is in the DOM.
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
    var dropDownTopMargin = getFloat(this.dropdown, 'marginTop'),
        dropDownRows = this.dropdown.size,
        optionHeight = Math.ceil((this.dropdown.length && getFloat(this.dropdown[0], 'height') || 13.1875) * 2) / 2 + 1;
    this.options.style.height = dropDownTopMargin + optionHeight * dropDownRows + 28 + 'px'; // starts the slide down effect
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
function px(n) { return n + 'px'; }


export default ComboBox;