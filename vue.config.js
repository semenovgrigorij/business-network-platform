module.exports = {
  configureWebpack: {
    performance: {
      hints: false, // Отключить предупреждения о размере
    },
  },
  chainWebpack: (config) => {
    config.performance.maxEntrypointSize(512000).maxAssetSize(512000);
  },
  devServer: {
    proxy: {
      "^/api": {
        target: "http://localhost:5000", // Изменить на 5000
        changeOrigin: true,
      },
    },
  },
};
