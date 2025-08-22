import { ConfigProviderProps } from "antd/lib/config-provider";

export const theme: ConfigProviderProps["theme"] = {
  token: {
    colorPrimary: "#115BA4"
  },
  components: {
    Button: {
      colorPrimary: "#115BA4",
      colorText: "#115BA4",
      colorBgBase: "#115BA40F",
      colorBorder: "transparent"
    }
  }
};
