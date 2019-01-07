// import customSchema from './static/customSchema.js';
// import excel from './static/excel.js';
// import data from './static/hrdata.js'

(async () => {
    let EditableGrid = window["tg-editable-grid"].default;
    let inst = new EditableGrid(document.getElementById("root"), {
        displayFieldFormat: "_DISPLAY"
    });
    inst.onEditorLoadData = function (schmea, value, callback) {
        //console.log(schmea, value, callback)
    }
    inst.setSchema([{
            name: "SZDWDM_DISPLAY",
            caption: 'SZ单位',
            xtype: "tree"
        },
        {
            name: 'SZDWDM',
            caption: 'SZDWDM',
            xtype: "text"
        },
        {
            name: 'CZRQ',
            caption: '操作日期',
            xtype: "datetime"
        },
        {
            name: 'WID',
            caption: 'WID',
            xtype: "text"
        },
        {
            name: 'SFCYLK',
            caption: 'SFCYLK',
            xtype: "switcher"
        },
        {
            code: 'ZZMMDM',
            caption: '政治面貌',
            name: "ZZMMDM_DISPLAY",
            xtype: "select"
        }
    ]);

    let result = await fetch('./static/hrdata.js', {
        headers: new Headers({
            'Content-Type': 'application/json'
        })
    });

    let data = await result.json();

    inst.setData(data);

    inst.grid.addProperties({
        renderer: ['SimpleCell', 'Borders'],
        cells: {
            data: {
                1: { // row index
                    WID: {
                        borderLeft: "red",
                        borderTop: "red",
                        borderBottom: "red",
                        borderRight: "red",
                        message: "The following entrypoint(s) combined asset size exceeds the recommended limit (244 KiB). This can impact web performance."
                    }
                },
                2: { // row index
                    WID: {
                        borderLeft: "red",
                        borderTop: "red",
                        borderBottom: "red",
                        borderRight: "red",
                        message: "nnn"
                    }
                }
            }
        }
    });

    document.getElementById("addrow").addEventListener("click", function (e) {
        inst.getData().push({
            SZDWDM: "",
            SZDWDM_DISPLAY: "",
            CZRQ: "",
            WID: "",
            ZZMMDM: ""
        });
        // document.getElementById("root").style.height = "200px";
    })

    document.getElementById("getData").addEventListener("click", function (e) {
        // console.log(inst.getData());
    })

    let cells = {
        "3": {
            "name":

            {
                "borderLeft": "#ed4014",
                "borderTop": "#ed4014",
                "borderBottom": "#ed4014",
                "borderRight": "#ed4014",
                "message": "名称不能为空"
            },
            "dataType_DISPLAY": {
                "borderLeft": "#ed4014",
                "borderTop": "#ed4014",
                "borderBottom": "#ed4014",
                "borderRight": "#ed4014",
                "message": "名称不能为空"
            }
        }
    }


})()