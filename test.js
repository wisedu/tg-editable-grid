// import customSchema from './static/customSchema.js';
// import excel from './static/excel.js';
// import data from './static/hrdata.js'

(async ()=> {
    let EditableGrid = window["tg-editable-grid"].default;
    let inst = new EditableGrid(document.getElementById("root"), {});
    
    let result = await fetch('./static/hrdata.js', {
        headers: new Headers({
        'Content-Type': 'application/json'
    })});
    
    let data = await result.json();
    
    inst.setData(data, [
        { code: 'SZDWDM', header: 'SZ单位', name:"SZDWDM_DISPLAY", editor:"comboBox", loaddata: async function(value, optgroup, callback) {
            let result = await fetch('./static/SZDW.json', {
                headers: new Headers({
                'Content-Type': 'application/json'
            })});
            let emapdatas = await result.json();
            emapdatas.datas.code.rows.map(item => {
                var option = new Option(item.name, item.id);
                optgroup.appendChild(option);
            })
            callback();
        }},
        { name: 'SZDWDM', header: 'SZDWDM', editor:"textfield" },
        { name: 'CZRQ', header: '操作日期', editor:"datetime" },
        { name: 'WID', header: 'WID', editor:"textfield" },
        { code: 'ZZMMDM', header: '政治面貌', name:"ZZMMDM_DISPLAY", editor:"comboBox", loaddata: async function(value, optgroup, callback) {
            let result = await fetch('./static/ZZMM.json', {
                headers: new Headers({
                'Content-Type': 'application/json'
            })});
            let emapdatas = await result.json();
            emapdatas.datas.code.rows.map(item => {
                var option = new Option(item.name, item.id);
                optgroup.appendChild(option);
            })
            callback();
        }}
    ]);
    
    document.getElementById("addrow").addEventListener("click", function(e){
        inst.getData().push({SZDWDM:"",SZDWDM_DISPLAY:"",CZRQ:"",WID:"",ZZMMDM:""});
    })

    document.getElementById("getData").addEventListener("click", function(e){
        console.log(inst.getData());
    })
})()