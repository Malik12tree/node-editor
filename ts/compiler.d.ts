export interface CreateVariableCompilerLine {
	name: 'var',
	value: any
}
export interface SampleCompilerLine {
	name: 'sample',
	sample: Function
}
export class CompilerOption {
	constructor(options: CreateVariableCompilerLine): this
	constructor(options: SampleCompilerLine): this
}