var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/@opennextjs/cloudflare/dist/api/cloudflare-context.js
function getCloudflareContext(options = { async: false }) {
  return options.async ? getCloudflareContextAsync() : getCloudflareContextSync();
}
function getCloudflareContextFromGlobalScope() {
  const global = globalThis;
  return global[cloudflareContextSymbol];
}
function inSSG() {
  const global = globalThis;
  return global.__NEXT_DATA__?.nextExport === true;
}
function getCloudflareContextSync() {
  const cloudflareContext = getCloudflareContextFromGlobalScope();
  if (cloudflareContext) {
    return cloudflareContext;
  }
  if (inSSG()) {
    throw new Error(`

ERROR: \`getCloudflareContext\` has been called in sync mode in either a static route or at the top level of a non-static one, both cases are not allowed but can be solved by either:
  - make sure that the call is not at the top level and that the route is not static
  - call \`getCloudflareContext({async: true})\` to use the \`async\` mode
  - avoid calling \`getCloudflareContext\` in the route
`);
  }
  throw new Error(initOpenNextCloudflareForDevErrorMsg);
}
async function getCloudflareContextAsync() {
  const cloudflareContext = getCloudflareContextFromGlobalScope();
  if (cloudflareContext) {
    return cloudflareContext;
  }
  const inNodejsRuntime = process.env.NEXT_RUNTIME === "nodejs";
  if (inNodejsRuntime || inSSG()) {
    const cloudflareContext2 = await getCloudflareContextFromWrangler();
    addCloudflareContextToNodejsGlobal(cloudflareContext2);
    return cloudflareContext2;
  }
  throw new Error(initOpenNextCloudflareForDevErrorMsg);
}
async function initOpenNextCloudflareForDev(options) {
  const shouldInitializationRun = shouldContextInitializationRun();
  if (!shouldInitializationRun)
    return;
  if (options?.environment && process.env.NEXT_DEV_WRANGLER_ENV) {
    console.warn(`'initOpenNextCloudflareForDev' has been called with an environment option while NEXT_DEV_WRANGLER_ENV is set. NEXT_DEV_WRANGLER_ENV will be ignored and the environment will be set to: '${options.environment}'`);
  }
  const context = await getCloudflareContextFromWrangler(options);
  addCloudflareContextToNodejsGlobal(context);
  await monkeyPatchVmModuleEdgeContext(context);
}
function shouldContextInitializationRun() {
  const AsyncLocalStorage = globalThis["AsyncLocalStorage"];
  return !!AsyncLocalStorage;
}
function addCloudflareContextToNodejsGlobal(cloudflareContext) {
  const global = globalThis;
  global[cloudflareContextSymbol] = cloudflareContext;
}
async function monkeyPatchVmModuleEdgeContext(cloudflareContext) {
  const require2 = (await import(
    /* webpackIgnore: true */
    `${"__module".replaceAll("_", "")}`
  )).default.createRequire(import.meta.url);
  const vmModule = require2("vm");
  const originalRunInContext = vmModule.runInContext.bind(vmModule);
  vmModule.runInContext = (code, contextifiedObject, options) => {
    const runtimeContext = contextifiedObject;
    runtimeContext[cloudflareContextSymbol] ?? (runtimeContext[cloudflareContextSymbol] = cloudflareContext);
    return originalRunInContext(code, contextifiedObject, options);
  };
}
async function getCloudflareContextFromWrangler(options) {
  const { getPlatformProxy } = await import(
    /* webpackIgnore: true */
    `${"__wrangler".replaceAll("_", "")}`
  );
  const environment = options?.environment ?? process.env.NEXT_DEV_WRANGLER_ENV;
  const { env, cf, ctx } = await getPlatformProxy({
    ...options,
    // The `env` passed to the fetch handler does not contain variables from `.env*` files.
    // because we invoke wrangler with `CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV`=`"false"`.
    // Initializing `envFiles` with an empty list is the equivalent for this API call.
    envFiles: [],
    environment
  });
  return {
    env,
    cf,
    ctx
  };
}
var cloudflareContextSymbol, initOpenNextCloudflareForDevErrorMsg;
var init_cloudflare_context = __esm({
  "node_modules/@opennextjs/cloudflare/dist/api/cloudflare-context.js"() {
    cloudflareContextSymbol = Symbol.for("__cloudflare-context__");
    initOpenNextCloudflareForDevErrorMsg = `

ERROR: \`getCloudflareContext\` has been called without having called \`initOpenNextCloudflareForDev\` from the Next.js config file.
You should update your Next.js config file as shown below:

   \`\`\`
   // next.config.mjs

   import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

   initOpenNextCloudflareForDev();

   const nextConfig = { ... };
   export default nextConfig;
   \`\`\`

`;
  }
});

