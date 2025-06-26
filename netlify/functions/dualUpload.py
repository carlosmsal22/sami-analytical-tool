# .netlify/functions/dualUpload.py
import json
import tempfile
import os
import pyreadstat
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/.netlify/functions/dualUpload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    filename = file.filename.lower()

    try:
        with tempfile.TemporaryDirectory() as tmpdir:
            filepath = os.path.join(tmpdir, file.filename)
            file.save(filepath)

            if filename.endswith('.sav'):
                df, meta = pyreadstat.read_sav(filepath)
            elif filename.endswith('.csv'):
                import pandas as pd
                df = pd.read_csv(filepath)
            elif filename.endswith('.xlsx'):
                import pandas as pd
                df = pd.read_excel(filepath)
            else:
                return jsonify({"error": "Unsupported file type"}), 400

            summary = {
                "rows": len(df),
                "columns": len(df.columns),
                "columns_info": []
            }

            for col in df.columns:
                col_info = {
                    "name": col,
                    "dtype": str(df[col].dtype),
                    "missing": int(df[col].isnull().sum()),
                    "unique": int(df[col].nunique())
                }
                summary["columns_info"].append(col_info)

            return jsonify(summary)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Needed for Netlify Python Function compatibility
def handler(event, context):
    from werkzeug.datastructures import FileStorage
    from werkzeug.wrappers import Request
    
    request = Request(event['rawBody'])
    return upload()
