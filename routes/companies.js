"use strict";

const db = require("../db");
const express = require("express");
const { BadRequestError, NotFoundError } = require("../expressError");

const router = new express.Router();


/** Returns list of companies, like {companies: [{code, name}, ...]} */

router.get("/", async function (req, res) {
  const results = await db.query(
    `SELECT code, name
         FROM companies`);
  const companies = results.rows;

  return res.json({ companies });

});


/**Return obj of company: {company: {code, name, description}}*/

router.get("/:code", async function (req, res) {
  const code = req.params.code;

  const results = await db.query(
    `SELECT code, name, description
         FROM companies
         WHERE code = $1`, [code]);
  const company = results.rows[0];

  if (!company) {
    console.log("in if statement");
    throw new Error();
    // return res.status(404).json({err:"No such company code."})
  }

  return res.json({ company });

});


/** Adds a company.
 * Needs to be given JSON like: {code, name, description}
  Returns obj of new company: {company: {code, name, description}}*/

router.post("/", async function (req, res) {
  const { code, name, description } = req.body;

  if (!code || !name || !description) {
    throw new BadRequestError();
  }

  const result = await db.query(
    `INSERT INTO companies (code, name, description)
    VALUES ($1, $2, $3)
    RETURNING code, name, description`, [code, name, description]
  );

  const company = result.rows[0];
  return res.status(201).json({ company });

});


// PUT /companies/[code]
/**Edit existing company.
Needs to be given JSON like: {name, description}
Returns update company object: {company: {code, name, description}} */

router.put("/:code", async function (req, res) {
  const { name, description } = req.body;

  const result = await db.query(
    `UPDATE companies
           SET name=$1,
               description=$2
           WHERE code = $3
           RETURNING code, name, description`,
    [name, description, req.params.code],
  );

  const company = result.rows[0];

  if (!company) {
    throw new NotFoundError("No such company code.");
    // return res.status(404).json({err:"No such company code."})
  };

  return res.json({ company });

});


// DELETE /companies/[code]
/** Deletes company.
// Should return 404 if company cannot be found.
// Returns {status: "deleted"}
 */

// router.delete("/:code", async function (req, res) {

// });







module.exports = router;