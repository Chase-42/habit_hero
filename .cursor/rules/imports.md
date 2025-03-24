# Import Rules

## Import Aliases

- Always use the ~ alias for imports
- Example: `import { Component } from "~/components/Component"` ✅
- Example: `import { Component } from "../../components/Component"` ❌

## Import Order

1. React/Next.js imports
2. External library imports
3. Internal component imports (using ~ alias)
4. Type imports

## Import Style

- Use named imports for components and hooks
- Use default imports for pages
- Group related imports together
- Remove unused imports

## Examples

```tsx
// ❌ Bad
import { Button } from "../../components/ui/button";
import { useState } from "react";

// ✅ Good
import { useState } from "react";
import { Button } from "~/components/ui/button";
```
