import { downloadInvoicePdf, formatInvoiceDate, formatCurrency } from '../utils/invoiceUtils';
import './Checkout.css';

const PaymentSuccessView = ({ invoice, onDownloadInvoice, onContinueShopping }) => {
  const handleDownload = () => {
    if (onDownloadInvoice) {
      onDownloadInvoice(invoice);
      return;
    }
    downloadInvoicePdf(invoice);
  };

  return (
    <div className="checkout-wrapper">
      <div className="checkout-panel">
        <div className="success-hero">
          <h1>Thank You for Your Purchase!</h1>
          <p>Your payment has been processed successfully.</p>
        </div>

        {invoice ? (
          <div className="invoice-meta" style={{ marginBottom: 24 }}>
            <span><strong>Invoice:</strong> {invoice.invoiceNo}</span>
            <span><strong>Date:</strong> {formatInvoiceDate(invoice.date)}</span>
            {invoice.paidAt && <span><strong>Paid:</strong> {formatInvoiceDate(invoice.paidAt)}</span>}
            <span><strong>Total:</strong> ₹{formatCurrency(invoice.totalAmount)}</span>
          </div>
        ) : (
          <div className="empty-state" style={{ marginBottom: 24 }}>
            Invoice details are unavailable, but your purchase was successful.
          </div>
        )}

        <div className="checkout-actions" style={{ justifyContent: 'center' }}>
          <button className="checkout-button primary" type="button" onClick={handleDownload} disabled={!invoice}>
            Download Invoice
          </button>
          <button className="checkout-button secondary" type="button" onClick={onContinueShopping}>
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessView;


