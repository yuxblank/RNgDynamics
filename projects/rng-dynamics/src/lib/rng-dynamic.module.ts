import {ModuleWithProviders, NgModule} from '@angular/core';
import {DynamicModuleLoaderService} from "./dynamic-module-loader.service";
import {RNG_DYNAMIC_MODULES, RNgDynamicModules} from "./rng-dynamics.api";
import { LazyLoadedDirective } from './lazy-loaded.directive';
@NgModule({
  declarations: [
    LazyLoadedDirective
  ],
  imports: [
  ],
  exports: [
    LazyLoadedDirective
  ],
  providers: [
    DynamicModuleLoaderService
  ]
})
export class RNgDynamicModule {

  static forRoot(dynamics: RNgDynamicModules<any>):ModuleWithProviders<RNgDynamicModule>{
    return  {
      ngModule: RNgDynamicModule,
      providers: [
        {provide: RNG_DYNAMIC_MODULES, multi: true, useValue: dynamics}
      ]
    }
  }
}
