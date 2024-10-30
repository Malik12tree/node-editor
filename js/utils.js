const Reuseable = {
	vec3: new THREE.Vector3,
	vec2: new THREE.Vector2,
}

// Math
Math.clamp = function (x, min, max = Infinity) {
	if (x <= min) return min;
	if (x >= max) return max;
	return x;
}
Math._func_to = function (x, factor, fn) {
	if (factor == 0 || x == 0) {
		return x;
	}
	factor *= Math.sign(x);
	return Math[fn](x / factor) * factor;
}
Math.roundTo = function (x, factor) { return Math._func_to(x, factor, 'round') }
Math.floorTo = function (x, factor) { return Math._func_to(x, factor, 'floor') }
Math.ceilTo = function (x, factor) { return Math._func_to(x, factor, 'ceil') }

Math.vlength = (x, y) => {
	return Math.sqrt(x * x + y * y);
}
Math.vdistance = (x1, y1, x2, y2) => {
	const dx = x2 - x1;
	const dy = y2 - y1;
	return Math.vlength(dx, dy);
}
Math.lerp = function (a, b, t) {
	return a + (b - a) * t;
}
Math.invLerp = function (x, min, max) {
	return (x - min) / (max - min);
}
Math.radToDeg = function (x) {
	return (180 / Math.PI) * x;
}
Math.degToRad = function (x) {
	return (Math.PI / 180) * x;
}
Math.radifiy = function (x) {
	return (x + 360) % 360;
}

// Arrays
Array.prototype.add = function (...operands) {
	if (operands[0] instanceof Array) operands = operands[0];
	const thisLength = this.length
	for (let i = 0; i < thisLength; i++) {
		this[i] = this[i] + (operands[i] || 0);
	}
	return this;
}
Array.prototype.sub = function (...operands) {
	if (operands[0] instanceof Array) operands = operands[0];
	const thisLength = this.length
	for (let i = 0; i < thisLength; i++) {
		this[i] = this[i] - (operands[i] || 0);
	}
	return this;
}
Array.prototype.mul = function (...operands) {
	if (operands[0] instanceof Array) operands = operands[0];
	const thisLength = this.length
	for (let i = 0; i < thisLength; i++) {
		this[i] = this[i] * (operands[i] === undefined ? 1 : operands[i]);
	}
	return this;
}
Array.prototype.div = function (...operands) {
	if (operands[0] instanceof Array) operands = operands[0];
	const thisLength = this.length
	for (let i = 0; i < thisLength; i++) {
		this[i] = this[i] / (operands[i] === undefined ? 1 : operands[i]);
	}
	return this;
}


// Functions
/**
 * @param {HTMLElement|JQuery} element 
 * @param {String} listners 
 * @param {Function} cb 
 */
function addEventListeners(element, listners, cb) {
	listners.split(' ').forEach(e => {
		element.on(e, cb);
	});
}

HTMLElement.prototype.on = HTMLElement.prototype.addEventListener;
/**
 * @param {HTMLElement | JQuery} element 
 * @param {(event: MouseEvent) => void} down 
 * @param {(event: MouseEvent) => void} move 
 * @param {(event: MouseEvent) => void} up 
 */
function onMouseDownMove(element, cursor, down, move, up, boundray = false) {
	if (typeof cursor === 'function') {
		onMouseDownMove(element, 'auto', cursor, move, up);
		return;
	}

	let isDown = false;
	element.on('mousedown', function (e) {
		document.body.style.cursor = cursor || 'auto';
		isDown = true;
		if (down) down(e.originalEvent || e);
	});
	document.body.addEventListener('mousemove', function (e) {
		if (isDown && move) move(e);
	})
	addEventListeners(document.body, 'mouseup mouseleave', function (e) {
		if (isDown) {
			document.body.style.cursor = 'auto';
			if (up) up(e);
		}
		isDown = false;
	})
	if (boundray) {
		addEventListeners(element, 'mouseleave', function (e) {
			if (isDown) {
				document.body.style.cursor = 'auto';
				if (up) up(e);
			}
			isDown = false;
		})
	}
}
function intToFloat(value) {
	if (value.toString().match(/\.(\d+?)$/)) {
		return value.toString();
	}
	return value + '.';
}

