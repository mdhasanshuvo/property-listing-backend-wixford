const Property = require('../models/Property');

const adminDeleteProperty = async (req, res, next) => {
  try {
    const { id } = req.params;

    const property = await Property.findOne({ _id: id, isDeleted: false });

    if (!property) {
      const error = new Error('Property not found');
      error.status = 404;
      return next(error);
    }

    property.isDeleted = true;
    await property.save();

    res.json({
      message: 'Property deleted successfully by admin'
    });
  } catch (error) {
    next(error);
  }
};

const getAllProperties = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, minPrice, maxPrice, search } = req.query;

    const query = { isDeleted: false };

    if (status) {
      query.status = status;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const properties = await Property.find(query)
      .populate('createdBy', 'name email role')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Property.countDocuments(query);

    res.json({
      properties,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  adminDeleteProperty,
  getAllProperties
};
