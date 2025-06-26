# analyze_sav.py
import sys
import json
import pyreadstat

file_path = sys.argv[1]

try:
    df, meta = pyreadstat.read_sav(file_path)
    summary = {
        "columns": list(df.columns),
        "n_rows": len(df),
        "n_cols": len(df.columns),
        "variable_types": meta.column_types,
    }
    print(json.dumps(summary))
except Exception as e:
    print(json.dumps({"error": str(e)}))
