//noinspection ThisExpressionReferencesGlobalObjectJS
/**
 * Turns `element` into interactive tab component and gives it the `enhancedClass`.
 * ...
 * The component has support for keyboard and assistive technologies using ARIA properties.
 */
(function (root, factory) {
	'use strict';
	if (typeof define === 'function' && define.amd) {
		define([
			'airhooks/forEach',
			'airhooks/containsClass',
			'airhooks/addClass',
			'airhooks/removeClass',
			'airhooks/addEventListener',
			'airhooks/removeEventListener'
		], factory);
	} else {
		root.expendible = factory(
			airhooks.forEach,
			airhooks.containsClass,
			airhooks.addClass,
			airhooks.removeClass,
			airhooks.addEventListener,
			airhooks.removeEventListener
		);
	}
}(this, function (forEach, containsClass, addClass, removeClass, addEventListener, removeEventListener) {
	'use strict';
	var doc = document;
	var KEY_CODES = {
		END:   35,
		HOME:  36,
		LEFT:  37,
		UP:    38,
		RIGHT: 39,
		DOWN:  40
	};

	/**
	 * @constructor
	 */
	function TabThat (element, options) {
		// only enhance if modern element selectors are supported
		if(!('querySelectorAll' in doc)){ return element; }
		if(element) {
			this.init(element, options);
		} else {
			var elements = doc.querySelectorAll('[data-tab-that]');
			forEach(elements, function(element){
				new TabThat(element, options);
			});
			return TabThat.instances;
		}
	}

	TabThat.instances = [];

	/**
	 * @param {HTMLElement} [element] - (See constructor)
	 * @param {Object} [options] - (See constructor)
	 */
	TabThat.prototype.init = function(element, options) {
		// define component properties
		this.element = element;
		this.settings = extend(this.getDefaults(element), options);
		this.tabs = [];
		this.panels = [];
		this.title = element.querySelector(this.settings.titleSelector).innerHTML;
		this.list = element.querySelector(this.settings.listSelector);
		this.handles = this.list.querySelectorAll('a');
		this.selectedIndex = -1;

		var selectedHandle = this.list.querySelector('a.' + this.settings.selectedClass);
		var selectedIndex = Math.max(0, indexOf(this.handles, selectedHandle));

		// register instance,link elements & bind events
		this.register();
		this.link();
		this.select(selectedIndex);
		this.bind();

		// mark element as enhanced
		this.element.isTabThat = true;
		this.element.tabThat = this;
		addClass(element, this.settings.enhancedClass);

		return this;
	};

	TabThat.prototype.destroy = function () {
		this.unregister();
		this.unlink();
		this.unbind();

		// remove enhanced states
		this.element.removeAttribute('isTabThat');
		this.element.removeAttribute('tabThat');
		removeClass(this.element, this.settings.enhancedClass);

		return this.element;
	};

	TabThat.prototype.getDefaults = function(element) {
		return  {
			titleSelector: '[data-tab-title]',
			listSelector: '[data-tab-list]',
			enhancedClass: 'is-tabbed',
			selectedClass: 'is-selected'
		};
	};

	TabThat.prototype.register = function() {
		TabThat.instances.push(this);
	};

	TabThat.prototype.unregister = function() {
		var index = indexOf(TabThat.instances, this);
		if(index >= 0) {
			TabThat.instances.splice(index, 1);
		}
	};

	TabThat.prototype.link = function() {
		var component = this;
		this.element.setAttribute('role','application');
		this.element.setAttribute('aria-label', this.title);
		this.list.setAttribute('role','tablist');
		forEach(this.handles, function(handle, index) {
			var panelId = handle.href.split('#')[1];
			var panel = doc.getElementById(panelId);
			handle.id = handle.id || panelId + '-handle';
			handle.setAttribute('role', 'tab');
			handle.setAttribute('aria-controls', panelId);
			handle.setAttribute('tabindex','-1');
			panel.setAttribute('role', 'tabpanel');
			panel.setAttribute('aria-labelledby', handle.id);
			handle.tabPanel = panel;
			panel.tabHandle = handle;
			component.tabs[index] = { handle: handle, panel: panel };
			component.panels[index] = panel;
		});
		return this;
	};

	TabThat.prototype.unlink = function() {
		this.element.removeAttribute('role');
		this.element.removeAttribute('aria-label');
		this.list.removeAttribute('role');
		forEach(this.handles, function(handle) {
			handle.removeAttribute('role');
			handle.removeAttribute('aria-controls');
			handle.removeAttribute('aria-selected');
			handle.removeAttribute('tabindex');
		});
		forEach(this.handles, function(panel) {
			panel.removeAttribute('role');
			panel.removeAttribute('aria-labelledby');
			panel.removeAttribute('aria-hidden');
		});
		return this;
	};

	/**
	 * @returns {TabThat} - Returns this instance for chainability.
	 */
	TabThat.prototype.bind = function() {
		var component = this;
		forEach(this.handles, function(handle, index) {
			addEventListener(handle, 'click', function(event) {
				event.preventDefault();
				component.select.call(component, index);
			});
			addEventListener(handle, 'keydown', function(event) {
				component.onKeydown.call(component, event);
			});
		});
		return this;
	};

	TabThat.prototype.onKeydown = function(event) {
		switch(event.keyCode) {
			case KEY_CODES.LEFT:
			case KEY_CODES.UP:
				this.selectPrevious();
				break;
			case KEY_CODES.RIGHT:
			case KEY_CODES.DOWN:
				this.selectNext();
				break;
			default:
				break;
		}
	};

	TabThat.prototype.unbind = function() {
		// @todo: remove click & keydown listeners
		return this;
	};

	TabThat.prototype.hideTab = function(index) {
		var tab = this.tabs[index];
		tab.handle.setAttribute('tabindex','-1');
		tab.handle.setAttribute('aria-selected', false);
		removeClass(tab.handle, this.settings.selectedClass);
		tab.panel.setAttribute('aria-hidden', true);
		removeClass(tab.panel, this.settings.selectedClass);
	};

	TabThat.prototype.showTab = function(index) {
		var tab = this.tabs[index];
		tab.handle.setAttribute('tabindex','0');
		tab.handle.setAttribute('aria-selected', true);
		addClass(tab.handle, this.settings.selectedClass);
		tab.panel.setAttribute('aria-hidden', false);
		addClass(tab.panel, this.settings.selectedClass);
		tab.handle.focus();
	};

	TabThat.prototype.select = function(index) {
		index = Math.min(Math.max(0, index), this.tabs.length -1);
		if(index === this.selectedIndex) { return; }
		if(this.selectedIndex >= 0){
			this.hideTab(this.selectedIndex);
		}
		this.selectedIndex = index;
		this.showTab(this.selectedIndex);
	};

	TabThat.prototype.selectPrev     =
	TabThat.prototype.selectPrevious = function() { this.select(this.selectedIndex -1); };
	TabThat.prototype.selectNext     = function() { this.select(this.selectedIndex +1); };
	TabThat.prototype.selectFirst    = function() { this.select(0); };
	TabThat.prototype.selectLast     = function() { this.select(this.tabs.length-1); };

	/**
	 * Helper method for Array.prototype.indexOf
	 * [MDN docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf)
	 * @param {Array} array
	 * @param {*} item
	 * @param {Number} [fromIndex]
	 * @returns {Number}
	 */
	function indexOf(array, item, fromIndex) {
		fromIndex = fromIndex || 0;
		var nativeIndexOf = Array.prototype.indexOf;
		if(nativeIndexOf && array.indexOf === nativeIndexOf) {
			return array.indexOf(item, fromIndex);
		} else {
			for(var index = fromIndex, length = array.length; index < length; index++){
				if(array[index] === item){ return index; }
			}
			return -1;
		}
	}

	/**
	 * Shallow extend first object with properties of a second object.
	 * @param {Object} obj1
	 * @param {Object} obj2
	 */
	function extend(obj1, obj2) {
		for (var prop in obj2) {
			if (obj2.hasOwnProperty(prop)) {
				obj1[prop] = obj2[prop];
			}
		}
		return obj1;
	}

	/**
	 * Returns true if child is a descendant of parent.
	 * Borrowed from: http://stackoverflow.com/a/18162093
	 * @param {HTMLElement} child
	 * @param {HTMLElement} parent
	 * @return {Boolean}
	 */
	function childOf(child, parent){
		//noinspection StatementWithEmptyBodyJS
		while((child=child.parentNode) && child !== parent);
		return !!child;
	}

	return TabThat;
}));