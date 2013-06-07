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
			var statusBarDivId = null;
			var entityId = null;
			var entityName = null;
			var chartType = null;
			var api = null;
			var refreshRate = null;
			var showLegend = null;

			if (typeof options == "object") {
				chartDivId  = options.chartDivId;
				statusBarDivId = options.statusBarDivId;
				chartType   = options.chartType;
				entityId    = options.entityId;
				entityName  = options.entityName;
				api = options.api;
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
						text : entityName
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
						enabled: true,
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
									showInLegend : true,
									point : {
										events : {
											legendItemClick : function() {
												if (this.y <= 0) {
													return false;
												}
											}
										}
									}
							}
					},
					series: [   {
						type: 'pie',
						name: 'Browser share',
						data: seriesData
					}]
			});
	 
			function requestData() {
				var statusCount = { 'OK': 0, 'WARN': 0, 'CRIT': 0, 'UNKNOWN': 0, 'MAINT': 0};
				var groupIdsToInclude = [entityId];
				
				var reloadMs = refreshRate * 60 * 1000;
				
			
				var dt = new Date();
			
				api.getElementStatus(entityId).then(function(fullData) {
					
					$.each(fullData.monitorStatus, function(index,monitor) {
						if ((monitor.isMonitored) && !(monitor.isHidden)) {
							statusCount[monitor.status]++;
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