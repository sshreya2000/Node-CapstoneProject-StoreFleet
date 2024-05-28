import ProductModel from "./product.schema.js";

export const addNewProductRepo = async (product) => {
  return await new ProductModel(product).save();
};

export const getAllProductsRepo = async (data, pageSize) => {
  let query = {};
  const pageNumber = parseInt(data.page) || 1;
  console.log(data);
  if (data.keyword) {
    query.$or = [
      { name: { $regex: data.keyword, $options: "i" } }, // Case-insensitive search
      { description: { $regex: data.keyword, $options: "i" } },
    ];
  }
  if (data.category) {
    query.category = data.category;
  }
  if (data.price) {
    if (data.price.gte && data.price.lte)
      query.price = { $gte: data.price.gte, $lte: data.price.lte };
    else if (data.price.gte) query.price = { $gte: data.price.gte };
    else query.price = { $lte: data.price.lte };
  }
  if (data.rating) {
    if (data.rating.gte && data.rating.lte)
      query.rating = { $gte: data.rating.gte, $lte: data.rating.lte };
    else if (data.rating.gte) query.rating = { $gte: data.rating.gte };
    else query.rating = { $lte: data.rating.lte };
  }
  const products = await ProductModel.find(query)
    .skip(pageSize * (pageNumber - 1))
    .limit(pageSize);
  return products;
};

export const updateProductRepo = async (_id, updatedData) => {
  return await ProductModel.findByIdAndUpdate(_id, updatedData, {
    new: true,
    runValidators: true,
    useFindAndModify: true,
  });
};

export const deleProductRepo = async (_id) => {
  return await ProductModel.findByIdAndDelete(_id);
};

export const getProductDetailsRepo = async (_id) => {
  return await ProductModel.findById(_id);
};

export const getTotalCountsOfProduct = async () => {
  return await ProductModel.countDocuments();
};

export const findProductRepo = async (productId) => {
  return await ProductModel.findById(productId);
};
