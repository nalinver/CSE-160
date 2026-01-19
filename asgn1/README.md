# CSE 160 — Assignment 1 (WebGL Drawing) ~ Nalin Verma

This project is an interactive WebGL drawing app. You can paint by click-dragging on the canvas and switch between drawing **Points**, **Triangles**, and **Circles**, with adjustable color/size settings.


## Controls (UI)

- **Clear**: clears the canvas.
- **Point / Triangle / Circle**: choose what you draw while dragging.
- **Red / Green / Blue**: color sliders (0–100).
- **Size**: point size / overall shape size slider.
- **Segments**: circle smoothness slider (higher = smoother circle).

## Cool feature: Live symmetry mode

Every shape you draw can be automatically duplicated with symmetry for a “mirror/kaleidoscope” effect.

- **Symmetry** (`off | vertical | horizontal | radial`)
  - **vertical**: duplicates across the vertical axis (left-right mirror).
  - **horizontal**: duplicates across the horizontal axis (up-down mirror).
  - **radial**: duplicates by rotating around the center in multiple slices.
- **Radial slices** (2–16): number of copies used for **radial** symmetry.

## Notes

- Symmetry operates in clip-space (WebGL coordinates), so it stays centered and consistent regardless of canvas pixel size.
- For best performance, keep radial slices moderate if you’re drawing a lot of shapes.


## Resources Used:
- **Cursor**
    - Generate this README so that it captures what I have done without me having to resummarize.
    - Got stuck trying to figure out why segmentCount slider kept giving me a "gl_segment undefined". Turns out, I don't need to declare a *gl_segment* variable at all, I just need to reference it when I define a new Circle point in buildShapeAt(x,y) (formerly renderAllShapes()).
    - Asked it to clean up clutter/debug lines/print statements/weird comments/etc.
- **GeeksForGeeks**
    - 
- **StackOverflow**