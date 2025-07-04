import axios from "axios";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('orderId');
  const org_id = searchParams.get('org_id');
  const auth_token = searchParams.get('auth_token');
  if (!auth_token || !org_id || !orderId) {
    return new Response(JSON.stringify({
      error: true,
      title: "Missing Required Fields",
      message: "Please provide all required fields (orderId, org_id, auth_token)."
    }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
  // get_bank_credentials
  const bank_credentials = await axios.get(
    'http://192.168.11.23:8890/payment_method/bank/details',
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth_token}`
      },
      params: { org_id }
    }
  ).then(data => ({ data: data.data, success: true })).catch(error => ({ success: false, message: error.response?.data?.detail || "Failed to retrieve bank credentials" }));
  if (!bank_credentials.success || !bank_credentials.data) {
    return new Response(JSON.stringify({
      error: true,
      title: "Bank Credentials Error",
      message: bank_credentials.message || "Could not retrieve bank credentials."
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
  const merchant_url = bank_credentials.data.merchant_url;
  const merchant_account = bank_credentials.data.merchant_account;
  const merchant_api_key = bank_credentials.data.merchant_api_key;
  // get transaction
  const transactionResponse = await axios.get(
    `${merchant_url}/api/rest/version/100/merchant/${merchant_account}/order/${orderId}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`merchant.${merchant_account}:${merchant_api_key}`).toString('base64')}`,
      },
    }
  ).catch(error => ({ data: { result: "FAILED", description: error.response?.data?.error || error.message } }));
  const result = transactionResponse.data;
  if (result.result !== "SUCCESS") {
    return new Response(JSON.stringify({
      error: true,
      title: "Transaction Failed",
      message: result.description || "Something went wrong."
    }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
  const paymentTxn = result.transaction?.find(t => t.transaction?.type === 'PAYMENT');
  const pythonApiPayload = {
    transaction_id: paymentTxn?.transaction?.id || 0,
    order_id: result.id,
    acquirer_name: "Bank Alfalah",
    transaction_type: paymentTxn?.transaction?.type || "PAYMENT",
    status: result.status,
    result: result.result,
    source: result.sourceOfFunds?.provided?.card?.brand || "UNKNOWN",
    amount: result.amount
  };
  // post_bank_data
  let post_data;
  try {
    post_data = await axios.post(
      'http://192.168.11.23:8890/payment_method/bank/save_transaction',
      pythonApiPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth_token}`
        },
        params: { org_id }
      }
    ).then(() => ({ success: true })).catch(error => {
      // Check for duplicate/exists error
      const msg = error.response?.data?.detail || "Failed to save transaction data";
      if (msg.toLowerCase().includes("already exists")) {
        return { success: false, duplicate: true, message: msg };
      }
      return { success: false, message: msg };
    });
  } catch (err) {
    post_data = { success: false, message: err.message };
  }
  if (!post_data?.success) {
    if (post_data.duplicate) {
      return new Response(JSON.stringify({
        error: true,
        title: "Bank Payment",
        message: "Transaction already exists"
      }), { status: 409, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({
      error: true,
      title: "Transaction Saved Error",
      message: post_data.message || "Failed to save transaction."
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
  // Success JSON response
  return new Response(JSON.stringify({
    success: true,
    result,
    pythonApiPayload
  }), { headers: { 'Content-Type': 'application/json' } });
}
