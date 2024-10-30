const dimension = { type: 'select', options: {'1': '1D', '2': '2D', '3': '3D', '4': '4D'}, value:'3' }
const w = {type: 'number', label: 'W',step: 0.01,input:true, condition: ({dimension}) => dimension == '4' || dimension === '1'}
const point = { type: 'vector', label: 'Point', input: true, condition: ({dimension}) => dimension != '1'}

const __oneFieldsMathFunction = ['log','sqrt','invsqrt','abs','exp','sign','round','floor','ceil','truncate','fraction','sin','cos','tan','acos','asin','sinh','cosh','tanh','asinh','acosh','atanh'];
const _floatVectorFunctions = ['length','distance','dot'];
const _vecVectorFunctions = ['length','abs','normalize','round','floor','ceil','fraction','sin','cos','tangent','scale'];

class OutputNode extends NNode {
	static title = 'Output';
	static width = 100;
	static categeory = 'Output';
	static color = 'var(--decor-inputs)';
	static form = {
		fragment: { type: 'any', label:'Fragment', input: true },
		vertex: { type: 'any', label:'Vertex', input: true },
	}
}
class MathNode extends NNode {
	static title = 'Math';
	static width = 150;
	static categeory = 'Converter';
	static color = 'var(--decor-converters)';
	static form = {
		out: { type: 'number', output: true},
		func: { type: 'select', options: { 
			add: 'Add', 
			sub: 'Subtract', 
			mul: 'Multiply', 
			div: 'Divide',
			pow: 'Power', 
			log: 'Logarithm',
			sqrt: 'Square Root', 
			invsqrt: 'Inverse Square Root', 
			abs: 'Absolute', 
			exp: 'Exponent', 
			
			min: 'Minimum', 
			max: 'Maximum', 
			lessthan: 'Less Than', 
			greaterthan: 'Greater Than', 
			sign: 'Sign', 
			compare: 'Compare', 
			smin: 'Smooth Minimum', 
			smax: 'Smooth Maximum', 

			round: 'Round',
			floor: 'Floor',
			ceil: 'Ceil',
			truncate: 'Truncate',
			fraction: 'Fraction',
			mod: 'Modulo',
			roundto: 'RoundTo',
			
			sin: 'Sine',
			cos: 'Cosine',
			tan: 'Tangent',
			acos: 'Arc Cosine',
			asin: 'Arc Sine',
			atan: 'Arc Tangent',
			atan2: 'ArcTan2',
		}},
		clamp: { label: 'Clamp', type: 'checkbox' },
		a: { type: 'number',label: 'A', input: true },
		b: { type: 'number',label: 'B', input: true,
			condition: ({func}) => !__oneFieldsMathFunction.includes(func)
		},
		epsilon: { type: 'number',label: 'Epsilon', input: true,
			condition: ({func}) => func == 'compare'
		},
	}
}
class RGBColorNode extends NNode {
	static title = 'RGB Color';
	static width = 125;
	static categeory = 'Input';
	static color = 'var(--decor-inputs)';
	static form = {
		out: { type: 'color', label: 'Color', output: true, emit({color}) {
			return color;
		}},
		color: { type: 'color' }
	}
}
class FresnelNode extends NNode {
	static title = 'Fresnel';
	static width = 150;
	static categeory = 'Input';
	static color = 'var(--decor-inputs)';
	static form = {
		factor: { type: 'number', label: 'Factor', output: true },
		ior: { type: 'number', label: 'IOR', value: 1.451, step: .05, input: true },
		normal: { type: 'vector', label: 'Normal', input: true },
	}
}
class MixRGBNode extends NNode {
	static title = 'Mix RGB';
	static width = 150;
	static categeory = 'Color';
	static color = 'var(--decor-color)';
	static form = {
		out: { type: 'color', label: 'Color', output: true, emit({blendmode, colorA, colorB, clamp, factor}) {
			let color = null;
			switch (blendmode) {
				case 'mix': color = colorA; break;
				default: color = colorA.applyFilter(blendmode, colorB);
			}
			const output = colorB.lerp(color, factor);
			
			clamp && output.clamp();
			
			return output;
		}},
		blendmode: { type: 'select', options: { 
			mix: 'Mix',
			'_': '_',
			mul: 'Multiply',
			screen: 'Screen',
			overlay: 'Overlay',
			linearlight: 'Linear Light',
			hardlight: 'Hard Light',
			softlight: 'Soft Light',
			vividlight: 'Vivid Light',
			linearlight: 'Linear Light',
			pinlight: 'Pin Light',
			'__': '_',
			div: 'Divide',
			add: 'Add',
			sub: 'Subtract',
			diff: 'Difference',
			darken: 'Darken',
			lighten: 'Lighten',
			'___': '_',
			colordodge: 'Color Dodge',
			burn: 'Burn',
			linearburn: 'Linear Burn',
			'____': '_',
			hue: 'Hue',
			saturation: 'Saturation',
			color: 'Color',
			luminosity: 'Luminosity',
		}},
		clamp: { label: 'Clamp', type: 'checkbox' },
		factor: { label: 'Factor', type: 'number', input: true, min: 0, max: 1, step: .025},
		colorA: { type: 'color', input: true, label: 'Color 1' },
		colorB: { type: 'color', input: true, label: 'Color 2' },
	}
}
class SeparateXYZNode extends NNode {
	static title = 'Separate XYZ';
	static form = {
		x:{ type: 'number', label:'X', output: true },
		y:{ type: 'number', label:'Y', output: true },
		z:{ type: 'number', label:'Z', output: true },
		vector:{ type: 'vector', label:'Vector', input: true }
	}
	static width = 150;
	static categeory = 'Converter';
	static color = 'var(--decor-converters)'
}
class SeparateRGBNode extends NNode {
	static title = 'Separate RGB';
	static form = {
		r:{ type: 'number', label:'R', output: true },
		g:{ type: 'number', label:'G', output: true },
		b:{ type: 'number', label:'B', output: true },
		color:{ type: 'color', label:'Color', input: true }
	}
	static width = 150;
	static categeory = 'Converter';
	static color = 'var(--decor-converters)'
}
class CombineXYZNode extends NNode {
	static title = 'Combine XYZ';
	static form = {
		vector:{ type: 'vector', label:'Vector', output: true },
		x:{ type: 'number', label:'X', input: true },
		y:{ type: 'number', label:'Y', input: true },
		z:{ type: 'number', label:'Z', input: true }
	}
	static width = 150;
	static categeory = 'Converter';
	static color = 'var(--decor-converters)'
}
class CombineRGBNode extends NNode {
	static title = 'Combine RGB';
	static form = {
		color:{ type: 'color', label:'Color', output: true },
		r:{ type: 'number', label:'R', input: true },
		g:{ type: 'number', label:'G', input: true },
		b:{ type: 'number', label:'B', input: true }
	}
	static width = 150;
	static categeory = 'Converter';
	static color = 'var(--decor-converters)'
}
class TextureCoordinateNode extends NNode {
	static title = 'Texture Coordinate';
	static form = {
		viewn:{ type: 'vector', label: 'View Normal', output: true },
		viewp:{ type: 'vector', label: 'View Position', output: true },
		normal:{ type: 'vector', label: 'Normal', output: true },
		object:{ type: 'vector', label: 'Object', output: true },
		screen:{ type: 'vector', label: 'Screen', output: true },
		view:{ type: 'vector', label: 'View', output: true },
		uv:{ type: 'vector', label: 'UV', output: true },
		depth:{ type: 'number', label: 'Depth', output: true },
	}
	static width = 175;
	static categeory = 'Input';
	static color = 'var(--decor-inputs)'
}
class NoiseTextureNode extends NNode {
	static title = 'Noise Texture';
	static form = {
		value: { type: 'number', label: 'Value', output: true },
		dimension, w,
		scale: { value: 32, type: 'number', label: 'Scale', input: true },
		octaves: { value: 4, min: 1,max:8, type: 'number', label: 'Octaves', step: 1, input: true },
		persistency: { type: 'number',min:0,value: 2, label: 'Persistency', input: true },
		lacunarity: { type: 'number',min:0,value: 2, label: 'Lacunarity', input: true },
		point
	}
	static width = 210;
	static categeory = 'Texture';
	static color = 'var(--decor-textures)'
}
class VoronoiTextureNode extends NNode {
	static title = 'Voronoi Texture';
	static form = {
		value: { type: 'number', label: 'Value', output: true },
		dimension, w,
		scale: { value: 1, type: 'number', label: 'Scale', input: true },
		smoothness: { value: 0, min:0, max:1, type: 'number', label: 'Smoothness', input: true },
		randomness: { value: 1, min:0, max:1, type: 'number', label: 'Randomness', input: true },
		
		point
	}
	static width = 210;
	static categeory = 'Texture';
	static color = 'var(--decor-textures)'
}
class WhiteNoiseTextureNode extends NNode {
	static title = 'White Noise Texture';
	static form = {
		value: { type: 'number', label: 'Value', output: true },
		dimension, w, point
	}
	static width = 170;
	static categeory = 'Texture';
	static color = 'var(--decor-textures)'
}
class VectorMathNode extends NNode {
	static title = 'Vector Math';
	static width = 150;
	static categeory = 'Converter';
	static color = 'var(--decor-axis-xyz)';
	static form = {
		outv: { type: 'vector', label: 'Vector', output: true, 
			condition: ({func}) => !_floatVectorFunctions.includes(func)
		},
		outf: { type: 'number', label: 'Value', output: true, 
			condition: ({func}) => _floatVectorFunctions.includes(func)
		},
		func: { type: 'select', options: { 
			add: 'Add', 
			sub: 'Subtract', 
			mul: 'Multiply', 
			div: 'Divide',
			cross: 'Cross Product',
			project: 'Project',
			reflect: 'Reflect',
			refract: 'Refract',
			faceforward: 'Faceforward',
			dot: 'Dot Product',
			distance: 'Distance',
			length: 'Length',
			scale: 'Scale',
			normalize: 'Normalize',
			roundto: 'RoundTo',
			abs: 'Absolute', 
			min: 'Minimum',
			smin: 'Smooth Minimum',
			max: 'Maximum',
			round: 'Round',
			floor: 'Floor',
			ceil: 'Ceil',
			fraction: 'Fraction',
			mod: 'Modulo',
			sin: 'Sin',
			cos: 'Cos',
			tangent: 'Tangent',
		}},
		a: { type: 'vector',label: 'Vector A', input: true },
		b: { type: 'vector',label: 'Vector B', input: true, 
			condition: ({func}) => !_vecVectorFunctions.includes(func)
		},
		scale: { type: 'number',label: 'Scalar', input: true, 
			condition: ({func}) => func == 'scale'},
		ior: { type: 'number', label: 'IOR',value: 1, input: true, 
			condition: ({func}) => func == 'refract'},
		smoothness: { type: 'number', label: 'Smoothness',value: 0,min:0,max:1, input: true, 
			condition: ({func}) => func == 'smin'},
	}
}
class ColorRampNode extends NNode {
	static title = 'ColorRamp';
	static form = {
		color: { type: 'color', output: true },
		gradient: { type: 'gradient' },
		factor: { type: 'number', input: true, label: 'Factor', min: 0, max: 1, step: 0.05 }
	}
	static width = 250;
	static categeory = 'Converter';
	static color = 'var(--decor-converters)'
}
NNode.register(
	OutputNode, MathNode, RGBColorNode, FresnelNode, MixRGBNode, 
	SeparateXYZNode, SeparateRGBNode, CombineXYZNode, CombineRGBNode, 
	TextureCoordinateNode, NoiseTextureNode, VoronoiTextureNode, 
	WhiteNoiseTextureNode, VectorMathNode, ColorRampNode
)

NNode.updateAddMenu()
const Output = new OutputNode();
const n5 = new TextureCoordinateNode();
n5.setPosition(225, 50);

Output.setPosition(600, 100);

$('.nodearea').append(Output.node, n5.node);

n5.valpoints.object.to(Output.valpoints.fragment);
n5.valpoints.object.updateLine();

function getState() {
	let str = '';
	NNode.all.forEach((node, i) => {
		str += `const n${i} = new NODE.${nodeid}()\n`;
		str += `n${i}.setPosition(${parseInt(node.node[0].style.left)}, ${parseInt(node.node[0].style.top)})\n`
		str += `$('.nodearea').append(n${i}.node);\n`
	})

	return str;
}