let openWidget = null;

document.body.addEventListener('mousedown', function (e) {
	if (openWidget && !e.composedPath().includes(openWidget.node[0])) {
		openWidget.hide();
		openWidget = null;
	}
});
document.body.addEventListener('click', function (e) {
	const target = e.target;

	if (target.tagName === 'INPUT' && target.getAttribute('type') === 'color') {
		e.preventDefault();

		openWidget = new ColorPicker(document.body, {
			onchange: color => {
				target.setAttribute('title', color);
				target.value = color;
				target?.onchange?.(color);
			}
		});
		openWidget.setColor(target.value);

		const rect = target.getBoundingClientRect();
		const oheight = openWidget.node.height();

		let boundsOffset = 0;
		const top = rect.top - oheight;
		if (top < 0) {
			boundsOffset = top;
		}
		openWidget.node[0].style.top = (rect.top - boundsOffset) + 'px';

		openWidget.node[0].style.left = rect.left + rect.width / 2 + 'px';

	}
});

/**
 * @param {typeof FieldOptions.type} typeA Source Type
 * @param {typeof FieldOptions.type} typeB Target Type
 * @returns 
 */
function CanConvertTo(typeA, typeB) {
	switch (typeA) {
		case 'number': return ['number', 'vector', 'color', 'any'].includes(typeB);
		case 'vector': return ['vector', 'number', 'any', 'color'].includes(typeB);
		case 'color' : return ['color', 'number', 'any', 'vector'].includes(typeB);
		default: return (typeA === 'any' || typeB === 'any') || typeA === typeB;
	}
}
function ConvertTo(value, type) {
	const error = new Error('Value conversion was unsuccesful');
	switch (type) {
		case 'number':
			if (typeof value === 'number') return value;
			if (value instanceof Array) return Math.vlength(...value);
			if (value instanceof Color) return value.clone().grayscale();
		case 'vector':
			if (value instanceof Array) return value;
			if (value instanceof Color) return value.toArray();
			if (typeof value === 'number') return [value, value, value];
		case 'color':
			if (value instanceof Color) return value;
			if (value instanceof Array) return Color.fromArray(...value);
			if (typeof value === 'number') return new Color(value, value, value);
		case 'any':
			return value;
	}
	throw error;
}
function ConvertTo_str(value, type, typeTo) {
	const error = new Error('Value conversion was unsuccesful');

	if (typeTo == 'number') {
		
		if (type == 'vector') return `length(${value})`;
		
		if (type == 'color') return `(0.2126 * ${value}.r + 0.7152 * ${value}.g + 0.0722 * ${value}.b)`;
		return value;

	} else if (['vector', 'color'].includes(typeTo)) {
		
		if (type == 'number') return `(white*${value})`;
		return value;

	}
	else if (typeTo == 'any') { 
		return value 
	}

	throw error;
}