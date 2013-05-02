if (typeof UPTIME == "undefined") {
        var UPTIME = {};
}

if (typeof UPTIME.ElementStatusPieChart == "undefined") {
        UPTIME.ElementStatusPieChart = function(options) {

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
			var uptime_api = null;
			var refreshRate = null;
			var showLegend = null;

			if (typeof options == "object") {
				chartDivId  = options.chartDivId;
				lastRefreshBarDivId = "#" + options.lastRefreshBarDivId;
				statusBarDivId = options.statusBarDivId;
				chartType   = options.chartType;
				entityId    = options.entityId;
				entityName  = options.entityName;
				uptime_api  = options.uptime_api;
				refreshRate = options.refreshRate;
				showLegend  = options.showLegend;
			}

			var seriesData = [	 
							{
								id : 'OK',
								name : 'OK',
								y : 0,
								color: '#67B10B',
								type:"pie"
							}, 		 {
								id : 'WARN',
								name : 'WARN',
								y : 0,
								color: '#DAD60B',
								type:"pie"
							},		{
								id : 'CRIT',
								name : 'CRIT',
								y : 0,
								color: '#B61211',
								type:"pie"
							},		{
								id: 'MAINT', 
								name : 'MAINT',
								y : 0,
								color: '#555B98',
								type:"pie"
							},		{
								id : 'UNKNOWN',
								name : 'UNKNOWN',
								y : 0,
								color: '#AEAEAE'									
							}
						];

			var chart;
			chart = new Highcharts.Chart({
					chart: {
							renderTo: chartDivId,
							height: 200,
							plotBackgroundColor: null,
							plotBorderWidth: null,
							plotShadow: false,
							events: {
									load: requestData
							},
							yAxis: {
									allowDecimals:false
							}               
					},
					credits: { enabled: false },
					
					title: {
							text: "<a href='http://sdgjkldsg.gsdsg'>" + entityName + "</a>"
					},
					subtitle : {
						text : "Monitor Status"
					},
					tooltip: {
						formatter: function() {
							var plural = "";
							if (this.y>1){
								plural = "s";
							}
							return '<b>'+ this.point.name +'</b> - '+ this.y +" monitor"+plural;
						}
					},
					legend: {
						enabled: showLegend,
						floating: false
					},
					plotOptions: {
							pie: {
									allowPointSelect: true,
									cursor: 'pointer',
									dataLabels: {
											enabled: true,
											distance: 0,
											color: '#000000',
											connectorColor: '#000000',
											formatter: function() {
													return '<b>'+ this.point.name +'</b> ('+ this.y+") "+Math.floor(this.percentage)+' %';
											}
									},
									animation : true,
									showInLegend : true
							}
					},
					series: [   {
						type: 'pie',
						name: 'Browser share',
						data: seriesData
					}]
			});
	 
			//function requestData(statusType) {
			function requestData() {
				var statusCount = { 'OK': 0, 'WARN': 0, 'CRIT': 0, 'UNKNOWN': 0, 'MAINT': 0};
				var groupIdsToInclude = [entityId];
				
				var reloadMs = refreshRate * 60 * 1000;
				
				// update lastRefreshBar
				$(lastRefreshBarDivId).show();
				var dt = new Date();
				$(lastRefreshBarDivId).html("<small>Last refreshed: " + dt.getMonth() + "/" + dt.getDate() + "/" + dt.getFullYear() + " - " +  dt.getHours()+ ":" +  dt.getMinutes() + ":" +  dt.getSeconds() + "</small>");
				
				uptime_api.getElementStatus(entityId,function(fullData) {
					
					//chart.setTitle({text: entityName});	// already set
					$.each(fullData.monitorStatus, function(index,monitor) {
						if ((monitor.isMonitored) && !(monitor.isHidden)) {
							statusCount[monitor.status]++;
							//console.log("monitor.elementId="+ monitor.elementId + " status=" + monitor.status);
						}
					});
					
					$.each(seriesData, function(i, item) {
							var sliceData = statusCount[item.id];
							item.y = 0;
							if (sliceData){
								item.y = sliceData;
							}
							else {
								item.visible=false;
							}
						});

					chart.series[0].setData(seriesData, true);
					
					
					},function(jqXHR, textStatus, errorThrown) {
						var statusBar = $(statusBarDivId);
						statusBar.css("color", "red");
						statusBar.text("Can't connect to the up.time API.");
						statusBar.show();
					}
				);
				
				

				
				chartTimer = setTimeout(requestData, reloadMs);
				
				

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

/*



if (typeof UPTIME == "undefined") {
	var UPTIME = {};
}

// Define class/function name
if (typeof UPTIME.ElementStatusPieChart == "undefined") {
	UPTIME.ElementStatusPieChart = function(options) {
	
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
			var uptime_api = null;
			var refreshRate = null;

			if (typeof options == "object") {
				chartDivId  = options.chartDivId;
				lastRefreshBarDivId = "#" + options.lastRefreshBarDivId;
				statusBarDivId = options.statusBarDivId;
				chartType   = options.chartType;
				entityId    = options.entityId;
				entityName  = options.entityName;
				uptime_api  = options.uptime_api;
				refreshRate = options.refreshRate;
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
					series: [   {
						type: 'pie',
						name: 'Browser share',
						data: statusData
					}],
					 plotOptions: {
						pie: {
							allowPointSelect: true,
							cursor: 'pointer',
							dataLabels: {
								enabled: true,
								color: '#000000',
								connectorColor: '#000000',
								formatter: function() {
									return '<b>'+ this.point.name +'</b> ('+ this.y+") "+Math.floor(this.percentage)+' %';
								}
							}
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
					tooltip : {
						formatter : function() {
							var plural = "";
							if (this.y>1){
								plural = "s";
							}
							return '<b>'+ this.series.name +'</b> - '+ this.y +" monitor"+plural;
						}
					}
			});					  
   
		function updateChart() {
			uptime_api.getElementStatus(entityId,function(fullData) {
				
				//console.log(elementStatus);
				
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
					var sliceData = statusTally[statusName.id];
					statusName.y = 0;
					if (sliceData){
						statusName.y = sliceData;
					}
					else {
						statusName.visible = false;
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
*/
