# Mathematics Extension

The NotionEditor now supports mathematical equations using the TipTap Mathematics extension powered by KaTeX.

## Usage

### Inline Math

To insert an inline mathematical equation, wrap your LaTeX expression in single dollar signs:

```
This is an inline equation: $E = mc^2$
```

### Block Math (Display Mode)

For block-level equations (centered and larger), wrap your LaTeX expression in double dollar signs:

```
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$
```

### Using Slash Commands

Type `/math` or `/equation` to quickly insert a math equation template.

## Examples

### Common Equations

**Pythagorean Theorem:**

```
$a^2 + b^2 = c^2$
```

**Quadratic Formula:**

```
$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$
```

**Summation:**

```
$\sum_{i=1}^{n} i = \frac{n(n+1)}{2}$
```

**Integral:**

```
$\int_a^b f(x) dx$
```

**Matrix:**

```
$$
\begin{bmatrix}
a & b \\
c & d
\end{bmatrix}
$$
```

**Greek Letters:**

```
$\alpha, \beta, \gamma, \Delta, \Omega$
```

## Styling

Math equations are styled with:

- Light background with subtle border
- Hover effects for better interactivity
- Full dark mode support
- Block equations have a left border accent

## Technical Details

- **Library:** KaTeX (fast math typesetting)
- **Extension:** @tiptap/extension-mathematics
- **Configuration:**
  - `throwOnError: false` - Invalid LaTeX won't break the editor
  - `displayMode: false` - Inline by default (use `$$` for display mode)
