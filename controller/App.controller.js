sap.ui.define(["./BaseController", "sap/ui/model/json/JSONModel"], function (e, t) {
	"use strict";
	return e.extend("prodea.ui.Z_MMASRAF01.controller.App", {
		onInit: function () {
			var e, n, o = this.getView().getBusyIndicatorDelay();
			e = new t({
				busy: true,
				delay: 0,
				layout: "OneColumn",
				previousLayout: "",
				actionButtonsInfo: {
					midColumn: {
						fullScreen: false
					}
				}
			});
			this.setModel(e, "appView");
			n = function () {
				e.setProperty("/busy", false);
				e.setProperty("/delay", o)
			};
			this.getOwnerComponent().getModel().metadataLoaded().then(n);
			this.getOwnerComponent().getModel().attachMetadataFailed(n);
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass())
		}
	})
});