import Hypergrid from 'bh-fin-hypergrid';
import ComboBox from "./editors/ComboBox.js";
import Datetime from "./editors/Datetime.js";
import Tree from "./editors/Tree.js";
import Text from "./editors/Text.js";

import renderCheckbox from "./renderers/Checkbox.js";
import renderBorders from "./renderers/Borders.js";
import wisTable from './wisTableTheme.js';
import utils from './utils.js';

export default class TG_EDITABLE_GRID {
    constructor(dom, options) {
        this.displayFieldFormat = options.displayFieldFormat;
        this.readOnly = options.readOnly;
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

        this.grid.properties.renderer = ['SimpleCell', 'Borders'];
        // this.grid.addEventListener('fin-editor-data-change', function(val){
        //     console.log(val, "~~~");
        // })
        // hover 事件设置tooltips
        var that = this;
        this.grid.addEventListener('fin-cell-enter', function(e) {
            //how to set the tooltip....
            var hoverCell = that.grid.hoverCell;
            var renderedData = that.grid.getRenderedData();
            if (hoverCell.x >= 0) {
                var title = renderedData[hoverCell.y][hoverCell.x];
                that.grid.setAttribute('title', title);
            }
        });
    }
    setSchema(schema) {
        let that = this;
        let newSchema = [];
        schema.map(field => {
            let newField = Object.assign({}, field);
            newField.header = newField.caption;

            if (this.displayFieldFormat !== "" && newField.name.endsWith(this.displayFieldFormat) === true) {
                let code_name = newField.name.replace(this.displayFieldFormat, "");
                newField.code = code_name;
            }
            if (this.readOnly !== true) {
                newField.editor = newField.xtype;
                switch (newField.xtype) {
                    case "select":
                        newField.editor = "comboBox";
                        newField.loaddata = that.onEditorLoadData;
                        break;
                    case "tree":
                        newField.loaddata = that.onEditorLoadData;
                        break;
                    case "text":
                        newField.editor = "text";
                        break;
                    case "date":
                    case "date-local":
                    case "date-full":
                    case "date-ym":
                        newField.editor = "datetime";
                        break;
                    case "switcher":
                        newField.render = "switcher";
                    default:
                        newField.editor = 'readOnly'
                }
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
            if (config.columns[config.field] !== undefined && typeof(config.columns[config.field].render) === "function") {
                let newrender = config.columns[config.field].render(config, rendererName)
                if (newrender === undefined) {
                    newrender = rendererName
                }
                return this.grid.cellRenderers.get(newrender);
            } else if (config.columns[config.field] !== undefined && config.columns[config.field].render === "switcher") {
                return this.grid.cellRenderers.get("Checkbox");
            } else {
                return this.grid.cellRenderers.get(rendererName);
            }
        };

        this.grid.canvas.gc.canvas.addEventListener('wheel', function(e) {
            that.grid.cancelEditing();
        })

        this.grid.mixIn.call(this.grid.behavior.featureMap.CellClick, {
            handleClick: function(grid, event) {
                var consumed = (event.isDataCell || event.isTreeColumn) && (
                    this.openLink(grid, event) !== undefined ||
                    grid.cellClicked(event)
                );

                if (event.columnProperties.render === "switcher") {
                    event.value = !event.value;
                    grid.canvas.dispatchEvent(new CustomEvent('tg-checkbox-change', {
                        "detail": {
                            name: event.columnProperties.field,
                            value: event.dataRow[event.columnProperties.field],
                            dataRow: event.dataRow,
                            schema: event.columnProperties.columns,
                            dataCell: event.dataCell
                        }
                    }));
                }

                if (!consumed && this.next) {
                    this.next.handleClick(grid, event);
                }
            }
        });

        this.grid.mixIn.call(this.grid.behavior.featureMap.OnHover, {
            handleMouseMove: function(grid, event) {

                if (event.isDataCell) {
                    this.cursor = 'cell';
                } else {
                    this.cursor = null;
                }

                if (event.properties.custom && event.properties.custom.error !== undefined) {
                    for (const key in event.properties.custom.error) {
                        const element = event.properties.custom.error[key];
                        if (key === String(event.dataCell.y)) {
                            if (element[event.column.name] !== undefined) {
                                let x = event.bounds.x,
                                    y = event.bounds.y,
                                    w = event.bounds.width,
                                    h = event.bounds.height;
                                let message = element[event.column.name].message;
                                let gc = grid.canvas.gc;
                                gc.font = '14px Helvetica,"PingFang SC","Microsoft YaHei"';
                                let tw = gc.getTextWidth(message);
                                let th = gc.getTextHeight(gc.font).descent + 28;

                                let tipPointer = {
                                    center_x: x + w - 6 - 8,
                                    center_y: y + 6 - 10,
                                    left_x: x + w - 6 - 8 - tw / 2,
                                    left_y: y + 6 - 10 - th
                                };
                                if (tipPointer.left_x < 0) {
                                    tipPointer.left_x = 0;
                                }

                                gc.save();
                                gc.fillStyle = "#ff9900";
                                gc.fillRect(tipPointer.left_x, tipPointer.left_y, tw + 12, th);

                                gc.textBaseline = 'top';
                                gc.font = '14px Helvetica,"PingFang SC","Microsoft YaHei"';
                                gc.fillStyle = '#fff';
                                gc.fillText(message, tipPointer.left_x + 6, tipPointer.left_y + 6);

                                // gc.beginPath();
                                // gc.moveTo(x + w - 6 - 8 - 6, y + 6 - 10 + 6);
                                // gc.lineTo(x + w - 6 - 8, y + 6 - 10);
                                // gc.lineTo(x + w - 6 - 8 + 6, y + 6 - 10 - 6);
                                // gc.closePath();
                                // gc.cache.fillStyle = "#ff9900";
                                // gc.fill();
                                gc.restore();
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
        });
    }

    setData(data) {
        let emptyData = {};
        this.grid.getColumns().map(column => {
            emptyData[column.schema.name] = "";
            if (this.displayFieldFormat !== "" && column.schema.name.endsWith(this.displayFieldFormat) === true) {
                let code_name = column.schema.name.replace(this.displayFieldFormat, "");
                emptyData[code_name] = "";
            }
        });
        let newData = data.map(item => {
            return Object.assign({}, emptyData, item);
        });

        //当删除行时，清空缓存，避免在调用that.grid.getRenderedData();方法时报错
        this.grid.renderer.reset();

        this.grid.setData({
            data: newData
        });
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
        let rowheaderWidth = 40; //this.grid.behavior.getColumnWidth(-2);//初始化时宽度默认是100

        if (this.grid.properties.columnAutosizing === true || this.grid.div.parentNode.getAttribute('column-auto-sizing') === 'true') {
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