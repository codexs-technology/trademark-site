const calendarArea = d3.select('#processing-calendar');
const calendarAreaJS = document.getElementById("processing-calendar");
let styleSettings = ".icon-bg {color: #ffd966;}.alert {padding: 1rem;display:flex;align-items:center;}.alert.alert-tm {border:2px solid #162e51;background-color:#ffd966;font-size: 15px;line-height:1.5}.alert.alert-tm .alert-icon {display:block;width:auto;margin-right:1.2rem;}.alert.alert-tm .cal-dates{font-size:22px;}.alert.alert-tm a.alert-link {color:#005ea2;font-size:15px;} .py-2{padding-top:0.5rem;padding-bottom:0.5rem;}.mb-2{margin-bottom:0.5rem;}.ml-4{margin-left:1.5rem;}";
let widgetType = "full-width";

(function ($, Drupal) {
    Drupal.behaviors.tmProcessingBehavior = {
        attach: function (context, settings, drupalSettings) {
			let tmProcessingFileLocation = "/dashboard/topojson/";//settings.usptoViz.mapFileLocation + "/";
			let tmProcessingDataFile = tmProcessingFileLocation + "TMCurrentProcessing.csv";

            jQuery(document).ready(function () {
				if (calendarAreaJS.previousSibling.innerHTML === "" && calendarAreaJS.nextSibling.innerHTML === "") {
					calendarAreaJS.previousSibling.remove();
					calendarAreaJS.nextSibling.remove();
				}
                d3.csv(tmProcessingDataFile).then(function (tmProcessingData) {
					const tParser = d3.timeParse("%Y-%m-%d");
					if (window.location.href.endsWith("how-long-does-it-take-register") 
						|| window.location.href.endsWith("checking-status-application-or-registration")
					    || window.location.href.endsWith("check-status-view-documents")
					    || window.location.href.includes("158425")
						|| window.location.href.includes("195593")
						|| window.location.href.includes("158448")
					) {
						widgetType = "square";
						calendarAreaJS.classList.add("smaller");
						styleSettings += ".calendar-space.smaller{width:40%;float:right;margin:0.5rem 0 0.5rem 0.5rem;}.calendar-space.smaller .alert.alert-tm {font-size: 14px;line-height:1.5}.calendar-space.smaller .alert.alert-tm .cal-dates{font-size:18px;padding:0.5rem 0;}.calendar-space.smaller .alert.alert-tm a.alert-link {font-size:14px;}";
					}
					let startDate = tParser(tmProcessingData[0]['StartDate']);
					let endDate = tParser(tmProcessingData[0]['EndDate']);
					let calStyles = calendarArea.append("style").html(styleSettings);
					let calContent = calendarArea.append("div").attr("class", "alert alert-tm").attr("role", "alert");
					if (widgetType === "full-width") {
						let calIconSpace = calContent.append("div").attr("class", "alert-icon");
						let calIconHolder = calIconSpace.append("div").attr("class", "fa-4x");
						let calIconLayers = calIconHolder.append("span").attr("class", "fa-layers fa-fw");
						calIconLayers.append("i").attr("class", "fas fa-hourglass-end");
						calIconLayers.append("i").attr("class", "fas fa-hourglass-half");
						calIconLayers.append("i").attr("class", "fas fa-circle  icon-bg").attr("data-fa-transform", "shrink-8.8 down-4 right-4");
						calIconLayers.append("i").attr("class", "fas fa-clock").attr("data-fa-transform", "shrink-10 down-4 right-4");
					}
					
					let calContentDiv = calContent.append("div").attr("class", "alert-content");
					calContentDiv.append("div").html("We are currently examining <strong>new applications</strong> submitted between:");
					if (widgetType === "full-width") {
						calContentDiv.append("div").attr("class", "cal-dates").html("<strong>" + d3.timeFormat("%B %d, %Y")(startDate) + " - " + d3.timeFormat("%B %d, %Y")(endDate) + "</strong>");
					} else {
						calContentDiv.append("div").attr("class", "cal-dates").html("<strong>" + d3.timeFormat("%b. %d, %Y")(startDate) + " - " + d3.timeFormat("%b. %d, %Y")(endDate) + "</strong>");
					}
					if (window.location.href.indexOf("trademarks/application-timeline") > -1) {
						calContentDiv.append("div").html("For average Trademark wait times, see the tables below. ");
					} else {
						calContentDiv.append("div").html("For average Trademark filing wait times, visit the <a class='alert-link' href='/trademarks/application-timeline' target='_blank'>Current wait times webpage</a>.");
					}
				});
			});
		}
	};
})(jQuery, Drupal, drupalSettings);