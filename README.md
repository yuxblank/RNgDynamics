[![Coverage Status](https://coveralls.io/repos/github/yuxblank/RNgDynamics/badge.svg?branch=master)](https://coveralls.io/github/yuxblank/RNgLogger?branch=master)

# RNgDynamics
RNgDynamics is library for consuming Modules dynamically within your Angular Applications.

The library allows loading `@NgModule`'s at runtime using the Angular JIT compiler with straightforward api configuring the lazy loaded modules and components.

Angular only supports by default lazy loading from the Router, with RNgDynamics components can be loaded lazily by your application code.

Lazy loaded components can be projected by the built-in directive `rngLazyLoaded` that act's as proxy for dynamic module components.

A lazy loaded module once loaded is cached in memory, so the application will not load it twice.



## Known Limitations
Actually the library only supports lazy loading from modules available at build time using the loading callback:

```typescript
import("./folder/MyModule.ts").then(m => m.MyModule)
```

_The plan is to support loading modules not available at build time in the future._

