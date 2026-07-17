struct Uniforms {
  normalMatrix: mat3x3f,
  worldViewProjection: mat4x4f,
  world: mat4x4f,
  color: vec4f,
  lightWorldPosition: vec3f,
  cameraWorldPosition: vec3f,
  intensity: f32,
};

struct Vertex {
  @location(0) position: vec4f,
  @location(1) normal: vec3f,
};

struct VSOutput {
  @builtin(position) position: vec4f,
  @location(0) normal: vec3f,
  @location(1) surfaceToLight: vec3f,
  @location(2) surfaceToView: vec3f,
};

@group(0) @binding(0) var<uniform> uni: Uniforms;

@vertex fn vs(vert: Vertex) -> VSOutput {
  var vsOut: VSOutput;
  vsOut.position = uni.worldViewProjection * vert.position;

  // Orient the normals and pass to the fragment shader
  vsOut.normal = uni.normalMatrix * vert.normal;

  // Compute the world position of the surface
  let surfaceWorldPosition = (uni.world * vert.position).xyz;

  // Compute the vector of the surface to the light
  // and pass it to the fragment shader
  vsOut.surfaceToLight = uni.lightWorldPosition - surfaceWorldPosition;

  // Compute the vector of the surface to the light
  // and pass it to the fragment shader
  vsOut.surfaceToView = uni.cameraWorldPosition - surfaceWorldPosition;

  return vsOut;
}

@fragment fn fs(vsOut: VSOutput) -> @location(0) vec4f {
  // Because vsOut.normal is an inter-stage variable 
  // it's interpolated so it will not be a unit vector.
  // Normalizing it will make it a unit vector again
  let normal = normalize(vsOut.normal);

  let surfaceToLightDirection = normalize(vsOut.surfaceToLight);
  let surfaceToViewDirection = normalize(vsOut.surfaceToView);
  let halfVector = normalize(
    surfaceToLightDirection + surfaceToViewDirection);

  // Compute the light by taking the dot product
  // of the normal with the direction to the light
  let light = dot(normal, surfaceToLightDirection);

  var specular = dot(normal, halfVector);
  specular = select(
      0.0,                           // value if condition is false
      pow(specular, uni.intensity),  // value if condition is true
      specular > 0.0);               // condition

  // Lets multiply just the color portion (not the alpha)
  // by the light
  let color = uni.color.rgb * light + specular;
  return vec4f(color, uni.color.a);
}
