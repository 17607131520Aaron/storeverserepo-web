declare module "react-barcode" {
  import type React from "react";

  export interface ReactBarcodeProps {
    value: string;
    format?:
      | "CODE128"
      | "CODE128A"
      | "CODE128B"
      | "CODE128C"
      | "EAN13"
      | "EAN8"
      | "EAN5"
      | "EAN2"
      | "UPC"
      | "UPCE"
      | "ITF14"
      | "MSI"
      | "MSI10"
      | "MSI11"
      | "MSI1010"
      | "MSI1110"
      | "pharmacode"
      | "codabar"
      | "CODE39"
      | "CODE39VIN";
    width?: number;
    height?: number;
    displayValue?: boolean;
    fontOptions?: string;
    font?: string;
    text?: string;
    textAlign?: "left" | "center" | "right";
    textPosition?: "top" | "bottom";
    textMargin?: number;
    fontSize?: number;
    background?: string;
    lineColor?: string;
    margin?: number;
    marginTop?: number;
    marginBottom?: number;
    marginLeft?: number;
    marginRight?: number;
    flat?: boolean;
    valid?(valid: { valid: boolean; error?: string }): void;
    renderer?: "svg" | "canvas" | "img";
  }

  const ReactBarcode: React.FC<ReactBarcodeProps>;

  export default ReactBarcode;
}

declare module "qrcode.react" {
  import type React from "react";

  export interface QRCodeProps {
    value: string;
    size?: number;
    bgColor?: string;
    fgColor?: string;
    level?: "L" | "M" | "Q" | "H";
    includeMargin?: boolean;
  }

  export const QRCodeCanvas: React.FC<QRCodeProps>;

  export default QRCodeCanvas;
}
