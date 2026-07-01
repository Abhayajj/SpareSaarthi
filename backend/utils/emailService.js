const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');

const createTransporter = async () => {
  // Fallback to Ethereal testing account if no real SMTP details are provided
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log('No SMTP config found. Creating an Ethereal testing account...');
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const generateInvoicePDF = (order, user) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      resolve(Buffer.concat(buffers));
    });

    // Title / Header
    doc.fillColor('#0f172a').fontSize(24).text('SpareSaarthi Invoice', { align: 'right' });
    doc.fontSize(10).fillColor('#64748b').text('Driving mobile solutions for auto logistics.', { align: 'right' });
    doc.moveDown();

    // Horizontal divider
    doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, 110).lineTo(550, 110).stroke();
    doc.moveDown(2);

    // Business & Order Details
    doc.fillColor('#0f172a').fontSize(12).text(`Order ID: ${order._id}`, { bold: true });
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
    doc.text(`Status: ${order.status}`);
    doc.moveDown();

    doc.text('Bill To:', { bold: true });
    doc.text(user.businessName || user.name);
    doc.text(user.address);
    doc.text(user.email);
    doc.moveDown(2);

    // Table Header
    doc.fillColor('#f8fafc').rect(50, doc.y, 500, 20).fill();
    doc.fillColor('#0f172a').fontSize(10);
    const startY = doc.y;
    doc.text('Item Description', 60, startY + 5);
    doc.text('Price', 320, startY + 5, { width: 60, align: 'right' });
    doc.text('Qty', 390, startY + 5, { width: 40, align: 'right' });
    doc.text('Total', 450, startY + 5, { width: 90, align: 'right' });
    doc.moveDown(1.5);

    // Table Body
    order.orderItems.forEach(item => {
      const itemY = doc.y;
      doc.text(item.name, 60, itemY);
      doc.text(`₹${item.price}`, 320, itemY, { width: 60, align: 'right' });
      doc.text(item.qty.toString(), 390, itemY, { width: 40, align: 'right' });
      doc.text(`₹${item.price * item.qty}`, 450, itemY, { width: 90, align: 'right' });
      doc.moveDown();
    });

    // Divider
    doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Summary
    const endY = doc.y;
    if (order.coinsRedeemed > 0) {
      doc.text(`Coins Redeemed: -₹${order.coinsRedeemed}`, 350, endY, { align: 'right' });
      doc.moveDown();
    }
    doc.fontSize(12).text(`Total Amount Paid: ₹${order.totalAmount}`, 350, doc.y, { align: 'right', bold: true });
    doc.fontSize(10).fillColor('#10b981').text(`Coins Earned: +${order.coinsEarned} Coins`, 350, doc.y + 15, { align: 'right' });

    // Footer
    doc.fillColor('#64748b').fontSize(10).text('Thank you for shopping with SpareSaarthi!', 50, 700, { align: 'center' });

    doc.end();
  });
};

const sendInvoiceEmail = async (order, user) => {
  try {
    const transporter = await createTransporter();
    const pdfBuffer = await generateInvoicePDF(order, user);

    const mailOptions = {
      from: '"SpareSaarthi" <no-reply@sparesaarthi.com>',
      to: user.email,
      subject: `SpareSaarthi Invoice — Order #${order._id.toString().substring(18)}`,
      text: `Hello ${user.name},\n\nThank you for your purchase! Please find attached the official invoice for order #${order._id}.\n\nCoins Earned: +${order.coinsEarned} Coins.\n\nBest regards,\nSpareSaarthi Team`,
      attachments: [
        {
          filename: `invoice_${order._id}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Invoice email sent successfully:', info.messageId);
    if (info.host && info.host.includes('ethereal.email')) {
      console.log('Preview URL for test email:', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('Error sending invoice email:', error);
  }
};

module.exports = { sendInvoiceEmail };
