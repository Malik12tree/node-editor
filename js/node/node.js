class ValPoint {
	constructor({ element, type, nnode, field, id }) {
		this.type = type;
		this.nnode = nnode;
		this.field = field;
		this.id = id;
		this.node = $(`<div class="valpoint ${type === 'source' ? 'right' : 'left'}" vstyle=${field.type}></div>`);
		this.line = new LineRenderer({ color: 'grey' });

		this.target = null;
		this.source = null;

		this.node[0].jsnode = this;

		if (true || this.type === 'source') {
			onMouseDownMove(this.node, 'default',
				() => this.type == 'source' ? this.updateStart() : this?.source?.updateEnd?.(),
				e => {
					if (this.type == 'source') {
					
						this.line.end = [e.x, e.y];
						this.line.update();
					
					} else if (this.source){
						
						this.source.line.end = [e.x, e.y];
						this.source.line.update();
					}
				},
				e => {
					const scope = this.type == 'source' ? this: this.source;
					if (!scope) return;

					if (
						e.target.jsnode instanceof ValPoint &&
						e.target.jsnode.type != scope.type &&
						e.target.jsnode.nnode != scope.nnode &&
						CanConvertTo(scope.field.type, e.target.jsnode.field.type)
					) {
						scope.to(e.target.jsnode);
					} else {
						if (!scope.disconnect()) {
							// Todo: open ctx menu
						}
					}

					scope.updateLine();
				}
			)
		}

		element.append(this.node);
	}
	// this.target.source -> *this

	// Works only for sources 
	disconnect() {
		if (this.target) {
			this.target.nnode.nodeOf(this.target.id).removeClass('connected');

			const temp = this.target.source;
			this.target.source = null;
			this.target = null;
			temp.updateLine();
			return true;
		} else if (this.source) {
			this.source.disconnect();
		}
		// Canvas.preview();
		return false;
	}

	// Works only for sources
	// Takes a target
	connect(vpoint) {
		if (vpoint.source) {
			vpoint.source.target = null;
			vpoint.source.updateLine();
		}
		vpoint.source = this;
		this.target = vpoint;

		vpoint.nnode.nodeOf(vpoint.id).addClass('connected');
		Canvas.preview();
	}
	to(node) {
		this.disconnect();
		this.connect(node);
	}
	updateLine() {
		if (this.target) {
			this.updateStart();
			this.updateEnd();
		} else {
			this.line.end = this.line.start.slice();
		}
		this.line.update();
		return this;
	}
	getCenter() {
		const rect = this.node[0].getBoundingClientRect();
		return [rect.left + rect.width / 2, rect.top + rect.height / 2];
	}
	updateStart() {
		this.line.start = this.getCenter();
	}
	updateEnd() {
		this.line.end = this.target?.getCenter() || this.line.end;
	}
}
const FieldOptions = {
	/** Default value of the input */
	value: 0,
	/** 
	 * Input type
	 * @type {'number' | 'select' | 'file' | 'folder' | 'checkbox' | 'color' | 'vector' | 'matrix' |'any'}
	 */
	type: '',
	/** Label */
	label: '',
	/**
	 * Options for the select type. 
	 * @type {{[id: String]: String}} 
	 */
	options: {},
	/** Min value of number types. */
	min: 0,
	/** Max value of number types. */
	max: 0,
	/** Step value of number types. */
	step: 0,
	output: false,
	input: false,
	emit: () => { },
	/** @type {() => Boolean} */
	condition: () => false,
}
const NodeOptions = {
	/** The defualt title */
	title: '',
	/** The id */
	id: '',
	/** @type {{[id: string]: FieldOptions}} */
	form: FieldOptions,
	/** The defualt width */
	width: 0,
	/** 
	 * The defualt color
	 * @type {`#${String}`}
	 */
	color: '',
}

