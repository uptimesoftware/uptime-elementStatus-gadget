$(function() {
	var api = new apiQueries();
	var myChart = null;

	$("#widgetSettings").hide();
	$("#widgetChart").hide();

	function showEditPanel() {
		// stop any existing timers in the charts (for when we save and change
		// settings)
		if (myChart) {
			myChart.stopTimer();
		}
		$("#widgetSettings").show();
		$("#widgetChart").hide();
	}

	$("#saveSettings").click(function() {
		var radioId = $("#widgetOptions input[name=chartType]:radio:checked").val();
		var entityId = $('#elementId').find(":selected").val();
		var entityName = $('#elementId').find(":selected").text();
		var refreshRate = $('#refreshRate').val();

		// save group name for now, just for demo purposes
		var settings = {
			'entityId' : entityId,
			'chartType' : radioId,
			'entityName' : entityName,
			'refreshRate' : refreshRate,
		};
		uptimeGadget.saveSettings(settings).then(onGoodSave, onBadAjax);
	});
	$("#cancelSettings").click(function() {
		$("#widgetChart").show();
		$("#widgetSettings").hide();
		if (myChart) {
			myChart.startTimer();
		}
	});

	function displayPanel(settings) {
		$("#widgetChart").show();
		$("#widgetSettings").hide();

		// Display the chart
		displayChart(settings);
	}

	function elementSort(arg1, arg2) {
		return naturalSort(arg1.name, arg2.name);
	}

	// Main Gadget Logic Start
	function goodLoad(settings) {

		api.getAllElements().then(function(data) {

			var optionsValues = '<select id="elementId">';
			data.sort(elementSort);
			$.each(data, function() {
				optionsValues += '<option value="' + this.id + '">' + this.name + '</option>';
			});
			optionsValues += '</select>';
			$('#availableElements').html(optionsValues);
			
			if (settings) {
				$("#elementId").val(settings.entityId);
				$("#" + settings.chartType).prop("checked", true);
				$("#refreshRate").val(settings.refreshRate);
			}
		}, function(jqXHR, textStatus, errorThrown) {
			onBadAjax(jqXHR);
		});

		if (settings) {
			displayPanel(settings);
		} else {
			showEditPanel();
		}
	}

	function onGoodSave(savedSettings) {
		displayPanel(savedSettings);
	}

	function onBadAjax(errorObject) {
		var notificationPanel = $('#notificationPanel').empty();
		var errorBox = uptimeErrorFormatter.getErrorBox(error);
		errorBox.appendTo(notificationPanel);
		notificationPanel.slideDown();
	}

	function displayChart(settings) {
		// add/edit settings object with extra properties
		settings["chartDivId"] = "widgetChart";
		settings["api"] = api;
		settings["__UPTIME_GADGET_BASE__"] = "__UPTIME_GADGET_BASE__";

		// stop any existing timers in the charts (for when we save and change
		// settings)
		if (myChart) {
			myChart.stopTimer();
		}

		// display chart
		if (settings.chartType == "bar") {
			// bar/column chart
			myChart = new UPTIME.ElementStatusBarChart(settings);
		} else if (settings.chartType == "pie") {
			// pie chart
			myChart = new UPTIME.ElementStatusPieChart(settings);
		} else {
			// column chart
			myChart = new UPTIME.ElementStatusBarChart(settings);
		}
	}

	// Always load these at the end
	uptimeGadget.registerOnEditHandler(showEditPanel);
	uptimeGadget.registerOnLoadHandler(function() {
		uptimeGadget.loadSettings().then(goodLoad, onBadAjax);
	});
	// uptimeGadget.registerOnUploadFile(function (e){});

});