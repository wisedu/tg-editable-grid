// ComboBox.js - A combo-box is a combination of a text-box and a drop-down.
// User may type into it and/or select an item from the drop-down (by clicking on the triangle at the right).
// The drop-down has sections which are toggled from a control area between the text-box and the drop-down.

/* eslint-env browser */
// import Popper from 'popper.js/dist/umd/popper.js';
import Textfield from 'bh-fin-hypergrid/src/cellEditors/Textfield';
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

    initialize: function () {
        var el = this.el;

        this.input = el.querySelector('input');
        this.dropper = el.querySelector('span');
        this.options = el.querySelector('div');
        this.search = this.options.querySelector('input');
        this.dropdown = this.options.querySelector('select');

        this.controllable = this.modes.length > 1;

        // set up a transition end controller
        this.optionsTransition = new Queueless(this.options, this);

        this.menuModesSource = this.column.menuModes || {
                schemaOptions: true
            };

        // wire-ups
        this.dropper.addEventListener('mousedown', this.toggleDropDown.bind(this));
        this.dropdown.addEventListener('mousewheel', function (e) {
            e.stopPropagation();
        });
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

    modes: [{
        name: 'distinctValues',
        appendOptions: function (optgroup) {
            // get the distinct column values and sort them
            var distinct = {},
                d = [],
                columnName = this.column.name,
                formatter = this.column.getFormatter();

            this.grid.behavior.getData().forEach(function (dataRow) {
                var val = formatter(dataRow[columnName]);
                distinct[val] = (distinct[val] || 0) + 1;
            });

            for (var key in distinct) {
                d.push(key);
            }

            while (optgroup.firstElementChild) {
                if (modes.isIE() || modes.isIE11()) {
                    optgroup.firstElementChild.removeNode(true);
                } else {
                    optgroup.firstElementChild.remove();
                }
            }
            d.sort();
            d.forEach(function (val) {
                var option = new Option(val + ' (' + distinct[val] + ')', val);
                optgroup.appendChild(option);
            });

            return d.length;
        },
        /**
         * 判断是否是IE
         * @returns boolean
         */
        isIE: function () {
            if (!!window.ActiveXobject || "ActiveXObject" in window) {
                return true;
            } else {
                return false;
            }
        },
        /**
         * 判断是否是IE11
         * @returns boolean
         */
        isIE11: function () {
            if ((/Trident\/7\./).test(navigator.userAgent)) {
                return true;
            } else {
                return false;
            }
        }
    }, {
        name: 'schemaOptions',
        appendOptions: function (optgroup) {
            var distinct = {},
                d = [],
                columnName = this.column.name,
                formatter = this.column.getFormatter();

            while (optgroup.firstElementChild) {
                // 判断是否是IE
                if (modes.isIE() || modes.isIE11()) {
                    optgroup.firstElementChild.removeNode(true);
                } else {
                    optgroup.firstElementChild.remove();
                }

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
    }],

    showEditor: function () {
        if(this.input.value === 'null' || this.input.value === 'undefined') this.input.value = '';

        // set the initial state of the mode toggles
        if (!this.built) {
            var menuModesSource = this.menuModesSource,
                menuModes = this.menuModes = {};

            // build the proxy
            this.modes.forEach(function (mode) {
                var modeName = mode.name;
                if (modeName in menuModesSource) {
                    menuModes[modeName] = menuModesSource[modeName];
                }
            });

            // wire-ups
            // if (this.controllable) {
            //     this.controls.addEventListener('click', onModeIconClick.bind(this));
            // }

            this.modes.forEach(function (mode) {
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

    stopEditing: function (feedback) {
        if (this.input.value !== this.initialValue) {
            let selectValue = "";
            for (let i = 0; i < this.dropdown.options.length; i++) {
                if (this.dropdown.options[i].text === this.input.value) {
                    selectValue = this.dropdown.options[i].value;
                }
            }
            this.grid.behavior.dataModel.data[this.event.dataCell.y][this.column.schema.code] = selectValue;
        }
        prototype.stopEditing.call(this, feedback);
    },
    setBounds: function (cellBounds) {
        var style = this.el.style;

        style.left = px(cellBounds.x);
        style.top = px(cellBounds.y);
        style.width = px(cellBounds.width - 20);
        style.height = px(cellBounds.height - 20);
    },

    cancelEditing: function () {
        this.input.value = this.initialValue;
        this.setEditorValue(this.initialValue);
        this.hideEditor();
        this.grid.cellEditor = null;
        if (this.checkIsIe9() || this.checkIsIe10() || this.checkIsIe11()) {
            this.el.removeNode(true);
        } else {
            this.el.remove();
        }
        this.grid.takeFocus();

        return true;
    },
    checkIsIe9: function () {
        var isIe9 = false;
        var browser = navigator.appName;
        var b_version = navigator.appVersion;
        var version = b_version.split(';');
        var trim_Version = version[1].replace(/[ ]/g, '');
        if (browser === 'Microsoft Internet Explorer' && trim_Version === 'MSIE9.0') {
            isIe9 = true;
        }
        return isIe9;
    },
    checkIsIe10: function () {
        var isIe10 = false;
        var browser = navigator.appName;
        var b_version = navigator.appVersion;
        var version = b_version.split(';');
        var trim_Version = version[1].replace(/[ ]/g, '');
        if (browser === 'Microsoft Internet Explorer' && (trim_Version === 'MSIE10.0')) {
            isIe10 = true;
        }
        return isIe10;
    },

    checkIsIe11: function () {
        var isIe11 = navigator.userAgent.toLowerCase().match(/rv:([\d.]+)\) like gecko/);
        return isIe11;
    },
    toggleDropDown: function () {
        let that = this;
        let optgroup = this.dropdown;

        // new Popper(this.input, this.dropdown.parentElement, {
        //     modifiers: {
        //         computeStyle:{
        //             gpuAcceleration: false
        //         },
        //         preventOverflow :{
        //             boundariesElement: 'window'
        //         }
        //     }
        // });

        while (optgroup.firstElementChild) {
            // 判断是否是IE
            if (isIE() || isIE11()) {
                optgroup.firstElementChild.removeNode(true);
            } else {
                optgroup.firstElementChild.remove();
            }
        }

        /**
         * 判断是否是IE
         * @returns boolean
         */
        function isIE() {
            if (!!window.ActiveXobject || "ActiveXObject" in window) {
                return true;
            } else {
                return false;
            }
        }

        /**
         * 判断是否是IE11
         * @returns boolean
         */
        function isIE11() {
            if ((/Trident\/7\./).test(navigator.userAgent)) {
                return true;
            } else {
                return false;
            }
        }

        function callback(datas) {
            datas.map(item => {
                var option;
                if (typeof(item) === "string") {
                    option = new Option(item, item);
                } else {
                    option = new Option(item.label || item.text, item.value);
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

    insertText: function (e) {
        // replace the input text with the drop-down text
        this.input.focus();
        this.input.value = this.dropdown[this.dropdown.selectedIndex].text;

        this.input.setSelectionRange(0, this.input.value.length);

        // close the drop-down
        this.toggleDropDown();
    },

    searchText: function () {
        let that = this;
        let keyword = this.search.value;
        let loaddata = this.column.schema.loaddata;
        let optgroup = this.dropdown;
        let opts = this.dropdown.querySelectorAll('option');
        for (var i = 0; i < opts.length; i++) {
            optgroup.removeChild(opts[i]);
        }
        //为了兼容ie
        // opts.forEach(function(opt) {
        //     optgroup.removeChild(opt);
        // });

        function callback(datas) {
            if (keyword !== '') {
                datas = datas.filter(function (item) {
                    return item.label.indexOf(keyword) > -1;
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
        var modeClassName = Array.prototype.find.call(ctrl.classList, function (className) {
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
        mode = this.modes.find(function (mode) {
            return mode.name === name;
        }), // eslint-disable-line no-shadow
        selector = mode.selector;

    // set icon state (color)
    ctrl.classList.toggle('active', !!state);

    // empty the optgroup if hiding; rebuild it if showing
    if (state) { // rebuild it
        // show progress cursor for (at least) 1/3 second
        style = this.el.style;
        style.cursor = 'progress';
        setTimeout(function () {
            style.cursor = null;
        }, 333);

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
    var dropDownTopMargin = getFloat(this.dropdown, 'marginTop'),
        dropDownRows = this.dropdown.size,
        optionHeight = Math.ceil((this.dropdown.length && getFloat(this.dropdown[0], 'height') || 13.1875) * 2) / 2 + 1;

    var optionsHeight = dropDownTopMargin + optionHeight * dropDownRows + 28; // starts the slide down effect
    var dropdownHeight = dropDownTopMargin + optionHeight * dropDownRows;
    var elHeight = parseInt(this.el.style.height) || 0;
    var elPosition = getElementAllPosition(this.el);
    var elTop = elPosition.top;
    var elBottom = elTop + elHeight;
    var windowHeight = window.innerHeight;
    var windowScroll = window.pageYOffset;

    var optionsDom = this.options;
    //下拉框向下显示
    if (elBottom + optionsHeight <= windowHeight + windowScroll) {
        optionsDom.style.top = elHeight + 'px';
        optionsDom.style.bottom = 'auto';
    } else {
        optionsDom.style.top = 'auto';
        optionsDom.style.bottom = (elHeight + 2) + 'px';
    }

    this.dropdown.style.height = dropdownHeight + 'px';
    optionsDom.style.height = optionsHeight + 'px';
    optionsDom.style.visibility = 'visible';

    // while in drop-down, listen for clicks in text box which means abprt
    this.input.addEventListener('mousedown', this.slideUpBound = slideUp.bind(this));

    // wait for transition to end
    this.optionsTransition.begin();
}

function slideUp() {
    // stop listening to input clicks
    this.input.removeEventListener('mousedown', this.slideUpBound);

    // schedule the hide to occur after the slide up effect
    // this.optionsTransition.begin(function(event) {
    //     this.style.visibility = 'hidden';
    // });

    // start the slide up effect
    this.options.style.visibility = 'hidden';
    this.options.style.height = 0;
}

function getFloat(el, style) {
    return parseFloat(window.getComputedStyle(el)[style]);
}

function px(n) {
    return n + 'px';
}

function getElementAllPosition(_el) {
    let offset = getElementPosition(_el);
    let top = offset.top;
    let left = offset.left;
    let width = _el.offsetWidth;
    let height = _el.offsetHeight;
    let right = left + width;
    let bottom = top + height;
    let scrollTop = offset.scrollTop;

    return {
        top: top,
        left: left,
        right: right,
        bottom: bottom,
        width: width,
        height: height,
        scrollTop: scrollTop
    }
}

function getElementPosition(_el) {
    var pos = {
        "top": 0,
        "left": 0,
        "scrollTop": 0
    };
    if (_el.offsetParent) {
        while (_el.offsetParent) {
            pos.top += _el.offsetTop;
            pos.left += _el.offsetLeft;
            pos.scrollTop += _el.scrollTop;
            _el = _el.offsetParent;
        }
    }
    return {
        left: pos.left,
        top: pos.top,
        scrollTop: pos.scrollTop
    };
}

export default ComboBox;