// app/actions/export.ts
'use server';

export async function exportOrdersToCSV(orders: any[]): Promise<string> {
  // Flatten each order with customer and items
  const rows: any[] = [];
  orders.forEach(order => {
    // If no items, create one row with empty product fields
    if (!order.items || order.items.length === 0) {
      rows.push({
        order_number: order.order_number,
        customer_name: order.customer?.name || '',
        customer_phone: order.customer?.phone || '',
        customer_email: order.customer?.email || '',
        customer_address: order.customer?.address || '',
        total_amount: order.total_amount,
        status: order.status,
        created_at: order.created_at,
        notes: order.notes || '',
        product_name: '',
        variant: '',
        quantity: '',
        price: '',
        subtotal: '',
      });
    } else {
      order.items.forEach((item: any) => {
        rows.push({
          order_number: order.order_number,
          customer_name: order.customer?.name || '',
          customer_phone: order.customer?.phone || '',
          customer_email: order.customer?.email || '',
          customer_address: order.customer?.address || '',
          total_amount: order.total_amount,
          status: order.status,
          created_at: order.created_at,
          notes: order.notes || '',
          product_name: item.product_name,
          variant: item.variant || '',
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal,
        });
      });
    }
  });

  if (rows.length === 0) return '';

  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map(row => headers.map(h => `"${(row[h] || '').toString().replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  return csv;
}