import {Directive, Input, OnInit, Type, ViewContainerRef} from '@angular/core';
import {DynamicModuleLoaderService} from "./dynamic-module-loader.service";
import {catchError, take} from "rxjs/operators";

@Directive({
  selector: '[rngLazyLoaded]'
})
export class LazyLoadedDirective implements OnInit{


  @Input("rngLazyLoaded") component!: string | Type<any>;

  constructor(private vc: ViewContainerRef, private dynamicModuleLoader: DynamicModuleLoaderService) {

  }

  ngOnInit(): void {
    this.dynamicModuleLoader.getComponentFactory(
      this.component, this.vc.injector
    )
      .pipe(
        take(1),
      )
      .subscribe(
        factory => {
          this.vc.clear();
          this.vc.createComponent(factory);
        },
        error => {

        }
      )

  }



}
