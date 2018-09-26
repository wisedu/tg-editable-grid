[
    { name: 'SZDWDM', header: 'SZ单位', editor:"comboBox", loaddata: function(value, optgroup) {
    	setTimeout(() => {
    		var option = new Option("val", "val");
			optgroup.appendChild(option);
    	},500)
    }},
    { name: 'CZRQ', header: '操作日期', editor:"textfield" },
    { name: 'WID', header: 'WID', editor:"textfield" },
    { name: 'ZZMMDM', header: '政治面貌', editor:"comboBox", loaddata: function(value, optgroup) {
    	var option = new Option("val", "val");
		optgroup.appendChild(option);
    }}
]