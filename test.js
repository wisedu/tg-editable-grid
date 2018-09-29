// import customSchema from './static/customSchema.js';
// import excel from './static/excel.js';
// import data from './static/hrdata.js'

(async ()=> {
    let EditableGrid = window["tg-editable-grid"].default;
    let inst = new EditableGrid(document.getElementById("root"), {displayFieldFormat:"_DISPLAY"});
    inst.onEditorLoadData = function(schmea, value, callback) {
        
    }
    
    let result = await fetch('./static/hrdata.js', {
        headers: new Headers({
        'Content-Type': 'application/json'
    })});
    
    let data = await result.json();
    
    inst.setData(data, [
        { name:"SZDWDM_DISPLAY", caption: 'SZ单位', xtype:"tree"},
        { name: 'SZDWDM', caption: 'SZDWDM', xtype:"textfield" },
        { name: 'CZRQ', caption: '操作日期', xtype:"datetime" },
        { name: 'WID', caption: 'WID', xtype:"textfield" },
        { code: 'ZZMMDM', caption: '政治面貌', name:"ZZMMDM_DISPLAY", xtype:"comboBox"}
    ]);
    
    document.getElementById("addrow").addEventListener("click", function(e){
        inst.getData().push({SZDWDM:"",SZDWDM_DISPLAY:"",CZRQ:"",WID:"",ZZMMDM:""});
    })

    document.getElementById("getData").addEventListener("click", function(e){
        console.log(inst.getData());
    })

})()
