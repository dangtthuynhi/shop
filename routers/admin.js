const AdminBro = require("admin-bro");
const AdminBroExpress = require("@admin-bro/express");
const AdminBroMongoose = require("@admin-bro/mongoose");
const mongoose = require("mongoose");
const Product = require("../models/product");
const User = require("../models/user");
const Order = require("../models/order");
const Category = require("../models/category");
const Banner = require("../models/banner");
const Blog = require("../models/blog");
const Contact = require("../models/contact");

AdminBro.registerAdapter(AdminBroMongoose);

const express = require("express");
const app = express();

const adminBro = new AdminBro({
  databases: [mongoose],
  rootPath: "/admin",
  branding: {
    companyName: "Thế giới chậu",
    softwareBrothers: false,
  },
  resources: [
    {
      resource: Product,
      options: {
        // parent: {
        //   name: "Admin Content",
        //   icon: "InventoryManagement",
        // },
        properties: {
          size:{
            isVisible: { list: false, filter: true, show: true, edit: true },
          },
          description: {
            type: "richtext",
            isVisible: { list: false, filter: true, show: true, edit: true },
          },
          _id: {
            isVisible: { list: false, filter: true, show: true, edit: false },
          },
          title: {
            isTitle: true,
          },
          price: {
            type: "number",
          },
          imagePaths: {
            isVisible: { list: false, filter: false, show: true, edit: true },
          },
        },
      },
    },
    {
      resource: User,
      options: {
        // parent: {
        //   name: "User Content",
        //   icon: "User",
        // },
        properties: {
          _id: {
            isVisible: { list: false, filter: true, show: true, edit: false },
          },
          username: {
            isTitle: true,
          },
        },
      },
    },
    // {
    //   resource: Order,
    //   options: {
    //     // parent: {
    //     //   name: "User Content",
    //     //   icon: "User",
    //     // },
    //     properties: {
    //       _id: {
    //         isVisible: { list: false, filter: true, show: false, edit: false },
    //       },
    //       orderId:{
    //         isVisible: { list: false, filter: true, show: true, edit: false },
    //       },
    //       name:{
    //         isVisible: { list: false, filter: true, show: true, edit: false },
    //       },
    //       phoneNumber:{
    //         isVisible: { list: false, filter: true, show: true, edit: false },
    //       },
    //       address: {
    //         isVisible: { list: false, filter: true, show: true, edit: false },
    //       },
    //       paymentMethod:{
    //         isVisible: { list: false, filter: true, show: true, edit: false },
    //       },
    //       note:{
    //         isVisible: { list: false, filter: true, show: true, edit: false },
    //       },
    //       createdAt: {
    //         isVisible: { list: true, filter: true, show: true, edit: false },
    //       },
    //       cart: {
    //         isVisible: { list: false, filter: false, show: true, edit: false },
    //         components: {
    //           show: AdminBro.bundle("../components/admin-order-component.jsx"),
    //         },
    //       },
    //       "cart.items": {
    //         isVisible: {
    //           list: false,
    //           filter: false,
    //           show: false,
    //           edit: false,
    //         },
    //       },
    //       "cart.totalQty": {
    //         isVisible: {
    //           list: false,
    //           filter: false,
    //           show: false,
    //           edit: false,
    //         },
    //       },
    //       "cart.totalCost": {
    //         isVisible: {
    //           list: false,
    //           filter: false,
    //           show: false,
    //           edit: false,
    //         },
    //       },
    //     },
    //   },
    // },
    {
      resource: Category,
      options: {
        // parent: {
        //   name: "Admin Content",
        //   icon: "User",
        // },
        properties: {
          _id: {
            isVisible: { list: false, filter: true, show: true, edit: false },
          },
          slug: {
            isVisible: { list: false, filter: false, show: true, edit: false },
          },
          title: {
            isTitle: true,
          },
        },
      },
    },
    {
      resource: Blog,
      options: {
        // parent: {
        //   name: "Admin Content",
        //   icon: "User",
        // },
        properties: {
          _id: {
            isVisible: { list: false, filter: true, show: true, edit: false },
          },
          title: {
            isTitle: true,
            isVisible: { list: true, filter: true, show: true, edit: true },
          },
          quickDescription: {
            isVisible: { list: true, filter: true, show: true, edit: true },
          },
          description: {
            type: "richtext",
            isVisible: { list: false, filter: true, show: true, edit: true },
          },
          createdAt: {
            isVisible: { list: true, filter: true, show: true, edit: false },
          },
          slug: {
            isVisible: { list: false, filter: false, show: false, edit: false },
          },
        },
      },
    },
  ],
  locale: {
    translations: {
      labels: {
        loginWelcome: "Admin Panel Login",
      },
      messages: {
        loginWelcome:
          "Please enter your credentials to log in and manage your website contents",
      },
    },
  },
});

const ADMIN = {
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
};

const router = AdminBroExpress.buildAuthenticatedRouter(adminBro, {
  authenticate: async (email, password) => {
    if (ADMIN.password === password && ADMIN.email === email) {
      return ADMIN;
    }
    return null;
  },
  cookieName: process.env.ADMIN_COOKIE_NAME,
  cookiePassword: process.env.ADMIN_COOKIE_PASSWORD,
});

module.exports = router;
