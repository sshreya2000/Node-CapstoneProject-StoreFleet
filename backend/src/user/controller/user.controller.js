// Please don't change the pre-written code
// Import the necessary modules here

import { sendPasswordResetEmail } from "../../../utils/emails/passwordReset.js";
import { sendWelcomeEmail } from "../../../utils/emails/welcomeMail.js";
import { ErrorHandler } from "../../../utils/errorHandler.js";
import { sendToken } from "../../../utils/sendToken.js";
import {
  createNewUserRepo,
  deleteUserRepo,
  findUserForPasswordResetRepo,
  findUserRepo,
  getAllUsersRepo,
  updateUserProfileRepo,
  updateUserRoleAndProfileRepo,
} from "../models/user.repository.js";
import crypto from "crypto";

export const createNewUser = async (req, res, next) => {
  // const { name, email, password } = req.body;
  try {
    const newUser = await createNewUserRepo(req.body);

    // Implement sendWelcomeEmail function to send welcome message
    await sendWelcomeEmail(newUser);
    await sendToken(newUser, res, 200);
  } catch (err) {
    console.log(err);
    //  handle error for duplicate email
    if (err.keyValue.email)
      return next(new ErrorHandler(400, "email already registered"));
  }
};

export const userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ErrorHandler(400, "please enter email/password"));
    }
    const user = await findUserRepo({ email }, true);
    if (!user) {
      return next(
        new ErrorHandler(401, "user not found! register yourself now!!")
      );
    }
    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      return next(new ErrorHandler(401, "Invalid email or passsword!"));
    }
    await sendToken(user, res, 200);
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const logoutUser = async (req, res, next) => {
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({ success: true, msg: "logout successful" });
};

export const forgetPassword = async (req, res, next) => {
  // Implement feature for forget password
  try {
    const { email } = req.body;
    if (!email) {
      return next(new ErrorHandler(400, "please enter email"));
    }
    const user = await findUserRepo({ email }, false);
    if (!user) {
      return next(
        new ErrorHandler(401, "user not found! register yourself now!!")
      );
    }
    const token = await user.getResetPasswordToken();
    console.log(token);
    await user.save();
    await sendPasswordResetEmail(user, token);
    res
      .status(200)
      .json({ success: true, msg: "reset token is sent to email" });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const resetUserPassword = async (req, res, next) => {
  // Implement feature for reset password
  try {
    const token = req.params.token;
    const { password, confirmPassword } = req.body;
    if (!token || !password || !confirmPassword) {
      return next(
        new ErrorHandler(400, "please enter email/password/confirmPassword")
      );
    }
    if (password !== confirmPassword) {
      return next(
        new ErrorHandler(400, "Pawword and confirmPassword should be same")
      );
    }
    const hashToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await findUserForPasswordResetRepo(hashToken);
    if (!user) {
      return next(
        new ErrorHandler(401, "user token is expired or user not found!")
      );
    }
    const passwordMatch = await user.comparePassword(password);
    if (passwordMatch) {
      return next(new ErrorHandler(401, "please enter the new password"));
    }
    user.password = password;
    await user.save();
    res
      .status(200)
      .cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
      })
      .json({ success: true, msg: "password is reset" });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const getUserDetails = async (req, res, next) => {
  try {
    const userDetails = await findUserRepo({ _id: req.user._id });
    res.status(200).json({ success: true, userDetails });
  } catch (error) {
    return next(new ErrorHandler(500, error));
  }
};

export const updatePassword = async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  try {
    if (!currentPassword) {
      return next(new ErrorHandler(401, "pls enter current password"));
    }

    const user = await findUserRepo({ _id: req.user._id }, true);
    const passwordMatch = await user.comparePassword(currentPassword);
    if (!passwordMatch) {
      return next(new ErrorHandler(401, "Incorrect current password!"));
    }

    if (!newPassword || newPassword !== confirmPassword) {
      return next(
        new ErrorHandler(401, "mismatch new password and confirm password!")
      );
    }

    user.password = newPassword;
    await user.save();
    await sendToken(user, res, 200);
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const updateUserProfile = async (req, res, next) => {
  const { name, email } = req.body;
  try {
    const updatedUserDetails = await updateUserProfileRepo(req.user._id, {
      name,
      email,
    });
    res.status(201).json({ success: true, updatedUserDetails });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

// admin controllers
export const getAllUsers = async (req, res, next) => {
  try {
    const allUsers = await getAllUsersRepo();
    res.status(200).json({ success: true, allUsers });
  } catch (error) {
    return next(new ErrorHandler(500, error));
  }
};

export const getUserDetailsForAdmin = async (req, res, next) => {
  try {
    const userDetails = await findUserRepo({ _id: req.params.id });
    if (!userDetails) {
      return res
        .status(400)
        .json({ success: false, msg: "no user found with provided id" });
    }
    res.status(200).json({ success: true, userDetails });
  } catch (error) {
    return next(new ErrorHandler(500, error));
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const deletedUser = await deleteUserRepo(req.params.id);
    if (!deletedUser) {
      return res
        .status(400)
        .json({ success: false, msg: "no user found with provided id" });
    }

    res
      .status(200)
      .json({ success: true, msg: "user deleted successfully", deletedUser });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

export const updateUserProfileAndRole = async (req, res, next) => {
  // Write your code here for updating the roles of other users by admin
  try {
    const userDetails = await updateUserRoleAndProfileRepo(
      { _id: req.params.id },
      req.body
    );
    if (!userDetails) {
      return res
        .status(400)
        .json({ success: false, msg: "no user found with provided id" });
    }

    res.status(200).json({ success: true, userDetails });
  } catch (error) {
    return next(new ErrorHandler(500, error));
  }
};
