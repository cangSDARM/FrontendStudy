- [Path Commands](#path-commands)
  - [Cubic Bézier curve](#cubic-bézier-curve)
  - [Smooth Cubic Bézier curve](#smooth-cubic-bézier-curve)
  - [Quadratic Bézier curve](#quadratic-bézier-curve)
  - [Smooth Quadratic Bézier curve](#smooth-quadratic-bézier-curve)
  - [Arc (TODO)](#arc-todo)

## Path Commands

`<path d="(?:(Command)(Args))*" stroke="#000"></path>`

Capital means its absolute path, otherwase be relative coordinate

| Command |       Action        |                          Args                          |                                                   Explain                                                   |
| :-----: | :-----------------: | :----------------------------------------------------: | :---------------------------------------------------------------------------------------------------------: |
|    M    |       Move to       |                         (x y)+                         |                                      The begin coordinate of the path                                       |
|    Z    |     close path      |                          None                          |                             Link the begin point and the end point with stright                             |
|    L    |       line to       |                         (x y)+                         |                          Link the current point to the defined point with stright                           |
|    H    |   horizontally to   |                           x+                           |                                    stay y coordinate, move x coordinate                                     |
|    V    |    vertically to    |                           y+                           |                                    stay x coordinate, move y coordinate                                     |
|    C    |      curve to       |                   (x1 y1 x2 y2 x y)+                   |                                  [Cubic Bézier curve](#cubic-bézier-curve)                                  |
|    S    |   smooth curve to   |                      (x2 y2 x y)+                      |                           [Smooth Cubic Bézier curve](#smooth-cubic-bézier-curve)                           |
|    Q    |    quadratic to     |                      (x1 y1 x y)+                      |                              [Quadratic Bézier curve](#quadratic-bézier-curve)                              |
|    T    |   smooth curve to   |                         (x y)+                         |                                        Smooth Quadratic Bézier curve                                        |
|    A    |   elliptical arc    | (rx ry x-axis-rotation large-arc-flag sweep-flag x y)+ |                                           [Elliptical Arc](#arc)                                            |
|    R    | Catmull-Rom crve to |                      (x1 y1 x y)+                      | [Catmull-Rom](<(http://en.wikipedia.org/wiki/Catmull%E2%80%93Rom_spline#Catmull.E2.80.93Rom_spline)>) Curve |

### Cubic Bézier curve

Sample

```html
<!-- M20 20 , Start Point -->
<!-- C60 80, 140, 80, 180 20
    Left Controll Point, Right Controll Point, End Point -->
<path d="M20 20 C60 80, 140 80, 180 20" stroke="#fff" fill="none"></path>
```

Effect

<svg width="230" height="90">

<g fill="#aaf" style="stroke-width: 2px;">
    <text x="20" y="20">M20 20</text>
    <circle r="4" cx="20" cy="20"></circle>
    <circle r="4" cx="60" cy="80"></circle>
    <text x="60" y="80">C60 80</text>
    <path d="M20 20 L60 80" stroke="#aaf"></path>
    <circle r="4" cx="140" cy="80"></circle>
    <text x="140" y="80">140 80</text>
    <circle r="4" cx="180" cy="20"></circle>
    <text x="180" y="20">180 20</text>
    <path d="M140 80 L180 20" stroke="#aaf"></path>
    <path d="M20 20 C60 80, 140 80, 180 20" stroke="#fff" fill="none"></path>
</g>
</svg>

### Smooth Cubic Bézier curve

> Need to use the C / S command before, otherwise use the Q command

Sample

```html
<!-- S220 80, 240 20 ,
    Auto Automatic symmetry of a control point. That means it will 
    append 220, -40 to translated into C220 -40, 220 80, 240 20 -->
<path
  d="M20 20 C60 80, 140 80, 180 20 S220 80, 240 20"
  stroke="#fff"
  fill="none"
></path>
```

Effect

<svg width="324" height="150">

<g fill="#aaf" style="stroke-width: 2px;">
    <text x="80" y="80">M20 20</text>
    <circle r="4" cx="20" cy="80"></circle>
    <circle r="4" cx="60" cy="140"></circle>
    <text x="60" y="140">C60 80</text>
    <path d="M20 80 L60 140" stroke="#aaf"></path>
    <circle r="4" cx="220" fill="#66f" cy="20"></circle>
    <text x="220" y="20" fill="#66f">220 -40</text>
    <path d="M180 80 L220 20" stroke="#66f"></path>
    <text x="280" y="80">280 20</text>
    <circle r="4" cx="140" cy="140"></circle>
    <text x="140" y="140">140 80</text>
    <circle r="4" cx="180" cy="80"></circle>
    <text x="180" y="80">180 20</text>
    <path d="M140 140 L180 80" stroke="#aaf"></path>
    <circle r="4" cx="240" cy="140"></circle>
    <text x="240" y="140">S240 80</text>
    <circle r="4" cx="280" cy="80"></circle>
    <path d="M240 140 L280 80" stroke="#aaf"></path>
    <text x="280" y="80">280 20</text>
    <path d="M20 80 C60 140, 140 140, 180 80 S240 140, 280 80" stroke="#fff" fill="none"></path>
</g>
</svg>

### Quadratic Bézier curve

Sample

```html
<!-- M20 20 , Start Point -->
<!-- Q60 80, 140, 20
    Controll Point, End Point -->
<path d="M20 20 Q60 80, 140 20" stroke="#fff" fill="none"></path>
```

Effect

<svg width="230" height="90">

<g fill="#aaf" style="stroke-width: 2px;">
    <text x="20" y="20">M20 20</text>
    <circle r="4" cx="20" cy="20"></circle>
    <circle r="4" cx="60" cy="80"></circle>
    <text x="60" y="80">Q60 80</text>
    <path d="M20 20 L60 80" stroke="#aaf"></path>
    <circle r="4" cx="140" cy="20"></circle>
    <text x="140" y="20">140 20</text>
    <path d="M60 80 L140 20" stroke="#aaf"></path>
    <path d="M20 20 Q60 80, 140 20" stroke="#fff" fill="none"></path>
</g>
</svg>

### Smooth Quadratic Bézier curve

> Need to use the Q / T command before, otherwise use the L command

Sample

```html
<!-- T240 40 ,
    Auto Automatic symmetry of a control point. That means it will 
    append 220, -40 to translated into Q220 -40, 240 40 -->
<path d="M20 20 Q60 80, 140 20 T240 40" stroke="#fff" fill="none"></path>
```

Effect

<svg width="290" height="126">

<g fill="#aaf" style="stroke-width: 2px;">
    <text x="20" y="60">M20 20</text>
    <circle r="4" cx="20" cy="60"></circle>
    <circle r="4" cx="60" cy="120"></circle>
    <text x="60" y="120">Q60 80</text>
    <path d="M20 60 L60 120" stroke="#aaf"></path>
    <circle r="4" cx="140" cy="60"></circle>
    <text x="140" y="60">140 20</text>
    <path d="M60 120 L140 60" stroke="#aaf"></path>
    <circle r="4" cx="240" cy="80"></circle>
    <text x="240" y="80">T240 40</text>
    <path d="M220 0 L240 80" stroke="#66f"></path>
    <circle r="4" cx="220" cy="0" fill="#66f"></circle>
    <text x="220" y="10" fill="#66f">220 -40</text>
    <path d="M140 60 L220 00" stroke="#66f"></path>
    <path d="M20 60 Q60 120, 140 60 T240 80" stroke="#fff" fill="none"></path>
</g>
</svg>

### Arc (TODO)

Sample

```html
<path d="M80 80 A 45 45, 0, 0, 0, 125 125" fill="green" />
```

Effect

<svg width="325px" height="325px">

<g fill="#aaf" style="stroke-width: 2px;">
    <text x="80" y="80">M80 80</text>
    <circle r="4" cx="80" cy="80"></circle>
    <text x="125" y="125">125 125</text>
    <circle r="4" cx="125" cy="125"></circle>
    <text x="125" y="125">125 125</text>
    <text x="125" y="125">125 125</text>
    <path d="M80 80
            A 30 50, 0, 0, 0, 125 125" fill="none" stroke="#fff"></path>
    </g>
    <ellipse cx="110" cy="80" rx="30" ry="50" fill="transparent" stroke="#aaf" stroke-dasharray="5 5"></ellipse>
</svg>
