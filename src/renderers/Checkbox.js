'use strict';

import CellRenderer from 'fin-hypergrid/src/cellRenderers/CellRenderer';
/**
 * The default cell rendering function for a button cell.
 * @constructor
 * @extends CellRenderer
 */
let Checkbox = CellRenderer.extend('Checkbox', {
    paint: function(gc, config) {
        let val = config.value,
            bounds = config.bounds,
            x = bounds.x + bounds.width/2 - 8,
            y = bounds.y + bounds.height/2 - 8,
            width = 16,
            height = 16,
            radius = 2,
            bgcolor = '';
            // arcGradient = gc.createLinearGradient(x, y, x, y + height);

        if (config.boxSizing === 'border-box') {
            width -= config.gridLinesVWidth;
            height -= config.gridLinesHWidth;
        }

        // console.log(config);
        // if (config.mouseDown) {
        //     config.dataRow[config.field] = !config.value;
        //     gc.canvas.dispatchEvent(new CustomEvent('tg-checkbox-change', {"detail":{
        //         name:config.field,
        //         value:config.dataRow[config.field],
        //         dataRow:config.dataRow,
        //         schema:config.columns,
        //         dataCell:config.dataCell
        //     }}));
        // }

        if (config.value === true) {
            bgcolor = '#2E8CF0';
            gc.cache.fillStyle = config.backgroundColor;
            gc.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
    
            // draw the capsule
            gc.cache.fillStyle = bgcolor;
            gc.cache.strokeStyle = 'rgba(0,0,0,0.15)';
            this.roundRect(gc, x, y, width, height, radius, bgcolor, true);
    
            gc.beginPath();
            gc.cache.lineWidth=2;
            gc.cache.strokeStyle="#fff"; // 蓝色路径
            gc.moveTo(x + 2, y + 8);
            gc.lineTo(x + 6, y + 12);
            gc.lineTo(x + 12, y + 2);
            gc.stroke(); // 进行绘制
        } else {
            bgcolor = '#FFF';
            gc.cache.fillStyle = config.backgroundColor;
            gc.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
    
            // draw the capsule
            gc.cache.fillStyle = bgcolor;
            gc.cache.strokeStyle = 'rgba(0,0,0,0.15)';
            this.roundRect(gc, x, y, width, height, radius, bgcolor, true);
        }
    }
});

export default Checkbox;
