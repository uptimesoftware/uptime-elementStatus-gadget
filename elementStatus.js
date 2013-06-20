$(function() {
	var api = new apiQueries();
	var myChart = null;
	var myChartDimensions = null;
	var elementStatusSettings = {
		entityId : -1,
		entityName : "",
		refreshInterval : 30,
		chartTypeId : "pie",
	};
	var divsToDim = [ '#widgetChart', '#widgetSettings' ];

	$("#widgetSettings").hide();

	$('.element-status-setting').change(settingChanged);

	$("#closeSettings").click(function() {
		$("#widgetSettings").slideUp();
	});

	uptimeGadget.registerOnEditHandler(showEditPanel);
	uptimeGadget.registerOnLoadHandler(function(onLoadData) {
		myChartDimensions = toMyChartDimensions(onLoadData.dimensions);
		if (onLoadData.hasPreloadedSettings()) {
			goodLoad(onLoadData.settings);
		} else {
			uptimeGadget.loadSettings().then(goodLoad, onBadAjax);
		}
	});
	uptimeGadget.registerOnResizeHandler(resizeGadget);

	function escapeHtml(str) {
		return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
	}

	function resizeGadget(dimensions) {
		myChartDimensions = toMyChartDimensions(dimensions);
		if (myChart) {
			myChart.resize(myChartDimensions);
		}
		$("body").height($(window).height());
	}

	function toMyChartDimensions(dimensions) {
		return new UPTIME.pub.gadgets.Dimensions(Math.max(100, dimensions.width - 5), Math.max(100, dimensions.height - 5));
	}

	function settingChanged() {
		elementStatusSettings.chartTypeId = $("#widgetOptions input[name=chartType]:radio:checked").val();
		elementStatusSettings.elementId = $('#elementId').find(":selected").val();
		elementStatusSettings.elementName = $('#elementId').find(":selected").text();
		elementStatusSettings.refreshInterval = $("#refreshRate").val();
		uptimeGadget.saveSettings(elementStatusSettings).then(onGoodSave, onBadAjax);
	}

	function displayStatusBar(error, msg) {
		gadgetDimOn();
		var statusBar = $("#statusBar");
		statusBar.empty();
		var errorBox = uptimeErrorFormatter.getErrorBox(error, msg);
		errorBox.appendTo(statusBar);
		statusBar.slideDown();
	}

	function clearStatusBar() {
		gadgetDimOff();
		var statusBar = $("#statusBar");
		statusBar.slideUp().empty();
	}

	function showEditPanel() {
		if (myChart) {
			myChart.stopTimer();
		}

		$("#widgetOptions input[name=chartType]").filter('[value=' + elementStatusSettings.chartTypeId + ']').prop('checked',
				true);
		$('#elementId').val(elementStatusSettings.elementId);
		$("#refreshRate").val(elementStatusSettings.refreshInterval);

		$("#widgetSettings").slideDown();
		$("body").height($(window).height());
		return populateIdSelector().then(function() {
			settingChanged();
		});
	}

	function disableSettings() {
		$('.element-status-setting').prop('disabled', true);
		$('#closeButton').prop('disabled', true).addClass("ui-state-disabled");
	}

	function enableSettings() {
		$('.element-status-setting').prop('disabled', false);
		$('#closeButton').prop('disabled', false).removeClass("ui-state-disabled");
	}

	function displayPanel(settings) {
		$("#widgetChart").show();
		displayChart(settings.chartTypeId, settings.elementId, settings.elementName, settings.refreshInterval);
		$("body").height($(window).height());
	}

	function elementSort(arg1, arg2) {
		return naturalSort(arg1.name, arg2.name);
	}

	function populateIdSelector() {
		disableSettings();
		$('#elementId').empty().append($("<option />").val(-1).text("Loading..."));
		return api.getAllElements().then(function(elements) {
			clearStatusBar();
			enableSettings();
			// fill in element drop down list
			elements.sort(elementSort);
			var elementSelector = $('#elementId').empty();
			$.each(elements, function() {
				if (!this.isMonitored) {
					return;
				}
				elementSelector.append($("<option />").val(this.id).text(this.name));
			});
			if (elementStatusSettings.elementId >= 0) {
				elementSelector.val(elementStatusSettings.elementId);
			}
		}, function(error) {
			displayStatusBar(error, "Error Loading the List of Elements from up.time Controller");
		});
	}

	function goodLoad(settings) {
		clearStatusBar();
		if (settings) {
			// update hidden edit panel with settings
			$("#elementId").val(settings.elementId);
			$("#" + settings.chartTypeId).prop("checked", true);
			$("#refreshRate").val(settings.refreshInterval);
			$.extend(elementStatusSettings, settings);

			displayPanel(settings);
		} else if (uptimeGadget.isOwner()) {
			$('#widgetChart').hide();
			showEditPanel();
		}

	}

	function onGoodSave(savedSettings) {
		clearStatusBar();
		displayPanel(savedSettings);
	}

	function onBadAjax(error) {
		displayStatusBar(error, "Error Communicating with up.time");
	}

	function gadgetDimOn() {
		$.each(divsToDim, function(i, d) {
			var div = $(d);
			if (div.is(':visible') && div.css('opacity') > 0.6) {
				div.fadeTo('slow', 0.3);
			}
		});
	}

	function gadgetDimOff() {
		$.each(divsToDim, function(i, d) {
			var div = $(d);
			if (div.is(':visible') && div.css('opacity') < 0.6) {
				div.fadeTo('slow', 1);
			}
		});
	}

	function displayChart(chartType, elementId, elementName, refreshInterval) {
		if (myChart) {
			myChart.stopTimer();
			myChart.destroy();
			myChart = null;
		}

		if (chartType == "pie") {
			myChart = new UPTIME.ElementStatusPieChart({
				dimensions : myChartDimensions,
				chartDivId : "widgetChart",
				chartType : chartType,
				elementId : elementId,
				elementName : elementName,
				refreshInterval : refreshInterval
			}, displayStatusBar, clearStatusBar);
		} else {
			myChart = new UPTIME.ElementStatusBarChart({
				dimensions : myChartDimensions,
				chartDivId : "widgetChart",
				chartType : chartType,
				elementId : elementId,
				elementName : elementName,
				refreshInterval : refreshInterval
			}, displayStatusBar, clearStatusBar);
		}
		myChart.render();
	}

});
