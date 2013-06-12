if (typeof UPTIME == "undefined") {
	var UPTIME = {};
}

// Define class/function name
if (typeof UPTIME.ElementStatusBarChart == "undefined") {
	UPTIME.ElementStatusBarChart = function(options) {
    	var divsToDim = [ '#widgetSettings', '#widgetChart' ];
		var chartTimer = null;

		Highcharts.setOptions({
			global : {
				useUTC : false
			}
		});

		var chartDivId = null;
		var entityId = null;
		var entityName = null;
		var chartType = null;
		var api = null;
		var refreshRate = null;

		if (typeof options == "object") {
			chartDivId = options.chartDivId;
			chartType = options.chartType;
			entityId = options.entityId;
			entityName = options.entityName;
			api = options.api;
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
				text : "<a href='/main.php?section=Profile&subsection=&id=" + entityId + "&name=" + entityName
						+ "&dlsection=s_status' target='_top'>" + entityName,
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

		function gadgetDimOn() {
			$.each(divsToDim, function(i, d) {
				var div = $(d);
				if (div.is(':visible') && div.css('opacity') > 0.6) {
					div.fadeTo('slow', 0.3);
				}
			});
		}
		
		function updateChart() {
			api.getElementStatus(entityId).then(
					function(fullData) {

						var allMonitorsStatus = fullData['monitorStatus'];
						var statusTally = {};
						for ( var index in allMonitorsStatus) {
							var monitorStatus = allMonitorsStatus[index]["status"];
							if (!statusTally.hasOwnProperty(monitorStatus)) {
								statusTally[monitorStatus] = 0;
							}
							statusTally[monitorStatus]++;
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

						var dt = new Date();
						$(lastRefreshBarDivId).html(
								"<small>Last refreshed: " + dt.getMonth() + "/" + dt.getDate() + "/" + dt.getFullYear() + " - "
										+ dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds() + "</small>");

						// set chart refresh to update itself automatically
						chartTimer = setTimeout(updateChart, refreshRate * 1000 * 60);
					}, function(jqXHR, textStatus, errorThrown) {
						var notificationPanel = $('#notificationPanel').empty();
						var errorBox = uptimeErrorFormatter.getErrorBox(jqXHR);
						errorBox.appendTo(notificationPanel);
						gadgetDimOn();
						notificationPanel.slideDown();
					});
		}

		// public functions for this function/class
		var public = {
			stopTimer : function() {
				if (chartTimer) {
					window.clearTimeout(chartTimer);
				}
			},
			startTimer : function() {
				if (chartTimer) {
					updateChart();
				}
			}
		};
		return public; // Important: we need to return the public
						// functions/methods

	};
}