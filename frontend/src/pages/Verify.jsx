import React, { useContext, useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShopContext } from '../context/ShopContext';

const Verify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { backendUrl, token, setCartItems } = useContext(ShopContext);

  const [status, setStatus] = useState('Verifying your payment...');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const sessionId = searchParams.get('session_id');

        if (!sessionId) {
          setStatus('Payment session not found.');
          return;
        }

        const response = await axios.post(
          `${backendUrl}/api/order/verify-stripe`,
          { sessionId },
          { headers: { token } }
        );

        if (response.data.success) {
          setCartItems({});
          setStatus('Payment successful! Your order has been confirmed.');

          setTimeout(() => {
            navigate('/orders');
          }, 2500);
        } else {
          setStatus(response.data.message || 'Payment verification failed.');
        }
      } catch (error) {
        console.error(error);
        setStatus('Unable to verify payment. Please contact support.');
      }
    };

    if (token) {
      verifyPayment();
    }
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h2 className="text-xl font-semibold mb-4">
        Stripe Payment Verification
      </h2>

      <p>{status}</p>
    </div>
  );
};

export default Verify;