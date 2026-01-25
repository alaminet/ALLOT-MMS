import { useCallback } from "react";

const usePOSBillPrint = ({ billData }) => {
  const printBill = () => {
    const printWindow = window.open("", "", "width=800,height=600");

    const htmlContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>POS Bill</title>
                    <style>
                        body { font-family: monospace; margin: 20px; }
                        .bill-header { text-align: center; margin-bottom: 20px; }
                        .bill-items { margin: 20px 0; }
                        .item-row { display: flex; justify-content: space-between; margin: 5px 0; }
                        .divider { border-bottom: 1px dashed #000; margin: 10px 0; }
                        .bill-total { font-weight: bold; font-size: 16px; margin-top: 10px; }
                        .bill-footer { text-align: center; margin-top: 20px; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="bill-header">
                        <h2>${billData?.orgName || "POS BILL"}</h2>
                        <p>Invoice #${billData?.code}</p>
                        <p>${new Date().toLocaleString()}</p>
                    </div>
                    
                    <div class="divider"></div>
                    
                    <div class="bill-items">
                        ${billData?.items
                          .map(
                            (item) => `
                            <div class="item-row">
                                <span>${item.name} x${item?.quantity}</span>
                                <span>${(item?.salePrice * item?.quantity).toFixed(2)}</span>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>
                    
                    <div class="divider"></div>
                    
                    <div class="bill-total">
                        <div class="item-row">
                            <span>Subtotal:</span>
                            <span>${billData.payments?.totalBill?.toFixed(2) || "0.00"}</span>
                        </div>
                        <div class="item-row">
                            <span>Tax:</span>
                            <span>${billData.payments?.vat?.toFixed(2) || "0.00"}</span>
                        </div>
                        <div class="item-row">
                            <span>Total:</span>
                            <span>${billData.payments?.duePay?.toFixed(2) || "0.00"}</span>
                        </div>
                    </div>
                    
                    <div class="bill-footer">
                        <p>Thank you for your purchase!</p>
                    </div>
                </body>
            </html>
        `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };
  return printBill;
};

export default usePOSBillPrint;
