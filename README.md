# Farlands

A full-screen, scroll-controlled voxel journey built with Vite and Three.js. The original workspace contained only the supplied model folders; no application, package manifest, routes, components, or styles existed. Both original folders are preserved unchanged.

## Run

With Node.js 22 installed:

```sh
npm install
npm run dev
```

Open http://127.0.0.1:5173. Scroll or use the browser's normal keyboard scrolling to fall through clouds, land, and jump across all six faces. Scroll upward to reverse everything.

A portable Node runtime was downloaded into the ignored `.tools/` directory for this workspace. In PowerShell, if Node is not on PATH:

```powershell
$env:PATH = "$PWD\.tools\node-v22.16.0-win-x64;$env:PATH"
npm.cmd run dev
```

## Build and checks

```sh
npm run build
npm run preview
npm test
npm run test:browser
```

The browser test requires the dev server on port 5173. It uses the Brave installation discovered on this machine. Set `BROWSER_PATH` to a local Chromium-compatible browser executable on another machine. Test screenshots and the JSON report are written to the ignored `test-results/` directory. Production output is in `dist/`; deploy that directory to a static host. No server or CDN is required at runtime.

## Supplied asset inspection

| Asset | Original location | Runtime location | Geometry |
| --- | --- | --- | --- |
| World | `world cube.gltf/output.gltf` and `output.bin` | `public/models/world/` | 102 nodes, 100 solids; centered cube core from −0.039 to +0.039 on each axis, face plates extend to ±0.040; decorations extend farther |
| Steve | `world cube.gltf/steve falling.gltf/output.gltf` and `output.bin` | `public/models/steve/` | 23 nodes, 21 solids; feet at Y=0, head at Y=0.0325, X spans approximately ±0.010535, Z from −0.004 to +0.00406 |

Both are GLTF 2.0 CAD exports from zoo.dev, use adjacent `output.bin` files, and contain material colors rather than external textures. Node transforms are identity, geometry is Y-up, and Steve faces +Z. Neither model needs baked animations. Each solid consists of several GLTF primitives. The loader merges these by body part or world, preserving geometry and colors while reducing draw calls. For this stylized render, materials use nonmetallic rough shading instead of the exports' metallic factor of 1.

The world normalizes its 0.08-wide faces to 4.4 scene units. Its rotation pivot is measured from the symmetric core, not the decorated bounding box. Steve normalizes to 1.72 units tall. Verified solid indices attach facial details to the head, hands to arms, and boots to legs. A different mesh count gracefully falls back to whole-model posing. Replacement assets with different dimensions/topology require revisiting these mappings and the world scale.

## Structure and animation

- `src/Hero3D.js`: renderer, restrained responsive camera, lighting, inverse rotation, resource lifecycle.
- `src/models.js`: GLTF loading, geometry merging, articulated Steve and centered cube.
- `src/clouds.js`: one instanced draw call for 64 desktop / 36 mobile cloud blocks; no cloud asset.
- `src/timeline.js`: pure normalized timeline, constants, current/target biome indices.
- `src/main.js`: scroll observation, minimal copy/progress, loading/error handling.
- `src/style.css`: responsive full-screen presentation.

The first 43% of the scroll covers free fall, cloud wipe, landing and rest. Five subsequent jumps use positive 90° rotations alternating around Z and X. Both axes point toward the camera, so positive rotations read anticlockwise; this visits +Y, +X, −Z, −Y, −X, +Z rather than repeatedly showing only four faces. Steve is a sibling of the cube. The biome quaternion multiplied by its clockwise inverse leaves him upright, with independent subtle limb/body posing. Rotation finishes before descent reaches the surface.

Every pose derives from scroll progress; no event-driven animation chains or animation mixers are used. A damped progress value handles fast scroll and reversals. The renderer stops requesting frames once progress settles, caps pixel ratio at 1.7, uses a lightweight contact shadow, and has no postprocessing. Reduced motion disables damping and tumbling. Resize, visibility, context loss and disposal are handled.

## Verification

Timeline tests cover exact surface height, full cloud coverage timing, airborne rotation, quarter-turn angles, all six faces, upright compensation, continuity, reverse scrolling and arbitrary seeks. Browser tests load both GLTFs and both binary buffers, capture the fall/wipe/landing and every jump/biome, assert every 90° turn and upright quaternion, exercise fast/reverse scrolling, check desktop/mobile/reduced-motion layouts, and verify the asset-failure fallback. Visual checks use screenshots from Chromium/Brave; this does not substitute for measuring frame rates on every target device.
