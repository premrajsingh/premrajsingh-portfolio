---
paths:
  - "src/three/**/*.{js,jsx}"
---

# Three.js / React Three Fiber

- Stack is already present: `three`, `@react-three/fiber`, `@react-three/drei`.
- Keep scenes lightweight; lazy-load heavy 3D modules.
- Provide WebGL and reduced-motion fallbacks; never make essential information depend on WebGL.
- Simplify scenes on mobile; dispose geometries, materials, and textures correctly.
- `@react-three/postprocessing` **2.x** is installed (compatible with R3F v8). Use sparingly; avoid heavy stacks. Do not upgrade to postprocessing 3.x without upgrading `@react-three/fiber` to v9.
