// backend/routes/users.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");
const Business = require("../models/Business");

// @route   GET api/users/:id
// @desc    Получить пользователя по ID
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-password -passwordResetToken -passwordResetExpires"
    );

    if (!user) {
      return res.status(404).json({ message: "Користувач не знайдений" });
    }

    // Проверяем настройки приватности пользователя
    const userResponse = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      location: user.location,
      bio: user.bio,
      jobTitle: user.jobTitle,
      skills: user.skills,
      experience: user.experience,
    };

    // Добавляем дополнительные поля в соответствии с настройками приватности
    if (!user.privacySettings || user.privacySettings.showEmail) {
      userResponse.email = user.email;
    }

    if (!user.privacySettings || user.privacySettings.showPhone) {
      userResponse.phone = user.phone;
    }

    if (!user.privacySettings || user.privacySettings.showSocial) {
      userResponse.linkedinUrl = user.linkedinUrl;
      userResponse.facebookUrl = user.facebookUrl;
    }

    res.json(userResponse);
  } catch (error) {
    console.error("Error fetching user:", error);
    res
      .status(500)
      .json({ message: "Помилка сервера при отриманні даних користувача" });
  }
});

// @route   GET api/users/:id/businesses
// @desc    Получить бизнесы, принадлежащие пользователю
// @access  Public
router.get("/:id/businesses", async (req, res) => {
  try {
    const businesses = await Business.find({ ownerId: req.params.id })
      .populate("categories", "name")
      .sort({ createdAt: -1 });

    res.json(businesses);
  } catch (error) {
    console.error("Error fetching user businesses:", error);
    res
      .status(500)
      .json({ message: "Помилка сервера при отриманні бізнесів користувача" });
  }
});

// @route   PUT api/users/profile
// @desc    Обновить профиль текущего пользователя
// @access  Private
router.put("/profile", auth, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      jobTitle,
      bio,
      location,
      phone,
      avatar,
      skills,
      linkedinUrl,
      facebookUrl,
      privacySettings,
    } = req.body;

    // Создаем объект с обновляемыми полями
    const userFields = {};

    if (firstName) userFields.firstName = firstName;
    if (lastName) userFields.lastName = lastName;
    if (jobTitle) userFields.jobTitle = jobTitle;
    if (bio) userFields.bio = bio;
    if (location) userFields.location = location;
    if (phone) userFields.phone = phone;
    if (avatar) userFields.avatar = avatar;
    if (skills) userFields.skills = skills;
    if (linkedinUrl) userFields.linkedinUrl = linkedinUrl;
    if (facebookUrl) userFields.facebookUrl = facebookUrl;
    if (privacySettings) userFields.privacySettings = privacySettings;

    // Обновляем пользователя
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: userFields },
      { new: true }
    ).select("-password -passwordResetToken -passwordResetExpires");

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Помилка сервера при оновленні профілю" });
  }
});

module.exports = router;
