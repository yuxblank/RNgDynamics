import {Compiler, ComponentFactory, Inject, Injectable, Injector, Optional, Type} from '@angular/core';
import {RNG_DYNAMIC_MODULES, RNgDynamicModuleDef, RNgDynamicModuleRef, RNgDynamicModules} from "./rng-dynamics.api";
import {Logger, LoggerFactory} from "rng-logger";
import {combineLatest, from, Observable, of} from "rxjs";
import {map, mergeMap, take, throwIfEmpty} from "rxjs/operators";

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


  getComponentFactory(component: Type<any> | string, parent: Injector, refresh = false): Observable<ComponentFactory<any>> {

    return of(this.dynamicModules)
      .pipe(
        map(modules => {
          let componentType: Type<any>|undefined;
          let dynamicModuleDef = modules.find(p => {
            if (typeof component === "string") {
              p.def.components.hasOwnProperty(component);
              componentType = p.def.components[component];
              return !!componentType;
            } else {
               componentType = Object.values(p.def.components).find(
                def => def === component
              )
              return !!componentType;
            }
          });
          if (!dynamicModuleDef) {
            throw `No RNgDynamicModules has a component named ${component}`;
          }
          if (!componentType) {
            throw `Component named ${component} cannot be found in RNgDynamicModules`;
          }
          return {
            dynamicModuleDef: dynamicModuleDef,
            componentType: componentType
          }
        }),
        mergeMap(def => {
          const lazyLoad = of(def)
            .pipe(
              take(1),
              mergeMap(def => {
                if (!!def.dynamicModuleDef.module){
                  return combineLatest(of(def), of(def.dynamicModuleDef.module));
                }
                return combineLatest(of(def), from(def.dynamicModuleDef.def.import()));
              }),
              mergeMap(
                ([def, loaded]) => {
                  def.dynamicModuleDef.module = loaded;
                  return combineLatest(of(def), from(this.compiler.compileModuleAndAllComponentsAsync(loaded)))
                }
              ),
              mergeMap(([def, loaded]) => {
                let injector = Injector.create({
                  parent: parent,
                  providers: []
                });
                // todo this is an assignment for the cache we need to change it's flow to prevent the side effect to happen here
                def.dynamicModuleDef.ref = loaded.ngModuleFactory.create(injector);
                return of(def);
              }),
              mergeMap(obs => {
                return this.resolveComponentFactory(obs.dynamicModuleDef, obs.componentType);
              })
            );

          if (def.dynamicModuleDef.ref && !refresh){
            return this.resolveComponentFactory(def.dynamicModuleDef, def.componentType)
          }
          return lazyLoad;
        })
      )
  }

  private resolveComponentFactory(module: RNgDynamicModuleRef<any>, componentType: Type<any>):Observable<ComponentFactory<any>> {
    return of(module.ref.componentFactoryResolver.resolveComponentFactory(componentType));
  }
}
