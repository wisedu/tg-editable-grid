import CellRenderer from 'fin-hypergrid/src/cellRenderers/CellRenderer';

let Borders = CellRenderer.extend('Borders', {
    paint: function (gc, config) {
        let bounds = config.bounds, x = bounds.x, y = bounds.y, w = bounds.width, h = bounds.height;
        let color;

        gc.save();
        // gc.translate(-.5, .5); // paint "sharp" lines on pixels instead of "blury" lines between pixels
        gc.cache.lineWidth = 1;

        color = config.borderTop;
        if (color) {
            gc.beginPath();
            gc.moveTo(x, y);
            gc.lineTo(x + w, y);
            gc.cache.strokeStyle = color;
            gc.stroke();
        }

        color = config.borderRight;
        if (color) {
            gc.beginPath();
            gc.moveTo(x + w - 1, y);
            gc.lineTo(x + w - 1, y + h);
            gc.cache.strokeStyle = color;
            gc.stroke();
        }

        color = config.borderBottom;
        if (color) {
            gc.beginPath();
            gc.moveTo(x, y + h - 1);
            gc.lineTo(x + w, y + h - 1);
            gc.cache.strokeStyle = color;
            gc.stroke();
        }

        color = config.borderLeft;
        if (color) {
            gc.beginPath();
            gc.moveTo(x, y);
            gc.lineTo(x, y + h);
            gc.cache.strokeStyle = color;
            gc.stroke();
        }

        gc.restore();
    }
});

export default Borders;