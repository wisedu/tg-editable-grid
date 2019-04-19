import CellRenderer from 'bh-fin-hypergrid/src/cellRenderers/CellRenderer';

let Borders = CellRenderer.extend('Borders', {
    paint: function(gc, config) {
        let bounds = config.bounds,
            x = bounds.x,
            y = bounds.y,
            w = bounds.width,
            h = bounds.height;
        let rowIndex = config.dataCell.y;
        if (config.gridCell.x === -2 && config.gridCell.y === 0) {
            let bgcolor = 'rgb(250, 250, 250)';
            gc.cache.fillStyle = bgcolor;
            gc.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
        }
        if (config.custom === undefined || config.custom.error === undefined) {
            return;
        }
        let row = config.custom.error[rowIndex] || {};
        let cell = row[config.name] || {};

        let topColor = cell.borderTop;
        let rightColor = cell.borderRight;
        let bottomColor = cell.borderBottom;
        let leftColor = cell.borderLeft;

        gc.save();
        // gc.translate(-.5, .5); // paint "sharp" lines on pixels instead of "blury" lines between pixels
        gc.cache.lineWidth = 1;

        if (topColor) {
            gc.beginPath();
            gc.moveTo(x, y);
            gc.lineTo(x + w, y);
            gc.strokeStyle = topColor;
            gc.stroke();
        }

        if (rightColor) {
            gc.beginPath();
            gc.moveTo(x + w - 1, y);
            gc.lineTo(x + w - 1, y + h);
            gc.strokeStyle = rightColor;
            gc.stroke();
        }

        if (bottomColor) {
            gc.beginPath();
            gc.moveTo(x, y + h - 1);
            gc.lineTo(x + w, y + h - 1);
            gc.strokeStyle = bottomColor;
            gc.stroke();
        }

        if (leftColor) {
            gc.beginPath();
            gc.moveTo(x, y);
            gc.lineTo(x, y + h);
            gc.strokeStyle = leftColor;
            gc.stroke();
        }

        if (topColor) {
            gc.beginPath();
            gc.moveTo(x + w, y);
            gc.lineTo(x + w, y + 12);
            gc.lineTo(x + w - 12, y);
            // gc.lineTo(x, y);
            gc.closePath();
            gc.fillStyle = topColor;
            gc.fill();
        }

        gc.restore();
    }
});

export default Borders;