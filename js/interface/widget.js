const Widgets = {};
class Widget {
	/**
	 * @param {{name:String,id:String,condition:Boolean|Function,node:JQuery<HTMLElement>,value:any,category:String}}} param 
	 */
	static skipFrame = false;
	constructor(data) {
		this.name = data.name;
		this.id = data.id;
		this.condition = data.condition;
		this.node = data.node;
		this.value = data.value;
		this.category = data.category;
		if (this.id) {
			Widgets[this.id] = this;
		}
	}
	conditionMet() {
		switch (typeof this.condition) {
			case 'undefined': return true;
			case 'boolean': return this.condition;
			case 'function': return this.condition();;
		}
	}
	updateVisiblilty() {
		if (!this.node) return;

		this.node[0].style.display = this.conditionMet() ? '' : 'block';

		return this;
	}
}

class NumberSlider {
	constructor(data) {
		this.label = data.label;
		this.value = data.value || 0;
		this.min = data.min != undefined ? data.min : -Infinity;
		this.max = data.max != undefined ? data.max : Infinity;
		this.step = data.step || .1;
		this.onchange = data.onchange;
		this.style = (this.min != -Infinity && this.max != Infinity) && !data.ignoreStyle ? 'liquid' : 'horns';

		this.id = data.id || '';

		this.node = $('<div class="number-slider"><i class="ns-left material-icons" >chevron_left</i><p></p><input type="text" value="0" class="ignorehov"><i class="ns-right material-icons">chevron_right</i></div>');
		this.node.attr({ id: this.id });
		this.node[0].jsnode = this;

		this.updateValues(false);

		this.node.children('p').on('click', e => {
			this.node.addClass('editing');
			this.node.children('input').select();
		});
		this.node.children('input').on('blur', e => {
			this.node.removeClass('editing');

			this.value = e.target.value * 1;
			this.updateValues();
		})

		this.node.children('.ns-left').on('click', () => {
			this.value -= this.step;
			this.updateValues()
		});
		this.node.children('.ns-right').on('click', () => {
			this.value += this.step;
			this.updateValues()
		});

		const mousedownpos = { x: 0, y: 0 }
		let width;
		let oldValue = 0;
		onMouseDownMove(this.node, 'ew-resize',
			e => {
				mousedownpos.x = e.x;
				mousedownpos.y = e.y;
				oldValue = this.value;
				width = this.node.width();
			},
			e => {
				let offset = e.x - mousedownpos.x;
				if (e.shiftKey) offset /= 10;

				this.value = (oldValue + offset / width * this.step*10);
				this.updateValues();
			});
	}
	setValue(value) {
		this.value = value;
		this.updateValues(false);
	}
	parseValue() { }
	updateValues(trigger = true) {
		this.value = Math.clamp(Math.floorTo(this.value, this.step), this.min, this.max);
		trigger && this.onchange?.(this.value);

		if (this.style == 'liquid') {
			this.node.attr({ style: '--lwidth:' + Math.invLerp(this.value, this.min, this.max) * 100 + '%' })
		}

		const fixedValue = this.step == 1 ? this.value: this.value.toFixed(3);
		if (this.label)
			this.node.children('p').html(`<span>${this.label}</span><span>${fixedValue}</span>`);
		else
			this.node.children('p').html(`<span single>${fixedValue}</span>`);

		this.node.children('input').val(fixedValue)
	}
}
class LineRenderer {
	constructor(data = {}) {
		this.start = data.start || [0, 0];
		this.end = data.end || [0, 0];
		this.color = data.color || 'black';


		this.node = document.createElementNS('http://www.w3.org/2000/svg', "path");
		this.update();
		document.getElementById('post').append(this.node);
	}
	update() {
		if
			(
			this.start[0] === this.end[0] &&
			this.start[1] === this.end[1]
		) {
			this.node.setAttribute('d', '');
			return;
		}
		const vertexA = this.start.join(' ');
		const vertexAHandle = this.start.slice().sub(0, 25).join(' ');
		const vertexB = this.end.join(' ');
		const vertexBHandle = this.end.slice().add(0, 25).join(' ');
		this.node.setAttribute('d', `M ${vertexA} C ${vertexAHandle}, ${vertexBHandle}, ${vertexB}`);
		this.node.setAttribute('stroke', this.color);

	}
}
function TabHandeler(element, defualt, ontab) {
	const pages = element.siblings().first();

	pages.children().each(function () {
		this.style.display = 'none';
		if (defualt == this.id) {
			this.style.display = '';
		}
	})

	element.children().each(function (i) {
		const $this = $(this);
		const name = $this.attr('value');


		$this.on('click', (e) => {
			pages.children().each(function () {
				this.style.display = 'none';
				if (name == this.id) {
					ontab(this);
					this.style.display = '';
				}
			})
		})
	})
}

