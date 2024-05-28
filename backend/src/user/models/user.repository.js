import UserModel from "./user.schema.js";
import mongoose from "mongoose";
import { ObjectId } from "mongoose";
import { ErrorHandler } from "../../../utils/errorHandler.js";

export const createNewUserRepo = async (user) => {
  return await new UserModel(user).save();
};

export const findUserRepo = async (factor, withPassword = false) => {
  if (withPassword) return await UserModel.findOne(factor).select("+password");
  else return await UserModel.findOne(factor);
};

export const findUserForPasswordResetRepo = async (hashtoken) => {
  return await UserModel.findOne({
    resetPasswordToken: hashtoken,
    resetPasswordExpire: { $gt: Date.now() },
  });
};

export const updateUserProfileRepo = async (_id, data) => {
  return await UserModel.findOneAndUpdate(_id, data, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
};

export const getAllUsersRepo = async () => {
  return UserModel.find({});
};

export const deleteUserRepo = async (_id) => {
  return await UserModel.findByIdAndDelete(_id);
};

export const updateUserRoleAndProfileRepo = async (_id, data) => {
  // Write your code here for updating the roles of other users by admin

  const user = await UserModel.findById(_id);
  if (!user) throw new ErrorHandler(400, "user not found!");
  if (data.name) user.name = data.name;
  if (data.email) user.email = data.email;
  if (data.role) user.role = data.role;
  return await user.save();
};
