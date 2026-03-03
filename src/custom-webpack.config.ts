import HtmlWebpackPlugin from 'html-webpack-plugin';
import CompressionPlugin from 'compression-webpack-plugin';

module.exports = {
  externals: {
    '@angularclass/hmr': '@angularclass/hmr', // Exclude @angularclass/hmr from the bundle
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      inject: 'body',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
      },
    }),
    new CompressionPlugin({
      algorithm: 'brotliCompress',
      filename: '[path][base].br',
      test: /\.(js|css|html|svg)$/, // Ensure it targets HTML files
      threshold: 0, // Set to 0 to ensure even small files are compressed
      minRatio: 0.8,
    }),
  ],
};
