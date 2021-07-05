[![Coverage Status](https://coveralls.io/repos/github/yuxblank/RNgDynamics/badge.svg?branch=master)](https://coveralls.io/github/yuxblank/RNgDynamics?branch=master)

# RNgDynamics
RNgDynamics is library for consuming Modules dynamically within your Angular Applications.

The library allows loading `@NgModule`'s at runtime using the Angular JIT compiler with straightforward api configuring the lazy loaded modules and components.

Angular only supports by default lazy loading from the Router, with RNgDynamics components can be loaded lazily by your application code.

Lazy loaded components can be projected by the built-in directive `rngLazyLoaded` that act's as proxy for dynamic module components.

A lazy loaded module once loaded is cached in memory, so the application will not load it twice.


## Features

- Lazy load modules and components without Angular Router
- Project lazy loaded components using a simple directive `rngLazyLoaded`
0- Modules and components are cached in memory (optionally Module Factories can be non-cached)
- Load lazy components by type or by a named key string you define
- Create endlessly lazy-loading capabilities in your Angular applications and libraries by wiring your own lazy loading logic


## Usage

First of all create a Module to be lazy loaded without importing it into the others modules or RootModule.

Then define the `RNgDynamicModuleDef` for your module to be registered within RNgDynamics as follows:
```typescript
const RNG_DYNAMICS : RNgDynamicModules<LazyModule> = [
  {
    components: {lazyComponent: LazyComponent}, // all the components associated with the Module
    import: () => import("./lazy/lazy.module").then(m => m.LazyModule) // use import and resolve the module type
  }
]
```

Then register the `RNgDynamicModules<T>` array to the `RNgDynamicModule` using the `forRoot` method.
 
```typescript
@NgModule({
  declarations: [AppComponent],
  imports: [
    CommonModule,
    BrowserModule,
    RNgLoggerModule,
    RNgDynamicModule.forRoot(RNG_DYNAMICS) // register dynamics
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

You can use the `RNgDynamicModule.forRoot` in any module multiple times, the configurations are compacted by the library.

Now just define an element you want to proxy in your Components, as follows:

```html
 <ng-container rngLazyLoaded="lazyComponent"></ng-container>
```

or by supplying the type:
```typescript
@Component({
    selector: "my-component",
    template: `<ng-container [rngLazyLoaded]="myLazyComp"></ng-container>`
})
export class MyComponent {
    myLazyComp = LazyComponent
}
```

*That's enough, your LazyComponent is ready to be lazy-loaded!*


## Known Limitations
Actually the library only supports lazy loading from modules available at build time using the loading callback:

```typescript
import("./folder/MyModule.ts").then(m => m.MyModule)
```

_The plan is to support loading modules not available at build time in the future._

