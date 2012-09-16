var Highlighter;

(function($) {

	Highlighter = function() {
		
		var self = this;
		
		{
			$(document).off("lighter-start").on("lighter-start", function(evt, page) {

				if (page) {
					self.start( page );
				}
			});
			
			$(document).off("lighter-end").on("lighter-end", function(evt) {
				self.end();
			});
			
			$(window).off("resize.lighter").on("resize.lighter", function() {
				
				var timer = $(this).data("resize_lighter");
				
				clearTimeout(timer);
				
				timer = setTimeout(function() {
					
					lightOff( steps[ currentStep ].current );
					lightOn( steps[ currentStep ].current );
					
				}, 100);
				
				$(this).data("resize_lighter", timer);
			});
		}
		
		// Attr
		var steps = [
			// id: {
			// --> list :: []
			// --> current :: #
			// }
		];
		var total = 0;
		
		var currentStep = -1;
		
		// Util
		var update = function() {
			
			total++;
			
			var first = -1, last;
			var counter = 1;
		
			steps.forEach(function(listItem, i) {
				
				listItem.list.forEach(function(elem) {
					
					elem.titleView = "{0}{1}".format( elem.title, "<span class='pull-right'>{0}/{1}</span>".format( counter++, total ) )
					
					elem.body.find(".highlight-control div:first").addClass("btn-group");
					
					elem.body.find(".next-lighter-button, .prev-lighter-button").removeClass("hidden");
					elem.body.find(".init-lighter-button, .end-lighter-button").addClass("hidden");
					
					if (elem.glass === false) {
						elem.body.find(".highlight-control div:first").removeClass("btn-group");
						elem.body.find(".next-lighter-button").addClass("hidden");
					}
				});
				
				
				var firstItem = listItem.list[0];
				
				firstItem.body.find(".highlight-control > div").removeClass("btn-group");
				firstItem.body.find(".prev-lighter-button").addClass("hidden");
				
				if(first == -1) { first = i } last = i;
			});

			var firstItem = steps[ first ].list[0];
			
			firstItem.body.find(".highlight-control > div").removeClass("btn-group");
			
			firstItem.body.find(".init-lighter-button").removeClass("hidden");
			firstItem.body.find(".next-lighter-button, .prev-lighter-button").addClass("hidden");
			
			var lastItem = steps[ last ].list[ steps[ last ].list.length - 1 ];
			
			lastItem.body.find(".next-lighter-button").addClass("hidden");
			lastItem.body.find(".end-lighter-button").removeClass("hidden");
		};

		// Navigation
		this.next = function() {

			lightOff( steps[ currentStep ].current );

			if ((steps[ currentStep ].current + 1) <= ( steps[ currentStep ].list.length - 1)) {
				steps[ currentStep ].current++;
			}

			lightOn( steps[ currentStep ].current );
		};

		this.prev = function() {

			lightOff( steps[ currentStep ].current );

			if ((steps[ currentStep ].current - 1) >= 0) {
				steps[ currentStep ].current--;
			}

			lightOn( steps[ currentStep ].current );
		};

		var addEnvironment = function() {

			var body = $("body:first");

			var background = $("#background-lighter");
			var background_box = $("#background-lighter-box");
			var background_glass = $("#background-lighter-glass");

			if (!background[0]) {

				background = $("<div>");
				background.attr("id", "background-lighter");
				background.addClass("fade in out");

				body.append(background);
			}

			if (!background_box[0]) {

				background_box = $("<div>");
				background_box.attr("id", "background-lighter-box");
				background_box.addClass("fade in out");

				body.append(background_box);
			}

			if (!background_glass[0]) {

				background_glass = $("<div>");
				background_glass.attr("id", "background-lighter-glass");
				background_glass.addClass("fade in out");

				body.append(background_glass);
			}
		};

		var removeEnvironment = function() {

			$("#background-lighter").remove();
			$("#background-lighter-box").remove();
			$("#background-lighter-glass").remove();
			
			$("body").children(".modal, .popover").remove();
			
			if ( steps[ currentStep ] ) {
				for( var i = 0; i < steps[ currentStep ].list.length; i++ ) {
					lightOff(i)
				}
			}
		};

		// Behavior
		var lightItem = function(item) {

			var background_box = $("#background-lighter-box");
			var background_glass = $("#background-lighter-glass");

			background_box.removeClass("hidden");
			background_glass.removeClass("hidden");

			if ( !item.glass ) {
				background_glass.addClass("hidden");
			}
			
			item.target = $(item.target);
			
			var targetPosition = item.target.offset();

			var border = 5;
			var boxConfig = {
				"top" : targetPosition.top - border,
				"left" : targetPosition.left - border,
				"width" : item.target.outerWidth() + (border * 2),
				"height" : item.target.outerHeight() + (border * 2),
			};

			background_box.css(boxConfig);
			background_glass.css(boxConfig);

			background_box.popover({

				"animation" : true,
				"placement" : function() {
					
					if( item.position ) {
						return item.position;
					}
					
					var totalWidth = window.innerWidth;
					var totalHeight = window.innerHeight;
					
					// 1, 3, 4, 5, 6
					if ( boxConfig.left <= (totalWidth / 2) ) {
						
						// 3, 4
						if( ( boxConfig.left >= ( totalWidth / 4 ) ) || ( boxConfig.width >= ( totalWidth / 2 ) ) ) {
							
							// 3, 5
							if ( boxConfig.top <= ( totalHeight / 2 ) ) {
								
								return "bottom";
							}
							// 4, 6
							else {
								return "top";
							}
						}
						
						return "right"
					} 
					// 2
					else {
						
						return "left";
					}
				},
				"trigger" : "manual",
				"title" : item.titleView,
				"content" : item.body,
				"delay" : {
					"show" : 500,
					"hide" : 100,
				},
			});

			item.target.addClass("lighter-target");

			// If Element is not visible
			if ( item.forceUp ) {
				
				var zIndex = parseInt( item.target.css("z-index") );
				var parent = item.target.parent();
				
				var make = false;
				
				while (true) {
					
					if( parent.is("body") ) { break; }
					
					var parentIndex = parent.css("z-index");
					
					if (parentIndex != "auto") {
						parentIndex = parseInt( parentIndex );
						
						if( parentIndex < zIndex ) {
							
							make = true;
							break;
						}
					}
					
					parent = parent.parent();
				}
				
				if( make ) {
					
					var phantomElement = item.target.clone(true, true);
					
					phantomElement.css({
						"position": "absolute",
						"top": targetPosition.top,
						"left": targetPosition.left,
					});
					
					item.targetPhantom = phantomElement;
					
					$("body").append( phantomElement );
				}
			}
			// END
			
			background_box.popover("show");
		};

		var lightModal = function(item) {

			var background_box = $("#background-lighter-box");
			var background_glass = $("#background-lighter-glass");

			background_box.addClass("hidden");
			background_glass.addClass("hidden");
			
			item.body.find(".modal-header h3").html( item.titleView );
			
			item.body.modal({
				"backdrop" : false,
				"keyboard" : false,
			});
		};

		var lightOn = function(index) {

			var item = steps[ currentStep ].list[ index ];

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

				item.body.find(".prev-lighter-button").off("click").on("click", function() { 
					
					if ( item.onPrev && typeof item.onPrev == "function" ) {
						
						var result = item.onPrev.apply( item.body, [ item.target ] );
						
						if ( result !== false ) {
							self.prev();
						}
					} else {
						self.prev(); 
					}
				});
				
				item.body.find(".next-lighter-button, .init-lighter-button, .end-lighter-button").off("click").on("click", function() { 

					if ( item.onNext && typeof item.onNext == "function" ) {
						
						var result = item.onNext.apply( item.body, [ item.target ] );
						
						if ( result !== false ) {
							self.next();
						}
					} else {
						self.next(); 
					}
				});
				
				item.body.find(".end-lighter-button").on("click", function(){
					
					removeEnvironment();
				});
				
				if ( item.target && item.onClick ) {
					
					item.target.add( $( item.targetPhantom ) ).off("click.lighter").on("click.lighter", function() {
						
						if ( item.onClick && typeof item.onClick == "function" ) {
							
							item.onClick.apply( item.body, [ item.target ] );
						}
					});
				}
				
				if ( item.onComplete && typeof item.onComplete == "function") {
					item.onComplete.apply( item.body );
				}
			}
		};

		var lightOff = function(index) {

			var item = steps[ currentStep ].list[ index ];

			if (item) {

				switch (item.type) {
				case "item":

					$(item.target).removeClass("lighter-target");
					if( item.targetPhantom ) {
						item.targetPhantom.remove();
					}
					
					$("#background-lighter-box").popover("destroy");

					break;

				case "modal":

					$(item.body).modal("hide");

					break;
				}
			}
		};

		// Resource
		var viewTemplate = $("<div class='highlight'>"
				+ "<div class='highlight-body'></div>"
				+ "<div class='highlight-control'></div>" + "</div>");

		var controlTemplate = $("<div class='btn-group'>"
				+ "<button class='btn prev-lighter-button'><i class='icon-step-backward'></i> Anterior</button>"
				+ "<button class='btn next-lighter-button'>Pr&oacuteximo <i class='icon-step-forward'></i></button>"
				+ "<button class='btn init-lighter-button'><i class='icon-play'></i> Iniciar</button>"
				+ "<button class='btn end-lighter-button'>Terminar <i class='icon-stop'></i></button>"
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
		 * Options 
		 * # target 	:: Target of the light 
		 * # title 		:: Title of the Popover 
		 * # body 		:: Body (HTML) that will substitute the text
		 * # position 	:: Force position of the Popover (top, bottom, left, right)
		 * # glass		:: Set glass on or off
		 * # onNext		:: Callback on Next Button is pressed
		 * # onPrev		:: Callback on Prev Button is pressed
		 * # onClick	:: Callback on Click on Target
		 * # onComplete :: Callback on a Light is completed
		 * # forceUp	:: Force the item to bubble up
		 */
		this.addItem = function( options, page ) {
			
			options = options ? options : {};

			options.title = "title" in options ? options.title : "";
			options.glass = "glass" in options ? options.glass : true;

			page = page ? page : 1;

			if ( options.body ) {
				
				if ( !steps[ page ] ) {
					
					steps[ page ] = {
						"list": [],
						"current": -1,
					};
				}
				
				if ( options.target ) {

					var view = viewTemplate.clone();

					view.find(".highlight-body").append( options.body );
					view.find(".highlight-control").append( controlTemplate.clone() );

					steps[ page ].list.push({
						"target" : options.target,
						"body" : view,
						"title" : options.title,
						"type" : "item",
						"position": options.position,
						"glass": options.glass,
						"onNext": options.onNext,
						"onPrev": options.onPrev,
						"onClick": options.onClick,
						"forceUp": options.forceUp,
						
						"onComplete": options.onComplete,
					});
					
				} else {

					var view = modalTemplate.clone();

					view.find(".modal-body").append( options.body );
					view.find(".highlight-control").append( controlTemplate.clone() );

					steps[ page ].list.push({
						"body" : view,
						"title": options.title,
						"type" : "modal",
						"onNext": options.onNext,
						"onPrev": options.onPrev,
						
						"onComplete": options.onComplete,
					});
				}

				update();
			}
		};

		this.start = function( page ) {
			page = page ? page : 1

			var oldPage = self.oldPage ? self.oldPage : -1;
			
			if ( page && page > oldPage ) {
				removeEnvironment();
						
				currentStep = page;
				
				self.oldPage = page;
				
				self.next();
			}
		};
		
		this.end = function() {
			removeEnvironment();
		};
	};

}(jQuery));