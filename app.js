/** BizTime express application. */

const express = require("express");
const { NotFoundError } = require("./expressError");
const companiesRoutes = require("./routes/companies");
const invoiceRoutes = require("./routes/invoices");

const app = express();

app.use(express.json());
app.use("/companies", companiesRoutes);
app.use("/invoices", invoiceRoutes);


/** 404 handler: matches unmatched routes; raises NotFoundError. */
app.use(function (req, res, next) {
  throw new NotFoundError();
});

/** Error handler: logs stacktrace and returns JSON error message. */
app.use(function (err, req, res, next) {
  console.log("global error handler")
  const status = err.status || 500;
  const message = err.message;
  console.log("status..message",status,message)
  if (process.env.NODE_ENV !== "test") console.error(status, err.stack);
  return res.status(status).json({ error: { message, status } });
});



module.exports = app;

