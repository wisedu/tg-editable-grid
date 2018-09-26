import Hypergrid from 'fin-hypergrid';
import ComboBox from "./editors/ComboBox.js";
import Datetime from "./editors/Datetime.js";
import Tree from "./editors/Tree.js";
import excel from './excel.js';
import utils from './utils.js';

export default class TG_EDITABLE_GRID {
    constructor(dom, options){
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
        this.grid.properties.editOnDoubleClick = false
        this.grid.localization.date = new Intl.DateTimeFormat("zh-Hans-CN", options);

        this.grid.cellEditors.add(Datetime);
        this.grid.cellEditors.add(ComboBox);
        this.grid.cellEditors.add(Tree);

        Hypergrid.applyTheme('excel');
    }

    setData(data, schema) {
        this.grid.setData({data: data, schema: schema});
        this.grid.getCellEditorAt = function(row) {
            return this.cellEditors.create(row.column.schema.editor, row);
        }

        this.grid.getCell = function(config, rendererName) {
            debugger
            return grid.cellRenderers.get(rendererName);
        };
   
    }

    getData() {
        return this.grid.behavior.dataModel.data;
    }
}