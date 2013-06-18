if (typeof UPTIME == "undefined") {
	var UPTIME = {};
}

if (typeof UPTIME.ElementStatusBarChart == "undefined") {
	UPTIME.ElementStatusBarChart = function(options, displayStatusBar, clearStatusBar) {
		Highcharts.setOptions({
			global : {
				useUTC : false
			}
		});

		var dimensions = new UPTIME.pub.gadgets.Dimensions(200, 200);
		var chartDivId = null;
		var elementId = null;
		var elementName = null;
		var chartType = null;
		var refreshInterval = 30;
		var chartTimer = null;
		var api = new apiQueries();

		var textStyle = {
			fontFamily : "Verdana, Arial, Helvetica, sans-serif",
			fontSize : "9px",
			lineHeight : "11px",
			color : "#565E6C"
		};

		if (typeof options == "object") {
			dimensions = options.dimensions;
			chartDivId = options.chartDivId;
			chartType = options.chartType;
			elementId = options.elementId;
			elementName = options.elementName;
			refreshInterval = options.refreshInterval;
		}

		var seriesData = [ {
			id : 'OK',
			name : 'OK',
			data : [ 0 ],
			color : '#67B10B'
		}, {
			id : 'WARN',
			name : 'WARN',
			data : [ 0 ],
			color : '#DAD60B'
		}, {
			id : 'CRIT',
			name : 'CRIT',
			data : [ 0 ],
			color : '#B61211'
		}, {
			id : 'MAINT',
			name : 'MAINT',
			data : [ 0 ],
			color : '#555B98'
		}, {
			id : 'UNKNOWN',
			name : 'UNKNOWN',
			data : [ 0 ],
			color : '#AEAEAE'
		} ];

		var chart = new Highcharts.Chart({
			chart : {
				renderTo : chartDivId,
				width : dimensions.width,
				height : dimensions.height,
				type : chartType,
				animation : true,
				style : textStyle
			},
			credits : {
				enabled : false
			},
			plotOptions : {
				series : {
					pointWidth : 20,
					animation : true
				}
			},
			title : {
				text : '<a href="' + uptimeGadget.getElementUrls(elementId, elementName).services + '" target="_top">'
						+ elementName + '</a>',
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
			xAxis : {
				labels : {
					enabled : false
				}
			},
			yAxis : {
				labels : {
					style : textStyle,
				},
				allowDecimals : false,
				min : 0,
				title : {
					text : ''
				}
			},
			tooltip : {
				style : textStyle,
				formatter : function() {
					var plural = "";
					if (this.y > 1) {
						plural = "s";
					}
					return '<b>' + this.series.name + '</b> - ' + this.y + " monitor" + plural;
				}
			},
			legend : {
				enabled : false
			},
			series : seriesData,
			spacingTop : 5,
			spacingRight : 5,
			spacingBottom : 5,
			spacingLeft : 5
		});

		function requestData() {
			api.getElementStatus(elementId).then(function(fullData) {
				var allMonitorsStatus = fullData['monitorStatus'];
				var statusCount = {};
				for ( var index in allMonitorsStatus) {
					var monitor = allMonitorsStatus[index];
					var monitorStatus = monitor["status"];
					if ((monitor.isMonitored) && !(monitor.isHidden)) {
						if (!statusCount.hasOwnProperty(monitorStatus)) {
							statusCount[monitorStatus] = 0;
						}
						statusCount[monitorStatus]++;
					}
				}
				var displayStatuses = [ "OK", "WARN", "CRIT", "UNKNOWN", "MAINT" ];
				$.each(displayStatuses, function(index, severity) {
					var bar = chart.get(severity);
					if (statusCount.hasOwnProperty(severity)) {
						bar.show();
						bar.setData([ statusCount[severity] ]);
					} else {
						bar.hide();
					}
				});
				clearStatusBar();
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
			resize : function(dimensions) {
				chart.setSize(dimensions.width, dimensions.height);
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