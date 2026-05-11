# TODO - HBL Complaints Management

## Step 1: Fix backend inputFields lookup
- [x] Update `controller/productController.js` to query `inputFieldModel` by `productId` (schema field)


## Step 2: Implement fully working complaint UI flow
- [x] Update `views/complaint.ejs` to:

  - [x] Load products into Product Type dropdown from `GET /api/product/all`

  - [x] On Product selection, load categories from `GET /api/category/:id`

  - [x] On Product selection (or Category selection), load related input fields from `GET /api/inputFields/:id`

  - [x] Render dynamic inputs

  - [x] On submit, POST to `POST /complaint/create` with:

    - [ ] basic complaint fields
    - [ ] `productType`, `category`
    - [ ] `details` built from dynamic inputs

## Step 3: Quick manual verification
- [ ] Start server, create a product using `views/addproduct.ejs`
- [ ] Ensure input fields appear dynamically on complaint page
- [ ] Ensure complaint POST succeeds and stores `details`

