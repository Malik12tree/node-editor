float rand(vec2 co) {
	return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}
float floorto(float x, float factor) {
	return floor(x / factor) * factor;
}
float smin(float a, float b, float k) {
	if (k == 0.0) return min(a,b);

	float h = clamp(0.5 + 0.5*(a-b)/k, 0.0, 1.0);
	return mix(a, b, h) - k*h*(1.0-h);
}

// 
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