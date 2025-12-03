import { Request, Response } from "express";
import * as mysql from "mysql2/promise";
import keys from "../keys";
class SearchController {
  async SearchDocumentTable(req, res) {
    const connection = await mysql.createConnection(keys.database);

    try {
      const { documentTypeId, search, userId } = req.body;

      if (!documentTypeId || !search) {
        return res.status(400).send("Required parameters not provided");
      }

      // Retrieve the dataTableId associated with the documentTypeId
      const [dataTableIdRows] = await connection.execute(
        "SELECT documentTypeTableId FROM DocumentType WHERE documentTypeId = ?",
        [documentTypeId]
      );
      //@ts-ignore
      if (dataTableIdRows.length === 0) {
        return res
          .status(404)
          .json({ status: false, message: "Document type not found" });
      }

      const dataTableId = dataTableIdRows[0].documentTypeTableId;

      // Retrieve the dataTableName and fields from DataTables based on dataTableId
      const [dataTableRows] = await connection.execute(
        "SELECT tableName, fields FROM DataTables WHERE tableId = ?",
        [dataTableId]
      );
      //@ts-ignore
      if (dataTableRows.length === 0) {
        return res
          .status(404)
          .json({ status: false, message: "DataTable not found" });
      }

      const tableName = dataTableRows[0].tableName;
      const fields = JSON.parse(dataTableRows[0].fields);

      const conditions = Object.entries(search).map(([field, value]) => {
        const fieldDefinition = fields.find((f) => f.name === field);
        if (!fieldDefinition) {
          return null;
        }

        const expression = fieldDefinition.expression;
        switch (expression) {
          case "equal":
            return `${field} = ${value}`;
          case "like":
            return `${field} LIKE '%${value}%'`;
          case "greater":
            return `${field} >= ${value}`;
          case "lesser":
            return `${field} <= ${value}`;
          default:
            return null;
        }
      });

      const validConditions = conditions.filter(
        (condition) => condition !== null
      );

      let query = "";
      if (validConditions.length > 0) {
        query = `SELECT * FROM ${tableName} T WHERE ${validConditions.join(
          " AND "
        )} AND Id NOT IN (SELECT taskTagId FROM Tasks WHERE taskTagId = T.Id AND userId = ${userId})`;
      } else {
        query = `SELECT * FROM ${tableName} T WHERE Id NOT IN (SELECT taskTagId FROM Tasks WHERE taskTagId = T.Id AND userId = ${userId})`;
      }
      const [dataRows] = await connection.execute(query);

      res.json({
        status: true,
        message: `Search results for ${tableName}`,
        data: dataRows,
        fields: fields,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: false, message: "Internal server error" });
    } finally {
      // Close the connection
      await connection.end();
    }
  }
}

export const searchController: SearchController = new SearchController();