// node_modules/@opennextjs/cloudflare/dist/api/overrides/asset-resolver/index.js
function getResponseBody(method, response) {
  if (method === "HEAD") {
    return null;
  }
  return response.body || new ReadableStream();
}
function isUserWorkerFirst(runWorkerFirst, pathname) {
  if (!Array.isArray(runWorkerFirst)) {
    return runWorkerFirst ?? false;
  }
  let hasPositiveMatch = false;
  for (let rule of runWorkerFirst) {
    let isPositiveRule = true;
    if (rule.startsWith("!")) {
      rule = rule.slice(1);
      isPositiveRule = false;
    } else if (hasPositiveMatch) {
      continue;
    }
    const match = new RegExp(`^${rule.replace(/([[\]().*+?^$|{}\\])/g, "\\$1").replace("\\*", ".*")}$`).test(pathname);
    if (match) {
      if (isPositiveRule) {
        hasPositiveMatch = true;
      } else {
        return false;
      }
    }
  }
  return hasPositiveMatch;
}
var resolver, asset_resolver_default;
var init_asset_resolver = __esm({
  "node_modules/@opennextjs/cloudflare/dist/api/overrides/asset-resolver/index.js"() {
    init_cloudflare_context();
    resolver = {
      name: "cloudflare-asset-resolver",
      async maybeGetAssetResult(event) {
        const { ASSETS } = getCloudflareContext().env;
        if (!ASSETS || !isUserWorkerFirst(globalThis.__ASSETS_RUN_WORKER_FIRST__, event.rawPath)) {
          return void 0;
        }
        const { method, headers } = event;
        if (method !== "GET" && method != "HEAD") {
          return void 0;
        }
        const url = new URL(event.rawPath, "https://assets.local");
        const response = await ASSETS.fetch(url, {
          headers,
          method
        });
        if (response.status === 404) {
          await response.body?.cancel();
          return void 0;
        }
        return {
          type: "core",
          statusCode: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          body: getResponseBody(method, response),
          isBase64Encoded: false
        };
      }
    };
    asset_resolver_default = resolver;
  }
});

// node_modules/@opennextjs/cloudflare/dist/api/config.js
function defineCloudflareConfig(config = {}) {
  const { incrementalCache, tagCache, queue, cachePurge, enableCacheInterception = false, routePreloadingBehavior = "none" } = config;
  return {
    default: {
      override: {
        wrapper: "cloudflare-node",
        converter: "edge",
        proxyExternalRequest: "fetch",
        incrementalCache: resolveIncrementalCache(incrementalCache),
        tagCache: resolveTagCache(tagCache),
        queue: resolveQueue(queue),
        cdnInvalidation: resolveCdnInvalidation(cachePurge)
      },
      routePreloadingBehavior
    },
    // node:crypto is used to compute cache keys
    edgeExternals: ["node:crypto"],
    cloudflare: {
      useWorkerdCondition: true
    },
    dangerous: {
      enableCacheInterception
    },
    middleware: {
      external: true,
      override: {
        wrapper: "cloudflare-edge",
        converter: "edge",
        proxyExternalRequest: "fetch",
        incrementalCache: resolveIncrementalCache(incrementalCache),
        tagCache: resolveTagCache(tagCache),
        queue: resolveQueue(queue)
      },
      assetResolver: () => asset_resolver_default
    }
  };
}
function resolveIncrementalCache(value = "dummy") {
  if (typeof value === "string") {
    return value;
  }
  return typeof value === "function" ? value : () => value;
}
function resolveTagCache(value = "dummy") {
  if (typeof value === "string") {
    return value;
  }
  return typeof value === "function" ? value : () => value;
}
function resolveQueue(value = "dummy") {
  if (typeof value === "string") {
    return value;
  }
  return typeof value === "function" ? value : () => value;
}
function resolveCdnInvalidation(value = "dummy") {
  if (typeof value === "string") {
    return value;
  }
  return typeof value === "function" ? value : () => value;
}
function getDeploymentId() {
  return `dpl-${(/* @__PURE__ */ new Date()).getTime().toString(36)}`;
}
var init_config = __esm({
  "node_modules/@opennextjs/cloudflare/dist/api/config.js"() {
    init_asset_resolver();
  }
});

// node_modules/@opennextjs/cloudflare/dist/api/index.js
var api_exports = {};
__export(api_exports, {
  defineCloudflareConfig: () => defineCloudflareConfig,
  getCloudflareContext: () => getCloudflareContext,
  getDeploymentId: () => getDeploymentId,
  initOpenNextCloudflareForDev: () => initOpenNextCloudflareForDev
});
var init_api = __esm({
  "node_modules/@opennextjs/cloudflare/dist/api/index.js"() {
    init_cloudflare_context();
    init_config();
  }
});

// open-next.config.ts
var require_open_next_config = __commonJS({
  "open-next.config.ts"(exports, module) {
    var { defineCloudflareConfig: defineCloudflareConfig2 } = (init_api(), __toCommonJS(api_exports));
    module.exports = defineCloudflareConfig2();
  }
});
export default require_open_next_config();
