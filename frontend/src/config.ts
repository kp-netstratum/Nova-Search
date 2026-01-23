const environment = "local";

const config = {
  local: {
    API_BASE_URL: "http://localhost:8001/app",
    WS_BASE_URL: "ws://localhost:8001/app",
  },
  production: {
    API_BASE_URL: "https://dev.studio.bluemesh.ai/app",
    WS_BASE_URL: "wss://dev.studio.bluemesh.ai/app",
  },
};

export default config[environment];