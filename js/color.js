// \|(.+)\| -> Math.abs($1)
// 1097 tinycolor
class Color {
	constructor(r = 0, g = 0, b = 0, a = 1) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}
	clone(){
		return new Color(this.r, this.g, this.b, this.a);
	}
	// start #filterregion
	// # Note: `this` is the 'top layer'
	// b -> blend ; a -> target // needs inverion
	// b is the top layer
	// a is the base layer
	hue(color) {
		const activeHSL = this.toHSL();
		const bottomHSL = color.toHSL();
		activeHSL[1] = bottomHSL[1];
		activeHSL[2] = bottomHSL[2];
		return new Color().fromHSL(...activeHSL);
	}
	saturation(color) {
		const activeHSL = this.toHSL();
		const bottomHSL = color.toHSL();
		activeHSL[0] = bottomHSL[0];
		activeHSL[2] = bottomHSL[2];
		return new Color().fromHSL(...activeHSL);
	}
	color(color) {
		const activeHSL = this.toHSL();
		const bottomHSL = color.toHSL();
		activeHSL[2] = bottomHSL[2];
		return new Color().fromHSL(...activeHSL);
	}
	luminosity(color) {
		const activeHSL = this.toHSL();
		const bottomHSL = color.toHSL();
		activeHSL[0] = bottomHSL[0];
		activeHSL[1] = bottomHSL[1];
		return new Color().fromHSL(...activeHSL);
	}
	darken(color) {
		this.r = Math.min(this.r, color.r);
		this.g = Math.min(this.g, color.g);
		this.b = Math.min(this.b, color.b);
		return this;
	}
	lighten(color) {
		this.r = Math.max(this.r, color.r);
		this.g = Math.max(this.g, color.g);
		this.b = Math.max(this.b, color.b);
		return this;
	}
	multiply(color) {
		this.r = this.r * color.r;
		this.g = this.g * color.g;
		this.b = this.b * color.b;
		this.clamp();
		return this;
	}
	divide(color) {
		this.r = this.r / color.r;
		this.g = this.g / color.g;
		this.b = this.b / color.b;
		this.clamp();
		return this;
	}
	screen(color) {
		this.r = 1 - (1 - this.r) * (1 - color.r);
		this.g = 1 - (1 - this.g) * (1 - color.g);
		this.b = 1 - (1 - this.b) * (1 - color.b);
		this.clamp();
		return this;
	}
	overlay(color) {
		const f = (a,b) => {
			if (a < 0.5) return 2 * a*b;
			return 1 - 2 * (1 - a)*(1 - b);
		}
		this.r = f(this.r, color.r);
		this.g = f(this.b, color.g);
		this.b = f(this.b, color.b);
		this.clamp();
		return this;
	}
	hardlight(color) {
		const f = (a,b) => {
			if (b < 0.5) return a * (2*b);
			return 1 - (1-a) * (1-2*(b-0.5));
		}
		this.r = f(this.r,color.r);
		this.g = f(this.b,color.g);
		this.b = f(this.b,color.b);
		this.clamp();
		return this;
	}
	vividlight(color) {
		const f = (a,b) => {
			if (b < 0.5) return 1 - (1-a) / (2*b);
			return (a / (1-2*(b-0.5)));	
		}
		this.r = f(this.r,color.r);
		this.g = f(this.b,color.g);
		this.b = f(this.b,color.b);
		this.clamp();
		return this;
	}
	linearlight(color) {
		const f = (a,b) => {
			if (b < 0.5) return a + 2*b - 1;
			return a + 2*(b-0.5);
		}
		this.r = f(this.r,color.r);
		this.g = f(this.b,color.g);
		this.b = f(this.b,color.b);
		this.clamp();
		return this;
	}
	pinlight(color) {
		const f = (a,b) => {
			if (b < 0.5) return Math.min(a,2*b)
			return Math.max(a,2*(b-0.5));
		}
		this.r = f(this.r,color.r);
		this.g = f(this.b,color.g);
		this.b = f(this.b,color.b);
		this.clamp();
		return this;
	}
	softlight(color) {
		const w3c = (a,b) => {
			if (b <= 0.5) 
				return a - (1 - 2*b) * a * (1 - a);
			
			return a + (2*b - 1) * (gw3c(a) - a);
		}
		const gw3c = (a) => {
			if (a <= 0.25) 
				return ((16*a - 12) * a + 4) * a;
			return Math.sqrt(a);
		}
		this.r = w3c(this.r,color.r);
		this.g = w3c(this.b,color.g);
		this.g = w3c(this.b,color.g);
		return this;
	}
	colordodge(color) {
		this.r = this.r / (1 - color.r);
		this.g = this.g / (1 - color.g);
		this.b = this.b / (1 - color.b);
		this.clamp();
		return this;
	}
	lineardodge(color) {
		return this.add(color);
	}
	burn(color) {
		this.r = 1 - ((1 - this.r) / color.r);
		this.g = 1 - ((1 - this.g) / color.g);
		this.b = 1 - ((1 - this.b) / color.b);
		this.clamp();
		return this;
	}
	linearburn(color) {
		this.r = (this.r + color.r) - 1;
		this.g = (this.g + color.g) - 1;
		this.b = (this.b + color.b) - 1;
		this.clamp();
		return this;
	}
	add(color) {
		this.r = this.r + color.r;
		this.g = this.g + color.g;
		this.b = this.b + color.b;
		this.clamp();
		return this;
	}
	subtract(color) {
		this.r = this.r - color.r;
		this.g = this.g - color.g;
		this.b = this.b - color.b;
		this.clamp();
		return this;
	}
	difference(color) {
		this.r = Math.abs(this.r - color.r);
		this.g = Math.abs(this.g - color.g);
		this.b = Math.abs(this.b - color.b);
		return this;
	}
	// end #filterregion
	/**
	 * @param {String} name name of the filter you want to apply
	 * @param {Number|Color} color
	 */
	applyFilter(name, color) {
		if (typeof color == 'number') color = new Color(color,color,color);
		switch (name.toLowerCase()) {
			case 'darken': return this.darken(color);
			case 'lighten': return this.lighten(color);
			case 'multiply': return this.multiply(color);
			case 'mul': return this.multiply(color);
			case 'divide': return this.divide(color);
			case 'div': return this.divide(color);
			case 'screen': return this.screen(color);
			case 'overlay': return this.overlay(color);
			case 'hardlight': return this.hardlight(color);
			case 'vividlight': return this.vividlight(color);
			case 'linearlight': return this.linearlight(color);
			case 'pinlight': return this.pinlight(color);
			case 'pin': return this.pinlight(color);
			case 'softlight': return this.softlight(color);
			case 'colordodge': return this.colordodge(color);
			case 'dodge': return this.colordodge(color);
			case 'lineardodge': return this.lineardodge(color);
			case 'burn': return this.burn(color);
			case 'linearburn': return this.linearburn(color);
			case 'add': return this.add(color);
			case 'subtract': return this.subtract(color);
			case 'sub': return this.subtract(color);
			case 'difference': return this.difference(color);
			case 'diff': return this.difference(color);
			case 'hue': return this.hue(color);
			case 'saturation': return this.saturation(color);
			case 'chroma': return this.saturation(color);
			case 'color': return this.color(color);
			case 'luminosity': return this.luminosity(color);
		}
		return null;
	}	

	brighten(amount) {
		this.r += amount;
		this.g += amount;
		this.b += amount;
		return this;
	}
	/**
	 * Hue rotates the color by an angle. This method is slower than `this.huerotate` but with accurate results.
	 * @param {Number} angle angle in degrees.
	 * @returns {this}
	 */
	huerotateHSL(angle){
		const hsl = this.toHSL();
		hsl[0] += angle;
		return this.fromHSL(...hsl);
	}
	/**
	 * Hue rotates the color by an angle. This method is faster than `this.huerotateHSL` but results with a small precision error.
	 * @param {Number} angle angle in degrees.
	 * @returns {this}
	 */
	huerotate(angle) {
		const U = Math.cos(angle * Math.PI / 180);
		const W = Math.sin(angle * Math.PI / 180);
		const r = this.r;
		const g = this.g;
		const b = this.b;

		this.r = (.299 + .701 * U + .168 * W) * r
			+ (.587 - .587 * U + .330 * W) * g
			+ (.114 - .114 * U - .497 * W) * b;

		this.b = (.299 - .299 * U - .328 * W) * r
			+ (.587 + .413 * U + .035 * W) * g
			+ (.114 - .114 * U + .292 * W) * b;

		this.g = (.299 - .3 * U + 1.25 * W) * r
			+ (.587 - .588 * U - 1.05 * W) * g
			+ (.114 + .886 * U - .203 * W) * b;

		this.clamp();
		return this;
	}
	lerp(color, t) {
		this.r = Math.lerp(this.r, color.r, t);
		this.g = Math.lerp(this.g, color.g, t);
		this.b = Math.lerp(this.b, color.b, t);
		return this;
	}
	invert(percent = 1) {
		this.r = Math.lerp(this.r, this.a - this.r, percent);
		this.g = Math.lerp(this.g, this.a - this.g, percent);
		this.b = Math.lerp(this.b, this.a - this.b, percent);
		return this;
	}
	contrast(percent = 0) {
		const factor = (2.590 * (percent + 2.55)) / (2.55 * (2.59 - percent));
		this.r = factor * (r - 0.5) + 0.5;
		this.g = factor * (g - 0.5) + 0.5;
		this.b = factor * (b - 0.5) + 0.5;
		return this;
	}
	grayscale() {
		return 0.2126 * this.r + 0.7152 * this.g + 0.0722 * this.b;
	}
	/**
	 * An aliases of `this.grayscale` but in british
	 */
	greyscale() {
		return 0.2126 * this.r + 0.7152 * this.g + 0.0722 * this.b;
	}
	saturate(percent = 0) {
		const grayscale = 0.2126 * this.r + 0.7152 * this.g + 0.0722 * this.b;
		this.r = Math.lerp(grayscale, this.r, percent);
		this.g = Math.lerp(grayscale, this.g, percent);
		this.b = Math.lerp(grayscale, this.b, percent);
		this.clamp();
		return this;
	}

	toHSL() {
		const R = this.r;
		const G = this.g;
		const B = this.b;

		const Cmax = Math.max(R, G, B);
		const Cmin = Math.min(R, G, B);
		const delta = Cmax - Cmin;

		let hue = 0;
		let saturation = 0;
		let lightness = (Cmax + Cmin)/2; // calculate lightness
		if (delta != 0) {
			// Calculate hue
			switch (Cmax) {
				case R:
					hue = (((G - B) / delta) % 6) * 60;
					break;
				case G:
					hue = (((B - R) / delta) + 2) * 60;
					break;
				case B:
					hue = (((R - G) / delta) + 4) * 60;
					break;
			}
			
			// Calculate saturation
			saturation = delta / ( 1 - Math.abs(2 * lightness - 1))
		}
		hue = Math.radifiy(hue);
		return [hue, saturation, lightness];
	}
	fromHSL(h, s, l) {
		h %= 360;		
		const C = (1 - Math.abs(2 * l - 1)) * s;
		const X = C * (1 - Math.abs((h / 60) % 2 - 1));
		const m = l - C / 2;

		let rgb = [0,0,0];
		if (0 <= h && h < 60) {
			rgb = [C, X, 0];
		}  else if (60 <= h && h < 120) {
			rgb = [X, C, 0];
		} else if (120 <= h && h < 180) {
			rgb = [0, C, X];
		} else if (180 <= h && h < 240) {
			rgb = [0, X, C];
		} else if (240 <= h && h < 300) {
			rgb = [X, 0, C];
		} else if (300 <= h && h < 360) {
			rgb = [C, 0, X];
		}
		this.r = rgb[0] + m;
		this.g = rgb[1] + m;
		this.b = rgb[2] + m;
		this.clamp();
		return this;
	}
	fromHex(hex){
		if (hex[0] === '#') return this.fromHex(hex.substr(1));
		this.r = parseInt(hex[0]+hex[1], 16) / 255;
		this.g = parseInt(hex[2]+hex[3], 16) / 255;
		this.b = parseInt(hex[4]+hex[5], 16) / 255;
		return this;
	}
	toHex(){
		this.clamp();
		return tinycolor(`rgb(${this.r*255},${this.g*255},${this.b*255})`).toHex();
	}
	setHue(value){
		const hsl = this.toHSL();
		hsl[0] = value;
		this.fromHSL(...hsl);
	}
	setSaturation(value){
		const hsl = this.toHSL();
		hsl[1] = value;
		this.fromHSL(...hsl);
	}
	setLightness(value){
		const hsl = this.toHSL();
		hsl[2] = value;
		this.fromHSL(...hsl);
	}
	fromTinyColor(tinycolor){
		this.r = tinycolor._r / 255;
		this.g = tinycolor._g / 255;
		this.b = tinycolor._b / 255;
		this.a = tinycolor._a / 255;
		this.clamp();
		return this;
	}
	clamp() {
		this.r = isNaN(this.r) ? 0:Math.clamp(this.r,0,1);
		this.g = isNaN(this.g) ? 0:Math.clamp(this.g,0,1);
		this.b = isNaN(this.b) ? 0:Math.clamp(this.b,0,1);
		this.a = isNaN(this.a) ? 0:Math.clamp(this.a,0,1);
		return this;
	}

	toArray() {
		return [this.r.toFixed(4)*1,this.g.toFixed(4)*1,this.b.toFixed(4)*1];
	}
	static fromArray(array) {
		return new Color(...array);
	}

	fromBlackbody(t) {
        t /= 100;
    
        this.r = t <= 66.0 ? 255.0: 
                329.698727446 * ((t - 60.0) ** -0.1332047592); 
    
        this.g = t <= 66.0 ? 99.4708025861 * Math.log(t) - 161.1195681661: 
                288.1221695283 * ((t - 60.0) ** -0.0755148492);
    
        this.b = t >= 66.0 ? 255.0:
                t <= 19.0 ? 0.0:
                138.5177312231 * Math.log(t - 10.0) - 305.0447927307;
    

        this.r /= 255.0;
        this.g /= 255.0;
        this.b /= 255.0;
        this.clamp();
        return this;
	}
}