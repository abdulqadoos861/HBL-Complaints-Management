const productModel = require('../models/product')
const inputFieldModel = require('../models/inputfields')
const slaModel = require('../models/sla')


exports.addProduct =async function  (req,res){
    const {product , categories, inputFields , sla} = req.body;
    const created_product = await productModel.create({
        slug:product.slug,
        label : product.label ,
        is_active : product.is_active,
        categories : categories
    })
    if (!created_product){
        return res.status(503).json({message :"An error is occured while creating product."})
    }
    else{
        const fieldsToInsert = inputFields.map(field => ({
            productId: created_product._id,
            label: field.label,
            name: field.name,
            type: field.type,
            required: field.required,
            placeholder: field.placeholder,
            order: field.order,
            categoryName: field.categoryName
        }));

        const created_fields = await inputFieldModel.insertMany(fieldsToInsert);
        if (!created_fields){
        return res.status(503).json({message :"An error is occured while creating product."})
        }
        else{
            const sla_created = await slaModel.create({
                productId : created_product._id,
                steps:sla
            })
            if (!sla_created){
                return res.status(503).json({message :"An error is occured while creating product."})
            }
            else{
                console.log(`product : ${created_product}`)
                console.log(`input fileds : ${created_fields}`)
                console.log(`product : ${created_product}`)
            }
        }
    }
    res.status(201).json({
   message: "Product created successfully"
})
} ;


exports.getproduct = async function (req, res) {
  try {
    const products = await productModel.find();
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch products",
      error: error.message
    });
  }
};

exports.getcategory = async function (req, res) {
  try {
    const product_id = req.params.id;
    const product = await productModel.findOne({ _id: product_id });
    if (!product) {
      return res.status(404).json({
        message: "No product found"
      });
    }
    return res.status(200).json(product.categories);
  } catch (err) {
    return res.status(500).json({
      message: "No category found",
      error: err.message
    });
  }
};

exports.getinputFields = async function(req,res){
    try{
        const product_id = req.params.id;
        const fields = await inputFieldModel.find({ productId: product_id })

        // fields will be [] when nothing is found
        if (!fields || fields.length === 0){
            return res.status(200).json([])
        }
        return res.status(200).json(fields)

    }
    catch(err){
        return res.status(500).json({
        message: "No category found",
        error: err.message
        });
    }
}

exports.toggleProductStatus = async function(req, res) {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    
    const product = await productModel.findByIdAndUpdate(id, { is_active }, { new: true });
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    return res.status(200).json({
      success: true,
      message: `Product ${is_active ? 'activated' : 'deactivated'} successfully`,
      product
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to toggle product status",
      error: error.message
    });
  }
};