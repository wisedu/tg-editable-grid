// import customSchema from './static/customSchema.js';
// import excel from './static/excel.js';
// import data from './static/hrdata.js'

(async () => {
    let EditableGrid = window["tg-editable-grid"].default;
    let inst = new EditableGrid(document.getElementById("root"), {
        displayFieldFormat: "_DISPLAY"
    });
    var toTreeData = function(data, parent_id, options) {
        let opt = options || {ukey:"id", pkey:'parent_id', toCKey:'children'}
        var tree = [];
        var temp;
        for (var i = 0; i < data.length; i++) {
          if (data[i][opt.pkey] == parent_id || data[i][opt.ukey] === data[i][opt.pkey]) {
            var obj = data[i];
            temp = toTreeData(data, data[i][opt.ukey], opt);
            if (temp.length > 0) {
              obj[opt.toCKey] = temp;
            }
            tree.push(obj);
          }
        }
        return tree;
    };
    inst.onEditorLoadData = function (schmea, value, callback) {
        console.log(schmea, value, callback)
        // var datas = [
        //     {id: "01", name: "2017", text: "2017", value: "001"},
        //     {id: "02", name: "2018", text: "2018", value: "002"},
        //     {id: "03", name: "2019", text: "2019", value: "003"}
        // ];
        var datas =  [{
                "text": "基本信息维护",
                "id": "1",
                "parentid": "-1",
                "value": "$2.0"
            },
            {
                "id": "2",
                "parentid": "1",
                "text": "新增",
                "value": "$2.1"
            }, {
                "id": "3",
                "parentid": "1",
                "text": "删除",
                "value": "$2.2"
            }, {
                "id": "4",
                "parentid": "1",
                "text": "编辑",
                "value": "$2.3"
            }, {
                "id": "5",
                "parentid": "1",
                "text": "上传附件",
                "value": "$2.4"
            },  {
                "id": "11",
                "text": "信息历史查询",
                "parentid": "-1",
                "value": "$2.5"
            }, {
                "id": "7",
                "parentid": "11",
                "text": "导出",
                "value": "$2.6"
            }, {
                "id": "8",
                "text": "附件",
                "parentid": "11",
                "value": "$2.7"
            },{
                "id": "9",
                "text": "xxx",
                "parentid": "8",
                "value": "$2.8"
            }];
        datas = toTreeData(datas,"-1", {ukey:"id", pkey:'parentid', toCKey:'children'})
        callback(datas)
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