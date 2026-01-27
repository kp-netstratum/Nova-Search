// import { development } from "./development";
// import { production } from "./production";

const paths = {
  dev: `us7-cluster.hoolva.com`,
  //   test: `us3-test.ncsapp.com`,
  // local: `ai.kutana.net`,
  local: "localhost:5001",
  prod: `civic.bluemesh.ai`,
  keycloak: "civic.bluemesh.ai",
  //   stagging_us2: "us2-stage.ncsapp.com",
  //   production: `ncsapp.com`,
};
const dev = {
  env: "develop",
  path: paths.dev,
  baseURL: `https://${paths.dev}/v3/`,
  domain: `${paths.dev}/portal/`,
  keyCloak: `https://${paths.keycloak}/auth`,
  wssProtocol: `pbx-protocol`,
  download: `https://${paths.dev}/v2/api/download/`,
  multiTenant: false,
  // config: development
};
const prod = {
  env: "prod",
  path: paths.prod,
  baseURL: `https://${paths.prod}/v3/`,
  keyCloak: `https://${paths.keycloak}/auth`,
};
// const test = {
//   env: "testing",
//   path: paths.test,
//   baseURL: `https://${paths.test}/v2/`,
//   domain: `${paths.test}/portal`,
//   keyCloak: `https://${paths.keycloak}/auth/`,
//   wssProtocol: `pbx-protocol`,
//   download: `https://${paths.test}/v2/api/download/`,
//   multiTenant: false,
//   //   config: development,
// };

const local = {
  env: "localhost",
  path: paths.local,
  baseURL: `http://${paths.local}/v3/`,
  domain: `${paths.local}/portal`,
  keyCloak: `https://${paths.keycloak}/auth`,
  wssProtocol: `pbx-protocol`,
  download: `https://${paths.local}/v3/api/download/`,
  multiTenant: false,
  //   config: development,
};
console.log("testst ");

export function getENVData() {
  let text = window.location.hostname;
  if (paths.dev.includes(text)) {
    return dev;
  } else if (paths.local.includes(text)) {
    return local;
  } else {
    return prod;
  }
}