class NNode {
	static registers = [];
	static menu = new Menu([
		new Action({
			name: 'Select'
		}),
		new Action({
			name: 'Deselect'
		}),
		'_',
		new Action({
			name: 'Copy',
			keybind: { key: 'c', ctrlKey: true }
		}),
		new Action({
			name: 'Paste'
		}),
		new Action({
			name: 'Duplicate'
		}),
		'_',
		new Action({
			name: 'Delete'
		}),
	]);

	static form = {};
	static id = '';
	static all = [];
	static categeory = 'Input';
	static title = '';

	/** @param {NodeOptions} data */
	constructor(data = {}) {
		NNode.all.push(this);
		this.title = data.title ?? this.constructor.title;
		this.width = data.width ?? this.constructor.width;
		this.color = data.color ?? this.constructor.color;
		this.form = data.form ?? this.constructor.form;
		
		this.id = data.id ?? ID();

		/** @type {{[id: String]: ValPoint}} */
		this.valpoints = {}

		this.node = $(`<div class="node" data-node="${this.constructor.name}" open><div class="title"><span></span></div><div class="flow"></div></div>`);
		//<span>${this.id}</span>
		this.node[0].jsnode = this;

		this.build();

		this.node.on('input', () => {
			this.updateConditions();
		})

		this.node.draggable({
			cursor: 'move',
			handle: this.node.children('.title'),
			containment: '.nodearea',
			drag: () => {
				for (const id in this.valpoints) {
					const vpoint = this.valpoints[id];
					vpoint.updateLine();
					vpoint.source?.updateLine();
				}
			},
			stop: () => {
				for (const id in this.valpoints) {
					const vpoint = this.valpoints[id];
					vpoint.updateLine();
					vpoint.source?.updateLine();
				}
			}
		});

		this.updateStyles();
		this.updateConditions();
	}
	updateConditions() {
		const conditions = this.getConditionalFields();
		for (const id in this.form) {
			const field = this.form[id];
			const entry = this.nodeOf(id)[0];
			if (!entry) continue;

			if (field.condition === undefined || field.condition?.(conditions)) {
				entry.style.display = '';
			} else {
				if (field.output || field.input) {
					this.valpoints[id].disconnect();
					this.valpoints[id].updateLine();
				}
				entry.style.display = 'none';
			}
		}
	}
	updateStyles() {
		this.node[0].style.width = this.width + 'px';
		this.node
			.find('>.title')
			.attr({ style: 'background:' + this.color })
			.children('span')
			.text(this.title);
	}
	nodeOf(id) {
		return this.node.find(`>.flow>*:has(#${id})`);
	}
	setValues(values) {
		for (const key in values) {
			const value = values[key];
			if (!this.form[key]) continue;

			const entry = this.nodeOf(key);
			const input = entry.children().first()
			if (input.is('input[type=checkbox]')) {
				input[0].checked = value;
			} else if (entry.is('#nms')) {
				input[0].jsnode.setValue(value)
			} else {
				input.val(value);
			}
		}
	}
	getOutput(field) {
		return field.emit(this.getValues());
	}
	getConditionalFields() {
		const result = {}

		for (const id in this.form) {
			const field = this.form[id];
			if (field.output) continue;

			const entry = this.nodeOf(id);
			const input = entry.children('#' + id);
			if (input.length && isConditional(input[0])) {
				result[id] = val(input);
			}
		}

		return result
	}
	getValues() {
		const result = {};
		for (const id in this.form) {
			const field = this.form[id];
			if (field.output) continue;

			const entry = this.nodeOf(id);
			const input = entry.children('#' + id);
			if (field.input && this.valpoints[id].source) {
				result[id] = ConvertTo(this.valpoints[id].source.nnode.getOutput(this.valpoints[id].source.field), field.type);
			} else {
				result[id] = val(input);
			}
		}
		return result;
	}
	build() {
		const wrapper = this.node.children('.flow');
		for (const id in this.form) {
			const field = this.form[id];
			if (field.output) {
				wrapper.append(`<div class="entry"><span id="${id}">${field.label || 'Value'}</span></div>`);
				this.valpoints[id] = new ValPoint({ type: 'source', field: field, nnode: this, id, element: wrapper.children(':last-child') });
			} else {
				let c = '';
				switch (field.type) {
					case 'select':
						c = `<select id='${id}'y>${Object.keys(field.options).map(o => {
							if (field.options[o] === '_') return;
							return `<option value="${o}" ${field.value === o ? 'selected' : ''}>${field.options[o]}</option>`;
						}).join('')}</select>`;
						break;
					case 'checkbox':
						c = `<input type="checkbox" id='${id}'><label for='${id}'>${field.label}</label>`;
						break;
					case 'color':
						c = `<input type="color" title="#ffffff" id='${id}' value="#ffffff">`;
						if (field.label) {
							c = `<label for='${id}'>${field.label}</label>` + c;
						}
						break;
					case 'text':
						c = `<input type="text" id='${id}' placeholder="${field.label}">`;
						break;
					case 'any':
						c = `<span l id="${id}">${field.label || 'Value'}</span>`;
						break;
				}
				if (field.type === 'number') {
					wrapper.append(`<div class="entry" id="nms" label="${field.label || 'Value'}"></div>`);
					wrapper.children(':last-child').append(new NumberSlider({
						label: field.label || 'Value',
						value: field.value,
						min: field.min,
						max: field.max,
						step: field.step,
						id: id,
					}).node);
				}
				else if (field.type === 'vector') {
					wrapper.append(`<div class="entry" label="${field.label || 'Value'}" column><div id="${id}" class=vectorcomponent><span>${field.label || 'Vector'}</span></div></div>`);
					['x', 'y', 'z'].forEach(axis => {
						wrapper.children(':last-child').children('.vectorcomponent').append(new NumberSlider({
							step: .05,
							id: id + axis,
						}).node);
					});
				}
				else if (field.type === 'gradient') {
					wrapper.append(`<div class="entry"></div>`);
					wrapper.children(':last-child').append(new ColorRamp({id}).node);
				}
				else {
					wrapper.append(`<div class="entry" label="${field.label}">${c}</div>`);
				}
				if (field.input) {
					this.valpoints[id] = new ValPoint({
						element: wrapper.children(':last-child'),
						field: field,
						type: 'target',
						nnode: this,
						id
					});
				}
			}
		}
	}
	setPosition(x, y) {
		this.node[0].style.left = x + 'px';
		this.node[0].style.top = y + 'px';
		return this;
	}
	/**
	 * @param  {...NNode} node 
	 * @returns node
	 */
	static register(...node) {
		this.registers.push(...node);
		return node;
	}

	static addMenu;
	static searchMenu;
	static updateAddMenu() {
		this.registers.sort((a, b) => a.name.localeCompare(b.name));

		const actions = [];
		const _actions = {};
		let i = 0;
		this.registers.forEach(node => {
			if (!(node.categeory in _actions)) {

				_actions[node.categeory] = i;

				actions.push(new Action({
					name: node.categeory,
					children: [],
				}));
				i++;
			}

			actions[_actions[node.categeory]].children.push(new Action({
				name: node.title,
				click(e) {
					const addedNode = new node();
					addedNode.setPosition(mouse_pos.x, mouse_pos.y);
					$('.nodearea').append(addedNode.node);
				}
			}));
		});
		actions.sort((a, b) => a.name.localeCompare(b.name));
		this.addMenu = new Menu(actions);
		this.addMenu.isContextual = true;
		this.searchMenu = new SearchMenu(this.addMenu, {min: 1});
		return this.addMenu;
	}
}

new Keybind({
	key: 'a',
	shiftKey: true,
	run() {
		NNode.addMenu?.show?.(mouse_pos.x, mouse_pos.y);
	}
})

RegisterContexualWidget(NNode);