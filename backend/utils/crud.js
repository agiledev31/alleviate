const search = async (req, Model) => {
  let filterQuery = req.body.filters ?? {};
  if (req.user.role !== "ngo-beneficiary") {
    for (const condition of req.conditions) {
      for (const key in condition) {
        if (condition[key] === "own_id") condition[key] = req.user._id;
      }
      filterQuery = { ...filterQuery, ...condition };
    }
  }
  console.log(filterQuery);

  const sortQuery = req.body.sort ?? {};

  const page = parseInt(req.query.page) || 1; // if `page` is not specified, default to 1
  const limit = parseInt(req.query.limit) || 10; // if `limit` is not specified, default to 10
  const skip = (page - 1) * limit;

  const firstQuery = req.body.text
    ? {
        $text: { $search: req.body.text },
        ...filterQuery,
      }
    : filterQuery;

  const secondQuery = req.body.text
    ? { score: { $meta: "textScore" } }
    : undefined;

  const items = await Model.find(firstQuery, secondQuery)
    .sort(sortQuery)
    .limit(limit)
    .skip(skip);

  const total = await Model.countDocuments(firstQuery, secondQuery);

  return { items, page, limit, total };
};
const createItem = async (req, Model, additionalData) => {
  if (req.body.bulkItems) {
    const items = await Promise.all(
      req.body.bulkItems.map(async (bodyItem) => {
        const item = new Model({
          ...bodyItem,
          ...additionalData,
        });
        await item.save();
        return item;
      })
    );
    return items;
  } else {
    const item = new Model({
      ...req.body,
      ...additionalData,
    });
    await item.save();
    return item;
  }
};

const deleteItem = async (req, Model) => {
  let query = { _id: req.query.id };
  for (const condition of req.conditions) {
    for (const key in condition) {
      if (condition[key] === "own_id") condition[key] = req.user._id;
    }
    query = { ...query, ...condition };
  }
  const item = await Model.findOneAndDelete(query);
  return item;
};

const deleteBulk = async (req, Model, filters) => {
  let query = { ...filters };
  const items = await Model.find(query);
  await Promise.all(
    items.map(async (item) => {
      await Model.findByIdAndDelete(item._id);
    })
  );
  return items;
};
const updateItem = async (req, Model) => {
  let query = { _id: req.query.id };
  if (req.user.role !== "ngo-beneficiary") {
    for (const condition of req.conditions) {
      for (const key in condition) {
        if (condition[key] === "own_id") condition[key] = req.user._id;
      }
      query = { ...query, ...condition };
    }
  }
  const item = await Model.findOneAndUpdate(query, req.body);
  return item;
};

module.exports = {
  search,
  createItem,
  deleteItem,
  updateItem,
  deleteBulk,
};
