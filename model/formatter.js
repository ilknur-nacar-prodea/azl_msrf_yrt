sap.ui.define([], function () {
	"use strict";
	return {
		currencyValue: function (e) {
			if (!e) {
				return ""
			}
			return parseFloat(e).toFixed(2)
		},
		currencyValue2: function (e) {
			debugger;
			// var oFormat = sap.ui.core.format.NumberFormat.getIntegerInstance({
			// 	"decimalSeparator": '.'
			// });
			// return oFormat.format(sValue);
			var rValue = "";
			if (e) {
				// var myArray = e.split(".")[1];
				// var num = e.split(".")[0];
				// if (myArray === "000") {
				// 	// return parseFloat(sValue).split(",")[0];
				// 	rValue = num;
				// 	return rValue;
				// 	// return sValue.toFixed(0);
				// } else {
				var oFormatOptions = {
					minFractionDigits: 2,
					maxFractionDigits: 2
				};
				var oFloatFormat = sap.ui.core.format.NumberFormat.getFloatInstance(oFormatOptions);
				return oFloatFormat.format(e);
				// return parseFloat(sValue).toFixed(3);
				// 	debugger;
				// 	rValue = e;
				// 	return rValue;
				// }
			} else {
				return "";
			}
		},

		statuFormat: function (e) {
			if (e === "D") {
				return "Warning"
			} else if (e === "C" || e === "F") {
				return "Error"
			} else if (e === "A") {
				return "Information"
			} else if (e === "B") {
				return "Success"
			}
		},
		kalemStatu: function (e) {
			if (e === "") {
				return "Uygun"
			} else if (e === "A") {
				return "Uygun"
			} else if (e === "B") {
				return "Line Manager Onayladı"
			} else if (e === "C") {
				return "Line Manager Reddetti"
			} else if (e === "D") {
				return "Line Manager Onayında"
			} else if (e === "E") {
				return "Muhasebe Onayladı"
			} else if (e === "F") {
				return "Muhasebe Reddetti"
			} else if (e === "G") {
				return "HR Reddetti"
			} else if (e === "H") {
				return "HR Onayladı"
			} else if (e === "I") {
				return "CEO Onayladı"
			} else if (e === "J") {
				return "CEO Reddetti"
			} else if (e === "K") {
				return "Bütçe Onayladı"
			} else if (e === "L") {
				return "Bütçe Reddetti"
			}

		},
		buttonVis: function (e) {
			if (e === "D") {
				return false
			} else if (e === "C" || e === "F" || e === "G" || e === "L" || e === "J") {
				return true
			} else if (e === "A") {
				return true
			} else {
				return false
			}
		},
		modeTable: function (e) {
			if (e === "D") {
				return "None"
			} else if (e === "C" || e === "F" || e === "G" || e === "L" || e === "J") {
				return "SingleSelectLeft"
					// return "Delete"
			} else if (e === "A") {
				return "SingleSelectLeft"
					// return "Delete"
			} else {
				return "None"
			}
		}
	}
});