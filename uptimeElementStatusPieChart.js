if (typeof UPTIME == "undefined") {
	var UPTIME = {};
}

if (typeof UPTIME.ElementStatusPieChart == "undefined") {
	UPTIME.ElementStatusPieChart = function(options, displayStatusBar, clearStatusBar) {

		var chartTimer = null;

		Highcharts.setOptions({
			global : {
				useUTC : false
			}
		});

		var chartDivId = null;
		var elementId = null;
		var elementName = null;
		var chartType = null;
		var api = new apiQueries();
		var refreshRate = null;

		if (typeof options == "object") {
			chartDivId = options.chartDivId;
			chartType = options.chartTypeId;
			elementId = options.elementId;
			elementName = options.elementName;
			refreshRate = options.refreshRate;
		}

		var seriesData = [ {
			id : 'OK',
			name : 'OK',
			y : 0,
			color : '#67B10B',
			type : "pie"
		}, {
			id : 'WARN',
			name : 'WARN',
			y : 0,
			color : '#DAD60B',
			type : "pie"
		}, {
			id : 'CRIT',
			name : 'CRIT',
			y : 0,
			color : '#B61211',
			type : "pie"
		}, {
			id : 'MAINT',
			name : 'MAINT',
			y : 0,
			color : '#555B98',
			type : "pie"
		}, {
			id : 'UNKNOWN',
			name : 'UNKNOWN',
			y : 0,
			color : '#AEAEAE'
		} ];

		var chart;
		chart = new Highcharts.Chart({
			chart : {
				renderTo : chartDivId,
				height : 200,
				plotBackgroundColor : null,
				plotBorderWidth : null,
				plotShadow : false,
				events : {
					load : requestData
				},
				yAxis : {
					allowDecimals : false
				}
			},
			credits : {
				enabled : false
			},

			title : {
				text : elementName,
				style : {
					fontSize : '10px'
				},
				margin : 1
			},
			subtitle : {
				text : "Monitor Status",
				style : {
					fontSize : '8px'
				}
			},
			tooltip : {
				formatter : function() {
					var plural = "";
					if (this.y > 1) {
						plural = "s";
					}
					return '<b>' + this.point.name + '</b> - ' + this.y + " monitor" + plural;
				}
			},
			legend : {
				enabled : false,
				floating : false
			},
			plotOptions : {
				pie : {
					allowPointSelect : true,
					cursor : 'pointer',
					dataLabels : {
						enabled : true,
						distance : 10,
						color : '#000000',
						connectorColor : '#000000',
						formatter : function() {
							return '<b>' + this.point.name + '</b> (' + this.y + ") " + Math.floor(this.percentage) + ' %';
						},
						style : {
							fontSize : '8px'
						}
					},
					animation : true

				}
			},
			series : [ {
				type : 'pie',
				name : 'Browser share',
				data : seriesData
			} ]
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
					} else {
						item.visible = false;
					}
				});

				chart.series[0].setData(seriesData, true);
				clearStatusBar();
				chart.hideLoading();
			}, function(error) {
				chart.hideLoading();
				displayStatusBar(error, "Error Loading Chart Data");
			});

			if (refreshRate > 0) {
				chartTimer = setTimeout(requestData, refreshRate * 1000);
			}

		}

		// public functions for this function/class
		var publicFns = {
			stopTimer : function() {
				if (chartTimer) {
					window.clearTimeout(chartTimer);
				}
			},
			render : function() {
				chart.showLoading();
				requestData();
			},
			destroy : function() {
				chart.destroy();
			}
		};
		return publicFns; // Important: we need to return the public
		// functions/methods
	};
}