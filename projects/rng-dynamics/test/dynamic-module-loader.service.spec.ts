import {TestBed} from "@angular/core/testing";
import {RNgDynamicModule} from "../src/lib/rng-dynamic.module";
import {LazyComponent} from "./lazy-module/lazy.component";
import {DynamicModuleLoaderService} from "../src/lib/dynamic-module-loader.service";
import {ComponentFactory, ComponentFactoryResolver, Injector} from "@angular/core";
import {DYNAMIC_MODULES} from "./test-providers";
import {Logger} from "rng-logger";
import {mergeMap} from "rxjs/operators";
import {combineLatest, of} from "rxjs";


describe("DynamicModuleLoaderService", () => {

  beforeEach(() => {
    TestBed.configureTestingModule(
      {
        imports: [RNgDynamicModule.forRoot(DYNAMIC_MODULES)]
      }
    )
  });

  it("should be able to load the lazy component by key name", (done) => {

    let service: DynamicModuleLoaderService = TestBed.get(DynamicModuleLoaderService);

    service.getComponentFactory("lazyComp", TestBed.get(Injector))
      .subscribe(next => {
        expect(next.componentType).toBe(LazyComponent);
        done();
      })
  });

  it("should be able to load the lazy component by type", (done) => {

    let service: DynamicModuleLoaderService = TestBed.get(DynamicModuleLoaderService);

    service.getComponentFactory(LazyComponent, TestBed.get(Injector))
      .subscribe(next => {
        expect(next.componentType).toBe(LazyComponent);
        done();
      })
  });

  it("should throw error when component is not registered by string", () => {

    let service: DynamicModuleLoaderService = TestBed.get(DynamicModuleLoaderService);

    service.getComponentFactory("lazyCompX", TestBed.get(Injector))
      .subscribe(next => {
      }, error => {
        expect(error).toBeDefined();
      })
  });
  it("should throw error when component is not registered by type", () => {

    let service: DynamicModuleLoaderService = TestBed.get(DynamicModuleLoaderService);

    class MyType {}

    service.getComponentFactory(MyType, TestBed.get(Injector))
      .subscribe(next => {
      }, error => {
        expect(error).toBeDefined()
      })
  });

  it("it should get cached ref when reloading the same module", (done) => {
    let service: DynamicModuleLoaderService = TestBed.get(DynamicModuleLoaderService);
    let rootInjector = TestBed.get(Injector);

    TestBed.get(Injector);
    let newInjector = Injector.create({
      parent: rootInjector,
      providers: [{provide: "test", useValue:"hello!"}]
    });
    service.getComponentFactory(LazyComponent, newInjector)
      .pipe(
        mergeMap(lazy => {
          return combineLatest(of(lazy),service.getComponentFactory(LazyComponent, rootInjector)); // this is using the root but uses the first loaded instead
        })
      )
      .subscribe(([first, second]) => {
        expect(first.create(rootInjector).injector.get("test")).toEqual("hello!");
        expect(second.create(rootInjector).injector.get("test")).toEqual("hello!");
        done();
      })
  });
  it("it should be able to refresh cached module", (done) => {
    let service: DynamicModuleLoaderService = TestBed.get(DynamicModuleLoaderService);
    let rootInjector = TestBed.get(Injector);

    TestBed.get(Injector);
    let newInjector = Injector.create({
      parent: rootInjector,
      providers: [{provide: "test", useValue:"hello!"}]
    });
    service.getComponentFactory(LazyComponent, newInjector)
      .pipe(
        mergeMap(lazy => {
          return combineLatest(of(lazy),service.getComponentFactory(LazyComponent, rootInjector, false));
        }),
      )
      .subscribe(([first, second]) => {
        expect(first.create(rootInjector).injector.get("test")).toEqual("hello!");
        expect(() => {second.create(rootInjector).injector.get("test");}).toThrow();
        done();
      })
  });
});

describe("DynamicModuleLoaderService with no ModuleDef", () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:[RNgDynamicModule]
    });

    it("should only log that no def are present", () => {

      let logger: Logger = TestBed.get(Logger);
      let spy = spyOn(logger,"debug");
      let service: DynamicModuleLoaderService = TestBed.get(DynamicModuleLoaderService);
      expect(spy).toHaveBeenCalled();
    });

  });
});
