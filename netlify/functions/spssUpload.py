
import pyreadstat
import json

def handler(event, context):
    try:
        # The uploaded file is typically saved temporarily; here we assume its path
        uploaded_file_path = "/tmp/uploaded.sav"

        # Read the SPSS .sav file
        df, meta = pyreadstat.read_sav(uploaded_file_path)

        # Basic summary
        summary = {
            "num_rows": len(df),
            "num_columns": len(df.columns),
            "columns": list(df.columns),
            "column_types": df.dtypes.apply(lambda x: str(x)).to_dict(),
            "label_set": meta.column_labels,
            "missing": df.isnull().sum().to_dict()
        }

        return {
            "statusCode": 200,
            "body": json.dumps(summary),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({ "error": str(e) }),
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        }
