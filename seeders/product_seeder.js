const mongoose = require('mongoose')
const faker = require('faker')
const Product = require("../models/product");
const Category = require("../models/category");

mongoose.connect('mongodb://localhost:27017/nhi_test1', {
    useNewUrlParser: true,
});

for (let i = 0; i < 4; i++) {
    const category = new Category({
        title: faker.name.title()
    })

    category.save()
        .then(categoryRef => {
            console.log(`${categoryRef.title} saved successfully`);
            for (let i = 0; i < 8; i++) {
                const product = new Product({
                    category: category._id,
                    productCode: faker.random.alpha(10),
                    title: faker.commerce.productName(),
                    imagePaths: [faker.image.business(), faker.image.business()],
                    sizes: [faker.random.alpha(10), faker.random.alpha(10)],
                    description: faker.commerce.productDescription(),
                    colors: [faker.commerce.productName(),faker.commerce.productName()],
                    prices: [faker.commerce.price()*10, faker.commerce.price()*50],
                    available: true,
                })

                product.save()
                    .then(productRef => {
                        console.log(`${categoryRef.title} - ${productRef.title}`)
                    })
            }
        })
}