if (process.env.CI || process.browser) {
  import("./object-create.js");
  import("./property-access.js");
}
