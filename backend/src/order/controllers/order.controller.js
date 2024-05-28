// Please don't change the pre-written code
// Import the necessary modules here

import {
  createNewOrderRepo,
  getAllPlacedOrdersRepo,
  getMyOrdersRepo,
  getSingleOrderRepo,
  updateOrderDetailsRepo,
} from "../model/order.repository.js";
import { ErrorHandler } from "../../../utils/errorHandler.js";

export const createNewOrder = async (req, res, next) => {
  // Write your code here for placing a new order
  try {
    const order = await createNewOrderRepo(req.body, req.user._id);
    if (order) {
      res.status(201).json({ success: true, order });
    } else {
      return next(new ErrorHandler(400, "some error occured!"));
    }
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler(400, error));
  }
};

export const getSingleOrder = async (req, res, next) => {
  try {
    const order = await getSingleOrderRepo(req.params.id);
    if (order) {
      res.status(201).json({ success: true, order });
    } else {
      return next(new ErrorHandler(400, "some error occured!"));
    }
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler(400, error));
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await getMyOrdersRepo(req.user._id);
    if (orders.length > 0) {
      res.status(201).json({ success: true, orders });
    } else {
      return next(new ErrorHandler(400, "some error occured!"));
    }
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler(400, error));
  }
};

export const getAllPlacedOrders = async (req, res, next) => {
  try {
    const orders = await getAllPlacedOrdersRepo();
    if (orders.length > 0) {
      res.status(201).json({ success: true, orders });
    } else {
      return next(new ErrorHandler(400, "some error occured!"));
    }
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler(400, error));
  }
};

export const updateOrderDetails = async (req, res, next) => {
  try {
    const order = await updateOrderDetailsRepo(
      req.params.id,
      req.user._id,
      req.body
    );
    console.log(order);
    if (order) {
      res.status(201).json({ success: true, order });
    } else {
      return next(new ErrorHandler(400, "No order found for the user"));
    }
  } catch (error) {
    console.log(error);
    return next(new ErrorHandler(400, error));
  }
};
