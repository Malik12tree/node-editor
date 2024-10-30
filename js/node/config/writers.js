const maxColorRampStops = 16;
const WritersChunk = {
	inverselerp: 
`float invLerp(float a, float b, float v) {
	if (v <= a) return a;
	if (v >= b) return b;
	return (v - a) / (b - a);
}`,
	clampColor:
`vec3 clampColor(vec3 color) {
	return clamp(color, vec3(0,0,0), vec3(1,1,1));
}`,
	smoothmin: 
`float smin(float a, float b, float k) {
	if (k == 0.0) return min(a,b);

	float h = clamp(0.5 + 0.5*(a-b)/k, 0.0, 1.0);
	return mix(a, b, h) - k*h*(1.0-h);
}
vec3 smin(vec3 a, vec3 b, float k) {
	return vec3(smin(a.x, b.x, k),smin(a.y, b.y, k),smin(a.z, b.z, k));
}`,

	clamp01:
`float clamp01(float x) {
	return clamp(x, 0.0, 1.0);
}`,
	mmulitply:
`vec3 mmul(vec3 colorA, vec3 colorB) { return colorA.rgb*colorB.rgb; }`
	,
	mdivide:
`vec3 mdiv(vec3 colorA, vec3 colorB) { return colorA.rgb/colorB.rgb; }`,
	lerpcolor:
`vec3 lerpcolor(vec3 vectorA, vec3 vectorB, float t) {
	if (t == 0.0) return vectorA;
	if (t == 1.0) return vectorB;
	return vectorA + (vectorB - vectorA) * t;
}`,
	random:
`float rand4(vec4 co) {
	return fract(sin(dot(co, vec4(12.9898, 78.233, 190.124,37.149))) * 43758.5453);
}`,
	perlin4:
`
float interpolate(float a0, float a1, float w) {
	if (0.0 >= w) return a0;
	if (1.0 <= w) return a1;
	return (a1 - a0) * (3.0 - w * 2.0) * w * w + a0;
}
vec4 grad(int ix, int iy, int iz, int iw) {
	const float PI = 3.141592653589793;
	float rand1 = rand4(vec4(ix,iy,iz,iw)) * PI * 2.0;
	
	float sr = sin(rand1);
	float cr = cos(rand1);
	float x = sr * cr * cr;
	float y = cr * cr * cr;
	float z = sr * cr;
	float w = sr;

	return vec4(x, y, z, w);
}
float dotgrad(int ix, int iy, int iz, int iw, float x, float y, float z, float w) {
	vec4 gradient = grad(ix, iy, iz, iw);

	float dx = x - float(ix);
	float dy = y - float(iy);
	float dz = z - float(iz);
	float dw = w - float(iw);

	return dx*gradient.x + dy*gradient.y + dz*gradient.z + dw*gradient.w;
}
float perlin(float x, float y, float z, float w) {
	x = mod(x + 128.0, 255.0);
	y = mod(y + 128.0, 255.0);
	z = mod(z + 128.0, 255.0);
	w = mod(w + 128.0, 255.0);
	
	int x0 = int(x);
	int x1 = x0 + 1;
	int y0 = int(y);
	int y1 = y0 + 1;
	int z0 = int(z);
	int z1 = z0 + 1;
	int w0 = int(w);
	int w1 = w0 + 1;

	float sx = fract(x); // fractional part
	float sy = fract(y); // fractional part
	float sz = fract(z); // fractional part
	float sw = fract(w); // fractional part
	
	float n0, n1, n2, n3, ix0, ix1, ix2, ix3, valuen, valuew, value3;
	float n4, n5, n6, n7, ix4, ix5, ix6, ix7, valuenw, valueww, value4;
	float value;

	// North Side of the Cube
	n0 = dotgrad(x0, y0, z0, w0, x, y, z, w);
	n1 = dotgrad(x1, y0, z0, w0, x, y, z, w);
	ix0 = interpolate(n0, n1, sx);

	n0 = dotgrad(x0, y1, z0, w0, x, y, z, w);
	n1 = dotgrad(x1, y1, z0, w0, x, y, z, w);
	ix1 = interpolate(n0, n1, sx);
	valuen = interpolate(ix0, ix1, sy);
	
	// West Side of the Cube
	n2 = dotgrad(x0, y0, z1, w0, x, y, z, w);
	n3 = dotgrad(x1, y0, z1, w0, x, y, z, w);
	ix2 = interpolate(n2, n3, sx);

	n2 = dotgrad(x0, y1, z1, w0, x, y, z, w);
	n3 = dotgrad(x1, y1, z1, w0, x, y, z, w);
	ix3 = interpolate(n2, n3, sx);
	valuew = interpolate(ix2, ix3, sy);
	value3 = interpolate(valuen, valuew, sz);


	// North Side of the Hyper Cube
	n4 = dotgrad(x0, y0, z0, w1, x, y, z, w);
	n5 = dotgrad(x1, y0, z0, w1, x, y, z, w);
	ix4 = interpolate(n4, n5, sx);

	n4 = dotgrad(x0, y1, z0, w1, x, y, z, w);
	n5 = dotgrad(x1, y1, z0, w1, x, y, z, w);
	ix5 = interpolate(n4, n5, sx);
	valuenw = interpolate(ix4, ix5, sy);
	
	// West Side of the Hyper Cube
	n6 = dotgrad(x0, y0, z1, w1, x, y, z, w);
	n7 = dotgrad(x1, y0, z1, w1, x, y, z, w);
	ix6 = interpolate(n6, n7, sx);

	n6 = dotgrad(x0, y1, z1, w1, x, y, z, w);
	n7 = dotgrad(x1, y1, z1, w1, x, y, z, w);
	ix7 = interpolate(n6, n7, sx);
	valueww = interpolate(ix6, ix7, sy);
	value4 = interpolate(valuenw, valueww, sz);

	value = interpolate(value3, value4, sw);
	return value;
}
float pnoise(vec4 p, float scale, int octaves, float persistency, float lacunarity) {
	float x = p.x / scale;
	float y = p.y / scale;
	float z = p.z / scale;
	float w = p.w / scale;

	float G = pow(2.0, -persistency);
	float amplitude = 1.0;
	float frequency = 1.0;
	float normalization = 0.0;
	float total = 0.0;

	for (int i = 0; i < octaves; i++) {
		float value = perlin(x*frequency, y*frequency, z*frequency, w*frequency) + 0.5;
		total += value * amplitude;
		normalization += amplitude;
		
		amplitude *= G;
		frequency *= lacunarity;
	}
	return total / normalization;
}
`,
	random1: 
`float rand(vec2 co) {
	return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}`,
	voronoi:
`
vec4 getGridPos(float x, float y, float z, float w, float factor) {
    return vec4(floorto(x, factor), floorto(y, factor), floorto(z, factor), floorto(w, factor));
}
vec4 randomDirection(vec4 co, float factor, float randomness, uint dimension) {
	float random = rand4(co) * 6.283185307179586 * randomness;

	float x = sin(random) * cos(random) * cos(random);
	float y = cos(random) * cos(random) * cos(random);
	float z = sin(random) * cos(random);
	float w = sin(random);

	if (dimension < 2u) y = 0.0;
	if (dimension < 3u) z = 0.0;
	if (dimension < 4u) w = 0.0;

	return co + vec4(x, y, z, w) * factor * 0.5;
}
float vdistancefn(vec4 v1, vec4 v2) {
    
    return distance(v1,v2); // Euclidean
    // return abs(v1.x - v2.x) + abs(v1.y-v2.y); // Manhattan Distance
    // return max(abs(v1.x - v2.x) , abs(v1.y-v2.y)); // Chebychev Distance
}
float voronoi(vec4 pos, uint dimension, float scale, float smoothness, float randomness) {
    float factor = 1.0 / scale;

    vec4 center = getGridPos(pos.x,pos.y, pos.z, pos.w, factor);    

    float dist = vdistancefn(randomDirection(center, factor, randomness, dimension), pos);

    for (int i = -1; i <= 1; i++) {
    for (int j = -1; j <= 1; j++) {
    for (int k = -1; k <= 1; k++) {
    for (int l = -1; l <= 1; l++) {
        if ( i == 0 && j == 0 && k == 0 && l == 0 ) continue;
            
        vec4 n = center + vec4(float(i) * factor, float(j) * factor, float(k) * factor, float(l) * factor);

        float distancet = vdistancefn(pos, randomDirection(n, factor, randomness, dimension));
        dist = smin(dist, distancet, smoothness / 10.0);
    }}}}
    
    return dist;
}
`,

	roundto:
`float roundto(float x, float factor) {
	// if (factor == 0.0 || x == 0.0) return x;
	// factor *= sign(x);
	return round(x / factor) * factor;
}
vec3 roundto(vec3 x, vec3 factor) {
	return vec3(roundto(x.x,factor.x),roundto(x.y,factor.y),roundto(x.z,factor.z));
}`,
	floorto:
`float floorto(float x, float factor) {
	// if (factor == 0.0 || x == 0.0) return x;
	// factor *= sign(x);
	return floor(x / factor) * factor;
}`,
	mathCases: {
		'add': '%a% + %b%',
		'sub': '%a% - %b%',
		'mul': '%a% * %b%',
		'div': '%a% / %b%',

		'pow': 'pow(%a%, %b%)',
		'log': 'log(%a%)',
		'sqrt': 'sqrt(%a%)',
		'invsqrt': 'inversesqrt(%a%)',
		'abs': 'abs(%a%)',
		'exp': 'exp(%a%)',
		'min': 'min(%a%, %b%)',
		'max': 'max(%a%, %b%)',
		'lessthan': '%a% < %b% ?1.0:0.0',
		'greaterthan': '%a% > %b% ?1.0:0.0',
		'sign': 'sign(%a%)',
		//'compare': '%a% + %b%',
		//'smin': '%a% + %b%',
		//'smax': '%a% + %b%',
		'round': 'round(%a%)',
		'floor': 'floor(%a%)',
		'ceil': 'ceil(%a%)',
		'truncate': 'trunc(%a%)',
		'fraction': 'frac(%a%)',
		'mod': 'mod(%a% , %b%)',
		'roundto': 'roundto(%a%, %b%)',
		'sin': 'sin(%a%)',
		'cos': 'cos(%a%)',
		'tan': 'tan(%a%)',
		'acos': 'acos(%a%)',
		'asin': 'asin(%a%)',
		'atan': 'atan(%b%/%a%)',
		'atan2': 'atan2(%b%,%a%)',

		'sinh': 'sinh(%a%)',
		'cosh': 'cosh(%a%)',
		'tanh': 'tanh(%a%)',
		'asinh': 'asinh(%a%)',
		'acosh': 'acosh(%a%)',
		'atanh': 'atanh(%a%)',
	},
	vmathCases: {
		'add': '%a% + %b%',
		'sub': '%a% - %b%',
		'mul': '%a%.xyz * %b%.xyz',
		'div': '%a%.xyz / %b%.xyz',
		'cross': 'cross(%a%, %b%)',
		// 'project': 'project(%a%, %b%)',
		'reflect': 'reflect(%a%, %b%)',
		'refract': 'refract(%a%, %b%, %ior%)',
		// 'faceforward': 'faceforward(%a%, %b%)',
		'dot': 'dot(%a%, %b%)',
		'distance': 'distance(%a%, %b%)',
		'length': 'length(%a%)',
		'scale': '%a% * %scale%',
		'normalize': 'normalize(%a%)',
		'roundto': 'roundto(%a%, %b%)',
		'abs': 'abs(%a%)',
		'smin': 'smin(%a%, %b%, %smoothness%)',
		'min': 'min(%a%, %b%)',
		'max': 'max(%a%, %b%)',
		'round': 'round(%a%)',
		'floor': 'floor(%a%)',
		'ceil': 'ceil(%a%)',
		'fraction': 'fract(%a%)',
		'mod': 'mod(%a%,%b%)',
		'sin': 'sin(%a%)',
		'cos': 'cos(%a%)',
		'tangent': 'tan(%a%)',
	}
}