class ColorPicker {
	constructor(element, options) {
		this.node =
			$(`
<div class="colorpicker">
	<div class="picker">
	</div>
	<div class="colorinfo">
		<div class="tabs">
			<input type="radio" name="citab" value="RGB">
			<input type="radio" name="citab" value="HSL" checked>
			<input type="radio" name="citab" value="Hex">
		</div>
		<div class="pages">
			<div id="RGB"></div>
			<div id="HSL"></div>
			<div id="Hex">
				<input type="text" value="#ffffff">
			</div>
		</div>
	</div>
	<div class="colordisplay"></div>
</div>
`);
		//
		this.onchange = options.onchange;
		this.display = this.node.find(".colordisplay");
		this.picker = this.node.find(".picker").spectrum({
			flat: true,
			containerClassName: 'picker',
			color: '#ffffff',
			move: color => {
				this.updateColorFromWheel(color)
			}
		});
		this.color = new Color(255, 255, 255);
		this.node[0].jsnode = this;

		element.append(this.node[0]);

		// Todo: move to .init()
		const pages = this.node.find('>.colorinfo>.pages>*');
		$(pages[0]).append(
			new NumberSlider({
				label: 'R',
				min: 0,
				max: 1,
				step: .01,
				sensivity: .1,
				onchange: value => { this.color.r = value; this.updateWheel() }
			}).node,
			new NumberSlider({
				label: 'G',
				min: 0,
				max: 1,
				step: .01,
				sensivity: .1,
				onchange: value => { this.color.g = value; this.updateWheel() }
			}).node,
			new NumberSlider({
				label: 'B',
				min: 0,
				max: 1,
				step: .01,
				sensivity: .1,
				onchange: value => { this.color.b = value; this.updateWheel() }
			}).node,
		)

		const _huechange = () => {
			if (!pages[1].children.length) return;

			const children = pages[1].children;
			const h = children[0].jsnode.value;
			const s = children[1].jsnode.value;
			const l = children[2].jsnode.value;
			this.color.fromHSL(h, s, l);

			this.updateWheel();
		}
		$(pages[1]).append(
			new NumberSlider({
				label: 'H',
				min: 0,
				max: 360,
				step: 1,
				sensivity: .1,
				onchange: _huechange
			}).node,
			new NumberSlider({
				label: 'S',
				min: 0,
				max: 1,
				step: .01,
				sensivity: .5,
				onchange: _huechange
			}).node,
			new NumberSlider({
				label: 'L',
				min: 0,
				max: 1,
				step: .01,
				sensivity: .5,
				value: 1,
				onchange: _huechange
			}).node,
		)
		pages[2].children[0].on('input', e => {
			this.color.fromHex(e.target.value);
			this.updateWheel();
		})

		this.tab = this.node.find('>.colorinfo>.pages>#HSL')[0];
		TabHandeler(this.node.find('>.colorinfo>.tabs'), 'HSL', tab => {
			this.tab = tab;
			this.updateInputs();
		})
	}
	updateInputs() {
		const children = this.tab.children;
		switch (this.tab.id) {
			case 'RGB':
				children[0].jsnode.setValue(this.color.r);
				children[1].jsnode.setValue(this.color.g);
				children[2].jsnode.setValue(this.color.b);
				break;
			case 'HSL':
				const hsl = this.color.toHSL();
				children[0].jsnode.setValue(hsl[0]);
				children[1].jsnode.setValue(hsl[1]);
				children[2].jsnode.setValue(hsl[2]);
				break;
			case 'Hex':
				children[0].value = '#' + this.color.toHex();
				break;
		}
	}
	setDisplay(color) {
		this.onchange?.(color);
		this.display[0].style.backgroundColor = color;
	}
	updateWheel() {
		const col = '#' + this.color.toHex();
		this.picker.spectrum('set', col).spectrum('reflow');
		this.setDisplay(col);
	}
	updateColorFromWheel(color) {
		this.color.fromTinyColor(color || this.picker.spectrum('get'));

		this.setDisplay('#' + color.toHex());
		this.updateInputs();
	}
	hide() {
		this.node.remove();
		delete this;
	}
	setColor(color) {
		this.color.fromHex(color);
		this.updateWheel();
		this.updateInputs();
	}
}

