import Hypergrid from 'fin-hypergrid';
import ComboBox from "./editors/ComboBox.js";
import Datetime from "./editors/Datetime.js";
import Tree from "./editors/Tree.js";
import Text from "./editors/Text.js";

import renderCheckbox from "./renderers/Checkbox.js";
import renderBorders from "./renderers/Borders.js";
import wisTable from './wisTableTheme.js';
import utils from './utils.js';

export default class TG_EDITABLE_GRID {
    constructor(dom, options){
        this.displayFieldFormat = options.displayFieldFormat;
        this.utils = utils;
        Hypergrid.registerTheme(wisTable);
        Hypergrid.applyTheme('wisTable');
        this.grid = new Hypergrid(dom, options);
        // cellCursor
        this.grid.properties.hoverCellHighlight = {
            enabled: false,
            backgroundColor: "rgb(239,246,254)"
        }
        this.grid.properties.hoverRowHighlight = {
            enabled: false,
            backgroundColor: 'rgba(239,246,254)'
        }
        this.grid.properties.hoverColumnHighlight = {
            enabled: false
        }
        // this.grid.properties.gridBorder = true;
        this.grid.properties.columnAutosizing = options.columnAutosizing || false;
        this.grid.properties.editOnDoubleClick = false;
        // this.grid.properties.multipleSelections = true;
        // this.grid.properties.singleRowSelectionMode = true;
        this.grid.localization.date = new Intl.DateTimeFormat("zh-Hans-CN", options);

        this.grid.cellEditors.add(Datetime);
        this.grid.cellEditors.add(ComboBox);
        this.grid.cellEditors.add(Tree);
        this.grid.cellEditors.add(Text);

        this.grid.cellRenderers.add("Checkbox", renderCheckbox);
        this.grid.cellRenderers.add("Borders", renderBorders);
        // this.grid.addEventListener('fin-editor-data-change', function(val){
        //     console.log(val, "~~~");
        // })
    }
    setSchema(schema) {
        let that = this;
        let newSchema = [];
        schema.map(field => {
            let newField = Object.assign({}, field);
            newField.header = newField.caption;
            newField.editor = newField.xtype;

            if (this.displayFieldFormat !== "" && newField.name.endsWith(this.displayFieldFormat) > -1) {
                let code_name = newField.name.replace(this.displayFieldFormat, "");
                field.code = code_name;
            }
            switch (newField.xtype) {
                case "select":
                    newField.editor = "comboBox"
                    newField.loaddata = that.onEditorLoadData
                    break;
                case "tree":
                    newField.loaddata = that.onEditorLoadData
                    break;
                case "text":
                    newField.editor = "text"
                    break;
                case "date-local":
                    newField.editor = "datetime"
                    break;
                case "switcher":
                    newField.render = "switcher"
            }
            newSchema.push(newField);
        });
        this.grid.setBehavior();
        this.grid.behavior.dataModel.setSchema(newSchema);

        this.resetWidth();

        this.grid.getCellEditorAt = function(row) {
            return this.cellEditors.create(row.column.schema.editor, row);
        }

        this.grid.behavior.dataModel.getCell = function(config, rendererName) {
            if (config.columns[config.field] !== undefined && config.columns[config.field].render === "switcher") {
                return this.grid.cellRenderers.get("Checkbox");
            } else {
                return this.grid.cellRenderers.get(rendererName);
            }
        };

        this.grid.mixIn.call(this.grid.behavior.featureMap.OnHover, {
            handleMouseMove:function(grid, event) {

                if (event.isDataCell) {
                    this.cursor = 'cell';
                } else {
                    this.cursor = null;
                }

                if (event.properties.cells && event.properties.cells.data !== undefined){
                    for (const key in event.properties.cells.data) {
                        const element = event.properties.cells.data[key];
                        if (key === String(event.dataCell.y)){
                            if (element[event.column.name] !== undefined){
                                let x = event.bounds.x, y = event.bounds.y, w = event.bounds.width, h = event.bounds.height;
                                let message = element[event.column.name].message;
                                let gc = grid.canvas.gc;
                                var tw = gc.getTextWidth(message) + 20;
                                var th = gc.getTextHeight(gc.cache.font).descent + 28;
                                // gc.moveTo(event.bounds.x, event.bounds.y);
                                gc.cache.fillStyle = "#ff9900";
                                gc.fillRect(x + w - tw - 4, y - th - 10, tw, th);

                                gc.cache.textBaseline = 'middle';
                                gc.cache.fillStyle = '#fff';
                                gc.cache.font = '14px Helvetica,"PingFang SC","Microsoft YaHei"';
                                gc.fillText(message, x + w - tw + 4, y - th + 4);

                                gc.beginPath();
                                gc.moveTo(x + w - 12 - 8, y - 10);
                                gc.lineTo(x + w - 6 - 8, y + 6 - 10);
                                gc.lineTo(x + w - 8, y - 10);
                                gc.closePath();
                                gc.cache.fillStyle = "#ff9900";
                                gc.fill();

                            }
                        }
                    }
                    
                }

                var hoverCell = grid.hoverCell;
                if (!event.gridCell.equals(hoverCell)) {
                    if (hoverCell) {
                        this.handleMouseExit(grid, hoverCell);
                    }
                    this.handleMouseEnter(grid, event);
                    grid.setHoverCell(event);
                } else if (this.next) {
                    this.next.handleMouseMove(grid, event);
                }
            }
        })
    }

    setData(data) {
        this.grid.setData({data: data});
        this.resetWidth();
    }

    onEditorLoadData(model, value, callback) {
        throw "请实现该方法";
    }

    getData() {
        return this.grid.behavior.dataModel.data;
    }

    resetWidth() {
        this.grid.canvas.resize();
        let cols = this.grid.getColumnCount();
        let rowheaderWidth = 60;//this.grid.behavior.getColumnWidth(-2);//初始化时宽度默认是100

        if (this.grid.properties.columnAutosizing === true) {
            let sumWidth = 0;
            for (let index = 0; index < cols; index++) {
                let width = this.grid.behavior.getColumnWidth(index);
                sumWidth += width;
            }
            
            let lastWidth = this.grid.behavior.getColumnWidth(cols - 1);
            let newLastWidth = lastWidth + this.grid.getBounds().width - sumWidth - rowheaderWidth;
            this.grid.behavior.setColumnWidth(cols - 1, newLastWidth);
        } else {
            let avgWidth = (this.grid.getBounds().width - rowheaderWidth) / cols
            for (let index = 0; index < cols; index++) {
                this.grid.behavior.setColumnWidth(index, avgWidth);
            }
        }
    }
}