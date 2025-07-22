import axios from "axios";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('orderId');
  const org_id = searchParams.get('org_id');
  const booking_id = searchParams.get('booking_id');
  const auth_token = searchParams.get('auth_token');

  function extractDateTimeWithOffset(isoString, timeZone) {
  const dateUtc = new Date(isoString);

  const sign = timeZone[0] === '+' ? 1 : -1;
  const hoursOffset = parseInt(timeZone.slice(1, 3), 10);
  const minutesOffset = parseInt(timeZone.slice(3, 5), 10);
  const offsetMs = sign * (hoursOffset * 60 + minutesOffset) * 60 * 1000;

  const localDate = new Date(dateUtc.getTime() + offsetMs);

  return {
    date: localDate.toISOString().split('T')[0],
    time: localDate.toTimeString().split(' ')[0]
  };
}

  
  if (!auth_token || !org_id || !orderId) {
    return new Response(JSON.stringify({
      error: true,
      title: "Missing Required Fields",
      message: "Please provide all required fields (orderId, org_id, auth_token)."
    }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
  // get_bank_credentials
  const bank_credentials = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/payment_method/bank/details`,
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
  console.log("Transaction result:", result);
  if (result.result !== "SUCCESS") {
    return new Response(JSON.stringify({
      error: true,
      title: "Transaction Failed",
      message: result.description || "Something went wrong."
    }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
  const paymentTxn = result.transaction?.find(t => t.transaction?.type === 'PAYMENT');
  const timezone = extractDateTimeWithOffset(paymentTxn?.timeOfLastUpdate, paymentTxn?.transaction?.timeZone || "+0000");
  const pythonApiPayload = {
    transaction_id: paymentTxn?.transaction?.id || 0,
    order_id: result.id,
    acquirer_name: "Bank Alfalah",
    transaction_type: paymentTxn?.transaction?.type || "PAYMENT",
    status: result.status,
    result: result.result,
    source: result.sourceOfFunds?.provided?.card?.brand || "UNKNOWN",
    receipt_number: paymentTxn?.transaction?.receipt || "N/A",
    amount: result.amount,
    booking_id: booking_id,
    date: timezone.date,
    time: timezone.time,
  };
  console.log("Python API Payload:", paymentTxn);
  // post_bank_data
  let post_data;
  try {
    post_data = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/payment_method/bank/save_transaction`,
      {
        "data": pythonApiPayload,
        "org_id": org_id,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth_token}`
        }
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
    console.error("Error saving transaction data:", err);
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

  console.log("Transaction saved successfully:", post_data);
  let booking_status;
  try{
    const bookingResponse = await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/bookings/${booking_id}/update-status`,
      {
        action: "booking_approved",
        payment_action: "paid",
        reason: "Bank Payment",
        org_id: org_id,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth_token}`
        }
      }
    );
    booking_status = bookingResponse.data;
  } catch (error) {
    console.error("Error updating booking status:", error);
  }
  console.log("Booking status updated:", booking_status);
  return new Response(JSON.stringify({
    success: true,
    result,
    pythonApiPayload
  }), { headers: { 'Content-Type': 'application/json' } });
}
