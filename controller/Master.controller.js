sap.ui.define(["./BaseController", "sap/ui/model/json/JSONModel", "sap/ui/core/routing/History", "sap/ui/model/Filter",
	"sap/ui/model/Sorter", "sap/ui/model/FilterOperator", "sap/m/GroupHeaderListItem", "sap/ui/Device", "sap/ui/core/Fragment",
	"../model/formatter"
], function (e, t, i, r, s, a, o, n, l, u) {
	"use strict";
	return e.extend("prodea.ui.Z_MMASRAF01.controller.Master", {
		formatter: u,
		onInit: function () {
			var e = this.byId("list"),
				t = this._createViewModel(),
				i = e.getBusyIndicatorDelay();
			this._oGroupFunctions = {
				// Wrbtr: function (e) {
				UpbTutar: function (e) {
					var t = e.getProperty("UpbTutar"),
					// var t = e.getProperty("Wrbtr"),
						i, r;
					if (t <= 20) {
						i = "LE20";
						r = this.getResourceBundle().getText("masterGroup1Header1")
					} else {
						i = "GT20";
						r = this.getResourceBundle().getText("masterGroup1Header2")
					}
					return {
						key: i,
						text: r
					}
				}.bind(this)
			};
			this._oList = e;
			this._oListFilterState = {
				aFilter: [],
				aSearch: []
			};
			this.setModel(t, "masterView");
			e.attachEventOnce("updateFinished", function () {
				t.setProperty("/delay", i)
			});
			this.getView().addEventDelegate({
				onBeforeFirstShow: function () {
					this.getOwnerComponent().oListSelector.setBoundMasterList(e)
				}.bind(this)
			});
			this.getRouter().getRoute("master").attachPatternMatched(this._onMasterMatched, this);
			this.getRouter().attachBypassed(this.onBypassed, this)
		},
		onUpdateFinished: function (e) {
			this._updateListItemCount(e.getParameter("total"))
		},
		onSearch: function (e) {
			if (e.getParameters().refreshButtonPressed) {
				this.onRefresh();
				return
			}
			var t = e.getParameter("query");
			if (t) {
				this._oListFilterState.aSearch = [new r("Monat", a.EQ, t)]
			} else {
				this._oListFilterState.aSearch = []
			}
			this._applyFilterSearch()
		},
		onRefresh: function () {
			this._oList.getBinding("items").refresh()
		},
		onOpenViewSettings: function (e) {
			var t = "filter";
			if (e.getSource() instanceof sap.m.Button) {
				var i = e.getSource().getId();
				if (i.match("sort")) {
					t = "sort"
				} else if (i.match("group")) {
					t = "group"
				}
			}
			if (!this.byId("viewSettingsDialog")) {
				l.load({
					id: this.getView().getId(),
					name: "prodea.ui.Z_MMASRAF01.view.ViewSettingsDialog",
					controller: this
				}).then(function (e) {
					this.getView().addDependent(e);
					e.addStyleClass(this.getOwnerComponent().getContentDensityClass());
					e.open(t)
				}.bind(this))
			} else {
				this.byId("viewSettingsDialog").open(t)
			}
		},
		onConfirmViewSettingsDialog: function (e) {
			var t = e.getParameters().filterItems,
				i = [],
				s = [];
			t.forEach(function (e) {
				switch (e.getKey()) {
				case "W":
					i.push(new r("Statu", a.EQ, "W"));
					break;
				case "A":
					i.push(new r("Statu", a.EQ, "A"));
					break;
				case "R":
					i.push(new r("Statu", a.EQ, "R"));
					break;
				case "U":
					i.push(new r("Statu", a.EQ, "U"));
					break;
				default:
					break
				}
				s.push(e.getText())
			});
			this._oListFilterState.aFilter = i;
			this._updateFilterBar(s.join(", "));
			this._applyFilterSearch()
		},
		_applySortGroup: function (e) {
			var t = e.getParameters(),
				i, r, a = [];
			if (t.groupItem) {
				i = t.groupItem.getKey();
				r = t.groupDescending;
				var o = this._oGroupFunctions[i];
				a.push(new s(i, r, o))
			}
			i = t.sortItem.getKey();
			r = t.sortDescending;
			a.push(new s(i, r));
			this._oList.getBinding("items").sort(a)
		},
		onSelectionChange: function (e) {
			var t = e.getSource(),
				i = e.getParameter("selected");
			if (!(t.getMode() === "MultiSelect" && !i)) {
				this._showDetail(e.getParameter("listItem") || e.getSource())
			}
		},
		onBypassed: function () {
			this._oList.removeSelections(true)
		},
		createGroupHeader: function (e) {
			return new o({
				title: e.text,
				upperCase: false
			})
		},
		onNavBack: function () {
			var e = i.getInstance().getPreviousHash(),
				t = sap.ushell.Container.getService("CrossApplicationNavigation");
			if (e !== undefined || !t.isInitialNavigation()) {
				history.go(-1)
			} else {
				t.toExternal({
					target: {
						shellHash: "#Shell-home"
					}
				})
			}
		},
		_createViewModel: function () {
			return new t({
				isFilterBarVisible: false,
				filterBarLabel: "",
				delay: 0,
				title: this.getResourceBundle().getText("masterTitleCount", [0]),
				noDataText: this.getResourceBundle().getText("masterListNoDataText"),
				sortBy: "Expno",
				groupBy: "None"
			})
		},
		_onMasterMatched: function () {
			this.getModel("appView").setProperty("/layout", "OneColumn")
		},
		_showDetail: function (e) {
			var t = !n.system.phone;
			this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
			this.getRouter().navTo("object", {
				objectId: e.getBindingContext().getProperty("Expno")
			}, t)
		},
		_updateListItemCount: function (e) {
			var t;
			if (this._oList.getBinding("items").isLengthFinal()) {
				t = this.getResourceBundle().getText("masterTitleCount", [e]);
				this.getModel("masterView").setProperty("/title", t)
			}
		},
		_applyFilterSearch: function () {
			var e = this._oListFilterState.aSearch.concat(this._oListFilterState.aFilter),
				t = this.getModel("masterView");
			this._oList.getBinding("items").filter(e, "Application");
			if (e.length !== 0) {
				t.setProperty("/noDataText", this.getResourceBundle().getText("masterListNoDataWithFilterOrSearchText"))
			} else if (this._oListFilterState.aSearch.length > 0) {
				t.setProperty("/noDataText", this.getResourceBundle().getText("masterListNoDataText"))
			}
		},
		_updateFilterBar: function (e) {
			var t = this.getModel("masterView");
			t.setProperty("/isFilterBarVisible", this._oListFilterState.aFilter.length > 0);
			t.setProperty("/filterBarLabel", this.getResourceBundle().getText("masterFilterBarText", [e]))
		}
	})
});