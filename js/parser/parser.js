const ARGUMENT_SEPERATOR_REGEX = /[\t\[\]()\,\n\ \\|;#{}]/;
const OPERATORS_REGEX = /[.*/\-+%&<>=^!?~'"\|]/;
const DATA_TYPES_REGEX = /^(bool|int|uint|float|double|((bvecn|ivec|uvec|vec|dvec)[2-4]))$/;
const KEYWORD_REGEX = /^(struct|light|const|attribute|uniform|void|varying|in|out|inout|for|while|do|if|else|continue|break|return|discard)$/;
const NUMBER_REGEX = /^[+-]?([0-9]*[.])?[0-9]+([uf]?)$/;

const TYPE_COLORS = {
	any: '#fff',
	keyword: '#f6f',
	function: '#6f6',
	operator: '#69f',
	comment: '#a7a7a7',
	number: '#ff693b',
	datatype: '#f66', 
}

function parse(code, cb) {
	const codeLength = code.length;	

	let lastArg = '';
	let lastCalledbackedArgument;
	let inComment = false;

	for (let i = 0; i < codeLength; i++) {
		const charPrev = code[i+1];
		const char = code[i];
		const charNext = code[i+1];
		const isOperator = OPERATORS_REGEX.test(char);

		const head = lastArg;
		lastArg += char;
		
		
		if (!(ARGUMENT_SEPERATOR_REGEX.test(char) || isOperator)) continue;
		const trimed = lastArg.trim();
		let type = 'any';
		

		if (charPrev != '\\' && ((char == '/' && charNext == '/') || char == '#')) {
			inComment = true;
		}
		if (inComment) {
			type = 'comment';
		}
		else if (char == '(') {
			type = 'function';
		}
		else if (isOperator) {
			type = 'operator';
		}
		else if (DATA_TYPES_REGEX.test(trimed)) {
			type = 'datatype';
		}
		else if (KEYWORD_REGEX.test(trimed)) {
			type = 'keyword';
		}

		if (char == '(' && !inComment) {
			head && cb({ type, content: head });
			
			lastCalledbackedArgument = { type: 'any', content: '(' };
		}
		else if (!inComment && NUMBER_REGEX.test(head.trim())) {
			head && cb({ type: 'number', content: head });
			
			lastCalledbackedArgument = { type: 'any', content: char };
		} 
		else if (isOperator && !inComment) {
			head && cb({ type: 'any', content: head });
			
			lastCalledbackedArgument = { type: 'operator', content: char };
		} 
		else if (lastArg) {
			lastCalledbackedArgument = { type, content: lastArg };
		}
		cb(lastCalledbackedArgument);

		if (char == '\n') {
			inComment = false;
		}

		lastArg = '';
	}
}
function debugGL(code) {
	const arguments = [''];
	
	parse(code, ({type, content}) => {
		arguments[0] += '%c' + content;
		arguments.push(`color:${TYPE_COLORS[type]}`);
	});
	
	console.log(...arguments);
}