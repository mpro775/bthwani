// src/swagger.ts

import swaggerAutogen from "swagger-autogen";
import path from "path";
import fs from "fs";

// حدد مسار التخريج لملف swagger-output.json
const outputFile = path.resolve(__dirname, "docs", "swagger-output.json");

// دالة لجمع جميع ملفات الراوتس تلقائيًا
function getRoutesRecursively(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      getRoutesRecursively(fullPath, fileList);
    } else if (stat.isFile() && fullPath.endsWith(".ts")) {
      fileList.push(fullPath);
    }
  });
  return fileList;
}

const routesDir = path.resolve(__dirname, "routes");
const endpointsFiles = getRoutesRecursively(routesDir);

const doc = {
  openapi: "3.0.0",

  info: {
    title: "API مشروع بثواني",
    description: "وثائق RESTful API لمشروع بثواني مُولَّدة أوتوماتيكيًا بواسطة swagger-autogen",
    version: "1.0.0",
  },

  // هنا نعرّف السيرفر مع بادئة /api/v1
  servers: [
    {
      url: "http://localhost:3000/api/v1",
      description: "سيرفر التطوير المحلي",
    },
    // يمكنك إضافة سيرفر الإنتاج، مثلاً:
    // {
    //   url: "https://api.bthwani.com/api/v1",
    //   description: "سيرفر الإنتاج"
    // }
  ],

  tags: [
    { name: "Auth", description: "المصادقة وإدارة المستخدمين" },
    { name: "Users", description: "إدارة المستخدمين وملفاتهم الشخصية" },
    { name: "Haraj", description: "منتجات Haraj وإدارتها" },
    { name: "Media", description: "إدارة الوسائط والتحميلات" },
    { name: "LostFound", description: "قسم المفقودات/الموجودات" },
    { name: "TopUp", description: "شحن الرصيد والمحفظة" },
    { name: "AdminProducts", description: "إدارة منتجات الأدمن" },
    { name: "Categories", description: "إدارة فئات Haraj" },
    { name: "Sliders", description: "إدارة شرائح العرض (Sliders)" },
    { name: "JobFreelancers", description: "إدارة المستقلين (Freelancers)" },
    { name: "JobBooking", description: "نظام حجز الخدمات" },
    { name: "JobReview", description: "إدارة تقييمات المستقلين والطلبات" },
    { name: "Delivery", description: "سوق التوصيل وإدارة الطلبات" },
    { name: "VendorOrders", description: "طلبات تطبيق التاجر" },
    { name: "VendorProducts", description: "منتجات تطبيق التاجر" },
    { name: "UserAvatar", description: "إدارة صُوَر المستخدمين" },
    { name: "AdminWithdrawals", description: "سحب الأموال من قِبَل الأدمن" },
    { name: "DriverWithdrawals", description: "طلبات سحب سائقي التوصيل" },
    { name: "Favorites", description: "إدارة قائمة المفضلات" },
    { name: "Opportunities", description: "فرص العمل والتقديم عليها" },
    { name: "Absher", description: "نظام أبشر المهني" },
    { name: "Common", description: "الكيانات العامة (OTP، Favorites)" },
  ],

  // دمج جميع محتويات components (securitySchemes + schemas) في مفتاح واحد
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "apiKey",
        name: "Authorization",
        in: "header",
        description: "JWT Authorization header. مثال: Bearer <token>",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          _id: { type: "string", example: "64a0f2c7ae3c8b39f9d4d3e1" },
          name: { type: "string", example: "Ahmed Ali" },
          email: { type: "string", format: "email", example: "ahmed@example.com" },
          role: { type: "string", example: "user" },
          firebaseUID: { type: "string", example: "firebase123" },
        },
      },
      UserRegisterInput: {
        type: "object",
        properties: {
          name: { type: "string", example: "Ahmed Ali" },
          email: { type: "string", format: "email", example: "ahmed@example.com" },
          password: { type: "string", example: "StrongPassword123" },
        },
      },
      HarajProductInput: {
        type: "object",
        properties: {
          title: { type: "string", example: "هاتف آيفون X" },
          description: { type: "string", example: "جديد بدون استخدام" },
          price: { type: "integer", example: 3000 },
          categoryId: { type: "string", example: "cat123" },
        },
      },
      HarajProduct: {
        type: "object",
        properties: {
          productId: { type: "string", example: "prod456" },
          title: { type: "string", example: "هاتف آيفون X" },
          description: { type: "string", example: "جديد بدون استخدام" },
          price: { type: "integer", example: 3000 },
          categoryId: { type: "string", example: "cat123" },
          createdBy: { type: "string", example: "64a0f2c7ae3c8b39f9d4d3e1" },
        },
      },
      MediaItem: {
        type: "object",
        properties: {
          mediaId: { type: "string", example: "media789" },
          url: { type: "string", example: "https://example.com/uploads/image.jpg" },
          type: { type: "string", example: "image/jpeg" },
          uploadedBy: { type: "string", example: "64a0f2c7ae3c8b39f9d4d3e1" },
        },
      },
      LostFoundItemInput: {
        type: "object",
        properties: {
          title: { type: "string", example: "هاتف مفقود" },
          description: { type: "string", example: "هاتف آيفون أسود خلف المسجد" },
          locationFound: { type: "string", example: "جدة، شارع الأمير سلطان" },
        },
      },
      LostFoundItem: {
        type: "object",
        properties: {
          itemId: { type: "string", example: "lost192021" },
          title: { type: "string", example: "هاتف مفقود" },
          description: { type: "string", example: "هاتف آيفون أسود خلف المسجد" },
          locationFound: { type: "string", example: "جدة، شارع الأمير سلطان" },
          status: { type: "string", example: "available" },
          postedBy: { type: "string", example: "64a0f2c7ae3c8b39f9d4d3e1" },
        },
      },
      TopUpInput: {
        type: "object",
        properties: {
          amount: { type: "number", example: 100.0 },
          paymentMethod: { type: "string", example: "credit_card" },
        },
      },
      WalletTransaction: {
        type: "object",
        properties: {
          transactionId: { type: "string", example: "tx131415" },
          type: { type: "string", example: "topup" },
          amount: { type: "number", example: 100.0 },
          balanceAfter: { type: "number", example: 500.0 },
          createdAt: { type: "string", format: "date-time", example: "2025-06-15T08:00:00Z" },
        },
      },
      CategoryInput: {
        type: "object",
        properties: {
          name: { type: "string", example: "إلكترونيات" },
        },
      },
      Category: {
        type: "object",
        properties: {
          categoryId: { type: "string", example: "cat123" },
          name: { type: "string", example: "إلكترونيات" },
          createdBy: { type: "string", example: "64a0f2c7ae3c8b39f9d4d3e1" },
        },
      },
      SliderInput: {
        type: "object",
        properties: {
          imageUrl: { type: "string", example: "https://example.com/slider1.jpg" },
          link: { type: "string", example: "https://example.com" },
        },
      },
      Slider: {
        type: "object",
        properties: {
          sliderId: { type: "string", example: "slider456" },
          imageUrl: { type: "string", example: "https://example.com/slider1.jpg" },
          link: { type: "string", example: "https://example.com" },
          createdBy: { type: "string", example: "64a0f2c7ae3c8b39f9d4d3e1" },
        },
      },
      FreelancerInput: {
        type: "object",
        properties: {
          name: { type: "string", example: "John Doe" },
          skills: {
            type: "array",
            items: { type: "string", example: "design" },
          },
          hourlyRate: { type: "number", example: 100 },
        },
      },
      Freelancer: {
        type: "object",
        properties: {
          freelancerId: { type: "string", example: "free789" },
          name: { type: "string", example: "John Doe" },
          skills: {
            type: "array",
            items: { type: "string", example: "design" },
          },
          hourlyRate: { type: "number", example: 100 },
          registeredBy: { type: "string", example: "64a0f2c7ae3c8b39f9d4d3e1" },
        },
      },
      BookingInput: {
        type: "object",
        properties: {
          date: { type: "string", format: "date-time", example: "2025-07-01T10:00:00Z" },
          freelancerId: { type: "string", example: "free789" },
          description: { type: "string", example: "تصميم شعار" },
        },
      },
      Booking: {
        type: "object",
        properties: {
          bookingId: { type: "string", example: "booking456" },
          date: { type: "string", format: "date-time", example: "2025-07-01T10:00:00Z" },
          freelancerId: { type: "string", example: "free789" },
          status: { type: "string", example: "pending" },
          createdBy: { type: "string", example: "64a0f2c7ae3c8b39f9d4d3e1" },
        },
      },
      ReviewInput: {
        type: "object",
        properties: {
          bookingId: { type: "string", example: "booking456" },
          rating: { type: "integer", example: 5 },
          comment: { type: "string", example: "عمل احترافي" },
        },
      },
      Review: {
        type: "object",
        properties: {
          reviewId: { type: "string", example: "review101112" },
          bookingId: { type: "string", example: "booking456" },
          rating: { type: "integer", example: 5 },
          comment: { type: "string", example: "عمل احترافي" },
          reviewedBy: { type: "string", example: "64a0f2c7ae3c8b39f9d4d3e1" },
        },
      },
      DeliveryCategory: {
        type: "object",
        properties: {
          id: { type: "string", example: "cat123" },
          name: { type: "string", example: "طعام" },
          description: { type: "string", example: "فئات المطاعم والمأكولات" },
        },
      },
      DeliveryStore: {
        type: "object",
        properties: {
          id: { type: "string", example: "store456" },
          name: { type: "string", example: "مطعم البيتزا السريع" },
          categoryId: { type: "string", example: "cat123" },
          location: { type: "string", example: "الرياض، حي العليا" },
        },
      },
      DeliveryOrderInput: {
        type: "object",
        properties: {
          storeId: { type: "string", example: "store456" },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                productId: { type: "string", example: "prod789" },
                quantity: { type: "integer", example: 2 },
              },
            },
          },
          address: { type: "string", example: "شارع التحلية، الرياض" },
          paymentMethod: { type: "string", example: "wallet" },
        },
      },
      DeliveryOrder: {
        type: "object",
        properties: {
          orderId: { type: "string", example: "order101112" },
          storeId: { type: "string", example: "store456" },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                productId: { type: "string", example: "prod789" },
                quantity: { type: "integer", example: 2 },
                price: { type: "number", example: 45.0 },
              },
            },
          },
          totalAmount: { type: "number", example: 90.0 },
          status: { type: "string", example: "pending" },
          createdBy: { type: "string", example: "64a0f2c7ae3c8b39f9d4d3e1" },
        },
      },
      AdminWithdrawalInput: {
        type: "object",
        properties: {
          adminId: { type: "string", example: "admin313233" },
          amount: { type: "number", example: 500.0 },
          reason: { type: "string", example: "تسويق" },
        },
      },
      AdminWithdrawal: {
        type: "object",
        properties: {
          withdrawalId: { type: "string", example: "wd131415" },
          adminId: { type: "string", example: "admin313233" },
          amount: { type: "number", example: 500.0 },
          status: { type: "string", example: "approved" },
          createdAt: { type: "string", format: "date-time", example: "2025-06-01T09:00:00Z" },
        },
      },
      DriverWithdrawalInput: {
        type: "object",
        properties: {
          driverId: { type: "string", example: "driver123" },
          amount: { type: "number", example: 300.0 },
          reason: { type: "string", example: "راتب" },
        },
      },
      DriverWithdrawal: {
        type: "object",
        properties: {
          withdrawalId: { type: "string", example: "wd161718" },
          driverId: { type: "string", example: "driver123" },
          amount: { type: "number", example: 300.0 },
          status: { type: "string", example: "pending" },
          createdAt: { type: "string", format: "date-time", example: "2025-06-05T11:00:00Z" },
        },
      },
      FavoriteItem: {
        type: "object",
        properties: {
          itemId: { type: "string", example: "item373839" },
          userId: { type: "string", example: "64a0f2c7ae3c8b39f9d4d3e1" },
          itemType: { type: "string", example: "store" },
          itemRefId: { type: "string", example: "store456" },
        },
      },
      OpportunityInput: {
        type: "object",
        properties: {
          title: { type: "string", example: "مطور ويب" },
          description: { type: "string", example: "مطلوب مطور Node.js بخبرة 2 سنوات" },
          budget: { type: "integer", example: 1500 },
        },
      },
      Opportunity: {
        type: "object",
        properties: {
          opportunityId: { type: "string", example: "opp192021" },
          title: { type: "string", example: "مطور ويب" },
          description: { type: "string", example: "مطلوب مطور Node.js بخبرة 2 سنوات" },
          budget: { type: "integer", example: 1500 },
          postedBy: { type: "string", example: "64a0f2c7ae3c8b39f9d4d3e1" },
        },
      },
      AbsherRequestInput: { type: "object", properties: { serviceType: { type: "string", example: "تجديد رخصة" }, details: { type: "string", example: "تفاصيل الطلب" }, appointmentDate: { type: "string", example: "2025-07-10" } } },
      AbsherRequest: {
        type: "object",
        properties: {
          requestId: { type: "string", example: "absher343536" },
          serviceType: { type: "string", example: "تجديد رخصة" },
          status: { type: "string", example: "pending" },
          createdBy: { type: "string", example: "64a0f2c7ae3c8b39f9d4d3e1" },
        },
      },
      OtpPayload: {
        type: "object",
        properties: {
          phoneNumber: { type: "string", example: "+966551234567" },
          otpCode: { type: "string", example: "123456" },
        },
      },
    },
  },
};

(async () => {
  await swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFiles, doc);
  console.log("✅ تم توليد swagger-output.json في:", outputFile);
})();
