sap.ui.define(["sap/ui/model/json/JSONModel", "sap/ui/Device", "sap/base/util/ObjectPath"], function (e, n, t) {
	"use strict";
	return {
		createDeviceModel: function () {
			var t = new e(n);
			t.setDefaultBindingMode("OneWay");
			return t
		},
		createFLPModel: function () {
			var n = t.get("sap.ushell.Container.getUser"),
				a = n ? n().isJamActive() : false,
				i = new e({
					isShareInJamActive: a
				});
			i.setDefaultBindingMode("OneWay");
			return i
		}
	}
});