var Highlighter;

(function($) {

	Highlighter = function() {

		// Attr
		var listItem = [];
		var current = -1;

		// Util
		var update = function() {

			listItem.forEach(function(elem) {

				elem.body.find(".highlight-control div:first").addClass(
						"btn-group");
				elem.body.find(".next-lighter-button, .prev-lighter-button")
						.removeClass("hidden");
			});

			var firstView = listItem[0];

			firstView.body.find(".highlight-control > div").removeClass(
					"btn-group");
			firstView.body.find(".prev-lighter-button").addClass("hidden");

			var lastView = listItem[listItem.length - 1];

			lastView.body.find(".highlight-control > div").removeClass(
					"btn-group");
			lastView.body.find(".next-lighter-button").addClass("hidden");
		};

		var hasActive = function() {

			var active = false;

			listItem.forEach(function(elem) {
				active |= elem.active;
			});

			return active;
		};

		// Navigation
		var next = function() {

			lightOff(current);

			if ((current + 1) <= (listItem.length - 1)) {
				current++;
			}

			lightOn(current);
		};

		var prev = function() {

			lightOff(current);

			if ((current - 1) >= 0) {
				current--;
			}

			lightOn(current);
		};

		var allOff = function() {

			current = -1;

			for ( var i = 0; i < listItem.length; i++) {

				lightOff(i);
			}
		};

		var addEnvironment = function() {

			var body = $("body:first");

			var background = $("#background-lighter");
			var background_box = $("#background-lighter-box");
			var background_glass = $("#background-lighter-glass");

			if (!background[0]) {

				background = $("<div>");
				background.attr("id", "background-lighter");

				body.append(background);
			}

			if (!background_box[0]) {

				background_box = $("<div>");
				background_box.attr("id", "background-lighter-box");

				body.append(background_box);
			}

			if (!background_glass[0]) {

				background_glass = $("<div>");
				background_glass.attr("id", "background-lighter-glass");

				body.append(background_glass);
			}
		};

		var removeEnvironment = function() {

			$("#background-lighter").remove();
			$("#background-lighter-box").remove();
			$("#background-lighter-glass").remove();
		};

		// Behavior
		var lightItem = function(item) {

			var background_box = $("#background-lighter-box");
			var background_glass = $("#background-lighter-glass");

			background_box.removeClass("hidden");
			background_glass.removeClass("hidden");

			var targetPosition = item.target.offset();

			var border = 5;
			var boxConfig = {
				"top" : targetPosition.top - border,
				"left" : targetPosition.left - border,
				"width" : item.target.outerWidth() + border + border,
				"height" : item.target.outerHeight() + border + border,
			};

			background_box.css(boxConfig);
			background_glass.css(boxConfig);

//			item.target
			background_glass.popover({

				"animation" : true,
				"placement" : function() {

					// Better place ?

					return "right";
				},
				"trigger" : "manual",
				"title" : item.title,
				"content" : item.body,
				"delay" : {
					"show" : 500,
					"hide" : 100,
				},
			});

			item.target.addClass("lighter-target");

//			item.target
			background_glass.popover("show");
		};

		var lightModal = function(item) {

			var background_box = $("#background-lighter-box");
			var background_glass = $("#background-lighter-glass");

			background_box.addClass("hidden");
			background_glass.addClass("hidden");

			item.body.modal({
				"backdrop" : false,
				"keyboard" : false,
			});
		};

		var lightOn = function(index) {

			var item = listItem[index];

			if (item) {

				addEnvironment();

				switch (item.type) {
				case "item":

					lightItem(item);

					break;
				case "modal":

					lightModal(item);

					break;
				}

				item.body.find(".prev-lighter-button").on("click", function() {
					prev();
				});
				item.body.find(".next-lighter-button").on("click", function() {
					next();
				});

				item.active = true;
			}
		};

		var lightOff = function(index) {

			var item = listItem[index];

			if (item) {

				switch (item.type) {
				case "item":

					item.target.removeClass("lighter-target");
//					item.target.popover("destroy");
					
					$("#background-lighter-glass").popover("destroy");

					break;

				case "modal":

					item.body.modal("hide");
					// item.view.remove();

					break;
				}

				if (!hasActive()) {
					removeEnvironment();
				}
			}
		};

		// Resource
		var viewTemplate = $("<div class='highlight'>"
				+ "<div class='highlight-body'></div>"
				+ "<div class='highlight-control'></div>" + "</div>");

		var controlTemplate = $("<div class='btn-group'>"
				+ "<button class='btn prev-lighter-button'><i class='icon-circle-arrow-left'></i> Anterior</button>"
				+ "<button class='btn next-lighter-button'>Pr&oacuteximo <i class='icon-circle-arrow-right'></i></button>"
				+ "</div>");

		var modalTemplate = $("<div class='modal' role='dialog' aria-hidden='true'>"
				+ "<div class='modal-header'>"
				+ "<h3></h3>"
				+ "</div>"
				+ "<div class='modal-body'>"
				+ "</div>"
				+ "<div class='modal-footer highlight-control'>"
				+ "</div>"
				+ "</div>");

		// Public

		/**
		 * Options # target :: Target of the light # title :: Title of the
		 * Popover # text :: Text body of the Popover # body :: Body (HTML) that
		 * will substitute the text
		 */
		this.addItem = function(options) {

			options = options ? options : {};

			var body = options.text || options.body;
			var title = options.title ? options.title : "";

			var target = options.target;

			if (body) {

				if (target) {

					var view = viewTemplate.clone();

					view.find(".highlight-body").append(body);
					view.find(".highlight-control").append(
							controlTemplate.clone());

					listItem.push({
						"target" : $(target),
						"body" : view,
						"title" : title,
						"active" : false,
						"type" : "item",
					});

				} else {

					var view = modalTemplate.clone();

					view.find(".modal-header h3").append(title);
					view.find(".modal-body").append(body);

					view.find(".highlight-control").append(
							controlTemplate.clone());

					listItem.push({
						"body" : view,
						"active" : false,
						"type" : "modal",
					});
				}

				update();
			}
		};

		this.start = function() {
			next();
		};
	};

}(jQuery));