import json
import os

def handler(event, context):
    try:
        # Step 1: Save the incoming base64-encoded file to /tmp
        import base64
        body = json.loads(event["body"])
        file_content = base64.b64decode(body["file"].split(",")[-1])
        file_path = "/tmp/uploaded.sav"

        with open(file_path, "wb") as f:
            f.write(file_content)

        # Step 2: Use pyreadstat to read the SAV file
        df, meta = pyreadstat.read_sav(file_path)

        # Step 3: Generate a basic summary (you can expand this)
        summary = {
            "num_rows": df.shape[0],
            "num_columns": df.shape[1],
            "column_names": df.columns.tolist(),
            "column_types": {col: str(dtype) for col, dtype in df.dtypes.items()},
        }

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"summary": summary})
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