/**
 * 
 * @param {Event} event 
 * @param {new () => any} js 
 */
function jselementFromEvent(event, js) {
	return event.composedPath().find(e => e.jsnode instanceof js)?.jsnode || null;
}

function val(jqelement) {

	if (jqelement.is('input[type=checkbox]')) {
		return jqelement[0].checked;
	}
	else if (jqelement.is('input[type=color]')) {
		return new Color().fromHex(jqelement.val());
	}
	else if (jqelement.parent()[0].id == 'nms') {
		return jqelement.parent().find('span:nth-child(2)').text() * 1;
	}
	else if (jqelement.is('.colorramp')) {
		return jqelement[0].jsnode.toJson();
	}
	else if (jqelement.is('.vectorcomponent')) {
		const vec = {};

		jqelement.children('.number-slider').each((i, c) => {
			vec[['x', 'y', 'z'][i]] = $(c).find('span:last-child').text() * 1;
		})
		return vec;
	}
	return jqelement.val();
}
function isConditional(element) {
	return ['SELECT'].includes(element.tagName) || element.getAttribute('type') === 'checkbox' || element.jsnode instanceof ColorRamp;
}

function fireEvent(evname, data, element = document.body) {
	if (document.createEvent) {
		const event = new Event(evname, data ?? {});
		element.dispatchEvent(event);
	} else {
		const event = document.createEventObject();
		event.eventName = evname;
		event.eventType = evname;
		element.fireEvent("on" + event.eventType, event);
	}
}

const mouse_pos = { x: 0, y: 0 }
document.body.addEventListener('mousemove', e => {
	mouse_pos.x = e.x;
	mouse_pos.y = e.y;
});

function cssPercent(t) {
	return `${Math.clamp(Math.floor(t * 100), 0, 100)}%`
}
Math.diff = function (a, b) {
	return Math.abs(a - b);
}

// Algorithms
const Levenshtein = {
	tail(string) { 
		return string.substr(1); 
	},
	get(a, b) {
		const lal = a.length; // |a|;
		const lbl = b.length; // |b|;

		if (lbl == 0) return lal;
		if (lal == 0) return lbl;
		if (a[0] == b[0]) return this.get(this.tail(a), this.tail(b));

		const test1 = this.get(this.tail(a), b);
		const test2 = this.get(a, this.tail(b));
		const test3 = this.get(this.tail(a), this.tail(b));

		return 1 + Math.min( test1, test2, test3)
	},
}

/**
 * @param {THREE.Vector2} a1 Line 1 starting position
 * @param {THREE.Vector2} a2 Line 1 starting position
 * @param {THREE.Vector2} b1 Line 2 starting position
 * @param {THREE.Vector2} b2 Line 2 starting position
 * @param {THREE.Vector2} intersection Intersecting point 
 * @returns {Boolean}
*/
function lineIntersects(a1, a2, b1, b2, intersection)
{
	intersection = vec2();

	const b = a2.sub(a1);
	const d = b2.sub(b1);
	const bDotDPerp = b.x * d.y - b.y * d.x;

	if (bDotDPerp == 0)
		return false;

	const c = b1.sub(a1);
	const t = (c.x * d.y - c.y * d.x) / bDotDPerp;
	if (t < 0 || t > 1)
		return false;

	const u = (c.x * b.y - c.y * b.x) / bDotDPerp;
	if (u < 0 || u > 1)
		return false;

	intersection = a1.add(b.multiplyScalar(t));

	return true;
}

// short hands
const sin = Math.sin;
const cos = Math.cos;
const tan = Math.tan;
const acos = Math.acos;
const asin = Math.asin;
const atan = Math.atan;
const random = Math.random;
const vec2 = (x = 0, y = 0) => new THREE.Vector2(x, y);
const vec3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const vec4 = (x = 0, y = 0, z = 0, w = 0) => new THREE.Vector4(x, y, z, w);