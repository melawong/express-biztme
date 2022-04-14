const db = require("../db");
const express = require("express");
const { BadRequestError, NotFoundError } = require("../expressError");

const router = new express.Router();



/**Return info on invoices: like {invoices: [{id, comp_code}, ...]} */
router.get("/", async function (req, res) {
  const results = await db.query(
    `SELECT id, comp_code
          FROM invoices`);
  const invoices = results.rows;

  return res.json({ invoices });
});


/**Returns obj on given invoice. If invoice cannot be found, returns 404.
  Returns {invoice: {id, amt, paid, add_date, paid_date,
  company: {code, name, description}}*/
router.get("/:id", async function (req, res) {
  const id = req.params.id;

  const invoiceResults = await db.query(
    `SELECT id, amt, paid, add_date, paid_date
         FROM invoices
         WHERE id = $1`, [id]);
  const invoice = invoiceResults.rows[0];

  const companyResults = await db.query(
    `SELECT code, name, description
         FROM invoices
         JOIN companies AS c ON invoices.comp_code = c.code
         WHERE id = $1`, [id]);
  const company = companyResults.rows[0];

  invoice.company = { company };

  if (!invoice) {
    throw new NotFoundError("Invoice not found");
  }

  return res.json({ invoice });

});


/**Adds an invoice.
Needs to be passed in JSON body of: {comp_code, amt}
Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}*/
router.post("/", async function (req, res) {
  const { comp_code, amt } = req.body;

  if (!comp_code || !amt) {
    throw new BadRequestError("Please enter valid params");
  }

  const result = await db.query(
    `INSERT INTO invoices (comp_code, amt)
    VALUES ($1, $2)
    RETURNING comp_code, amt`, [comp_code, amt]
  );

  const invoice = result.rows[0];
  return res.status(201).json({ invoice });

});


/** Updates an invoice.
If invoice cannot be found, returns a 404.
Needs to be passed in a JSON body of {amt}
Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}} */
router.put("/:id", async function (req, res) {
  const { amt } = req.body;

  const result = await db.query(
    `UPDATE invoices
           SET amt=$1
           WHERE id = $2
           RETURNING id, comp_code, amt, paid, add_date, paid_date`,
    [amt, req.params.id],
  );

  const invoice = result.rows[0];

  if (!invoice) {
    throw new NotFoundError("No such invoice id.");
  };

  return res.json({ invoice });

});


/** Deletes an invoice.
 Returns: {status: "deleted"}
 If invoice cannot be found, returns a 404.
Also, one route from the previous part should be updated. */
router.delete("/:id", async function (req, res) {
  const id = req.params.id;
  if (!id) {
    throw new NotFoundError("No such invoice id");
  }

  await db.query(
    "DELETE FROM invoices WHERE id = $1",
    [id],
  );
  return res.json({ status: "deleted" });
});



module.exports = router;