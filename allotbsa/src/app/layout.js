import { Noto_Sans_Bengali, Poppins } from "next/font/google";
import { ConfigProvider, theme } from "antd";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "./globals.css";
import LayoutBasic from "@/components/LayoutBasic";

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});
const notoSansBengali = Noto_Sans_Bengali({
  variable: "--font-noto-sans-bengali",
  subsets: ["bengali"],
  weight: ["400", "500", "700"],
});

export const metadata = {
  title: "ALLOT BSA",
  description: "ALLOT - Business Solution & Automation",
};

// Theme configure
const customTheme = {
  token: {
    colorPrimary: "#247F93",
    colorDark: "#212121",
    fontFamily: "var(--font-noto-sans-bengali)",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${notoSansBengali.variable}`}>
        <ConfigProvider theme={customTheme}>
          <AntdRegistry>
            <LayoutBasic>{children}</LayoutBasic>
          </AntdRegistry>
        </ConfigProvider>
      </body>
    </html>
  );
}
