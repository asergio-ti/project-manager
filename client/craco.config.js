const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Remove a restrição de importar arquivos fora do src
      webpackConfig.resolve.plugins = webpackConfig.resolve.plugins.filter(
        (plugin) => plugin.constructor.name !== 'ModuleScopePlugin'
      );

      // Configura os aliases
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        '@': path.resolve(__dirname, 'src'),
        '@managed-projects': path.resolve(__dirname, '../managed-projects'),
        '@schemas': path.resolve(__dirname, '../schemas'),
        '@scripts': path.resolve(__dirname, '../scripts')
      };

      return webpackConfig;
    }
  },
  style: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  }
}; 