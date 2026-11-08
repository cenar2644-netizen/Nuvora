import orderModel from "../models/orderModel.js"
import userModel from "../models/userModel.js"
import Stripe from 'stripe';
import productModel from "../models/productModel.js";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const placeOrder = async (req, res) => {
    try {
        const { items, amount, address } = req.body;
        const userId = req.userId;

        const orderData = {
            userId,
            items,
            amount,
            address,
            paymentMethod: "COD",
            payment: false,
            date: Date.now()
        }

        const newOrder = new orderModel(orderData);
        await newOrder.save();

        await userModel.findByIdAndUpdate(userId, {
            cartData: {}
        });

        res.json({
            success: true,
            message: "Order Placed"
        });
    }
    catch (error) {
        console.log(error);

        res.json({
            success: false,
            message: error.message
        });
    }
}

// Placing orders using stripe method
const placeOrderStripe = async (req, res) => {
  try {
    const { items, address } = req.body;
    const userId = req.userId;
    if (!items || items.length === 0 || !address) {
      return res.status(400).json({
        success: false,
        message: 'Order items and delivery address are required.'
      });
    }

    // Build Stripe line items using prices from the database,
    // not prices supplied by the frontend.
    const stripeItems = [];
    const verifiedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await productModel.findById(item._id);

if (!product) {
  return res.status(400).json({
    success: false,
    message: `Product not found: ${item._id}`
  });
}

if (!product.sizes.includes(item.size)) {
  return res.status(400).json({
    success: false,
    message: `Invalid size selected for ${product.name}`
  });
}

      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product quantity.'
        });
      }

      const price = Number(product.price);

      if (!Number.isFinite(price) || price < 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product price.'
        });
      }

      subtotal += price * quantity;

      verifiedItems.push({
        ...item,
        price,
        name: product.name,
        quantity
      });

      stripeItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            ...(item.size ? {
              description: `Size: ${item.size}`
            } : {})
          },
          unit_amount: Math.round(price * 100)
        },
        quantity
      });
    }

    // Replace 10 with your server-side delivery fee in USD.
    const deliveryFee = 10;
    const amount = subtotal + deliveryFee;

    stripeItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Delivery Fee'
        },
        unit_amount: Math.round(deliveryFee * 100)
      },
      quantity: 1
    });

    // Save an unpaid order before redirecting to Stripe.
    const newOrder = new orderModel({
      userId,
      items: verifiedItems,
      amount,
      address,
      paymentMethod: 'Stripe',
      payment: false,
      date: new Date()
    });

    await newOrder.save();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: stripeItems,
      mode: 'payment',
      success_url:
        `${process.env.FRONTEND_URL}/verify?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:
        `${process.env.FRONTEND_URL}/place-order?cancelled=true`,
      metadata: {
        orderId: newOrder._id.toString(),
        userId: userId.toString()
      }
    });

    res.json({
      success: true,
      session_url: session.url
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Placing orders using Razorpay method
const placeOrderRazorpay = async (req, res) => {

}

// All orders data for admin panel
const allOrders = async (req, res) => {
    try{
        const orders = await orderModel.find({})
        res.json({success: true, orders})
    }
    catch(error){
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

// User order data for frontend
const userOrders = async (req, res) => {
    try{
        const userId = req.userId;
const orders = await orderModel.find({ userId });
        res.json({success: true, orders})
    }
    catch (error){
        console.log(error)
        res.json({success: false, message: error.message})
    }
}

// Update order status
const updateStatus = async (req, res) => {
    try{
        const {orderId, status} = req.body
        await orderModel.findByIdAndUpdate(orderId, {status})
        res.json({success: true, message: "Order Status Updated"})
    }
    catch (error){
        console.log(error)
        res.json({success: false, message: error.message})
    }
}
const verifyStripe = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.userId;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (
      session.payment_status !== 'paid' ||
      session.metadata.userId !== userId.toString()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Payment could not be verified'
      });
    }

    const orderId = session.metadata.orderId;

    const order = await orderModel.findOne({
      _id: orderId,
      userId
    });

    if (!order) {
  return res.status(404).json({
    success: false,
    message: 'Order not found'
  });
}

if (
  session.metadata.orderId !== order._id.toString() ||
  session.currency !== 'usd' ||
  session.amount_total !== Math.round(order.amount * 100)
) {
  return res.status(400).json({
    success: false,
    message: 'Payment details do not match the order'
  });
}

    if (!order.payment) {
      order.payment = true;
      await order.save();

      await userModel.findByIdAndUpdate(userId, {
        cartData: {}
      });
    }

    res.json({
      success: true,
      message: 'Payment verified successfully'
    });

  } catch (error) {
    console.error('Stripe verification error:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
export {placeOrder, placeOrderRazorpay, placeOrderStripe, allOrders, updateStatus, userOrders, verifyStripe}