var dataChart = (function(dataChart){
	//public vars
	dataChart.rawData 		= [];
	dataChart.formattedData = [];
	dataChart.chartId 		= 'chart';
	dataChart.opts = {
        chart: {
            type: 'spline'
        },
        title: {
            text: 'Looking For Stuff'
        },
        subtitle: {
            text: 'Data from Something'
        },
        xAxis: {
            type: 'datetime',
            labels: {
                overflow: 'justify'
            }
        },
        yAxis: {
            title: {
                text: 'nums'
            },
            min: 0,
            minorGridLineWidth: 0,
            gridLineWidth: 0,
            alternateGridColor: null
        },
        tooltip: {
            valueSuffix: ' nums'
        },
        plotOptions: {
            spline: {
                lineWidth: 1,
                animation: true,
                states: {
                    hover: {
                        lineWidth: 2
                    }
                },
                marker: {
                    enabled: false
                }
            }
        },
        series: [],
        navigation: {
            menuItemStyle: {
                fontSize: '10px'
            }
        }
    };

    dataChart.init = function(json, chartId){
    	dataChart.rawData = json;
    	dataChart.chartId = chartId;
    	dataChart.process(json);
    	dataChart.draw();
    	attachEventListeners();
    };

    dataChart.process = function(json){
    	dataChart.opts.series = [];

    	$.each(json, function(index, obj){
    		var tempData = [];

    		$.each(obj.history, function(index2, obj2){
    			tempData.push([obj2.timestamp*1000, obj2.reading]);
    		});

    		tempData.sort(function(a, b){
    			return a[0] - b[0];
    		});

    		dataChart.opts.series.push({
    			name: obj.id,
    			data: tempData
    		});
    		dataChart.formattedData.push(tempData);
    	});

    	dataChart.firstDay = dataHelper.getFirstDay(dataChart.opts.series);
    	dataChart.lastDay = dataHelper.getLastDay(dataChart.opts.series);
    	dataChart.currentDay = dataChart.firstDay;

    	dataChart.opts.xAxis.min = dataChart.currentDay;
    	dataChart.opts.xAxis.max = dataChart.currentDay + 86400000;//1 day

    	dataChart.firstDayDisplay 	= new Date(dataChart.firstDay);
		dataChart.lastDayDisplay 	= new Date(dataChart.lastDay);
		dataChart.currentDayDisplay = new Date(dataChart.currentDay);

		//otherwise the displaying date will be off by the timezone
		dataChart.firstDayDisplay.setTime(dataChart.firstDayDisplay.getTime() + dataChart.firstDayDisplay.getTimezoneOffset()*60*1000);
		dataChart.lastDayDisplay.setTime(dataChart.lastDayDisplay.getTime() + dataChart.lastDayDisplay.getTimezoneOffset()*60*1000);
		dataChart.currentDayDisplay.setTime(dataChart.currentDayDisplay.getTime() + dataChart.currentDayDisplay.getTimezoneOffset()*60*1000);

		dataChart.firstDayDisplay 	= (dataChart.firstDayDisplay.getMonth()+1) + '-' + dataChart.firstDayDisplay.getDate() + '-' + dataChart.firstDayDisplay.getFullYear();
		dataChart.lastDayDisplay 	= (dataChart.lastDayDisplay.getMonth()+1) + '-' + dataChart.lastDayDisplay.getDate() + '-' + dataChart.lastDayDisplay.getFullYear();
		dataChart.currentDayDisplay = (dataChart.currentDayDisplay.getMonth()+1) + '-' + dataChart.currentDayDisplay.getDate() + '-' + dataChart.currentDayDisplay.getFullYear();

    	dataChart.updateDisplayDates();
    };

    dataChart.draw = function(){
    	$('#' + dataChart.chartId).highcharts(dataChart.opts);
    };

    dataChart.updateDisplayDates = function(){
    	$('#firstDay span').text(dataChart.firstDayDisplay);
    	$('#lastDay span').text(dataChart.lastDayDisplay);
    	$('#currentDay span').text(dataChart.currentDayDisplay);
    };

    dataChart.doNextDay = function(){
    	var chart = $('#'+dataChart.chartId).highcharts();

    	if(dataChart.currentDay >= dataChart.lastDay - 86400000){
    		return;
    	}

    	dataChart.opts.xAxis.min = dataChart.currentDay + 86400000;
    	dataChart.opts.xAxis.max = dataChart.currentDay + 86400000 + 86400000;

    	dataChart.currentDay += 86400000;

    	//just for display
		dataChart.currentDayDisplay = new Date(dataChart.currentDay);
		dataChart.currentDayDisplay.setTime(dataChart.currentDayDisplay.getTime() + dataChart.currentDayDisplay.getTimezoneOffset()*60*1000);
		dataChart.currentDayDisplay = (dataChart.currentDayDisplay.getMonth()+1) + '-' + dataChart.currentDayDisplay.getDate() + '-' + dataChart.currentDayDisplay.getFullYear();

		dataChart.updateDisplayDates();
    	dataChart.draw();
    };

    dataChart.doPreviousDay = function(){
    	var chart = $('#'+dataChart.chartId).highcharts();

    	if(dataChart.currentDay <= dataChart.firstDay){
    		return;
    	}

    	dataChart.opts.xAxis.min = dataChart.currentDay - 86400000;
    	dataChart.opts.xAxis.max = dataChart.currentDay;

    	dataChart.currentDay -= 86400000;

    	//just for display
		dataChart.currentDayDisplay = new Date(dataChart.currentDay);
		dataChart.currentDayDisplay.setTime(dataChart.currentDayDisplay.getTime() + dataChart.currentDayDisplay.getTimezoneOffset()*60*1000);
		dataChart.currentDayDisplay = (dataChart.currentDayDisplay.getMonth()+1) + '-' + dataChart.currentDayDisplay.getDate() + '-' + dataChart.currentDayDisplay.getFullYear();

		dataChart.updateDisplayDates();
    	dataChart.draw();
    };


    function attachEventListeners(){
    	$(document).on('click', '#previousDay', function(){
    		dataChart.doPreviousDay();
    	});
    	$(document).on('click', '#nextDay', function(){
    		dataChart.doNextDay();
    	});
    }


	return dataChart;
})(dataChart || {});

var dataHelper = (function(dataHelper){
	dataHelper.getFirstDay = function(data){
		var smallest = data[0].data[0][0];

		$.each(data, function(index, obj){
			$.each(obj.data, function(index2, obj2){
				if(obj2[0] < smallest){
					smallest = obj2[0];
				}
			});
		});
		return smallest;
	};
	dataHelper.getLastDay = function(data){
		var biggest = data[0].data[0][0];

		$.each(data, function(index, obj){
			$.each(obj.data, function(index2, obj2){
				if(obj2[0] > biggest){
					biggest = obj2[0];
				}
			});
		});
		return biggest;
	};

	return dataHelper;
})(dataHelper || {});