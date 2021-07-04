import {LazyComponent} from "./lazy-module/lazy.component";

export const DYNAMIC_MODULES = [
  {
    components: {
      lazyComp: LazyComponent
    },
    import: () => import("./lazy-module/lazy-module").then(m => m.LazyModule)
  }
]
