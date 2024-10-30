float rand4(vec4 co) {
	return fract(sin(dot(co, vec4(12.9898, 78.233, 190.124,37.149))) * 43758.5453);
}
float interpolate(float a0, float a1, float w) {
	if (0.0 >= w) return a0;
	if (1.0 <= w) return a1;
	return (a1 - a0) * (3.0 - w * 2.0) * w * w + a0;
}
vec4 grad(int ix, int iy, int iz, int iw) {
	const float PI = 3.141592653589793;
	float rand1 = rand4(vec4(ix,iy,iz,iw)) * PI * 2.0;
	
	float x = sin(rand1) * cos(rand1) * cos(rand1);
	float y = cos(rand1) * cos(rand1) * cos(rand1);
	float z = sin(rand1) * cos(rand1);
	float w = sin(rand1);

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
	x = mod(x + 128.0, 128.0);
	y = mod(y + 128.0, 128.0);
	z = mod(z + 128.0, 128.0);
	w = mod(w + 128.0, 128.0);
	
	int x0 = int(floorto(x, 1.0)); // x
	int x1 = x0 + 1; // x + 1
	int y0 = int(floorto(y, 1.0)); // y
	int y1 = y0 + 1; // y + 1
	int z0 = int(floorto(z, 1.0)); // z
	int z1 = z0 + 1; // z + 1
	int w0 = int(floorto(w, 1.0)); // w
	int w1 = w0 + 1; // w + 1

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
		float value = perlin(x*frequency, y*frequency, z*frequency, w*frequency);
		value = 0.35 + 0.65 * value;
		total += value * amplitude;
		normalization += amplitude;
		
		amplitude *= G;
		frequency *= lacunarity;
	}
	return total / normalization;
}


float dotgrad1(int ix, float x) {
	float gradient = grad(ix);
	float dx = x - float(ix);
	return dx*gradient;
}
float perlin1(float x) {
	int x0 = floor(x);
	int x1 = x0 + 1;

	float sx = x % 1; // fractional part
	
	float n0, n1;
	
	// North Side of the Cube
	n0 = dotgrad(x0, x);
	n1 = dotgrad(x1, x);
	return interpolate(n0, n1, sx);
}