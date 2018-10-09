import Hypergrid from 'fin-hypergrid';
import ComboBox from "./editors/ComboBox.js";
import Datetime from "./editors/Datetime.js";
import Tree from "./editors/Tree.js";
import Text from "./editors/Text.js";

import renderCheckbox from "./renderers/Checkbox.js";
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
        this.grid.properties.columnAutosizing = false;
        this.grid.properties.editOnDoubleClick = false;
        // this.grid.properties.multipleSelections = true;
        // this.grid.properties.singleRowSelectionMode = true;
        this.grid.localization.date = new Intl.DateTimeFormat("zh-Hans-CN", options);

        this.grid.cellEditors.add(Datetime);
        this.grid.cellEditors.add(ComboBox);
        this.grid.cellEditors.add(Tree);
        this.grid.cellEditors.add(Text);

        this.grid.cellRenderers.add("Checkbox", renderCheckbox);
        // this.grid.addEventListener('fin-editor-data-change', function(val){
        //     console.log(val, "~~~");
        // })
    }
    setSchema(schema) {
        let that = this;
        let newSchema = [];
        schema.map(field => {
            let newField = field;
            newField.header = newField.caption;
            newField.editor = newField.xtype;
            delete newField.caption;

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
    }

    onEditorLoadData(model, value, callback) {
        throw "请实现该方法";
    }

    getData() {
        return this.grid.behavior.dataModel.data;
    }
}