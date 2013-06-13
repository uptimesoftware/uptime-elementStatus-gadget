if (typeof UPTIME == "undefined") {
	var UPTIME = {};
}

// Define class/function name
if (typeof UPTIME.ElementStatusBarChart == "undefined") {
	UPTIME.ElementStatusBarChart = function(options, displayStatusBar, clearStatusBar) {
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

		var statusData = [ {
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
		var chart;

		chart = new Highcharts.Chart({
			credits : {
				enabled : false
			},
			chart : {
				renderTo : chartDivId,
				height : 200,
				type : chartType,
				events : {
					load : updateChart
				},
			},
			plotOptions : {
				series : {
					pointWidth : 20
				}
			},
			title : {
				text : "<a href='/main.php?section=Profile&subsection=&id=" + elementId + "&name=" + elementName
						+ "&dlsection=s_status' target='_top'>" + elementName,
				style : {
					fontSize : '10px'
				}
			},
			subtitle : {
				text : "Monitor Status",
				style : {
					fontSize : '8px'
				}
			},
			xAxis : {
				labels : {
					enabled : false
				}
			},
			yAxis : {
				allowDecimals : false,
				min : 0,
				title : {
					text : ''
				}
			},
			legend : {
				enabled : false,
				floating : false
			},
			tooltip : {
				formatter : function() {
					var plural = "";
					if (this.y > 1) {
						plural = "s";
					}
					return '<b>' + this.series.name + '</b> - ' + this.y + " monitor" + plural;
				}
			},
			series : statusData
		});

		function updateChart() {
			api.getElementStatus(elementId).then(function(fullData) {

				var allMonitorsStatus = fullData['monitorStatus'];
				var statusTally = {};
				for ( var index in allMonitorsStatus) {
					var monitor = allMonitorsStatus[index];
					var monitorStatus = monitor["status"];
					if ((monitor.isMonitored) && !(monitor.isHidden)) {
						if (!statusTally.hasOwnProperty(monitorStatus)) {
							statusTally[monitorStatus] = 0;
						}
						statusTally[monitorStatus]++;
					}
				}

				var displayStatuses = [ "OK", "WARN", "CRIT", "UNKNOWN", "MAINT" ];

				$.each(displayStatuses, function(index, statusName) {
					var bar = chart.get(statusName);
					if (statusTally.hasOwnProperty(statusName)) {
						bar.show();
						bar.setData([ statusTally[statusName] ]);
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
			// set chart refresh to update itself automatically
			if (refreshRate > 0) {
				chartTimer = setTimeout(updateChart, refreshRate * 1000);
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
				updateChart();
			},
			destroy : function() {
				chart.destroy();
			}
		};
		return publicFns; // Important: we need to return the public
		// functions/methods

	};
}