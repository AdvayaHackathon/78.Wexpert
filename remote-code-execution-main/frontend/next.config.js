
const withTM = require('next-transpile-modules')([
  'antd',
  '@ant-design/icons',
  '@ant-design/icons-svg',
  'rc-util',
  'rc-pagination',
  'rc-picker',
  'rc-dialog',
  'rc-field-form',
  'rc-tabs',
]);

/** @type {import('next').NextConfig} */
const nextConfig = withTM({
  reactStrictMode: true,
  
});

module.exports = nextConfig;
