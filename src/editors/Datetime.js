'use strict';
import flatpickr from "flatpickr";
import Textfield from 'bh-fin-hypergrid/src/cellEditors/Textfield';
var prototype = Textfield.parent('CellEditor').prototype;

let calendar;
var Date = Textfield.extend('Datetime', {
    template: `<div class="hypergrid-combobox" title="">
    <input type="text" lang="{{locale}}" style="{{style}}" readonly>
    <span title="Click for datepicker"></span>
</div>`,
    initialize: function(grid) {
        var el = this.el;
        this.input = el.querySelector('input');
        this.dropper = el.querySelector('span');
        this.selectAll = function() {
            var lastCharPlusOne = this.getEditorValue().length;
            this.input.setSelectionRange(0, lastCharPlusOne);
        };
        this.dropper.addEventListener('mousedown', this.toggleDropDown.bind(this));
    },
    showEditor: function() {
        let that = this;
        let format = this.column.schema.format || '';
        format = format.replace('yyyy', 'Y').replace('MM', 'm').replace('dd', 'd').replace('HH', 'H').replace('mm', 'i').replace('ss', 'S');
        let enableTime = false;
        if (/H|i|S/.test(format)) {
            enableTime = true;
        }
        prototype.showEditor.call(this);
        setTimeout(function() {
            calendar = flatpickr(that.input, {
                "enableTime": enableTime,
                "dateFormat": format,
                "locale": {
                    weekdays: {
                        shorthand: ["日", "一", "二", "三", "四", "五", "六"],
                        longhand: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"]
                    },
                    months: {
                        shorthand: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
                        longhand: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"]
                    },
                    rangeSeparator: " 至 ",
                    weekAbbreviation: "周",
                    scrollTitle: "滚动切换",
                    toggleTitle: "点击切换 12/24 小时时制"
                },
                // onChange: function(selectedDates, dateStr, instance) {
                //     event.stopPropagation();
                // },
                onMonthChange: function(selectedDates, dateStr, instance, e) {
                    event.stopPropagation();
                },
                onYearChange: function(selectedDates, dateStr, instance, e) {
                    event.stopPropagation();
                }
            });
        }, 100)
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
    toggleDropDown: function(event) {
        calendar.toggle();
    }
});

function px(n) {
    return n + 'px';
}

export default Date;