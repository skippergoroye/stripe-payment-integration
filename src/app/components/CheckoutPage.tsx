"use client";
import React, { useEffect, useState } from "react";
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { convertToSubcurrency } from "@/lib/convertToSubcurrency";

const CheckoutPage = ({ amount }: { amount: number }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [errorMessage, setErrorMessage] = useState<string>();
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ amount: convertToSubcurrency(amount) }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
  }, [amount]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    if (!stripe || !elements) {
      return;
    }

    const { error: submitError } = await elements.submit();

    if (submitError) {
      setErrorMessage(submitError.message);
      setLoading(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `http://localhost:3000/payment-success?amount=${amount}`,
      },
    });

    // if (error) {
    //   setErrorMessage(error.message);
    // } else {
    // }
    // setLoading(false);
  };

  if (!stripe || !clientSecret || !elements) {
    return <div className="flex items-center justify-center">
      Loading...
    </div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      {clientSecret && <PaymentElement />}

      {errorMessage && <div>{errorMessage}</div>}
      <button
        disabled={!stripe || loading}
        className="py-3 mt-6 rounded-lg bg-black w-36 cursor-pointer text-white font-semibold"
      >
        {!loading ? `Pay $${amount} ` : "Processing..."}
      </button>
    </form>
  );
};

export default CheckoutPage;
