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
const AdminJS = require('adminjs');
const AdminJSExpress = require('@adminjs/express');
const AdminJSMongoose = require("@adminjs/mongoose");

AdminBro.registerAdapter(AdminBroMongoose);

AdminBro.registerAdapter(AdminBroMongoose);
// AdminJS.registerAdapter({
//   Resource: AdminJSMongoose.Resource,
//   Database: AdminJSMongoose.Database,
// })
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
      resource: User,
    },
    {
      resource: Category,
      options: {
        listProperties: ['title', 'slug'],
        filterProperties: ['title', 'slug'],
        editProperties: ['title', 'slug'],
        showProperties: ['title', 'slug'],
        properties: {
          title: { isTitle: true },
        },
      },
    },
    {
      resource: Product,
      options: {
        sort: {
          sortBy: 'createdAt',
          direction: 'desc',
        },
        listProperties: ['productCode', 'title', 'category', 'createdAt'],
        filterProperties: ['productCode', 'title', 'category', 'prices', 'createdAt'],
        editProperties: ['productCode', 'title', 'category', 'imagePaths', 'colors', 'sizes', 'prices', 'description', 'available', 'createdAt'],
        showProperties: ['productCode', 'title', 'category', 'imagePaths', 'colors', 'sizes', 'prices', 'description', 'available', 'createdAt'],
        properties: {
          description: { type: "richtext" },
          title: { isTitle: true, },
          createdAt: { type: "datetime" },
        },
      },
    },
    {
      resource: Order,
      options: {
        sort: {
          sortBy: 'createdAt',
          direction: 'desc',
        },
        listProperties: ['_id', 'name', 'phoneNumber', 'address', 'cart.totalCost', 'createdAt'],
        filterProperties: ['_id', 'name', 'phoneNumber', 'address', 'cart.totalCost', 'createdAt'],
        //editProperties: [],
        showProperties: ['_id', 'name', 'phoneNumber', 'address', 'cart.items', 'cart.totalQty', 'cart.totalCost', 'paymentMethod', 'note', 'createdAt'],
        properties: {
          createdAt: { type: "datetime" },
        }
      }
    },
    {
      resource: Contact,
      options: {
        sort: {
          sortBy: 'createdAt',
          direction: 'desc',
        },
        listProperties: ['name', 'phone', 'email', 'subject', 'createdAt'],
        filterProperties: ['name', 'phone', 'email', 'subject', 'createdAt'],
        editProperties: [],
        showProperties: ['name', 'phone', 'email', 'subject', 'message', 'createdAt'],
        properties: {
          createdAt: { type: "datetime" },
          message: { type: "richtext" }
        }
      },
    },
    {
      resource: Blog,
      options: {
        sort: {
          sortBy: 'updatedAt',
          direction: 'desc',
        },
        listProperties: ['title', 'quickDescription', 'createdAt'],
        filterProperties: ['title', 'quickDescription', 'createdAt'],
        editProperties: ['title', 'quickDescription', 'description', 'slug', 'createdAt'],
        showProperties: ['title', 'quickDescription', 'description', 'slug', 'createdAt'],
        properties: {
          createdAt: { type: "datetime" },
          title: { isTitle: true },
          description: { type: "richtext" }
        }
      },
    },
  ],
  locale: {
    translations: {
      labels: {
        loginWelcome: "Admin Panel Login",
        Product: 'Sản phẩm',
        Blog: 'Tin tức',
        Order: 'Đơn hàng',
        Category: 'Danh mục sản phẩm',
        Contact: 'Liên hệ',
        User: 'Tài khoản'
      },
      resources: {
        Blog: {
          properties: {
            title: 'Tiêu đề',
            quickDescription: 'Mô tả ngắn',
            description: 'Mô tả chi tiết',
            createdAt: 'Thời gian tạo'
          }
        },
        Product: {
          properties: {
            sizes: 'Kích thước',
            description: 'Mô tả',
            title: 'Tên sản phẩm',
            prices: 'Giá',
            colors: 'Màu',
            imagePaths: 'Link hình ảnh',
            productCode: 'Mã sản phẩm',
            createdAt: 'Thời gian tạo',
            category: 'Danh mục',
            available: 'Có sẵn'
          }
        },
        Category: {
          properties: {
            title: 'Tên danh mục'
          }
        },
        Order: {
          properties: {
            name: 'Tên khách hàng',
            _id: 'Mã đơn hàng',
            'cart.totalQty': 'Tổng số lượng',
            'cart.totalCost': 'Tổng tiền',
            'cart.items': 'Chi tiết',
            'cart.items.productId': 'Sản phẩm',
            'cart.items.qty': 'Số lượng',
            'cart.items.price': 'Thành tiền',
            'cart.items.title': 'Tên sản phẩm',
            'cart.items.productCode': 'Mã sản phẩm',
            phoneNumber: 'Số điện thoại',
            address: 'Địa chỉ',
            note: 'Ghi chú',
            paymentMethod: 'Phương thức thanh toán',
            createdAt: 'Thời gian',
          }
        },
        Contact: {
          properties: {
            name: 'Tên khách hàng',
            phone: 'Số điện thoại',
            subject: 'Chủ đề',
            message: 'Lời nhắn',
            createdAt: 'Thời gian'
          }
        }
      }
    },
    messages: {
      loginWelcome:
        "Please enter your credentials to log in and manage your website contents",
    },
  },
},
);

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
