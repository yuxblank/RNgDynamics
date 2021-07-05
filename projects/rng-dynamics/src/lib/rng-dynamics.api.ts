import {InjectionToken, NgModuleFactory, NgModuleRef, Type} from "@angular/core";

export type RNgDynamicModuleDef<T> = {
  components: RngDynamicComponentsRef;
  import: () => Promise<Type<T>>
}

interface RngDynamicComponentsRef {
  [key:string]: Type<any>;
}

export type RNgDynamicModules<T> = RNgDynamicModuleDef<T>[];

export interface RNgDynamicModuleRef<T> {
  def: RNgDynamicModuleDef<T>;
  module?: Type<any>;
  ref?  : NgModuleRef<T>
}

export const RNG_DYNAMIC_MODULES = new InjectionToken<RNgDynamicModules<any>>("RNG_DYNAMIC_MODULES");
