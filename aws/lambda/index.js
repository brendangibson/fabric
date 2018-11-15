/*
* Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
* 
* Permission is hereby granted, free of charge, to any person obtaining a copy of this
* software and associated documentation files (the "Software"), to deal in the Software
* without restriction, including without limitation the rights to use, copy, modify,
* merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
* permit persons to whom the Software is furnished to do so.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
* INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
* PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
* HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
* OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
* SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

const mysql = require('mysql');

const connection = mysql.createConnection({
  host     : process.env.ENDPOINT,
  user     : process.env.USERNAME,
  password : process.env.PASSWORD
});

let dbInit = false;

async function conditionallyCreateDB(connection) {
  await executeSQL(connection, 'CREATE DATABASE IF NOT EXISTS ' + process.env.DBNAME);
  return new Promise((resolve,reject) => {
    connection.changeUser({ database: process.env.DBNAME }, (err, data) => {
      if (err) {
        return reject(err)
      }
      return resolve(data)
    } )
  })
}

function conditionallyCreateCommentsTable(connection) {
  const createTableSQL = `CREATE TABLE IF NOT EXISTS comments (
    id        VARCHAR(64) NOT NULL,
    author    VARCHAR(128) NOT NULL,
    postId    VARCHAR(64) NOT NULL,
    content   VARCHAR(255) NOT NULL,
    upvotes   INT NOT NULL,
    downvotes INT NOT NULL,
    PRIMARY KEY(id),
    FOREIGN KEY(postId) REFERENCES posts(id))`;
  return executeSQL(connection, createTableSQL);
}

function conditionallyCreatePostsTable(connection) {
  const createTableSQL = `CREATE TABLE IF NOT EXISTS posts (
    id        VARCHAR(64) NOT NULL,
    author    VARCHAR(64) NOT NULL,
    content   VARCHAR(2048) NOT NULL,
    views     INT NOT NULL,
    PRIMARY KEY(id))`;
  return executeSQL(connection, createTableSQL);
}

function conditionallyCreateColoursTable(connection) {
  const createTableSQL = `CREATE TABLE IF NOT EXISTS colours (
    id        VARCHAR(64) NOT NULL,
    name      VARCHAR(64) NOT NULL,
    PRIMARY KEY(id))`;
  return executeSQL(connection, createTableSQL);
}

function conditionallyCreateStylesTable(connection) {
  const createTableSQL = `CREATE TABLE IF NOT EXISTS styles (
    id        VARCHAR(64) NOT NULL,
    name      VARCHAR(64) NOT NULL,
    weight    FLOAT,
    thickness FLOAT,
    patternWidth FLOAT,
    patternHeight FLOAT,
    PRIMARY KEY(id))`;
  return executeSQL(connection, createTableSQL);
}

function conditionallyCreateStylesColoursTable(connection) {
  const createTableSQL = `CREATE TABLE IF NOT EXISTS stylesColours (
    id        VARCHAR(64) NOT NULL,
    colourId  VARCHAR(64) NOT NULL,
    styleId   VARCHAR(64) NOT NULL,
    swatchUrl VARCHAR(256),
    PRIMARY KEY(id),
    FOREIGN KEY(colourId) REFERENCES colours(id),
    FOREIGN KEY(styleId) REFERENCES styles(id))`;
  return executeSQL(connection, createTableSQL);
}


function alterStylesColoursTable(connection) {
  const createTableSQL = `ALTER TABLE stylesColours ADD COLUMN swatchUrl VARCHAR(256)`;
  return executeSQL(connection, createTableSQL);
}

function conditionallyCreateRollsTable(connection) {
  const createTableSQL = `CREATE TABLE IF NOT EXISTS rolls (
    id              VARCHAR(64) NOT NULL,
    originalLength  FLOAT,
    colourStyleId   VARCHAR(64) NOT NULL,
    glenRavenId     VARCHAR(64),
    locationId      VARCHAR(64),
    PRIMARY KEY(id),
    FOREIGN KEY(colourStyleId) REFERENCES stylesColours(id),
    FOREIGN KEY(locationId) REFERENCES locations(id))`;
  return executeSQL(connection, createTableSQL);
}

function conditionallyCreateDefectsTable(connection) {
  const createTableSQL = `CREATE TABLE IF NOT EXISTS defects (
    id              VARCHAR(64) NOT NULL,
    code            VARCHAR(2) NOT NULL,
    name            VARCHAR(64) NOT NULL,
    description     VARCHAR(1024),
    PRIMARY KEY(id))`;
  return executeSQL(connection, createTableSQL);
}

function conditionallyCreateRollsDefectsTable(connection) {
  const createTableSQL = `CREATE TABLE IF NOT EXISTS rollsDefects (
    id              VARCHAR(64) NOT NULL,
    rollId          VARCHAR(64) NOT NULL,
    defectId        VARCHAR(64) NOT NULL,
    position        FLOAT NOT NULL,
    PRIMARY KEY(id),
    FOREIGN KEY(rollId) REFERENCES rolls(id),
    FOREIGN KEY(defectId) REFERENCES defects(id))`;
  return executeSQL(connection, createTableSQL);
}

function conditionallyCreateShipmentsTable(connection) {
  const createTableSQL = `CREATE TABLE IF NOT EXISTS shipments (
    id              VARCHAR(64) NOT NULL,
    dateSent        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dateReceived    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    glenRavenId     VARCHAR(64),
    PRIMARY KEY(id))`;
  return executeSQL(connection, createTableSQL);
}

function conditionallyCreateShipmentsRollsTable(connection) {
  const createTableSQL = `CREATE TABLE IF NOT EXISTS shipmentsRolls (
    id              VARCHAR(64) NOT NULL,
    shipmentId      VARCHAR(64) NOT NULL,
    rollId    VARCHAR(64) NOT NULL,
    PRIMARY KEY(id),
    FOREIGN KEY(shipmentId) REFERENCES shipments(id)
    FOREIGN KEY(rollId) REFERENCES rolls(id))`;
  return executeSQL(connection, createTableSQL);
}

function conditionallyCreateCutsTable(connection) {
  const createTableSQL = `CREATE TABLE IF NOT EXISTS cuts (
    id             VARCHAR(64) NOT NULL,
    rollId         VARCHAR(64) NOT NULL,
    length         FLOAT NOT NULL,
    reason         ENUM('shopifyOrder', 'otherOrder', 'defect', 'waste', 'personal', 'product'),
    notes          VARCHAR(1024),
    orderId VARCHAR(64),
    PRIMARY KEY(id),
    FOREIGN KEY(rollId) REFERENCES rolls(id))`;
  return executeSQL(connection, createTableSQL);
}

function conditionallyCreateLocationsTable(connection) {
  const createTableSQL = `CREATE TABLE IF NOT EXISTS locations (
    id             VARCHAR(64) NOT NULL,
    name           VARCHAR(64) NOT NULL,
    PRIMARY KEY(id))`;
  return executeSQL(connection, createTableSQL);
}

function alterStylesTable(connection) {
  const createTableSQL = `ALTER TABLE styles DROP swatchUrl`;
  return executeSQL(connection, createTableSQL);
}

function executeSQL(connection, sql) {
  console.log('Executing SQL:', sql);
  return new Promise((resolve,reject) => {
    connection.query(sql, (err, data) => {
      if (err) {
        return reject(err)
      }
      return resolve(data)
    } )
  })
}

function populateAndSanitizeSQL(sql, variableMapping, connection) {
  Object.entries(variableMapping).forEach(([key, value]) => {
    const escapedValue = connection.escape(value);
    sql = sql.replace(key, escapedValue);
  });

  return sql;
}

exports.handler = async (event) => {
  console.log('Received event', JSON.stringify(event, null, 3));

  if (!dbInit) {
    await conditionallyCreateDB(connection);
    await conditionallyCreatePostsTable(connection);
    await conditionallyCreateCommentsTable(connection);
    await conditionallyCreateColoursTable(connection);
    await conditionallyCreateStylesTable(connection);
    await conditionallyCreateStylesColoursTable(connection);
    // await alterStylesTable(connection);
    // await alterStylesColoursTable(connection);
    // await conditionallyCreateRollsTable(connection);
    await conditionallyCreateDefectsTable(connection);
    // await conditionallyCreateRollsDefectsTable(connection);
    // await conditionallyCreateShipmentsTable(connection);
    // await conditionallyCreateShipmentsRollsTable(connection);
    // await conditionallyCreateCutsTable(connection);
    // await conditionallyCreateLocationsTable(connection);
    dbInit = true;
  }

  const inputSQL = populateAndSanitizeSQL(event.sql, event.variableMapping || {}, connection);
  let result = await executeSQL(connection, inputSQL);

  if (event.responseSQL) {
    const responseSQL =
      populateAndSanitizeSQL(event.responseSQL, event.variableMapping, connection);
    result = await executeSQL(connection, responseSQL);
  }
  console.log(JSON.stringify(result, null, 3));
  return result;
};
