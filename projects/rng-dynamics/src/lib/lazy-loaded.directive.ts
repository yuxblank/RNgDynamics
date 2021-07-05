import {Directive, Input, OnInit, Type, ViewContainerRef} from '@angular/core';
import {DynamicModuleLoaderService} from "./dynamic-module-loader.service";

@Directive({
  selector: '[rngLazyLoaded]'
})
export class LazyLoadedDirective implements OnInit{
  @Input("rngLazyLoaded") component!: string | Type<any>;
  constructor(private vc: ViewContainerRef, private dynamicModuleLoader: DynamicModuleLoaderService) {}

  ngOnInit(): void {
    this.dynamicModuleLoader.getComponentFactory(
      this.component, this.vc.injector
    )
      .subscribe(
        factory => {
          this.vc.clear();
          let componentRef = this.vc.createComponent(factory);
        }
      )
  }
}
