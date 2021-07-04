import {Compiler, ComponentFactory, ComponentRef, Inject, Injectable, Injector, Optional, Type} from '@angular/core';
import {RNG_DYNAMIC_MODULES, RNgDynamicModuleRef, RNgDynamicModuleDef, RNgDynamicModules} from "./rng-dynamics.api";
import {Logger, LoggerFactory} from "rng-logger";
import {combineLatest, from, Observable, of} from "rxjs";
import {mergeMap, take, tap} from "rxjs/operators";

@Injectable()
export class DynamicModuleLoaderService {

  private readonly logger: Logger = LoggerFactory();
  private dynamicModules: RNgDynamicModuleRef<any>[];

  constructor(private compiler: Compiler, @Optional() @Inject(RNG_DYNAMIC_MODULES) modules?: RNgDynamicModules<any>[]) {
    if (!modules) {
      this.logger.debug("DynamicModuleLoaderService::init no modules registered");
      this.dynamicModules = [];
      return;
    }
    this.dynamicModules = ([] as RNgDynamicModuleDef<any>[]).concat(...modules).map(
      def => {
        return {
          def: def
        }
      }
    )
  }

  getLazyFactory(component: Type<any> | string, parent: Injector): Observable<ComponentFactory<any>> {

    let componentType: Type<any>|undefined = typeof component !== "string" ? component: undefined;
    let dynamicModuleDef = this.dynamicModules.find(p => {
      if (typeof component === "string") {
        p.def.components.hasOwnProperty(component);
         componentType = p.def.components[component];
         return !!componentType;
      } else {
        return Object.values(p.def.components).find(
          def => def === component
        )
      }
    });

    if (!dynamicModuleDef) {
      throw `No RNgDynamicModules has a component named ${component}`;
    }

    if (!componentType) {
      throw `Component named ${component} cannot be found in RNgDynamicModules`;
    }

    if (dynamicModuleDef.ref){
      return this.getComponentFactory(dynamicModuleDef, componentType);
    }

    // load async
    return of(dynamicModuleDef)
      .pipe(
        take(1),
        mergeMap(value => {
          return combineLatest(of(value), from(value.def.import()));
        }),
        mergeMap(
          ([def, loaded]) => {
            return combineLatest(of(def), from(this.compiler.compileModuleAndAllComponentsAsync(loaded)))
          }
        ),
        mergeMap(([def, loaded]) => {
          let injector = Injector.create({
            parent: parent,
            providers: []
          });
          def.ref = loaded.ngModuleFactory.create(injector);
          return of(def);
        }),
        mergeMap(module => {
          return this.getComponentFactory(module, componentType);
        })
      )
  }

  private getComponentFactory(module: RNgDynamicModuleRef<any>, componentType: Type<any>):Observable<ComponentFactory<any>> {
    return of(module.ref.componentFactoryResolver.resolveComponentFactory(componentType));
  }
}
