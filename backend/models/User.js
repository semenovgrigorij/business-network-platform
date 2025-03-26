// models/User.js
const mongoose = require("mongoose");

// Схема настроек приватности
const privacySettingsSchema = new mongoose.Schema(
  {
    showEmail: {
      type: Boolean,
      default: true,
    },
    showPhone: {
      type: Boolean,
      default: true,
    },
    showSocial: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

// Схема опыта работы
const experienceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    location: {
      type: String,
    },
    from: {
      type: String,
      required: true,
    },
    to: {
      type: String,
    },
    current: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

// Основная схема пользователя
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: "/images/placeholders/user-avatar.jpg",
  },
  location: {
    type: String,
    trim: true,
  },
  bio: {
    type: String,
  },
  jobTitle: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  skills: [String],
  linkedinUrl: {
    type: String,
    trim: true,
  },
  facebookUrl: {
    type: String,
    trim: true,
  },
  experience: [experienceSchema],
  privacySettings: {
    type: privacySettingsSchema,
    default: () => ({}),
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Преобразования перед JSON-сериализацией
userSchema.set("toJSON", {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpires;
    return ret;
  },
});

module.exports = mongoose.model("User", userSchema);