class MovementControl {
	/**
	 * @param {HTMLElement} node 
	 */
	constructor(node, movebg) {
		this.zoom = 100;
		this.x = 0;
		this.y = 0;
		this.movebg = movebg;

		this.node = node;
		node.addEventListener('wheel', e => {
			if (e.ctrlKey) {
				this.zoom += e.deltaY;
				this.updateZoom();
			}
		});
		onMouseDownMove(this.node, 'auto',
			null,
			e => {
				if (!e.shiftKey) return;
				this.x += e.movementX;
				this.y += e.movementY;
				this.updateZoom();
			});
	}
	updateZoom() {
		this.node.style.transform = `scale(${this.zoom / 100}) translate(${this.x}px, ${this.y}px)`;
		if (this.movebg) {
			this.node.style.backgroundPosition = `${this.x}px ${this.y}px`;
		}
	}
}
// new MovementControl(document.body, true);

class Action extends Widget {
	static all = {};
	constructor(data) {
		data = data || {};
		super(data);
		
		this.children = data.children || [];
		this.click = data.click;
		this.keybind = data.keybind && new Keybind(data.keybind);
		
		this.node = $(`<li class="menuItem"><a>${this.name}</a><label class="keybind_label">${this.keybind ?? ''}</label></li>`);

		this.node[0].on('mouseover', () => {
			this.node.siblings().removeClass("focus");
			this.node.addClass("focus");
		})

		this.node[0].on("click", e => {
			e.stopPropagation();
			this?.click?.(e);
			
			Menu.activeMenu.node.find('.focus').removeClass('focus');
			Menu.activeMenu.hide();
		})

		if (this.keybind) {
			this.keybind.run = () => {
				if (document.body.contains(this.node[0])) {
					this.node.click();
				} else {
					this.click?.();
				}
			}
		}
	}
	hover() {
		this.node.trigger('mouseover');
	}
}
class Menu {
	static activeMenu;
	constructor(structure, options = {}) {
		this.node = null;
		this.isContextual = false;
		this.structure = structure || [];
		this.id = options.id;

	}
	equals(otherMenu) {
		return this.id === otherMenu.id;
	}
	getAction(path = '', moreData = false) {
		let dirs = path.split(".");
		let extraData = { index: -1 };
		let index = dirs.last() * 1;
		if (!isNaN(index)) {
			if (moreData) {
				extraData.index = index;
			}
			dirs.pop()
		}

		let target;
		let i = 0;
		while (dirs.length) {
			let currentDir = dirs.splice(0, 1)[0];
			target = Widgets[currentDir];
			if (moreData && dirs.length - 1 === i) {
				extraData.parent = Widgets[currentDir];
			}
			i++;
		}
		if (moreData) {
			extraData.target = target;
			return extraData;
		}
		return target;
	}
	addAction(path, action) {
		if (typeof action == 'string') {
			action = Widgets[action];
		}

		let index = path.split(".").last() * 1;
		let target = this.getAction(path);
		let targetStructure = target.children;

		if (!isNaN(index)) {
			targetStructure.splice(index, 0, action.id);
			return target;
		}
		targetStructure.push(action.id);
		return target;
	}
	removeAction(path) {
		let data = this.getAction(path, true);

		if (data.index != -1) {
			data.target.children.splice(data.index, 1)
			return data.target;
		}
		let index = data.parent.children.findIndex(e => e == data.target.id);
		if (index !== -1) {
			data.parent.children.splice(index, 1)
		}

		return data.target;
	}
	show(x = 0, y = 0) {
		if (Menu.activeMenu) {
			Menu.activeMenu.hide();
		}
		Menu.activeMenu = this;
		this.build();
		this.node.addClass("force");
		const scope = this;

		if (x instanceof HTMLElement) x = $(x);
		if (typeof x == 'number') {
			this.node[0].style.left = x + 'px';
			this.node[0].style.top = y + 'px';

			document.body.append(this.node[0]);

		} else if (x instanceof jQuery) {
			x.append(this.node);
		}

		document.body.addEventListener('click', click);
		function click(e) {
			const path = $(e.composedPath());
			if (path.is("li.menuItem") || path.is('[ignoremenu]')) {
				return;
			}

			scope.hide();
			document.body.removeEventListener('mouseup', click);
		}
		if (this.onOpen) {
			this.onOpen();
		}
		
		this.node[0].style.minWidth = this.node.width() + 'px';

		return this;
	}
	hide() {
		Menu.activeMenu = undefined;
		this.node.detach();
		if (this.onClose) {
			this.onClose();
		}
	}
	build() {
		const c = n => $(document.createElement(n));
		const scope = this;

		// a populate
		function buildListFromTree(node, isRoot) {
			if (isRoot) {
				node.node = c("ul");
			}
			
			if (!node.children.empty) {
				node.node.addClass("parent")
			}

			if (node.children && !node.children.empty) {
				!isRoot && node.node.children("ul").remove();
				!isRoot && node.node.append(c("ul"))
			
				node.children.forEach(child => {
					if (child == '_') {
						const seprator = $("<hr class='actionSeparator'>");
						
						if (!isRoot) {
							node.node.children().last().append(seprator);
						} else {
							node.node.append(seprator);
						}

					} else {
						child = Widgets[child] || child;

						if (child.conditionMet()) {
							buildListFromTree(child);
							
							if (isRoot) {
								node.node.append(child.node);
							} else {
								node.node.children().last().append(child.node);
							}
						}
					}
				});
			}
		}

		const menu = { children: this.structure }

		buildListFromTree(menu, true);

		menu.node.addClass("menu");

		menu.node.attr("id", this.id || '');

		this.node = menu.node;

		this.isContextual && this.node.addClass('contextual')

		return this.node;
	}
}
class SearchMenu extends Menu {
	constructor(menu, options) {
		super([]);
		this.menu = menu;
		this.min = options.min ?? 0;
		this.max = options.max ?? Infinity;
		this.node = $('<ul class="searchmenu menu force"><div class="search" ignoremenu><input type="text" /></div></ul>');
		this.gathered = [];

		this.node.find('>.search>input').on('input', () => this.search());

		this.onClose = () => {
			this.gathered.forEach(action => {
				action.node[0].style.display = '';
			})
		}
	}
    build() {
		this.gathered = [];

		const populate = (action, index) => {
			if (index >= this.min && index <= this.max) {
				this.node.append(action.node);
				this.gathered.push(action);
			}
			
			action.children?.forEach(action => populate(action, index + 1) )
		}
		this.menu.structure.forEach(action => populate(action, 0));
    }
	search() {
		const searchTerm = this.node.find('>.search>input').val().trim();
		const searchRegex = new RegExp(searchTerm, 'i');

		this.gathered.forEach(action => {
			if (action.name.match(searchRegex)) {
				this.node.append(action.node);
			} else {
				action.node.detach();
			}
		})
	}
}

