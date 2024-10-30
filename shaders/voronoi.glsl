float floorto(float x, float factor) {
	return round(x / factor) * factor;
}
vec2 getGridPos(float x, float y, float factor) {
    return vec2(floorto(x, factor), floorto(y, factor));
}
float smin(float a, float b, float k) {
	float h = clamp(0.5 + 0.5*(a-b)/k, 0.0, 1.0);
	return mix(a, b, h) - k*h*(1.0-h);
}
float rand(vec2 co) {
	return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}
vec2 randomDirection(vec2 co, float factor, float randomness) {
    float random = rand(co) * 6.283185307179586 * randomness;
    
    float x = cos(random);
    float y = sin(random);
    return co + vec2(x,y) * factor * 0.5;
}
float vdistancefn(vec2 v1, vec2 v2) {
    
    return distance(v1,v2); // Euclidean
    // return abs(v1.x - v2.x) + abs(v1.y-v2.y); // Manhattan Distance
    // return max(abs(v1.x - v2.x) , abs(v1.y-v2.y)); // Chebychev Distance
}
float voronoi(float x, float y, float scale, float smoothness, float randomness) {
    float factor = 1.0 / scale;

    vec2 center = getGridPos(x,y, factor);    
    vec2 pos = vec2(x,y);

    float dist = vdistancefn(randomDirection(center, factor, randomness), pos);

    for (int i = -1; i <= 1; i++) {
    for (int j = -1; j <= 1; j++) {
        if ( i == 0 && j == 0 ) continue;
            
        vec2 n = center + vec2(float(i) * factor, float(j) * factor);

        float distancet = vdistancefn(pos, randomDirection(n, factor, randomness));
        dist = smin(dist, distancet, smoothness / 10.0);
    }}
    
    return dist;
}