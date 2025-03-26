module.exports = {
  devServer: {
    proxy: {
      "^/api": {
        target: "http://localhost:5000", // Изменить на 5000
        changeOrigin: true,
      },
    },
  },
};