function RegisterContexualWidget(widget) {
	widget.menu.isContextual = true;

	document.body.addEventListener('contextmenu', e => {
		e.preventDefault();

		const target = jselementFromEvent(e, widget);
		if (!target) return;

		widget.menu.show(e.x, e.y);
	})
}

class ColorRamp {
	constructor({id}) {
		this.stops = [];

		this.indexSlider = new NumberSlider({ ignoreStyle: true, step: 1, min: 0, onchange: (value) => {
			this.setSelected(this.stops[value]);
		}});
		this.posSlider   = new NumberSlider({ label: 'Pos', min: 0, max: 1, ignoreStyle: true, step: .01, onchange: (value) => {
			this.setStopPos(this.selected, value);
		}});
		this.selected = null;
		this.id = id;

		this.build();
	
		this.addStop();
		this.addStop();
		this.stops[1].color.r = 1;
		this.stops[1].color.g = 1;
		this.stops[1].color.b = 1;
		this.setSelected(this.selected); // update

		this.update();
	}
	reset() {
		this.stops.forEach((stop) => this.removeStop(stop));
		this.setStopPos(this.stops[0], 0 , false);
		this.setStopPos(this.stops[1], 1 , false);
		
		this.stops[0].color.r = this.stops[0].color.g = this.stops[0].color.b = 0;
		this.stops[1].color.r = this.stops[1].color.g = this.stops[1].color.b = 1;
		
		this.update();
		this.setSelected(this.selected); // update
	}
	toJson(hex = false) {
		const _stops = [];
		const _colors = [];
		this.stops.forEach(stop => {
			_stops.push(stop.pos);
			if (hex) {
				_colors.push(stop.color.toHex());
			} else {
				_colors.push(stop.color);
			}
		});
		return {stops: _stops, colors: _colors}
	}
	setStopPos(stop, pos, update = true) {
		pos = Math.clamp(pos, 0, 1);
		stop.pos = pos;
		this.posSlider.setValue(pos);

		stop.node[0].style.left = cssPercent(pos);
		
		update && this.update();
	}
	addStopNode(stop) {
		const snode = $(`<stop style="--c:#${stop.color.toHex()}; left: ${cssPercent(stop.pos)}"></stop>`);
		snode[0].jsnode = stop;

		stop.node = snode;

		let width;
		onMouseDownMove(snode, 'auto', () => width = this.node.width(), e => {
			this.setStopPos(stop, stop.pos + e.movementX / width / devicePixelRatio);
		});
		this.node.children('.slider').append(snode);
	}
	addStop(specific) {
		let color;
		let pos;

		if (specific != undefined) {
			pos = specific;
			color = this.getColorAt(pos);
		}
		else if (this.stops.empty) {
			color = new Color();
			pos = 0;
		} 
		else if (!(1 in this.stops)) {
			color = this.stops[0].color.clone();
			pos = 1;
		}
		else {
			pos = (this.stops[0].pos + this.stops[1].pos) / 2;
			color = this.stops[0].color.clone().lerp(this.stops[1].color, 0.5);
		}
		const stop = { color, pos }
		

		this.indexSlider.max = this.stops.length;
		this.update();
		this.stops.push(stop);
		this.sort();
		this.addStopNode(stop);
		this.setSelected(stop);
	}
	setSelected(stop) {
		this.selected = stop;

		this.indexSlider.setValue(this.stops.findIndex(e => e == stop));
		this.posSlider.setValue(stop.pos);

		const colorInput = this.node.find('>.color>input')[0];
		colorInput.value = '#'+this.selected.color.toHex();
	}
	getColorAt(t) {
		const bounds = this.getBoundsOf(t);
		const percentBetweenBounds = Math.invLerp(t, bounds[0].pos, bounds[1].pos);

		return bounds[0].color.clone().lerp(bounds[1].color, percentBetweenBounds);
	}
	getBoundsOf(t) {
		const stopsLength = this.stops.length;

		if (t <= this.stops[0]?.pos) {
			return [this.stops[0], this.stops[0]]
		} else if (t >= this.stops.at(-1)?.pos) {
			return [this.stops.at(-1), this.stops.at(-1)]
		}

		for (let i = stopsLength-1; i > 0; i--) {
			const curr = this.stops[i];
			const prev = this.stops[i-1];
			if (t >= prev.pos && t <= curr.pos) {
				return [prev, curr]
			}
		}
	}
	sort() {
		return this.stops.sort((a,b) => a.pos - b.pos);
	}
	update() {
		this.sort();
		let gradient = 'linear-gradient(90deg,';
		const lastStopIndex = this.stops.length - 1;
		
		this.stops.forEach((stop, i) => {
			const hex = '#'+stop.color.toHex();

			stop.node[0].style.setProperty('--c', hex)
			
			gradient += ` ${hex} ${Math.floor(stop.pos * 100)}%`
			
			if (i != lastStopIndex) gradient += ','
		});
		this.node.children('.slider')[0].style.background = gradient + ')';
	}
	removeStop(stop) {
		if (!(2 in this.stops)) {
			return;
		}
		stop.node.remove();
		const index = this.stops.indexOf(stop);
		this.stops.splice(index, 1);
		if (stop === this.selected) {
			this.setSelected(this.stops[0]);
		}
		this.update();
	}
	updateInputs() {
		this.setSelected(this.selected);
		return this;
	}
	static menu = new Menu([
		new Action({
			name: 'Flip Color Ramp',
			click() {
				ColorRamp.activeramp.stops.forEach(stop => {
					ColorRamp.activeramp.setStopPos(stop, 1 - stop.pos, false);
				});
				ColorRamp.activeramp.updateInputs().update();
			}
		}),
		new Action({
			name: 'Justify Stops from Left',
			click() {
				const offset = 1 / ColorRamp.activeramp.stops.length;
				ColorRamp.activeramp.stops.forEach((stop,i) => {
					ColorRamp.activeramp.setStopPos(stop, offset * i, false);
				});
				ColorRamp.activeramp.updateInputs().update();
			}
		}),
		new Action({
			name: 'Justify Stops Evenly',
			click() {
				const offset = 1 / (ColorRamp.activeramp.stops.length - 1);
				ColorRamp.activeramp.stops.forEach((stop,i) => {
					ColorRamp.activeramp.setStopPos(stop, offset * i, false);
				});
				ColorRamp.activeramp.updateInputs().update();
			}
		}),
		new Action({
			name: 'Reset Color Ramp',
			click() {
				ColorRamp.activeramp.reset();
			}
		}),
	]);
	static activeramp;

