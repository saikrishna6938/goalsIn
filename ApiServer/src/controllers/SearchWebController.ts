import { Request, Response } from "express";
import * as mysql from "mysql2/promise";
import keys from "../keys";
class SearchWebController {
  async SearchDocumentTable(req: Request, res: Response) {
    const connection = await mysql.createConnection(keys.database);

    try {
      const { dataTableId, search } = req.body;

      if (!dataTableId || !search) {
        return res.status(400).send("Required parameters not provided");
      }

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
        if (
          !fieldDefinition ||
          value === null ||
          value === undefined ||
          value === ""
        ) {
          return null;
        }

        const expression = fieldDefinition.expression;
        switch (expression) {
          case "equal":
            return `${field} = ${mysql.escape(value)}`;
          case "like":
            return `${field} LIKE '%${mysql.escape(value).slice(1, -1)}%'`;
          case "greater":
            return `${field} >= ${mysql.escape(value)}`;
          case "lesser":
            return `${field} <= ${mysql.escape(value)}`;
          default:
            return null;
        }
      });

      const validConditions = conditions.filter(
        (condition) => condition !== null
      );

      let query = `SELECT * FROM ${tableName}`;
      if (validConditions.length > 0) {
        query += ` WHERE ${validConditions.join(" AND ")}`;
      }
      query += " LIMIT 20";
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

export const searchWebController: SearchWebController =
  new SearchWebController();
