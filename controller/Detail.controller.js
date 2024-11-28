sap.ui.define([
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"../model/formatter",
	"sap/m/library",
	"sap/ui/core/format/NumberFormat",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/Sorter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast",
	"sap/m/MessagePopover",
	"sap/m/MessagePopoverItem",
	"sap/ui/Device"
], function (BaseController, JSONModel, formatter, mobileLibrary, NumberFormat, MessageBox, Filter, Sorter, FilterOperator, MessageToast,
	MessagePopover, MessagePopoverItem, Device) {
	"use strict";

	var URLHelper = mobileLibrary.URLHelper;
	var tableData = [];
	var tableData2 = [];
	var oView;
	var secilenOnayci;
	var Doc = "";
	var selectedIndex = "";
	var selectedItem = "";
	return BaseController.extend("prodea.ui.Z_MMASRAF01.controller.Detail", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		onInit: function () {

			oView = this.getView();
			var oViewModel = new JSONModel({
				busy: false,
				delay: 0,
				header: {
					Tarih: new Date(),
					Expcode: "",
					Wrbtr: "0.00",
					Waers: "",
					Departman: "",
					Aciklama: "",
					FisNo: "",
					FirmaAdi: "",
					UpbTutar: "0.00"
				}
			});

			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

			this.setModel(oViewModel, "detailView");

			this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
		},

		onSendEmailPress: function () {
			var oViewModel = this.getModel("detailView");

			URLHelper.triggerEmail(
				null,
				oViewModel.getProperty("/shareSendEmailSubject"),
				oViewModel.getProperty("/shareSendEmailMessage")
			);
		},

		onShareInJamPress: function () {
			var oViewModel = this.getModel("detailView"),
				oShareDialog = sap.ui.getCore().createComponent({
					name: "sap.collaboration.components.fiori.sharing.dialog",
					settings: {
						object: {
							id: location.href,
							share: oViewModel.getProperty("/shareOnJamTitle")
						}
					}
				});

			oShareDialog.open();
		},

		_onObjectMatched: function (oEvent) {
			var sObjectId = oEvent.getParameter("arguments").objectId;
			this.Expno = sObjectId;
			this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
			this.getModel().metadataLoaded().then(function () {
				var sObjectPath = this.getModel().createKey("MasterSet", {
					Expno: sObjectId
				});
				this._bindView("/" + sObjectPath);
			}.bind(this));

			this.getDocumentDetail(sObjectId);
		},

		getDocumentDetail: function (Expno, Itemno, Gjahr) {
			sap.ui.core.BusyIndicator.show();
			var that = this;
			var oDataModel = this.getOwnerComponent().getModel();
			var filters = [];
			var sFilter = new sap.ui.model.Filter("Expno", sap.ui.model.FilterOperator.EQ, Expno);
			// var sFilter = new sap.ui.model.Filter("Itemno", sap.ui.model.FilterOperator.EQ, Itemno);
			// var sFilter = new sap.ui.model.Filter("Gjahr", sap.ui.model.FilterOperator.EQ, Gjahr);
			filters.push(sFilter);
			debugger;
			oDataModel.read("/DetailSet", {
				success: mySuccessHandler,
				filters: filters,
				error: myErrorHandler
			});

			function mySuccessHandler(data, response) {
				if (data.results.length > 0) {
					that.byId("onayaGonder").setVisible(true);
				} else {
					that.byId("onayaGonder").setVisible(false);
				}
				tableData = data.results;
				that.getDocumentGecmis(that.Expno);

				sap.ui.core.BusyIndicator.hide();
			}

			function myErrorHandler(response) {
				sap.m.MessageBox.error("Bir hata oluştu. Lütfen sistem yöneticinizle iletişime geçiniz.");
				sap.ui.core.BusyIndicator.hide();
			}
		},

		getDocumentGecmis: function (Expno) {
			sap.ui.core.BusyIndicator.show();
			var that = this;
			var oDataModel = this.getOwnerComponent().getModel();
			var filters = [];
			var sFilter = new sap.ui.model.Filter("IvExpno", sap.ui.model.FilterOperator.EQ, Expno);
			filters.push(sFilter);

			oDataModel.read("/GecmisSet", {
				success: mySuccessHandler,
				filters: filters,
				error: myErrorHandler
			});

			function mySuccessHandler(data, response) {
				tableData2 = data.results;

				var oViewModel = new JSONModel({
					tableData: tableData,
					tableData2: tableData2
				});

				oView.setModel(oViewModel, "docDetailModel");
				sap.ui.core.BusyIndicator.hide();
			}

			function myErrorHandler(response) {
				sap.m.MessageBox.error("Bir hata oluştu. Lütfen sistem yöneticinizle iletişime geçiniz.");
				sap.ui.core.BusyIndicator.hide();
			}
		},

		onShowAciklama: function (oEvent) {

			this.getModel("detailView").setProperty("/Aciklama", oEvent.getSource().getBindingContext("docDetailModel").getObject().Aciklama);

			if (!this.aciklamaFrag) {
				this.aciklamaFrag = sap.ui.xmlfragment("prodea.ui.Z_MMASRAF01.fragment.Aciklama", this);
				this.aciklamaFrag.addStyleClass(this.getOwnerComponent().getContentDensityClass());
				this.getView().addDependent(this.aciklamaFrag);
			}

			this.aciklamaFrag.open();

		},
		onShowRedNedeni: function (oEvent) {

			this.getModel("detailView").setProperty("/RedNedeni", oEvent.getSource().getBindingContext("docDetailModel").getObject().RedNedeni);

			if (!this.redNedeniFrag) {
				this.redNedeniFrag = sap.ui.xmlfragment("prodea.ui.Z_MMASRAF01.fragment.RedNedeni", this);
				this.redNedeniFrag.addStyleClass(this.getOwnerComponent().getContentDensityClass());
				this.getView().addDependent(this.redNedeniFrag);
			}

			this.redNedeniFrag.open();

		},

		onPressAddSatir: function (oEvent) {
			if (!this.createFrag) {
				this.createFrag = sap.ui.xmlfragment("prodea.ui.Z_MMASRAF01.fragment.MasrafEkle", this);
				this.createFrag.addStyleClass(this.getOwnerComponent().getContentDensityClass());
				this.getView().addDependent(this.createFrag);
			}

			this.createFrag.open();
		},
		onCloseCreate: function () {
			this.createFrag.close();
		},
		onCloseDialogRedNedeni: function () {
			this.redNedeniFrag.close();
		},
		onCloseDialogAckl: function () {
			this.aciklamaFrag.close();
		},
		onDeleteItem: function (oEvent) {
			// if ((oEvent.getParameter("listItem").getBindingContext("docDetailModel").getObject().Statu == 'A')) {
			// var Expno = oEvent.getParameter("listItem").getBindingContext("docDetailModel").getObject().Expno;
			// var sPath = "/DetailSet(Expno='" + oEvent.getParameter("listItem").getBindingContext("docDetailModel").getObject().Expno +
			// 	"',Itemno='" +
			// 	oEvent.getParameter("listItem").getBindingContext("docDetailModel").getObject().Itemno + "')",
			// 	oModel = this.getView().getModel(),
			// 	that = this,
			// 	msgSuccessTxt = this.getResourceBundle().getText("msgDelTxt");
			var index = oEvent.oSource.oPropagatedProperties.oBindingContexts.docDetailModel.sPath.slice(11);
			if ((oEvent.oSource.getModel("docDetailModel").getData("tableData").tableData[index].Statu == 'A')) {
				var Expno = oEvent.oSource.getModel("docDetailModel").getData("tableData").tableData[index].Expno;
				var Itemno = oEvent.oSource.getModel("docDetailModel").getData("tableData").tableData[index].Itemno;
				var Gjahr = oEvent.oSource.getModel("docDetailModel").getData("tableData").tableData[index].Gjahr;
				// var sPath = "/DetailSet(Expno='" + oEvent.oSource.getModel("docDetailModel").getData("tableData").tableData[index].Expno +"',Itemno='" + oEvent.oSource.getModel("docDetailModel").getData("tableData").tableData[index].Itemno + "' ,Gjahr='" +
				// 	oEvent.oSource.getModel("docDetailModel").getData("tableData").tableData[index].Gjahr + "')";

				var sPath = "/DetailSet(Expno='" + oEvent.oSource.getModel("docDetailModel").getData("tableData").tableData[index].Expno +
					"',Itemno='" + oEvent.oSource.getModel("docDetailModel").getData("tableData").tableData[index].Itemno +
					"',Gjahr='" + oEvent.oSource.getModel("docDetailModel").getData("tableData").tableData[index].Gjahr + "')";
				var oModel = this.getView().getModel();
				var that = this;
				var msgSuccessTxt = this.getResourceBundle().getText("msgDelTxt");
				MessageBox.warning(
					msgSuccessTxt, {
						id: "warningMessage",
						actions: ["Evet", MessageBox.Action.CANCEL],
						onClose: function (evt) {
							if (evt === "Evet") {
								sap.ui.core.BusyIndicator.show(0);
								oModel.remove(sPath, {
									success: function () {
										that.getDocumentDetail(Expno, Itemno, Gjahr);
										that.masterRefresh();
										sap.ui.core.BusyIndicator.hide();
									},
									error: function () {
										that.getModel().refresh();
										sap.ui.core.BusyIndicator.hide();
									}
								});
							}
						}
					}
				);
			} else {
				sap.m.MessageBox.warning("Sadece uygun statüsündeki kayıtlar silinebilir!");
			}
		},
		formatDate2: function (e) {
			function t(e) {
				return (e < 10 ? "0" : "") + e
			}
			return e.getFullYear() + "." + t(e.getMonth() + 1) + "." + t(e.getDate())
		},
		onSendData: function () {
			debugger;
			var oMessageManager = sap.ui.getCore().getMessageManager();
			oMessageManager.removeAllMessages();

			debugger;
			var Tarih = sap.ui.getCore().byId("idTarih").getValue();
			if (Tarih === '' || Tarih === null) {
				MessageBox.alert("Tarih zorunludur!");
				return;
			}
			var fisTarihi = sap.ui.getCore().byId("idFisTarih").getValue();
			if (fisTarihi === '' || fisTarihi === null) {
				MessageBox.alert("Fiş Tarihi zorunludur!");
				return;
			}
			var FisNo = sap.ui.getCore().byId("idFisNo").getValue();
			if (FisNo === '' || FisNo === null) {
				MessageBox.alert("Fiş No zorunludur!");
				return;
			}
			var FirmaAdi = sap.ui.getCore().byId("idFirmaAdi").getValue();
			if (FirmaAdi === '' || FirmaAdi === null) {
				MessageBox.alert("Firma Adı zorunludur!");
				return;
			}
			var MasrafTuru = sap.ui.getCore().byId("idMasrafTuru").getValue();
			if (MasrafTuru === '' || MasrafTuru === null) {
				MessageBox.alert("Masraf Türü zorunludur!");
				return;
			}
			var OdemeSekli = sap.ui.getCore().byId("idOdemeSekli").getSelectedKey();
			if (OdemeSekli === '' || waers === null) {
				MessageBox.alert("Ödeme şekli zorunludur!");
				return;
			}
			// var Tutar = sap.ui.getCore().byId("idTutar").getSelectedKey();
			// if (Tutar === '' || Tutar === null) {
			// 	MessageBox.alert("Tutar zorunludur!");
			// 	return;
			// }
			var waers = sap.ui.getCore().byId("idParaBirimi").getSelectedKey();
			if (waers === '' || waers === null) {
				MessageBox.alert("Para Birimi zorunludur!");
				return;
			}
			var Note = sap.ui.getCore().byId("idNote").getValue();
			if (Note === '' || Note === null) {
				MessageBox.alert("Açıklama zorunludur!");
				return;
			}
			var that = this;
			var data = this.getModel("detailView").getProperty("/header");
			if (data.Wrbtr === '' || data.Wrbtr === null || data.Wrbtr === '0.00') {
				MessageBox.alert("Tutar zorunludur!");
				return;
			}
			var oUploadCollection = sap.ui.getCore().byId("fragUpload");
			if (!oUploadCollection.getItems().length) {
				MessageBox.alert("Doküman girişi zorunludur!");
				return;
			}

			// data.Tarih.setHours(3, 0, 0);
			// var oOriginalDate = new Date(formatter.setLocalTimeZoneZone(formatter.getOriginalDateTime(new Date(data.Tarih))));
			// var Datum = this.formatDate2(data.Tarih);
			// var FisTarihi = this.formatDate2(data.FisTarihi);
			var oModel = this.getView().getModel();

			var departman = sap.ui.getCore().byId("idDepartman").getSelectedKey();

			var obj = {
				Expno: this.Expno,
				Aciklama: data.Aciklama.toUpperCase(),
				// Itemno: "",
				Itemno: data.Itemno,
				// Gjahr: data.Gjahr,
				Wrbtr: data.Wrbtr,
				Waers: waers,
				UpbTutar: data.UpbTutar,
				// Waers: "AZN",
				Departman: departman,
				Expcode: data.Expcode,
				// Datum: Datum,
				Datum: data.Tarih,
				FisNo: data.FisNo,
				FirmaAdi: data.FirmaAdi,
				Statu: "A",
				// FisTarihi: FisTarihi,
				FisTarihi: data.FisTarihi,
				// FisTarihi: data.FisTarihi.toLocaleDateString(),
				OdemeSekli: data.OdemeSekli
			};

			var msgSuccessTxt = this.getResourceBundle().getText("msgCreateTxt");
			MessageBox.warning(
				msgSuccessTxt, {
					id: "warningMessage",
					actions: ["Evet", MessageBox.Action.CANCEL],
					onClose: function (evt) {
						if (evt === "Evet") {
							sap.ui.core.BusyIndicator.show(0);
							oModel.create("/DetailSet", obj, {
								success: function (resp) {
									debugger;
									var url = "/sap/opu/odata/sap/ZFI_015_SRV/FileUploadDocSet(Expno='" + resp.Expno + "',Itemno='" + resp.Itemno +
										"',Gjahr='" + resp.Gjahr +
										"')/UPLOADNP";
									/*that.oUploadCollection.setUploadUrl(url);*/

									that.Expno = resp.Expno;
									that.Itemno = resp.Itemno;
									that.Gjahr = resp.Gjahr;
									// var oUploadCollection = sap.ui.getCore().byId("fragUpload");
									for (var i = 0; i < that.oUploadCollection._aFileUploadersForPendingUpload.length; i++) {
										// for (var i = 0; i < oUploadCollection._aFileUploadersForPendingUpload.length; i++) {
										that.oUploadCollection._aFileUploadersForPendingUpload[i].setUploadUrl(url);
									}
									that.oUploadCollection.upload();

									that.getModel().refresh();

									var header = {
										Tarih: new Date(),
										Expcode: "",
										Wrbtr: "0.00",
										Waers: "",
										Departman: "",
										Aciklama: "",
										UpbTutar: "0.00"
									};
									debugger;
									that.getModel("detailView").setProperty("/header", header);
									that.createFrag.close();
									that.getDocumentDetail(that.Expno, that.Itemno, that.Gjahr);
									that.masterRefresh();
									sap.ui.core.BusyIndicator.hide();
								},
								error: function (resp) {
									that.createFrag.close();
									try {
										debugger;
										var messageResp = JSON.parse(resp.responseText);
										MessageToast.show(messageResp.error.message.value);
										var oMessageProcessor = new sap.ui.core.message.ControlMessageProcessor();
										oMessageManager.removeAllMessages();
										oMessageManager.addMessages(
											new sap.ui.core.message.Message({
												message: messageResp.error.message.value,
												type: sap.ui.core.MessageType.Error,
												processor: oMessageProcessor
											})
										);
									} catch {
										debugger;
										MessageToast.show(resp.responseText);
										var oMessageProcessor = new sap.ui.core.message.ControlMessageProcessor();
										oMessageManager.removeAllMessages();
										oMessageManager.addMessages(
											new sap.ui.core.message.Message({
												message: resp.responseText,
												type: sap.ui.core.MessageType.Error,
												processor: oMessageProcessor
											})
										);
									}

									// var messageResp = JSON.parse(resp.responseText);
									// MessageToast.show(messageResp.error.message.value);
									// var oMessageProcessor = new sap.ui.core.message.ControlMessageProcessor();
									// oMessageManager.removeAllMessages();
									// oMessageManager.addMessages(
									// 	new sap.ui.core.message.Message({
									// 		message: messageResp.error.message.value,
									// 		type: sap.ui.core.MessageType.Error,
									// 		processor: oMessageProcessor
									// 	})
									// );
									sap.ui.core.BusyIndicator.hide();

								}
							});
						}
					}
				}
			);
		},

		onDown: function () {
			debugger;
			sap.m.URLHelper.redirect(this.getModel().sServiceUrl + "/DocDownloadSet(Expno='" + this.Expno + "',Itemno='" + "000" + "',Docid='" +
				"00" + "',Gjahr='" + this.getView().getBindingContext().getObject().Gjahr + "')/$value", true);
		},

		onUp: function () {
			if (!this.MasrafFormuFrag) {
				this.MasrafFormuFrag = sap.ui.xmlfragment("prodea.ui.Z_MMASRAF01.fragment.MasrafFormUpload", this);
				this.MasrafFormuFrag.addStyleClass(this.getOwnerComponent().getContentDensityClass());
				this.getView().addDependent(this.MasrafFormuFrag);
			}
			this.MasrafFormuFrag.open();
		},
		onCloseDocDialogMasrafFormu: function () {
			this.MasrafFormuFrag.close();
		},
		onChange1: function (e) {
			var t = e.getSource();
			var i = this.getView().getModel().oHeaders["x-csrf-token"];
			var s = new sap.m.UploadCollectionParameter({
				name: "x-csrf-token",
				value: i
			});
			t.addHeaderParameter(s);
			var a = "/sap/opu/odata/sap/ZFI_015_SRV/FileUploadDocSet(Expno='" + this.getView().getBindingContext().getObject().Expno +
				"',Itemno='" + "000" + "')/UPLOADNP";
			t.setUploadUrl(a);
		},
		onBeforeUploadStarts1: function (e) {
			var t = this.slugify(e.getParameter("fileName"));
			var i = new sap.ui.unified.FileUploaderParameter({
				name: "slug",
				value: t
			});
			e.getParameters().addHeaderParameter(i);
			e.getParameters().addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
				name: "X-Requested-With",
				value: "XMLHttpRequest"
			}));
		},
		onUploadComplete1: function (e) {

			var t = sap.ui.getCore().getMessageManager(),
				i = new sap.ui.core.message.ControlMessageProcessor;

			//Status 201 kontrol et

			/*t.addMessages(new sap.ui.core.message.Message({
			  message: this.getResourceBundle().getText("UPLSUCCESS"),
			  type: sap.ui.core.MessageType.Success,
			  processor: i
			}));

			this.MasrafFormuFrag.close();*/

			var parseXml;
			if (window.DOMParser) {
				parseXml = function (xmlStr) {
					return (new window.DOMParser()).parseFromString(xmlStr, "text/xml");
				};
			} else if (typeof window.ActiveXObject != "undefined" && new window.ActiveXObject("Microsoft.XMLDOM")) {
				parseXml = function (xmlStr) {
					var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
					xmlDoc.async = "false";
					xmlDoc.loadXML(xmlStr);
					return xmlDoc;
				};
			} else {
				parseXml = function () {
					return null;
				};
			}
			var xmlDoc = parseXml(e.getParameter("mParameters").responseRaw);

			function xmlToJson(xml) {
				// Create the return object
				var obj = {};
				// console.log(xml.nodeType, xml.nodeName );
				if (xml.nodeType == 1) { // element
					// do attributes
					if (xml.attributes.length > 0) {
						obj["@attributes"] = {};
						for (var j = 0; j < xml.attributes.length; j++) {
							var attribute = xml.attributes.item(j);
							obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
						}
					}
				} else if (xml.nodeType == 3 ||
					xml.nodeType == 4) { // text and cdata section
					obj = xml.nodeValue;
				}
				// do children
				if (xml.hasChildNodes()) {
					for (var i = 0; i < xml.childNodes.length; i++) {
						var item = xml.childNodes.item(i);
						var nodeName = item.nodeName;
						if (typeof (obj[nodeName]) == "undefined") {
							obj[nodeName] = xmlToJson(item);
						} else {
							if (typeof (obj[nodeName].length) == "undefined") {
								var old = obj[nodeName];
								obj[nodeName] = [];
								obj[nodeName].push(old);
							}
							if (typeof (obj[nodeName]) === 'object') {
								obj[nodeName].push(xmlToJson(item));
							}
						}
					}
				}
				return obj;
			}
			var theJson = xmlToJson(xmlDoc);
			/*var msgDet = theJson.error.innererror.errordetails.errordetail.message["#text"];*/
			var msgDet = theJson.error.message["#text"];
			/*var bapiretArr = [];
			for (var i = 0; i < msgDet.length; i++) {
			  var txt = theJson.error.innererror.errordetails.errordetail[i].message["#text"];
			  if (theJson.error.innererror.errordetails.errordetail[i].severity["#text"] === "error") {
			    var type = "E";
			  }
			  var bapiretObj = {};
			  bapiretObj.Message = txt;
			  bapiretObj.Type = type;
			  bapiretArr.push(bapiretObj);
			}
			if (bapiretArr.length) {
			  //Hataları yazdır
			} else {
			  //Hata yok ise
			}*/

			this.MasrafFormuFrag.close();

			// o.information(msgDet);
			MessageToast.show(msgDet);
			if (msgDet != "Günde iki kere döküman yükleme yapılamaz!") {
				Doc = "X";
			}

			this.setDocButtons();

			/*t.addMessages(new sap.ui.core.message.Message({
			  message: msg,
			  type: sap.ui.core.MessageType.Information,
			  processor: i
			}));*/

		},

		setDocButtons: function () {
			if (Doc == "X") {
				this.byId("idFormDownBtn").setVisible(true);
				this.byId("idFormUpBtn").setVisible(true);
			} else {
				this.byId("idFormDownBtn").setVisible(true);
				this.byId("idFormUpBtn").setVisible(true);
			}

			if ((this.byId("idStatuAttr").getTitle() == "D") || (this.byId("idStatuAttr").getTitle() == "C") || (this.byId("idStatuAttr").getTitle() ==
					"F") || (this.byId("idStatuAttr").getTitle() == "B")) {
				// this.byId("idFormDownBtn").setVisible(false);
				this.byId("idFormUpBtn").setVisible(false);
				this.byId("onayaGonder").setVisible(false);
			} else {
				this.byId("onayaGonder").setVisible(true);
			}

		},

		onApp: function (oEvent) {
			// if (Doc == "X") {
			// sap.ui.core.BusyIndicator.show();
			secilenOnayci = "";
			var that = this;
			var oDataModel = this.getOwnerComponent().getModel();
			selectedIndex = "";
			selectedItem = "";
			debugger;
			if (this.getView().byId("lineItemsList").getSelectedItems().length === 0) {
				// MessageBox.alert("Satır Seçiniz");
				MessageToast.show(that.getOwnerComponent().getModel("i18n").getResourceBundle().getText("selectLine"));
				return;
			}
			debugger;

			// selectedIndex = this.getView().byId("lineItemsList").getSelectedItem().sId.slice(63);
			selectedIndex = this.getView().byId("lineItemsList").getSelectedContexts()[0].sPath.slice(11);
			selectedItem = oEvent.oSource.getModel("docDetailModel").getData("tableData").tableData[selectedIndex];
			if (selectedItem.Statu === 'A') {} else {
				// MessageBox.alert("Satır Seçiniz");
				MessageToast.show(that.getOwnerComponent().getModel("i18n").getResourceBundle().getText("wrongStatu"));
				return;
			}
			sap.ui.core.BusyIndicator.show();
			if (!this.onayciFrag) {
				this.onayciFrag = sap.ui.xmlfragment("prodea.ui.Z_MMASRAF01.fragment.Onayci", this);
				this.onayciFrag.addStyleClass(this.getOwnerComponent().getContentDensityClass());
				this.getView().addDependent(this.onayciFrag);
			}

			oDataModel.read("/OnaycilarSet", {
				success: mySuccessHandler,
				error: myErrorHandler
			});

			function mySuccessHandler(data, response) {
				if (data.results.length > 1) {
					that.onayciFrag.open();
					var Onaycilar = data.results;
					var oViewModel = new JSONModel({
						Onaycilar: Onaycilar
					});

					oView.setModel(oViewModel, "onayDialogModel");
				} else {
					debugger;
					secilenOnayci = data.results[0].PernrOnay;
					that.onChooseOnayci(oEvent);
				}
				sap.ui.core.BusyIndicator.hide();
			}

			function myErrorHandler(response) {
				sap.m.MessageBox.error("Bir hata oluştu. Lütfen sistem yöneticinizle iletişime geçiniz.");
				sap.ui.core.BusyIndicator.hide();
			}
			// } else {
			// 	sap.m.MessageBox.warning("Masraf formu yüklemeden onay verilemez.");
			// }

		},

		onOnayciSelection: function (oEvent) {
			secilenOnayci = oEvent.getParameter("listItem").getBindingContext("onayDialogModel").getProperty("PernrOnay");
		},

		onChooseOnayci: function (oEvent) {
			debugger;
			sap.ui.core.BusyIndicator.show();
			var that = this;
			var oDataModel = this.getOwnerComponent().getModel();
			var filters = [];
			filters.push(new sap.ui.model.Filter("IExpno", sap.ui.model.FilterOperator.EQ, this.Expno));
			filters.push(new sap.ui.model.Filter("IUname", sap.ui.model.FilterOperator.EQ, secilenOnayci));
			filters.push(new sap.ui.model.Filter("IRed", sap.ui.model.FilterOperator.EQ, ""));
			filters.push(new sap.ui.model.Filter("IStatu", sap.ui.model.FilterOperator.EQ, "D"));
			filters.push(new sap.ui.model.Filter("IItemNo", sap.ui.model.FilterOperator.EQ, selectedItem.Itemno));
			filters.push(new sap.ui.model.Filter("Gjahr", sap.ui.model.FilterOperator.EQ, selectedItem.Gjahr));

			oDataModel.read("/OnayaGonderSet", {
				success: mySuccessHandler,
				filters: filters,
				error: myErrorHandler
			});

			function mySuccessHandler(data, response) {
				if (data.results.length == 0) {
					sap.ui.core.BusyIndicator.hide();
					sap.m.MessageBox.success("Kayıt başarıyla bir şekilde onaya gönderilmiştir.");
					that.getDocumentDetail(that.Expno, that.Itemno, that.Gjahr);
					that.masterRefresh();
				} else {
					sap.m.MessageBox.warning(data.results[0].Message);
					sap.ui.core.BusyIndicator.hide();
				}
				that.onCloseDialogOnayci();
			}

			function myErrorHandler(response) {
				sap.m.MessageBox.error("Bir hata oluştu. Lütfen sistem yöneticinizle iletişime geçiniz.");
				sap.ui.core.BusyIndicator.hide();
			}

		},

		onCloseDialogOnayci: function () {
			this.onayciFrag.close();
		},

		onShowDoc: function (oEvent) {
			debugger;
			var url = this.getModel().sServiceUrl,
				// ExpnoStr = "/DocDownloadSet(Expno='",
				ExpnoStr = "/DocDownloadSMSet(Expno='",
				ItemnoStr = "',Itemno='",
				GjahrStr = "',Gjahr='",
				DatumStr = "',Datum='",
				DocidStr = "',Docid='",
				value = "')/$value";
			this.getModel("detailView").setProperty("/url", url);

			this.getModel("detailView").setProperty("/ExpnoStr", ExpnoStr);
			this.getModel("detailView").setProperty("/ItemnoStr", ItemnoStr);
			this.getModel("detailView").setProperty("/GjahrStr", GjahrStr);
			this.getModel("detailView").setProperty("/DatumStr", DatumStr);
			this.getModel("detailView").setProperty("/DocidStr", DocidStr);
			this.getModel("detailView").setProperty("/value", value);
			sap.ui.core.BusyIndicator.show(0);

			if (!this.DocListFrag) {
				this.DocListFrag = sap.ui.xmlfragment("prodea.ui.Z_MMASRAF01.fragment.DocList", this);
				this.DocListFrag.addStyleClass(this.getOwnerComponent().getContentDensityClass());
				this.getView().addDependent(this.DocListFrag);
			}

			/*  Expno
			  Itemno*/

			var filter = [];
			filter.push(new Filter("Expno", FilterOperator.EQ, oEvent.getSource().getBindingContext("docDetailModel").getObject().Expno));
			filter.push(new Filter("Itemno", FilterOperator.EQ, oEvent.getSource().getBindingContext("docDetailModel").getObject().Itemno));
			filter.push(new Filter("Gjahr", FilterOperator.EQ, oEvent.getSource().getBindingContext("docDetailModel").getObject().Gjahr));
			filter.push(new Filter("Datum", FilterOperator.EQ, oEvent.getSource().getBindingContext("docDetailModel").getObject().Datum));

			this.Expno = oEvent.getSource().getBindingContext("docDetailModel").getObject().Expno;
			this.Itemno = oEvent.getSource().getBindingContext("docDetailModel").getObject().Itemno;
			this.Gjahr = oEvent.getSource().getBindingContext("docDetailModel").getObject().Gjahr;
			this.Datum = oEvent.getSource().getBindingContext("docDetailModel").getObject().Datum;
			var that = this;
			var oModel = this.getView().getModel();
			oModel.read("/DocListSMSet", {
				filters: filter,
				success: function (resp) {
					that.getModel("detailView").setProperty("/DocListItems", resp.results);
					that.DocListFrag.open();
					sap.ui.core.BusyIndicator.hide();
				},
				error: function () {
					sap.ui.core.BusyIndicator.hide();
				}
			});

		},
		onDownMasrafForm: function (oEvent) {
			debugger;
			var index = oEvent.oSource.oPropagatedProperties.oBindingContexts.docDetailModel.sPath.slice(11);
			var item = oEvent.oSource.getModel("docDetailModel").getData("tableData").tableData[index];
			var that = this;
			var oModel = this.getView().getModel();
			if (item.Statu === 'I') {} else {
				MessageToast.show(that.getOwnerComponent().getModel("i18n").getResourceBundle().getText("wrongStatu4MasrafForm"));
				return;
			}

			var url = this.getModel().sServiceUrl,
				ExpnoStr = "/DocDownloadSet(Expno='",
				ItemnoStr = "',Itemno='",
				GjahrStr = "',Gjahr='",
				DocidStr = "',Docid='",
				value = "')/$value";
			this.getModel("detailView").setProperty("/url", url);
			this.getModel("detailView").setProperty("/ExpnoStr", ExpnoStr);
			this.getModel("detailView").setProperty("/ItemnoStr", ItemnoStr);
			this.getModel("detailView").setProperty("/GjahrStr", GjahrStr);
			this.getModel("detailView").setProperty("/DocidStr", DocidStr);
			this.getModel("detailView").setProperty("/value", value);
			sap.ui.core.BusyIndicator.show(0);

			if (!this.MasrafFormDownFrag) {
				this.MasrafFormDownFrag = sap.ui.xmlfragment("prodea.ui.Z_MMASRAF01.fragment.MasrafFormDown", this);
				this.MasrafFormDownFrag.addStyleClass(this.getOwnerComponent().getContentDensityClass());
				this.getView().addDependent(this.MasrafFormDownFrag);
			}

			// var filter = [];
			// filter.push(new Filter("Expno", FilterOperator.EQ, oEvent.getSource().getBindingContext("docDetailModel").getObject().Expno));
			// filter.push(new Filter("Itemno", FilterOperator.EQ, oEvent.getSource().getBindingContext("docDetailModel").getObject().Itemno));
			// filter.push(new Filter("Button", FilterOperator.EQ, 'MASRAFFORM'));

			var List = [];
			List.push({
				Expno: item.Expno,
				Itemno: item.Itemno,
				Gjahr: item.Gjahr,
				Docid: "M",
				Datum: "",
				Uzeit: "",
				Filename: "",
				Mimetype: "application/pdf"
			});

			that.getModel("detailView").setProperty("/DocListItems", List);
			// oModel.read("/DocListSet", {
			// 	filters: filter,
			// 	success: function (resp) {
			// 		that.getModel("detailView").setProperty("/DocListItems", resp.results);
			that.MasrafFormDownFrag.open();
			sap.ui.core.BusyIndicator.hide();
			// 	},
			// 	error: function () {}
			// });
			//
			// fileName = fileName.toLowerCase()
			// var serviceurl = "/sap/opu/odata/sap/ZFI_015_SRV/";
			// 			var oModel = new sap.ui.model.odata.ODataModel(serviceurl);
			// oModel.read("/DocListSet('" + fileName + "')/$value", {
			// 	method: "GET",
			// 	success: function (data, response) {
			// 		debugger;

			// 		var fName = data.Filename
			// 		var fType = data.Filetype;
			// 		var fContent = data.Filecontent;

			// 		// If the file is document IS  pdf/msword/plain text

			// 		if (fType === "text/plain" || fType === "application/pdf" || fType === "application/msword") {
			// 			fContent = atob(fContent);
			// 			File.save(fContent, fName, "txt", fType);
			// 		}

			//If the file is image
			//        else{
			//                fContent =atob(data.Filecontent);
			//            var byteNumbers= new Array(fContent.length);
			//for (let index = 0; index < fContent.length; index++) {
			//         byteNumbers[index]=fContent.charCodeAt(index)

			//            }
			//            var byteArray= new Uint8Array(byteNumbers)
			//            var blob= new Blob([byteArray],{type:fType});
			//            var url=URL.createObjectURL(blob)
			//            window.open(url,"_blank");
			//        }
			// 		MessageToast.show("FILE Downloaded Succesfully");
			// 	},
			// 	error: function (e) {
			// 		console.log(e)
			// 		alert("error");
			// 	}
			// })

		},
		onCloseMasrafDocDialog: function () {
			this.MasrafFormDownFrag.close();
		},
		onReadDoc: function (oEvent) {

			var url = this.getModel().sServiceUrl;
			this.getModel("detailView").setProperty("/url", url);

			if (!this.DocListFrag) {
				this.DocListFrag = sap.ui.xmlfragment("prodea.ui.Z_MMASRAF01.fragment.DocList", this);
				this.DocListFrag.addStyleClass(this.getOwnerComponent().getContentDensityClass());
				this.getView().addDependent(this.DocListFrag);
			}

			/*  Expno
			  Itemno*/

			var filter = [];
			filter.push(new Filter("Expno", FilterOperator.EQ, this.Expno));
			filter.push(new Filter("Itemno", FilterOperator.EQ, this.Itemno));
			filter.push(new Filter("Gjahr", FilterOperator.EQ, this.Gjahr));

			var that = this;
			var oModel = this.getView().getModel();
			oModel.read("/DocListSet", {
				filters: filter,
				success: function (resp) {
					that.getModel("detailView").setProperty("/DocListItems", resp.results);
					that.getView().getModel("detailView").setProperty("/screenOptions/busyUploadCollect", false);

				},
				error: function () {}
			});

		},
		onCloseDocDialogDocList: function () {
			this.DocListFrag.close();
		},
		slugify: function (text) {
			var trMap = {
				"çÇ": "c",
				"ğĞ": "g",
				"şŞ": "s",
				"üÜ": "u",
				"ıİ": "i",
				"öÖ": "o"
			};
			for (var key in trMap) {
				text = text.replace(new RegExp('[' + key + ']', 'g'), trMap[key]);
			}
			return text;
		},
		onChange: function (oEvent) {

			this.getView().getModel("detailView").setProperty("/screenOptions/busyUploadCollect", true);
			var oUploadCollection = oEvent.getSource();
			var sCsrfToken = this.getView().getModel().oHeaders["x-csrf-token"];
			var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
				name: "x-csrf-token",
				value: sCsrfToken
			});
			oUploadCollection.addHeaderParameter(oCustomerHeaderToken);

			this.oUploadCollection = oUploadCollection;

			var url = "/sap/opu/odata/sap/ZFI_015_SRV/FileUploadDocSet(Expno='" + this.Expno + "',Itemno='" + this.Itemno + "',Gjahr='" + this.Gjahr +
				"')/UPLOADNP";
			oUploadCollection.setUploadUrl(url);

		},
		onBeforeUploadStarts: function (oEvent) {

			var fileName = this.slugify(oEvent.getParameter("fileName"));
			var oCustomerHeaderSlug = new sap.ui.unified.FileUploaderParameter({
				name: "slug",
				value: fileName
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
			oEvent.getParameters().addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
				name: "X-Requested-With",
				value: "XMLHttpRequest"
			}));
		},
		onUploadComplete: function (oEvent) {

			this.onReadDoc();
		},
		onFileDeleted: function (oEvent) {

			var obj = oEvent.getParameter("item").getBindingContext("detailView").getObject();
			this.getView().getModel("detailView").setProperty("/screenOptions/busyUploadCollect", true);

			var that = this;
			var oModel = this.getView().getModel();
			oModel.remove("/DocListSet(Expno='" + this.Expno + "',Itemno='" + this.Itemno + "',Docid='" + obj.Docid + "',Gjahr='" + obj.Gjahr +
				"')", {
					success: function () {
						that.onReadDoc();
					},
					error: function () {}
				});
		},

		_bindView: function (sObjectPath) {
			// Set busy indicator during view binding
			var oViewModel = this.getModel("detailView");

			// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
			oViewModel.setProperty("/busy", false);

			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function () {
						oViewModel.setProperty("/busy", true);
					},
					dataReceived: function () {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},

		masterRefresh: function () {
			var _oComponent = this.getOwnerComponent();
			var oList = _oComponent.oListSelector._oList;
			var oListBinding = oList.getBinding("items");
			oListBinding.refresh(true);
		},

		_onBindingChange: function () {
			var oView = this.getView(),
				oElementBinding = oView.getElementBinding();

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("detailObjectNotFound");
				// if object could not be found, the selection in the master list
				// does not make sense anymore.
				this.getOwnerComponent().oListSelector.clearMasterListSelection();
				return;
			}

			var sPath = oElementBinding.getPath(),
				oResourceBundle = this.getResourceBundle(),
				oObject = oView.getModel().getObject(sPath),
				sObjectId = oObject.Expno,
				sObjectName = oObject.Expno,
				oViewModel = this.getModel("detailView");
			Doc = oObject.Dokuman;

			this.getOwnerComponent().oListSelector.selectAListItem(sPath);

			oViewModel.setProperty("/saveAsTileTitle", oResourceBundle.getText("shareSaveTileAppTitle", [sObjectName]));
			oViewModel.setProperty("/shareOnJamTitle", sObjectName);
			oViewModel.setProperty("/shareSendEmailSubject",
				oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			oViewModel.setProperty("/shareSendEmailMessage",
				oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
		},

		_onMetadataLoaded: function () {
			// Store original busy indicator delay for the detail view
			var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
				oViewModel = this.getModel("detailView");

			// Make sure busy indicator is displayed immediately when
			// detail view is displayed for the first time
			oViewModel.setProperty("/delay", 0);

			// Binding the view will set it to not busy - so the view is always busy if it is not bound
			oViewModel.setProperty("/busy", true);
			// Restore original busy indicator delay for the detail view
			oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
		},

		onCloseDetailPress: function () {
			this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", false);
			// No item should be selected on master after detail page is closed
			this.getOwnerComponent().oListSelector.clearMasterListSelection();
			this.getRouter().navTo("master");
		},

		toggleFullScreen: function () {
			var bFullScreen = this.getModel("appView").getProperty("/actionButtonsInfo/midColumn/fullScreen");
			this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", !bFullScreen);
			if (!bFullScreen) {
				// store current layout and go full screen
				this.getModel("appView").setProperty("/previousLayout", this.getModel("appView").getProperty("/layout"));
				this.getModel("appView").setProperty("/layout", "MidColumnFullScreen");
			} else {
				// reset to previous layout
				this.getModel("appView").setProperty("/layout", this.getModel("appView").getProperty("/previousLayout"));
			}
		},
		onMessagePopoverPress: function (oEvent) {

			var oMessagesButton = oEvent.getSource();
			if (!this._messagePopover) {
				this._messagePopover = new MessagePopover({
					items: {
						path: "message>/",
						template: new MessagePopoverItem({
							description: "{message>description}",
							type: "{message>type}",
							title: "{message>message}"
						})
					}
				});
				oMessagesButton.addDependent(this._messagePopover);
			}
			this._messagePopover.toggle(oMessagesButton);

		},
		Messages: function (bapiret) {
			var oMessageManager = sap.ui.getCore().getMessageManager(),
				oMessageProcessor = new sap.ui.core.message.ControlMessageProcessor();

			oMessageManager.removeAllMessages();

			for (var a in bapiret) {
				if (bapiret[a].Type === "E") {
					oMessageManager.addMessages(
						new sap.ui.core.message.Message({
							message: bapiret[a].Message,
							type: sap.ui.core.MessageType.Error,
							processor: oMessageProcessor
						})
					);
				} else if (bapiret[a].Type === "S") {
					oMessageManager.addMessages(
						new sap.ui.core.message.Message({
							message: bapiret[a].Message,
							type: sap.ui.core.MessageType.Success,
							processor: oMessageProcessor
						})
					);
				} else if (bapiret[a].Type === "W") {
					oMessageManager.addMessages(
						new sap.ui.core.message.Message({
							message: bapiret[a].Message,
							type: sap.ui.core.MessageType.Warning,
							processor: oMessageProcessor
						})
					);
				}
			}
		},
		onShowMuhRedNedeni: function (oEvent) {
			debugger;
			this.getModel("detailView").setProperty("/MuhRedNedeni", oEvent.getSource().getBindingContext("docDetailModel").getObject().MuhRedNedeni);

			if (!this.MuhRedNedeniFrag) {
				this.MuhRedNedeniFrag = sap.ui.xmlfragment("prodea.ui.Z_MMASRAF01.fragment.MuhRedNedeni", this);
				this.MuhRedNedeniFrag.addStyleClass(this.getOwnerComponent().getContentDensityClass());
				this.getView().addDependent(this.MuhRedNedeniFrag);
			}

			this.MuhRedNedeniFrag.open();

		},
		onCloseDialogMuhRedNedeni: function () {
			this.MuhRedNedeniFrag.close();
		},
		onTutarChange: function () {
			// var sNewValue = oEvent.getParameter("value");
			var t = this;
			var that = this;
			var dataModel = t.getOwnerComponent().getModel();
			var upb = "";
			var upbTutar = "";
			// var tutar = sap.ui.getCore().byId("idTutar").getValue().replace(/,/g, "");
			var tutar = sap.ui.getCore().byId("idTutar").getValue();
			var fisTarihi = sap.ui.getCore().byId("idFisTarih").getValue().slice(6, 10) +
				sap.ui.getCore().byId("idFisTarih").getValue().slice(3, 5) +
				sap.ui.getCore().byId("idFisTarih").getValue().slice(0, 2);
			// var fisTarihi = sap.ui.getCore().byId("idFisTarih").getValue();
			var waers = sap.ui.getCore().byId("idParaBirimi").getValue();
			debugger;
			if (tutar !== '' && fisTarihi !== '' && waers !== '') {
				dataModel.read("/MTutarConversionSet(Tutar='" + tutar + "',FisTarihi='" + fisTarihi + "',Waers='" + waers + "')", {
					// dataModel.read("/MTutarConversionSet(IvTutar='" + tutar + "',IvWaers='" + waers +  "')", {
					// dataModel.read("/MTutarConversionSet(Tutar='" + tutar + "',Waers='" + waers + "')", {
					success: function (data, response) {
						debugger;
						sap.ui.getCore().byId("idAZNTutar").setValue(that.formatter.currencyValue2(Number(data.Tutar)));
						// t.bindView();
						sap.ui.core.BusyIndicator.hide();
					},
					error: function (response) {
						// sap.m.MessageBox.error("Bir hata oluştu. Lütfen sistem yöneticinizle iletişime geçiniz.");
						sap.ui.core.BusyIndicator.hide();
					}
				});
			}

		},
		onFisTarihChange: function () {
			var t = this;
			var that = this;
			var dataModel = t.getOwnerComponent().getModel();
			var upb = "";
			var upbTutar = "";
			var tutar = sap.ui.getCore().byId("idTutar").getValue();
			var fisTarihi = sap.ui.getCore().byId("idFisTarih").getValue().slice(6, 10) +
				sap.ui.getCore().byId("idFisTarih").getValue().slice(3, 5) +
				sap.ui.getCore().byId("idFisTarih").getValue().slice(0, 2);
			var waers = sap.ui.getCore().byId("idParaBirimi").getValue();
			debugger;
			if (tutar != '' && fisTarihi != '' && waers != '') {
				dataModel.read("/MTutarConversionSet(Tutar='" + tutar + "',FisTarihi='" + fisTarihi + "',Waers='" + waers + "')", {
					success: function (data, response) {
						debugger;
						sap.ui.getCore().byId("idAZNTutar").setValue(that.formatter.currencyValue2(Number(data.Tutar)));

						sap.ui.core.BusyIndicator.hide();
					},
					error: function (response) {
						// sap.m.MessageBox.error("Bir hata oluştu. Lütfen sistem yöneticinizle iletişime geçiniz.");
						sap.ui.core.BusyIndicator.hide();
					}
				});
			}
		},
		onParaBirimiChange: function () {
			var t = this;
			var that = this;
			var dataModel = t.getOwnerComponent().getModel();
			var upb = "";
			var upbTutar = "";
			var tutar = sap.ui.getCore().byId("idTutar").getValue();
			var fisTarihi = sap.ui.getCore().byId("idFisTarih").getValue().slice(6, 10) +
				sap.ui.getCore().byId("idFisTarih").getValue().slice(3, 5) +
				sap.ui.getCore().byId("idFisTarih").getValue().slice(0, 2);
			var waers = sap.ui.getCore().byId("idParaBirimi").getValue();
			debugger;
			if (tutar != '' && fisTarihi != '' && waers != '') {
				dataModel.read("/MTutarConversionSet(Tutar='" + tutar + "',FisTarihi='" + fisTarihi + "',Waers='" + waers + "')", {
					success: function (data, response) {
						debugger;
						sap.ui.getCore().byId("idAZNTutar").setValue(that.formatter.currencyValue2(Number(data.Tutar)));

						sap.ui.core.BusyIndicator.hide();
					},
					error: function (response) {
						// sap.m.MessageBox.error("Bir hata oluştu. Lütfen sistem yöneticinizle iletişime geçiniz.");
						sap.ui.core.BusyIndicator.hide();
					}
				});
			}
		},
	});

});