	build() {
		this.node = $(`<div class="colorramp" id="${this.id}"><div class="modify"><div class="buttons"><i class="material-icons">add</i><i class="material-icons">remove</i><i class="material-icons">expand_more</i></div><div class="modes"><select><option value="cardinal">Cardinal</option><option value="constant">Constant</option><option value="ease">Ease</option><option value="linear" selected>Linear</option><option value="spline">Spline</option></select></div></div><div class="slider"></div><div class="options"></div><div class="color"><input type="color"/></div></div>`);
		this.node[0].jsnode = this;

		const buttons = this.node.find('>.modify>.buttons>*');
		buttons[0].addEventListener('click', () => this.addStop());
		buttons[1].addEventListener('click', () => {
			this.removeStop(this.selected);
		})
		
		buttons[2].addEventListener('mouseup', e => {
			if (e.target != buttons[2]) return;
			if (e.button != 0) return;
			
			setTimeout(() => {
				ColorRamp.activeramp = this;
				ColorRamp.menu.show(buttons[2]);
			}, 0);
		})

		const colorInput = this.node.find('>.color>input')[0];
		colorInput.onchange = value => {
			this.selected.color.fromHex(value);
			this.update();
		}
		
		const children = this.node.children();

		children[1].addEventListener('mousedown', e => {
			if (e.target.jsnode) {
				this.setSelected(e.target.jsnode);
				return;
			}

			const width = this.node.width()
			const time = e.offsetX / width;
			this.addStop(time);
		})
		children[2].append(this.indexSlider.node[0]);
		children[2].append(this.posSlider.node[0]);
	}
}

Object.defineProperty(Array.prototype, 'empty', {
	get() {
		return !(0 in this);
	}
})

document.addEventListener('keydown', e => {
	const menu = Menu.activeMenu;
	if (!menu) return;
	if (menu.structure.empty) return;

	const selected = menu.structure.findIndex(e => e.node.hasClass('focus'));

	if (selected == undefined) {
		return menu.structure[0].hover();
	}
	
	switch (e.key) {
		case 'ArrowUp':
			return menu.structure[((selected - 1) + menu.structure.length) % menu.structure.length].hover();
		case 'ArrowDown':
			return menu.structure[(selected + 1) % menu.structure.length].hover();
	}
});