import {ComponentRef, Directive, EventEmitter, Input, OnInit, Output, Type, ViewContainerRef} from '@angular/core';
import {DynamicModuleLoaderService} from "./dynamic-module-loader.service";

export interface OnLoaded {
  componentRef: ComponentRef<any>
}

export interface OnLoadError {
  error: any;
  viewContainerRef: ViewContainerRef;
}


@Directive({
  selector: '[rngLazyLoaded]'
})
export class LazyLoadedDirective implements OnInit{
  @Input("rngLazyLoaded") component!: string | Type<any>;
  @Input("cached") cached: boolean = true;
  @Output("onLoaded") onLoaded = new EventEmitter<OnLoaded>();
  @Output("onLoadError") onLoadError = new EventEmitter<OnLoadError>();
  constructor(private vc: ViewContainerRef, private dynamicModuleLoader: DynamicModuleLoaderService) {}

  ngOnInit(): void {
    this.dynamicModuleLoader.getComponentFactory(
      this.component, this.vc.injector, this.cached
    )
      .subscribe(
        factory => {
          this.vc.clear();
          let componentRef = this.vc.createComponent(factory);
          this.onLoaded.emit({
            componentRef: componentRef
          })
        },
        error => {
          this.onLoadError.emit({
            error: error,
            viewContainerRef: this.vc
          })
        }
      )
  }
}
