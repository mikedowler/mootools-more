/*
Script: IframeShim.js
	Defines IframeShim, a class for obscuring select lists and flash objects in IE.

	License:
		MIT-style license.

	Authors:
		Aaron Newton
*/

var IframeShim = new Class({

	Implements: [Options, Events, Class.Occlude],

	options: {
		className: 'iframeShim',
		display: false,
		zIndex: null,
		margin: 0,
		offset: {x: 0, y: 0},
		browsers: (Browser.Engine.trident4 || (Browser.Engine.gecko && !Browser.Engine.gecko19 && Browser.Platform.mac))
	},

	property: 'IframeShim',

	initialize: function(element, options){
		this.element = $(element);
		if (this.occlude()) return this.occluded;
		this.setOptions(options);
		if(this.options.browsers){
		  var zIndex = this.element.getStyle('zIndex').toInt();
			if (!zIndex){
				var pos = this.element.getStyle('position');
				if (pos == "static" || !pos) this.element.setStyle('position', 'relative');
				this.element.setStyle('zIndex', zIndex);
			}
			this.shim = new Iframe({
				src: (window.location.protocol == 'https') ? '://0' : 'javascript:void(0)',
				scrolling: 'no',
				frameborder: 0,
				styles: {
					zIndex: ($chk(this.options.zIndex) && zIndex > this.options.zIndex) ? this.options.zIndex : zIndex - 1,
					position: 'absolute',
					border: 'none',
					filter: 'progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0)'
				},
				'class': this.options.className
			}).store('IframeShim', this);
			var inject = (function(){
				this.shim.inject(this.element, 'after');
				this[this.options.display ? 'show' : 'hide']();
				this.fireEvent('inject');
			}).bind(this);
			if (Browser.Engine.trident && !IframeShim.ready) window.addEvent('load', inject);
			else inject();
		} else {
			this.position = this.hide = this.show = this.dispose = $lambda(this);
		}
	},

	position: function(){
		if (!IframeShim.ready) return this;
		var size = this.element.measure(function(){ return this.getSize(); });
		if ($type(this.options.margin)){
			size.x = size.x - (this.options.margin * 2);
			size.y = size.y - (this.options.margin * 2);
			this.options.offset.x += this.options.margin;
			this.options.offset.y += this.options.margin;
		}
		if (this.shim) {
			this.shim.set({width: size.x, height: size.y}).position({
				relativeTo: this.element,
				offset: this.options.offset
			});
		}
		return this;
	},

	hide: function(){
		if (this.shim) this.shim.hide();
		return this;
	},

	show: function(){
		if (this.shim) this.shim.show();
		return this.position();
	},

	dispose: function(){
		if (this.shim) this.shim.dispose();
		return this;
	},

	destroy: function(){
		if (this.shim) this.shim.desroy();
		return this;
	}

});

window.addEvent('load', function(){
	IframeShim.ready = true;
});