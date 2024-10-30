const Compiler = {
	cache: {
		/** @type {{[name: String]: String}}} */
		functions: {},
		/** @type {{[name: String]: String}}} */
		variables: {},
		/** @type {{[name: String]: String}}} */
		types: {},
		/** @type {{[name: String]: Boolean}}} */
		vists: {},
		/** @type {{[name: String]: String}}} */
		aliases: {}
	},
	deleteCache() {
		this.cache.functions = {};
		this.cache.variables = {};
		this.cache.types = {};
		this.cache.vists = {};
		this.cache.aliases = {};
		return this;
	},
	defineVariable(type, name, value) {
		if (name in this.cache.variables) {
			delete this.cache.variables[name];
			delete this.cache.aliases[name];
			this.defineVariable(type, name, value);
			return;
		}

		this.cache.variables[name] = value;
		this.cache.types[name] = type;
	},
	defineFunction(name, content) {
		this.cache.functions[name] = content;
	},

	stringifyValue(value) {
		if (value instanceof Color)
			return `vec3(${value.toArray().toString()})`;
		else if (value instanceof Object && 'x' in value && 'y' in value && 'z' in value) {
			return `vec3(${value.x},${value.y},${value.z})`; 
		} 
		else if (typeof value === 'number') {
			return intToFloat(value);
		}
			
		return value;
	},
	write() {
		var code = '';
		var head = '';
		for (const name in this.cache.functions) {
			const content = this.cache.functions[name];
			head += content.replace(/\t/g, '    ') + '\n';
		}
		const source = Output.valpoints.fragment?.source;
		let lastVar = this.variablize(source?.nnode, source?.id);

		for (const name in this.cache.variables) {
			const value = this.cache.variables[name];
			const type = this.cache.types[name];
			
			code = `    ${type} ${name} = ${this.stringifyValue(value)};\n` + code;
		}
		if (!lastVar) {
			return 'void main() {gl_FragColor = vec4(0,0,0,1);}';
		}
		if (this.cache.types[lastVar] != 'vec3') {
			lastVar = lastVar+','+lastVar+','+lastVar;
		}
		code = `void main() {\n\n${code}\n    gl_FragColor = vec4(${lastVar},1);\n}`;
		return  'const vec3 _ = vec3(0,0,0);\n'+
				'const vec3 white = vec3(1,1,1);\n'+
				'const vec3 black = vec3(0,0,0);\n'+
				'varying vec2 vUv;\n'+
				'varying vec3 vNormal;\n'+	
				'varying vec3 vPos;\n'+
				'varying vec3 vNormalView;\n'+
				'varying vec3 vPositionView;\n'+
				'varying vec3 vView;\n'+
				'varying mat4 vProjection;\n'+
				'uniform vec2 ScreenSize;\n' +  
				head + code;
	},
	compile() {
		this.deleteCache();
	
		this.stringify(Output);
		const code = this.write();
		
		// this.deleteCache();
		return code;
	},
	variablize(node, id){
		if (!node) return null;

		const source = node.valpoints[id]?.source;
		if (source) {
			return this.variablize(source.nnode, source.id)
		}
		return node.id + '_' + id;
	},

	sampleLines(node, lines) {
		const matchers = Array.from(lines.matchAll(/%([^%]+)%/g));
		for (let i = matchers.length-1; i >= 0; i--) {
			const match = matchers[i];
			
			let id = match[1];
			const index = id.match(/\.(\w+)$/);
			if (index) {
				id = id.substring(0, id.length-index[0].length);
			}

			const source = node.valpoints[id]?.source;
			if (source) {
				const replaceValue = this.getOrigin(this.variablize(node, id));
				
				const typeTo = node.form[id].type;
				const typeFrom = source.nnode.form[source.id].type;
				let sampled = ConvertTo_str(replaceValue, typeFrom, typeTo)

				if (index) sampled += index[0]; // %color.r% -> color.r

				lines = lines.replaceAll(match[0], sampled);
			} else {

				const entry = node.nodeOf(id);
				const input = entry.children('#'+id);
				
				let value = val(input);

				if (index) value = value[index[1]]; // %color.r% -> /\d/

				lines = lines.replaceAll(match[0], this.stringifyValue(value));
			}
		}
		return lines; 
	},
	getOrigin(variable) {
		return this.cache.aliases[variable] || variable;
	},
	codeType(type) {
		switch (type) {
			case 'number': return 'float';		
			case 'color': return 'vec3';
			case 'vector': return 'vec3';
		}
		return type;
	},
	sampleStatementOf(node, id) {
		const writer = WritersLib[node.constructor.name];

		const conditions = node.getConditionalFields();
		const result = writer.writes(id, conditions);

		if (writer.definesFunctions) {
			for (const name in writer.definesFunctions) {
				const func = writer.definesFunctions[name];
				if (typeof func === 'string') {
					this.defineFunction(name, func);
				} else {
					const fresult = func(conditions);
					fresult && this.defineFunction(name, fresult);
				}
			}
		}
		return this.sampleLines(node, result);
	},
	stringify(node) {
		// if (this.cache.vists[node.id]) return; // was causing ordering problems
		this.cache.vists[node.id] = true;

		const form = node.form;

		for (const id in form) {
			const field = form[id];	
			const source = node.valpoints[id]?.source;
			const target = node.valpoints[id]?.target;

			const vname = this.variablize(node, id);
			const type = this.codeType(field.type);

			if (field.output && target) {
				this.defineVariable(type, vname, this.sampleStatementOf(node , id));
			}
			else if (field.input && source) {
				// this.cache.aliases[vname] = this.getOrigin(this.variablize(source.nnode, id)); // was causing ordering problems
				this.stringify(source.nnode);
			}
		}
	}
}