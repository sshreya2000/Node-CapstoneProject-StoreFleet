import mongoose from "mongoose";
import OrderModel from "./order.schema.js";
import { ErrorHandler } from "../../../utils/errorHandler.js";
import ProductModel from "../../product/model/product.schema.js";

export const createNewOrderRepo = async (data, id) => {
  // Write your code here for placing a new order
  try {
    for (const item of data.orderedItems) {
      const product = await ProductModel.findById(item.product);
      if (!product) {
        throw new ErrorHandler(400, `product ${item.product} not found`);
      }
      if (product.stock < item.quantity) {
        throw new ErrorHandler(
          400,
          `please enter quantity within stock of ${product.stock} for ${item.product}`
        );
      }
    }
    const order = new OrderModel(data);
    order.user = id;
    order.paidAt = Date.now();
    return await order.save();
  } catch (err) {
    throw new ErrorHandler(400, err);
  }
};

export const getSingleOrderRepo = async (id) => {
  return await OrderModel.findById(id);
};

export const getAllPlacedOrdersRepo = async () => {
  return await OrderModel.find({});
};

export const getMyOrdersRepo = async (userId) => {
  return await OrderModel.find({ user: userId });
};

export const updateOrderDetailsRepo = async (orderid, userId, data) => {
  const order = await OrderModel.findOne({
    _id: new mongoose.Types.ObjectId(orderid),
    user: userId,
  });
  if (order.length <= 0)
    throw new ErrorHandler(400, "No order found for the user");
  order.orderStatus = data.orderStatus;
  order.orderedItems.forEach(async (item) => {
    const product = await ProductModel.findById(item.product);
    if (!product) throw new ErrorHandler(400, "product not found");
    product.stock -= item.quantity;
    await product.save();
  });
  return await order.save();
};
