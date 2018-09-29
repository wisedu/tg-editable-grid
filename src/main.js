import Hypergrid from 'fin-hypergrid';
import ComboBox from "./editors/ComboBox.js";
import Datetime from "./editors/Datetime.js";
import Tree from "./editors/Tree.js";
import excel from './excel.js';
import utils from './utils.js';

export default class TG_EDITABLE_GRID {
    constructor(dom, options){
        this.displayFieldFormat = options.displayFieldFormat;
        this.utils = utils;
        Hypergrid.registerTheme(excel);
        
        this.grid = new Hypergrid(dom, options);
        this.grid.properties.hoverCellHighlight = {
            enabled: true,
            backgroundColor: 'rgba(255,255,255)'
        }
        this.grid.properties.hoverRowHighlight = {
            enabled: false
        }
        this.grid.properties.hoverColumnHighlight = {
            enabled: false
        }
        this.grid.properties.editOnDoubleClick = false;
        // this.grid.properties.multipleSelections = true;
        // this.grid.properties.singleRowSelectionMode = false;
        this.grid.localization.date = new Intl.DateTimeFormat("zh-Hans-CN", options);

        this.grid.cellEditors.add(Datetime);
        this.grid.cellEditors.add(ComboBox);
        this.grid.cellEditors.add(Tree);
        this.grid.addEventListener('fin-editor-data-change', function(val){
            console.log(val, "~~~");
        })

        Hypergrid.applyTheme('excel');
    }

    setData(data, schema) {
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
                case "date-local":
                    newField.editor = "datetime"
                    break;
            }
            newSchema.push(newField);
        })

        this.grid.setData({data: data, schema: newSchema});
        this.grid.getCellEditorAt = function(row) {
            return this.cellEditors.create(row.column.schema.editor, row);
        }

        this.grid.getCell = function(config, rendererName) {
            return grid.cellRenderers.get(rendererName);
        };
   
    }

    onEditorLoadData(model, value, callback) {
        throw "请实现该方法";
    }

    getData() {
        return this.grid.behavior.dataModel.data;
    }
}