const WritersLib = {
	MathNode: {
		definesFunctions: { clamp01: ({ clamp }) => clamp && WritersChunk.clamp01, roundto: ({ func }) => func == 'roundto' && WritersChunk.roundto },
		writes(target, { func, clamp }) {
			if (clamp) {
				return `clamp01(${this.writes(target, { func, clamp: false })})`;
			}
			return WritersChunk.mathCases[func];
		}
	},
	VectorMathNode: {
		definesFunctions: { 
			roundto: ({ func }) => func == 'roundto' && WritersChunk.roundto, 
			smoothmin: ({ func }) => func == 'smin' && WritersChunk.smoothmin 
		},
		writes(target, { func }) {
			return WritersChunk.vmathCases[func];
		}
	},
	RGBColorNode: {
		writes() {
			return '%color%';
		}
	},
	MixRGBNode: {
		definesFunctions: {
			lerpcolor: WritersChunk.lerpcolor,
			mmulitply: ({ blendmode }) => blendmode != 'mix' ? WritersChunk.mmulitply : null,
			mdivide: ({ blendmode }) => blendmode != 'mix' ? WritersChunk.mdivide : null,
			clampCol: ({ clamp }) => clamp ? WritersChunk.clampColor : null,

			_mixrgb: ({ blendmode }) => {
				switch (blendmode) {
					case 'screen':
						return 'vec3 mscreen(vec3 colorA, vec3 colorB) {\n\treturn white - (white - colorA) * (white - colorB);\n}';

					case 'overlay': return 'float _moverlay_h (float a, float b) {\n\tif (a < 0.5) return 2.0 * a * b;\n\treturn 1.0 - 2.0 * (1.0 - a)*(1.0 - b);\n}\nvec3 moverlay(vec3 colorA, vec3 colorB) {\n\treturn vec3(\n\t\t_moverlay_h(colorA.r, colorB.r),\n\t\t_moverlay_h(colorA.g, colorB.g),\n\t\t_moverlay_h(colorA.b, colorB.b)\n\t);\n}';

					case 'linearlight':
						return 'float _mlinearlight_h(float a, float b) {\n\tif (b < 0.5) return a + 2.0*b - 1.0;\n\treturn a + 2.0*(b-0.5);\n}\nvec3 mlinearlight(vec3 colorA, vec3 colorB) {\n\treturn vec3(\n\t\t_mlinearlight_h(colorA.r, colorB.r),\n\t\t_mlinearlight_h(colorA.g, colorB.g),\n\t\t_mlinearlight_h(colorA.b, colorB.b)\n\t);\n}';

					case 'hardlight':
						return 'float _mhardlight_h(float a, float b) {\n\tif (b < 0.5) return a * 2.0*b;\n\treturn 1.0 - (1.0-a) * (1.0-2.0*(b-0.5));\n}\nvec3 mhardlight(vec3 colorA, vec3 colorB) {\n\treturn vec3(\n\t\t_mhardlight_h(colorA.r, colorB.r),\n\t\t_mhardlight_h(colorA.g, colorB.g),\n\t\t_mhardlight_h(colorA.b, colorB.b)\n\t);\n}';

					case 'softlight':
						return 'float _msoftlight_h2(float a) {\n\tif (a <= 0.25) return ((16.0*a - 12.0) * a + 4.0) * a;\n\treturn sqrt(a);\n}float _msoftlight_h(float a, float b) {\n\tif (b <= 0.5) return a - (1.0 - 2.0*b) * a * (1.0 - a);\n\treturn a + (2.0*b - 1.0) * (_msoftlight_h2(a) - a);\n}\n\nvec3 msoftlight(vec3 colorA, vec3 colorB) {\n\treturn vec3(\n\t\t_msoftlight_h(colorA.r, colorB.r),\n\t\t_msoftlight_h(colorA.g, colorB.g),\n\t\t_msoftlight_h(colorA.b, colorB.b)\n\t);\n}';

					case 'vividlight':
						return 'float _mvividlight_h(float a, float b) {\nif (b < 0.5) return 1.0 - (1.0-a) / (2.0*b);\n\treturn (a / (1.0-2.0*(b-0.5)));\n}\nvec3 mvividlight(vec3 colorA, vec3 colorB) {\n\treturn vec3(\n\t\t_mvividlight_h(colorA.r, colorB.r),\n\t\t_mvividlight_h(colorA.g, colorB.g),\n\t\t_mvividlight_h(colorA.b, colorB.b)\n\t);\n}';

					case 'linearlight':
						return 'float _mlinearlight_h(float a, float b) {\n\tif (b < 0.5) return a + 2.0*b - 1.0;\n\treturn a + 2.0*(b-0.5);\n}\nvec3 mlinearlight(vec3 colorA, vec3 colorB) {\n\treturn vec3(\n\t\t_mlinearlight_h(colorA.r, colorB.r),\n\t\t_mlinearlight_h(colorA.g, colorB.g),\n\t\t_mlinearlight_h(colorA.b, colorB.b)\n\t);\n}';

					case 'pinlight':
						return 'float _mpinlight_h(float a, float b) {\n\tif (b < 0.5) return min(a,2.0*b);\n\treturn max(a,2.0*(b-0.5));\n}\nvec3 mpinlight(vec3 colorA, vec3 colorB) {\n\treturn vec3(\n\t\t_mpinlight_h(colorA.r, colorB.r),\n\t\t_mpinlight_h(colorA.g, colorB.g),\n\t\t_mpinlight_h(colorA.b, colorB.b)\n\t);\n}';
					case 'diff':
						return 'vec3 mdiff(vec3 colorA, vec3 colorB) {\n\tvec3 color = colorA - colorB;\n\treturn vec3(abs(color.r),abs(color.g),abs(color.b));\n}';

					case 'darken':
						return 'vec3 mdarken(vec3 colorA, vec3 colorB) {\n\treturn vec3(min(colorA.r, colorB.r), min(colorA.g, colorB.g), min(colorA.b, colorB.b));\n}';

					case 'lighten':
						return 'vec3 mlighten(vec3 colorA, vec3 colorB) {\n\treturn vec3(max(colorA.r, colorB.r), max(colorA.g, colorB.g), max(colorA.b, colorB.b));\n}';

					case 'colordodge':
						return 'vec3 mcolordodge(vec3 colorA, vec3 colorB) {\n\treturn mdiv(colorA, white - colorB);\n}';

					case 'burn':
						return 'vec3 mburn(vec3 colorA, vec3 colorB) {\n\treturn white - (mdiv((white - colorA), colorB));\n}';

					case 'linearburn':
						return 'vec3 mlinearburn(vec3 colorA, vec3 colorB) {\n\treturn (colorA + colorB) - white;\n}';

					// case 'hue': 
					// 	return '';

					// case 'saturation': 
					// 	return '';

					// case 'color': 
					// 	return '';

					// case 'luminosity': 
					// 	return '';
				}
			}
		},
		writes(target, { blendmode, clamp }) {
			if (clamp) {
				return `clampColor(${this.writes(target, { blendmode, clamp: false })})`
			}
			switch (blendmode) {
				case 'mix': return 'lerpcolor(%colorB%, %colorA%, %factor%)';
				case 'add': return 'lerpcolor(%colorB%, %colorA% + %colorB%, %factor%)';
				case 'sub': return 'lerpcolor(%colorB%, %colorA% - %colorB%, %factor%)';
				default: return `lerpcolor(%colorB%, m${blendmode}(%colorA%, %colorB%), %factor%)`;
			}
		}
	},
	SeparateXYZNode: {
		writes(target) {
			switch (target) {
				case 'x': return '%vector.x%';
				case 'y': return '%vector.y%';
				case 'z': return '%vector.z%';
			}
		}
	},
	SeparateRGBNode: {
		writes(target) {
			switch (target) {
				case 'r': return '%color.r%';
				case 'g': return '%color.g%';
				case 'b': return '%color.b%';
				case 'a': return '%color.a%';
			}
		}
	},
	CombineXYZNode: {
		writes() {
			return 'vec3(%x%,%y%,%z%)';
		}
	},
	CombineRGBNode: {
		writes() {
			return 'vec3(%r%,%g%,%b%)';
		}
	},
	TextureCoordinateNode: {
		writes(target) {
			switch (target) {
				case 'uv': return 'vec3(vUv,0)';	
				case 'object': return 'vPos';	
				case 'normal': return 'vNormal';	
				case 'viewn': return 'vNormalView';	
				case 'viewp': return 'vPositionView';	
				case 'view': return 'vView';	
				case 'screen': return 'vec3(gl_FragCoord.xy / ScreenSize.xy, 0.0)';	
				case 'depth': return 'gl_FragCoord.w';	
			}
		}
	},
	NoiseTextureNode: {
		definesFunctions: { random: WritersChunk.random,floorto: WritersChunk.floorto ,perlin: WritersChunk.perlin4, mmulitply: WritersChunk.mmulitply },
		writes(target, { dimension }) {
			let point = '';
			switch (dimension) {
				case '1': point = 'vec4(%w%,0,0,0)'; break;
				case '2': point = 'vec4(%point.x%,%point.y%,0,0)'; break;
				case '3': point = 'vec4(%point%,0)'; break;
				case '4': point = 'vec4(%point%,%w%)'; break;
			}
			return `pnoise(${point}.xyzw*255.0, %scale%, int(%octaves%), %persistency%, %lacunarity%)`;
		}
	},
	VoronoiTextureNode: {
		definesFunctions: { 
			smoothmin: WritersChunk.smoothmin, 
			random: WritersChunk.random, 
			floorto: WritersChunk.floorto, 
			voronoi: WritersChunk.voronoi,
		},
		writes(target, { dimension }) {
			switch (dimension) {
				case '1': return 'voronoi(vec4(%w%,0,0,0), 1u, %scale%, %smoothness%, %randomness%) * %scale%';
				case '2': return 'voronoi(vec4(%point.x%,%point.y%,0,0), 2u, %scale%, %smoothness%, %randomness%) * %scale%';
				case '3': return 'voronoi(vec4(%point%,0), 3u, %scale%, %smoothness%, %randomness%) * %scale%';
				case '4': return 'voronoi(vec4(%point%,%w%), 4u, %scale%, %smoothness%, %randomness%) * %scale%';
			}
		}
	},
	WhiteNoiseTextureNode: {
		definesFunctions: { random: WritersChunk.random },
		writes(target, { dimension }) {
			switch (dimension) {
				case '1': return 'rand4(vec4(%w%,0,0,0))';
				case '2': return 'rand4(vec4(%point.x%,%point.y%,0,0))';
				case '3': return 'rand4(vec4(%point%,0))';
				case '4': return 'rand4(vec4(%point%,%w%))';
			}
		}
	},
	ColorRampNode: {
		definesFunctions: {
			lerpcolor: WritersChunk.lerpcolor,
			inverselerp: WritersChunk.inverselerp,
			_colorramp:
		`vec3 colorramp(float stops[${maxColorRampStops}], vec3 colors[${maxColorRampStops}], int dynamicsize, float t) {
	int lastIndex = dynamicsize - 1;
	
	vec3 colorA;
	vec3 colorB;
	float posA;
	float posB;
	
	if (t <= stops[0]) {
		colorA = colorB = colors[0];
		posA = posB = stops[0];
	} else if (t >= stops[lastIndex]) {
		colorA = colorB = colors[lastIndex];
		posA = posB = stops[lastIndex];
	} else {
		for (int i = 0; i < lastIndex; i++) {
			float curr = stops[i];
			float next = stops[i+1];
			if (t <= next && t >= curr) {
				colorA = colors[i];
				colorB = colors[i+1];
				posA = curr;
				posB = next;
				break;
			}
		}
	}
	float percentBetweenBounds = invLerp(posA, posB, t);

	return lerpcolor(colorA, colorB, percentBetweenBounds);
}`
		},
		writes(target, { gradient }) {
			const stops = [];
			const colors = [];
			for (let i = 0; i < maxColorRampStops; i++) {
				const currStop = gradient.stops[i];
				const currColr = gradient.colors[i];
				
				if (!currColr) {
					stops.push('0.');
					colors.push('_');
					continue;
				}

				stops.push(intToFloat(currStop));
				colors.push(`vec3(${currColr.toArray()})`);
			}

			const gl_stops = `float[](` + stops.toString() + ')';
			const gl_colors = `vec3[](` + colors.toString() + ')';
			return `colorramp(${gl_stops}, ${gl_colors}, ${gradient.stops.length}, %factor%)`
		}
	},
	FresnelNode: {
		definesFunctions: {
			fresnel: `float fresnel(float ior, vec3 normal) {
				return pow((1.0 - clamp(dot(normalize(normal), normalize(vView)), 0.0, 1.0 )), ior);
			}`
		},
		writes() {
			return `fresnel(%ior%, %normal%)`
		}
	}
}