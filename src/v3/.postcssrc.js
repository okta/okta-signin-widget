const postcssLogical = require('postcss-logical');
const { default: postcssOdyssey } = require("@okta/odyssey-postcss-preset");

module.exports = (ctx) => {
  if (!ctx.odyssey) {
    return {
      plugins: [
        postcssLogical({
          // https://github.com/csstools/postcss-logical#options
          preserve: true,
        }),
      ],
    };
  }

  const options = Object.assign(
    ctx.odyssey,
    ctx.env === "production" ? {
      logical: {
        dir: "ltr",
        preserve: false,
      },
      autoprefixer: {
        grid: "autoplace",
        env: "production",
      },
    } : {
      modules: {
        ...ctx.odyssey.modules,
        generateScopedName: "[name]__[local]___[hash:base62:6]"
      }
    }
  );

  return {
    plugins: [postcssOdyssey(options)],
  };
};