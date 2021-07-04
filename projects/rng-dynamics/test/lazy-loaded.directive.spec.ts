import {TestBed} from "@angular/core/testing";
import {RNgDynamicModule} from "../src/lib/rng-dynamic.module";
import {DYNAMIC_MODULES} from "./test-providers";
import {Component} from "@angular/core";
import {LazyComponent} from "./lazy-module/lazy.component";
import {By} from "@angular/platform-browser";


@Component({
  selector: "test-comp-view",
  template: `
    <ng-container *rngLazyLoaded="lazy"></ng-container>
  `
})
export class TestComponent {
  lazy = LazyComponent
}

describe("LazyLoadedDirective", () => {
  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [TestComponent],
      imports: [
        RNgDynamicModule.forRoot(DYNAMIC_MODULES)
      ]
    }).compileComponents();
  });


  it("should be able to project the lazy loaded component into the view", (done) => {
    let fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    setTimeout(()=> {
      let debugElement = fixture.debugElement.query(By.directive(LazyComponent));
      let nativeElement = debugElement.nativeElement as HTMLElement;
      expect(nativeElement.textContent).toEqual("I'm lazy!")
      done();
    }, 2000)



  });

})
