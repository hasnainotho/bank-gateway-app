import axios from "axios";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const body = await req.json();
    const { token } = body;
    if (!token) return new Response(JSON.stringify({ error: 'Missing token' }), { status: 400 });
    const JWT_SECRET = process.env.JWT_SECRET
    
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
    }
    const amount = decoded.amount;
    const org_id = decoded.org_id;
    if (!amount || !org_id) return new Response(JSON.stringify({ error: 'Amount or Org ID missing in token' }), { status: 400 });
    // get_bank_credentials
    const account_credentials = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/payment_method/bank/details`,
      // 'https://760f-182-184-78-176.ngrok-free.app/payment_method/bank/details',
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${decoded.auth_token}`
        },
        params: { org_id }
      }
    ).then(data => ({ data: data.data, success: true })).catch(error => ({ success: false, message: error.response?.data?.detail || "Failed to retrieve bank credentials" }));
    if (!account_credentials.success || !account_credentials.data) {
      return new Response(JSON.stringify({ error: account_credentials.message || 'Failed to retrieve bank credentials' }), { status: 500 });
    }
    const merchant_account = account_credentials.data.merchant_account;
    const merchant_api_key = account_credentials.data.merchant_api_key;
    const merchant_url = account_credentials.data.merchant_url;
    if (!merchant_account || !merchant_api_key || !merchant_url) {
      return new Response(JSON.stringify({ error: 'Merchant credentials missing' }), { status: 400 });
    }
    const authString = `merchant.${merchant_account}:${merchant_api_key}`;
    const authHeader = `Basic ${Buffer.from(authString).toString('base64')}`;
    const orderId = "ORDER-" + Math.floor(Math.random() * 100000);
    const payload = {
      apiOperation: "INITIATE_CHECKOUT",
      checkoutMode: "WEBSITE",
      interaction: {
        operation: "PURCHASE",
        merchant: {
          name: "TESTATMOSPHERGYM",
          url: "https://bank-2kxtlcd1f-ghulam-hasnains-projects.vercel.app/"
        },
        // returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/success?orderId=${orderId}&org_id=${org_id}&auth_token=${decoded.auth_token}`
        returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL || "https://bank-gateway-app.vercel.app"}/success?orderId=${orderId}&org_id=${org_id}&auth_token=${decoded.auth_token}`
      },
      order: {
        currency: "PKR",
        amount: amount.toFixed(2),
        id: orderId,
        description: "Goods and Services"
      }
    };
    const response = await axios.post(
      `${merchant_url}/api/rest/version/100/merchant/${merchant_account}/session`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
        },
      }
    );
    return new Response(JSON.stringify(response.data), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.response?.data || err.message }), { status: 500 });
  }
}
