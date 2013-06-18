if (typeof UPTIME == "undefined") {
	var UPTIME = {};
}

if (typeof UPTIME.ElementStatusPieChart == "undefined") {
	UPTIME.ElementStatusPieChart = function(options, displayStatusBar, clearStatusBar) {
		Highcharts.setOptions({
			global : {
				useUTC : false
			}
		});

		var chartDivId = null;
		var elementId = null;
		var elementName = null;
		var refreshInterval = 30;
		var chartTimer = null;
		var api = new apiQueries();

		var seriesData = [ {
			id : 'OK',
			name : 'OK',
			y : 0,
			color : '#67B10B',
			visible : false,
			type : "pie"
		}, {
			id : 'WARN',
			name : 'WARN',
			y : 0,
			color : '#DAD60B',
			visible : false,
			type : "pie"
		}, {
			id : 'CRIT',
			name : 'CRIT',
			y : 0,
			color : '#B61211',
			visible : false,
			type : "pie"
		}, {
			id : 'MAINT',
			name : 'MAINT',
			y : 0,
			color : '#555B98',
			visible : false,
			type : "pie"
		}, {
			id : 'UNKNOWN',
			name : 'UNKNOWN',
			y : 1,
			color : '#AEAEAE',
			visible : true,
			type : "pie"
		} ];

		var textStyle = {
			fontFamily : "Verdana, Arial, Helvetica, sans-serif",
			fontSize : "9px",
			lineHeight : "11px",
			color : "#565E6C"
		};

		if (typeof options == "object") {
			chartDivId = options.chartDivId;
			elementId = options.elementId;
			elementName = options.elementName;
			refreshInterval = options.refreshInterval;
		}

		var dataLabelsEnabled = false;
		var chart = new Highcharts.Chart({
			chart : {
				renderTo : chartDivId,
				height : 200,
				plotBackgroundColor : null,
				plotBorderWidth : null,
				plotShadow : false,
				yAxis : {
					allowDecimals : false
				},
				style : textStyle
			},
			credits : {
				enabled : false
			},
			title : {
				text : '<a href="' + uptimeGadget.getElementUrls(elementId, elementName).services + '" target="_top">'
						+ elementName + '</a>',
				margin : 0,
				y : 5,
				style : $.extend({
					fontWeight : "bold"
				}, textStyle),
				useHTML : true
			},
			subtitle : {
				text : "Monitor Status",
				y : 20,
				style : textStyle,
				useHTML : true
			},
			tooltip : {
				style : textStyle,
				formatter : function() {
					var plural = "";
					if (this.y > 1) {
						plural = "s";
					}
					return '<b>' + this.point.name + '</b> - ' + this.y + " monitor" + plural;
				}
			},
			legend : {
				enabled : false
			},
			plotOptions : {
				pie : {
					allowPointSelect : true,
					cursor : 'pointer',
					dataLabels : {
						enabled : true,
						distance : 10,
						connectorColor : '#565E6C',
						style : textStyle,
						formatter : function() {
							if (dataLabelsEnabled) {
								return '<b>' + this.point.name + '</b> (' + this.y + ") " + Math.floor(this.percentage) + '%';
							} else {
								return '';
							}
						}
					},
					animation : true
				}
			},
			series : [ {
				type : 'pie',
				name : 'Status',
				data : seriesData
			} ],
			spacingTop : 5,
			spacingRight : 5,
			spacingBottom : 5,
			spacingLeft : 5
		});

		function requestData() {
			var statusCount = {
				'OK' : 0,
				'WARN' : 0,
				'CRIT' : 0,
				'UNKNOWN' : 0,
				'MAINT' : 0
			};
			api.getElementStatus(elementId).then(function(fullData) {
				$.each(fullData.monitorStatus, function(index, monitor) {
					if ((monitor.isMonitored) && !(monitor.isHidden)) {
						statusCount[monitor.status]++;
					}
				});
				$.each(seriesData, function(i, item) {
					var sliceData = statusCount[item.id];
					item.y = 0;
					if (sliceData) {
						item.y = sliceData;
						item.visible = true;
					} else {
						item.visible = false;
					}
				});
				clearStatusBar();
				dataLabelsEnabled = true;
				chart.series[0].setData(seriesData, true);
				chart.hideLoading();
			}, function(error) {
				chart.hideLoading();
				displayStatusBar(error, "Error Loading Chart Data");
			});
			if (refreshInterval > 0) {
				chartTimer = setTimeout(requestData, refreshInterval * 1000);
			}
		}
		// public functions for this function/class
		var publicFns = {
			render : function() {
				chart.showLoading();
				requestData();
			},
			stopTimer : function() {
				if (chartTimer) {
					window.clearTimeout(chartTimer);
				}
			},
			destroy : function() {
				chart.destroy();
			}
		};
		return publicFns; // Important: we need to return the public
		// functions/methods
	};
}
