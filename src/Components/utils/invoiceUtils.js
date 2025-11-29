import { jsPDF } from 'jspdf';

const formatNumber = (value) => Number(value || 0);

export const formatCurrency = (value) => {
  return formatNumber(value).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const formatInvoiceDate = (value) => {
  if (!value) return new Date().toLocaleString();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return new Date().toLocaleString();
  }
  return date.toLocaleString();
};

export const mapItemsToInvoiceLines = (items = []) => {
  return items.map((item) => {
    const quantity = Math.max(1, formatNumber(item.quantity));
    const price = formatNumber(item.price);
    return {
      productId: item.productId,
      name: item.name || item.productName || 'Item',
      price,
      quantity,
      subtotal: price * quantity,
      productImage: item.productImage || item.image || null,
      // Preserve farmer info for unified schema
      farmerId: item.farmerId || '',
      farmerEmail: item.farmerEmail || '',
      farmerName: item.farmerName || '',
    };
  });
};

const generateInvoiceNumber = () => `INV${Date.now()}`;

export const createInvoiceFromItems = (items = [], metadata = {}) => {
  const lines = mapItemsToInvoiceLines(items);
  const totalAmount = lines.reduce((sum, line) => sum + line.subtotal, 0);
  return {
    invoiceNo: metadata.invoiceNo || generateInvoiceNumber(),
    date: metadata.date || new Date().toISOString(),
    items: lines,
    totalAmount,
    ...metadata,
  };
};

export const downloadInvoicePdf = (invoice) => {
  if (!invoice) return;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const rightMargin = pageWidth - 14;

  doc.setFontSize(18);
  doc.text('Agri Connect - Invoice', 14, 20);

  doc.setFontSize(12);
  doc.text(`Invoice No: ${invoice.invoiceNo || 'N/A'}`, 14, 30);
  doc.text(`Date: ${formatInvoiceDate(invoice.date)}`, 14, 38);
  if (invoice.paidAt) {
    doc.text(`Paid At: ${formatInvoiceDate(invoice.paidAt)}`, 14, 46);
  }

  let cursorY = invoice.paidAt ? 56 : 48;

  doc.setFontSize(12);
  doc.text('Product', 14, cursorY);
  doc.text('Price', 100, cursorY);
  doc.text('Qty', 130, cursorY);
  doc.text('Subtotal', rightMargin, cursorY, { align: 'right' });

  cursorY += 8;

  invoice.items?.forEach((item) => {
    if (cursorY > 270) {
      doc.addPage();
      cursorY = 20;
    }
    doc.text(item.name || 'Item', 14, cursorY);
    doc.text(`₹${formatCurrency(item.price)}`, 100, cursorY);
    doc.text(String(item.quantity || 1), 130, cursorY);
    doc.text(`₹${formatCurrency(item.subtotal)}`, rightMargin, cursorY, { align: 'right' });
    cursorY += 6;
  });

  cursorY += 6;
  doc.setFontSize(14);
  doc.text(`Total: ₹${formatCurrency(invoice.totalAmount)}`, 14, cursorY);

  const fileName = `${invoice.invoiceNo || 'invoice'}.pdf`;
  doc.save(fileName);
};


