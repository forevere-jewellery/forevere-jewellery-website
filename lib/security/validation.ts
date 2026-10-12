import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Invalid email address format.')
    .max(255, 'Email must not exceed 255 characters.'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters.')
    .max(128, 'Password must not exceed 128 characters.'),
});

export const signupSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Invalid email address format.')
    .max(255, 'Email must not exceed 255 characters.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long.')
    .max(128, 'Password must not exceed 128 characters.')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
    .regex(/[0-9]/, 'Password must contain at least one number.')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character.'),
  fullName: z
    .string()
    .trim()
    .max(100, 'Full name cannot exceed 100 characters.')
    .optional(),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{10,18}$/, 'Invalid phone number format.')
    .optional(),
});

export const otpSendSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{10,18}$/, 'Please enter a valid phone number with country code.'),
});

export const otpVerifySchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{10,18}$/, 'Invalid phone number.'),
  otp: z
    .string()
    .trim()
    .length(6, 'Verification code must be 6 digits.')
    .regex(/^[0-9]{6}$/, 'Verification code must contain digits only.'),
});

export const couponValidateSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, 'Coupon code is too short.')
    .max(32, 'Coupon code is too long.')
    .regex(/^[A-Za-z0-9_-]+$/, 'Invalid coupon code characters.'),
  orderAmount: z
    .number()
    .nonnegative('Order amount must be a positive number.')
    .optional(),
});

export const chatbotMessageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, 'Message cannot be empty.')
    .max(500, 'Message cannot exceed 500 characters.'),
});

export const checkoutOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid().or(z.string().min(1)),
        quantity: z.number().int().positive().max(50),
      })
    )
    .min(1, 'Cart must contain at least one item.'),
  couponCode: z.string().trim().max(32).optional(),
  shippingAddressId: z.string().optional(),
  shippingAddress: z
    .object({
      fullName: z.string().trim().min(1).max(100),
      phone: z.string().trim().min(10).max(20),
      line1: z.string().trim().min(1).max(200),
      line2: z.string().trim().max(200).optional(),
      city: z.string().trim().min(1).max(100),
      state: z.string().trim().min(1).max(100),
      pincode: z.string().trim().min(4).max(12),
    })
    .optional(),
  paymentMethod: z.string().trim().min(1).max(100),
  isGift: z.boolean().optional(),
  giftMessage: z.string().trim().max(300).optional(),
});
