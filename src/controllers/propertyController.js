const Property = require('../models/Property');

const createProperty = async (req, res, next) => {
  try {
    const { title, description, price, location, status } = req.body;

    if (!title || !price || !location) {
      const error = new Error('Title, price, and location are required');
      error.status = 400;
      return next(error);
    }

    const property = new Property({
      title,
      description,
      price,
      location,
      status: status || 'available',
      createdBy: req.user.id
    });

    await property.save();

    res.status(201).json({
      message: 'Property created successfully',
      property
    });
  } catch (error) {
    next(error);
  }
};

const getProperties = async (req, res, next) => {
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

const getProperty = async (req, res, next) => {
  try {
    const { id } = req.params;

    const property = await Property.findOne({ _id: id, isDeleted: false }).populate(
      'createdBy',
      'name email role'
    );

    if (!property) {
      const error = new Error('Property not found');
      error.status = 404;
      return next(error);
    }

    res.json({ property });
  } catch (error) {
    next(error);
  }
};

const updateProperty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, price, location, status } = req.body;

    const property = await Property.findOne({ _id: id, isDeleted: false });

    if (!property) {
      const error = new Error('Property not found');
      error.status = 404;
      return next(error);
    }

    // Only agent who created the property can update it
    if (property.createdBy.toString() !== req.user.id) {
      const error = new Error('You can only update your own properties');
      error.status = 403;
      return next(error);
    }

    if (title) property.title = title;
    if (description) property.description = description;
    if (price) property.price = price;
    if (location) property.location = location;
    if (status) property.status = status;

    await property.save();

    res.json({
      message: 'Property updated successfully',
      property
    });
  } catch (error) {
    next(error);
  }
};

const deleteProperty = async (req, res, next) => {
  try {
    const { id } = req.params;

    const property = await Property.findOne({ _id: id, isDeleted: false });

    if (!property) {
      const error = new Error('Property not found');
      error.status = 404;
      return next(error);
    }

    // Only agent who created the property can soft delete it
    if (property.createdBy.toString() !== req.user.id) {
      const error = new Error('You can only delete your own properties');
      error.status = 403;
      return next(error);
    }

    property.isDeleted = true;
    await property.save();

    res.json({
      message: 'Property deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const deletePropertyAsAdmin = async (req, res, next) => {
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
      message: 'Property deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProperty,
  getProperties,
  getProperty,
  updateProperty,
  deleteProperty,
  deletePropertyAsAdmin
};
