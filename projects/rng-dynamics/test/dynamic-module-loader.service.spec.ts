import {TestBed} from "@angular/core/testing";
import {RNgDynamicModule} from "../src/lib/rng-dynamic.module";
import {LazyComponent} from "./lazy-module/lazy.component";
import {DynamicModuleLoaderService} from "../src/lib/dynamic-module-loader.service";
import {Injector} from "@angular/core";
import {DYNAMIC_MODULES} from "./test-providers";


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

    class MyType {
    }

    service.getComponentFactory("lazyCompX", TestBed.get(Injector))
      .subscribe(next => {
      }, error => {
        expect(error).toBeDefined();
      })
  });
  it("should throw error when component is not registered by type", () => {

    let service: DynamicModuleLoaderService = TestBed.get(DynamicModuleLoaderService);

    class MyType {
    }

    service.getComponentFactory(MyType, TestBed.get(Injector))
      .subscribe(next => {
      }, error => {
        expect(error).toBeDefined()
      })
  });


})
