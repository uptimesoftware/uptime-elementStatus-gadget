if (typeof UPTIME == "undefined") {
	var UPTIME = {};
}

// Define class/function name
if (typeof UPTIME.ElementStatusBarChart == "undefined") {
	UPTIME.ElementStatusBarChart = function(options) {
	
		var chartTimer = null;
	
	
			Highcharts.setOptions({
				global : {
					useUTC : false
				}
			});

			var chartDivId = null;
			var lastRefreshBarDivId = null;
			var statusBarDivId = null;
			var entityId = null;
			var entityName = null;
			var chartType = null;
			var api = null;
			var refreshRate = null;
			var showLegend  = null;

			if (typeof options == "object") {
				chartDivId  = options.chartDivId;
				lastRefreshBarDivId = "#" + options.lastRefreshBarDivId;
				statusBarDivId = options.statusBarDivId;
				chartType   = options.chartType;
				entityId    = options.entityId;
				entityName  = options.entityName;
				api = options.api;
				refreshRate = options.refreshRate;
				showLegend  = options.showLegend;
			}

			var statusData = [ 	 
				{
					id : 'OK',
					name : 'OK',
					data : [ 0],
					color: '#67B10B'
				}, 		 {
					id : 'WARN',
					name : 'WARN',
					data : [ 0],
					color: '#DAD60B'                        
				},		{
					id : 'CRIT',
					name : 'CRIT',
					data : [ 0],
					color: '#B61211'                        
				},		{
					id: 'MAINT', 
					name : 'MAINT',
					data : [0],
					color: '#555B98'
				},		{
					id : 'UNKNOWN',
					name : 'UNKNOWN',
					data : [ 0],
					color: '#AEAEAE'
				}
			];
			var chart;
			
			chart = new Highcharts.Chart({
					credits: { enabled: false },
					chart : {
							renderTo : chartDivId,
							height   : 200,
							type     : chartType,
							events   : {
								load: updateChart
							},
					},
					 plotOptions: {
						series: {
							pointWidth: 20
						}
					},
					title : {
						text : "<a href='/main.php?section=Profile&subsection=&id="+entityId+"&name=" + entityName + "&dlsection=s_status' target='_top'>" + entityName
					},
					subtitle : {
						text : "Monitor Status"
					},
					xAxis: {
						labels: {
							enabled: false
						}
					},
					yAxis : {
						allowDecimals : false,
						min : 0,
						title : {
								text : ''
						}
					},
					legend: {
						enabled: showLegend,
						floating: false
					},
					tooltip : {
						formatter : function() {
							var plural = "";
							if (this.y>1){
								plural = "s";
							}
							return '<b>'+ this.series.name +'</b> - '+ this.y +" monitor"+plural;
						}
					},
					series : statusData
			});					  
   
		function updateChart() {
			api.getElementStatus(entityId).then(function(fullData) {
				
				var allMonitorsStatus = fullData['monitorStatus'];
				var statusTally  = {};
				for (var index in allMonitorsStatus){
					var monitorStatus = allMonitorsStatus[index]["status"];
					if (!statusTally.hasOwnProperty(monitorStatus)){
						statusTally[monitorStatus]=0;
					}
					statusTally[monitorStatus]++;
				}
				
				var displayStatuses = ["OK", "WARN", "CRIT", "UNKNOWN", "MAINT"];

				$.each( displayStatuses , function(index, statusName){
					var bar = chart.get(statusName);
					if (statusTally.hasOwnProperty(statusName)){
						bar.show();
						bar.setData([statusTally[statusName]]);
					}
					else {
						bar.hide();
					}
				});

				// update lastRefreshBar
				$(lastRefreshBarDivId).show();
				var dt = new Date();
				$(lastRefreshBarDivId).html("<small>Last refreshed: " + dt.getMonth() + "/" + dt.getDate() + "/" + dt.getFullYear() + " - " +  dt.getHours()+ ":" +  dt.getMinutes() + ":" +  dt.getSeconds() + "</small>");

				// set chart refresh to update itself automatically
				chartTimer = setTimeout(updateChart, refreshRate*1000);
			},
			function(jqXHR, textStatus, errorThrown) {
				// error callback
				chart.showLoading(errorThrown);
			});
		}

		// public functions for this function/class
		var public = {
			stopTimer: function() {
				if (chartTimer) {
					window.clearTimeout(chartTimer);
				}
			},
			startTimer: function() {
				if (chartTimer) {
					updateChart();
				}
			}
		};
		return public;	// Important: we need to return the public functions/methods

	};
}